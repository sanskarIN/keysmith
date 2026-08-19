use std::fs;
use tauri_plugin_dialog::DialogExt;
use zeroize::Zeroizing;

const EXPORT_HEADER: &str = "# KeySmith batch export\n";
const MAX_BATCH_EXPORT_CHARS: usize = 70_000;

fn batch_export_content_is_allowed(content: &str) -> bool {
    content.starts_with(EXPORT_HEADER)
        && content.ends_with('\n')
        && content.chars().count() <= MAX_BATCH_EXPORT_CHARS
        && content
            .chars()
            .all(|character| character == '\n' || !character.is_control())
}

#[tauri::command]
pub async fn export_batch_command(app: tauri::AppHandle, content: String) -> Result<bool, String> {
    let content = Zeroizing::new(content);
    if !batch_export_content_is_allowed(&content) {
        return Err("batch export content is invalid or too large".to_owned());
    }

    let Some(destination) = app
        .dialog()
        .file()
        .set_title("Export KeySmith batch")
        .set_file_name("keysmith-batch.txt")
        .add_filter("Text file", &["txt"])
        .blocking_save_file()
    else {
        return Ok(false);
    };

    let path = destination
        .into_path()
        .map_err(|_| "selected export destination is not a local file path".to_owned())?;
    fs::write(path, content.as_bytes()).map_err(|_| "failed to write batch export".to_owned())?;
    Ok(true)
}

#[cfg(test)]
mod tests {
    use super::{EXPORT_HEADER, MAX_BATCH_EXPORT_CHARS, batch_export_content_is_allowed};

    #[test]
    fn export_validation_accepts_expected_plaintext_shape() {
        let content = format!("{EXPORT_HEADER}# Created: 2026-08-19T00:00:00.000Z\n# WARNING: test\n\nsecret\n");
        assert!(batch_export_content_is_allowed(&content));
    }

    #[test]
    fn export_validation_rejects_missing_header_controls_and_oversize_content() {
        assert!(!batch_export_content_is_allowed("secret\n"));
        assert!(!batch_export_content_is_allowed(&format!("{EXPORT_HEADER}secret\0\n")));
        assert!(!batch_export_content_is_allowed(&format!(
            "{EXPORT_HEADER}{}\n",
            "x".repeat(MAX_BATCH_EXPORT_CHARS)
        )));
    }
}
