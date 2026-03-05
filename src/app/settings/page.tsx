"use client";

import { useEffect, useState } from "react";
import { useI18n, SupportedLocale } from "@/hooks/useI18n";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { LanguageSelect } from "@/components/LanguageSwitcher";
import { auth } from "@/lib/api";
import { DEFAULT_REPORT_LANGUAGES, mergeLanguageOptions } from "@/lib/languages";
import {
  useSubscription,
  useReferrals,
  useLanguages,
  useCurrentUser,
} from "@/hooks/queries/useSubscriptions";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query";
import { subscriptions } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function SettingsPage() {
  const { t, setLocale } = useI18n();
  const { loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const enabled = !authLoading;

  const { data: userData, isLoading: userLoading } = useCurrentUser(enabled);
  const { data: sub, isLoading: subLoading } = useSubscription(enabled);
  const { data: referrals = [], isLoading: referralsLoading } = useReferrals(enabled);
  const { data: rawLanguages, isLoading: langsLoading } = useLanguages(enabled);

  const languages = rawLanguages
    ? mergeLanguageOptions(rawLanguages, DEFAULT_REPORT_LANGUAGES)
    : DEFAULT_REPORT_LANGUAGES;

  const dataLoading = authLoading || userLoading || subLoading;

  // Controlled fields — seeded from query data once available
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  useEffect(() => {
    if (userData?.preferred_language) {
      setPreferredLanguage(userData.preferred_language);
    }
  }, [userData?.preferred_language]);

  const [referEmail, setReferEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referLoading, setReferLoading] = useState(false);
  const [referError, setReferError] = useState("");

  const handleSaveLanguage = async () => {
    setSaving(true);
    try {
      await auth.updateMe({ preferred_language: preferredLanguage });
      setLocale(preferredLanguage as SupportedLocale);
      toast.success(t.settings.saved);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSaving(false);
    }
  };

  const handleRefer = async (e: React.FormEvent) => {
    e.preventDefault();
    setReferError("");
    setReferLoading(true);
    try {
      await subscriptions.createReferral(referEmail);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.subscriptions.referrals(),
      });
      setReferEmail("");
      toast.success("Referral invitation sent!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.common.error;
      setReferError(msg);
      toast.error(msg);
    } finally {
      setReferLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/register?ref=${code}`
    );
    setCopied(true);
    toast.success("Referral link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const usagePercent = sub
    ? Math.min(100, (sub.audits_used_this_month / sub.audits_per_month) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {t.settings.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account preferences and subscription
          </p>
        </div>

        <Tabs defaultValue="language" className="space-y-6">
          <TabsList className="w-full justify-start h-auto p-1 bg-muted/50">
            <TabsTrigger
              value="language"
              className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              {t.settings.language}
            </TabsTrigger>
            <TabsTrigger
              value="subscription"
              className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              {t.settings.subscription}
            </TabsTrigger>
            <TabsTrigger
              value="referrals"
              className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              {t.settings.referrals}
            </TabsTrigger>
          </TabsList>

          {/* Language Tab */}
          <TabsContent value="language">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t.settings.language}</CardTitle>
                <CardDescription>{t.settings.language_desc}</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                {langsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ) : (
                  <LanguageSelect
                    value={preferredLanguage}
                    onChange={setPreferredLanguage}
                    options={languages}
                  />
                )}
                <div className="flex items-center gap-3 mt-6">
                  <Button
                    onClick={handleSaveLanguage}
                    disabled={saving || langsLoading}
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {t.common.loading}
                      </span>
                    ) : (
                      t.settings.save
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t.settings.subscription}
                </CardTitle>
                <CardDescription>
                  View your current plan details and usage
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                {dataLoading ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32 rounded" />
                        <Skeleton className="h-4 w-20 rounded" />
                      </div>
                      <Skeleton className="h-4 w-40 rounded" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ) : sub ? (
                  <div className="space-y-6">
                    {/* Plan info */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                          <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">
                            {sub.plan} Plan
                          </p>
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 capitalize mt-1"
                          >
                            {sub.status}
                          </Badge>
                        </div>
                      </div>
                      {sub.free_months_remaining > 0 && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          {sub.free_months_remaining} free month(s) remaining
                        </Badge>
                      )}
                    </div>

                    <Separator />

                    {/* Usage */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">
                          Monthly Usage
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {sub.audits_used_this_month} / {sub.audits_per_month}{" "}
                          audits
                        </p>
                      </div>
                      <Progress value={usagePercent} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {Math.round(usagePercent)}% of your monthly quota used
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No active subscription.
                    </p>
                    <Button asChild className="mt-4">
                      <a href="/pricing">View Plans</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t.settings.referrals}</CardTitle>
                <CardDescription>{t.settings.refer_desc}</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                {/* Refer form */}
                <form
                  onSubmit={handleRefer}
                  className="flex flex-col sm:flex-row gap-2 mb-6"
                >
                  <Input
                    type="email"
                    value={referEmail}
                    onChange={(e) => setReferEmail(e.target.value)}
                    placeholder="colleague@agency.com"
                    required
                    className="flex-1"
                  />
                  <Button type="submit" disabled={referLoading}>
                    {referLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {t.common.loading}
                      </span>
                    ) : (
                      t.settings.refer_friend
                    )}
                  </Button>
                </form>

                {referError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{referError}</AlertDescription>
                  </Alert>
                )}

                {/* Referral list */}
                {referralsLoading ? (
                  <div className="space-y-2">
                    {[0, 1].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : referrals.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground font-medium uppercase tracking-wide px-1 mb-2">
                      <span>Email</span>
                      <span>Status</span>
                    </div>
                    {referrals.map((ref) => (
                      <div
                        key={ref.id}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {ref.referred_email}
                          </p>
                          <button
                            type="button"
                            onClick={() => copyCode(ref.referral_code)}
                            className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors"
                          >
                            {copied ? t.settings.copied : t.settings.copy_link}{" "}
                            · {ref.referral_code}
                          </button>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            ref.is_converted
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }
                        >
                          {ref.is_converted ? "Converted ✓" : "Pending"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No referrals yet. Invite a colleague to get started!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
