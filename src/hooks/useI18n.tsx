"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import enStrings from "@/locales/en.json";
import itStrings from "@/locales/it.json";

// ─── Type definitions ─────────────────────────────────────────────────────────

export type SupportedLocale = "en" | "it";

type Strings = typeof enStrings;

const LOCALE_STRINGS: Record<SupportedLocale, Strings> = {
  en: enStrings,
  it: itStrings,
};

export const SUPPORTED_LOCALES: { code: SupportedLocale; name: string }[] = [
  { code: "en", name: "English" },
  { code: "it", name: "Italiano" },
];

// ─── Context ──────────────────────────────────────────────────────────────────

interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: Strings;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  t: enStrings,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>("en");

  useEffect(() => {
    // Restore from localStorage on mount
    const saved = localStorage.getItem("auditpulse_locale") as SupportedLocale;
    if (saved && LOCALE_STRINGS[saved]) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem("auditpulse_locale", newLocale);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: LOCALE_STRINGS[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useI18n() {
  return useContext(I18nContext);
}

/**
 * Simple format helper for strings with {placeholder} tokens.
 * Usage: fmt(t.audit.submit_desc, { url: 'example.com' })
 */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (str, [key, val]) => str.replace(new RegExp(`{${key}}`, "g"), String(val)),
    template
  );
}
