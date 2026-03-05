"use client";

import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { t } = useI18n();
  const features = Object.entries(t.landing.features) as Array<
    [string, { title: string; desc: string }]
  >;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <Badge
            variant="outline"
            className="bg-indigo-500/20 border-indigo-500/30 text-indigo-300 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse mr-2" />
            {t.landing.badge_trial} · {t.landing.badge_nocard}
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            {t.landing.hero_title}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              {t.landing.hero_title_highlight}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.landing.hero_subtitle}
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button asChild size="lg" className="text-base px-8 h-12">
              <Link href="/register">{t.landing.cta_start}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-base px-8 h-12 bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
            >
              <a href="#live-demo">{t.landing.cta_demo}</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="live-demo" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3">
            {t.landing.features_title}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t.landing.hero_subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map(([key, feature]) => (
            <Card
              key={key}
              className="hover:shadow-md transition-shadow border-gray-200"
            >
              <CardContent className="p-6">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  <FeatureIcon featureKey={key} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-indigo-600 text-white py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            {t.landing.cta_start}
          </h2>
          <p className="text-indigo-200 mb-8">
            {t.landing.badge_trial} · {t.landing.badge_nocard}
          </p>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="bg-white text-indigo-600 border-white hover:bg-indigo-50 hover:text-indigo-700 font-semibold text-base px-8 h-12"
          >
            <Link href="/register">{t.landing.cta_start} →</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 text-center text-sm text-muted-foreground">
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
