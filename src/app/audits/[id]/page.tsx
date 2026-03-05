"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { audits } from "@/lib/api";
import { useAuditDetail } from "@/hooks/queries/useAudits";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditRunningProgress } from "@/components/AuditAnalyzingOverlay";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function ScoreRing({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const bgColor = score >= 80 ? "bg-emerald-50" : score >= 50 ? "bg-amber-50" : "bg-red-50";
  return (
    <div className="text-center">
      <div className={`relative inline-flex p-2 rounded-full ${bgColor}`}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${(score / 100) * 201} 201`}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-lg font-black"
          style={{ color }}
        >
          {score}
        </span>
      </div>
      <p className="text-xs font-medium text-muted-foreground mt-2">{label}</p>
    </div>
  );
}

function AuditDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-8 w-64 rounded" />
          <Skeleton className="h-4 w-48 rounded" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* Score rings */}
      <Card className="mb-6">
        <CardContent className="p-8">
          <div className="flex flex-wrap items-center gap-8 justify-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-[96px] w-[96px] rounded-full" />
                <Skeleton className="h-3 w-16 rounded mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs skeleton */}
      <Skeleton className="h-10 w-full max-w-md rounded-lg mb-4" />
      {[1, 2, 3].map((i) => (
        <Card key={i} className="mb-4">
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-16 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AuditDetailPage() {
  const { t } = useI18n();
  const { loading: authLoading } = useAuth();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const { data: audit, isLoading, isError } = useAuditDetail(id, !authLoading);

  const handleDownload = async () => {
    if (!audit) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const { blob, filename } = await audits.downloadPdf(audit.id, audit.url);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Failed to download audit ${audit.id} PDF:`, err);
      setDownloadError(
        err instanceof Error ? err.message : t.audit.errors.download_failed
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.audits.detail(id) });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Navbar />
        <AuditDetailSkeleton />
      </div>
    );
  }

  if (isError || !audit) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Card>
            <CardContent className="p-12">
              <div className="mx-auto h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <p className="text-muted-foreground">{t.common.error}</p>
              <Button variant="outline" className="mt-4" onClick={handleRetry}>
                {t.common.retry}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isRunning = audit.status === "pending" || audit.status === "running";
  const canDownload = !!audit.pdf_url && !downloading;
  const rec = audit.ai_recommendations;

  // Determine which tabs are available
  const availableTabs: { value: string; label: string }[] = [];
  if (rec?.executive_summary || rec?.business_impact) {
    availableTabs.push({ value: "overview", label: t.audit.tabs.overview });
  }
  if (rec?.quick_wins?.length || rec?.priority_recommendations?.length) {
    availableTabs.push({ value: "recommendations", label: t.audit.tabs.recommendations });
  }
  if (rec?.keyword_opportunities?.length || rec?.content_recommendations?.length) {
    availableTabs.push({ value: "content", label: t.audit.tabs.content });
  }
  if (rec?.action_plan || rec?.long_term_strategy) {
    availableTabs.push({ value: "strategy", label: t.audit.tabs.strategy });
  }
  if (rec?.competitive_context && rec.competitive_context.length > 10) {
    availableTabs.push({ value: "competitive", label: t.audit.tabs.competitive });
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
          <div>
            <Button variant="link" asChild className="p-0 h-auto mb-2 text-indigo-600">
              <Link href="/audits">← {t.common.back}</Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {audit.client_name || audit.url}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{audit.url}</p>
          </div>
          {audit.pdf_url && (
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={!canDownload}
            >
              {downloading ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t.common.loading}...
                </>
              ) : (
                <>↓ {t.audit.download_pdf}</>
              )}
            </Button>
          )}
        </div>

        {downloadError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {downloadError}
          </div>
        )}

        {/* Running state — beautiful progress UI */}
        {isRunning && (
          <AuditRunningProgress
            url={audit.url}
            statusLabel={t.audit.status[audit.status]}
          />
        )}

        {/* Completed state */}
        {audit.status === "completed" && audit.overall_score !== undefined && (
          <>
            {/* Score rings */}
            <Card className="mb-6">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-4 sm:gap-8 justify-center">
                  <ScoreRing score={audit.overall_score} label={t.audit.score} />
                  {audit.technical_score !== undefined && (
                    <ScoreRing score={audit.technical_score} label={t.audit.sections.technical} />
                  )}
                  {audit.on_page_score !== undefined && (
                    <ScoreRing score={audit.on_page_score} label={t.audit.sections.on_page} />
                  )}
                  {audit.performance_score !== undefined && (
                    <ScoreRing score={audit.performance_score} label={t.audit.sections.performance} />
                  )}
                  {audit.mobile_score !== undefined && (
                    <ScoreRing score={audit.mobile_score} label={t.audit.sections.mobile} />
                  )}
                  {audit.security_score !== undefined && (
                    <ScoreRing score={audit.security_score} label={t.audit.sections.security} />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tabbed content */}
            {availableTabs.length > 0 && (
              <Tabs defaultValue={availableTabs[0].value} className="space-y-6">
                <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 bg-muted/50">
                  {availableTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="text-sm whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Executive Summary */}
                  {rec?.executive_summary && (
                    <Card className="border-l-4 border-l-indigo-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Executive Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {rec.executive_summary
                            .split("\n\n")
                            .filter(Boolean)
                            .map((p, i) => (
                              <p key={i} className="text-sm text-gray-700 leading-relaxed">
                                {p.trim()}
                              </p>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Business Impact */}
                  {rec?.business_impact && (
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, #1a1a2e 0%, #312e81 100%)",
                      }}
                    >
                      <div className="p-6 text-white">
                        <h2 className="font-bold text-lg mb-2">
                          Business Impact Analysis
                        </h2>
                        <p className="text-indigo-200 text-sm mb-4">
                          {rec.business_impact.headline}
                        </p>
                        <p className="text-white/80 text-sm mb-5">
                          {rec.business_impact.traffic_opportunity}
                        </p>
                        {rec.business_impact.priority_issue_impact && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              {
                                label: "Priority Issue",
                                val: rec.business_impact.priority_issue_impact.issue,
                              },
                              {
                                label: "If Left Unfixed",
                                val: rec.business_impact.priority_issue_impact.consequence,
                              },
                              {
                                label: "Expected Improvement",
                                val: rec.business_impact.priority_issue_impact.fix_impact,
                              },
                            ].map(({ label, val }) => (
                              <div key={label} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                                <div className="text-xs text-white/60 uppercase tracking-wide mb-1">
                                  {label}
                                </div>
                                <div className="text-sm text-white">{val}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Recommendations Tab */}
                <TabsContent value="recommendations" className="space-y-6">
                  {/* Quick Wins */}
                  {rec?.quick_wins && rec.quick_wins.length > 0 && (
                    <div>
                      <h2 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                        <span className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-base">⚡</span>
                        Quick Wins
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {rec.quick_wins.map((qw, i) => (
                          <Card key={i} className="border-emerald-200 bg-emerald-50/50">
                            <CardContent className="p-4">
                              <p className="font-semibold text-sm text-emerald-800 mb-2">
                                {qw.title}
                              </p>
                              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                                {qw.what_to_do}
                              </p>
                              <Separator className="my-3" />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>⏱ {qw.time_to_implement}</span>
                                <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                                  {qw.expected_impact}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Priority Recommendations */}
                  {rec?.priority_recommendations && rec.priority_recommendations.length > 0 && (
                    <div>
                      <h2 className="font-bold text-gray-900 mb-4 text-lg">
                        Priority Recommendations
                      </h2>
                      <div className="space-y-3">
                        {rec.priority_recommendations.map((r, i) => (
                          <Card
                            key={i}
                            className={`border-l-4 ${r.impact === "high"
                              ? "border-l-red-500"
                              : r.impact === "medium"
                                ? "border-l-amber-400"
                                : "border-l-emerald-500"
                              }`}
                          >
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between mb-2 gap-3">
                                <span className="font-semibold text-sm text-gray-900 flex-1">
                                  {r.title}
                                </span>
                                <div className="flex gap-1.5 flex-shrink-0">
                                  <Badge
                                    variant="outline"
                                    className={
                                      r.impact === "high"
                                        ? "bg-red-100 text-red-800 border-red-200"
                                        : r.impact === "medium"
                                          ? "bg-amber-100 text-amber-800 border-amber-200"
                                          : "bg-emerald-100 text-emerald-800 border-emerald-200"
                                    }
                                  >
                                    {r.impact.toUpperCase()}
                                  </Badge>
                                  {r.estimated_time && (
                                    <span className="text-xs text-muted-foreground self-center">
                                      ⏱ {r.estimated_time}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed mb-2">
                                {r.description}
                              </p>
                              {r.suggested_copy && r.suggested_copy !== "null" && (
                                <div className="bg-indigo-50 border border-indigo-200 border-l-4 border-l-indigo-500 rounded-r-lg p-3 mt-3">
                                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">
                                    Suggested Copy
                                  </div>
                                  <div className="text-sm text-gray-800 italic">
                                    {r.suggested_copy}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Content & Keywords Tab */}
                <TabsContent value="content" className="space-y-6">
                  {/* Keyword Opportunities */}
                  {rec?.keyword_opportunities && rec.keyword_opportunities.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">
                          Keyword Opportunities
                        </CardTitle>
                      </CardHeader>
                      <Separator />
                      <CardContent className="p-0">
                        {/* Mobile keyword cards */}
                        <div className="divide-y md:hidden">
                          {rec.keyword_opportunities.map((kw, i) => (
                            <div key={i} className="p-4 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-semibold text-sm text-gray-900">{kw.keyword}</p>
                                <Badge
                                  variant="outline"
                                  className={
                                    kw.difficulty === "low"
                                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                      : kw.difficulty === "medium"
                                        ? "bg-amber-50 text-amber-600 border-amber-200"
                                        : "bg-red-50 text-red-600 border-red-200"
                                  }
                                >
                                  {kw.difficulty}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{kw.rationale}</p>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Vol: {kw.monthly_searches}</span>
                                <span className="text-gray-600">{kw.recommended_action}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Desktop keyword table */}
                        <div className="hidden md:block">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                <TableHead className="pl-6">Keyword</TableHead>
                                <TableHead>Est. Volume</TableHead>
                                <TableHead>Difficulty</TableHead>
                                <TableHead className="pr-6">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {rec.keyword_opportunities.map((kw, i) => (
                                <TableRow key={i}>
                                  <TableCell className="pl-6">
                                    <div className="font-semibold text-gray-900">{kw.keyword}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">{kw.rationale}</div>
                                  </TableCell>
                                  <TableCell className="text-gray-600">{kw.monthly_searches}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className={
                                        kw.difficulty === "low"
                                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                          : kw.difficulty === "medium"
                                            ? "bg-amber-50 text-amber-600 border-amber-200"
                                            : "bg-red-50 text-red-600 border-red-200"
                                      }
                                    >
                                      {kw.difficulty.charAt(0).toUpperCase() + kw.difficulty.slice(1)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-xs text-gray-600 pr-6">
                                    {kw.recommended_action}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Content Recommendations */}
                  {rec?.content_recommendations && rec.content_recommendations.length > 0 && (
                    <div>
                      <h2 className="font-bold text-gray-900 mb-4 text-lg">
                        Content Recommendations
                      </h2>
                      <div className="space-y-3">
                        {rec.content_recommendations.map((cr, i) => (
                          <Card key={i}>
                            <CardContent className="p-5">
                              <p className="font-semibold text-gray-900 mb-3">{cr.title}</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
                                    Current State
                                  </div>
                                  <div className="text-sm text-gray-700">{cr.current_state}</div>
                                </div>
                                <div className="bg-indigo-50 rounded-lg p-3">
                                  <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">
                                    SEO Benefit
                                  </div>
                                  <div className="text-sm text-gray-700">{cr.seo_benefit}</div>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {cr.recommendation}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Strategy Tab */}
                <TabsContent value="strategy" className="space-y-6">
                  {/* 30-Day Action Plan */}
                  {rec?.action_plan && (
                    <div>
                      <h2 className="font-bold text-gray-900 mb-4 text-lg">
                        30-Day Action Plan
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(["week_1", "week_2", "week_3", "week_4"] as const).map(
                          (wk, i) => {
                            const week = rec?.action_plan?.[wk];
                            if (!week) return null;
                            return (
                              <Card key={wk} className="overflow-hidden">
                                <div className="bg-indigo-600 px-4 py-3 flex justify-between items-center">
                                  <span className="text-white font-bold text-sm">
                                    Week {i + 1}
                                  </span>
                                  <Badge className="bg-white/20 text-white border-0 text-xs">
                                    {week.focus}
                                  </Badge>
                                </div>
                                <CardContent className="p-4">
                                  <ul className="space-y-2">
                                    {week.tasks.map((task, ti) => (
                                      <li
                                        key={ti}
                                        className="flex items-start gap-2 text-sm text-gray-700"
                                      >
                                        <span className="text-indigo-500 font-bold mt-0.5 flex-shrink-0">
                                          →
                                        </span>
                                        <span>{task}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                  {/* Long-Term Strategy */}
                  {rec?.long_term_strategy && rec.long_term_strategy.length > 10 && (
                    <Card
                      className="border-indigo-200"
                      style={{
                        background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)",
                      }}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Long-Term SEO Strategy</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {rec.long_term_strategy
                            .split("\n\n")
                            .filter(Boolean)
                            .map((p, i) => (
                              <p key={i} className="text-sm text-gray-700 leading-relaxed">
                                {p.trim()}
                              </p>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Competitive Tab */}
                <TabsContent value="competitive" className="space-y-6">
                  {rec?.competitive_context && rec.competitive_context.length > 10 && (
                    <Card className="border-l-4 border-l-violet-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Competitive Context</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {rec.competitive_context
                            .split("\n\n")
                            .filter(Boolean)
                            .map((p, i) => (
                              <p key={i} className="text-sm text-gray-700 leading-relaxed">
                                {p.trim()}
                              </p>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </>
        )}

        {/* Failed state */}
        {audit.status === "failed" && (
          <Card className="border-red-200">
            <CardContent className="p-8 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <p className="text-red-600 font-semibold">Audit failed</p>
              {audit.error_message && (
                <p className="text-sm text-muted-foreground mt-1">
                  {audit.error_message}
                </p>
              )}
              <Button variant="outline" className="mt-4" onClick={handleRetry}>
                Retry loading
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
