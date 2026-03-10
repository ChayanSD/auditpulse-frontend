"use client";

import { useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, CheckCircle2, Zap, BarChart3, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n, fmt } from "@/hooks/useI18n";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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

export default function DemoPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // Derive steps from translations
  const steps = t.demo.steps.map((step, idx) => ({
    ...step,
    image: STEP_IMAGES[idx],
    icon: STEP_ICONS[idx]
  }));

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step logic
      if (user) {
        router.push("/audits/new");
      } else {
        router.push("/register");
      }
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
      
      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12 gap-8 lg:gap-16 items-start lg:items-center">
        
        {/* Left Side: Text Content */}
        <div className="flex-1 w-full max-w-2xl order-2 lg:order-1">
          <div className="min-h-[500px] sm:min-h-[450px] lg:min-h-[550px] flex flex-col">
            <div 
              key={currentStep}
              className="flex flex-col space-y-6 sm:space-y-8 animate-in fade-in duration-500 fill-mode-both"
            >
              {/* Rock-solid Header & Description Area */}
              <div className="space-y-4 h-[240px] sm:h-[220px] lg:h-[260px] flex flex-col justify-start">
                <div className="inline-flex items-center w-fit gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium">
                  <Zap className="w-4 h-4" />
                  <span>{fmt(t.demo.step_of, { current: currentStep + 1, total: steps.length })}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
                  {steps[currentStep].title}
                </h1>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
                  {steps[currentStep].description}
                </p>
              </div>

              {/* Rock-solid Features Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 h-[100px] sm:h-[80px]">
                {steps[currentStep].features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Fixed Button Area */}
              <div className="flex items-center gap-4 pt-10">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex-1 sm:flex-none gap-2 group transition-all h-12 px-6 border-gray-200 hover:bg-gray-50 bg-white"
                >
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  {t.demo.back}
                </Button>
                <Button
                  size="lg"
                  onClick={nextStep}
                  className="flex-1 sm:flex-none gap-2 group bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all font-semibold h-12 px-8"
                >
                  {currentStep === steps.length - 1 ? t.demo.finish : t.demo.next}
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>

            {/* Progress Indicator - Stable Position */}
            <div className="flex gap-2 pt-12 justify-center lg:justify-start mt-auto">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    currentStep === idx ? "w-12 bg-indigo-600" : "w-4 bg-gray-200 hover:bg-gray-300"
                  )}
                  aria-label={fmt(t.demo.step_of, { current: idx + 1, total: steps.length })}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Image Mockup */}
        <div className="flex-1 w-full lg:h-[600px] relative mt-4 lg:mt-0 shrink-0 order-1 lg:order-2 group">
          <div className="aspect-[4/3] sm:aspect-video lg:aspect-auto lg:h-full w-full">
            <Card 
              key={currentStep}
              className="h-full w-full overflow-hidden border-none shadow-2xl ring-1 ring-gray-200/50 bg-white animate-in fade-in zoom-in-95 duration-700 fill-mode-both"
            >
              <CardContent className="p-0 h-full relative">
                {/* Background Glow Effect */}
                <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-400/10 blur-[100px] rounded-full" />
                <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-400/10 blur-[100px] rounded-full" />
                
                <div className="relative h-full w-full p-4 sm:p-6 lg:p-10 flex items-center justify-center">
                  <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-100 bg-white transition-all duration-700 ease-out lg:group-hover:scale-[1.03] lg:group-hover:shadow-2xl">
                    {/* Skeleton Overlay for transition smoothness */}
                    <div className="absolute inset-0 bg-gray-50/50 animate-pulse transition-opacity duration-1000 opacity-0 group-data-[loading=true]:opacity-100" />
                    
                    <Image
                      src={steps[currentStep].image}
                      alt={steps[currentStep].title}
                      fill
                      className="object-contain p-2 transition-transform duration-700 ease-in-out"
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </main>

      {/* Footer Branding */}
      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">
            {t.demo.footer}
          </p>
        </div>
      </footer>
    </div>
  );
}
