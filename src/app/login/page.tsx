"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/api";

export default function LoginPage() {
  const { t } = useI18n();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await auth.login({ username: email, password });
      login(data.access_token, data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.common.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-indigo-600">AuditPulse</Link>
          <h1 className="text-xl font-bold text-gray-900 mt-4">{t.auth.login_title}</h1>
          <p className="text-gray-500 mt-1 text-sm">{t.auth.login_subtitle}</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.auth.email}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.auth.password}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input" />
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? t.common.loading : t.auth.login_button}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t.auth.no_account}{" "}
          <Link href="/register" className="text-indigo-600 font-medium hover:text-indigo-700">{t.auth.sign_up}</Link>
        </p>
      </div>
    </div>
  );
}
