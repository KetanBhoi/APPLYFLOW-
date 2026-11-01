import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Shield,
  HelpCircle,
  Briefcase,
  FileText,
  DollarSign,
  Mic
} from 'lucide-react';
import { sendGeminiChatMessage, ChatMessageItem } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { UserProfile, StandingRule } from '../types/job';
import { db } from '../services/firebase';
import { doc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore';

interface GeminiChatbotProps {
  userProfile?: UserProfile;
  standingRules?: StandingRule[];
}

type ChatRole = 'career_coach' | 'ats_specialist' | 'mock_interviewer' | 'negotiator';
type GeminiModel = 'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite';

const INITIAL_MESSAGES: ChatMessageItem[] = [
  {
    id: 'intro-msg-1',
    role: 'model',
    content: `Hello! I am your **ApplyFlow AI Career Intelligence Coach** powered by Gemini.

I can help you:
- **Tailor and audit resume bullets** using Google's XYZ formula
- **Conduct rigorous STAR mock interviews** with follow-up questions
- **Formulate high-leverage compensation counter-offers** and negotiation scripts
- **Strategize pipeline velocity** and craft personalized recruiter outreach

Choose a coaching role and model above, or select a prompt starter below to begin!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    modelUsed: 'gemini-3.5-flash'
  }
];

const PROMPT_STARTERS: { label: string; role: ChatRole; text: string }[] = [
  {
    label: 'Audit my resume bullets',
    role: 'ats_specialist',
    text: 'Please review and audit this resume bullet to make it conform to the XYZ formula (Accomplished X, measured by Y, by doing Z): "Worked on backend APIs to make database queries run faster."'
  },
  {
    label: 'Mock interview challenge',
    role: 'mock_interviewer',
    text: 'Ask me a tough behavioral question for my target role, and evaluate my response using the STAR method.'
  },
  {
    label: 'Counter an offer',
    role: 'negotiator',
    text: 'I received an offer with a $140k base and $15k bonus. Market rate for my skills is $160k base. How should I structure my counter-offer email respectfully?'
  },
  {
    label: 'Breakthrough pipeline strategy',
    role: 'career_coach',
    text: 'I have applied to 20 roles with only 1 screening interview. What strategic changes should I make to my outreach and standing rules?'
  }
];

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  userProfile,
  standingRules = []
}) => {
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessageItem[]>(() => {
    try {
      const saved = localStorage.getItem('applyflow_gemini_chat');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const [inputText, setInputText] = useState('');
  const [selectedRole, setSelectedRole] = useState<ChatRole>('career_coach');
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-3.5-flash');
  const [customSystemInstruction, setCustomSystemInstruction] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Persist messages to localStorage and Firestore when available
  useEffect(() => {
    try {
      localStorage.setItem('applyflow_gemini_chat', JSON.stringify(messages));
    } catch {
      // safe fallback
    }

    if (user && messages.length > 1) {
      // Sync last message to Firestore
      try {
        const lastMsg = messages[messages.length - 1];
        const chatRef = doc(db, 'users', user.uid, 'chats', lastMsg.id);
        setDoc(chatRef, {
          ...lastMsg,
          userId: user.uid,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(() => {});
      } catch {
        // silent safe fallback
      }
    }
  }, [messages, user]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessageItem = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Format history for multi-turn Gemini conversation
      const conversationPayload = newMessages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const enabledRules = standingRules.filter((r) => r.enabled).map((r) => r.instruction);

      const response = await sendGeminiChatMessage({
        messages: conversationPayload,
        model: selectedModel,
        role: selectedRole,
        customSystemInstruction: customSystemInstruction.trim() || undefined,
        standingRules: enabledRules,
        userContext: userProfile ? {
          currentRole: userProfile.currentRole,
          headline: userProfile.headline,
          skills: userProfile.skills
        } : undefined
      });

      const assistantMessage: ChatMessageItem = {
        id: 'mod-' + Date.now(),
        role: 'model',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: response.modelUsed || selectedModel
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessageItem = {
        id: 'err-' + Date.now(),
        role: 'model',
        content: `I encountered an unexpected issue while generating a response. Please try sending your message again or switch models.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your conversation history?')) {
      setMessages(INITIAL_MESSAGES);
      localStorage.removeItem('applyflow_gemini_chat');
    }
  };

  const roleMeta = {
    career_coach: {
      name: 'Career Strategist',
      icon: <Briefcase className="w-3.5 h-3.5 text-emerald-700" />,
      desc: 'Pipeline velocity, high-leverage job search execution'
    },
    ats_specialist: {
      name: 'ATS & Resume Architect',
      icon: <FileText className="w-3.5 h-3.5 text-blue-700" />,
      desc: 'XYZ formula bullet points, keyword coverage, screening algorithms'
    },
    mock_interviewer: {
      name: 'Bar Raiser Interviewer',
      icon: <Mic className="w-3.5 h-3.5 text-purple-700" />,
      desc: 'Rigorous STAR behavioral and technical interview drill-downs'
    },
    negotiator: {
      name: 'Compensation Negotiator',
      icon: <DollarSign className="w-3.5 h-3.5 text-amber-700" />,
      desc: 'Offer analysis, counter-offer emails, RSU equity leverage'
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[600px] bg-white border border-[#EBE8E3] rounded-3xl shadow-xs overflow-hidden">
      {/* Top Header & Role Selector */}
      <div className="p-4 sm:p-5 border-b border-[#EBE8E3] bg-[#FAF9F7]/70 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F4A3E] flex items-center justify-center text-white shadow-xs shrink-0">
              <Bot className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg font-bold text-stone-900 leading-tight">
                  Gemini Career Coach
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DDF3EA] text-[#0F4A3E] font-semibold font-mono">
                  Multi-Turn
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {roleMeta[selectedRole].desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Model Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 shadow-xs">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as GeminiModel)}
                className="text-xs font-semibold text-stone-800 bg-transparent focus:outline-none cursor-pointer"
                title="Select Gemini Model"
              >
                <option value="gemini-3.5-flash">gemini-3.5-flash (General Tasks)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Tasks)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Tasks)</option>
              </select>
            </div>

            {/* Toggle System Instruction panel */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showConfig
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
              title="System Instructions & Standing Rules"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Role Config</span>
            </button>

            {/* Clear conversation button */}
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Clear chat history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Persona Pill Switchers */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-xs font-semibold text-stone-400 mr-1 hidden sm:inline">
            Role:
          </span>
          {(Object.keys(roleMeta) as ChatRole[]).map((rKey) => {
            const isCurrent = selectedRole === rKey;
            const meta = roleMeta[rKey];
            return (
              <button
                key={rKey}
                onClick={() => setSelectedRole(rKey)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? 'bg-[#0F4A3E] text-white font-semibold shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {meta.icon}
                <span>{meta.name}</span>
              </button>
            );
          })}
        </div>

        {/* Collapsible System Instruction Editor */}
        {showConfig && (
          <div className="mt-3 p-3.5 rounded-2xl bg-white border border-stone-200 text-xs space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#0F4A3E]" />
                System Instruction & Custom Focus
              </span>
              <span className="text-[11px] text-stone-400">
                Injected into Gemini system prompt
              </span>
            </div>
            <textarea
              rows={2}
              value={customSystemInstruction}
              onChange={(e) => setCustomSystemInstruction(e.target.value)}
              placeholder="e.g. Focus exclusively on Staff-level distributed systems in the US/EU; emphasize zero-downtime architecture and strict XYZ formatting."
              className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F4A3E] focus:bg-white resize-none"
            />
            {standingRules.length > 0 && (
              <p className="text-[11px] text-stone-500 flex items-center gap-1">
                <span>Enforcing {standingRules.filter(r => r.enabled).length} active Standing Rules automatically.</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Chat Messages Scrollable Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FDFCFB]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  isUser
                    ? 'bg-stone-800 text-white'
                    : 'bg-[#0F4A3E] text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-emerald-200" />}
              </div>

              {/* Message Box */}
              <div
                className={`group relative rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-[#0F4A3E] text-white rounded-tr-none'
                    : 'bg-white border border-[#EBE8E3] text-stone-900 rounded-tl-none'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                {/* Footer metadata: Model badge, timestamp, copy button */}
                <div
                  className={`flex items-center justify-between gap-3 mt-2.5 pt-1.5 text-[10px] ${
                    isUser
                      ? 'border-t border-white/20 text-emerald-200'
                      : 'border-t border-stone-100 text-stone-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {msg.modelUsed && !isUser && (
                      <span className="font-mono px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 border border-stone-200">
                        {msg.modelUsed}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>

                  <button
                    onClick={() => handleCopyMessage(msg.id, msg.content)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-stone-700 cursor-pointer"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-3xl mr-auto animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-[#0F4A3E] flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4 text-emerald-200" />
            </div>
            <div className="bg-white border border-[#EBE8E3] rounded-2xl rounded-tl-none p-4 text-xs text-stone-500 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0F4A3E]" />
              <span>Gemini is generating career intelligence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Starters */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-[#EBE8E3] bg-[#FAF9F7]/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-stone-400 shrink-0">Try asking:</span>
          {PROMPT_STARTERS.map((starter, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedRole(starter.role);
                handleSendMessage(starter.text);
              }}
              className="text-xs px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-stone-700 hover:border-[#0F4A3E] hover:text-[#0F4A3E] transition-colors cursor-pointer shrink-0"
            >
              {starter.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Box Footer */}
      <div className="p-3 sm:p-4 border-t border-[#EBE8E3] bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask your ${roleMeta[selectedRole].name} anything... (Press Enter to send)`}
              className="w-full p-3 bg-stone-50 border border-stone-250 rounded-2xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0F4A3E] focus:bg-white resize-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3 rounded-2xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white shadow-xs transition-all disabled:opacity-40 cursor-pointer shrink-0"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-stone-400 text-center mt-2">
          Powered by Google Gemini · Model: <span className="font-mono text-stone-600">{selectedModel}</span> · Standing rules enforced
        </p>
      </div>
    </div>
  );
};
