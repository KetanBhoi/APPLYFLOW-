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
      <div className="bg-white border border-[#EBE8E3] rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#0F4A3E] text-xs font-semibold mb-2 border border-emerald-200">
              <FileCode2 className="w-3.5 h-3.5 text-[#0F4A3E]" />
              Gemini Vibe Coding Blueprint
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
              The 4-Part Application Plan: Inputs, Process, Output & Goal
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              &quot;Fixing a plan is faster than fixing a finished build.&quot; Here is the exact blueprint powering ApplyFlow, complete with your standing rules.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Plan</span>
              </button>
            )}

            <button
              onClick={handleCopyPrompt}
              className="px-4 py-2 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
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
        <div className="bg-white border border-[#EBE8E3] rounded-3xl p-6 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#0F4A3E] font-bold text-xs flex items-center justify-center border border-emerald-200">
                1
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900">Inputs</h3>
            </div>
            <span className="text-[11px] font-mono text-stone-500">Raw Data Sources</span>
          </div>

          {isEditing ? (
            <textarea
              rows={4}
              value={editedPlan.inputs}
              onChange={(e) => setEditedPlan({ ...editedPlan, inputs: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white"
            />
          ) : (
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line bg-[#FAF9F7] p-4 rounded-2xl border border-[#EBE8E3] font-mono">
              {plan.inputs}
            </p>
          )}
        </div>

        {/* Quadrant 2: Process */}
        <div className="bg-white border border-[#EBE8E3] rounded-3xl p-6 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#0F4A3E] font-bold text-xs flex items-center justify-center border border-emerald-200">
                2
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900">Process</h3>
            </div>
            <span className="text-[11px] font-mono text-stone-500">Generative Pipeline</span>
          </div>

          {isEditing ? (
            <textarea
              rows={4}
              value={editedPlan.process}
              onChange={(e) => setEditedPlan({ ...editedPlan, process: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white"
            />
          ) : (
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line bg-[#FAF9F7] p-4 rounded-2xl border border-[#EBE8E3] font-mono">
              {plan.process}
            </p>
          )}
        </div>

        {/* Quadrant 3: Output */}
        <div className="bg-white border border-[#EBE8E3] rounded-3xl p-6 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#0F4A3E] font-bold text-xs flex items-center justify-center border border-emerald-200">
                3
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900">Output</h3>
            </div>
            <span className="text-[11px] font-mono text-stone-500">Actionable Deliverables</span>
          </div>

          {isEditing ? (
            <textarea
              rows={4}
              value={editedPlan.output}
              onChange={(e) => setEditedPlan({ ...editedPlan, output: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white"
            />
          ) : (
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line bg-[#FAF9F7] p-4 rounded-2xl border border-[#EBE8E3] font-mono">
              {plan.output}
            </p>
          )}
        </div>

        {/* Quadrant 4: Goal */}
        <div className="bg-white border border-[#EBE8E3] rounded-3xl p-6 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-[#0F4A3E] font-bold text-xs flex items-center justify-center border border-emerald-200">
                4
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900">Goal</h3>
            </div>
            <span className="text-[11px] font-mono text-stone-500">Measurable Outcome</span>
          </div>

          {isEditing ? (
            <textarea
              rows={4}
              value={editedPlan.goal}
              onChange={(e) => setEditedPlan({ ...editedPlan, goal: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white"
            />
          ) : (
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line bg-[#FAF9F7] p-4 rounded-2xl border border-[#EBE8E3] font-mono">
              {plan.goal}
            </p>
          )}
        </div>
      </div>

      {/* Master Build Prompt Viewer */}
      <div className="bg-white border border-[#EBE8E3] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0F4A3E]" />
              Full Compiled Gemini Build Prompt
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Copy and paste this into Google Gemini or AI Studio to rebuild or fork this system at any time.
            </p>
          </div>

          <button
            onClick={handleCopyPrompt}
            className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
            <span>Copy Prompt</span>
          </button>
        </div>

        <pre className="bg-[#FAF9F7] p-4 rounded-2xl border border-[#EBE8E3] text-xs text-stone-700 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
          {masterBuildPrompt}
        </pre>
      </div>
    </div>
  );
};
