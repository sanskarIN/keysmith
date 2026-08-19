use keysmith_core::{
    PassphraseOptions, PasswordOptions, generate_batch, generate_passphrase, generate_password,
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
fn batch_generation_enforces_limit() {
    assert!(generate_batch(&PasswordOptions::default(), 0).is_err());
    assert!(generate_batch(&PasswordOptions::default(), 501).is_err());
}

#[test]
fn passphrase_uses_requested_word_count() {
    let options = PassphraseOptions::default();
    let phrase = generate_passphrase(&options)
        .unwrap_or_else(|error| panic!("passphrase failed: {error}"));
    assert_eq!(
        phrase.split('-').count(),
        options.words
    );
}
