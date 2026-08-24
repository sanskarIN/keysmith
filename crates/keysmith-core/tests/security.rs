use keysmith_core::{
    PassphraseOptions, PasswordOptions, generate_batch, generate_passphrase, generate_password,
    presets,
};

#[test]
fn generated_password_contains_each_enabled_class() {
    let password = generate_password(&PasswordOptions::default())
        .unwrap_or_else(|error| panic!("generation failed: {error}"));
    assert!(password.chars().any(|c| c.is_ascii_lowercase()));
    assert!(password.chars().any(|c| c.is_ascii_uppercase()));
    assert!(password.chars().any(|c| c.is_ascii_digit()));
    assert!(password.chars().any(|c| !c.is_ascii_alphanumeric()));
}

#[test]
fn ambiguity_exclusion_removes_known_ambiguous_characters() {
    for _ in 0..100 {
        let password = generate_password(&PasswordOptions::default())
            .unwrap_or_else(|error| panic!("generation failed: {error}"));
        assert!(!password.chars().any(|c| "Il1O0o|`'\"".contains(c)));
    }
}

#[test]
fn custom_symbol_policy_rejects_alphanumeric_characters() {
    let mut options = PasswordOptions::default();
    options.custom_symbols = Some("!a".to_owned());
    assert!(generate_password(&options).is_err());
}

#[test]
fn custom_symbol_policy_rejects_more_than_forty_characters() {
    let mut options = PasswordOptions::default();
    options.custom_symbols = Some("!".repeat(41));
    assert!(generate_password(&options).is_err());
}

#[test]
fn custom_symbols_are_deduplicated_and_respect_ambiguity_exclusion() {
    let options = PasswordOptions {
        length: 32,
        lowercase: false,
        uppercase: false,
        digits: false,
        symbols: true,
        exclude_ambiguous: true,
        custom_symbols: Some("!!|".to_owned()),
    };
    let password =
        generate_password(&options).unwrap_or_else(|error| panic!("generation failed: {error}"));
    assert!(password.chars().all(|character| character == '!'));
}

#[test]
fn disabled_symbol_class_ignores_stale_custom_symbol_input() {
    let options = PasswordOptions {
        length: 16,
        lowercase: true,
        uppercase: false,
        digits: false,
        symbols: false,
        exclude_ambiguous: true,
        custom_symbols: Some("not-symbols".to_owned()),
    };
    let password =
        generate_password(&options).unwrap_or_else(|error| panic!("generation failed: {error}"));
    assert!(
        password
            .chars()
            .all(|character| character.is_ascii_lowercase())
    );
}

#[test]
fn built_in_presets_remain_valid_generation_policies() {
    for preset in presets() {
        let password = generate_password(&preset.options)
            .unwrap_or_else(|error| panic!("preset {} failed: {error}", preset.id));
        assert_eq!(password.chars().count(), preset.options.length);
    }
}

#[test]
fn batch_generation_enforces_limit() {
    assert!(generate_batch(&PasswordOptions::default(), 0).is_err());
    assert!(generate_batch(&PasswordOptions::default(), 501).is_err());
}

#[test]
fn passphrase_uses_requested_word_count() {
    let options = PassphraseOptions::default();
    let phrase =
        generate_passphrase(&options).unwrap_or_else(|error| panic!("passphrase failed: {error}"));
    assert_eq!(phrase.split('-').count(), options.words);
}
