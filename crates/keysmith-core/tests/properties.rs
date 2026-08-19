use keysmith_core::{generate_password, PasswordOptions};
use proptest::prelude::*;

proptest! {
    #[test]
    fn generated_password_has_exact_requested_length(length in 4usize..=128) {
        let options = PasswordOptions {
            length,
            ..PasswordOptions::default()
        };
        let password = generate_password(&options)
            .map_err(|error| TestCaseError::fail(error.to_string()))?;
        prop_assert_eq!(password.chars().count(), length);
    }

    #[test]
    fn digits_only_output_contains_only_digits(length in 4usize..=64) {
        let options = PasswordOptions {
            length,
            lowercase: false,
            uppercase: false,
            digits: true,
            symbols: false,
            exclude_ambiguous: false,
            custom_symbols: None,
        };
        let password = generate_password(&options)
            .map_err(|error| TestCaseError::fail(error.to_string()))?;
        prop_assert!(password.chars().all(|character| character.is_ascii_digit()));
    }
}
