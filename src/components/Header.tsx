import React, { useState } from 'react';
import {
  Sparkles,
  LayoutGrid,
  FileSearch,
  ShieldCheck,
  FileCode2,
  UserCheck,
  Plus,
  Download,
  HelpCircle,
  Briefcase,
  GraduationCap,
  Users,
  FileText,
  Mic,
  DollarSign,
  LogIn,
  LogOut,
  User as UserIcon,
  Cloud
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab =
  | 'pipeline'
  | 'scanner'
  | 'resume'
  | 'interview-simulator'
  | 'offers'
  | 'rules'
  | 'blueprint'
  | 'profile';
export type UserPersona = 'fulltime' | 'internship' | 'student_org';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeRulesCount: number;
  apiHealth: { status: string; hasApiKey: boolean };
  onOpenNewJob: () => void;
  onOpenExport: () => void;
  onToggleWelcome: () => void;
  selectedPersona: UserPersona;
  onSelectPersona: (persona: UserPersona) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  activeRulesCount,
  apiHealth,
  onOpenNewJob,
  onOpenExport,
  onToggleWelcome,
  selectedPersona,
  onSelectPersona,
}) => {
  const { user, openAuthModal, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EBE8E3] text-stone-900 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with branding & actions */}
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F4A3E] flex items-center justify-center shadow-xs text-white font-serif font-bold text-xl">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg tracking-tight text-stone-900">
                  ApplyFlow
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono uppercase bg-emerald-50 text-[#0F4A3E] border border-emerald-200 font-semibold">
                  Executive Suite
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Repetitive Application Autopilot & Standing Rules Engine
              </p>
            </div>
          </div>

          {/* Persona quick-switch & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Persona Selector */}
            <div className="hidden md:flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
              <button
                onClick={() => onSelectPersona('fulltime')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedPersona === 'fulltime'
                    ? 'bg-[#0F4A3E] text-white font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="View tailored for Full-Time Job Hunting"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Job Hunter</span>
              </button>
              <button
                onClick={() => onSelectPersona('internship')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedPersona === 'internship'
                    ? 'bg-[#0F4A3E] text-white font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="View tailored for Internship Search"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Internship</span>
              </button>
              <button
                onClick={() => onSelectPersona('student_org')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedPersona === 'student_org'
                    ? 'bg-[#0F4A3E] text-white font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="View tailored for Student Org / Club Management"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Student Org</span>
              </button>
            </div>

            {/* AI Engine Status Badge */}
            <div
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border ${
                apiHealth.hasApiKey
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-stone-100 text-stone-700 border-stone-200'
              }`}
              title={
                apiHealth.hasApiKey
                  ? 'Gemini 3.8 Flash server connected'
                  : 'Smart Generative Engine active with server heuristics'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  apiHealth.hasApiKey ? 'bg-[#0F4A3E] animate-pulse' : 'bg-stone-400'
                }`}
              />
              <span className="font-mono font-medium">
                {apiHealth.hasApiKey ? 'Gemini 3.8 Flash' : 'AI Engine Ready'}
              </span>
            </div>

            {/* Quick Actions */}
            <button
              onClick={onToggleWelcome}
              className="h-8 w-8 inline-flex items-center justify-center rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
              title="First time guide"
              aria-label="First time guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenExport}
              className="h-8 hidden sm:inline-flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer shadow-xs shrink-0"
              title="Export pipeline to CSV or JSON"
            >
              <Download className="w-3.5 h-3.5 text-[#0F4A3E]" />
              <span>Export</span>
            </button>

            <button
              onClick={onOpenNewJob}
              className="h-8 inline-flex items-center gap-1.5 px-3.5 rounded-xl text-xs font-semibold bg-[#0F4A3E] hover:bg-[#0B382F] text-white shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Add Job</span>
            </button>

            {/* User Auth Profile / Login Button */}
            {user ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="h-8 inline-flex items-center gap-2 px-2.5 sm:px-3 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-xs text-stone-800 transition-colors cursor-pointer shadow-xs"
                  title={user.email || 'User Account'}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Avatar'}
                      className="w-5 h-5 rounded-full object-cover border border-emerald-300"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#0F4A3E] flex items-center justify-center text-[10px] font-bold text-white">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:inline font-semibold max-w-[100px] truncate text-stone-800">
                    {user.displayName || user.email?.split('@')[0] || 'Member'}
                  </span>
                  <span title="Firestore Synced">
                    <Cloud className="w-3.5 h-3.5 text-[#0F4A3E] shrink-0 hidden sm:inline" />
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-[#EBE8E3] rounded-2xl shadow-xl p-2 z-50 text-xs animate-in fade-in duration-150">
                    <div className="px-3 py-2 border-b border-stone-100 mb-1">
                      <p className="font-serif font-bold text-stone-900 truncate">{user.displayName || 'Job Hunter'}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user.email || 'Guest Session'}</p>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-800 mt-1 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F4A3E]"></span>
                        <span>Cloud Database Synced</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="h-8 inline-flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-[#0F4A3E] border border-emerald-200 transition-all cursor-pointer shadow-xs shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 text-[#0F4A3E]" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 border-t border-stone-200/80 py-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onSelectTab('pipeline')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'pipeline'
                ? 'bg-emerald-50 text-[#0F4A3E] border border-emerald-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-[#0F4A3E]" />
            <span>Pipeline Board</span>
          </button>

          <button
            onClick={() => onSelectTab('scanner')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'scanner'
                ? 'bg-emerald-50 text-[#0F4A3E] border border-emerald-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <FileSearch className="w-4 h-4 text-[#0F4A3E]" />
            <span>Job Scanner</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#0F4A3E] font-mono">
              Auto
            </span>
          </button>

          <button
            onClick={() => onSelectTab('resume')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'resume'
                ? 'bg-emerald-50 text-[#0F4A3E] border border-emerald-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <FileText className="w-4 h-4 text-[#0F4A3E]" />
            <span>100% Match Resume</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#0F4A3E] font-mono">
              PDF
            </span>
          </button>

          <button
            onClick={() => onSelectTab('interview-simulator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'interview-simulator'
                ? 'bg-emerald-50 text-[#0F4A3E] border border-emerald-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <Mic className="w-4 h-4 text-[#0F4A3E]" />
            <span>Mock Interview</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#0F4A3E] font-mono">
              Voice
            </span>
          </button>

          <button
            onClick={() => onSelectTab('offers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'offers'
                ? 'bg-emerald-50 text-[#0F4A3E] border border-emerald-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <DollarSign className="w-4 h-4 text-[#0F4A3E]" />
            <span>Offer Matrix</span>
          </button>

          <button
            onClick={() => onSelectTab('rules')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'rules'
                ? 'bg-emerald-50 text-[#0F4A3E] border border-emerald-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#0F4A3E]" />
            <span>Standing Rules</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#0F4A3E] font-mono">
              {activeRulesCount} Active
            </span>
          </button>

          <button
            onClick={() => onSelectTab('blueprint')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'blueprint'
                ? 'bg-emerald-50 text-[#0F4A3E] border border-emerald-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <FileCode2 className="w-4 h-4 text-[#0F4A3E]" />
            <span>Plan & Blueprint</span>
          </button>

          <button
            onClick={() => onSelectTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'profile'
                ? 'bg-emerald-50 text-[#0F4A3E] border border-emerald-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#0F4A3E]" />
            <span>My Profile</span>
          </button>
        </div>
      </div>
    </header>
  );
};
