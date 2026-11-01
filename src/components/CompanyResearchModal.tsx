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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Company Dossier & Reverse-Interview Strategy</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-400" />
              <span>{company} Intelligence Briefing</span>
            </h2>
            <p className="text-xs text-slate-400">Target Role: {jobTitle}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 px-6 gap-6 bg-slate-900">
          <button
            onClick={() => setActiveTab('questions')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'questions'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Questions to Ask the Interviewer (Reverse Interview)</span>
          </button>

          <button
            onClick={() => setActiveTab('dossier')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dossier'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
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
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-300">
                Synthesizing architectural dossier and reverse-interview questions for {company}...
              </p>
            </div>
          ) : dossier ? (
            <>
              {/* TAB 1: Questions to Ask */}
              {activeTab === 'questions' && (
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-xs text-indigo-200">
                    <span className="font-semibold text-white">Why Reverse-Interview Questions Matter: </span>
                    Top candidates stand out by asking high-judgment technical questions about tech debt, on-call loads, and architectural trade-offs.
                  </div>

                  <div className="space-y-3">
                    {dossier.reverseInterviewQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                              q.target === 'hiring_manager'
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                : q.target === 'peer_engineer'
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                                : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            }`}
                          >
                            Ask: {q.target.replace('_', ' ')}
                          </span>

                          <button
                            onClick={() => handleCopy(q.question, `q-${idx}`)}
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            {copiedKey === `q-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span className="text-[11px]">Copy</span>
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                          &quot;{q.question}&quot;
                        </p>

                        <p className="text-[11px] text-slate-400 border-t border-slate-900 pt-1.5 flex items-start gap-1">
                          <span className="font-semibold text-slate-300">Strategic Angle:</span>
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
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                    <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      <span>Company Overview & Value Proposition</span>
                    </span>
                    <p className="text-slate-300 leading-relaxed sm:text-sm">{dossier.overview}</p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                    <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <span>Tech Stack & Architecture Priorities</span>
                    </span>
                    <ul className="space-y-1 text-slate-300">
                      {dossier.techStackHighlights.map((t, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-cyan-400 font-bold">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                    <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Engineering Culture & Expectations</span>
                    </span>
                    <ul className="space-y-1 text-slate-300">
                      {dossier.engineeringCulture.map((c, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
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
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
