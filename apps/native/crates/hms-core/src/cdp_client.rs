use crate::platform::resolve_chromium_binary;
use anyhow::{bail, Context, Result};
use base64::{engine::general_purpose::STANDARD, Engine};
use serde_json::{json, Value};
use std::io::{BufRead, BufReader, Read, Write};
use std::net::TcpStream;
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::mpsc;
use std::thread;
use std::time::{Duration, Instant};

/// Minimal RFC 6455 WebSocket client over std::net::TcpStream for local Chrome DevTools Protocol.
struct WsClient {
    stream: TcpStream,
    next_id: u64,
    mask_counter: u64,
}

impl WsClient {
    fn connect(ws_url: &str) -> Result<Self> {
        let stripped = ws_url
            .strip_prefix("ws://")
            .ok_or_else(|| anyhow::anyhow!("Only local ws:// CDP URLs are supported: {ws_url}"))?;
        let (host_port, path) = match stripped.find('/') {
            Some(idx) => (&stripped[..idx], &stripped[idx..]),
            None => (stripped, "/"),
        };

        let mut stream = TcpStream::connect(host_port)
            .with_context(|| format!("Failed to connect to CDP WebSocket at {host_port}"))?;
        stream.set_read_timeout(Some(Duration::from_secs(30)))?;
        stream.set_write_timeout(Some(Duration::from_secs(30)))?;
        let _ = stream.set_nodelay(true);

        let key_bytes: [u8; 16] = [
            0x48, 0x4d, 0x53, 0x5f, 0x43, 0x44, 0x50, 0x5f, 0x52, 0x55, 0x53, 0x54, 0x32, 0x30,
            0x32, 0x36,
        ];
        let ws_key = STANDARD.encode(key_bytes);

        let handshake = format!(
            "GET {path} HTTP/1.1\r\n\
             Host: {host_port}\r\n\
             Upgrade: websocket\r\n\
             Connection: Upgrade\r\n\
             Sec-WebSocket-Key: {ws_key}\r\n\
             Sec-WebSocket-Version: 13\r\n\r\n"
        );
        stream.write_all(handshake.as_bytes())?;
        stream.flush()?;

        // Read HTTP 101 response headers
        let mut header_buf = Vec::new();
        let mut byte = [0u8; 1];
        while !header_buf.ends_with(b"\r\n\r\n") {
            stream.read_exact(&mut byte)?;
            header_buf.push(byte[0]);
            if header_buf.len() > 16384 {
                bail!("CDP WebSocket handshake header too large");
            }
        }
        let header_str = String::from_utf8_lossy(&header_buf);
        if !header_str.starts_with("HTTP/1.1 101") {
            bail!("CDP WebSocket handshake failed: {header_str}");
        }

        Ok(Self {
            stream,
            next_id: 1,
            mask_counter: 0x5A3C_9E1F,
        })
    }

    fn send_text(&mut self, text: &str) -> Result<()> {
        let payload = text.as_bytes();
        let mut frame = Vec::with_capacity(payload.len() + 14);
        frame.push(0x81); // FIN + Text frame

        self.mask_counter = self.mask_counter.wrapping_mul(6364136223846793005).wrapping_add(1);
        let mask = [
            (self.mask_counter >> 24) as u8,
            (self.mask_counter >> 16) as u8,
            (self.mask_counter >> 8) as u8,
            self.mask_counter as u8,
        ];

        if payload.len() < 126 {
            frame.push(0x80 | (payload.len() as u8));
        } else if payload.len() <= 65535 {
            frame.push(0x80 | 126);
            frame.extend_from_slice(&(payload.len() as u16).to_be_bytes());
        } else {
            frame.push(0x80 | 127);
            frame.extend_from_slice(&(payload.len() as u64).to_be_bytes());
        }

        frame.extend_from_slice(&mask);
        for (i, &b) in payload.iter().enumerate() {
            frame.push(b ^ mask[i % 4]);
        }

        self.stream.write_all(&frame)?;
        self.stream.flush()?;
        Ok(())
    }

    fn send_pong(&mut self, payload: &[u8]) -> Result<()> {
        let mut frame = Vec::with_capacity(payload.len() + 6);
        frame.push(0x8A); // FIN + Pong
        let len = payload.len().min(125);
        frame.push(0x80 | (len as u8));
        let mask = [0x11, 0x22, 0x33, 0x44];
        frame.extend_from_slice(&mask);
        for (i, &b) in payload[..len].iter().enumerate() {
            frame.push(b ^ mask[i % 4]);
        }
        self.stream.write_all(&frame)?;
        Ok(())
    }

