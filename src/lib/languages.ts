import { LanguageOption } from "@/lib/api";

export const DEFAULT_REPORT_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English" },
  { code: "it", name: "Italiano" },
];

export function mergeLanguageOptions(primary: LanguageOption[], fallback: LanguageOption[] = DEFAULT_REPORT_LANGUAGES): LanguageOption[] {
  const merged = new Map<string, LanguageOption>();
  fallback.forEach((lang) => merged.set(lang.code, lang));
  primary.forEach((lang) => merged.set(lang.code, lang));
  return Array.from(merged.values());
}

