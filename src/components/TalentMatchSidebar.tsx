import React from 'react';
import {
  LayoutDashboard,
  FilePlus2,
  Wand2,
  UserCheck,
  Library,
  History,
  Scale,
  CreditCard,
  Settings,
  Sparkles,
  LogOut,
  LogIn,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type TalentMatchTab =
  | 'dashboard'
  | 'new-analysis'
  | 'resume-tailor'
  | 'recruiter-view'
  | 'library'
  | 'analysis-history'
  | 'scoring-methodology'
  | 'plans-billing'
  | 'account-settings';

interface TalentMatchSidebarProps {
  currentTab: TalentMatchTab;
  onSelectTab: (tab: TalentMatchTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const TalentMatchSidebar: React.FC<TalentMatchSidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile
}) => {
  const { user, openAuthModal, logout } = useAuth();

  const navItems: { id: TalentMatchTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'new-analysis',
      label: 'New analysis',
      icon: <FilePlus2 className="w-4 h-4" />
    },
    {
      id: 'resume-tailor',
      label: 'AI Resume Tailor',
      icon: <Wand2 className="w-4 h-4" />
    },
    {
      id: 'recruiter-view',
      label: 'Recruiter view',
      icon: <UserCheck className="w-4 h-4" />
    },
    {
      id: 'library',
      label: 'Library',
      icon: <Library className="w-4 h-4" />
    },
    {
      id: 'analysis-history',
      label: 'Analysis history',
      icon: <History className="w-4 h-4" />
    },
    {
      id: 'scoring-methodology',
      label: 'Scoring methodology',
      icon: <Scale className="w-4 h-4" />
    },
    {
      id: 'plans-billing',
      label: 'Plans & billing',
      icon: <CreditCard className="w-4 h-4" />
    },
    {
      id: 'account-settings',
      label: 'Account settings',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#FBFBF9] border-r border-[#EAEAE8] flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#EAEAE8]/80">
          <div className="flex items-center gap-3">
            {/* Dark teal logo icon with diamond/sparkle */}
            <div className="w-10 h-10 rounded-xl bg-[#0D5C54] flex items-center justify-center text-white shadow-sm shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h1 className="font-serif text-[17px] font-bold text-gray-900 tracking-tight leading-snug">
                TalentMatch
              </h1>
              <p className="text-xs text-gray-500 font-sans leading-none mt-0.5">
                Resume intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#D8F0E5] text-[#0A4D44] font-semibold shadow-xs'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200/50 font-normal'
                }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-[#0A4D44]' : 'text-gray-500'}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Account / Footer */}
        <div className="p-3 border-t border-[#EAEAE8] bg-[#F7F7F5]">
          {user ? (
            <div className="p-2 rounded-xl bg-white border border-gray-200/80 shadow-xs space-y-2">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-emerald-500"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#0D5C54] text-white flex items-center justify-center text-xs font-bold font-serif">
                    {(user.displayName || user.email || 'K')[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {user.displayName || 'KETAN KAUSHIKBHAI BHOI'}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {user.email || 'Cloud Synced'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[11px]">
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Pro Plan
                </span>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-white border border-gray-200/80 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <ShieldCheck className="w-4 h-4 text-[#0D5C54]" />
                <span className="font-medium">Guest Workspace</span>
              </div>
              <button
                onClick={openAuthModal}
                className="w-full py-1.5 px-3 rounded-lg bg-[#0D5C54] hover:bg-[#09443e] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in / Sign up</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
