"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useI18n, SUPPORTED_LOCALES } from "@/hooks/useI18n";
import { LanguageSelect } from "@/components/LanguageSwitcher";
import { auth, subscriptions, LanguageOption } from "@/lib/api";

function RegisterForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");
  const [languages, setLanguages] = useState<LanguageOption[]>(
    SUPPORTED_LOCALES.map(l => ({ code: l.code, name: l.name }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    subscriptions.getLanguages().then(setLanguages).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await auth.register({
        email,
        password,
        full_name: fullName,
        company_name: companyName,
        preferred_language: preferredLanguage,
        referral_code: referralCode || undefined,
      });
      localStorage.setItem("ap_token", data.access_token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.common.error);
      setLoading(false);
    }
  };

  return (
    <div className="card p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.auth.full_name}</label>
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.auth.company_name}</label>
          <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.auth.email}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.auth.password}</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className="input" />
        </div>
        <LanguageSelect
          label={t.auth.preferred_language}
          value={preferredLanguage}
          onChange={setPreferredLanguage}
          options={languages}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.auth.referral_code}</label>
          <input type="text" value={referralCode} onChange={e => setReferralCode(e.target.value)} className="input" placeholder="XXXXXXXXXXXXXX" />
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
          {loading ? t.common.loading : t.auth.register_button}
        </button>
      </form>
    </div>
  );
}

function RegisterFormFallback() {
  const { t } = useI18n();

  return (
    <div className="card p-8">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.auth.full_name}</label>
          <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.auth.company_name}</label>
          <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.auth.email}</label>
          <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.auth.password}</label>
          <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.auth.preferred_language}</label>
          <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.auth.referral_code}</label>
          <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div className="h-12 bg-gray-100 rounded animate-pulse mt-4"></div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-indigo-600">AuditPulse</Link>
          <h1 className="text-xl font-bold text-gray-900 mt-4">{t.auth.register_title}</h1>
          <p className="text-gray-500 mt-1 text-sm">{t.auth.register_subtitle}</p>
        </div>

        <Suspense fallback={<RegisterFormFallback />}>
          <RegisterForm />
        </Suspense>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t.auth.have_account}{" "}
          <Link href="/login" className="text-indigo-600 font-medium hover:text-indigo-700">{t.auth.sign_in}</Link>
        </p>
      </div>
    </div>
  );
}
