use crate::PasswordOptions;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct PasswordPreset {
    pub id: &'static str,
    pub name: &'static str,
    pub description: &'static str,
    pub options: PasswordOptions,
}

pub fn presets() -> Vec<PasswordPreset> {
    vec![
        PasswordPreset {
            id: "balanced",
            name: "Balanced",
            description: "Strong default for most modern accounts.",
            options: PasswordOptions::default(),
        },
        PasswordPreset {
            id: "maximum",
            name: "Maximum",
            description: "Long password for vaults and high-value accounts.",
            options: PasswordOptions {
                length: 32,
                exclude_ambiguous: false,
                ..PasswordOptions::default()
            },
        },
        PasswordPreset {
            id: "legacy",
            name: "Legacy compatible",
            description: "16 characters with conservative symbols for older sites.",
            options: PasswordOptions {
                length: 16,
                custom_symbols: Some("!@#$%_-".to_owned()),
                ..PasswordOptions::default()
            },
        },
        PasswordPreset {
            id: "alphanumeric",
            name: "Alphanumeric",
            description: "Letters and digits only when symbols are not accepted.",
            options: PasswordOptions {
                length: 24,
                symbols: false,
                ..PasswordOptions::default()
            },
        },
    ]
}
