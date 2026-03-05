"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { LanguageSelect } from "@/components/LanguageSwitcher";
import { audits } from "@/lib/api";
import { DEFAULT_REPORT_LANGUAGES, mergeLanguageOptions } from "@/lib/languages";
import { useLanguages } from "@/hooks/queries/useSubscriptions";
import { queryClient, queryKeys } from "@/lib/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function isValidAuditUrl(value: string): boolean {
  const raw = value.trim();
  if (!raw) return false;
  const normalized =
    raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
  try {
    const parsed = new URL(normalized);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      !!parsed.hostname &&
      parsed.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════ */

export default function NewAuditPage() {
  const { t } = useI18n();
  const { loading: authLoading } = useAuth();
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [outputLanguage, setOutputLanguage] = useState("en");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { data: rawLanguages, isLoading: languagesLoading } = useLanguages(!authLoading);
  const languages = rawLanguages
    ? mergeLanguageOptions(rawLanguages, DEFAULT_REPORT_LANGUAGES)
    : DEFAULT_REPORT_LANGUAGES;

  useEffect(() => {
    if (languages.length > 0 && !languages.some((l) => l.code === outputLanguage)) {
      setOutputLanguage(languages[0]?.code || "en");
    }
  }, [languages, outputLanguage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidAuditUrl(url)) {
      setError(t.audit.invalid_url);
      return;
    }
    setSubmitting(true);
    try {
      const audit = await audits.create({
        url: url.trim(),
        client_name: clientName || undefined,
        client_email: clientEmail || undefined,
        output_language: outputLanguage,
      });
      // Invalidate audits list & subscription usage so they refetch with fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.audits.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.details() });
      router.push(`/audits/${audit.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.common.error;
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
    }
  };

  /* ─── Loading skeleton ─────────────────────────────────────────────── */

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-16">
          <Skeleton className="h-8 w-48 rounded mb-2 mx-auto" />
          <Skeleton className="h-4 w-72 rounded mb-10 mx-auto" />
          <Card>
            <CardContent className="p-6 sm:p-8 space-y-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-11 w-full rounded-lg" />
                </div>
              ))}
              <Skeleton className="h-11 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /* ─── Main render ──────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            {t.audit.new_title}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter the details below to start a new SEO audit
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-sm">
          <CardContent className="p-5 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* URL */}
              <div className="space-y-1.5">
                <Label htmlFor="url">{t.audit.url_label}</Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
                    </svg>
                  </div>
                  <Input
                    id="url"
                    type="text"
                    inputMode="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={t.audit.url_placeholder}
                    required
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Client fields — side by side on sm+ */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <div className="min-h-[3rem] flex items-end pb-1.5">
                    <Label htmlFor="clientName" className="leading-tight">{t.audit.client_name_label}</Label>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <Input
                      id="clientName"
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder={t.audit.client_name_placeholder}
                      className="pl-9 h-11"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="min-h-[3rem] flex items-end pb-1.5">
                    <Label htmlFor="clientEmail" className="leading-tight">{t.audit.client_email_label}</Label>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder={t.audit.client_email_placeholder}
                      className="pl-9 h-11"
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 -mt-1">
                The completed report will be emailed to your client. Leave blank to skip.
              </p>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Language */}
              {languagesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-11 w-full rounded-lg" />
                </div>
              ) : (
                <LanguageSelect
                  label={t.audit.language_label}
                  value={outputLanguage}
                  onChange={setOutputLanguage}
                  options={languages}
                />
              )}

              {/* Error */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="w-full"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t.audit.submitting}
                  </span>
                ) : (
                  t.audit.submit
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Minimal feature hints */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: "⚡", text: "AI-Powered" },
            { icon: "📄", text: "PDF Report" },
            { icon: "🌍", text: "Multi-Language" },
          ].map((item, idx) => (
            <div key={idx} className="text-xs text-gray-400 flex flex-col items-center gap-1">
              <span className="text-base">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
