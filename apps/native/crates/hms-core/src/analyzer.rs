use crate::models::{CompatibilityCheckItem, CompatibilityReport, DetectedFeatures};
use regex::Regex;
use std::collections::BTreeSet;

pub fn inspect_project_code(
    html: &str,
    css: Option<&str>,
    js: Option<&str>,
    missing_assets: &[String],
) -> CompatibilityReport {
    let combined = format!("{}\n{}\n{}", html, css.unwrap_or(""), js.unwrap_or(""));
    let mut checks = Vec::new();
    let mut warnings = Vec::new();

    let has_html = Regex::new(r"(?i)<html|<body|<div|<canvas|<svg")
        .unwrap()
        .is_match(html);
    checks.push(CompatibilityCheckItem {
        id: "html-structure".into(),
        name: "HTML Document Structure".into(),
        detected: has_html,
        status: if has_html { "ok" } else { "error" }.into(),
        details: if has_html {
            "Valid HTML markup elements detected."
        } else {
            "No standard HTML structure detected."
        }
        .into(),
    });

    let has_css_animations = Regex::new(r"(?i)@keyframes|animation\s*:|animation-name\s*:")
        .unwrap()
        .is_match(&combined);
    checks.push(CompatibilityCheckItem {
        id: "css-animations".into(),
        name: "CSS Keyframe Animations".into(),
        detected: has_css_animations,
        status: "ok".into(),
        details: if has_css_animations {
            "CSS keyframe motion detected. Supports deterministic frame-by-frame capture."
        } else {
            "No CSS keyframe animations detected."
        }
        .into(),
    });

    let has_css_transitions = Regex::new(r"(?i)transition\s*:|transition-property\s*:")
        .unwrap()
        .is_match(&combined);
    checks.push(CompatibilityCheckItem {
        id: "css-transitions".into(),
        name: "CSS Transitions".into(),
        detected: has_css_transitions,
        status: if has_css_transitions { "info" } else { "ok" }.into(),
        details: if has_css_transitions {
            "CSS transitions detected."
        } else {
            "No CSS transitions detected."
        }
        .into(),
    });

    let has_raf = Regex::new(r"(?i)requestAnimationFrame|cancelAnimationFrame|performance\.now")
        .unwrap()
        .is_match(&combined);
    checks.push(CompatibilityCheckItem {
        id: "raf-loops".into(),
        name: "requestAnimationFrame Motion Loops".into(),
        detected: has_raf,
        status: if has_raf { "ok" } else { "info" }.into(),
        details: if has_raf {
            "JavaScript continuous animation loop detected."
        } else {
            "No rAF animation loops detected."
        }
        .into(),
    });

    let has_canvas = Regex::new(r#"(?i)<canvas|getContext\s*\(\s*['"]2d['"]\s*\)"#)
        .unwrap()
        .is_match(&combined);
    checks.push(CompatibilityCheckItem {
        id: "canvas-2d".into(),
        name: "HTML5 Canvas 2D".into(),
        detected: has_canvas,
        status: "ok".into(),
        details: if has_canvas {
            "Canvas 2D context detected. Ideal for direct pixel capture."
        } else {
            "No Canvas elements detected."
        }
        .into(),
    });

    let has_svg = Regex::new(r"(?i)<svg|<animate|<animateTransform|<animateMotion")
        .unwrap()
        .is_match(&combined);
    checks.push(CompatibilityCheckItem {
        id: "svg-elements".into(),
        name: "SVG Graphics & SMIL".into(),
        detected: has_svg,
        status: "ok".into(),
        details: if has_svg {
            "SVG vector elements detected."
        } else {
            "No SVG elements detected."
        }
        .into(),
    });

    let has_webgl = Regex::new(
        r#"(?i)getContext\s*\(\s*['"](webgl|webgl2|experimental-webgl)['"]\s*\)|THREE\.|BABYLON\."#,
    )
    .unwrap()
    .is_match(&combined);
    checks.push(CompatibilityCheckItem {
        id: "webgl-3d".into(),
        name: "WebGL / 3D Graphics".into(),
        detected: has_webgl,
        status: if has_webgl { "warning" } else { "ok" }.into(),
        details: if has_webgl {
            "WebGL / 3D rendering detected. Native desktop headless Chromium recommended."
        } else {
            "No WebGL 3D contexts detected."
        }
        .into(),
    });
    if has_webgl {
        warnings.push("WebGL 3D graphics detected. Native Chromium rendering enabled.".into());
    }

    let has_audio = Regex::new(r"(?i)<audio|AudioContext|webkitAudioContext|createMediaElementSource")
        .unwrap()
        .is_match(&combined);
    checks.push(CompatibilityCheckItem {
        id: "audio-elements".into(),
        name: "Embedded Audio Elements".into(),
        detected: has_audio,
        status: "info".into(),
        details: if has_audio {
            "Project contains audio code. External soundtrack mixing also supported."
        } else {
            "No embedded audio elements detected."
        }
        .into(),
    });

    let url_re = Regex::new(r#"(?i)https?://[^\s"'<>]+"#).unwrap();
    let mut url_set = BTreeSet::new();
    for m in url_re.find_iter(&combined) {
        let u = m.as_str();
        if !u.contains("w3.org") && !u.contains("schema.org") {
            url_set.insert(u.to_string());
        }
    }
    let external_urls: Vec<String> = url_set.into_iter().collect();
    let cors_risks = !external_urls.is_empty();
    checks.push(CompatibilityCheckItem {
        id: "external-dependencies".into(),
        name: "External Network Dependencies & CDNs".into(),
        detected: cors_risks,
        status: if cors_risks { "warning" } else { "ok" }.into(),
        details: if cors_risks {
            format!(
                "Found {} external URL(s). Bundle local assets in a ZIP for offline rendering.",
                external_urls.len()
            )
        } else {
            "Project is completely self-contained with no external dependencies.".into()
        },
    });
    if cors_risks {
        warnings.push("External CDN scripts or fonts detected.".into());
    }

    let has_missing_assets = !missing_assets.is_empty();
    checks.push(CompatibilityCheckItem {
        id: "missing-assets".into(),
        name: "Missing Project Assets".into(),
        detected: has_missing_assets,
        status: if has_missing_assets { "warning" } else { "ok" }.into(),
        details: if has_missing_assets {
            format!("Detected missing assets: {}", missing_assets.join(", "))
        } else {
            "All referenced assets are accounted for.".into()
        },
    });
    if has_missing_assets {
        warnings.push(format!("Missing assets: {}", missing_assets.join(", ")));
    }

    // Duration detection
    let dur_re = Regex::new(r"(?i)animation(?:-duration)?\s*:[^;{}]*?(\d+(?:\.\d+)?)(ms|s)\b").unwrap();
    let mut max_dur = 0.0_f64;
    for caps in dur_re.captures_iter(&combined) {
        if let (Some(val), Some(unit)) = (caps.get(1), caps.get(2)) {
            if let Ok(mut d) = val.as_str().parse::<f64>() {
                if unit.as_str().eq_ignore_ascii_case("ms") {
                    d /= 1000.0;
                }
                if d > max_dur && d < 120.0 {
                    max_dur = d;
                }
            }
        }
    }
    let detected_duration = if max_dur > 0.0 { Some(max_dur) } else { None };

    let (overall_status, summary) = if !has_html {
        ("unsupported", "No valid HTML structure found to render.")
    } else if has_webgl && cors_risks {
        (
            "desktop-recommended",
            "High complexity (WebGL + external resources). Native desktop engine ready.",
        )
    } else if has_missing_assets || cors_risks || has_webgl {
        (
            "limited",
            "Export is supported with minor notices (see compatibility checks).",
        )
    } else {
        ("ready", "Project is ready for deterministic native video rendering.")
    };

    let has_adapter = combined.contains("__HTML_MOTION_STUDIO__");
    let recommended_strategy = if has_adapter {
        "adapter"
    } else {
        "compatibility"
    };

    CompatibilityReport {
        overall_status: overall_status.into(),
        summary: summary.into(),
        checks,
        detected_features: DetectedFeatures {
            has_html,
            has_css_animations,
            has_css_transitions,
            has_raf,
            has_canvas,
            has_svg,
            has_webgl,
            has_audio,
            external_urls,
            missing_assets: missing_assets.to_vec(),
            cors_risks,
            detected_duration,
        },
        recommended_strategy: recommended_strategy.into(),
        warnings,
    }
}
