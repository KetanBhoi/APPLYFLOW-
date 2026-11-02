import React from 'react';
import { Sparkles, CheckCircle, ArrowRight, ShieldCheck, FileText, X } from 'lucide-react';

interface WelcomeBannerProps {
  onDismiss: () => void;
  onTrySample: () => void;
  onOpenRules: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  onDismiss,
  onTrySample,
  onOpenRules,
}) => {
  return (
    <div className="bg-white text-stone-900 rounded-3xl p-6 mb-8 border border-[#EBE8E3] shadow-xs relative overflow-hidden">
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
        title="Dismiss welcome banner"
        aria-label="Dismiss banner"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="max-w-4xl relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#0F4A3E] text-xs font-semibold tracking-wide uppercase mb-3 border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-[#0F4A3E]" />
          First Time Here? Quick Start Guide
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-stone-900 mb-2">
          Automate repetitive job search busywork in 3 steps
        </h2>

        <p className="text-stone-600 text-sm sm:text-base mb-6 max-w-2xl leading-relaxed">
          Stop manually retyping resume bullets, guessing interview questions, and losing track of follow-ups across messy spreadsheets. ApplyFlow applies your <strong>Permanent Standing Rules</strong> to every application automatically.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#FAF9F7] border border-stone-200 rounded-2xl p-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#0F4A3E] border border-emerald-300 flex items-center justify-center font-bold text-xs mb-2">
              1
            </div>
            <h4 className="font-serif font-bold text-stone-900 text-sm mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0F4A3E]" />
              Set Standing Rules
            </h4>
            <p className="text-stone-600 text-xs leading-relaxed">
              Lock in permanent rules: zero buzzwords, sub-150-word emails, strict XYZ metrics formulas.
            </p>
          </div>

          <div className="bg-[#FAF9F7] border border-stone-200 rounded-2xl p-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#0F4A3E] border border-emerald-300 flex items-center justify-center font-bold text-xs mb-2">
              2
            </div>
            <h4 className="font-serif font-bold text-stone-900 text-sm mb-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#0F4A3E]" />
              Paste Any Job Spec
            </h4>
            <p className="text-stone-600 text-xs leading-relaxed">
              Extract core skills, salary ranges, and hidden red flags in 3 seconds flat.
            </p>
          </div>

          <div className="bg-[#FAF9F7] border border-stone-200 rounded-2xl p-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#0F4A3E] border border-emerald-300 flex items-center justify-center font-bold text-xs mb-2">
              3
            </div>
            <h4 className="font-serif font-bold text-stone-900 text-sm mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#0F4A3E]" />
              Generate & Track
            </h4>
            <p className="text-stone-600 text-xs leading-relaxed">
              Get ATS-tailored bullets, custom cold emails, and 5 STAR interview cards synced to your pipeline.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onTrySample}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white font-semibold text-sm transition-all shadow-xs cursor-pointer"
          >
            <span>Scan Sample Posting (Linear)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenRules}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm transition-colors cursor-pointer border border-stone-200"
          >
            <ShieldCheck className="w-4 h-4 text-[#0F4A3E]" />
            <span>View Standing Rules</span>
          </button>

          <button
            onClick={onDismiss}
            className="text-xs text-stone-500 hover:text-stone-800 transition-colors ml-auto underline cursor-pointer"
          >
            Got it, hide this guide
          </button>
        </div>
      </div>
    </div>
  );
};
