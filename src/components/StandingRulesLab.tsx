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
  tone: { label: 'Tone & Style', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  brevity: { label: 'Brevity & Caps', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  integrity: { label: 'Truth & Metrics', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  cadence: { label: 'Timing & Cadence', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  custom: { label: 'Custom Rule', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  keywords: { label: 'Tech Stack', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' }
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Permanent Standing Rules Engine
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Turn Bugs & Preferences into Standing Rules
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Whenever the AI makes a mistake or writes something you dislike (e.g., using buzzwords like &quot;spearheaded&quot;, writing emails too long, or inventing fake metrics), lock it in as a <strong>Standing Rule</strong>. Every subsequent scan strictly enforces it.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onResetRules}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset to recommended default rules"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Defaults</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-colors flex items-center gap-1.5 cursor-pointer"
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
              className={`bg-slate-900 border rounded-2xl p-5 transition-all shadow-sm flex flex-col justify-between ${
                rule.enabled ? 'border-slate-700/80' : 'border-slate-800 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${style.color}`}>
                      {style.label}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
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
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <h3 className="text-base font-bold text-white mb-1.5">{rule.title}</h3>

                <p className="text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800 leading-relaxed mb-3">
                  &quot;{rule.instruction}&quot;
                </p>

                <p className="text-xs text-slate-400">{rule.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {rule.enabled ? 'Active on all prompts' : 'Disabled'}
                </span>

                <button
                  onClick={() => onDeleteRule(rule.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-bold text-white">Standing Rules Live Audit Sandbox</h3>
        </div>
        <p className="text-xs text-slate-400">
          Type or paste a draft bullet point, cover letter sentence, or prompt to test how your active standing rules audit it in real time.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Type sample text to audit..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={runTestAudit}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            Audit Rules
          </button>
        </div>

        {testOutput && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <p className="font-semibold text-slate-200">{testOutput}</p>
            {testViolations.length > 0 && (
              <ul className="space-y-1 text-rose-300 pl-4 list-disc">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Add Permanent Standing Rule
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Strict Salary Minimum or React 19 Focus"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Exact Standing Instruction (Passed directly to AI)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Always emphasize Next.js App Router and TypeScript, never mention PHP, and flag any job with over 4 rounds of interviews."
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Why this rule exists (Your rationale)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Saves time by filtering out legacy stacks and long interview loops"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
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
