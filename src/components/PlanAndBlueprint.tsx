import React, { useState } from 'react';
import { VibePlan, StandingRule } from '../types/job';
import {
  FileCode2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  Lightbulb,
  ExternalLink
} from 'lucide-react';

interface PlanAndBlueprintProps {
  plan: VibePlan;
  standingRules: StandingRule[];
  onUpdatePlan: (updated: VibePlan) => void;
}

export const PlanAndBlueprint: React.FC<PlanAndBlueprintProps> = ({
  plan,
  standingRules,
  onUpdatePlan,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState<VibePlan>(plan);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const activeRules = standingRules.filter((r) => r.enabled);

  const masterBuildPrompt = `Role: Senior Software Engineer & AI System Architect
Goal: Vibe code an AI-powered application for a repetitive, manual task.

=== I. THE TASK & PROBLEM ===
Task: ${plan.taskName}
Problem: ${plan.problem}

=== II. CORE SYSTEM ARCHITECTURE (THE 4 PARTS) ===
1. INPUTS:
${plan.inputs}

2. PROCESS:
${plan.process}

3. OUTPUT:
${plan.output}

4. GOAL:
${plan.goal}

=== III. PERMANENT STANDING RULES (ENFORCED ON ALL RUNS) ===
${activeRules.map((r, i) => `${i + 1}. [${r.title}]: ${r.instruction}`).join('\n')}

=== IV. HUMAN-CENTERED FIRST-TIME EXPERIENCE ===
- Welcome banner explaining the 3 quick-start steps.
- Pre-populated realistic examples so the user can test the full pipeline in 30 seconds.
- Standing rules engine that lets users convert errors into permanent behavior rules.
- Fast export to CSV, JSON, and Markdown.`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(masterBuildPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleSave = () => {
    onUpdatePlan(editedPlan);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-semibold mb-2 border border-purple-500/20">
              <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
              Gemini Vibe Coding Blueprint
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              The 4-Part Application Plan: Inputs, Process, Output & Goal
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              &quot;Fixing a plan is faster than fixing a finished build.&quot; Here is the exact blueprint powering ApplyFlow, complete with your standing rules.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Plan</span>
              </button>
            )}

            <button
              onClick={handleCopyPrompt}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedPrompt ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Prompt Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Build Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* The 4 Quadrants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quadrant 1: Inputs */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
                1
              </div>
              <h3 className="text-base font-bold text-white">Inputs</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Raw Data Sources</span>
          </div>

          {isEditing ? (
            <textarea
              rows={4}
              value={editedPlan.inputs}
              onChange={(e) => setEditedPlan({ ...editedPlan, inputs: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
            />
          ) : (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 font-mono">
              {plan.inputs}
            </p>
          )}
        </div>

        {/* Quadrant 2: Process */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center border border-cyan-500/30">
                2
              </div>
              <h3 className="text-base font-bold text-white">Process</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Generative Pipeline</span>
          </div>

          {isEditing ? (
            <textarea
              rows={4}
              value={editedPlan.process}
              onChange={(e) => setEditedPlan({ ...editedPlan, process: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
            />
          ) : (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 font-mono">
              {plan.process}
            </p>
          )}
        </div>

        {/* Quadrant 3: Output */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                3
              </div>
              <h3 className="text-base font-bold text-white">Output</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Actionable Deliverables</span>
          </div>

          {isEditing ? (
            <textarea
              rows={4}
              value={editedPlan.output}
              onChange={(e) => setEditedPlan({ ...editedPlan, output: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
            />
          ) : (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 font-mono">
              {plan.output}
            </p>
          )}
        </div>

        {/* Quadrant 4: Goal */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                4
              </div>
              <h3 className="text-base font-bold text-white">Goal</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Measurable Outcome</span>
          </div>

          {isEditing ? (
            <textarea
              rows={4}
              value={editedPlan.goal}
              onChange={(e) => setEditedPlan({ ...editedPlan, goal: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
            />
          ) : (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 font-mono">
              {plan.goal}
            </p>
          )}
        </div>
      </div>

      {/* Master Build Prompt Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Full Compiled Gemini Build Prompt
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Copy and paste this into Google Gemini or AI Studio to rebuild or fork this system at any time.
            </p>
          </div>

          <button
            onClick={handleCopyPrompt}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Prompt</span>
          </button>
        </div>

        <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
          {masterBuildPrompt}
        </pre>
      </div>
    </div>
  );
};
