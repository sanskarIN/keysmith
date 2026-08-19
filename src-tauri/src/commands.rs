use keysmith_core::{
    estimate_strength, generate_batch, generate_passphrase, generate_password, presets,
    PassphraseOptions, PasswordOptions, StrengthEstimate,
};
use serde::Serialize;
use std::{thread, time::Duration};
use zeroize::Zeroize;

const ALLOWED_CLIPBOARD_CLEAR_SECONDS: [u64; 5] = [0, 15, 30, 60, 120];

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SecretResult {
    secret: String,
    strength: StrengthEstimate,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PassphraseResult {
    secret: String,
    strength: StrengthEstimate,
    estimated_entropy_bits: f64,
}

fn is_valid_clipboard_clear_seconds(seconds: u64) -> bool {
    ALLOWED_CLIPBOARD_CLEAR_SECONDS.contains(&seconds)
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
) -> Result<Vec<SecretResult>, String> {
    let results = generate_batch(&options, count)
        .map_err(|error| error.to_string())?
        .into_iter()
        .map(|secret| {
            let strength = estimate_strength(&secret);
            SecretResult { secret, strength }
        })
        .collect();
    Ok(results)
}

#[tauri::command]
pub fn generate_passphrase_command(options: PassphraseOptions) -> Result<PassphraseResult, String> {
    let secret = generate_passphrase(&options).map_err(|error| error.to_string())?;
    let estimated_entropy_bits = keysmith_core::estimated_passphrase_entropy_bits(&options);
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

#[tauri::command]
pub fn copy_secret_command(mut secret: String, clear_after_seconds: u64) -> Result<(), String> {
    if secret.chars().count() > 4096 {
        secret.zeroize();
        return Err("clipboard value is too large".to_owned());
    }
    if !is_valid_clipboard_clear_seconds(clear_after_seconds) {
        secret.zeroize();
        return Err("unsupported clipboard clear duration".to_owned());
    }

    let result = (|| -> Result<(), String> {
        let mut clipboard =
            arboard::Clipboard::new().map_err(|_| "clipboard is unavailable".to_owned())?;
        clipboard
            .set_text(secret.clone())
            .map_err(|_| "failed to write to clipboard".to_owned())?;

        if clear_after_seconds > 0 {
            let mut expected = secret.clone();
            thread::spawn(move || {
                thread::sleep(Duration::from_secs(clear_after_seconds));
                if let Ok(mut clipboard) = arboard::Clipboard::new() {
                    if clipboard.get_text().ok().as_deref() == Some(expected.as_str()) {
                        let _ = clipboard.set_text(String::new());
                    }
                }
                expected.zeroize();
            });
        }

        Ok(())
    })();

    secret.zeroize();
    result
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
    use super::is_valid_clipboard_clear_seconds;

    #[test]
    fn clipboard_clear_duration_accepts_only_supported_values() {
        for seconds in [0, 15, 30, 60, 120] {
            assert!(is_valid_clipboard_clear_seconds(seconds));
        }
        for seconds in [1, 14, 16, 59, 121, 300] {
            assert!(!is_valid_clipboard_clear_seconds(seconds));
        }
    }
}
