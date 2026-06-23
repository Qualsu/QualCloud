import ru from "./translations/ru.json";
import en from "./translations/en.json";

export const LANGUAGES = {
  ru: { code: "ru", label: "Русский", flag: "🇷🇺" },
  en: { code: "en", label: "English", flag: "🇬🇧" },
} as const;

export type Language = keyof typeof LANGUAGES;

export const translations = { ru, en } as const;

export type TranslationKey = keyof typeof ru;

function getNestedValue(obj: unknown, key: string): string | undefined {
  const keys = key.split(".");
  let current: unknown = obj;

  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = (current as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }

  return typeof current === "string" ? current : undefined;
}

export function translate(
  language: Language,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict = translations[language];
  let value = getNestedValue(dict, key) ?? getNestedValue(translations.ru, key);

  if (value === undefined) {
    return key;
  }

  if (params) {
    value = value.replace(/\{(\w+)\}/g, (_, paramKey) =>
      String(params[paramKey] ?? `{${paramKey}}`)
    );
  }

  return value;
}

export function isLanguage(value: string): value is Language {
  return value in LANGUAGES;
}
