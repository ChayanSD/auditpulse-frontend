"use client";

import { useMemo, useState } from "react";
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
import { subscriptions } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, Zap } from "lucide-react";

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
  const { t, locale } = useI18n();
  const { loading: authLoading, user } = useAuth();

  // Only fetch subscription if user is logged in
  const { data: subData, isLoading: subLoading } = useSubscription(!!user);

  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  // For non-logged in users, show all plans without highlighting any
  const hasActiveLikeStatus =
    subData?.status === "active" ||
    subData?.status === "trialing" ||
    subData?.status === "past_due";
  const subscription =
    user && subData && hasActiveLikeStatus && PLAN_KEYS.includes(subData.plan as PlanKey)
      ? subData
      : null;
  const currentPlan = (subscription?.plan as PlanKey) || null;
  const isTrialing = subscription?.status === "trialing";
  const isActive = subscription?.status === "active";

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

  const handleCheckout = async (planKey: PlanKey) => {
    if (!user) {
      // Redirect to register if not logged in
      window.location.href = "/register";
      return;
    }

    if (currentPlan && PLAN_KEYS.indexOf(currentPlan) > PLAN_KEYS.indexOf(planKey)) {
      toast.error("Downgrade is available at the end of your current billing period.");
      return;
    }

    setCheckoutLoading(planKey);
    try {
      const baseUrl = window.location.origin;
      const { checkout_url } = await subscriptions.createCheckout(
        planKey,
        `${baseUrl}/settings?success=true`,
        `${baseUrl}/pricing?canceled=true`,
        locale // Pass current application locale
      );

      // Redirect to Stripe Checkout (now always shows payment for upgrades)
      window.location.href = checkout_url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start checkout");
      setCheckoutLoading(null);
    }
  };

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
        {authLoading ? (
          <PricingSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {orderedPlans.map((planKey) => {
              const plan = t.pricing.plans[planKey];
              const isPopular = planKey === POPULAR;
              const isCurrentPlan = currentPlan === planKey;

              const isUpgrade = currentPlan && currentPlan !== planKey;
              const isDowngrade = currentPlan && PLAN_KEYS.indexOf(currentPlan) > PLAN_KEYS.indexOf(planKey);

              return (
                <Card
                  key={planKey}
                  className={cn(
                    "flex flex-col transition-all duration-500 group relative border-2",
                    "lg:hover:scale-[1.02] lg:hover:shadow-2xl lg:hover:shadow-indigo-500/10",
                    isCurrentPlan
                      ? "border-emerald-500 shadow-lg ring-4 ring-emerald-500/10"
                      : planKey === "agency"
                        ? "border-indigo-600 shadow-xl bg-gradient-to-b from-indigo-50/20 to-white"
                        : isPopular
                          ? "border-indigo-600 shadow-xl bg-gradient-to-b from-indigo-50/20 to-white"
                          : "border-gray-200 lg:hover:border-indigo-300"
                  )}
                >
                  <CardContent className="p-6 sm:p-8 flex flex-col flex-1 relative z-10">
                    {/* Plan badge */}
                    <div className="mb-6 min-h-[32px]">
                      {isCurrentPlan ? (
                        <Badge className="bg-emerald-600 text-white border-0 shadow-sm px-3 py-1">
                          {isTrialing
                            ? t.pricing.trialing_plan
                            : t.pricing.current_plan}
                        </Badge>
                      ) : planKey === "agency" ? (
                        <Badge className="bg-indigo-600 text-white border-0 shadow-sm px-4 py-1">
                          {t.pricing.plans.agency.badge || "TOP PLAN"}
                        </Badge>
                      ) : isPopular ? (
                        <Badge className="bg-indigo-600 text-white border-0 shadow-sm px-4 py-1 animate-pulse">
                          POPULAR
                        </Badge>
                      ) : (
                        <div className="h-[28px]" />
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>

                    <div className="flex items-baseline gap-1 my-4">
                      <span className="text-5xl font-extrabold text-gray-900 tracking-tight">
                        €{plan.price}
                      </span>
                      <span className="text-gray-500 font-medium">
                        {t.pricing.per_month}
                      </span>
                    </div>

                    <div className="mb-8">
                      <Badge
                        variant="secondary"
                        className="bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-1 text-xs font-semibold"
                      >
                        {plan.audits}
                      </Badge>
                    </div>

                    {/* Trial info */}
                    {isCurrentPlan && isTrialing && trialEndLabel && (
                      <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 backdrop-blur-sm">
                        <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                          Trial Active
                        </p>
                        <p className="text-sm text-emerald-700 leading-relaxed font-medium">
                          {trialEndLabel}. {t.pricing.trial_note}
                        </p>
                      </div>
                    )}

                    <Separator className="mb-8 opacity-50" />

                    {/* Features */}
                    <ul className="space-y-4 mb-10 flex-1">
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-sm text-gray-600 leading-snug"
                        >
                          <div className="mt-0.5 rounded-full bg-emerald-100 p-0.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          </div>
                          <span className="font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Action button */}
                    <div className="mt-auto pt-4">
                      {isCurrentPlan ? (
                        <Button
                          variant="ghost"
                          className="w-full cursor-default bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 font-bold h-12"
                          disabled
                        >
                          {isTrialing
                            ? t.pricing.trialing_plan
                            : t.pricing.current_plan}
                        </Button>
                      ) : (
                        <Button
                          variant={isPopular ? "default" : "outline"}
                          className={cn(
                            "w-full h-12 font-bold transition-all duration-300",
                            isPopular
                              ? "bg-indigo-600 lg:hover:bg-indigo-700 shadow-lg shadow-indigo-200 scale-100 lg:hover:scale-[1.05]"
                              : "border-gray-200 lg:hover:border-indigo-600 lg:hover:text-white lg:group-hover:bg-indigo-600 lg:group-hover:text-white lg:group-hover:border-indigo-600 lg:group-hover:shadow-lg lg:group-hover:shadow-indigo-200"
                          )}
                          size="lg"
                          onClick={() => handleCheckout(planKey)}
                          disabled={!!checkoutLoading || !!isDowngrade}
                        >
                          {checkoutLoading === planKey ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="animate-spin h-4 w-4" />
                              Processing...
                            </span>
                          ) : !user ? (
                            t.pricing.choose_plan
                          ) : isUpgrade ? (
                            "Upgrade"
                          ) : isDowngrade ? (
                            "Downgrade (Period end)"
                          ) : (
                            t.pricing.choose_plan
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>

                  {/* Aesthetic Background Accents for Popular Plan */}
                  {isPopular && (
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none overflow-hidden h-full w-full">
                      <Zap className="h-full w-full text-indigo-600 transform translate-x-1/2 -translate-y-1/2 scale-150" />
                    </div>
                  )}
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
