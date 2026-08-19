use keysmith_core::{
    generate_batch, generate_passphrase, generate_password, KeySmithError, PassphraseOptions,
    PasswordOptions,
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
fn generation_rejects_policy_without_enabled_character_sets() {
    let options = PasswordOptions {
        lowercase: false,
        uppercase: false,
        digits: false,
        symbols: false,
        ..PasswordOptions::default()
    };

    assert_eq!(
        generate_password(&options),
        Err(KeySmithError::EmptyCharacterSet)
    );
}

#[test]
fn generation_rejects_custom_symbol_set_emptied_by_ambiguity_filter() {
    let options = PasswordOptions {
        lowercase: false,
        uppercase: false,
        digits: false,
        symbols: true,
        exclude_ambiguous: true,
        custom_symbols: Some("Il1O0o|`'\"".to_owned()),
        ..PasswordOptions::default()
    };

    assert_eq!(
        generate_password(&options),
        Err(KeySmithError::EmptyCharacterSet)
    );
}

#[test]
fn batch_generation_enforces_limit() {
    assert_eq!(
        generate_batch(&PasswordOptions::default(), 0),
        Err(KeySmithError::InvalidBatchSize)
    );
    assert_eq!(
        generate_batch(&PasswordOptions::default(), 501),
        Err(KeySmithError::InvalidBatchSize)
    );
}

#[test]
fn passphrase_uses_requested_word_count() {
    let options = PassphraseOptions::default();
    let phrase = generate_passphrase(&options)
        .unwrap_or_else(|error| panic!("passphrase failed: {error}"));
    assert_eq!(phrase.split('-').count(), options.words);
}

#[test]
fn passphrase_rejects_word_counts_outside_supported_range() {
    let too_few = PassphraseOptions {
        words: 2,
        ..PassphraseOptions::default()
    };
    let too_many = PassphraseOptions {
        words: 13,
        ..PassphraseOptions::default()
    };

    assert_eq!(
        generate_passphrase(&too_few),
        Err(KeySmithError::InvalidWordCount)
    );
    assert_eq!(
        generate_passphrase(&too_many),
        Err(KeySmithError::InvalidWordCount)
    );
}

#[test]
fn passphrase_rejects_long_or_control_character_separator() {
    let too_long = PassphraseOptions {
        separator: "----".to_owned(),
        ..PassphraseOptions::default()
    };
    let control_character = PassphraseOptions {
        separator: "\n".to_owned(),
        ..PassphraseOptions::default()
    };

    assert_eq!(
        generate_passphrase(&too_long),
        Err(KeySmithError::InvalidSeparator)
    );
    assert_eq!(
        generate_passphrase(&control_character),
        Err(KeySmithError::InvalidSeparator)
    );
}
