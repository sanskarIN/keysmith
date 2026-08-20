use keysmith_core::{
    PassphraseOptions, PasswordOptions, StrengthEstimate, estimate_strength, generate_batch,
    generate_passphrase, generate_password, presets,
};
use serde::Serialize;
use wasm_bindgen::prelude::*;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct WebSecretResult {
    secret: String,
    strength: StrengthEstimate,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct WebPassphraseResult {
    secret: String,
    strength: StrengthEstimate,
    estimated_entropy_bits: f64,
}

fn js_error(error: impl ToString) -> JsValue {
    JsValue::from_str(&error.to_string())
}

fn parse_password_options(options_json: &str) -> Result<PasswordOptions, JsValue> {
    serde_json::from_str(options_json).map_err(js_error)
}

fn parse_passphrase_options(options_json: &str) -> Result<PassphraseOptions, JsValue> {
    serde_json::from_str(options_json).map_err(js_error)
}

fn serialize<T: Serialize>(value: &T) -> Result<String, JsValue> {
    serde_json::to_string(value).map_err(js_error)
}

#[wasm_bindgen]
pub fn generate_password_json(options_json: &str) -> Result<String, JsValue> {
    let options = parse_password_options(options_json)?;
    let secret = generate_password(&options).map_err(js_error)?;
    let strength = estimate_strength(&secret);
    serialize(&WebSecretResult { secret, strength })
}

#[wasm_bindgen]
pub fn generate_batch_json(options_json: &str, count: usize) -> Result<String, JsValue> {
    let options = parse_password_options(options_json)?;
    let results = generate_batch(&options, count)
        .map_err(js_error)?
        .into_iter()
        .map(|secret| {
            let strength = estimate_strength(&secret);
            WebSecretResult { secret, strength }
        })
        .collect::<Vec<_>>();
    serialize(&results)
}

#[wasm_bindgen]
pub fn generate_passphrase_json(options_json: &str) -> Result<String, JsValue> {
    let options = parse_passphrase_options(options_json)?;
    let estimated_entropy_bits = keysmith_core::estimated_passphrase_entropy_bits(&options);
    let secret = generate_passphrase(&options).map_err(js_error)?;
    let strength = estimate_strength(&secret);
    serialize(&WebPassphraseResult {
        secret,
        strength,
        estimated_entropy_bits,
    })
}

#[wasm_bindgen]
pub fn presets_json() -> Result<String, JsValue> {
    serialize(&presets())
}

#[cfg(test)]
mod tests {
    use super::{generate_password_json, presets_json};

    #[test]
    fn password_binding_returns_json() {
        let options = r#"{"length":20,"lowercase":true,"uppercase":true,"digits":true,"symbols":true,"excludeAmbiguous":true,"customSymbols":null}"#;
        let result = generate_password_json(options)
            .unwrap_or_else(|error| panic!("web password binding failed: {error:?}"));
        assert!(result.contains("\"secret\""));
        assert!(result.contains("\"strength\""));
    }

    #[test]
    fn presets_binding_returns_json() {
        let result = presets_json()
            .unwrap_or_else(|error| panic!("web presets binding failed: {error:?}"));
        assert!(result.contains("balanced"));
        assert!(result.contains("maximum"));
    }
}
