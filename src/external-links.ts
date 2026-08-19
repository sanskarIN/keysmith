import { openUrl } from "@tauri-apps/plugin-opener";

const TRUSTED_EXTERNAL_URLS = new Set([
  "https://github.com/sanskarIN",
  "https://buymeacoffee.com/sanskarIN",
  "mailto:supportramsandesh@gmail.com",
  "mailto:sanskarin@outlook.in",
  "mailto:sanskarin.business@gmail.com",
]);

export function isTrustedExternalUrl(url: string): boolean {
  return TRUSTED_EXTERNAL_URLS.has(url);
}

export async function openTrustedExternalUrl(url: string): Promise<void> {
  if (!isTrustedExternalUrl(url)) {
    throw new Error("External URL is not approved by KeySmith.");
  }
  await openUrl(url);
}
