"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { Navbar } from "@/components/Navbar";
import { LanguageSelect } from "@/components/LanguageSwitcher";
import { audits, subscriptions, LanguageOption } from "@/lib/api";

export default function NewAuditPage() {
  const { t } = useI18n();
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [outputLanguage, setOutputLanguage] = useState("en");
  const [languages, setLanguages] = useState<LanguageOption[]>([
    { code: "en", name: "English" },
    { code: "it", name: "Italiano" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    subscriptions.getLanguages().then(setLanguages).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const audit = await audits.create({
        url,
        client_name: clientName || undefined,
        client_email: clientEmail || undefined,
        output_language: outputLanguage,
      });
      router.push(`/audits/${audit.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.common.error);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isLoggedIn />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">{t.audit.new_title}</h1>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.audit.url_label}</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.audit.url_placeholder}
                required
                className="input"
              />
            </div>

            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.audit.client_name_label}</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={t.audit.client_name_placeholder}
                className="input"
              />
            </div>

            {/* Client Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.audit.client_email_label}</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder={t.audit.client_email_placeholder}
                className="input"
              />
              <p className="mt-1 text-xs text-gray-400">
                The completed report will be emailed directly to your client in the selected language.
              </p>
            </div>

            {/* Language */}
            <LanguageSelect
              label={t.audit.language_label}
              value={outputLanguage}
              onChange={setOutputLanguage}
              options={languages}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center text-base py-3">
              {submitting ? t.audit.submitting : t.audit.submit}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
