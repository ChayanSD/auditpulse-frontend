"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";
import { Navbar } from "@/components/Navbar";
import { audits, Audit } from "@/lib/api";

function ScoreBadge({ score }: { score?: number }) {
  if (!score) return <span className="text-gray-400 font-mono text-sm">—</span>;
  const color = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-white font-black text-sm ${color}`}>
      {score}
    </span>
  );
}

function StatusBadge({ status }: { status: Audit["status"] }) {
  const { t } = useI18n();
  const styles: Record<string, string> = {
    pending: "bg-gray-100 text-gray-600",
    running: "bg-blue-100 text-blue-700 animate-pulse",
    completed: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {t.audit.status[status]}
    </span>
  );
}

export default function AuditsPage() {
  const { t } = useI18n();
  const [auditList, setAuditList] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    audits.list(page * limit, limit)
      .then(setAuditList)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isLoggedIn />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black text-gray-900">{t.nav.audits}</h1>
          <Link href="/audits/new" className="btn-primary">
            + {t.dashboard.new_audit}
          </Link>
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">{t.common.loading}</div>
          ) : auditList.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">{t.dashboard.no_audits}</p>
              <Link href="/audits/new" className="btn-primary">{t.dashboard.new_audit}</Link>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Score</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client / URL</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Lang</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditList.map((audit) => (
                    <tr key={audit.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <ScoreBadge score={audit.overall_score} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 text-sm">{audit.client_name || audit.url}</div>
                        {audit.client_name && <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{audit.url}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500 uppercase font-medium">{audit.output_language}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={audit.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(audit.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/audits/${audit.id}`} className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
                          {t.audit.view_report} →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {auditList.length === limit && (
                <div className="flex justify-center gap-3 p-4 border-t border-gray-200">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary text-sm py-1.5 px-4">
                    ← Prev
                  </button>
                  <button onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm py-1.5 px-4">
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
