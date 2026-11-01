import React from 'react';
import { CreditCard, Check, Sparkles, ShieldCheck } from 'lucide-react';

export const PlansBilling: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">
            Plans & Billing
          </h1>
          <p className="text-sm text-gray-500 font-sans mt-1">
            Manage your subscription, credits, and AI Resume Intelligence usage.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Starter Plan */}
        <div className="bg-white border border-[#EAEAE8] rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-bold text-gray-900">Starter</h3>
            <p className="text-xs text-gray-500">For casual job seekers looking for quick resume evaluations.</p>
            <div className="pt-2">
              <span className="font-serif text-4xl font-bold text-gray-900">$0</span>
              <span className="text-xs text-gray-500 ml-1">/ month</span>
            </div>
            <ul className="space-y-2 text-xs text-gray-600 pt-3">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>5 Free ATS Analyses per month</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Basic Keyword Gap Analysis</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>1 Tailored Resume Version</span>
              </li>
            </ul>
          </div>
          <button className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors">
            Current Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-white border-2 border-[#0B4B42] rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-6 relative">
          <div className="absolute -top-3 right-6 bg-[#0B4B42] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Recommended
          </div>
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-bold text-gray-900">Pro Job Hunter</h3>
            <p className="text-xs text-gray-500">For active candidates aiming for multiple offers and top compensation.</p>
            <div className="pt-2">
              <span className="font-serif text-4xl font-bold text-gray-900">$29</span>
              <span className="text-xs text-gray-500 ml-1">/ month</span>
            </div>
            <ul className="space-y-2 text-xs text-gray-600 pt-3">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Unlimited AI Resume Auto-Tailoring</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Workday & Greenhouse Match Engine</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Interactive Voice Mock Interviews</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Full Firestore Cloud Persistence</span>
              </li>
            </ul>
          </div>
          <button className="w-full py-2.5 rounded-xl bg-[#0B4B42] hover:bg-[#073630] text-white text-xs font-semibold shadow-xs transition-colors">
            Upgrade to Pro
          </button>
        </div>

        {/* Enterprise / Coach Plan */}
        <div className="bg-white border border-[#EAEAE8] rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-bold text-gray-900">Career Coach</h3>
            <p className="text-xs text-gray-500">For university programs, bootcamps, and career coaches.</p>
            <div className="pt-2">
              <span className="font-serif text-4xl font-bold text-gray-900">$99</span>
              <span className="text-xs text-gray-500 ml-1">/ month</span>
            </div>
            <ul className="space-y-2 text-xs text-gray-600 pt-3">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Multi-Candidate Roster Tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Bulk Resume Scoring & Reports</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Dedicated API & Webhooks</span>
              </li>
            </ul>
          </div>
          <button className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};
