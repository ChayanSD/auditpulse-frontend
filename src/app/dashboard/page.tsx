"use client";

import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Audit } from "@/lib/api";
import { useAuditsCount, useAuditsList } from "@/hooks/queries/useAudits";
import { useSubscription } from "@/hooks/queries/useSubscriptions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

function ScoreBadge({ score }: { score?: number }) {
  if (!score) return <span className="text-muted-foreground">—</span>;
  const color =
    score >= 80
      ? "bg-emerald-500"
      : score >= 50
        ? "bg-amber-500"
        : "bg-red-500";
  return (
    <span
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-black text-sm ${color}`}
    >
      {score}
    </span>
  );
}

function StatusBadge({ status }: { status: Audit["status"] }) {
  const { t } = useI18n();
  const styles: Record<string, string> = {
    pending: "bg-gray-100 text-gray-600 border-gray-200",
    running: "bg-blue-100 text-blue-700 border-blue-200 animate-pulse",
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    failed: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <Badge variant="outline" className={styles[status]}>
      {t.audit.status[status]}
    </Badge>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-8 w-16 rounded mb-2" />
              <Skeleton className="h-4 w-24 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32 rounded" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-3 w-56 rounded" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useI18n();
  const { loading: authLoading } = useAuth();

  // Fetch only the 5 most recent audits for dashboard overview
  const { data: recentAudits = [], isLoading: auditsLoading } = useAuditsList(0, 5, !authLoading);
  const { data: auditsCount, isLoading: auditsCountLoading } = useAuditsCount(!authLoading);
  const { data: sub, isLoading: subLoading } = useSubscription(!authLoading);

  const loading = authLoading || auditsLoading || auditsCountLoading || subLoading;

  const usagePercent = sub
    ? Math.min(100, (sub.audits_used_this_month / sub.audits_per_month) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {t.dashboard.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t.dashboard.welcome}
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/audits/new">+ {t.dashboard.new_audit}</Link>
          </Button>
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Stats Grid */}
            {sub && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {t.dashboard.stats.total_audits}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {auditsCount?.total ?? 0}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {t.dashboard.stats.avg_score}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {recentAudits.filter((a) => a.overall_score).length > 0
                            ? Math.round(
                              recentAudits
                                .filter((a) => a.overall_score)
                                .reduce((acc, a) => acc + (a.overall_score || 0), 0) /
                              recentAudits.filter((a) => a.overall_score).length
                            )
                            : "—"}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t.dashboard.audits_used}
                      </p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <p className="text-2xl font-bold text-indigo-600">
                          {sub.audits_used_this_month}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          {t.dashboard.of} {sub.audits_per_month}
                        </span>
                      </div>
                      <Progress value={usagePercent} className="mt-3 h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Plan
                        </p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1 capitalize">
                          {sub.plan}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 capitalize w-fit"
                      >
                        {sub.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Audits */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    {t.dashboard.recent_audits}
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/audits">{t.nav.audits} →</Link>
                  </Button>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                {recentAudits.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t.dashboard.no_audits}
                    </p>
                    <Button asChild>
                      <Link href="/audits/new">{t.dashboard.new_audit}</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Mobile view */}
                    <div className="divide-y md:hidden">
                      {recentAudits.map((audit) => (
                        <div key={audit.id} className="px-4 py-4">
                          <div className="flex items-start gap-3">
                            <ScoreBadge score={audit.overall_score} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {audit.client_name || audit.url}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {audit.url}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="text-xs uppercase">
                              {audit.output_language}
                            </Badge>
                            <StatusBadge status={audit.status} />
                            <Button variant="link" size="sm" asChild className="ml-auto p-0 h-auto">
                              <Link href={`/audits/${audit.id}`}>
                                {t.audit.view_report} →
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop table view */}
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead className="w-[80px]">Score</TableHead>
                            <TableHead>Client / URL</TableHead>
                            <TableHead className="w-[80px]">Lang</TableHead>
                            <TableHead className="w-[120px]">Status</TableHead>
                            <TableHead className="text-right w-[120px]" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentAudits.map((audit) => (
                            <TableRow key={audit.id}>
                              <TableCell>
                                <ScoreBadge score={audit.overall_score} />
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-gray-900 text-sm">
                                  {audit.client_name || audit.url}
                                </div>
                                {audit.client_name && (
                                  <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">
                                    {audit.url}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs uppercase">
                                  {audit.output_language}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={audit.status} />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="link" size="sm" asChild className="p-0 h-auto">
                                  <Link href={`/audits/${audit.id}`}>
                                    {t.audit.view_report} →
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* View All Audits footer */}
                    <Separator />
                    <div className="flex items-center justify-center py-4">
                      <Button variant="outline" asChild>
                        <Link href="/audits">
                          View All Audits →
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
