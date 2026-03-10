"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * REFINED DEMO FLOW:
 * This page now redirects immediately to the live audit creation form in demo mode.
 * The original interactive tour design is preserved below in a separate function to avoid syntax errors.
 */
export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/audits/new?mode=demo");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Redirecting to demo audit...</p>
      </div>
    </div>
  );
}

// --- Archived Demo Tour Code (Commented out) ---
/*
import { useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, CheckCircle2, Zap, BarChart3, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n, fmt } from "@/hooks/useI18n";
import { useAuth } from "@/context/AuthContext";

const STEP_ICONS = [
  <Zap className="w-5 h-5 text-indigo-600" />,
  <BarChart3 className="w-5 h-5 text-indigo-600" />,
  <ShieldCheck className="w-5 h-5 text-indigo-600" />
];

const STEP_IMAGES = [
  "/new_audit_form.png",
  "/analysis_loading_page.png",
  "/summary_page.png"
];

function OldDemoPageUI() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = t.demo.steps.map((step, idx) => ({
    ...step,
    image: STEP_IMAGES[idx],
    icon: STEP_ICONS[idx]
  }));

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      router.push(user ? "/audits/new" : "/audits/new?mode=demo");
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 py-12 gap-16 items-center">
        <div className="flex-1">
          <div className="space-y-6 animate-in fade-in duration-500">
             <h1 className="text-4xl font-bold">{steps[currentStep].title}</h1>
             <p className="text-lg text-gray-600">{steps[currentStep].description}</p>
             <div className="flex gap-4">
               <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>Back</Button>
               <Button onClick={nextStep}>{currentStep === steps.length - 1 ? "Finish" : "Next"}</Button>
             </div>
          </div>
        </div>
        <div className="flex-1 relative h-[400px]">
           <Image src={steps[currentStep].image} alt="Step Image" fill className="object-contain" />
        </div>
      </main>
    </div>
  );
}
*/
