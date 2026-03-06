"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Audit } from "@/lib/api";
import { useAuditsCount, useAuditsList } from "@/hooks/queries/useAudits";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 10;

function ScoreBadge({ score }: { score?: number }) {
  if (!score)
    return <span className="text-muted-foreground font-mono text-sm">—</span>;
  const color =
    score >= 80
      ? "bg-emerald-500"
      : score >= 50
        ? "bg-amber-500"
        : "bg-red-500";
  return (
    <span
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-white font-black text-sm ${color}`}
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

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Generate page numbers to show
  const pages: (number | "ellipsis")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("ellipsis");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 py-4 px-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 px-3"
      >
        ←
      </Button>
      {pages.map((page, idx) =>
        page === "ellipsis" ? (
          <span key={`e-${idx}`} className="px-2 text-muted-foreground text-sm">
            …
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className="h-8 w-8 p-0"
          >
            {page}
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 px-3"
      >
        →
      </Button>
    </div>
  );
}

function AuditsSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-3 w-56 rounded" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AuditsPage() {
  const { t } = useI18n();
  const { loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  // Fetch paginated audits from backend
  const {
    data: paginatedAudits = [],
    isLoading: auditsLoading,
    isError,
  } = useAuditsList(skip, PAGE_SIZE, !authLoading);
  const { data: auditsCount, isLoading: countLoading } = useAuditsCount(!authLoading);
  const totalAudits = auditsCount?.total ?? 0;

  const loading = authLoading || auditsLoading || countLoading;

  const totalPages = Math.max(1, Math.ceil(totalAudits / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {t.nav.audits}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalAudits > 0
                ? `${totalAudits} audit${totalAudits !== 1 ? "s" : ""} total`
                : "Manage and review all your SEO audits"}
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/audits/new">+ {t.dashboard.new_audit}</Link>
          </Button>
        </div>

        {/* Error */}
        {isError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {t.common.error}
          </div>
        )}

        {loading ? (
          <AuditsSkeleton />
        ) : totalAudits === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {t.dashboard.no_audits}
              </p>
              <Button asChild>
                <Link href="/audits/new">{t.dashboard.new_audit}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            {/* Mobile card view */}
            <div className="divide-y md:hidden">
              {paginatedAudits.map((audit) => (
                <div key={audit.id} className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <ScoreBadge score={audit.overall_score} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {audit.client_name || audit.url}
                      </p>
                      {audit.client_name && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {audit.url}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs uppercase">
                      {audit.output_language}
                    </Badge>
                    <StatusBadge status={audit.status} />
                    <span className="text-xs text-muted-foreground">
                      {new Date(audit.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      variant="link"
                      size="sm"
                      asChild
                      className="ml-auto p-0 h-auto"
                    >
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
                    <TableHead className="w-[80px] pl-6">Score</TableHead>
                    <TableHead>Client / URL</TableHead>
                    <TableHead className="w-[80px]">Lang</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead className="text-right w-[120px] pr-6" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAudits.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell className="pl-6">
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
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(audit.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          variant="link"
                          size="sm"
                          asChild
                          className="p-0 h-auto"
                        >
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

            {/* Pagination */}
            {totalPages > 1 && (
              <>
                <Separator />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
