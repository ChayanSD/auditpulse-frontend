"use client";

import { useMemo } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { fmt } from "@/hooks/useI18n";
import { useSubscription } from "@/hooks/queries/useSubscriptions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const PLAN_KEYS = ["starter", "professional", "agency"] as const;
const POPULAR = "professional";
type PlanKey = (typeof PLAN_KEYS)[number];

function PricingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[0, 1, 2].map((i) => (
        <Card key={i} className="flex flex-col p-8">
          <Skeleton className="h-6 w-32 rounded mb-4" />
          <Skeleton className="h-10 w-24 rounded mb-2" />
          <Skeleton className="h-4 w-40 rounded mb-6" />
          <div className="space-y-3 mb-8">
            {[0, 1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-4 w-full rounded" />
            ))}
          </div>
          <Skeleton className="h-11 w-full rounded-lg mt-auto" />
        </Card>
      ))}
    </div>
  );
}

export default function PricingPage() {
  const { t } = useI18n();
  const { loading: authLoading, user } = useAuth();
  const { data: subData, isLoading: subLoading } = useSubscription(
    !authLoading && !!user
  );

  const subscription =
    subData && PLAN_KEYS.includes(subData.plan as PlanKey) ? subData : null;
  const currentPlan = (subscription?.plan as PlanKey) || null;
  const isTrialing = subscription?.status === "trialing";

  const orderedPlans = useMemo(() => {
    if (!currentPlan) return PLAN_KEYS;
    return [
      currentPlan,
      ...PLAN_KEYS.filter((key) => key !== currentPlan),
    ] as readonly PlanKey[];
  }, [currentPlan]);

  const trialEndLabel = useMemo(() => {
    if (!isTrialing || !subscription?.trial_end) return null;
    const date = new Date(subscription.trial_end).toLocaleDateString();
    return fmt(t.pricing.trial_until, { date });
  }, [isTrialing, subscription?.trial_end, t.pricing.trial_until]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Hero header */}
        <div className="text-center mb-12 sm:mb-14">
          <Badge
            variant="outline"
            className="mb-4 bg-indigo-50 text-indigo-700 border-indigo-200"
          >
            {t.pricing.beta_offer.replace("🎉 ", "")}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
            {t.pricing.title}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.pricing.subtitle}
          </p>
        </div>

        {/* Plans */}
        {authLoading || subLoading ? (
          <PricingSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {orderedPlans.map((planKey) => {
              const plan = t.pricing.plans[planKey];
              const isPopular = planKey === POPULAR;
              const isCurrentPlan = currentPlan === planKey;
              const actionHref = user ? "/settings" : "/register";
              const actionLabel = user
                ? t.pricing.manage_plan
                : t.pricing.choose_plan;

              return (
                <Card
                  key={planKey}
                  className={`flex flex-col transition-shadow ${isCurrentPlan
                      ? "border-2 border-emerald-500 shadow-lg"
                      : isPopular
                        ? "border-2 border-indigo-600 shadow-xl"
                        : "hover:shadow-md"
                    }`}
                >
                  <CardContent className="p-6 sm:p-8 flex flex-col flex-1">
                    {/* Plan badge - inline, not absolute */}
                    <div className="mb-4 min-h-[28px]">
                      {isCurrentPlan ? (
                        <Badge className="bg-emerald-600 text-white border-0 shadow-sm">
                          {isTrialing
                            ? t.pricing.trialing_plan
                            : t.pricing.current_plan}
                        </Badge>
                      ) : isPopular ? (
                        <Badge className="bg-indigo-600 text-white border-0 shadow-sm">
                          POPULAR
                        </Badge>
                      ) : (
                        <div className="h-[22px]" />
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900">
                      {plan.name}
                    </h3>

                    <div className="flex items-baseline gap-1 my-4">
                      <span className="text-4xl font-bold text-gray-900">
                        €{plan.price}
                      </span>
                      <span className="text-muted-foreground">
                        {t.pricing.per_month}
                      </span>
                    </div>

                    <Badge
                      variant="outline"
                      className="w-fit bg-indigo-50 text-indigo-700 border-indigo-200 mb-6"
                    >
                      {plan.audits}
                    </Badge>

                    {/* Trial info */}
                    {isCurrentPlan && isTrialing && trialEndLabel && (
                      <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                        <p className="text-xs font-semibold text-emerald-800">
                          {trialEndLabel}
                        </p>
                        <p className="mt-1 text-xs text-emerald-700">
                          {t.pricing.trial_note}
                        </p>
                      </div>
                    )}

                    <Separator className="mb-6" />

                    {/* Features */}
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-sm text-gray-600"
                        >
                          <svg
                            className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m4.5 12.75 6 6 9-13.5"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Action button */}
                    {isCurrentPlan ? (
                      <Button
                        variant="outline"
                        className="w-full cursor-default bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                        disabled
                      >
                        {isTrialing
                          ? t.pricing.trialing_plan
                          : t.pricing.current_plan}
                      </Button>
                    ) : (
                      <Button
                        asChild
                        variant={isPopular ? "default" : "outline"}
                        className="w-full"
                        size="lg"
                      >
                        <Link href={actionHref}>{actionLabel}</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-8">
          All prices in EUR. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
