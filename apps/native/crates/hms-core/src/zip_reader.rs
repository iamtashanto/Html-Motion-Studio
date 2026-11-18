use anyhow::{bail, Result};
use flate2::read::DeflateDecoder;
use std::io::Read;

pub const MAX_FILE_COUNT: usize = 500;
pub const MAX_SINGLE_FILE_SIZE: u64 = 50 * 1024 * 1024; // 50 MB
pub const MAX_TOTAL_EXTRACTED_SIZE: u64 = 150 * 1024 * 1024; // 150 MB
pub const MAX_DEPTH: usize = 8;

#[derive(Debug, Clone)]
pub struct ZipEntryData {
    pub path: String,
    pub data: Vec<u8>,
}

/// Validates a relative path from a ZIP archive to prevent zip-slip / path traversal.
pub fn validate_safe_path(entry_path: &str) -> Result<String> {
    if entry_path.contains('\0') {
        bail!("Path traversal detected: null byte in archive entry");
    }
    if entry_path.starts_with('/') || entry_path.starts_with('\\') {
        bail!("Absolute paths not allowed in archive: {entry_path}");
    }
    let normalized = entry_path.replace('\\', "/");
    let normalized = normalized.trim_start_matches("./");

    let mut depth = 0usize;
    for comp in normalized.split('/') {
        if comp.is_empty() || comp == "." {
            continue;
        }
        if comp == ".." {
            bail!("Path traversal rejected: {entry_path}");
        }
        depth += 1;
    }

    if depth > MAX_DEPTH {
        bail!("Archive exceeds directory nesting depth ceiling ({MAX_DEPTH}): {entry_path}");
    }
    Ok(normalized.to_string())
}

fn read_u16_le(buf: &[u8], off: usize) -> Result<u16> {
    let slice = buf.get(off..off + 2).ok_or_else(|| anyhow::anyhow!("Truncated ZIP header"))?;
    Ok(u16::from_le_bytes([slice[0], slice[1]]))
}

fn read_u32_le(buf: &[u8], off: usize) -> Result<u32> {
    let slice = buf.get(off..off + 4).ok_or_else(|| anyhow::anyhow!("Truncated ZIP header"))?;
    Ok(u32::from_le_bytes([slice[0], slice[1], slice[2], slice[3]]))
}

/// Security-hardened pure-Rust ZIP reader supporting Stored (0) and Deflate (8) entries.
/// Enforces max file count, max single-file size, max total extracted size, path-traversal
/// protection, and CRC32 verification.
pub fn extract_zip_bytes(buf: &[u8]) -> Result<Vec<ZipEntryData>> {
    // Locate End of Central Directory (EOCD) signature: 0x06054b50
    if buf.len() < 22 {
        bail!("Invalid ZIP file: too small");
    }

    let search_start = buf.len().saturating_sub(65_557);
    let mut eocd_pos = None;
    for i in (search_start..=buf.len() - 22).rev() {
        if buf[i..i + 4] == [0x50, 0x4b, 0x05, 0x06] {
            eocd_pos = Some(i);
            break;
        }
    }
    let eocd = eocd_pos.ok_or_else(|| anyhow::anyhow!("Invalid ZIP archive: EOCD not found"))?;

    let total_entries = read_u16_le(buf, eocd + 10)? as usize;
    let cd_size = read_u32_le(buf, eocd + 12)? as usize;
    let cd_offset = read_u32_le(buf, eocd + 16)? as usize;

    if total_entries > MAX_FILE_COUNT {
        bail!("ZIP package exceeds maximum file count limit ({MAX_FILE_COUNT} files).");
    }
    if cd_offset + cd_size > buf.len() {
        bail!("Invalid ZIP central directory bounds");
    }

    let mut entries = Vec::new();
    let mut offset = cd_offset;
    let mut file_count = 0usize;
    let mut total_extracted = 0u64;

    for _ in 0..total_entries {
        if offset + 46 > buf.len() || buf[offset..offset + 4] != [0x50, 0x4b, 0x01, 0x02] {
            bail!("Corrupt ZIP central directory entry");
        }

        let compression_method = read_u16_le(buf, offset + 10)?;
        let expected_crc = read_u32_le(buf, offset + 16)?;
        let compressed_size = read_u32_le(buf, offset + 20)? as usize;
        let uncompressed_size = read_u32_le(buf, offset + 24)? as u64;
        let name_len = read_u16_le(buf, offset + 28)? as usize;
        let extra_len = read_u16_le(buf, offset + 30)? as usize;
        let comment_len = read_u16_le(buf, offset + 32)? as usize;
        let local_header_offset = read_u32_le(buf, offset + 42)? as usize;

        let name_start = offset + 46;
        let name_end = name_start + name_len;
        if name_end > buf.len() {
            bail!("Truncated ZIP filename");
        }
        let raw_name = String::from_utf8_lossy(&buf[name_start..name_end]).to_string();
        offset = name_end + extra_len + comment_len;

        // Skip directory entries and macOS metadata
        if raw_name.ends_with('/') || raw_name.starts_with("__MACOSX/") {
            continue;
        }

        file_count += 1;
        if file_count > MAX_FILE_COUNT {
            bail!("ZIP package exceeds maximum file count limit ({MAX_FILE_COUNT} files).");
        }

        let safe_path = validate_safe_path(&raw_name)?;

        if uncompressed_size > MAX_SINGLE_FILE_SIZE {
            bail!("ZIP entry '{safe_path}' exceeds 50MB single-file limit.");
        }
        total_extracted = total_extracted.saturating_add(uncompressed_size);
        if total_extracted > MAX_TOTAL_EXTRACTED_SIZE {
            bail!("ZIP archive exceeds cumulative 150MB uncompressed limit.");
        }

        if local_header_offset + 30 > buf.len()
            || buf[local_header_offset..local_header_offset + 4] != [0x50, 0x4b, 0x03, 0x04]
        {
            bail!("Corrupt ZIP local file header for '{safe_path}'");
        }

        let lh_name_len = read_u16_le(buf, local_header_offset + 26)? as usize;
        let lh_extra_len = read_u16_le(buf, local_header_offset + 28)? as usize;
        let data_start = local_header_offset + 30 + lh_name_len + lh_extra_len;
        let data_end = data_start + compressed_size;
        if data_end > buf.len() {
            bail!("Truncated ZIP entry payload for '{safe_path}'");
        }

        let compressed = &buf[data_start..data_end];
        let decompressed = match compression_method {
            0 => compressed.to_vec(),
            8 => {
                let mut decoder = DeflateDecoder::new(compressed);
                let mut limited = decoder.by_ref().take(MAX_SINGLE_FILE_SIZE + 1);
                let mut out = Vec::with_capacity(uncompressed_size.min(4 * 1024 * 1024) as usize);
                limited.read_to_end(&mut out)?;
                if out.len() as u64 > MAX_SINGLE_FILE_SIZE {
                    bail!("ZIP bomb protection: entry '{safe_path}' exceeded 50MB when decompressed.");
                }
                out
            }
            other => bail!("Unsupported ZIP compression method {other} for '{safe_path}'"),
        };

        let actual_crc = crc32fast::hash(&decompressed);
        if expected_crc != 0 && actual_crc != expected_crc {
            bail!("CRC32 mismatch for ZIP entry '{safe_path}'");
        }

        entries.push(ZipEntryData {
            path: safe_path,
            data: decompressed,
        });
    }

    Ok(entries)
}
