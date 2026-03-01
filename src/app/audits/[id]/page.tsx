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
            <button type="button" onClick={handleDownload} className="btn-secondary" disabled={!canDownload}>
              {downloading ? `${t.common.loading}...` : `↓ ${t.audit.download_pdf}`}
            </button>
          )}
        </div>
        {downloadError && <div className="text-sm text-red-600 mb-6">{downloadError}</div>}

        {isRunning && (
          <div className="card p-8 text-center mb-8">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-semibold text-gray-900">{t.audit.status[audit.status]}</p>
            <p className="text-sm text-gray-500 mt-1">This usually takes 30–60 seconds</p>
          </div>
        )}

        {audit.status === "completed" && audit.overall_score !== undefined && (
          <>
            {/* Score rings */}
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

            {/* Executive Summary */}
            {audit.ai_recommendations?.executive_summary && (
              <div className="card p-6 mb-6 border-l-4 border-indigo-500">
                <h2 className="font-bold text-gray-900 mb-3 text-lg">Executive Summary</h2>
                <div className="space-y-3">
                  {audit.ai_recommendations.executive_summary.split("\n\n").filter(Boolean).map((p, i) => (
                    <p key={i} className="text-gray-700 leading-relaxed text-sm">{p.trim()}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Business Impact */}
            {audit.ai_recommendations?.business_impact && (
              <div className="mb-6 rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #312e81 100%)" }}>
                <div className="p-6 text-white">
                  <h2 className="font-bold text-lg mb-2">Business Impact Analysis</h2>
                  <p className="text-indigo-200 text-sm mb-4">{audit.ai_recommendations.business_impact.headline}</p>
                  <p className="text-white/80 text-sm mb-5">{audit.ai_recommendations.business_impact.traffic_opportunity}</p>
                  {audit.ai_recommendations.business_impact.priority_issue_impact && (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Priority Issue", val: audit.ai_recommendations.business_impact.priority_issue_impact.issue },
                        { label: "If Left Unfixed", val: audit.ai_recommendations.business_impact.priority_issue_impact.consequence },
                        { label: "Expected Improvement", val: audit.ai_recommendations.business_impact.priority_issue_impact.fix_impact },
                      ].map(({ label, val }) => (
                        <div key={label} className="bg-white/10 rounded-lg p-3">
                          <div className="text-xs text-white/60 uppercase mb-1">{label}</div>
                          <div className="text-sm text-white">{val}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Wins */}
            {audit.ai_recommendations?.quick_wins && audit.ai_recommendations.quick_wins.length > 0 && (
              <div className="mb-6">
                <h2 className="font-bold text-gray-900 mb-4 text-lg">⚡ Quick Wins</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {audit.ai_recommendations.quick_wins.map((qw, i) => (
                    <div key={i} className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <div className="font-bold text-sm text-emerald-800 mb-2">{qw.title}</div>
                      <p className="text-sm text-gray-700 mb-3 leading-relaxed">{qw.what_to_do}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>⏱ {qw.time_to_implement}</span>
                        <span className="text-emerald-700 font-medium">{qw.expected_impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Priority Recommendations */}
            {audit.ai_recommendations?.priority_recommendations && audit.ai_recommendations.priority_recommendations.length > 0 && (
              <div className="mb-6">
                <h2 className="font-bold text-gray-900 mb-4 text-lg">Priority Recommendations</h2>
                <div className="space-y-3">
                  {audit.ai_recommendations.priority_recommendations.map((rec, i) => (
                    <div key={i} className={`card p-5 border-l-4 ${rec.impact === "high" ? "border-red-500" : rec.impact === "medium" ? "border-amber-400" : "border-emerald-500"}`}>
                      <div className="flex items-start justify-between mb-2 gap-3">
                        <span className="font-semibold text-sm text-gray-900 flex-1">{rec.title}</span>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${rec.impact === "high" ? "bg-red-100 text-red-800" : rec.impact === "medium" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                            {rec.impact.toUpperCase()}
                          </span>
                          {rec.estimated_time && <span className="text-xs text-gray-500 self-center">⏱ {rec.estimated_time}</span>}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-2">{rec.description}</p>
                      {rec.suggested_copy && rec.suggested_copy !== "null" && (
                        <div className="bg-indigo-50 border border-indigo-200 border-l-4 border-l-indigo-500 rounded-r-lg p-3 mt-3">
                          <div className="text-xs font-bold text-indigo-600 uppercase mb-1">Suggested Copy</div>
                          <div className="text-sm text-gray-800 italic">{rec.suggested_copy}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keyword Opportunities */}
            {audit.ai_recommendations?.keyword_opportunities && audit.ai_recommendations.keyword_opportunities.length > 0 && (
              <div className="card mb-6 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 text-lg">Keyword Opportunities</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Keyword</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Est. Volume</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Difficulty</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {audit.ai_recommendations.keyword_opportunities.map((kw, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-3">
                            <div className="font-semibold text-gray-900">{kw.keyword}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{kw.rationale}</div>
                          </td>
                          <td className="px-6 py-3 text-gray-600">{kw.monthly_searches}</td>
                          <td className="px-6 py-3">
                            <span className={`text-xs font-semibold ${kw.difficulty === "low" ? "text-emerald-600" : kw.difficulty === "medium" ? "text-amber-600" : "text-red-600"}`}>
                              {kw.difficulty.charAt(0).toUpperCase() + kw.difficulty.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-xs text-gray-600">{kw.recommended_action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Content Recommendations */}
            {audit.ai_recommendations?.content_recommendations && audit.ai_recommendations.content_recommendations.length > 0 && (
              <div className="mb-6">
                <h2 className="font-bold text-gray-900 mb-4 text-lg">Content Recommendations</h2>
                <div className="space-y-3">
                  {audit.ai_recommendations.content_recommendations.map((cr, i) => (
                    <div key={i} className="card p-5">
                      <div className="font-semibold text-gray-900 mb-3">{cr.title}</div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs font-bold text-gray-500 uppercase mb-1">Current State</div>
                          <div className="text-sm text-gray-700">{cr.current_state}</div>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-3">
                          <div className="text-xs font-bold text-indigo-600 uppercase mb-1">SEO Benefit</div>
                          <div className="text-sm text-gray-700">{cr.seo_benefit}</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{cr.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitive Context */}
            {audit.ai_recommendations?.competitive_context && audit.ai_recommendations.competitive_context.length > 10 && (
              <div className="card p-6 mb-6 border-l-4 border-violet-500">
                <h2 className="font-bold text-gray-900 mb-3 text-lg">Competitive Context</h2>
                <div className="space-y-3">
                  {audit.ai_recommendations.competitive_context.split("\n\n").filter(Boolean).map((p, i) => (
                    <p key={i} className="text-sm text-gray-700 leading-relaxed">{p.trim()}</p>
                  ))}
                </div>
              </div>
            )}

            {/* 30-Day Action Plan */}
            {audit.ai_recommendations?.action_plan && (
              <div className="mb-6">
                <h2 className="font-bold text-gray-900 mb-4 text-lg">30-Day Action Plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(["week_1", "week_2", "week_3", "week_4"] as const).map((wk, i) => {
                    const week = audit.ai_recommendations?.action_plan?.[wk];
                    if (!week) return null;
                    return (
                      <div key={wk} className="card overflow-hidden">
                        <div className="bg-indigo-600 px-4 py-3 flex justify-between items-center">
                          <span className="text-white font-bold text-sm">Week {i + 1}</span>
                          <span className="text-indigo-200 text-xs italic">{week.focus}</span>
                        </div>
                        <ul className="p-4 space-y-2">
                          {week.tasks.map((task, ti) => (
                            <li key={ti} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-indigo-500 font-bold mt-0.5 flex-shrink-0">→</span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Long-Term Strategy */}
            {audit.ai_recommendations?.long_term_strategy && audit.ai_recommendations.long_term_strategy.length > 10 && (
              <div className="rounded-xl p-6 mb-6" style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)", border: "1px solid #c7d2fe" }}>
                <h2 className="font-bold text-gray-900 mb-4 text-lg">Long-Term SEO Strategy</h2>
                <div className="space-y-3">
                  {audit.ai_recommendations.long_term_strategy.split("\n\n").filter(Boolean).map((p, i) => (
                    <p key={i} className="text-sm text-gray-700 leading-relaxed">{p.trim()}</p>
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