    fn read_message(&mut self) -> Result<String> {
        let mut full_payload = Vec::new();
        loop {
            let mut hdr = [0u8; 2];
            self.stream.read_exact(&mut hdr)?;
            let fin = (hdr[0] & 0x80) != 0;
            let opcode = hdr[0] & 0x0F;
            let masked = (hdr[1] & 0x80) != 0;
            let mut len = (hdr[1] & 0x7F) as usize;

            if len == 126 {
                let mut ext = [0u8; 2];
                self.stream.read_exact(&mut ext)?;
                len = u16::from_be_bytes(ext) as usize;
            } else if len == 127 {
                let mut ext = [0u8; 8];
                self.stream.read_exact(&mut ext)?;
                len = u64::from_be_bytes(ext) as usize;
            }

            let mask_key = if masked {
                let mut m = [0u8; 4];
                self.stream.read_exact(&mut m)?;
                Some(m)
            } else {
                None
            };

            let mut chunk = vec![0u8; len];
            self.stream.read_exact(&mut chunk)?;
            if let Some(m) = mask_key {
                for (i, b) in chunk.iter_mut().enumerate() {
                    *b ^= m[i % 4];
                }
            }

            match opcode {
                0x8 => bail!("CDP WebSocket closed by browser"),
                0x9 => {
                    let _ = self.send_pong(&chunk);
                    continue;
                }
                0xA => continue,
                0x1 | 0x0 => {
                    full_payload.extend_from_slice(&chunk);
                    if fin {
                        return Ok(String::from_utf8_lossy(&full_payload).into_owned());
                    }
                }
                _ => continue,
            }
        }
    }

    fn call(&mut self, method: &str, params: Value, session_id: Option<&str>) -> Result<Value> {
        let id = self.next_id;
        self.next_id += 1;

        let mut req = json!({
            "id": id,
            "method": method,
            "params": params
        });
        if let Some(sid) = session_id {
            req["sessionId"] = Value::String(sid.to_string());
        }

        self.send_text(&req.to_string())?;

        loop {
            let msg_str = self.read_message()?;
            let msg: Value = serde_json::from_str(&msg_str)?;
            if msg.get("id").and_then(Value::as_u64) == Some(id) {
                if let Some(err) = msg.get("error") {
                    bail!("CDP error in {method}: {err}");
                }
                return Ok(msg.get("result").cloned().unwrap_or(Value::Null));
            }
        }
    }
}

/// Manages an isolated headless Chromium/Chrome process controlled over Chrome DevTools Protocol.
pub struct HeadlessBrowserSession {
    child: Child,
    ws: WsClient,
    session_id: String,
    profile_dir: PathBuf,
}

