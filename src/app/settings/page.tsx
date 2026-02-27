"use client";

import { useEffect, useState } from "react";
import { useI18n, SUPPORTED_LOCALES, SupportedLocale } from "@/hooks/useI18n";
import { Navbar } from "@/components/Navbar";
import { LanguageSelect } from "@/components/LanguageSwitcher";
import { auth, subscriptions, Subscription, Referral, LanguageOption } from "@/lib/api";

export default function SettingsPage() {
  const { t, setLocale } = useI18n();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [languages, setLanguages] = useState<LanguageOption[]>(
    SUPPORTED_LOCALES.map(l => ({ code: l.code, name: l.name }))
  );
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [referEmail, setReferEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referLoading, setReferLoading] = useState(false);
  const [referError, setReferError] = useState("");

  useEffect(() => {
    Promise.all([
      auth.me(),
      subscriptions.get(),
      subscriptions.listReferrals(),
      subscriptions.getLanguages(),
    ]).then(([user, s, refs, langs]) => {
      setPreferredLanguage(user.preferred_language);
      setSub(s);
      setReferrals(refs);
      setLanguages(langs);
    }).catch(() => {});
  }, []);

  const handleSaveLanguage = async () => {
    setSaving(true);
    try {
      await auth.updateMe({ preferred_language: preferredLanguage });
      setLocale(preferredLanguage as SupportedLocale);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // silently fail — locale is still updated in UI
    } finally {
      setSaving(false);
    }
  };

  const handleRefer = async (e: React.FormEvent) => {
    e.preventDefault();
    setReferError("");
    setReferLoading(true);
    try {
      const ref = await subscriptions.createReferral(referEmail);
      setReferrals(prev => [ref, ...prev]);
      setReferEmail("");
    } catch (err: unknown) {
      setReferError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setReferLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/register?ref=${code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isLoggedIn />

      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <h1 className="text-2xl font-black text-gray-900">{t.settings.title}</h1>

        {/* Language Preference */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-1">{t.settings.language}</h2>
          <p className="text-sm text-gray-500 mb-4">{t.settings.language_desc}</p>
          <LanguageSelect
            value={preferredLanguage}
            onChange={setPreferredLanguage}
            options={languages}
          />
          <button onClick={handleSaveLanguage} disabled={saving} className="btn-primary mt-4">
            {saved ? t.settings.saved : saving ? t.common.loading : t.settings.save}
          </button>
        </div>

        {/* Subscription */}
        {sub && (
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-4">{t.settings.subscription}</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 capitalize">{sub.plan} Plan</p>
                <p className="text-sm text-gray-500 capitalize">{sub.status}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{sub.audits_used_this_month} / {sub.audits_per_month} audits used</p>
                {sub.free_months_remaining > 0 && (
                  <p className="text-sm text-emerald-600 font-medium">{sub.free_months_remaining} free month(s) remaining</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Referrals */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-1">{t.settings.referrals}</h2>
          <p className="text-sm text-gray-500 mb-4">{t.settings.refer_desc}</p>

          <form onSubmit={handleRefer} className="flex gap-2 mb-4">
            <input
              type="email"
              value={referEmail}
              onChange={e => setReferEmail(e.target.value)}
              placeholder="colleague@agency.com"
              required
              className="input flex-1"
            />
            <button type="submit" disabled={referLoading} className="btn-primary whitespace-nowrap">
              {referLoading ? t.common.loading : t.settings.refer_friend}
            </button>
          </form>
          {referError && <p className="text-sm text-red-600 mb-3">{referError}</p>}

          {referrals.length > 0 && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-xs text-gray-400 font-medium uppercase px-1">
                <span>Email</span>
                <span>Status</span>
              </div>
              {referrals.map(ref => (
                <div key={ref.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ref.referred_email}</p>
                    <button
                      onClick={() => copyCode(ref.referral_code)}
                      className="text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      {copied ? t.settings.copied : t.settings.copy_link} · {ref.referral_code}
                    </button>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    ref.is_converted ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {ref.is_converted ? "Converted ✓" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
