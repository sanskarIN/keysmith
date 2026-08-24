use keysmith_core::{
    PassphraseOptions, PasswordOptions, StrengthEstimate, estimate_strength, generate_batch,
    generate_passphrase, generate_password, presets,
};
use serde::Serialize;
use std::{thread, time::Duration};
use zeroize::Zeroizing;

const SUPPORTED_CLIPBOARD_CLEAR_SECONDS: [u64; 5] = [0, 15, 30, 60, 120];

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

fn validate_clipboard_clear_seconds(clear_after_seconds: u64) -> Result<(), String> {
    if SUPPORTED_CLIPBOARD_CLEAR_SECONDS.contains(&clear_after_seconds) {
        Ok(())
    } else {
        Err("unsupported clipboard clear duration".to_owned())
    }
}

#[tauri::command]
pub fn copy_secret_command(secret: String, clear_after_seconds: u64) -> Result<(), String> {
    let secret = Zeroizing::new(secret);
    if secret.chars().count() > 4096 {
        return Err("clipboard value is too large".to_owned());
    }
    validate_clipboard_clear_seconds(clear_after_seconds)?;

    let mut clipboard =
        arboard::Clipboard::new().map_err(|_| "clipboard is unavailable".to_owned())?;
    clipboard
        .set_text(secret.to_string())
        .map_err(|_| "failed to write to clipboard".to_owned())?;

    if clear_after_seconds > 0 {
        let expected = Zeroizing::new(secret.to_string());
        thread::spawn(move || {
            thread::sleep(Duration::from_secs(clear_after_seconds));
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
    use super::{SUPPORTED_CLIPBOARD_CLEAR_SECONDS, validate_clipboard_clear_seconds};

    #[test]
    fn documented_clipboard_durations_are_supported() {
        for seconds in SUPPORTED_CLIPBOARD_CLEAR_SECONDS {
            assert!(validate_clipboard_clear_seconds(seconds).is_ok());
        }
    }

    #[test]
    fn undocumented_clipboard_durations_are_rejected() {
        for seconds in [1, 14, 16, 300, u64::MAX] {
            assert!(validate_clipboard_clear_seconds(seconds).is_err());
        }
    }
}
