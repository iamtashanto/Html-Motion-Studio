/// Injects the deterministic virtual-clock & seek controller into user HTML
/// so both interactive preview (WKWebView / Chromium) and deterministic export
/// support Strategy A (`window.__HTML_MOTION_STUDIO__`) and Strategy B (CSS Web Animations API,
/// HTML5 `<video>`, custom `seek` / `renderAtTime`, and `HMS_SEEK` postMessage).
pub fn inject_preview_controller(raw_html: &str) -> String {
    if raw_html.is_empty() {
        return String::new();
    }
    if raw_html.contains("__hms_preview_controller__") {
        return raw_html.to_string();
    }

    const CONTROLLER_SCRIPT: &str = r#"<script id="__hms_preview_controller__">
(function() {
  window.__HMS_VIRTUAL_TIME__ = 0;
  window.__HMS_IS_PLAYING__ = false;

  window.__HMS_SEEK__ = async function(timeSeconds, playState) {
    window.__HMS_VIRTUAL_TIME__ = timeSeconds;
    if (typeof playState === 'boolean') {
      window.__HMS_IS_PLAYING__ = playState;
    }

    // 1. Strategy A: window.__HTML_MOTION_STUDIO__
    if (window.__HTML_MOTION_STUDIO__) {
      try {
        if (typeof window.__HTML_MOTION_STUDIO__.seek === 'function') {
          await window.__HTML_MOTION_STUDIO__.seek(timeSeconds);
        }
        if (typeof window.__HTML_MOTION_STUDIO__.renderFrame === 'function') {
          await window.__HTML_MOTION_STUDIO__.renderFrame(timeSeconds);
        }
        if (window.__HMS_IS_PLAYING__ && typeof window.__HTML_MOTION_STUDIO__.play === 'function') {
          window.__HTML_MOTION_STUDIO__.play();
        } else if (!window.__HMS_IS_PLAYING__ && typeof window.__HTML_MOTION_STUDIO__.pause === 'function') {
          window.__HTML_MOTION_STUDIO__.pause();
        }
      } catch (e) {}
    }

    // 2. Custom global seek functions
    if (typeof window.renderAtTime === 'function') {
      try { window.renderAtTime(timeSeconds); } catch (e) {}
    }
    if (typeof window.seek === 'function') {
      try { window.seek(timeSeconds); } catch (e) {}
    }
    if (typeof window.seekTo === 'function') {
      try { window.seekTo(timeSeconds); } catch (e) {}
    }

    // 3. PostMessage broadcast
    try {
      window.postMessage({ type: 'HMS_SEEK', time: timeSeconds, isPlaying: window.__HMS_IS_PLAYING__ }, '*');
    } catch (e) {}

    // 4. Web Animations API (CSS @keyframes & transitions)
    if (document.getAnimations) {
      try {
        var anims = document.getAnimations();
        for (var i = 0; i < anims.length; i++) {
          var a = anims[i];
          try {
            a.currentTime = timeSeconds * 1000;
            if (window.__HMS_IS_PLAYING__) {
              a.play();
            } else {
              a.pause();
            }
          } catch (e) {}
        }
      } catch (e) {}
    }

    // 5. HTML5 <video> elements
    try {
      var vids = document.querySelectorAll('video');
      for (var j = 0; j < vids.length; j++) {
        var vid = vids[j];
        try {
          vid.currentTime = timeSeconds;
          if (window.__HMS_IS_PLAYING__) {
            vid.play().catch(function(){});
          } else {
            vid.pause();
          }
        } catch (e) {}
      }
    } catch (e) {}
    return true;
  };

  window.addEventListener('message', function(ev) {
    if (!ev.data || typeof ev.data !== 'object') return;
    if (ev.data.type === 'HMS_SEEK') {
      window.__HMS_SEEK__(ev.data.time, ev.data.isPlaying);
    } else if (ev.data.type === 'HMS_PLAY') {
      window.__HMS_SEEK__(ev.data.time !== undefined ? ev.data.time : window.__HMS_VIRTUAL_TIME__, true);
    } else if (ev.data.type === 'HMS_PAUSE') {
      window.__HMS_SEEK__(ev.data.time !== undefined ? ev.data.time : window.__HMS_VIRTUAL_TIME__, false);
    }
  });

  document.addEventListener('DOMContentLoaded', function() {
    window.__HMS_SEEK__(0, false);
  });
})();
</script>"#;

    if let Some(pos) = raw_html.find("<head>") {
        let idx = pos + "<head>".len();
        format!("{}\n{}\n{}", &raw_html[..idx], CONTROLLER_SCRIPT, &raw_html[idx..])
    } else if let Some(pos) = raw_html.find("<html>") {
        let idx = pos + "<html>".len();
        format!(
            "{}\n<head>{}</head>\n{}",
            &raw_html[..idx],
            CONTROLLER_SCRIPT,
            &raw_html[idx..]
        )
    } else {
        format!("{}\n{}", CONTROLLER_SCRIPT, raw_html)
    }
}
