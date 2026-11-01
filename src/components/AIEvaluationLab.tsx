import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  Download,
  Share2,
  Clock,
  Gauge,
  Code,
  ShieldCheck,
  FileCheck,
  Sliders,
  ChevronRight,
  BookmarkPlus,
  Zap,
  HelpCircle,
  Eye,
  Award
} from 'lucide-react';
import { runMultiModelEvaluation, EvaluationRunResult, AIEvaluationResponse } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface AIEvaluationLabProps {
  onNavigateToApplications?: () => void;
}

interface TestCaseTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  systemInstruction: string;
  prompt: string;
  expectedBehavior: string;
}

const TEST_TEMPLATES: TestCaseTemplate[] = [
  {
    id: 'test-1',
    title: 'MERN REST API Boundary & Memory Leak Check',
    category: 'Code Correctness & Security',
    description: 'Verifies whether the model protects against unbounded pagination queries in Node/Express and MongoDB.',
    systemInstruction: 'You are a senior software security and correctness auditor. Write clean, production-grade code adhering strictly to zero memory leak principles.',
    prompt: `Write a Node.js Express RESTful endpoint for fetching products from MongoDB with Mongoose. 
Requirements:
1. Support category filtering and pagination (limit and page).
2. Protect against denial-of-service where a user passes limit=10000000.
3. Optimize read performance with .lean() and return clean JSON response.
4. Include boundary error handling.`,
    expectedBehavior: 'Must use Math.min() for limit capping, .lean() for fast reads, and avoid unhandled promise rejections.'
  },
  {
    id: 'test-2',
    title: 'Python List Mutation & Concurrency Trap (Hallucination Test)',
    category: 'Hallucination & Reasoning Trap',
    description: 'Adversarial prompt designed to catch models that falsely claim mutating a list during iteration is safe.',
    systemInstruction: 'You are an exacting Python core compiler and runtime specialist. Scrutinize code correctness and do not sugarcoat bugs.',
    prompt: `Look at this Python code snippet:
items = [1, 2, 3, 4, 5, 6]
for i in items:
    if i % 2 == 0:
        items.remove(i)
print(items)

Analyze what prints, explain the exact internal index shift mechanism, and evaluate why this is an anti-pattern. If you provide a fixed alternative, use a list comprehension or filter.`,
    expectedBehavior: 'Must correctly identify that [1, 3, 5] is NOT printed (it skips elements due to index shifting and prints [1, 3, 5] or [1, 3, 5] error depending on evaluation), and explain the pointer skip.'
  },
  {
    id: 'test-3',
    title: 'Adversarial Bias & Negative Constraint Compliance',
    category: 'Instruction Following & Bias',
    description: 'Tests whether models obey strict negative constraints without leaking prohibited words or sycophancy.',
    systemInstruction: 'Enforce strict constraints. Under no circumstance use any of the banned words: "delve", "crucial", "testament", "tapestry", "moreover".',
    prompt: `Evaluate the architectural trade-offs between monolithic databases vs microservice event-driven databases.
Write exactly 3 concise bullet points.
Strict rule: Do not use the words 'delve', 'crucial', 'testament', 'tapestry', or 'moreover'. Count words at the end.`,
    expectedBehavior: 'Must strictly have zero instances of the 5 banned words and contain exactly 3 bullets.'
  },
  {
    id: 'test-4',
    title: 'Java OOP Inheritance vs Composition Edge-Case',
    category: 'Code Correctness & Architecture',
    description: 'Tests polymorphic correctness and fragile base class problem understanding in Java.',
    systemInstruction: 'You are a Java software architect specializing in enterprise design patterns and object correctness.',
    prompt: `Demonstrate the "Fragile Base Class" problem in Java where subclassing HashSet and overriding add() and addAll() causes double-counting when calling addAll(). Provide the corrected composition/forwarding decorator approach.`,
    expectedBehavior: 'Must demonstrate that HashSet.addAll internally calls add(), causing a subclass that overrides both to increment count twice.'
  }
];

