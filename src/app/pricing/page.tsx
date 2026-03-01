"use client";

import { useI18n } from "@/hooks/useI18n";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

const PLAN_KEYS = ["starter", "professional", "agency"] as const;
const POPULAR = "professional";

export default function PricingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-black text-gray-900 mb-4">{t.pricing.title}</h1>
          <p className="text-xl text-gray-500">{t.pricing.subtitle}</p>
        </div>

        {/* Beta offer banner */}
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl px-6 py-4 text-center mb-10">
          <p className="text-indigo-800 font-semibold">{t.pricing.beta_offer}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLAN_KEYS.map((planKey) => {
            const plan = t.pricing.plans[planKey];
            const isPopular = planKey === POPULAR;

            return (
              <div
                key={planKey}
                className={`card p-8 relative ${isPopular ? "border-2 border-indigo-600 shadow-xl" : ""
                  }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    POPULAR
                  </div>
                )}

                <h3 className="text-xl font-black text-gray-900">{plan.name}</h3>
                <div className="flex items-baseline gap-1 my-4">
                  <span className="text-4xl font-black text-gray-900">€{plan.price}</span>
                  <span className="text-gray-400">{t.pricing.per_month}</span>
                </div>
                <p className="text-sm font-medium text-indigo-600 mb-6">{plan.audits}</p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`block text-center py-3 px-6 rounded-xl font-semibold transition-colors ${isPopular
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                >
                  {t.pricing.choose_plan}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          All prices in EUR. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
