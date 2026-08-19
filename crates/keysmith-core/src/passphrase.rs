use crate::{KeySmithError, PassphraseOptions, random};

fn capitalize_ascii(word: &str) -> String {
    let mut chars = word.chars();
    match chars.next() {
        Some(first) => first.to_ascii_uppercase().to_string() + chars.as_str(),
        None => String::new(),
    }
}

pub fn generate_passphrase(options: &PassphraseOptions) -> Result<String, KeySmithError> {
    if !(3..=12).contains(&options.words) {
        return Err(KeySmithError::InvalidWordCount);
    }
    if options.separator.chars().count() > 3 || options.separator.chars().any(char::is_control) {
        return Err(KeySmithError::InvalidSeparator);
    }

    let list = eff_wordlist::large::LIST;
    let mut words = Vec::with_capacity(options.words);
    for _ in 0..options.words {
        let index = random::uniform_index(list.len())?;
        let word = list[index].1;
        words.push(
            if options.capitalize {
                capitalize_ascii(word)
            } else {
                word.to_owned()
            },
        );
    }

    let mut phrase = words.join(&options.separator);
    if options.include_number {
        let number = random::uniform_index(100)?;
        phrase.push_str(&format!("{number:02}"));
    }
    Ok(phrase)
}

pub fn estimated_passphrase_entropy_bits(options: &PassphraseOptions) -> f64 {
    let per_word = (eff_wordlist::large::LIST.len() as f64).log2();
    let number_bits = if options.include_number {
        100_f64.log2()
    } else {
        0.0
    };
    (options.words as f64 * per_word) + number_bits
}
