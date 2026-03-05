"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/context/AuthContext";
import { LanguageSelect } from "@/components/LanguageSwitcher";
import { auth, subscriptions, LanguageOption } from "@/lib/api";
import { DEFAULT_REPORT_LANGUAGES, mergeLanguageOptions } from "@/lib/languages";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  minLength,
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700 transition-colors"
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        )}
      </button>
    </div>
  );
}

function RegisterForm() {
  const { t } = useI18n();
  const { login } = useAuth();
  const searchParams = useSearchParams();

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [referralCode, setReferralCode] = useState(
    searchParams.get("ref") || ""
  );
  const [languages, setLanguages] = useState<LanguageOption[]>(
    mergeLanguageOptions([], DEFAULT_REPORT_LANGUAGES)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    subscriptions
      .getLanguages()
      .then((apiLanguages) => {
        const merged = mergeLanguageOptions(apiLanguages, DEFAULT_REPORT_LANGUAGES);
        setLanguages(merged);
        setPreferredLanguage((current) =>
          merged.some((lang) => lang.code === current)
            ? current
            : merged[0]?.code || "en"
        );
      })
      .catch(() => {
        setLanguages(mergeLanguageOptions([], DEFAULT_REPORT_LANGUAGES));
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t.audit.errors.passwords_mismatch);
      return;
    }

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
      login(data.access_token, data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.common.error);
      setLoading(false);
    }
  };

  const passwordsMatch = confirmPassword === "" || password === confirmPassword;

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">{t.auth.full_name}</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName">{t.auth.company_name}</Label>
            <Input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              autoComplete="organization"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t.auth.password}</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            {!passwordsMatch && (
              <p className="text-xs text-red-600">Passwords do not match</p>
            )}
          </div>

          <Separator />

          <LanguageSelect
            label={t.auth.preferred_language}
            value={preferredLanguage}
            onChange={setPreferredLanguage}
            options={languages}
          />
          <div className="space-y-2">
            <Label htmlFor="referralCode">{t.auth.referral_code}</Label>
            <Input
              id="referralCode"
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="XXXXXXXXXXXXXX"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={loading || !passwordsMatch}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t.common.loading}
              </span>
            ) : (
              t.auth.register_button
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RegisterFormFallback() {
  const { t } = useI18n();

  return (
    <Card>
      <CardContent className="p-6 sm:p-8 space-y-4">
        {[t.auth.full_name, t.auth.company_name, t.auth.email, t.auth.password, "Confirm Password", t.auth.preferred_language, t.auth.referral_code].map(
          (label, i) => (
            <div key={i} className="space-y-2">
              <Label>{label}</Label>
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          )
        )}
        <Skeleton className="h-11 w-full rounded-md mt-4" />
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.svg"
              alt="AuditPulse Logo"
              width={150}
              height={24}
              priority
              className="h-6 w-auto mx-auto"
            />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-6">
            {t.auth.register_title}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t.auth.register_subtitle}
          </p>
        </div>

        <Suspense fallback={<RegisterFormFallback />}>
          <RegisterForm />
        </Suspense>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t.auth.have_account}{" "}
          <Link href="/login" className="text-indigo-600 font-medium hover:text-indigo-700">
            {t.auth.sign_in}
          </Link>
        </p>
      </div>
    </div>
  );
}
