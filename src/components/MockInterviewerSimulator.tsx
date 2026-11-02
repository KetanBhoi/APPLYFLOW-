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
      <div className="bg-white border border-[#EBE8E3] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#0F4A3E] text-xs font-semibold border border-emerald-200">
              <Zap className="w-3.5 h-3.5 text-[#0F4A3E]" />
              <span>Interactive AI Mock Interviewer & Speech Feedback</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              Live Mock Interview Simulator
            </h1>
            <p className="text-stone-600 text-sm leading-relaxed">
              Practice real-time technical and behavioral rounds with an AI Hiring Manager tailored to{' '}
              <strong className="text-stone-900">{company}</strong>. Receive immediate analytics on response duration (target: 60–90s), filler words, and metrics clarity.
            </p>
          </div>

          {/* Role & Track Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {applications.length > 0 && (
              <div className="relative">
                <select
                  value={selectedAppId}
                  onChange={(e) => handleSelectApp(e.target.value)}
                  className="bg-stone-50 border border-stone-200 text-stone-800 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4A3E] cursor-pointer pr-8"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.company} — {app.role}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Simulator Chat & Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CHAT LOG (Left 8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-[#EBE8E3] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col h-[650px]">
          
          {/* Active Session Info Banner */}
          <div className="pb-4 border-b border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0F4A3E]" />
              <span className="text-stone-900 font-semibold">{company}</span>
              <span>•</span>
              <span className="text-stone-600">{role}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[#0F4A3E] font-medium">Hiring Manager Live</span>
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
                  <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-stone-500">
                    <span className="font-semibold text-stone-700">
                      {isAi ? `${company} Hiring Manager` : userProfile.fullName}
                    </span>
                    <span>{msg.timestamp}</span>
                    {isAi && (
                      <button
                        onClick={() => speakText(msg.text)}
                        className="text-[#0F4A3E] hover:text-[#0B382F] transition-colors cursor-pointer"
                        title="Read question out loud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[88%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isAi
                        ? 'bg-[#FAF9F7] border border-[#EBE8E3] text-stone-800'
                        : 'bg-[#0F4A3E] text-white font-normal'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Turn Delivery Analytics Badge (for candidate message) */}
                  {!isAi && msg.feedback && (
                    <div className="mt-2.5 max-w-[88%] bg-[#FAF9F7] border border-[#EBE8E3] rounded-2xl p-3.5 space-y-2 text-xs text-stone-700 animate-in fade-in">
                      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-2">
                        <span className="font-bold text-stone-900 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-[#0F4A3E]" />
                          Delivery Scorecard:
                        </span>

                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-mono">
                          ⏱️ {msg.feedback.durationSeconds}s
                        </span>

                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#0F4A3E] border border-emerald-200 font-semibold font-mono">
                          Confidence: {msg.feedback.confidenceRating}%
                        </span>

                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200 font-semibold font-mono">
                          Metric Clarity: {msg.feedback.clarityScore}%
                        </span>

                        {msg.feedback.fillerWordsDetected && msg.feedback.fillerWordsDetected.length > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px]">
                            Fillers: {msg.feedback.fillerWordsDetected.join(', ')}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#0F4A3E] border border-emerald-200 text-[11px]">
                            Clean delivery (0 fillers)
                          </span>
                        )}
                      </div>

                      {msg.feedback.strengths && (
                        <div className="space-y-0.5">
                          {msg.feedback.strengths.map((s, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-stone-700">
                              <CheckCircle2 className="w-3 h-3 text-[#0F4A3E] shrink-0" />
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.feedback.improvementTip && (
                        <div className="flex items-start gap-1.5 text-stone-800 pt-1 border-t border-stone-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-stone-900">Coaching Tip: </strong>
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
              <div className="flex items-center gap-2 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-[#0F4A3E] animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-[#0F4A3E]" />
                <span>Hiring Manager is evaluating your answer and formulating follow-up...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Candidate Answer Input Form */}
          <form onSubmit={handleSubmitAnswer} className="pt-3 border-t border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-700">Your Answer:</span>
                <span
                  className={`font-mono px-2 py-0.5 rounded text-xs font-bold ${
                    timerSeconds > 90
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : timerSeconds >= 60
                      ? 'bg-emerald-50 text-[#0F4A3E] border border-emerald-200'
                      : 'bg-stone-100 text-stone-700 border border-stone-200'
                  }`}
                >
                  <Clock className="w-3 h-3 inline mr-1" />
                  {formatTimer(timerSeconds)}
                </span>
                <span className="text-[11px] text-stone-400 hidden sm:inline">
                  (Target 60–90 seconds)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTiming(!isTiming)}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {isTiming ? <Square className="w-3 h-3 text-amber-600" /> : <Play className="w-3 h-3 text-[#0F4A3E]" />}
                  <span>{isTiming ? 'Pause' : 'Start Timer'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleMic}
                  className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                    isListeningMic
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                  }`}
                  title="Toggle Microphone speech-to-text"
                >
                  {isListeningMic ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5 text-stone-500" />}
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
                className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0F4A3E] resize-none font-sans"
              />
              <button
                type="submit"
                disabled={isSubmitting || !currentAnswer.trim()}
                className="px-5 rounded-2xl bg-[#0F4A3E] hover:bg-[#0B382F] disabled:opacity-50 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
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
          <div className="bg-white border border-[#EBE8E3] rounded-3xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-semibold uppercase text-stone-500 tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0F4A3E]" />
              <span>Interview Benchmark Rules</span>
            </h4>

            <div className="space-y-2.5 text-xs text-stone-700">
              <div className="p-3 bg-[#FAF9F7] rounded-xl border border-[#EBE8E3] space-y-1">
                <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#0F4A3E]" />
                  Target Duration: 60 - 90 Seconds
                </span>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Answers under 45s lack depth; answers over 2 minutes cause interviewer fatigue. Keep it crisp!
                </p>
              </div>

              <div className="p-3 bg-[#FAF9F7] rounded-xl border border-[#EBE8E3] space-y-1">
                <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#0F4A3E]" />
                  Google XYZ Formula
                </span>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Always close with: &quot;Accomplished [X], as measured by [Y], by doing [Z].&quot; Include exact percentages or latency numbers.
                </p>
              </div>

              <div className="p-3 bg-[#FAF9F7] rounded-xl border border-[#EBE8E3] space-y-1">
                <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Zero Filler Words
                </span>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Eliminate &quot;um&quot;, &quot;like&quot;, &quot;basically&quot;, &quot;you know&quot;. When formulating thoughts, pause silently instead.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Audio Controls & Presets */}
          <div className="bg-white border border-[#EBE8E3] rounded-3xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-semibold uppercase text-stone-500 tracking-wider">
              Quick Audio & Voice Settings
            </h4>
            <div className="flex items-center justify-between p-3 bg-[#FAF9F7] rounded-xl border border-[#EBE8E3]">
              <span className="text-xs text-stone-700">Voice Synthesis (AI Read-Aloud)</span>
              <button
                onClick={() => {
                  const lastAiMsg = [...messages].reverse().find((m) => m.sender === 'ai_interviewer');
                  if (lastAiMsg) speakText(lastAiMsg.text);
                }}
                className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#0F4A3E] text-xs font-medium border border-emerald-200 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#0F4A3E]" />
                <span>Test Voice</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
