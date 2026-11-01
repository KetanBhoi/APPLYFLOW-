import React, { useState, useEffect } from 'react';
import { JobApplication, ExecutiveDossier, UserProfile, StandingRule } from '../types/job';
import { generateExecutiveDossier } from '../services/geminiService';
import {
  FileText,
  Sparkles,
  Printer,
  Copy,
  Check,
  X,
  RefreshCw,
  Building2,
  Calendar,
  CheckCircle2,
  Target,
  ShieldAlert,
  Users,
  Compass,
  ArrowRight,
  Download,
  Flame,
  Award
} from 'lucide-react';

interface ExecutiveDossierModalProps {
  application: JobApplication;
  userProfile: UserProfile;
  standingRules: StandingRule[];
  onClose: () => void;
  onSaveDossier?: (appId: string, dossier: ExecutiveDossier) => void;
}

export const ExecutiveDossierModal: React.FC<ExecutiveDossierModalProps> = ({
  application,
  userProfile,
  standingRules,
  onClose,
  onSaveDossier
}) => {
  const [dossier, setDossier] = useState<ExecutiveDossier | null>(
    application.executiveDossier || null
  );
  const [isLoading, setIsLoading] = useState(!application.executiveDossier);
  const [activeTab, setActiveTab] = useState<'30-60-90' | 'panel' | 'risks' | 'printable'>('30-60-90');
  const [selectedMilestone, setSelectedMilestone] = useState<'30' | '60' | '90'>('30');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const enabledRules = standingRules.filter((r) => r.enabled).map((r) => `${r.title}: ${r.instruction}`);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const resp = await generateExecutiveDossier({
        jobTitle: application.role,
        company: application.company,
        jobDescription: application.jobDescription,
        userProfile,
        parsedDetails: application.parsedDetails,
        standingRules: enabledRules
      });
      setDossier(resp.result);
      if (onSaveDossier) {
        onSaveDossier(application.id, resp.result);
      }
    } catch (err) {
      console.error('Failed to generate executive dossier:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!application.executiveDossier) {
      handleGenerate();
    }
  }, [application.id]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportMarkdown = () => {
    if (!dossier) return;
    const md = `# Executive 30-60-90 Day Strategic Dossier
**Candidate**: ${userProfile.fullName}
**Target Role**: ${dossier.targetRole}
**Target Company**: ${dossier.targetCompany}
**Date Generated**: ${new Date(dossier.generatedAt).toLocaleDateString()}

---

## Executive Summary
${dossier.executiveSummary}

## Strategic Value Proposition
${dossier.valueProposition.map((v, i) => `${i + 1}. ${v}`).join('\n')}

---

## 30-Day Milestone: ${dossier.plan30Days.theme}
### Goals
${dossier.plan30Days.goals.map((g) => `- ${g}`).join('\n')}

### Key Performance Indicators (KPIs)
${dossier.plan30Days.kpis.map((k) => `- [ ] ${k}`).join('\n')}

### Concrete Deliverables
${dossier.plan30Days.deliverables.map((d) => `- ${d}`).join('\n')}

---

## 60-Day Milestone: ${dossier.plan60Days.theme}
### Goals
${dossier.plan60Days.goals.map((g) => `- ${g}`).join('\n')}

### Key Performance Indicators (KPIs)
${dossier.plan60Days.kpis.map((k) => `- [ ] ${k}`).join('\n')}

### Concrete Deliverables
${dossier.plan60Days.deliverables.map((d) => `- ${d}`).join('\n')}

---

## 90-Day Milestone: ${dossier.plan90Days.theme}
### Goals
${dossier.plan90Days.goals.map((g) => `- ${g}`).join('\n')}

### Key Performance Indicators (KPIs)
${dossier.plan90Days.kpis.map((k) => `- [ ] ${k}`).join('\n')}

### Concrete Deliverables
${dossier.plan90Days.deliverables.map((d) => `- ${d}`).join('\n')}

---

## Panel Interview Alignment Matrix
${dossier.panelAlignment
  .map(
    (p) => `### ${p.interviewerRole}
- **Evaluation Focus**: ${p.keyEvaluationFocus}
- **Proof Point**: ${p.recommendedProofPoint}
- **Reverse Question**: "${p.reverseQuestion}"`
  )
  .join('\n\n')}

---

## Strategic Risks & Proactive Mitigations
${dossier.strategicRisks
  .map(
    (r) => `### Risk: ${r.risk}
- **Mitigation**: ${r.mitigation}
- **Early Warning Signal**: ${r.earlySignal}`
  )
  .join('\n\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${application.company.replace(/\s+/g, '_')}_Executive_Dossier_30_60_90.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-stone-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white text-stone-900 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400">Executive Briefing & Strategic Blueprint</span>
                <span className="text-xs px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-mono">30-60-90 Day Dossier</span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                <span>{application.company}</span>
                <span className="text-stone-500 text-sm font-sans font-normal">/</span>
                <span className="text-stone-300 text-base font-sans font-normal">{application.role}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Regenerate with Gemini"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
            <button
              onClick={handleExportMarkdown}
              disabled={!dossier || isLoading}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Download as Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export MD</span>
            </button>
            <button
              onClick={handlePrint}
              disabled={!dossier || isLoading}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Print to PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 bg-stone-100 border-b border-stone-200 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('30-60-90')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === '30-60-90'
                ? 'border-emerald-600 text-emerald-900 bg-white/70'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>30-60-90 Day Milestone Plan</span>
          </button>
          <button
            onClick={() => setActiveTab('panel')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'panel'
                ? 'border-emerald-600 text-emerald-900 bg-white/70'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Panel Interview Alignment</span>
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'risks'
                ? 'border-emerald-600 text-emerald-900 bg-white/70'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Strategic Risks & Mitigations</span>
          </button>
          <button
            onClick={() => setActiveTab('printable')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'printable'
                ? 'border-emerald-600 text-emerald-900 bg-white/70'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Executive One-Pager (Printable)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-stone-200 border-t-emerald-600 animate-spin" />
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">Synthesizing Executive 30-60-90 Day Dossier</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-md">
                  Analyzing {application.company} requirements, decomposing candidate value proposition, and mapping milestone KPIs...
                </p>
              </div>
            </div>
          ) : !dossier ? (
            <div className="py-16 text-center text-stone-500">
              <p>Failed to load dossier. Please try regenerating.</p>
              <button
                onClick={handleGenerate}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
              >
                Retry Generation
              </button>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Executive Summary Card */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-700">Executive Summary & Strategic Thesis</span>
                  </div>
                  <button
                    onClick={() => handleCopy(dossier.executiveSummary, 'exec_summary')}
                    className="text-xs text-stone-400 hover:text-stone-700 flex items-center gap-1"
                  >
                    {copiedKey === 'exec_summary' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'exec_summary' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed font-sans">{dossier.executiveSummary}</p>

                {/* 4 Pillars of Value Proposition */}
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">Value Proposition Pillars</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {dossier.valueProposition.map((pillar, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-lg border border-stone-200/60 text-xs text-stone-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{pillar}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tab 1: 30-60-90 Day Milestones */}
              {activeTab === '30-60-90' && (
                <div className="space-y-4">
                  {/* Horizon Selectors */}
                  <div className="grid grid-cols-3 gap-3">
                    {(['30', '60', '90'] as const).map((day) => {
                      const data = day === '30' ? dossier.plan30Days : day === '60' ? dossier.plan60Days : dossier.plan90Days;
                      const isSelected = selectedMilestone === day;
                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedMilestone(day)}
                          className={`p-4 rounded-xl border text-left transition-all relative ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-600 shadow-sm ring-1 ring-emerald-600'
                              : 'bg-white border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-emerald-800' : 'text-stone-500'}`}>
                              Days 1 – {day}
                            </span>
                            <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-emerald-200 text-emerald-900 font-bold' : 'bg-stone-100 text-stone-600'}`}>
                              {day === '30' ? 'Phase 1' : day === '60' ? 'Phase 2' : 'Phase 3'}
                            </span>
                          </div>
                          <div className="font-serif font-bold text-sm text-stone-900 line-clamp-1">{data.theme}</div>
                          <div className="text-[11px] text-stone-500 mt-1">{data.goals.length} Goals • {data.kpis.length} KPIs</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Horizon Detail */}
                  {(() => {
                    const activeMilestone =
                      selectedMilestone === '30'
                        ? dossier.plan30Days
                        : selectedMilestone === '60'
                        ? dossier.plan60Days
                        : dossier.plan90Days;

                    return (
                      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                              Days 1 – {selectedMilestone} Strategic Plan
                            </span>
                            <h3 className="text-lg font-serif font-bold text-stone-900 mt-0.5">{activeMilestone.theme}</h3>
                          </div>
                          <span className="text-xs text-stone-400 font-mono">
                            {application.company} • {application.role}
                          </span>
                        </div>

                        {/* Goals */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5 mb-3">
                            <Target className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Core Strategic Objectives & Initiatives</span>
                          </h4>
                          <div className="space-y-2">
                            {activeMilestone.goals.map((g, i) => (
                              <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-stone-50 border border-stone-100 text-xs text-stone-800">
                                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                <span className="leading-relaxed">{g}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* KPIs */}
                          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5 mb-3">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Measurable Success KPIs</span>
                            </h4>
                            <ul className="space-y-2 text-xs text-stone-700">
                              {activeMilestone.kpis.map((k, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-emerald-600 font-bold">•</span>
                                  <span>{k}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Deliverables */}
                          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5 mb-3">
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Tangible Artifact Deliverables</span>
                            </h4>
                            <ul className="space-y-2 text-xs text-stone-700">
                              {activeMilestone.deliverables.map((d, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-emerald-600 font-bold">•</span>
                                  <span>{d}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Tab 2: Panel Interview Alignment Matrix */}
              {activeTab === 'panel' && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-xs text-emerald-950 flex items-start gap-3">
                    <Users className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Tailored Interview Panel Alignment Matrix</div>
                      <div className="text-emerald-800/90 mt-0.5">
                        Different interviewers evaluate different vectors. Use these proven proof points and reverse-interview questions to lead the conversation with confidence.
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {dossier.panelAlignment.map((panel, idx) => (
                      <div key={idx} className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                          <span className="text-xs font-bold text-stone-900">{panel.interviewerRole}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 uppercase">Panel Member</span>
                        </div>

                        <div>
                          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Key Evaluation Focus</span>
                          <p className="text-xs text-stone-800 mt-1">{panel.keyEvaluationFocus}</p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-950">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-0.5">Recommended Candidate Proof Point</span>
                          <p>{panel.recommendedProofPoint}</p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 text-xs text-stone-800">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Reverse Question to Ask</span>
                            <button
                              onClick={() => handleCopy(panel.reverseQuestion, `rev_${idx}`)}
                              className="text-[10px] text-stone-400 hover:text-stone-700 flex items-center gap-0.5"
                            >
                              {copiedKey === `rev_${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedKey === `rev_${idx}` ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <p className="italic">"{panel.reverseQuestion}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Strategic Risks & Mitigations */}
              {activeTab === 'risks' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Pre-Mortem & Onboarding Risk De-escalation</div>
                      <div className="text-amber-900/90 mt-0.5">
                        High-caliber candidates distinguish themselves by anticipating friction points (codebases, dependency deadlocks, tooling) and demonstrating proactive mitigations.
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {dossier.strategicRisks.map((item, idx) => (
                      <div key={idx} className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <h4 className="font-serif font-bold text-sm text-stone-900">{item.risk}</h4>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold uppercase">
                            Risk Factor
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg text-xs text-emerald-950">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                              Proactive Mitigation Strategy
                            </span>
                            <p>{item.mitigation}</p>
                          </div>
                          <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-lg text-xs text-stone-800">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                              Early Warning Signal
                            </span>
                            <p>{item.earlySignal}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Printable White Paper View */}
              {activeTab === 'printable' && (
                <div className="bg-white border border-stone-300 rounded-xl p-8 shadow-md text-stone-900 font-sans print:shadow-none print:border-none print:p-0">
                  <div className="border-b-2 border-stone-900 pb-4 mb-6 flex items-start justify-between">
                    <div>
                      <div className="text-xs font-mono uppercase tracking-widest text-stone-500">
                        Executive Candidate Briefing & Strategic Blueprint
                      </div>
                      <h1 className="text-2xl font-serif font-bold text-stone-950 mt-1">
                        30-60-90 Day Strategic Plan
                      </h1>
                      <div className="text-sm text-stone-600 mt-1">
                        Prepared for: <strong>{application.company}</strong> | Role: <strong>{application.role}</strong>
                      </div>
                    </div>
                    <div className="text-right text-xs text-stone-500">
                      <div>Candidate: <strong>{userProfile.fullName}</strong></div>
                      <div>Date: {new Date(dossier.generatedAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="space-y-6 text-xs leading-relaxed">
                    <div>
                      <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1 mb-2">
                        1. Executive Summary & Strategic Fit
                      </h3>
                      <p className="text-stone-800 text-justify">{dossier.executiveSummary}</p>
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1 mb-2">
                        2. Strategic Value Proposition
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {dossier.valueProposition.map((v, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="font-bold text-stone-900">•</span>
                            <span>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1 mb-3">
                        3. 30-60-90 Day Execution Milestones
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="border border-stone-200 p-3 rounded">
                          <div className="font-bold text-stone-950 text-[11px] mb-1">DAYS 1–30</div>
                          <div className="font-serif italic text-stone-700 mb-2">{dossier.plan30Days.theme}</div>
                          <div className="font-bold text-[10px] text-stone-500 uppercase mb-1">Key Deliverables:</div>
                          <ul className="list-disc pl-3 space-y-1 text-[11px]">
                            {dossier.plan30Days.deliverables.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="border border-stone-200 p-3 rounded">
                          <div className="font-bold text-stone-950 text-[11px] mb-1">DAYS 31–60</div>
                          <div className="font-serif italic text-stone-700 mb-2">{dossier.plan60Days.theme}</div>
                          <div className="font-bold text-[10px] text-stone-500 uppercase mb-1">Key Deliverables:</div>
                          <ul className="list-disc pl-3 space-y-1 text-[11px]">
                            {dossier.plan60Days.deliverables.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="border border-stone-200 p-3 rounded">
                          <div className="font-bold text-stone-950 text-[11px] mb-1">DAYS 61–90</div>
                          <div className="font-serif italic text-stone-700 mb-2">{dossier.plan90Days.theme}</div>
                          <div className="font-bold text-[10px] text-stone-500 uppercase mb-1">Key Deliverables:</div>
                          <ul className="list-disc pl-3 space-y-1 text-[11px]">
                            {dossier.plan90Days.deliverables.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1 mb-2">
                        4. Panel Alignment & Strategic Inquiries
                      </h3>
                      <div className="space-y-2">
                        {dossier.panelAlignment.slice(0, 2).map((p, i) => (
                          <div key={i} className="text-[11px]">
                            <strong>{p.interviewerRole}:</strong> Focuses on {p.keyEvaluationFocus}. Inquire: <em>"{p.reverseQuestion}"</em>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>ApplyFlow Strategic Intelligence</span>
            <span>•</span>
            <span>Grounded in Candidate Truth Anchor</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium transition-colors"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
};
