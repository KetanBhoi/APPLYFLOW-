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
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with branding & actions */}
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-xl">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  ApplyFlow
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI Studio
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Repetitive Application Autopilot & Standing Rules Engine
              </p>
            </div>
          </div>

          {/* Persona quick-switch & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Persona Selector */}
            <div className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
              <button
                onClick={() => onSelectPersona('fulltime')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedPersona === 'fulltime'
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
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
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
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
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
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
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800/80 text-indigo-300 border-indigo-500/20'
              }`}
              title={
                apiHealth.hasApiKey
                  ? 'Gemini 3.8 Flash server connected'
                  : 'Smart Generative Engine active with server heuristics'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  apiHealth.hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'
                }`}
              />
              <span className="font-mono">
                {apiHealth.hasApiKey ? 'Gemini 3.8 Flash' : 'AI Engine Ready'}
              </span>
            </div>

            {/* Quick Actions */}
            <button
              onClick={onToggleWelcome}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="First time guide"
              aria-label="First time guide"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenExport}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              title="Export pipeline to CSV or JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={onOpenNewJob}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Add Job</span>
            </button>

            {/* User Auth Profile / Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-xs text-white transition-colors cursor-pointer"
                  title={user.email || 'User Account'}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Avatar'}
                      className="w-5 h-5 rounded-full object-cover border border-indigo-400"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:inline font-medium max-w-[100px] truncate">
                    {user.displayName || user.email?.split('@')[0] || 'Member'}
                  </span>
                  <span title="Firestore Synced">
                    <Cloud className="w-3.5 h-3.5 text-cyan-400 shrink-0 hidden sm:inline" />
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in duration-150">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="font-bold text-white truncate">{user.displayName || 'Job Hunter'}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email || 'Guest Session'}</p>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>Cloud Database Synced</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer font-medium"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-300" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2 border-t border-slate-800/80 py-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onSelectTab('pipeline')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'pipeline'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Pipeline Board</span>
          </button>

          <button
            onClick={() => onSelectTab('scanner')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'scanner'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileSearch className="w-4 h-4 text-cyan-400" />
            <span>Job Scanner</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
              Auto
            </span>
          </button>

          <button
            onClick={() => onSelectTab('resume')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'resume'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>100% Match Resume</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
              PDF
            </span>
          </button>

          <button
            onClick={() => onSelectTab('interview-simulator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'interview-simulator'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Mic className="w-4 h-4 text-purple-400" />
            <span>Mock Interview</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-mono">
              Voice
            </span>
          </button>

          <button
            onClick={() => onSelectTab('offers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'offers'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Offer Matrix</span>
          </button>

          <button
            onClick={() => onSelectTab('rules')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'rules'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Standing Rules</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
              {activeRulesCount} Active
            </span>
          </button>

          <button
            onClick={() => onSelectTab('blueprint')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'blueprint'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCode2 className="w-4 h-4 text-purple-400" />
            <span>Plan & Blueprint</span>
          </button>

          <button
            onClick={() => onSelectTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'profile'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>My Profile</span>
          </button>
        </div>
      </div>
    </header>
  );
};
