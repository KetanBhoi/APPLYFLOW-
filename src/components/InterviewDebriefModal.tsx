import React, { useState } from 'react';
import {
  JobApplication,
  InterviewRoundLog,
  InterviewRoundType,
  LoggedInterviewQuestion,
  StandingRule
} from '../types/job';
import { generateDebriefThankYou } from '../services/geminiService';
import {
  Users,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  Copy,
  Check,
  X,
  Mail,
  Send,
  Star,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

interface InterviewDebriefModalProps {
  application: JobApplication;
  standingRules: StandingRule[];
  onClose: () => void;
  onUpdateApplication: (updated: JobApplication) => void;
}

const ROUND_TYPES: { id: InterviewRoundType; label: string; icon: string }[] = [
  { id: 'recruiter_screen', label: 'Recruiter Screening', icon: '📞' },
  { id: 'technical_coding', label: 'Technical Coding / DSA', icon: '💻' },
  { id: 'system_design', label: 'System Design & Architecture', icon: '📐' },
  { id: 'hiring_manager', label: 'Hiring Manager Deep Dive', icon: '🤝' },
  { id: 'leadership_culture', label: 'Leadership & Behavioral', icon: '🧭' },
  { id: 'executive_panel', label: 'Executive / VP Final Panel', icon: '🏛️' },
  { id: 'case_study', label: 'Take-Home / Live Case Study', icon: '📊' }
];

export const InterviewDebriefModal: React.FC<InterviewDebriefModalProps> = ({
  application,
  standingRules,
  onClose,
  onUpdateApplication
}) => {
  const [rounds, setRounds] = useState<InterviewRoundLog[]>(
    application.interviewRounds || [
      {
        id: 'round-1',
        roundType: 'recruiter_screen',
        roundName: 'Initial Talent Partner Screen',
        interviewerName: 'Sarah Jenkins',
        interviewerTitle: 'Senior Technical Recruiter',
        date: new Date().toISOString().split('T')[0],
        durationMinutes: 30,
        questions: [
          {
            id: 'q-1',
            question: 'Walk me through your most complex frontend architectural challenge.',
            answerSummary:
              'Discussed MetroMart multi-vendor cart state synchronization and 42% latency cut using client-side caching.',
            category: 'technical',
            confidence: 'high'
          },
          {
            id: 'q-2',
            question: 'What are your compensation expectations and timeline?',
            answerSummary:
              'Stated target range aligned with market benchmarks and noted active final rounds.',
            category: 'scenario',
            confidence: 'high'
          }
        ],
        whatWentWell:
          'Clear technical articulation, strong rapport, demonstrated deep alignment with the company product.',
        areasToImprove:
          'Keep compensation answer slightly more open to total compensation trade-offs.',
        followUpPromises:
          'Promised to send portfolio GitHub repo link with real-time WebSocket demo.',
        selfRating: 5,
        createdAt: new Date().toISOString()
      }
    ]
  );

  const [selectedRoundId, setSelectedRoundId] = useState<string>(
    rounds[0]?.id || ''
  );
  const [isAddingRound, setIsAddingRound] = useState(false);
  const [isGeneratingThankYou, setIsGeneratingThankYou] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New Round Form State
  const [newRoundType, setNewRoundType] = useState<InterviewRoundType>('technical_coding');
  const [newInterviewerName, setNewInterviewerName] = useState('');
  const [newInterviewerTitle, setNewInterviewerTitle] = useState('Staff Engineer');
  const [newDuration, setNewDuration] = useState(45);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newAnswerSummary, setNewAnswerSummary] = useState('');
  const [newConfidence, setNewConfidence] = useState<'high' | 'medium' | 'low'>('high');
  const [newCategory, setNewCategory] = useState<'technical' | 'behavioral' | 'architecture' | 'culture' | 'scenario'>('technical');
  const [tempQuestions, setTempQuestions] = useState<LoggedInterviewQuestion[]>([]);
  const [newWentWell, setNewWentWell] = useState('');
  const [newImprove, setNewImprove] = useState('');
  const [newPromises, setNewPromises] = useState('');
  const [newRating, setNewRating] = useState(4);

  const activeRound = rounds.find((r) => r.id === selectedRoundId) || rounds[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddTempQuestion = () => {
    if (!newQuestionText.trim()) return;
    const newQ: LoggedInterviewQuestion = {
      id: `q-${Date.now()}`,
      question: newQuestionText.trim(),
      answerSummary: newAnswerSummary.trim(),
      category: newCategory,
      confidence: newConfidence
    };
    setTempQuestions([...tempQuestions, newQ]);
    setNewQuestionText('');
    setNewAnswerSummary('');
  };

  const handleSaveNewRound = () => {
    if (!newInterviewerName.trim()) return;

    const roundTypeLabel = ROUND_TYPES.find((t) => t.id === newRoundType)?.label || 'Interview Round';
    const newRound: InterviewRoundLog = {
      id: `round-${Date.now()}`,
      roundType: newRoundType,
      roundName: roundTypeLabel,
      interviewerName: newInterviewerName.trim(),
      interviewerTitle: newInterviewerTitle.trim(),
      date: new Date().toISOString().split('T')[0],
      durationMinutes: newDuration,
      questions: tempQuestions,
      whatWentWell: newWentWell.trim(),
      areasToImprove: newImprove.trim(),
      followUpPromises: newPromises.trim(),
      selfRating: newRating,
      createdAt: new Date().toISOString()
    };

    const updated = [newRound, ...rounds];
    setRounds(updated);
    setSelectedRoundId(newRound.id);
    setIsAddingRound(false);

    // Reset form
    setNewInterviewerName('');
    setTempQuestions([]);
    setNewWentWell('');
    setNewImprove('');
    setNewPromises('');

    // Persist to parent
    const timelineEntry = {
      id: `act-${Date.now()}`,
      type: 'interview' as const,
      date: new Date().toISOString().split('T')[0],
      description: `Logged debrief for ${roundTypeLabel} with ${newRound.interviewerName}`,
      details: `${newRound.questions.length} questions logged. Self-rating: ${newRound.selfRating}/5 stars.`
    };

    onUpdateApplication({
      ...application,
      interviewRounds: updated,
      activityTimeline: [timelineEntry, ...(application.activityTimeline || [])],
      updatedAt: new Date().toISOString()
    });
  };

  const handleDeleteRound = (roundId: string) => {
    const updated = rounds.filter((r) => r.id !== roundId);
    setRounds(updated);
    if (selectedRoundId === roundId) {
      setSelectedRoundId(updated[0]?.id || '');
    }
    onUpdateApplication({
      ...application,
      interviewRounds: updated,
      updatedAt: new Date().toISOString()
    });
  };

  const handleGenerateThankYou = async () => {
    if (!activeRound) return;
    setIsGeneratingThankYou(true);
    try {
      const resp = await generateDebriefThankYou({
        roundLog: activeRound,
        jobTitle: application.role,
        company: application.company,
        interviewerName: activeRound.interviewerName,
        interviewerRole: activeRound.interviewerTitle,
        standingRules: standingRules.filter((r) => r.enabled).map((r) => `${r.title}: ${r.instruction}`)
      });

      const updatedRounds = rounds.map((r) => {
        if (r.id === activeRound.id) {
          return {
            ...r,
            thankYouNoteDraft: resp.result
          };
        }
        return r;
      });

      setRounds(updatedRounds);
      onUpdateApplication({
        ...application,
        interviewRounds: updatedRounds,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to generate thank you note:', err);
    } finally {
      setIsGeneratingThankYou(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-stone-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white text-stone-900 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-amber-400">Executive Debrief & Round Logger</span>
                <span className="text-xs px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-mono">
                  {rounds.length} Round{rounds.length === 1 ? '' : 's'} Tracked
                </span>
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
              onClick={() => setIsAddingRound(!isAddingRound)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log New Round</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row bg-stone-50/50">
          {/* Sidebar: Rounds List */}
          <div className="w-full md:w-80 border-r border-stone-200 bg-white p-4 space-y-2 shrink-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-2 mb-2">
              Interview Timeline
            </div>

            {rounds.length === 0 ? (
              <div className="p-4 text-center text-xs text-stone-400 border border-dashed border-stone-200 rounded-xl">
                No rounds logged yet. Click "Log New Round" to record your first debrief.
              </div>
            ) : (
              rounds.map((round) => {
                const isSelected = round.id === selectedRoundId && !isAddingRound;
                const typeObj = ROUND_TYPES.find((t) => t.id === round.roundType);

                return (
                  <div
                    key={round.id}
                    onClick={() => {
                      setSelectedRoundId(round.id);
                      setIsAddingRound(false);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-600 shadow-sm ring-1 ring-amber-500/20'
                        : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{typeObj?.icon || '📝'}</span>
                        <span className="font-semibold text-xs text-stone-900 truncate">
                          {round.roundName}
                        </span>
                      </div>
                      <div className="flex items-center text-amber-600 text-xs font-bold">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span className="ml-0.5">{round.selfRating}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-600 truncate">{round.interviewerName} • {round.interviewerTitle}</div>
                    <div className="flex items-center justify-between text-[10px] text-stone-400 mt-2 font-mono">
                      <span>{round.date}</span>
                      <span>{round.durationMinutes} min</span>
                      <span>{round.questions.length} questions</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            {isAddingRound ? (
              /* Add Round Form */
              <div className="max-w-2xl mx-auto space-y-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-stone-900">Log Interview Round Debrief</h3>
                    <p className="text-xs text-stone-500">Record immediate notes, questions asked, and commitments while fresh.</p>
                  </div>
                  <button
                    onClick={() => setIsAddingRound(false)}
                    className="text-xs text-stone-400 hover:text-stone-700"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">Round Type</label>
                    <select
                      value={newRoundType}
                      onChange={(e) => setNewRoundType(e.target.value as InterviewRoundType)}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      {ROUND_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.icon} {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">Interviewer Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. David Lin"
                      value={newInterviewerName}
                      onChange={(e) => setNewInterviewerName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">Interviewer Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Engineering Director"
                      value={newInterviewerTitle}
                      onChange={(e) => setNewInterviewerTitle(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Question Logger Subsection */}
                <div className="border-t border-stone-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-700">Questions Asked & Answers</span>
                    <span className="text-[11px] text-stone-400 font-mono">{tempQuestions.length} added</span>
                  </div>

                  <div className="space-y-2 p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <input
                      type="text"
                      placeholder="Question: e.g. How do you mitigate cache stampede in high-concurrency Node.js?"
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white text-stone-800"
                    />
                    <textarea
                      placeholder="Your answer summary / key technical points covered..."
                      value={newAnswerSummary}
                      onChange={(e) => setNewAnswerSummary(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white text-stone-800"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as any)}
                          className="text-[11px] p-1.5 rounded border border-stone-300 bg-white"
                        >
                          <option value="technical">Technical</option>
                          <option value="architecture">Architecture</option>
                          <option value="behavioral">Behavioral</option>
                          <option value="culture">Culture</option>
                          <option value="scenario">Scenario</option>
                        </select>
                        <select
                          value={newConfidence}
                          onChange={(e) => setNewConfidence(e.target.value as any)}
                          className="text-[11px] p-1.5 rounded border border-stone-300 bg-white"
                        >
                          <option value="high">High Confidence</option>
                          <option value="medium">Medium Confidence</option>
                          <option value="low">Low Confidence</option>
                        </select>
                      </div>
                      <button
                        onClick={handleAddTempQuestion}
                        className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Question</span>
                      </button>
                    </div>
                  </div>

                  {/* List of Temp Questions */}
                  {tempQuestions.length > 0 && (
                    <div className="space-y-1.5">
                      {tempQuestions.map((q, idx) => (
                        <div key={q.id} className="p-2.5 rounded-lg bg-white border border-stone-200 text-xs flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-stone-900">
                              {idx + 1}. {q.question}
                            </div>
                            {q.answerSummary && (
                              <div className="text-stone-600 mt-0.5 text-[11px]">{q.answerSummary}</div>
                            )}
                          </div>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 shrink-0">
                            {q.confidence}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post-Round Debrief Notes */}
                <div className="space-y-3 border-t border-stone-100 pt-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">What Went Well</label>
                    <input
                      type="text"
                      placeholder="e.g. Crisp explanation of state machine; connected with interviewer on distributed tracing."
                      value={newWentWell}
                      onChange={(e) => setNewWentWell(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">Areas to Sharpen / Unresolved Topics</label>
                    <input
                      type="text"
                      placeholder="e.g. Inquire more into how on-call escalation is triaged."
                      value={newImprove}
                      onChange={(e) => setNewImprove(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      Action Items & Follow-up Promises
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Email link to open-source repository; clarify database shard split strategy."
                      value={newPromises}
                      onChange={(e) => setNewPromises(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white text-stone-800"
                    />
                  </div>

                  {/* Self Rating */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">Overall Self-Rating</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1 text-amber-500 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-500' : 'text-stone-300'}`} />
                        </button>
                      ))}
                      <span className="text-xs text-stone-500 font-mono ml-2">{newRating} / 5 Stars</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                  <button
                    onClick={() => setIsAddingRound(false)}
                    className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewRound}
                    disabled={!newInterviewerName.trim()}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50"
                  >
                    Save Round Debrief
                  </button>
                </div>
              </div>
            ) : activeRound ? (
              /* Active Round Detail View */
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Round Header Card */}
                <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                          {activeRound.roundName}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-mono">
                          {activeRound.durationMinutes} Minutes
                        </span>
                      </div>
                      <h3 className="text-lg font-serif font-bold text-stone-900 mt-1">
                        {activeRound.interviewerName}
                        <span className="text-sm font-sans font-normal text-stone-500 ml-2">
                          ({activeRound.interviewerTitle})
                        </span>
                      </h3>
                      <div className="text-xs text-stone-400 mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {activeRound.date}
                        </span>
                        <span>•</span>
                        <div className="flex items-center gap-0.5 text-amber-600 font-bold">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < activeRound.selfRating
                                  ? 'fill-amber-500 text-amber-500'
                                  : 'text-stone-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleGenerateThankYou}
                        disabled={isGeneratingThankYou}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${isGeneratingThankYou ? 'animate-spin' : ''}`} />
                        <span>Generate Thank-You Note</span>
                      </button>
                      <button
                        onClick={() => handleDeleteRound(activeRound.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Delete round"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Debrief Observations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-stone-100">
                    <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-950">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                        What Went Well
                      </span>
                      <p>{activeRound.whatWentWell || 'Strong overall engagement'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-100 text-xs text-amber-950">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                        Areas to Sharpen / Next Round Prep
                      </span>
                      <p>{activeRound.areasToImprove || 'No immediate blockers noted'}</p>
                    </div>
                  </div>

                  {activeRound.followUpPromises && (
                    <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-950">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block mb-1">
                        Follow-Up Commitments Promised to Interviewer
                      </span>
                      <p>{activeRound.followUpPromises}</p>
                    </div>
                  )}
                </div>

                {/* Questions Logged */}
                <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Questions Discussed ({activeRound.questions.length})
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">Real Interview Data</span>
                  </div>

                  <div className="space-y-3">
                    {activeRound.questions.map((q, idx) => (
                      <div key={q.id} className="p-3 rounded-lg bg-stone-50 border border-stone-200/80 text-xs space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-stone-900">
                            Q{idx + 1}: {q.question}
                          </div>
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold shrink-0 ${
                              q.confidence === 'high'
                                ? 'bg-emerald-100 text-emerald-800'
                                : q.confidence === 'medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {q.confidence} confidence
                          </span>
                        </div>
                        {q.answerSummary && (
                          <div className="text-stone-700 bg-white p-2.5 rounded border border-stone-100 text-[11px] leading-relaxed">
                            <strong>Candidate Delivery:</strong> {q.answerSummary}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Thank You Note Draft (if generated) */}
                {activeRound.thankYouNoteDraft && (
                  <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                          Tailored Post-Interview Thank-You & Technical Clarification Memo
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(activeRound.thankYouNoteDraft!.body, 'thank_you')}
                          className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1"
                        >
                          {copiedKey === 'thank_you' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'thank_you' ? 'Copied' : 'Copy Email'}</span>
                        </button>
                        <a
                          href={`mailto:?subject=${encodeURIComponent(activeRound.thankYouNoteDraft.subject)}&body=${encodeURIComponent(activeRound.thankYouNoteDraft.body)}`}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Open in Mail</span>
                        </a>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-mono text-stone-500 bg-stone-50 p-2 rounded border border-stone-100">
                        <strong>Subject:</strong> {activeRound.thankYouNoteDraft.subject}
                      </div>
                      <div className="text-xs text-stone-800 bg-stone-50/50 p-4 rounded-lg border border-stone-200/80 whitespace-pre-line leading-relaxed font-sans">
                        {activeRound.thankYouNoteDraft.body}
                      </div>
                    </div>

                    {activeRound.thankYouNoteDraft.talkingPointsReinforced && (
                      <div className="text-[11px] text-stone-500 pt-1">
                        <strong>Reinforced Anchors:</strong>{' '}
                        {activeRound.thankYouNoteDraft.talkingPointsReinforced.join(' • ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-stone-400">
                Select a round on the left or click "Log New Round".
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>ApplyFlow Interview Intelligence</span>
            <span>•</span>
            <span>Post-Interview SLA Tracker</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
