import React from 'react';
import { Scale, CheckCircle2, ShieldCheck, Zap, Sliders, BookOpen } from 'lucide-react';

export const ScoringMethodology: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">
            Scoring Methodology
          </h1>
          <p className="text-sm text-gray-500 font-sans mt-1">
            How TalentMatch calculates honest ATS semantic match and recruiter relevance scores.
          </p>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-white border border-[#EAEAE8] rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="font-serif text-xl font-bold text-gray-900">
          The 4-Pillar Scoring Architecture
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Unlike crude keyword-stuffing tools that falsely promise 100% matches by hiding white text, TalentMatch uses strict natural language semantic parsing mirroring actual enterprise Workday, Greenhouse, and Lever filters.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#0B4B42] text-white flex items-center justify-center text-xs font-bold font-serif">1</span>
              <h3 className="font-semibold text-sm text-gray-900">Exact Semantic Hard Skills (40%)</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Verifies mandatory tooling, language proficiency, certifications, and platforms directly specified in the role requirements.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#0B4B42] text-white flex items-center justify-center text-xs font-bold font-serif">2</span>
              <h3 className="font-semibold text-sm text-gray-900">Experience Scope & Recency (30%)</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Evaluates seniority level, team size managed, budget accountability, and whether relevant skills were utilized within the past 24 months.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#0B4B42] text-white flex items-center justify-center text-xs font-bold font-serif">3</span>
              <h3 className="font-semibold text-sm text-gray-900">STAR Impact & Metrics (20%)</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Detects quantified verbs and outcomes (revenue generated, latency reduced, efficiency increased) instead of generic duty descriptions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#0B4B42] text-white flex items-center justify-center text-xs font-bold font-serif">4</span>
              <h3 className="font-semibold text-sm text-gray-900">Standing Rules Adherence (10%)</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Enforces your personal career boundaries: remote/hybrid policy, salary floor requirements, visa sponsorship, and target industries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
