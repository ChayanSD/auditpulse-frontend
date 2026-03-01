"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { audits, AuditDetail } from "@/lib/api";

function ScoreRing({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="text-center">
      <div className="relative inline-flex">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${(score / 100) * 201} 201`}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-black" style={{ color }}>
          {score}
        </span>
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

export default function AuditDetailPage() {
  const { t } = useI18n();
  const { loading: authLoading } = useAuth();
  const params = useParams();
  const id = params.id as string;

  const [audit, setAudit] = useState<AuditDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    const load = async () => {
      try {
        const data = await audits.get(id);
        setAudit(data);
        // Poll while running
        if (data.status === "pending" || data.status === "running") {
          setTimeout(load, 4000);
        }
      } catch {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, authLoading]);

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex items-center justify-center h-96 text-gray-400">{t.common.loading}</div>
    </div>;
  }

  if (!audit) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-500">{t.common.error}</div>
    </div>
  );

  const isRunning = audit.status === "pending" || audit.status === "running";
  const canDownload = !!audit.pdf_url && !downloading;

  const handleDownload = async () => {
    if (!audit) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const { blob, filename } = await audits.downloadPdf(audit.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Download failed";
      setDownloadError(message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-700 mb-2 inline-block">
              ← {t.common.back}
            </Link>
            <h1 className="text-2xl font-black text-gray-900">{audit.client_name || audit.url}</h1>
            <p className="text-gray-500 text-sm mt-1">{audit.url}</p>
          </div>
          {audit.pdf_url && (
            <button
              type="button"
              onClick={handleDownload}
              className="btn-secondary"
              disabled={!canDownload}
            >
              {downloading ? `${t.common.loading}...` : `↓ ${t.audit.download_pdf}`}
            </button>
          )}
        </div>
        {downloadError && (
          <div className="text-sm text-red-600 mb-6">{downloadError}</div>
        )}

        {isRunning && (
          <div className="card p-8 text-center mb-8">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-semibold text-gray-900">{t.audit.status[audit.status]}</p>
            <p className="text-sm text-gray-500 mt-1">This usually takes 30–60 seconds</p>
          </div>
        )}

        {audit.status === "completed" && audit.overall_score !== undefined && (
          <>
            {/* Score cards */}
            <div className="card p-8 mb-6">
              <div className="flex flex-wrap items-center gap-8 justify-center">
                <ScoreRing score={audit.overall_score} label={t.audit.score} />
                {audit.technical_score !== undefined && <ScoreRing score={audit.technical_score} label={t.audit.sections.technical} />}
                {audit.on_page_score !== undefined && <ScoreRing score={audit.on_page_score} label={t.audit.sections.on_page} />}
                {audit.performance_score !== undefined && <ScoreRing score={audit.performance_score} label={t.audit.sections.performance} />}
                {audit.mobile_score !== undefined && <ScoreRing score={audit.mobile_score} label={t.audit.sections.mobile} />}
                {audit.security_score !== undefined && <ScoreRing score={audit.security_score} label={t.audit.sections.security} />}
              </div>
            </div>

            {/* Executive summary */}
            {audit.ai_recommendations?.executive_summary && (
              <div className="card p-6 mb-6 border-l-4 border-indigo-500">
                <h2 className="font-bold text-gray-900 mb-2">Executive Summary</h2>
                <p className="text-gray-600 leading-relaxed">{audit.ai_recommendations.executive_summary}</p>
              </div>
            )}

            {/* Priority Recommendations */}
            {audit.ai_recommendations?.priority_recommendations && audit.ai_recommendations.priority_recommendations.length > 0 && (
              <div className="card p-6 mb-6">
                <h2 className="font-bold text-gray-900 mb-4">Priority Recommendations</h2>
                <div className="space-y-3">
                  {audit.ai_recommendations.priority_recommendations.map((rec, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-gray-900">{rec.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rec.impact === "high" ? "badge-critical" : rec.impact === "medium" ? "badge-warning" : "badge-info"
                          }`}>
                          {rec.impact}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {audit.status === "failed" && (
          <div className="card p-8 text-center border-red-200">
            <p className="text-red-600 font-semibold">Audit failed</p>
            {audit.error_message && <p className="text-sm text-gray-500 mt-1">{audit.error_message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
