import React, { useState } from 'react';
import { JobOffer, StandingRule } from '../types/job';
import { generateNegotiationScript } from '../services/geminiService';
import {
  DollarSign,
  TrendingUp,
  Scale,
  Sparkles,
  Copy,
  Check,
  Plus,
  Trash2,
  Building2,
  Mail,
  Phone,
  FileText,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface OfferNegotiationStudioProps {
  standingRules: StandingRule[];
}

const INITIAL_OFFERS: JobOffer[] = [
  {
    id: 'off-1',
    company: 'Linear',
    role: 'Senior Frontend Engineer',
    baseSalary: 175000,
    annualEquity: 55000,
    signOnBonus: 20000,
    annualBonus: 0,
    benefitsValue: 12000,
    remoteStipend: 3000,
    ptoDays: 25,
    workMode: 'remote',
    location: 'Remote (US)',
    deadline: '2026-10-15',
    pros: ['Elite craft culture', 'Pure remote', 'High autonomy pods'],
    cons: ['Private equity valuation illiquidity']
  },
  {
    id: 'off-2',
    company: 'Stripe',
    role: 'Staff Frontend Infrastructure Engineer',
    baseSalary: 195000,
    annualEquity: 85000,
    signOnBonus: 35000,
    annualBonus: 20000,
    benefitsValue: 15000,
    remoteStipend: 2000,
    ptoDays: 20,
    workMode: 'hybrid',
    location: 'San Francisco, CA',
    deadline: '2026-10-12',
    pros: ['Liquid equity tender offers', 'Global scale impact', 'High brand prestige'],
    cons: ['Hybrid 3 days/week commute requirement']
  }
];

export const OfferNegotiationStudio: React.FC<OfferNegotiationStudioProps> = ({
  standingRules,
}) => {
  const [offers, setOffers] = useState<JobOffer[]>(INITIAL_OFFERS);
  const [selectedOfferId, setSelectedOfferId] = useState<string>(offers[0]?.id || '');
  const [targetComp, setTargetComp] = useState<number>(260000);
  const [selectedTactic, setSelectedTactic] = useState<'collaborative' | 'competing_offer' | 'equity_heavy' | 'remote_flexibility'>('collaborative');
  const [equityMultiplier, setEquityMultiplier] = useState<number>(1.0);
  const [vestingSchedule, setVestingSchedule] = useState<'standard_cliff' | 'backloaded'>('standard_cliff');
  const [leverageInput, setLeverageInput] = useState<string>(
    'Strong competing offer from Stripe with higher base & liquid RSUs; specialized expertise in real-time WebSockets.'
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [scriptResult, setScriptResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New offer form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newBase, setNewBase] = useState(160000);
  const [newEquity, setNewEquity] = useState(40000);
  const [newSignOn, setNewSignOn] = useState(15000);
  const [newWorkMode, setNewWorkMode] = useState<'remote' | 'hybrid' | 'onsite'>('remote');

  const selectedOffer = offers.find((o) => o.id === selectedOfferId) || offers[0];

  const calculateTotalComp = (o: JobOffer) => {
    const adjustedEquity = o.annualEquity * equityMultiplier;
    return o.baseSalary + adjustedEquity + o.signOnBonus + o.annualBonus + o.remoteStipend;
  };

  const handleGenerateScript = async () => {
    if (!selectedOffer) return;
    setIsGenerating(true);
    try {
      const competing = offers.find((o) => o.id !== selectedOffer.id);
      const tacticPrompt =
        selectedTactic === 'competing_offer'
          ? 'Tactic: Competing Offer Leverage. Respectfully leverage competitor package without sounding threatening.'
          : selectedTactic === 'equity_heavy'
          ? 'Tactic: Equity Upside Maximizer. Willing to accept flat base in exchange for 30%+ higher equity grant.'
          : selectedTactic === 'remote_flexibility'
          ? 'Tactic: Work-Life & Remote Flexibility. Target compensation coupled with remote/flexible hours guarantee.'
          : 'Tactic: Collaborative Win-Win. Express deep enthusiasm while matching market band.';

      const resp = await generateNegotiationScript({
        offer: selectedOffer,
        competingOffer: competing,
        targetComp,
        leveragePoints: [tacticPrompt, leverageInput],
        standingRules: standingRules.filter((r) => r.enabled).map((r) => r.title),
      });
      setScriptResult(resp.result);
    } catch (err) {
      console.error('Error generating negotiation script:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim()) return;

    const created: JobOffer = {
      id: `off-${Date.now()}`,
      company: newCompany.trim(),
      role: newRole.trim(),
      baseSalary: Number(newBase) || 0,
      annualEquity: Number(newEquity) || 0,
      signOnBonus: Number(newSignOn) || 0,
      annualBonus: 0,
      benefitsValue: 12000,
      remoteStipend: 2000,
      ptoDays: 20,
      workMode: newWorkMode,
      location: newWorkMode === 'remote' ? 'Remote' : 'San Francisco, CA',
      pros: ['Competitive compensation'],
      cons: []
    };

    setOffers([...offers, created]);
    setSelectedOfferId(created.id);
    setShowAddForm(false);
    setNewCompany('');
    setNewRole('');
  };

  const handleDeleteOffer = (id: string) => {
    setOffers(offers.filter((o) => o.id !== id));
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offer Comparison & Salary Negotiation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Offer Matrix & Negotiation Strategist
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Compare base salaries, equity, sign-on bonuses, and annual total compensation side-by-side.
              Generate respectful, executive counter-offer scripts with market benchmarks and competing leverage.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Offer</span>
          </button>
        </div>
      </div>

      {/* Add Offer Modal */}
      {showAddForm && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl animate-in fade-in space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add New Job Offer to Matrix</span>
          </h3>

          <form onSubmit={handleAddOffer} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Company</label>
              <input
                type="text"
                placeholder="e.g. Figma"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Role Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Software Engineer"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Work Mode</label>
              <select
                value={newWorkMode}
                onChange={(e: any) => setNewWorkMode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-Site</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Base Salary ($)</label>
              <input
                type="number"
                value={newBase}
                onChange={(e) => setNewBase(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Annual Equity / RSUs ($)</label>
              <input
                type="number"
                value={newEquity}
                onChange={(e) => setNewEquity(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Sign-on Bonus ($)</label>
              <input
                type="number"
                value={newSignOn}
                onChange={(e) => setNewSignOn(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow"
              >
                Add Offer to Comparison
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Side-by-Side Offer Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => {
          const tc = calculateTotalComp(offer);
          const isSelected = selectedOfferId === offer.id;

          return (
            <div
              key={offer.id}
              onClick={() => setSelectedOfferId(offer.id)}
              className={`rounded-3xl p-6 transition-all border shadow-lg cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500/60 shadow-emerald-950/30 ring-2 ring-emerald-500/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                      {offer.workMode}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">{offer.company}</h3>
                    <p className="text-xs text-slate-400">{offer.role}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteOffer(offer.id);
                    }}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Total Compensation Highlight */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider block">
                    Year 1 Total Compensation
                  </span>
                  <span className="font-mono text-2xl font-black text-emerald-400 tracking-tight">
                    ${tc.toLocaleString()}
                  </span>
                </div>

                {/* Itemized Compensation Table */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Base Salary:</span>
                    <span className="font-mono font-semibold">${offer.baseSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Annual Equity (RSUs):</span>
                    <span className="font-mono font-semibold">${offer.annualEquity.toLocaleString()}/yr</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Sign-on Bonus:</span>
                    <span className="font-mono font-semibold">${offer.signOnBonus.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Annual Bonus / Stipend:</span>
                    <span className="font-mono font-semibold">
                      ${(offer.annualBonus + offer.remoteStipend).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-1.5">
                    <span className="text-slate-400">PTO Days:</span>
                    <span className="font-mono">{offer.ptoDays} days</span>
                  </div>
                </div>

                {/* Pros list */}
                {offer.pros.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {offer.pros.map((p, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                      >
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  {isSelected ? '✓ Selected for negotiation' : 'Click to select'}
                </span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <span>Strategize</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Negotiation Script Generator Workspace */}
      {selectedOffer && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold uppercase text-emerald-300 tracking-wider">
                  AI Negotiation Strategist
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                Draft Counter-Offer & Negotiation Leverage for {selectedOffer.company}
              </h3>
            </div>

            <button
              onClick={handleGenerateScript}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Synthesizing Strategy...' : 'Generate Negotiation Package'}</span>
            </button>
          </div>

          {/* 4-Year Vesting Schedule & Growth Modeling */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  4-Year Vesting & Equity Upside Modeling
                </span>
                <p className="text-xs text-slate-400">
                  Simulate standard 1-year cliff vs backloaded vesting and market growth scenarios for {selectedOffer.company}.
                </p>
              </div>

              {/* Scenario Toggle */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setEquityMultiplier(0.5)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    equityMultiplier === 0.5 ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Bear (0.5x)
                </button>
                <button
                  type="button"
                  onClick={() => setEquityMultiplier(1.0)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    equityMultiplier === 1.0 ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Baseline (1.0x)
                </button>
                <button
                  type="button"
                  onClick={() => setEquityMultiplier(2.5)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    equityMultiplier === 2.5 ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Bull (2.5x)
                </button>
              </div>
            </div>

            {/* 4-Year Vesting Schedule Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { year: 'Year 1 (Cliff)', pct: vestingSchedule === 'standard_cliff' ? 0.25 : 0.05, label: '25% Cliff' },
                { year: 'Year 2', pct: vestingSchedule === 'standard_cliff' ? 0.25 : 0.15, label: 'Monthly' },
                { year: 'Year 3', pct: vestingSchedule === 'standard_cliff' ? 0.25 : 0.40, label: 'Monthly' },
                { year: 'Year 4', pct: vestingSchedule === 'standard_cliff' ? 0.25 : 0.40, label: 'Monthly' }
              ].map((slot, i) => {
                const total4YrEquity = (selectedOffer.annualEquity * 4) * equityMultiplier;
                const slotValue = Math.round(total4YrEquity * slot.pct);
                const yearTotalComp = selectedOffer.baseSalary + slotValue + (i === 0 ? selectedOffer.signOnBonus : 0) + selectedOffer.annualBonus;

                return (
                  <div key={i} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono">
                      <span>{slot.year}</span>
                      <span>{Math.round(slot.pct * 100)}%</span>
                    </div>
                    <div className="text-base font-bold text-white font-mono">
                      ${slotValue.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono">
                      Year TC: ${yearTotalComp.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tactical Strategy Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-slate-400 block">
              Negotiation Tactical Posture
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {[
                { id: 'collaborative', title: 'Collaborative Win-Win', desc: 'Deep enthusiasm, high alignment, market benchmark match' },
                { id: 'competing_offer', title: 'Competing Leverage', desc: 'Tactfully leverage competing higher compensation' },
                { id: 'equity_heavy', title: 'Equity / Upside Maximizer', desc: 'Trade cash base for 30%+ higher equity grant' },
                { id: 'remote_flexibility', title: 'Remote & Flexibility', desc: 'Target comp coupled with location autonomy guarantee' }
              ].map((tac) => (
                <button
                  key={tac.id}
                  type="button"
                  onClick={() => setSelectedTactic(tac.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedTactic === tac.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-white">{tac.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{tac.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                Target Total Compensation ($)
              </label>
              <input
                type="number"
                value={targetComp}
                onChange={(e) => setTargetComp(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                Your Primary Leverage Points
              </label>
              <input
                type="text"
                value={leverageInput}
                onChange={(e) => setLeverageInput(e.target.value)}
                placeholder="e.g. Competing offer, rare niche skill, immediate start date..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Generated Negotiation Output */}
          {scriptResult && (
            <div className="space-y-6 pt-4 animate-in fade-in duration-300">
              
              {/* Strategy Summary */}
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-xs text-emerald-200 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Executive Strategy Framing
                </span>
                <p className="leading-relaxed text-slate-300">{scriptResult.strategySummary}</p>
              </div>

              {/* Ready-to-Send Counter-Offer Email */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    <span>Counter-Offer Email to Recruiter</span>
                  </span>

                  <button
                    onClick={() =>
                      handleCopy(
                        `Subject: ${scriptResult.counterOfferEmail.subject}\n\n${scriptResult.counterOfferEmail.body}`,
                        'email-script'
                      )
                    }
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'email-script' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'email-script' ? 'Copied Email' : 'Copy Email'}</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl text-xs font-mono text-slate-300 border border-slate-800">
                  <span className="text-slate-500">Subject: </span>
                  {scriptResult.counterOfferEmail.subject}
                </div>

                <div className="p-4 bg-slate-900 rounded-xl text-xs sm:text-sm text-slate-200 leading-relaxed font-sans border border-slate-800 whitespace-pre-line">
                  {scriptResult.counterOfferEmail.body}
                </div>
              </div>

              {/* Phone Talking Points & Concessions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Phone Talking Points */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <span className="text-xs font-bold uppercase text-amber-300 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>If the Recruiter Calls (Verbal Points)</span>
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {scriptResult.phoneTalkingPoints.map((pt: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Concession Alternatives */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <span className="text-xs font-bold uppercase text-cyan-300 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-cyan-400" />
                    <span>Non-Salary Trade-Offs (If Base is Frozen)</span>
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {scriptResult.concessionAlternatives.map((alt: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{alt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
