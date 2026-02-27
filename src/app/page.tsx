"use client";

import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";
import { Navbar } from "@/components/Navbar";

export default function HomePage() {
  const { t } = useI18n();
  const features = Object.entries(t.landing.features) as Array<[string, { title: string; desc: string }]>;

  return (
    <div className="min-h-screen bg-white">
      <Navbar isLoggedIn={false} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            {t.landing.badge_trial} · {t.landing.badge_nocard}
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
            {t.landing.hero_title}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              {t.landing.hero_title_highlight}
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.landing.hero_subtitle}
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register" className="btn-primary text-base px-8 py-3">
              {t.landing.cta_start}
            </Link>
            <Link href="/pricing" className="btn-secondary text-base px-8 py-3 !bg-white/10 !text-white !border-white/20 hover:!bg-white/20">
              {t.landing.cta_demo}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-black text-center text-slate-900 mb-3">{t.landing.features_title}</h2>
        <p className="text-center text-gray-500 mb-14 max-w-xl mx-auto">
          {t.landing.hero_subtitle}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(([key, feature]) => (
            <div key={key} className="card p-6 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <FeatureIcon featureKey={key} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-indigo-600 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black mb-4">{t.landing.cta_start}</h2>
          <p className="text-indigo-200 mb-8">{t.landing.badge_trial} · {t.landing.badge_nocard}</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors">
            {t.landing.cta_start} →
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} AuditPulse
      </footer>
    </div>
  );
}

function FeatureIcon({ featureKey }: { featureKey: string }) {
  const icons: Record<string, string> = {
    ai_analysis: "🤖",
    pdf_reports: "📄",
    multilang: "🌍",
    white_label: "✨",
    auto_email: "📧",
    referrals: "🎁",
  };
  return <span className="text-xl">{icons[featureKey] || "⚡"}</span>;
}
