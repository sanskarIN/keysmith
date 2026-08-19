use keysmith_core::{
    PassphraseOptions, PasswordOptions, StrengthEstimate, estimate_strength, generate_batch,
    generate_passphrase, generate_password, presets,
};
use serde::Serialize;
use std::{thread, time::Duration};
use zeroize::Zeroizing;

const MAX_CLIPBOARD_CHARS: usize = 65_536;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SecretResult {
    secret: String,
    strength: StrengthEstimate,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchSecretResult {
    secret: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PassphraseResult {
    secret: String,
    strength: StrengthEstimate,
    estimated_entropy_bits: f64,
}

#[tauri::command]
pub fn generate_password_command(options: PasswordOptions) -> Result<SecretResult, String> {
    let secret = generate_password(&options).map_err(|error| error.to_string())?;
    let strength = estimate_strength(&secret);
    Ok(SecretResult { secret, strength })
}

#[tauri::command]
pub fn generate_batch_command(
    options: PasswordOptions,
    count: usize,
) -> Result<Vec<BatchSecretResult>, String> {
    generate_batch(&options, count)
        .map_err(|error| error.to_string())?
        .into_iter()
        .map(|secret| Ok(BatchSecretResult { secret }))
        .collect()
}

#[tauri::command]
pub fn generate_passphrase_command(options: PassphraseOptions) -> Result<PassphraseResult, String> {
    let estimated_entropy_bits = keysmith_core::estimated_passphrase_entropy_bits(&options);
    let secret = generate_passphrase(&options).map_err(|error| error.to_string())?;
    let strength = estimate_strength(&secret);
    Ok(PassphraseResult {
        secret,
        strength,
        estimated_entropy_bits,
    })
}

#[tauri::command]
pub fn get_presets_command() -> Vec<keysmith_core::PasswordPreset> {
    presets()
}

fn clipboard_value_is_allowed(value: &str) -> bool {
    value.chars().count() <= MAX_CLIPBOARD_CHARS
}

#[tauri::command]
pub fn copy_secret_command(secret: String, clear_after_seconds: u64) -> Result<(), String> {
    let secret = Zeroizing::new(secret);
    if !clipboard_value_is_allowed(&secret) {
        return Err("clipboard value is too large".to_owned());
    }

    let mut clipboard =
        arboard::Clipboard::new().map_err(|_| "clipboard is unavailable".to_owned())?;
    clipboard
        .set_text(secret.to_string())
        .map_err(|_| "failed to write to clipboard".to_owned())?;

    if clear_after_seconds > 0 {
        let expected = Zeroizing::new(secret.to_string());
        thread::spawn(move || {
            thread::sleep(Duration::from_secs(clear_after_seconds.min(300)));
            if let Ok(mut clipboard) = arboard::Clipboard::new() {
                if clipboard.get_text().ok().as_deref() == Some(expected.as_str()) {
                    let _ = clipboard.set_text(String::new());
                }
            }
        });
    }

    Ok(())
}

#[tauri::command]
pub fn clear_clipboard_command() -> Result<(), String> {
    let mut clipboard =
        arboard::Clipboard::new().map_err(|_| "clipboard is unavailable".to_owned())?;
    clipboard
        .set_text(String::new())
        .map_err(|_| "failed to clear clipboard".to_owned())
}

#[cfg(test)]
mod tests {
    use super::{MAX_CLIPBOARD_CHARS, clipboard_value_is_allowed};

    #[test]
    fn clipboard_limit_allows_largest_supported_batch_text() {
        let largest_batch_chars = (500 * 128) + 499;
        let value = "x".repeat(largest_batch_chars);
        assert!(clipboard_value_is_allowed(&value));
    }

    #[test]
    fn clipboard_limit_rejects_oversized_values() {
        let value = "x".repeat(MAX_CLIPBOARD_CHARS + 1);
        assert!(!clipboard_value_is_allowed(&value));
    }
}
