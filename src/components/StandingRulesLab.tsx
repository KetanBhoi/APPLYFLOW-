import React, { useState } from 'react';
import { StandingRule } from '../types/job';
import {
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Sliders,
  Sparkles,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Zap,
  Check
} from 'lucide-react';
import { INITIAL_RULES } from '../data/initialData';

interface StandingRulesLabProps {
  rules: StandingRule[];
  onToggleRule: (id: string) => void;
  onAddRule: (rule: Omit<StandingRule, 'id' | 'timesEnforced'>) => void;
  onDeleteRule: (id: string) => void;
  onResetRules: () => void;
}

const CATEGORY_STYLES: Record<string, { label: string; color: string }> = {
  tone: { label: 'Tone & Style', color: 'bg-stone-100 text-stone-700 border-stone-200' },
  brevity: { label: 'Brevity & Caps', color: 'bg-emerald-50 text-[#0F4A3E] border-emerald-200' },
  integrity: { label: 'Truth & Metrics', color: 'bg-emerald-100/70 text-emerald-800 border-emerald-200' },
  cadence: { label: 'Timing & Cadence', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  custom: { label: 'Custom Rule', color: 'bg-stone-100 text-stone-800 border-stone-300' },
  keywords: { label: 'Tech Stack', color: 'bg-emerald-50 text-[#0F4A3E] border-emerald-200' }
};

export const StandingRulesLab: React.FC<StandingRulesLabProps> = ({
  rules,
  onToggleRule,
  onAddRule,
  onDeleteRule,
  onResetRules,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<StandingRule['category']>('tone');
  const [newInstruction, setNewInstruction] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Sandbox testing state
  const [testInput, setTestInput] = useState('I spearheaded dynamic cross-functional synergies to revolutionize cloud architecture.');
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [testViolations, setTestViolations] = useState<string[]>([]);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newInstruction.trim()) return;

    onAddRule({
      title: newTitle.trim(),
      category: newCategory,
      instruction: newInstruction.trim(),
      description: newDescription.trim() || 'Custom user standing rule.',
      enabled: true
    });

    setNewTitle('');
    setNewInstruction('');
    setNewDescription('');
    setShowAddModal(false);
  };

  const runTestAudit = () => {
    const violations: string[] = [];
    const textLower = testInput.toLowerCase();

    // Check active rules
    const activeRules = rules.filter((r) => r.enabled);

    for (const rule of activeRules) {
      if (rule.category === 'tone') {
        const banned = ['spearheaded', 'synergy', 'synergies', 'passionate self-starter', 'dynamic', 'orchestrated'];
        const found = banned.filter((b) => textLower.includes(b));
        if (found.length > 0) {
          violations.push(`Violation of [${rule.title}]: Found banned AI clichés: "${found.join(', ')}"`);
        }
      }

      if (rule.category === 'integrity') {
        if (!testInput.includes('[') && !testInput.match(/\d+%/)) {
          violations.push(`Notice for [${rule.title}]: Missing measurable metric or bracketed placeholder [e.g. X%].`);
        }
      }

      if (rule.category === 'brevity') {
        const wordCount = testInput.split(/\s+/).filter(Boolean).length;
        if (wordCount > 150) {
          violations.push(`Violation of [${rule.title}]: Word count (${wordCount}) exceeds 150-word cap.`);
        }
      }
    }

    setTestViolations(violations);
    if (violations.length === 0) {
      setTestOutput('✅ All active Standing Rules passed! Output aligns cleanly with your personal standard.');
    } else {
      setTestOutput(`⚠️ Detected ${violations.length} rule violation(s). The generative engine will automatically revise this.`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="bg-white border border-[#EBE8E3] rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#0F4A3E] text-xs font-semibold mb-2 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F4A3E]" />
              Permanent Standing Rules Engine
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
              Turn Bugs & Preferences into Standing Rules
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Whenever the AI makes a mistake or writes something you dislike (e.g., using buzzwords like &quot;spearheaded&quot;, writing emails too long, or inventing fake metrics), lock it in as a <strong>Standing Rule</strong>. Every subsequent scan strictly enforces it.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onResetRules}
              className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-200 transition-colors cursor-pointer"
              title="Reset to recommended default rules"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Defaults</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="h-9 inline-flex items-center gap-1.5 px-4 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Standing Rule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rules List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => {
          const style = CATEGORY_STYLES[rule.category] || CATEGORY_STYLES.custom;
          return (
            <div
              key={rule.id}
              className={`bg-white border rounded-2xl p-5 transition-all shadow-xs flex flex-col justify-between ${
                rule.enabled ? 'border-stone-200' : 'border-stone-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${style.color}`}>
                      {style.label}
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono">
                      Enforced {rule.timesEnforced}x
                    </span>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => onToggleRule(rule.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F4A3E]"></div>
                  </label>
                </div>

                <h3 className="text-base font-serif font-bold text-stone-900 mb-1.5">{rule.title}</h3>

                <p className="text-xs text-stone-800 font-mono bg-[#FAF9F7] p-2.5 rounded-xl border border-stone-200 leading-relaxed mb-3">
                  &quot;{rule.instruction}&quot;
                </p>

                <p className="text-xs text-stone-500">{rule.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span className="flex items-center gap-1 font-semibold text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  {rule.enabled ? 'Active on all prompts' : 'Disabled'}
                </span>

                <button
                  onClick={() => onDeleteRule(rule.id)}
                  className="text-stone-400 hover:text-rose-600 p-1 rounded transition-colors"
                  title="Delete rule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Rule Tester / Sandbox */}
      <div className="bg-white border border-[#EBE8E3] rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#0F4A3E]" />
          <h3 className="text-base font-serif font-bold text-stone-900">Standing Rules Live Audit Sandbox</h3>
        </div>
        <p className="text-xs text-stone-500">
          Type or paste a draft bullet point, cover letter sentence, or prompt to test how your active standing rules audit it in real time.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Type sample text to audit..."
            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
          <button
            onClick={runTestAudit}
            className="px-5 py-2 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            Audit Rules
          </button>
        </div>

        {testOutput && (
          <div className="bg-[#FAF9F7] p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
            <p className="font-semibold text-stone-800">{testOutput}</p>
            {testViolations.length > 0 && (
              <ul className="space-y-1 text-rose-800 pl-4 list-disc font-medium">
                {testViolations.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white border border-[#EBE8E3] rounded-3xl w-full max-w-lg p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#0F4A3E]" />
                Add Permanent Standing Rule
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 uppercase block mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Strict Salary Minimum or React 19 Focus"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 uppercase block mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="tone">Tone & Voice (Zero slop, anti-cliché)</option>
                  <option value="brevity">Brevity & Word Caps</option>
                  <option value="integrity">Truth & Measurable Metrics</option>
                  <option value="cadence">Timing & Follow-ups</option>
                  <option value="keywords">Target Tech Stack</option>
                  <option value="custom">Custom Constraint</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 uppercase block mb-1">
                  Exact Standing Instruction (Passed directly to AI)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Always emphasize Next.js App Router and TypeScript, never mention PHP, and flag any job with over 4 rounds of interviews."
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 uppercase block mb-1">
                  Why this rule exists (Your rationale)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Saves time by filtering out legacy stacks and long interview loops"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-medium hover:bg-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  Lock In Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
