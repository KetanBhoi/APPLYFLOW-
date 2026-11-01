import React from 'react';
import {
  LayoutGrid,
  FilePlus,
  Sparkles,
  Users,
  Library,
  Scale,
  Award,
  Settings,
  Columns3,
  Mic,
  DollarSign,
  LogIn,
  LogOut,
  Cloud,
  CheckCircle2,
  FileCode2,
  Bot,
  FlaskConical,
  Bell,
  Cpu,
  Link,
  GraduationCap,
  Linkedin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab =
  | 'dashboard'
  | 'chat'
  | 'ai-lab'
  | 'system-design'
  | 'pipeline'
  | 'warm-outreach'
  | 'star-vault'
  | 'reminders'
  | 'scanner'
  | 'resume'
  | 'interview-simulator'
  | 'offers'
  | 'rules'
  | 'badges'
  | 'blueprint'
  | 'profile';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewJob: () => void;
  onOpenJobClipper?: () => void;
  activeRulesCount?: number;
  totalApplicationsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewJob,
  onOpenJobClipper,
  activeRulesCount = 0,
  totalApplicationsCount = 0
}) => {
  const { user, openAuthModal, logout } = useAuth();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutGrid className="w-4 h-4" />
    },
    {
      id: 'chat',
      label: 'Gemini Career AI',
      icon: <Bot className="w-4 h-4" />,
      badge: 'Chat'
    },
    {
      id: 'ai-lab',
      label: 'AI Evaluation Lab',
      icon: <FlaskConical className="w-4 h-4" />,
      badge: 'Lab'
    },
    {
      id: 'system-design',
      label: 'System Design Studio',
      icon: <Cpu className="w-4 h-4" />,
      badge: 'Scale'
    },
    {
      id: 'pipeline',
      label: 'Pipeline Board',
      icon: <Columns3 className="w-4 h-4" />,
      badge: totalApplicationsCount > 0 ? totalApplicationsCount : undefined
    },
    {
      id: 'warm-outreach',
      label: 'LinkedIn Assistant',
      icon: <Linkedin className="w-4 h-4 text-blue-400" />,
      badge: 'Alumni'
    },
    {
      id: 'star-vault',
      label: 'STAR Story Vault',
      icon: <Award className="w-4 h-4 text-amber-500" />,
      badge: 'LPs'
    },
    {
      id: 'reminders',
      label: 'Follow-Up Reminders',
      icon: <Bell className="w-4 h-4" />,
      badge: 'Cron'
    },
    {
      id: 'scanner',
      label: 'New analysis',
      icon: <FilePlus className="w-4 h-4" />
    },
    {
      id: 'resume',
      label: 'AI Resume Tailor',
      icon: <Sparkles className="w-4 h-4" />
    },
    {
      id: 'interview-simulator',
      label: 'Recruiter view',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'offers',
      label: 'Library & Offers',
      icon: <Library className="w-4 h-4" />
    },
    {
      id: 'rules',
      label: 'Standing rules',
      icon: <Scale className="w-4 h-4" />,
      badge: activeRulesCount > 0 ? activeRulesCount : undefined
    },
    {
      id: 'badges',
      label: 'Achievement Badges',
      icon: <Award className="w-4 h-4" />
    },
    {
      id: 'blueprint',
      label: 'Architecture Plan',
      icon: <FileCode2 className="w-4 h-4" />
    },
    {
      id: 'profile',
      label: 'Account settings',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#FAF9F7] border-r border-[#EBE8E3] flex flex-col justify-between min-h-screen select-none">
      {/* Brand Header */}
      <div className="p-5">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-[#0F4A3E] flex items-center justify-center text-emerald-200 shadow-sm shrink-0">
            {/* Elegant brand spark icon */}
            <svg
              className="w-5 h-5 text-emerald-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <h1 className="font-serif font-bold text-stone-900 text-base leading-tight tracking-tight">
              ApplyFlow
            </h1>
            <p className="text-[11px] text-stone-500 font-medium tracking-tight">
              Job Search Command Center
            </p>
          </div>
        </div>

        {/* Quick Action: 1-Click Job Clipper */}
        {onOpenJobClipper && (
          <button
            onClick={onOpenJobClipper}
            className="w-full mt-4 flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-[#0F4A3E]/30 text-[#0F4A3E] text-xs font-semibold hover:bg-[#DDF3EA]/60 shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>1-Click Job Clipper</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#0F4A3E] text-white font-mono">
              URL
            </span>
          </button>
        )}

        {/* Navigation list */}
        <nav className="mt-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#DDF3EA] text-[#0F4A3E] font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#0F4A3E]' : 'text-stone-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] px-2 py-0.2 rounded-full font-mono ${
                      isActive
                        ? 'bg-[#0F4A3E]/10 text-[#0F4A3E] font-bold'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile / bottom actions */}
      <div className="p-4 border-t border-[#EBE8E3] bg-[#FAF9F7]/80">
        {user ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-stone-200 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-600"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#0F4A3E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-stone-900 truncate">
                    {user.displayName || user.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-[10px] text-stone-500 truncate flex items-center gap-1">
                    <Cloud className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                    <span>Cloud Synced</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => logout()}
                title="Sign out"
                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50 shadow-xs transition-colors cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-[#0F4A3E]" />
            <span>Sign In / Sync Data</span>
          </button>
        )}
      </div>
    </aside>
  );
};
