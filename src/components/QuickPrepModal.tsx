import React, { useState, useEffect } from 'react';
import {
  JobApplication,
  UserProfile,
  StandingRule,
  StarQuestion
} from '../types/job';
import {
  generateStarAnswer,
  StarAnswerResult
} from '../services/geminiService';
import {
  X,
  Sparkles,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Building2,
  Briefcase,
  AlertTriangle,
  Lightbulb,
  Save,
  HelpCircle,
  FileCheck2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface QuickPrepModalProps {
  application: JobApplication;
  userProfile: UserProfile;
  standingRules: StandingRule[];
  onClose: () => void;
  onSaveToQuestions: (starQuestion: StarQuestion) => void;
}

const DEFAULT_PRESET_QUESTIONS = [
  'Tell me about a complex project where you made architectural trade-offs under a tight deadline.',
  'Describe a high-severity production outage or bug and how you diagnosed, resolved, and prevented it.',
  'How do you navigate pushback or conflict with Product Managers or Designers when technical feasibility conflicts with design?',
  'Tell me about a time you had to deliver under ambiguous or rapidly shifting requirements.',
  'Why are you specifically interested in joining our engineering team at this stage?'
];

export const QuickPrepModal: React.FC<QuickPrepModalProps> = ({
  application,
  userProfile,
  standingRules,
  onClose,
  onSaveToQuestions,
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState(DEFAULT_PRESET_QUESTIONS[0]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [starResult, setStarResult] = useState<StarAnswerResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [savedToCards, setSavedToCards] = useState(false);

  // 2-minute mock practice timer (120 seconds)
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const enabledRuleStrings = standingRules.filter((r) => r.enabled).map((r) => `${r.title}: ${r.instruction}`);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const activeQuestionText = customQuestion.trim() || selectedQuestion;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSavedToCards(false);
    try {
      const resp = await generateStarAnswer({
        question: activeQuestionText,
        jobTitle: application.role,
        company: application.company,
        jobDescription: application.jobDescription,
        userProfile,
        standingRules: enabledRuleStrings
      });
      setStarResult(resp.result);
      // Reset timer to 120s for new rehearsal
      setTimerSeconds(120);
      setIsTimerRunning(false);
    } catch (err) {
      console.error('Failed to generate STAR answer:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate on first mount automatically for the default question
  useEffect(() => {
    handleGenerate();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveToFlashcards = () => {
    if (!starResult) return;

    const newQuestion: StarQuestion = {
      id: `q-${Date.now()}`,
      question: starResult.question,
      category: 'Behavioral / Technical STAR',
      interviewerIntent: starResult.interviewerIntent,
      starGuide: {
        situation: starResult.situation,
        task: starResult.task,
        action: starResult.action,
        result: starResult.result,
      },
      pitfallsToAvoid: starResult.pitfallsToAvoid,
      userNotes: starResult.verbatimScript,
    };

    onSaveToQuestions(newQuestion);
    setSavedToCards(true);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${String(remainingSecs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl shadow-purple-950/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>STAR Quick Prep Studio</span>
              <span className="text-[10px] text-purple-400/80 font-mono">• Gemini 3.8 Flash</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Interview Answer Generator: {application.role}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
              <span className="flex items-center gap-1 font-medium text-purple-300">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                {application.company}
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Grounded in {userProfile.fullName}&apos;s verified project experiences
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Quick Prep Studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Question Selection Bar */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              1. Select or Enter the Interview Question to Tackle
            </label>

            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_PRESET_QUESTIONS.map((q, idx) => {
                const isSelected = selectedQuestion === q && !customQuestion.trim();
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedQuestion(q);
                      setCustomQuestion('');
                    }}
                    className={`text-xs px-3 py-1.5 rounded-xl text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-purple-600/30 text-purple-200 border-purple-500/50 font-medium'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850'
                    }`}
                  >
                    Question {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={customQuestion || selectedQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Or type any specific question (e.g. 'Why Linear?', 'Walk me through a WebSockets bug')..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-purple-300" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-purple-300" />
                    <span>Generate STAR Answer</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated STAR Output */}
          {starResult && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Question Intent & Trap Header */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-slate-300">
                  <div className="flex items-center gap-1.5 text-purple-300 font-semibold mb-1">
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    <span>What the Interviewer is Evaluating</span>
                  </div>
                  <p className="leading-relaxed text-slate-300">{starResult.interviewerIntent}</p>
                </div>

                <div className="bg-rose-950/20 p-3.5 rounded-xl border border-rose-500/20 text-rose-300">
                  <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Common Trap to Avoid</span>
                  </div>
                  <p className="leading-relaxed text-rose-200/90">{starResult.pitfallsToAvoid}</p>
                </div>
              </div>

              {/* STAR 4-Quadrant Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                    2. Structured STAR Breakdown (Real Experiences from Resume)
                  </h4>
                  <button
                    onClick={() =>
                      handleCopy(
                        `Question: ${starResult.question}\n\nSituation: ${starResult.situation}\n\nTask: ${starResult.task}\n\nAction: ${starResult.action}\n\nResult: ${starResult.result}`,
                        'star-matrix'
                      )
                    }
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'star-matrix' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Breakdown</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* S */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                    <span className="text-xs font-bold uppercase text-indigo-400 flex items-center gap-1.5 font-mono">
                      <span className="w-5 h-5 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300 text-[10px]">
                        S
                      </span>
                      Situation
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {starResult.situation}
                    </p>
                  </div>

                  {/* T */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                    <span className="text-xs font-bold uppercase text-cyan-400 flex items-center gap-1.5 font-mono">
                      <span className="w-5 h-5 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300 text-[10px]">
                        T
                      </span>
                      Task & Hurdle
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {starResult.task}
                    </p>
                  </div>

                  {/* A */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5 md:col-span-2">
                    <span className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5 font-mono">
                      <span className="w-5 h-5 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300 text-[10px]">
                        A
                      </span>
                      Actions & Architectural Decisions
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {starResult.action}
                    </p>
                  </div>

                  {/* R */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5 md:col-span-2">
                    <span className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5 font-mono">
                      <span className="w-5 h-5 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300 text-[10px]">
                        R
                      </span>
                      Measurable Result (XYZ Formula)
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                      {starResult.result}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Verbatim Spoken Script & 2-Minute Practice Timer */}
              <div className="bg-gradient-to-br from-slate-950 to-purple-950/30 border border-purple-500/30 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>3. Verbatim 60-Second Read-Aloud Script</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Practice delivering this response out loud. Aim for ~60 to 90 seconds without filler words.
                    </p>
                  </div>

                  {/* Stopwatch / 2-Minute Practice Rehearsal */}
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 shrink-0 self-start sm:self-auto">
                    <span className="text-xs text-slate-400 font-medium">Practice Timer:</span>
                    <span
                      className={`font-mono font-bold text-sm ${
                        timerSeconds < 30 ? 'text-rose-400' : 'text-purple-300'
                      }`}
                    >
                      {formatTimer(timerSeconds)}
                    </span>
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="p-1 rounded-lg bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 hover:text-white transition-colors"
                      title={isTimerRunning ? 'Pause timer' : 'Start rehearsal timer'}
                    >
                      {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSeconds(120);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Reset timer to 2:00"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Verbatim Script Box */}
                <div className="bg-slate-900/90 p-4 rounded-xl border border-purple-500/20 text-xs sm:text-sm text-slate-100 leading-relaxed font-sans shadow-inner">
                  &quot;{starResult.verbatimScript}&quot;
                </div>

                {/* Delivery Pro-Tip */}
                <div className="flex items-start gap-2 text-xs text-purple-200/90 bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                  <Lightbulb className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-purple-300">Delivery Tip: </span>
                    {starResult.proTip}
                  </div>
                </div>

                {/* Actions: Copy & Save */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => handleCopy(starResult.verbatimScript, 'spoken-script')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'spoken-script' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Copied Spoken Script!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Spoken Script</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSaveToFlashcards}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {savedToCards ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Saved to Interview Prep Tab!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save to Interview Cards</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs text-slate-400">
          <span>Targeting {application.company} • All answers follow XYZ quantifiable metrics</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Close Studio
          </button>
        </div>
      </div>
    </div>
  );
};
