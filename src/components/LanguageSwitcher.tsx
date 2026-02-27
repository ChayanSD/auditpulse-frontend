"use client";

import { useI18n, SUPPORTED_LOCALES, SupportedLocale } from "@/hooks/useI18n";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { locale, setLocale } = useI18n();

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {SUPPORTED_LOCALES.map(({ code, name }) => (
        <button
          key={code}
          onClick={() => setLocale(code as SupportedLocale)}
          className={`px-2 py-1 text-sm rounded transition-colors ${
            locale === code
              ? "bg-indigo-600 text-white font-semibold"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
          }`}
          title={name}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/**
 * Dropdown variant - for use in settings or forms where more languages may be available.
 * Fetches available languages from the API so adding a new backend locale
 * automatically surfaces it in the UI without frontend code changes.
 */
export function LanguageSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (code: string) => void;
  options: Array<{ code: string; name: string }>;
  label?: string;
}) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        {options.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
}
