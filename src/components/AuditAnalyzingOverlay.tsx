"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

/* ─── Analysis steps shown to the user ──────────────────────────────────── */
const ANALYSIS_STEPS = [
    {
        label: "Connecting to website",
        detail: "Establishing secure connection…",
        icon: "globe",
    },
    {
        label: "Crawling pages & structure",
        detail: "Scanning site architecture & internal links…",
        icon: "spider",
    },
    {
        label: "Analyzing on-page SEO",
        detail: "Evaluating meta tags, headings & content…",
        icon: "search",
    },
    {
        label: "Checking technical health",
        detail: "Inspecting robots.txt, sitemap & schema markup…",
        icon: "wrench",
    },
    {
        label: "Evaluating performance",
        detail: "Measuring speed, Core Web Vitals & mobile UX…",
        icon: "zap",
    },
    {
        label: "Running AI analysis",
        detail: "Claude AI is generating tailored recommendations…",
        icon: "brain",
    },
    {
        label: "Building your report",
        detail: "Compiling results into a professional PDF…",
        icon: "file",
    },
];

/* ─── Step interval timing (ms) ────────────────────────────────────────── */
const STEP_INTERVAL = 4200;

/* ─── Icon components ──────────────────────────────────────────────────── */
function StepIcon({ type, active }: { type: string; active: boolean }) {
    const cls = `w-5 h-5 ${active ? "text-indigo-600" : "text-gray-400"} transition-colors duration-300`;

    switch (type) {
        case "globe":
            return (
                <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
                </svg>
            );
        case "spider":
            return (
                <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            );
        case "search":
            return (
                <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                </svg>
            );
        case "wrench":
            return (
                <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
            );
        case "zap":
            return (
                <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
            );
        case "brain":
            return (
                <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M9.5 2A5.5 5.5 0 0 0 4 7.5c0 1.58.67 3 1.74 4.01L12 18l6.26-6.49A5.49 5.49 0 0 0 20 7.5 5.5 5.5 0 0 0 14.5 2c-1.56 0-2.96.65-3.96 1.7A5.47 5.47 0 0 0 9.5 2zM12 5.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
                    <path d="M12 18v4" />
                </svg>
            );
        case "file":
            return (
                <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                </svg>
            );
        default:
            return null;
    }
}

/* ─── Check icon for completed steps ───────────────────────────────────── */
function CheckIcon() {
    return (
        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );
}

/* ─── Pulse ring animation ─────────────────────────────────────────────── */
function PulseRing() {
    return (
        <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500" />
        </span>
    );
}

/* ─── Main inline component for audit detail page running state ────────── */
interface AuditRunningProgressProps {
    url: string;
    statusLabel: string;
}

export function AuditRunningProgress({ url, statusLabel }: AuditRunningProgressProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);

    /* Advance steps on a timer */
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev < ANALYSIS_STEPS.length - 1) return prev + 1;
                return prev; // stay on last step
            });
        }, STEP_INTERVAL);

        return () => clearInterval(timer);
    }, []);

    /* Smooth progress bar that fills based on current step */
    useEffect(() => {
        const stepProgress = ((currentStep + 1) / ANALYSIS_STEPS.length) * 92;
        setProgress(Math.min(stepProgress, 92));
    }, [currentStep]);

    /* Format URL for display */
    const displayUrl = (() => {
        try {
            const raw = url.trim();
            const normalized =
                raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
            const parsed = new URL(normalized);
            return parsed.hostname + (parsed.pathname !== "/" ? parsed.pathname : "");
        } catch {
            return url;
        }
    })();

    return (
        <Card className="mb-8 border-0 shadow-xl shadow-indigo-100/50 overflow-hidden">
            {/* Top gradient accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

            <CardContent className="p-0">
                {/* ─── Header section with gradient background ────────────── */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-6 sm:px-8 pt-8 pb-6">
                    {/* Background decorative blobs */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-indigo-100 opacity-40 blur-3xl animate-pulse" />
                        <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-violet-100 opacity-40 blur-3xl animate-pulse [animation-delay:1s]" />
                    </div>

                    <div className="relative text-center">
                        {/* Animated radar icon */}
                        <div className="mx-auto mb-4 relative w-16 h-16 flex items-center justify-center">
                            <span className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-20" />
                            <span className="absolute inset-1 rounded-full bg-indigo-50 animate-pulse opacity-40" />
                            <svg
                                className="relative w-8 h-8 text-indigo-600 animate-[spin_3s_linear_infinite]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10"
                                />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6a6 6 0 0 1 6 6" />
                                <circle cx="12" cy="12" r="2" fill="currentColor" />
                            </svg>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                            {statusLabel}
                        </h2>
                        <p className="mt-2 text-sm text-gray-500 font-medium flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span className="truncate max-w-xs">{displayUrl}</span>
                        </p>
                    </div>
                </div>

                {/* ─── Progress bar section ───────────────────────────────── */}
                <div className="px-6 sm:px-8 pt-6 pb-2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Progress
                        </span>
                        <span className="text-xs font-bold text-indigo-600">{Math.round(progress)}%</span>
                    </div>
                    <Progress
                        value={progress}
                        className="h-2.5 bg-gray-100 [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:via-violet-500 [&>div]:to-indigo-600 [&>div]:transition-all [&>div]:duration-700 [&>div]:ease-out"
                    />
                </div>

                {/* ─── Steps list ─────────────────────────────────────────── */}
                <div className="px-6 sm:px-8 py-5 space-y-1">
                    {ANALYSIS_STEPS.map((step, idx) => {
                        const isCompleted = idx < currentStep;
                        const isActive = idx === currentStep;
                        const isPending = idx > currentStep;

                        return (
                            <div
                                key={idx}
                                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-500
                  ${isActive ? "bg-indigo-50/80 border border-indigo-100" : "border border-transparent"}
                  ${isCompleted ? "opacity-100" : ""}
                  ${isPending ? "opacity-40" : ""}
                `}
                            >
                                {/* Status indicator */}
                                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                                    {isCompleted ? (
                                        <div className="animate-[fadeScale_0.3s_ease-out]">
                                            <CheckIcon />
                                        </div>
                                    ) : isActive ? (
                                        <PulseRing />
                                    ) : (
                                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                                    )}
                                </div>

                                {/* Icon */}
                                <div className="flex-shrink-0">
                                    <StepIcon type={step.icon} active={isActive || isCompleted} />
                                </div>

                                {/* Label & detail */}
                                <div className="min-w-0 flex-1">
                                    <p
                                        className={`text-sm font-medium leading-tight ${isActive
                                                ? "text-indigo-700"
                                                : isCompleted
                                                    ? "text-gray-700"
                                                    : "text-gray-400"
                                            }`}
                                    >
                                        {step.label}
                                    </p>
                                    {isActive && (
                                        <p className="text-xs text-indigo-500/80 mt-0.5 animate-[fadeIn_0.4s_ease-out]">
                                            {step.detail}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ─── Footer ─────────────────────────────────────────────── */}
                <div className="px-6 sm:px-8 pb-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-2">
                        <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <p className="text-xs font-medium text-amber-700">
                            Please don&apos;t close this page — your audit is being generated
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
