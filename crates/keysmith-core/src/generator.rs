use crate::{KeySmithError, PasswordOptions, random};
use zeroize::Zeroize;

const LOWERCASE: &str = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE: &str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS: &str = "0123456789";
const SYMBOLS: &str = "!@#$%^&*()-_=+[]{};:,.?/";
const AMBIGUOUS: &str = "Il1O0o|`'\"";
const MIN_LENGTH: usize = 4;
const MAX_LENGTH: usize = 128;
const MAX_CUSTOM_SYMBOLS: usize = 40;

fn filtered_chars(source: &str, exclude_ambiguous: bool) -> Vec<char> {
    let mut filtered = Vec::new();
    for character in source
        .chars()
        .filter(|character| !exclude_ambiguous || !AMBIGUOUS.contains(*character))
    {
        if !filtered.contains(&character) {
            filtered.push(character);
        }
    }
    filtered
}

fn validate_custom_symbols(symbols: &str) -> Result<(), KeySmithError> {
    if symbols.chars().count() > MAX_CUSTOM_SYMBOLS
        || symbols.chars().any(|character| {
            character.is_control() || character.is_whitespace() || character.is_alphanumeric()
        })
    {
        return Err(KeySmithError::InvalidCustomSymbols);
    }
    Ok(())
}

fn pick(chars: &[char]) -> Result<char, KeySmithError> {
    let index = random::uniform_index(chars.len())?;
    chars
        .get(index)
        .copied()
        .ok_or(KeySmithError::EmptyCharacterSet)
}

pub fn generate_password(options: &PasswordOptions) -> Result<String, KeySmithError> {
    if !(MIN_LENGTH..=MAX_LENGTH).contains(&options.length) {
        return Err(KeySmithError::InvalidLength {
            min: MIN_LENGTH,
            max: MAX_LENGTH,
        });
    }

    if let Some(symbols) = options
        .custom_symbols
        .as_deref()
        .filter(|_| options.symbols)
    {
        validate_custom_symbols(symbols)?;
    }

    let symbol_source = options
        .custom_symbols
        .as_deref()
        .filter(|symbols| !symbols.is_empty())
        .unwrap_or(SYMBOLS);
    let candidates = [
        (
            options.lowercase,
            filtered_chars(LOWERCASE, options.exclude_ambiguous),
        ),
        (
            options.uppercase,
            filtered_chars(UPPERCASE, options.exclude_ambiguous),
        ),
        (
            options.digits,
            filtered_chars(DIGITS, options.exclude_ambiguous),
        ),
        (
            options.symbols,
            filtered_chars(symbol_source, options.exclude_ambiguous),
        ),
    ];

    let selected: Vec<Vec<char>> = candidates
        .into_iter()
        .filter_map(|(enabled, chars)| enabled.then_some(chars))
        .collect();

    if selected.is_empty() || selected.iter().any(Vec::is_empty) {
        return Err(KeySmithError::EmptyCharacterSet);
    }
    if options.length < selected.len() {
        return Err(KeySmithError::LengthBelowRequiredSets);
    }

    let pool: Vec<char> = selected.iter().flatten().copied().collect();
    let mut password = Vec::with_capacity(options.length);

    for chars in &selected {
        password.push(pick(chars)?);
    }
    while password.len() < options.length {
        password.push(pick(&pool)?);
    }

    random::secure_shuffle(&mut password)?;
    let secret: String = password.iter().collect();
    password.zeroize();
    Ok(secret)
}

pub fn generate_batch(
    options: &PasswordOptions,
    count: usize,
) -> Result<Vec<String>, KeySmithError> {
    if !(1..=500).contains(&count) {
        return Err(KeySmithError::InvalidBatchSize);
    }
    (0..count).map(|_| generate_password(options)).collect()
}

#[cfg(test)]
mod tests {
    use super::filtered_chars;

    #[test]
    fn candidate_filter_treats_repeated_symbols_as_one_choice() {
        assert_eq!(filtered_chars("!!@@##", false), vec!['!', '@', '#']);
    }

    #[test]
    fn candidate_filter_deduplicates_after_ambiguity_removal() {
        assert_eq!(filtered_chars("||!!@@", true), vec!['!', '@']);
    }
}
