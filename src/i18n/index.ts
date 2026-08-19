import { en } from "./en";

export type TranslationKey = keyof typeof en;
export type TranslationCatalog = Record<TranslationKey, string>;

function translatedValue(catalog: TranslationCatalog, key: string | undefined): string | null {
  if (!key || !(key in catalog)) return null;
  return catalog[key as TranslationKey];
}

export function applyTranslations(
  root: ParentNode = document,
  catalog: TranslationCatalog = en,
): void {
  root.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
    const value = translatedValue(catalog, element.dataset.i18n);
    if (value !== null) element.textContent = value;
  });

  root.querySelectorAll<HTMLElement>("[data-i18n-title]").forEach((element) => {
    const value = translatedValue(catalog, element.dataset.i18nTitle);
    if (value !== null) element.setAttribute("title", value);
  });

  root.querySelectorAll<HTMLElement>("[data-i18n-aria-label]").forEach((element) => {
    const value = translatedValue(catalog, element.dataset.i18nAriaLabel);
    if (value !== null) element.setAttribute("aria-label", value);
  });

  root.querySelectorAll<HTMLInputElement>("[data-i18n-placeholder]").forEach((element) => {
    const value = translatedValue(catalog, element.dataset.i18nPlaceholder);
    if (value !== null) element.placeholder = value;
  });
}
