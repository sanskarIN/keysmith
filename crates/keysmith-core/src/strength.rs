use serde::Serialize;

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct StrengthEstimate {
    pub score: u8,
    pub guesses: u64,
    pub guesses_log10: f64,
    pub label: &'static str,
}

pub fn estimate_strength(password: &str) -> StrengthEstimate {
    let estimate = zxcvbn::zxcvbn(password, &[]);
    let score = u8::from(estimate.score());
    let label = match score {
        0 => "Very weak",
        1 => "Weak",
        2 => "Fair",
        3 => "Strong",
        _ => "Very strong",
    };
    StrengthEstimate {
        score,
        guesses: estimate.guesses(),
        guesses_log10: estimate.guesses_log10(),
        label,
    }
}
