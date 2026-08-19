use keysmith_core::{
    KeySmithError, PassphraseOptions, PasswordOptions, generate_passphrase, generate_password,
};

#[test]
fn password_rejects_missing_character_sets() {
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
fn password_rejects_lengths_outside_supported_range() {
    for length in [0, 3, 129, usize::MAX] {
        let options = PasswordOptions {
            length,
            ..PasswordOptions::default()
        };
        assert!(matches!(
            generate_password(&options),
            Err(KeySmithError::InvalidLength { min: 4, max: 128 })
        ));
    }
}

#[test]
fn custom_symbol_policy_is_honored_exactly() {
    let options = PasswordOptions {
        length: 16,
        lowercase: false,
        uppercase: false,
        digits: false,
        symbols: true,
        exclude_ambiguous: false,
        custom_symbols: Some("@".to_owned()),
    };

    let password = generate_password(&options)
        .unwrap_or_else(|error| panic!("custom-symbol generation failed: {error}"));
    assert_eq!(password, "@".repeat(16));
}

#[test]
fn custom_symbols_reject_oversized_invisible_or_alphanumeric_values() {
    for symbols in [
        "!".repeat(41),
        "!\n@".to_owned(),
        "! @".to_owned(),
        "!a@".to_owned(),
        "!7@".to_owned(),
    ] {
        let options = PasswordOptions {
            length: 16,
            custom_symbols: Some(symbols),
            ..PasswordOptions::default()
        };
        assert_eq!(
            generate_password(&options),
            Err(KeySmithError::InvalidCustomSymbols)
        );
    }
}

#[test]
fn invalid_custom_symbols_are_ignored_when_symbols_are_disabled() {
    let options = PasswordOptions {
        length: 16,
        symbols: false,
        custom_symbols: Some("invalid symbols with spaces and letters".to_owned()),
        ..PasswordOptions::default()
    };

    let password = generate_password(&options)
        .unwrap_or_else(|error| panic!("generation without symbols failed: {error}"));
    assert_eq!(password.chars().count(), 16);
    assert!(password.chars().all(|character| character.is_ascii_alphanumeric()));
}

#[test]
fn ambiguity_filter_rejects_empty_custom_symbol_pool() {
    let options = PasswordOptions {
        length: 16,
        lowercase: false,
        uppercase: false,
        digits: false,
        symbols: true,
        exclude_ambiguous: true,
        custom_symbols: Some("|`'\"".to_owned()),
    };

    assert_eq!(
        generate_password(&options),
        Err(KeySmithError::EmptyCharacterSet)
    );
}

#[test]
fn passphrase_rejects_invalid_word_counts() {
    for words in [0, 2, 13, usize::MAX] {
        let options = PassphraseOptions {
            words,
            ..PassphraseOptions::default()
        };
        assert_eq!(
            generate_passphrase(&options),
            Err(KeySmithError::InvalidWordCount)
        );
    }
}

#[test]
fn passphrase_rejects_unsafe_separators() {
    for separator in ["abcd", "\n", "\r", "\t"] {
        let options = PassphraseOptions {
            separator: separator.to_owned(),
            ..PassphraseOptions::default()
        };
        assert_eq!(
            generate_passphrase(&options),
            Err(KeySmithError::InvalidSeparator)
        );
    }
}
