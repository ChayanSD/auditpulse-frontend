"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { subscriptions, Subscription } from "@/lib/api";
import { fmt } from "@/hooks/useI18n";

const PLAN_KEYS = ["starter", "professional", "agency"] as const;
const POPULAR = "professional";
type PlanKey = typeof PLAN_KEYS[number];

export default function PricingPage() {
  const { t } = useI18n();
  const { loading: authLoading, user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const currentPlan = (subscription?.plan as PlanKey) || null;
  const isTrialing = subscription?.status === "trialing";

  useEffect(() => {
    if (authLoading || !user) return;
    subscriptions.get()
      .then((sub) => {
        const plan = sub.plan as PlanKey;
        if (PLAN_KEYS.includes(plan)) {
          setSubscription(sub);
        } else {
          setSubscription(null);
        }
      })
      .catch(() => {
        setSubscription(null);
      });
  }, [authLoading, user]);

  const orderedPlans = useMemo(() => {
    if (!currentPlan) return PLAN_KEYS;
    return [currentPlan, ...PLAN_KEYS.filter((key) => key !== currentPlan)] as readonly PlanKey[];
  }, [currentPlan]);

  const trialEndLabel = useMemo(() => {
    if (!isTrialing || !subscription?.trial_end) return null;
    const date = new Date(subscription.trial_end).toLocaleDateString();
    return fmt(t.pricing.trial_until, { date });
  }, [isTrialing, subscription?.trial_end, t.pricing.trial_until]);

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
          {orderedPlans.map((planKey) => {
            const plan = t.pricing.plans[planKey];
            const isPopular = planKey === POPULAR;
            const isCurrentPlan = currentPlan === planKey;
            const actionHref = user ? "/settings" : "/register";
            const actionLabel = user ? t.pricing.manage_plan : t.pricing.choose_plan;

            return (
              <div
                key={planKey}
                className={`card relative flex flex-col p-8 ${isCurrentPlan ? "border-2 border-emerald-500 shadow-lg" : isPopular ? "border-2 border-indigo-600 shadow-xl" : ""
                  }`}
              >
                {isCurrentPlan ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    {isTrialing ? t.pricing.trialing_plan : t.pricing.current_plan}
                  </div>
                ) : isPopular ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    POPULAR
                  </div>
                ) : null}

                <h3 className="text-xl font-black text-gray-900">{plan.name}</h3>
                <div className="flex items-baseline gap-1 my-4">
                  <span className="text-4xl font-black text-gray-900">€{plan.price}</span>
                  <span className="text-gray-400">{t.pricing.per_month}</span>
                </div>
                <p className="text-sm font-medium text-indigo-600 mb-6">{plan.audits}</p>
                {isCurrentPlan && isTrialing && trialEndLabel && (
                  <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                    <p className="text-xs font-semibold text-emerald-800">{trialEndLabel}</p>
                    <p className="mt-1 text-xs text-emerald-700">{t.pricing.trial_note}</p>
                  </div>
                )}

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <div className="mt-auto block cursor-default rounded-xl bg-emerald-100 py-3 px-6 text-center font-semibold text-emerald-800">
                    {isTrialing ? t.pricing.trialing_plan : t.pricing.current_plan}
                  </div>
                ) : (
                  <Link
                    href={actionHref}
                    className={`mt-auto block rounded-xl py-3 px-6 text-center font-semibold transition-colors ${isPopular
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                  >
                    {actionLabel}
                  </Link>
                )}
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
