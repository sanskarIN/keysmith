export interface PasswordOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  customSymbols: string | null;
}

export interface PassphraseOptions {
  words: number;
  separator: string;
  capitalize: boolean;
  includeNumber: boolean;
}

export interface StrengthEstimate {
  score: number;
  guesses: number;
  guessesLog10: number;
  label: string;
}

export interface SecretResult {
  secret: string;
  strength: StrengthEstimate;
}

export interface BatchSecretResult {
  secret: string;
}

export interface PassphraseResult extends SecretResult {
  estimatedEntropyBits: number;
}

export interface PasswordPreset {
  id: string;
  name: string;
  description: string;
  options: PasswordOptions;
}

export type GeneratorMode = "password" | "passphrase" | "batch";
export type ThemePreference = "system" | "light" | "dark";
