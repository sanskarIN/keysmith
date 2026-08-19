import { en } from "./en";

export function localizedStrengthLabel(score: number, fallback: string): string {
  switch (score) {
    case 0:
      return en.strengthVeryWeak;
    case 1:
      return en.strengthWeak;
    case 2:
      return en.strengthFair;
    case 3:
      return en.strengthStrong;
    case 4:
      return en.strengthVeryStrong;
    default:
      return fallback;
  }
}
