import React, { useState, useMemo } from 'react';
import { JobApplication } from '../types/job';
import {
  Award,
  Trophy,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Target,
  Send,
  Calendar,
  FileCheck,
  TrendingUp,
  Users,
  Flame,
  Star,
  Zap,
  ArrowRight
} from 'lucide-react';

export interface BadgeDefinition {
  id: string;
  title: string;
  category: 'Pipeline' | 'Interviews' | 'Optimization' | 'Networking';
  description: string;
  iconName: string;
  targetCount: number;
  currentCount: number;
  unlocked: boolean;
  unlockedDate?: string;
  xp: number;
  actionText?: string;
  actionType?: 'scanner' | 'resume' | 'newJob';
}

interface AchievementBadgesProps {
  applications: JobApplication[];
  onNavigateToResume?: () => void;
  onNavigateToScanner?: () => void;
  onOpenNewJobModal?: () => void;
}

export const AchievementBadges: React.FC<AchievementBadgesProps> = ({
  applications,
  onNavigateToResume,
  onNavigateToScanner,
  onOpenNewJobModal,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Evaluate badges dynamically from application data and resume versions
  const badges = useMemo<BadgeDefinition[]>(() => {
    // 1. Applications sent (applied + interviewing + offer)
    const sentCount = applications.filter(
      (a) => a.status === 'applied' || a.status === 'interviewing' || a.status === 'offer'
    ).length;

    // 2. Active interviews
    const interviewCount = applications.filter(
      (a) => a.status === 'interviewing' || a.status === 'offer'
    ).length;

    // 3. Offers secured
    const offerCount = applications.filter((a) => a.status === 'offer').length;

    // 4. Total tracked pipeline
    const totalTracked = applications.length;

    // 5. Follow-ups queued/completed
    const followUpsCount = applications.filter((a) => Boolean(a.followUpDate)).length;

    // 6. Resume tailored check (from applications with tailored bullets or localStorage)
    let resumeOptimizedCount = applications.filter(
      (a) => (a.tailoredBullets && a.tailoredBullets.length > 0) || (a.fitScore && a.fitScore > 0)
    ).length;

    let maxFitScore = Math.max(
      0,
      ...applications.map((a) => a.fitScore || 0)
    );

    try {
      const savedVersions = localStorage.getItem('applyflow_resume_versions');
      if (savedVersions) {
        const parsed = JSON.parse(savedVersions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          resumeOptimizedCount = Math.max(resumeOptimizedCount, parsed.length);
          parsed.forEach((v: any) => {
            if (v.finalScore && v.finalScore > maxFitScore) {
              maxFitScore = v.finalScore;
            }
          });
        }
      }
    } catch {
      // Ignore localStorage parse errors
    }

    // 7. STAR interview prep
    const starPrepCount = applications.filter(
      (a) => a.interviewPrep && a.interviewPrep.questions && a.interviewPrep.questions.length > 0
    ).length;

    // 8. Recruiter contacts added
    const contactsCount = applications.filter(
      (a) => a.contacts && a.contacts.length > 0
    ).length;

    const list: BadgeDefinition[] = [
      {
        id: 'first-app',
        title: 'First Step Taken',
        category: 'Pipeline',
        description: 'Send your first job application into the wild.',
        iconName: 'Send',
        targetCount: 1,
        currentCount: Math.min(1, sentCount),
        unlocked: sentCount >= 1,
        xp: 50,
        actionText: 'Scan & Apply',
        actionType: 'scanner'
      },
      {
        id: 'ten-apps',
        title: '10 Applications Sent',
        category: 'Pipeline',
        description: 'Dispatch 10 applications across target companies.',
        iconName: 'Target',
        targetCount: 10,
        currentCount: Math.min(10, sentCount),
        unlocked: sentCount >= 10,
        xp: 150,
        actionText: 'Add New Role',
        actionType: 'newJob'
      },
      {
        id: 'first-interview',
        title: 'First Interview Scheduled',
        category: 'Interviews',
        description: 'Advance an application into live interview rounds.',
        iconName: 'Calendar',
        targetCount: 1,
        currentCount: Math.min(1, interviewCount),
        unlocked: interviewCount >= 1,
        xp: 100,
        actionText: 'View Pipeline',
        actionType: 'newJob'
      },
      {
        id: 'triple-interview',
        title: 'Triple Threat',
        category: 'Interviews',
        description: 'Juggle 3 or more concurrent active interview loops.',
        iconName: 'Flame',
        targetCount: 3,
        currentCount: Math.min(3, interviewCount),
        unlocked: interviewCount >= 3,
        xp: 250,
      },
      {
        id: 'resume-optimized',
        title: 'Resume Optimized',
        category: 'Optimization',
        description: 'Generate an ATS-tailored resume for a target job description.',
        iconName: 'FileCheck',
        targetCount: 1,
        currentCount: Math.min(1, resumeOptimizedCount),
        unlocked: resumeOptimizedCount >= 1,
        xp: 100,
        actionText: 'Auto-Tailor Resume',
        actionType: 'resume'
      },
      {
        id: 'high-match',
        title: '90%+ ATS Match Reached',
        category: 'Optimization',
        description: 'Achieve a 90% or higher legitimate ATS match score on a tailored resume.',
        iconName: 'Sparkles',
        targetCount: 90,
        currentCount: Math.min(90, maxFitScore),
        unlocked: maxFitScore >= 90,
        xp: 200,
        actionText: 'Optimize Resume',
        actionType: 'resume'
      },
      {
        id: 'star-master',
        title: 'STAR Method Master',
        category: 'Interviews',
        description: 'Generate structured behavioral STAR interview cards for 2+ roles.',
        iconName: 'Star',
        targetCount: 2,
        currentCount: Math.min(2, starPrepCount),
        unlocked: starPrepCount >= 2,
        xp: 150,
        actionText: 'Prep Questions',
        actionType: 'scanner'
      },
      {
        id: 'follow-up-pro',
        title: 'Cadence Keeper',
        category: 'Pipeline',
        description: 'Schedule recruiter follow-up dates on 3 or more sent applications.',
        iconName: 'TrendingUp',
        targetCount: 3,
        currentCount: Math.min(3, followUpsCount),
        unlocked: followUpsCount >= 3,
        xp: 120,
      },
      {
        id: 'networker',
        title: 'Warm Connection',
        category: 'Networking',
        description: 'Log hiring managers or recruiter contacts on 2+ applications.',
        iconName: 'Users',
        targetCount: 2,
        currentCount: Math.min(2, contactsCount),
        unlocked: contactsCount >= 2,
        xp: 100,
      },
      {
        id: 'first-offer',
        title: 'Offer Secured',
        category: 'Interviews',
        description: 'Receive a formal job offer and reach the finish line.',
        iconName: 'Trophy',
        targetCount: 1,
        currentCount: Math.min(1, offerCount),
        unlocked: offerCount >= 1,
        xp: 500,
      }
    ];

    return list;
  }, [applications]);

  // Overall statistics
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalBadges = badges.length;
  const unlockedPercentage = Math.round((unlockedCount / totalBadges) * 100);
  const earnedXp = badges.filter((b) => b.unlocked).reduce((sum, b) => sum + b.xp, 0);
  const totalXp = badges.reduce((sum, b) => sum + b.xp, 0);

  // Filtered badges for the detailed drawer
  const filteredBadges = useMemo(() => {
    if (selectedCategory === 'all') return badges;
    if (selectedCategory === 'unlocked') return badges.filter((b) => b.unlocked);
    if (selectedCategory === 'in-progress') return badges.filter((b) => !b.unlocked);
    return badges.filter((b) => b.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [badges, selectedCategory]);

  const handleBadgeAction = (actionType?: 'scanner' | 'resume' | 'newJob') => {
    if (actionType === 'resume' && onNavigateToResume) onNavigateToResume();
    else if (actionType === 'scanner' && onNavigateToScanner) onNavigateToScanner();
    else if (actionType === 'newJob' && onOpenNewJobModal) onOpenNewJobModal();
  };

  const renderBadgeIcon = (iconName: string, unlocked: boolean) => {
    const iconClass = `w-5 h-5 ${unlocked ? 'text-amber-300' : 'text-slate-500'}`;
    switch (iconName) {
      case 'Send':
        return <Send className={iconClass} />;
      case 'Target':
        return <Target className={iconClass} />;
      case 'Calendar':
        return <Calendar className={iconClass} />;
      case 'Flame':
        return <Flame className={iconClass} />;
      case 'FileCheck':
        return <FileCheck className={iconClass} />;
      case 'Sparkles':
        return <Sparkles className={iconClass} />;
      case 'Star':
        return <Star className={iconClass} />;
      case 'TrendingUp':
        return <TrendingUp className={iconClass} />;
      case 'Users':
        return <Users className={iconClass} />;
      case 'Trophy':
        return <Trophy className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden space-y-4">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header with unlocked counter and XP bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Achievement Badges</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Milestones & Career Mastery
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            Track key breakthroughs across your job hunt, from first applications and resume optimizations to active interview loops.
          </p>
        </div>

        {/* Level / Progress pill */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl px-4 py-2.5 shadow-inner text-right">
            <div className="flex items-baseline justify-end gap-1.5">
              <span className="font-mono text-xl sm:text-2xl font-black text-amber-400">
                {unlockedCount}
              </span>
              <span className="text-slate-400 text-xs font-mono">
                / {totalBadges} Unlocked
              </span>
            </div>
            <div className="text-[11px] font-semibold text-emerald-400">
              {earnedXp} / {totalXp} XP ({unlockedPercentage}%)
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold"
            title={isExpanded ? 'Collapse badge matrix' : 'Expand full badge showcase'}
          >
            <span>{isExpanded ? 'Collapse' : 'Show All'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Featured Badges Grid (Preview when collapsed) */}
      {!isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
          {badges.slice(0, 4).map((badge) => {
            const progress = Math.min(100, Math.round((badge.currentCount / badge.targetCount) * 100));
            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  badge.unlocked
                    ? 'bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border-amber-500/30 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/90'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        badge.unlocked
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/20'
                          : 'bg-slate-850 border-slate-800 text-slate-500'
                      }`}
                    >
                      {renderBadgeIcon(badge.iconName, badge.unlocked)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-[130px]">
                        {badge.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        +{badge.xp} XP
                      </span>
                    </div>
                  </div>

                  {badge.unlocked ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono border border-slate-700 flex items-center gap-1 shrink-0">
                      <Lock className="w-2.5 h-2.5 text-slate-500" />
                      <span>{badge.currentCount}/{badge.targetCount}</span>
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {badge.description}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      badge.unlocked
                        ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expanded Complete Showcase Tray */}
      {isExpanded && (
        <div className="space-y-4 pt-2 border-t border-slate-800 relative z-10 animate-in fade-in duration-200">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: `All (${badges.length})` },
              { id: 'unlocked', label: `Unlocked (${unlockedCount})` },
              { id: 'in-progress', label: `In Progress (${totalBadges - unlockedCount})` },
              { id: 'pipeline', label: 'Pipeline' },
              { id: 'interviews', label: 'Interviews' },
              { id: 'optimization', label: 'Optimization' },
              { id: 'networking', label: 'Networking' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Complete Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredBadges.map((badge) => {
              const progress = Math.min(100, Math.round((badge.currentCount / badge.targetCount) * 100));
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                    badge.unlocked
                      ? 'bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border-amber-500/30 shadow-md shadow-amber-500/5'
                      : 'bg-slate-950/70 border-slate-800/90'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                            badge.unlocked
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/20'
                              : 'bg-slate-850 border-slate-800 text-slate-500'
                          }`}
                        >
                          {renderBadgeIcon(badge.iconName, badge.unlocked)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              {badge.category}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-amber-400">
                              +{badge.xp} XP
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-0.5">
                            {badge.title}
                          </h4>
                        </div>
                      </div>

                      {badge.unlocked ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Unlocked</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono border border-slate-700 flex items-center gap-1 shrink-0">
                          <Lock className="w-2.5 h-2.5 text-slate-500" />
                          <span>{badge.currentCount}/{badge.targetCount}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>

                  <div>
                    {/* Progress tracking */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-400">Progress</span>
                        <span className={badge.unlocked ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                          {badge.currentCount} / {badge.targetCount} ({progress}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            badge.unlocked
                              ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                              : 'bg-indigo-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Action Button for in-progress badges */}
                    {!badge.unlocked && badge.actionText && (
                      <button
                        onClick={() => handleBadgeAction(badge.actionType)}
                        className="mt-3 w-full py-1.5 px-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 border border-slate-750 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Zap className="w-3 h-3 text-cyan-300" />
                        <span>{badge.actionText}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
