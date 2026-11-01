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
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 mb-8 border border-indigo-500/30 shadow-xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        title="Dismiss welcome banner"
        aria-label="Dismiss banner"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="max-w-4xl relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-3 border border-indigo-500/30">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          First Time Here? Quick Start Guide
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          Automate repetitive job search busywork in 3 steps
        </h2>

        <p className="text-slate-300 text-sm sm:text-base mb-6 max-w-2xl leading-relaxed">
          Stop manually retyping resume bullets, guessing interview questions, and losing track of follow-ups across messy spreadsheets. ApplyFlow applies your <strong>Permanent Standing Rules</strong> to every application automatically.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs mb-2">
              1
            </div>
            <h4 className="font-semibold text-white text-sm mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Set Standing Rules
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Lock in permanent rules: zero buzzwords, sub-150-word emails, strict XYZ metrics formulas.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="w-7 h-7 rounded-lg bg-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-xs mb-2">
              2
            </div>
            <h4 className="font-semibold text-white text-sm mb-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400" />
              Paste Any Job Spec
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Extract core skills, salary ranges, and hidden red flags in 3 seconds flat.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-xs mb-2">
              3
            </div>
            <h4 className="font-semibold text-white text-sm mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Generate & Track
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Get ATS-tailored bullets, custom cold emails, and 5 STAR interview cards synced to your pipeline.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onTrySample}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
          >
            <span>Scan Sample Posting (Linear)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenRules}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-medium text-sm transition-colors cursor-pointer border border-white/10"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-300" />
            <span>View Standing Rules</span>
          </button>

          <button
            onClick={onDismiss}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors ml-auto underline cursor-pointer"
          >
            Got it, hide this guide
          </button>
        </div>
      </div>
    </div>
  );
};
