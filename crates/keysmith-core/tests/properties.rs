use keysmith_core::{PasswordOptions, generate_password};
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

    #[test]
    fn every_nonempty_class_combination_obeys_enabled_policy(
        length in 4usize..=128,
        mask in 1u8..=15,
    ) {
        let lowercase = mask & 0b0001 != 0;
        let uppercase = mask & 0b0010 != 0;
        let digits = mask & 0b0100 != 0;
        let symbols = mask & 0b1000 != 0;
        let options = PasswordOptions {
            length,
            lowercase,
            uppercase,
            digits,
            symbols,
            exclude_ambiguous: false,
            custom_symbols: None,
        };

        let password = generate_password(&options)
            .map_err(|error| TestCaseError::fail(error.to_string()))?;

        prop_assert_eq!(password.chars().count(), length);
        prop_assert_eq!(password.chars().any(|c| c.is_ascii_lowercase()), lowercase);
        prop_assert_eq!(password.chars().any(|c| c.is_ascii_uppercase()), uppercase);
        prop_assert_eq!(password.chars().any(|c| c.is_ascii_digit()), digits);
        prop_assert_eq!(password.chars().any(|c| !c.is_ascii_alphanumeric()), symbols);
    }
}
