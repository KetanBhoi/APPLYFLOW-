import React, { useState, useEffect } from 'react';
import { CompanyResearchDossier } from '../types/job';
import { fetchCompanyResearch } from '../services/geminiService';
import {
  Building2,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  X,
  RefreshCw,
  Users,
  Compass,
  Cpu,
  Layers,
  ShieldCheck
} from 'lucide-react';

interface CompanyResearchModalProps {
  company: string;
  jobTitle: string;
  jobDescription?: string;
  onClose: () => void;
}

export const CompanyResearchModal: React.FC<CompanyResearchModalProps> = ({
  company,
  jobTitle,
  jobDescription,
  onClose,
}) => {
  const [dossier, setDossier] = useState<CompanyResearchDossier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'questions' | 'dossier'>('questions');

  const loadResearch = async () => {
    setIsLoading(true);
    try {
      const resp = await fetchCompanyResearch({
        company,
        jobTitle,
        jobDescription,
      });
      setDossier(resp.result);
    } catch (err) {
      console.error('Failed to load company research:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResearch();
  }, [company]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[#EBE8E3] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#EBE8E3] bg-[#FAF9F7] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0F4A3E] text-xs font-semibold border border-emerald-300">
              <Compass className="w-3.5 h-3.5 text-[#0F4A3E]" />
              <span>Company Dossier & Reverse-Interview Strategy</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#0F4A3E]" />
              <span>{company} Intelligence Briefing</span>
            </h2>
            <p className="text-xs text-stone-600">Target Role: {jobTitle}</p>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 inline-flex items-center justify-center rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-stone-200 px-6 gap-6 bg-white">
          <button
            onClick={() => setActiveTab('questions')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'questions'
                ? 'border-[#0F4A3E] text-[#0F4A3E]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Questions to Ask the Interviewer (Reverse Interview)</span>
          </button>

          <button
            onClick={() => setActiveTab('dossier')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dossier'
                ? 'border-[#0F4A3E] text-[#0F4A3E]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tech Stack & Culture Dossier</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#0F4A3E] animate-spin mx-auto" />
              <p className="text-xs text-stone-600">
                Synthesizing architectural dossier and reverse-interview questions for {company}...
              </p>
            </div>
          ) : dossier ? (
            <>
              {/* TAB 1: Questions to Ask */}
              {activeTab === 'questions' && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                    <span className="font-semibold text-[#0F4A3E]">Why Reverse-Interview Questions Matter: </span>
                    Top candidates stand out by asking high-judgment technical questions about tech debt, on-call loads, and architectural trade-offs.
                  </div>

                  <div className="space-y-3">
                    {dossier.reverseInterviewQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-stone-200 rounded-2xl p-4 space-y-2 hover:border-emerald-700/40 shadow-xs transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                              q.target === 'hiring_manager'
                                ? 'bg-amber-50 text-amber-900 border-amber-200'
                                : q.target === 'peer_engineer'
                                ? 'bg-emerald-50 text-[#0F4A3E] border-emerald-200'
                                : 'bg-stone-100 text-stone-800 border-stone-200'
                            }`}
                          >
                            Ask: {q.target.replace('_', ' ')}
                          </span>

                          <button
                            onClick={() => handleCopy(q.question, `q-${idx}`)}
                            className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {copiedKey === `q-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span className="text-[11px]">Copy</span>
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm font-semibold text-stone-900 leading-relaxed">
                          &quot;{q.question}&quot;
                        </p>

                        <p className="text-[11px] text-stone-600 border-t border-stone-100 pt-1.5 flex items-start gap-1">
                          <span className="font-semibold text-stone-800">Strategic Angle:</span>
                          <span>{q.whyAskThis}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: Dossier */}
              {activeTab === 'dossier' && (
                <div className="space-y-4 text-xs">
                  <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-1.5 shadow-xs">
                    <span className="font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-[#0F4A3E]" />
                      <span>Company Overview & Value Proposition</span>
                    </span>
                    <p className="text-stone-700 leading-relaxed sm:text-sm">{dossier.overview}</p>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-1.5 shadow-xs">
                    <span className="font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-[#0F4A3E]" />
                      <span>Tech Stack & Architecture Priorities</span>
                    </span>
                    <ul className="space-y-1 text-stone-700">
                      {dossier.techStackHighlights.map((t, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-700 font-bold">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-1.5 shadow-xs">
                    <span className="font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#0F4A3E]" />
                      <span>Engineering Culture & Expectations</span>
                    </span>
                    <ul className="space-y-1 text-stone-700">
                      {dossier.engineeringCulture.map((c, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-700 font-bold">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