impl HeadlessBrowserSession {
    pub fn launch(width: u32, height: u32) -> Result<Self> {
        let chrome_path = resolve_chromium_binary().ok_or_else(|| {
            anyhow::anyhow!(
                "No Chromium/Chrome/Edge binary found. Install Google Chrome, Chromium, or Edge, or set HMS_CHROME_PATH."
            )
        })?;

        let now_ms = chrono::Utc::now().timestamp_millis();
        let profile_dir = std::env::temp_dir().join(format!("hms_chrome_profile_{now_ms}_{}", std::process::id()));
        std::fs::create_dir_all(&profile_dir)?;

        let mut child = Command::new(&chrome_path)
            .args([
                "--headless=new",
                "--remote-debugging-port=0",
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-background-timer-throttling",
                "--disable-backgrounding-occluded-windows",
                "--disable-renderer-backgrounding",
                "--disable-ipc-flooding-protection",
                "--disable-extensions",
                "--disable-sync",
                "--disable-translate",
                "--mute-audio",
                "--autoplay-policy=no-user-gesture-required",
                "--allow-file-access-from-files",
                "--hide-scrollbars",
                "--force-color-profile=srgb",
                &format!("--window-size={width},{height}"),
                &format!("--user-data-dir={}", profile_dir.display()),
                "about:blank",
            ])
            .stdout(Stdio::null())
            .stderr(Stdio::piped())
            .spawn()
            .with_context(|| format!("Failed to spawn headless Chromium at {}", chrome_path.display()))?;

        let stderr = child
            .stderr
            .take()
            .ok_or_else(|| anyhow::anyhow!("Failed to capture Chromium stderr"))?;

        // Read stderr on a background thread until we find `DevTools listening on ws://...`
        let (tx, rx) = mpsc::channel::<Result<String, String>>();
        thread::spawn(move || {
            let reader = BufReader::new(stderr);
            let mut log_lines = Vec::new();
            for line in reader.lines().map_while(Result::ok) {
                if let Some(pos) = line.find("DevTools listening on ") {
                    let ws_url = line[pos + "DevTools listening on ".len()..].trim().to_string();
                    let _ = tx.send(Ok(ws_url));
                    return;
                }
                if log_lines.len() < 12 {
                    log_lines.push(line);
                }
            }
            let _ = tx.send(Err(log_lines.join("\n")));
        });

        let ws_url = match rx.recv_timeout(Duration::from_secs(15)) {
            Ok(Ok(url)) => url,
            Ok(Err(stderr_log)) => bail!(
                "Headless Chromium exited before DevTools WebSocket became ready. Stderr:\n{stderr_log}"
            ),
            Err(_) => bail!("Timed out waiting for headless Chromium DevTools WebSocket URL"),
        };

        let mut ws = WsClient::connect(&ws_url)?;

        // Create an isolated page target and attach to it
        let target_res = ws.call(
            "Target.createTarget",
            json!({ "url": "about:blank" }),
            None,
        )?;
        let target_id = target_res["targetId"]
            .as_str()
            .ok_or_else(|| anyhow::anyhow!("Target.createTarget returned no targetId"))?
            .to_string();

        let attach_res = ws.call(
            "Target.attachToTarget",
            json!({ "targetId": target_id, "flatten": true }),
            None,
        )?;
        let session_id = attach_res["sessionId"]
            .as_str()
            .ok_or_else(|| anyhow::anyhow!("Target.attachToTarget returned no sessionId"))?
            .to_string();

        ws.call("Page.enable", json!({}), Some(&session_id))?;
        ws.call("Runtime.enable", json!({}), Some(&session_id))?;
        ws.call(
            "Emulation.setDeviceMetricsOverride",
            json!({
                "width": width,
                "height": height,
                "deviceScaleFactor": 1,
                "mobile": false
            }),
            Some(&session_id),
        )?;

        Ok(Self {
            child,
            ws,
            session_id,
            profile_dir,
        })
    }

    pub fn load_file(&mut self, html_path: &Path) -> Result<()> {
        let abs = html_path.canonicalize().unwrap_or_else(|_| html_path.to_path_buf());
        let file_url = format!("file://{}", abs.to_string_lossy().replace('\\', "/"));
        self.ws.call("Page.navigate", json!({ "url": file_url }), Some(&self.session_id))?;

        // Wait until document.readyState === 'complete' (up to 6s ceiling)
        let deadline = Instant::now() + Duration::from_secs(6);
        while Instant::now() < deadline {
            if let Ok(val) = self.eval_js("document.readyState") {
                if val.as_str() == Some("complete") {
                    break;
                }
            }
            thread::sleep(Duration::from_millis(50));
        }
        // Small settle delay for initial fonts/layout
        thread::sleep(Duration::from_millis(120));
        Ok(())
    }

    pub fn eval_js(&mut self, expression: &str) -> Result<Value> {
        let res = self.ws.call(
            "Runtime.evaluate",
            json!({
                "expression": expression,
                "awaitPromise": true,
                "returnByValue": true
            }),
            Some(&self.session_id),
        )?;
        Ok(res["result"]["value"].clone())
    }

    pub fn capture_png(&mut self, width: u32, height: u32) -> Result<Vec<u8>> {
        let res = self.ws.call(
            "Page.captureScreenshot",
            json!({
                "format": "png",
                "fromSurface": true,
                "clip": {
                    "x": 0,
                    "y": 0,
                    "width": width,
                    "height": height,
                    "scale": 1
                }
            }),
            Some(&self.session_id),
        )?;
        let b64 = res["data"]
            .as_str()
            .ok_or_else(|| anyhow::anyhow!("Page.captureScreenshot returned no data"))?;
        let bytes = STANDARD.decode(b64)?;
        Ok(bytes)
    }

    pub fn resize(&mut self, width: u32, height: u32) -> Result<()> {
        self.ws.call(
            "Emulation.setDeviceMetricsOverride",
            json!({
                "width": width,
                "height": height,
                "deviceScaleFactor": 1,
                "mobile": false
            }),
            Some(&self.session_id),
        )?;
        Ok(())
    }
}

impl Drop for HeadlessBrowserSession {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
        let _ = std::fs::remove_dir_all(&self.profile_dir);
    }
}