export const AIEvaluationLab: React.FC<AIEvaluationLabProps> = ({ onNavigateToApplications }) => {
  const { user } = useAuth();

  const [selectedTemplate, setSelectedTemplate] = useState<TestCaseTemplate>(TEST_TEMPLATES[0]);
  const [promptText, setPromptText] = useState(TEST_TEMPLATES[0].prompt);
  const [systemInstructionText, setSystemInstructionText] = useState(TEST_TEMPLATES[0].systemInstruction);
  const [taskCategory, setTaskCategory] = useState(TEST_TEMPLATES[0].category);

  // Selected models to benchmark
  const [activeModels, setActiveModels] = useState<string[]>([
    'gemini-3.5-flash',
    'gemini-3.1-pro-preview',
    'gemini-3.1-flash-lite'
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [evaluationResponse, setEvaluationResponse] = useState<AIEvaluationResponse | null>(null);
  const [humanNotes, setHumanNotes] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Load template
  const handleSelectTemplate = (template: TestCaseTemplate) => {
    setSelectedTemplate(template);
    setPromptText(template.prompt);
    setSystemInstructionText(template.systemInstruction);
    setTaskCategory(template.category);
  };

  const handleToggleModel = (model: string) => {
    if (activeModels.includes(model)) {
      if (activeModels.length === 1) return; // Keep at least one
      setActiveModels(activeModels.filter((m) => m !== model));
    } else {
      setActiveModels([...activeModels, model]);
    }
  };

  const handleRunEvaluation = async () => {
    if (!promptText.trim() || isRunning) return;
    setIsRunning(true);
    try {
      const response = await runMultiModelEvaluation({
        prompt: promptText,
        systemInstruction: systemInstructionText.trim() || undefined,
        models: activeModels,
        taskCategory: taskCategory
      });
      setEvaluationResponse(response);

      // Auto-save to Firestore if user logged in
      if (user) {
        const evalId = 'eval-' + Date.now();
        const evalRef = doc(db, 'users', user.uid, 'evaluations', evalId);
        setDoc(evalRef, {
          id: evalId,
          promptTitle: selectedTemplate.title,
          testPrompt: promptText,
          taskCategory,
          results: response.results,
          evaluator: 'KETAN KAUSHIKBHAI BHOI',
          evaluatorNotes: humanNotes,
          timestamp: new Date().toISOString()
        }, { merge: true }).catch(() => {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyReport = () => {
    if (!evaluationResponse) return;
    const lines = [
      `# AI / LLM Evaluation & Model Benchmark Report`,
      `Evaluator: Ketan Kaushikbhai Bhoi (B.Tech Information Technology)`,
      `Date: ${new Date(evaluationResponse.timestamp).toLocaleString()}`,
      `Task Category: ${evaluationResponse.taskCategory}`,
      `\n## Benchmark Test Prompt`,
      evaluationResponse.prompt,
      `\n## Model Comparative Results`,
      ...Object.entries(evaluationResponse.results).map(([mName, res]) => {
        return `### Model: ${mName}
- Latency: ${res.latencyMs}ms
- Word Count: ${res.wordCount} words
- Overall Score: ${res.rubric.overallScore}/100
- Correctness: ${res.rubric.correctness}/100
- Instruction Adherence: ${res.rubric.instructionFollowing}/100
- Hallucination Resistance: ${res.rubric.hallucinationResistance}/100
- Critique: ${res.rubric.critique}

Response:
${res.text}
----------------------------------------`;
      }),
      humanNotes ? `\n## Human Evaluator Audit Notes\n${humanNotes}` : ''
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedId('report');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!evaluationResponse) return;
    const content = `# AI Model Benchmark & Correctness Audit Report
Evaluator: Ketan Kaushikbhai Bhoi
Contact: kkbhoi09@gmail.com | +91 90541 46405
Category: ${evaluationResponse.taskCategory}
Date: ${new Date().toLocaleDateString()}

## Test Prompt
\`\`\`
${evaluationResponse.prompt}
\`\`\`

## Evaluation Matrix
| Model | Latency | Overall Score | Correctness | Instruction Following | Hallucination Resistance |
|-------|---------|---------------|-------------|-----------------------|--------------------------|
${Object.entries(evaluationResponse.results)
  .map(
    ([m, r]) =>
      `| ${m} | ${r.latencyMs}ms | ${r.rubric.overallScore}% | ${r.rubric.correctness}% | ${r.rubric.instructionFollowing}% | ${r.rubric.hallucinationResistance}% |`
  )
  .join('\n')}

${humanNotes ? `\n## Evaluator Observations & Test Log\n${humanNotes}\n` : ''}

Report generated via ApplyFlow AI Benchmarking Suite.
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI-Evaluation-Report-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-[#EBE8E3] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDF3EA] text-[#0F4A3E] text-xs font-bold font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AI / LLM Evaluation Lab & Correctness Bench</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight leading-tight">
              Model Benchmark & Adversarial Test Lab
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              Designed for <strong>AI/LLM Evaluation Specialists</strong> and <strong>Prompt Engineers</strong>. Test multiple Gemini models side-by-side on instruction adherence, edge-case code correctness, and hallucination resistance. Generate verified proof-of-work benchmark reports for Outlier AI, Scale AI, and hiring managers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2.5 w-full lg:w-auto shrink-0">
            <button
              onClick={handleRunEvaluation}
              disabled={isRunning || !promptText.trim()}
              className="px-6 py-3 rounded-2xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin text-emerald-300" />
                  <span>Benchmarking Models...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-emerald-300 text-emerald-300" />
                  <span>Run Multi-Model Benchmark</span>
                </>
              )}
            </button>

            {evaluationResponse && (
              <button
                onClick={handleCopyReport}
                className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copiedId === 'report' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Report Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Full Audit Report</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Test Case Templates Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Curated Evaluation Templates
          </span>
          <span className="text-xs text-stone-400">
            Click to load prompt & criteria
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TEST_TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplate.id === tmpl.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => handleSelectTemplate(tmpl)}
                className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between h-full ${
                  isSelected
                    ? 'bg-white border-[#0F4A3E] ring-2 ring-[#0F4A3E]/10 shadow-xs'
                    : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                      {tmpl.category.split(' ')[0]}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0F4A3E]" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 line-clamp-2">
                    {tmpl.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                    {tmpl.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Benchmark Configuration & Input Card */}
      <div className="bg-white border border-[#EBE8E3] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        {/* Model Selection Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-stone-400" />
            <span className="text-xs font-bold text-stone-800">
              Models in Benchmark:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'gemini-3.5-flash', label: 'gemini-3.5-flash', tag: 'Balanced / Production' },
              { id: 'gemini-3.1-pro-preview', label: 'gemini-3.1-pro-preview', tag: 'Deep Reasoning / SOTA' },
              { id: 'gemini-3.1-flash-lite', label: 'gemini-3.1-flash-lite', tag: 'Ultra Fast' }
            ].map((m) => {
              const isChecked = activeModels.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => handleToggleModel(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isChecked
                      ? 'bg-[#0F4A3E] text-white border-[#0F4A3E] shadow-xs'
                      : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span className="font-mono">{m.label}</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-sans ${isChecked ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'}`}>
                    {m.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <span>Test Prompt / Adversarial Input:</span>
            </label>
            <textarea
              rows={5}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Enter the test prompt, code challenge, or instruction-following test..."
              className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F4A3E] focus:bg-white resize-y"
            />
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800">
                System Instruction (Negative Constraints):
              </label>
              <textarea
                rows={2}
                value={systemInstructionText}
                onChange={(e) => setSystemInstructionText(e.target.value)}
                placeholder="e.g. Enforce zero memory leak, prohibit words..."
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0F4A3E] focus:bg-white resize-none"
              />
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Expected Ground Truth Criteria:</span>
              </div>
              <p className="text-amber-800 leading-snug">
                {selectedTemplate.expectedBehavior}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Comparison Matrix */}
      {evaluationResponse && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#0F4A3E]" />
              <h2 className="font-serif text-xl font-bold text-stone-900">
                Comparative Model Output & Correctness Radar
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadMarkdown}
                className="px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Download report as Markdown file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .MD Report</span>
              </button>
            </div>
          </div>

          {/* Model Columns Grid */}
          <div className={`grid gap-4 ${
            Object.keys(evaluationResponse.results).length === 1
              ? 'grid-cols-1 max-w-2xl mx-auto'
              : Object.keys(evaluationResponse.results).length === 2
              ? 'grid-cols-1 lg:grid-cols-2'
              : 'grid-cols-1 lg:grid-cols-3'
          }`}>
            {Object.entries(evaluationResponse.results).map(([modelId, result]) => {
              const isPro = modelId.includes('pro');
              const isLite = modelId.includes('lite');
              return (
                <div
                  key={modelId}
                  className={`bg-white rounded-3xl border flex flex-col justify-between overflow-hidden shadow-xs transition-all ${
                    isPro
                      ? 'border-purple-200 shadow-purple-500/5'
                      : isLite
                      ? 'border-amber-200 shadow-amber-500/5'
                      : 'border-emerald-200 shadow-emerald-500/5'
                  }`}
                >
                  {/* Model Header */}
                  <div className={`p-4 border-b ${
                    isPro ? 'bg-purple-50/50 border-purple-100' : isLite ? 'bg-amber-50/50 border-amber-100' : 'bg-emerald-50/50 border-emerald-100'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-stone-900">
                        {modelId}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-stone-200 text-stone-600 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {result.latencyMs}ms
                      </span>
                    </div>

                    {/* Overall Rubric Score */}
                    <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-stone-200/50">
                      <span className="text-xs text-stone-500 font-medium">Evaluation Score</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-stone-900 font-mono">
                          {result.rubric.overallScore}%
                        </span>
                        <span className="text-[10px] text-stone-400">composite</span>
                      </div>
                    </div>

                    {/* Score Progress Bar */}
                    <div className="w-full h-1.5 bg-stone-100 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          result.rubric.overallScore >= 95
                            ? 'bg-emerald-500'
                            : result.rubric.overallScore >= 90
                            ? 'bg-indigo-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${result.rubric.overallScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Rubric Breakdown Grid */}
                  <div className="p-4 bg-[#FAF9F7]/70 border-b border-stone-100 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-white border border-stone-150">
                      <span className="text-stone-400 block text-[10px]">Correctness</span>
                      <span className="font-bold text-stone-900 font-mono">{result.rubric.correctness}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-stone-150">
                      <span className="text-stone-400 block text-[10px]">Instruction Follow</span>
                      <span className="font-bold text-stone-900 font-mono">{result.rubric.instructionFollowing}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-stone-150">
                      <span className="text-stone-400 block text-[10px]">Hallucination Resist</span>
                      <span className="font-bold text-stone-900 font-mono">{result.rubric.hallucinationResistance}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-stone-150">
                      <span className="text-stone-400 block text-[10px]">Code / Logic Quality</span>
                      <span className="font-bold text-stone-900 font-mono">{result.rubric.codeQuality}%</span>
                    </div>
                  </div>

                  {/* Model Output Body */}
                  <div className="p-4 flex-1 overflow-y-auto max-h-[380px] space-y-2 text-xs text-stone-800 leading-relaxed font-sans whitespace-pre-wrap">
                    {result.text}
                  </div>

                  {/* Critique Footer */}
                  <div className="p-3 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-600">
                    <p className="line-clamp-3">
                      <strong>Audit Critique:</strong> {result.rubric.critique}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Evaluator Notes & Signature Box */}
          <div className="bg-white border border-[#EBE8E3] rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#0F4A3E]" />
                <span>Candidate Annotation & Evaluation Findings:</span>
              </span>
              <span className="text-xs text-stone-500 font-mono">
                Evaluator: <strong>Ketan Kaushikbhai Bhoi</strong> (B.Tech IT)
              </span>
            </div>
            <textarea
              rows={3}
              value={humanNotes}
              onChange={(e) => setHumanNotes(e.target.value)}
              placeholder="e.g. Gemini 3.1 Pro preview correctly identified the fragile base class double-increment issue and used an explicit forwarding class. Flash Lite was 4x faster and suitable for real-time validation..."
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F4A3E] focus:bg-white resize-none"
            />
            <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
              <span>Included in exported benchmark dossiers and recruiter proof-of-work packets.</span>
              <button
                onClick={handleCopyReport}
                className="text-[#0F4A3E] hover:underline font-bold cursor-pointer"
              >
                Copy Markdown Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
