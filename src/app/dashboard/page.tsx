"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";
import { Navbar } from "@/components/Navbar";
import { audits, subscriptions, Audit, Subscription } from "@/lib/api";

function ScoreBadge({ score }: { score?: number }) {
  if (!score) return <span className="text-gray-400">—</span>;
  const color = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-black text-sm ${color}`}>
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

export default function DashboardPage() {
  const { t } = useI18n();
  const [auditList, setAuditList] = useState<Audit[]>([]);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([audits.list(), subscriptions.get()])
      .then(([list, s]) => { setAuditList(list); setSub(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isLoggedIn />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">{t.dashboard.title}</h1>
          </div>
          <Link href="/audits/new" className="btn-primary">
            + {t.dashboard.new_audit}
          </Link>
        </div>

        {/* Stats */}
        {sub && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card p-5">
              <div className="text-2xl font-black text-gray-900">{auditList.length}</div>
              <div className="text-sm text-gray-500 mt-1">{t.dashboard.stats.total_audits}</div>
            </div>
            <div className="card p-5">
              <div className="text-2xl font-black text-gray-900">
                {auditList.filter(a => a.overall_score).length > 0
                  ? Math.round(auditList.filter(a => a.overall_score).reduce((acc, a) => acc + (a.overall_score || 0), 0) / auditList.filter(a => a.overall_score).length)
                  : "—"}
              </div>
              <div className="text-sm text-gray-500 mt-1">{t.dashboard.stats.avg_score}</div>
            </div>
            <div className="card p-5">
              <div className="text-2xl font-black text-indigo-600">
                {sub.audits_used_this_month} <span className="text-gray-400 font-normal text-base">{t.dashboard.of} {sub.audits_per_month}</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">{t.dashboard.audits_used}</div>
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full">
                <div
                  className="h-1.5 bg-indigo-600 rounded-full"
                  style={{ width: `${Math.min(100, (sub.audits_used_this_month / sub.audits_per_month) * 100)}%` }}
                />
              </div>
            </div>
            <div className="card p-5">
              <div className="text-2xl font-black text-emerald-600">{sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)}</div>
              <div className="text-sm text-gray-500 mt-1 capitalize">{sub.status}</div>
            </div>
          </div>
        )}

        {/* Audit list */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">{t.dashboard.recent_audits}</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">{t.common.loading}</div>
          ) : auditList.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">{t.dashboard.no_audits}</p>
              <Link href="/audits/new" className="btn-primary">
                {t.dashboard.new_audit}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {auditList.map((audit) => (
                <div key={audit.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <ScoreBadge score={audit.overall_score} />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{audit.client_name || audit.url}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{audit.url}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400 uppercase font-medium">{audit.output_language}</span>
                    <StatusBadge status={audit.status} />
                    <Link href={`/audits/${audit.id}`} className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
                      {t.audit.view_report} →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
