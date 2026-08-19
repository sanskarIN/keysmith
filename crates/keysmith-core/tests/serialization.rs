use keysmith_core::{PassphraseOptions, PasswordOptions};

#[test]
fn password_policy_rejects_unknown_json_fields() {
    let payload = r#"{
        "length": 20,
        "lowercase": true,
        "uppercase": true,
        "digits": true,
        "symbols": true,
        "excludeAmbiguous": true,
        "customSymbols": null,
        "unexpected": true
    }"#;

    assert!(serde_json::from_str::<PasswordOptions>(payload).is_err());
}

#[test]
fn passphrase_policy_rejects_unknown_json_fields() {
    let payload = r#"{
        "words": 5,
        "separator": "-",
        "capitalize": false,
        "includeNumber": false,
        "unexpected": true
    }"#;

    assert!(serde_json::from_str::<PassphraseOptions>(payload).is_err());
}

#[test]
fn documented_policy_json_shapes_still_deserialize() {
    let password = r#"{
        "length": 20,
        "lowercase": true,
        "uppercase": true,
        "digits": true,
        "symbols": true,
        "excludeAmbiguous": true,
        "customSymbols": null
    }"#;
    let passphrase = r#"{
        "words": 5,
        "separator": "-",
        "capitalize": false,
        "includeNumber": false
    }"#;

    assert!(serde_json::from_str::<PasswordOptions>(password).is_ok());
    assert!(serde_json::from_str::<PassphraseOptions>(passphrase).is_ok());
}
