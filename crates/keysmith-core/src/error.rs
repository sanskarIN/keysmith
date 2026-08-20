use thiserror::Error;

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum KeySmithError {
    #[error("password length must be between {min} and {max} characters")]
    InvalidLength { min: usize, max: usize },
    #[error("select at least one character set")]
    EmptyCharacterSet,
    #[error("password length is too short for the selected required character sets")]
    LengthBelowRequiredSets,
    #[error(
        "custom symbols must contain at most 40 non-alphanumeric, non-whitespace, non-control characters"
    )]
    InvalidCustomSymbols,
    #[error("batch size must be between {min} and {max}")]
    InvalidBatchSize { min: usize, max: usize },
    #[error("passphrase word count must be between 3 and 12")]
    InvalidWordCount,
    #[error("separator must contain at most 3 characters and may not contain control characters")]
    InvalidSeparator,
    #[error("operating-system random number generator failed")]
    RandomSourceUnavailable,
}
