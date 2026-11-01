import React, { useState, useEffect, useRef } from 'react';
import {
  UserProfile,
  JobApplication,
  MockInterviewMessage
} from '../types/job';
import { sendMockInterviewTurn } from '../services/geminiService';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Send,
  Building2,
  RefreshCw,
  Zap,
  ChevronDown
} from 'lucide-react';

interface MockInterviewerSimulatorProps {
  userProfile: UserProfile;
  applications: JobApplication[];
  initialApp?: JobApplication;
  onClose?: () => void;
}

export const MockInterviewerSimulator: React.FC<MockInterviewerSimulatorProps> = ({
  userProfile,
  applications,
  initialApp,
  onClose,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(
    initialApp?.id || applications[0]?.id || ''
  );
  const activeApp = applications.find((a) => a.id === selectedAppId) || initialApp || applications[0];

  const [company, setCompany] = useState(activeApp?.company || 'Linear');
  const [role, setRole] = useState(activeApp?.role || 'Senior Frontend Engineer');
  const [interviewTrack, setInterviewTrack] = useState<string>('Technical Architecture & Trade-offs');

  // Messages log
  const [messages, setMessages] = useState<MockInterviewMessage[]>([
    {
      id: 'm1',
      sender: 'ai_interviewer',
      text: `Hello ${userProfile.fullName.split(' ')[0]}! Welcome to your interview for the ${activeApp?.role || 'Senior Frontend Engineer'} position at ${activeApp?.company || 'Linear'}. To kick things off: Tell me about a complex technical problem or project you owned recently where you had to make significant architectural trade-offs under tight delivery constraints.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTiming, setIsTiming] = useState(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSubmitting]);

  // Answer stopwatch
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTiming) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTiming]);

  // Sync when selected application changes
  const handleSelectApp = (id: string) => {
    setSelectedAppId(id);
    const app = applications.find((a) => a.id === id);
    if (app) {
      setCompany(app.company);
      setRole(app.role);
      // Restart session for new role
      setMessages([
        {
          id: `m-${Date.now()}`,
          sender: 'ai_interviewer',
          text: `Welcome to your interview for ${app.role} at ${app.company}. Let's dive straight into your technical background: Can you describe an incident where a production performance or reliability issue occurred, and how you diagnosed and resolved it?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setTimerSeconds(0);
      setIsTiming(false);
      setCurrentAnswer('');
    }
  };

  // Browser Speech Synthesis (Speak out loud)
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isVoiceSpeaking) {
      setIsVoiceSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsVoiceSpeaking(false);
    utterance.onerror = () => setIsVoiceSpeaking(false);
    setIsVoiceSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech Recognition (Mic to text)
  const toggleMic = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type your response.');
      return;
    }

    if (isListeningMic) {
      recognitionRef.current?.stop();
      setIsListeningMic(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListeningMic(true);
      if (!isTiming) setIsTiming(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        setCurrentAnswer((prev) => `${prev} ${finalTranscript}`.trim());
      }
    };

    recognition.onerror = () => setIsListeningMic(false);
    recognition.onend = () => setIsListeningMic(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Submit response
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAnswer.trim() || isSubmitting) return;

    if (isListeningMic) {
      recognitionRef.current?.stop();
      setIsListeningMic(false);
    }
    setIsTiming(false);

    const candidateMsg: MockInterviewMessage = {
      id: `c-${Date.now()}`,
      sender: 'candidate',
      text: currentAnswer.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedLog = [...messages, candidateMsg];
    setMessages(updatedLog);
    const answerToEval = currentAnswer.trim();
    const duration = timerSeconds || 65;

    setCurrentAnswer('');
    setTimerSeconds(0);
    setIsSubmitting(true);

    try {
      const lastAiQuestion =
        [...messages].reverse().find((m) => m.sender === 'ai_interviewer')?.text ||
        'Tell me about your technical project.';

      const resp = await sendMockInterviewTurn({
        jobTitle: role,
        company,
        question: lastAiQuestion,
        candidateAnswer: answerToEval,
        durationSeconds: duration,
        userProfile,
      });

      // Attach feedback to candidate message
      candidateMsg.feedback = resp.result.feedback;

      // Add AI follow-up message
      const nextAiMsg: MockInterviewMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai_interviewer',
        text: resp.result.nextQuestion || `Thanks for sharing. What metrics would you monitor in production to confirm this architectural choice remains optimal?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages([...updatedLog, nextAiMsg]);

      // Speak next question
      speakText(nextAiMsg.text);
    } catch (err) {
      console.error('Error submitting mock interview turn:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${mins}:${String(rem).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Simulator Header */}
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Interactive AI Mock Interviewer & Speech Feedback</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Live Mock Interview Simulator
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Practice real-time technical and behavioral rounds with an AI Hiring Manager tailored to{' '}
              <strong className="text-white">{company}</strong>. Receive immediate analytics on response duration (target: 60–90s), filler words, and metrics clarity.
            </p>
          </div>

          {/* Role & Track Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {applications.length > 0 && (
              <div className="relative">
                <select
                  value={selectedAppId}
                  onChange={(e) => handleSelectApp(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer pr-8"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.company} — {app.role}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Simulator Chat & Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CHAT LOG (Left 8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col h-[650px]">
          
          {/* Active Session Info Banner */}
          <div className="pb-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span className="text-white font-semibold">{company}</span>
              <span>•</span>
              <span className="text-slate-300">{role}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-medium">Hiring Manager Live</span>
            </div>
          </div>

          {/* Scrollable Transcript */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai_interviewer';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">
                      {isAi ? `${company} Hiring Manager` : userProfile.fullName}
                    </span>
                    <span>{msg.timestamp}</span>
                    {isAi && (
                      <button
                        onClick={() => speakText(msg.text)}
                        className="text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                        title="Read question out loud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[88%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                      isAi
                        ? 'bg-slate-950 border border-purple-500/30 text-purple-50'
                        : 'bg-purple-600 text-white font-normal'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Turn Delivery Analytics Badge (for candidate message) */}
                  {!isAi && msg.feedback && (
                    <div className="mt-2.5 max-w-[88%] bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs text-slate-300 animate-in fade-in">
                      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
                        <span className="font-bold text-slate-200 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                          Delivery Scorecard:
                        </span>

                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          ⏱️ {msg.feedback.durationSeconds}s
                        </span>

                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold font-mono">
                          Confidence: {msg.feedback.confidenceRating}%
                        </span>

                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold font-mono">
                          Metric Clarity: {msg.feedback.clarityScore}%
                        </span>

                        {msg.feedback.fillerWordsDetected && msg.feedback.fillerWordsDetected.length > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px]">
                            Fillers: {msg.feedback.fillerWordsDetected.join(', ')}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px]">
                            Clean delivery (0 fillers)
                          </span>
                        )}
                      </div>

                      {msg.feedback.strengths && (
                        <div className="space-y-0.5">
                          {msg.feedback.strengths.map((s, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-slate-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.feedback.improvementTip && (
                        <div className="flex items-start gap-1.5 text-purple-300 pt-1 border-t border-slate-800/80">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Coaching Tip: </strong>
                            {msg.feedback.improvementTip}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {isSubmitting && (
              <div className="flex items-center gap-2 p-3 bg-slate-950/60 rounded-xl border border-purple-500/20 text-xs text-purple-300 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                <span>Hiring Manager is evaluating your answer and formulating follow-up...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Candidate Answer Input Form */}
          <form onSubmit={handleSubmitAnswer} className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300">Your Answer:</span>
                <span
                  className={`font-mono px-2 py-0.5 rounded text-xs font-bold ${
                    timerSeconds > 90
                      ? 'bg-rose-500/20 text-rose-300'
                      : timerSeconds >= 60
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <Clock className="w-3 h-3 inline mr-1" />
                  {formatTimer(timerSeconds)}
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  (Target 60–90 seconds)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTiming(!isTiming)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {isTiming ? <Square className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                  <span>{isTiming ? 'Pause' : 'Start Timer'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleMic}
                  className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                    isListeningMic
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                  title="Toggle Microphone speech-to-text"
                >
                  {isListeningMic ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{isListeningMic ? 'Recording...' : 'Speech-to-Text'}</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <textarea
                rows={2}
                value={currentAnswer}
                onChange={(e) => {
                  setCurrentAnswer(e.target.value);
                  if (!isTiming && e.target.value.length > 0) {
                    setIsTiming(true);
                  }
                }}
                placeholder="Type or speak your answer here (e.g., using Situation, Task, Action, Result)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-sans"
              />
              <button
                type="submit"
                disabled={isSubmitting || !currentAnswer.trim()}
                className="px-5 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Submit</span>
              </button>
            </div>
          </form>
        </div>

        {/* SIDEBAR ANALYTICS & TIPS (Right 4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Target Practice Rules Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
            <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Interview Benchmark Rules</span>
            </h4>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  Target Duration: 60 - 90 Seconds
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Answers under 45s lack depth; answers over 2 minutes cause interviewer fatigue. Keep it crisp!
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Google XYZ Formula
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Always close with: &quot;Accomplished [X], as measured by [Y], by doing [Z].&quot; Include exact percentages or latency numbers.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  Zero Filler Words
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Eliminate &quot;um&quot;, &quot;like&quot;, &quot;basically&quot;, &quot;you know&quot;. When formulating thoughts, pause silently instead.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Audio Controls & Presets */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
            <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Quick Audio & Voice Settings
            </h4>
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-300">Voice Synthesis (AI Read-Aloud)</span>
              <button
                onClick={() => {
                  const lastAiMsg = [...messages].reverse().find((m) => m.sender === 'ai_interviewer');
                  if (lastAiMsg) speakText(lastAiMsg.text);
                }}
                className="px-3 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-medium border border-purple-500/30 flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Voice</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
