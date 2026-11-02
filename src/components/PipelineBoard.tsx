import React, { useState, useMemo } from 'react';
import {
  JobApplication,
  ApplicationStatus,
  Priority
} from '../types/job';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  AlertCircle,
  Building2,
  MapPin,
  DollarSign,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
  Check,
  Trash2,
  Table as TableIcon,
  Columns3,
  ExternalLink,
  Zap,
  TrendingUp,
  Flame,
  Award,
  ArrowRight,
  X
} from 'lucide-react';
import { AchievementBadges } from './AchievementBadges';

interface PipelineBoardProps {
  applications: JobApplication[];
  onSelectApplication: (app: JobApplication) => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onDeleteApplication: (id: string) => void;
  onOpenNewJobModal: (defaultStatus?: ApplicationStatus) => void;
  onNavigateToScanner: () => void;
  onNavigateToResume?: () => void;
}

const COLUMNS: { id: ApplicationStatus; label: string; color: string; badgeBg: string }[] = [
  { id: 'wishlist', label: 'Wishlist / Saved', color: 'border-stone-300', badgeBg: 'bg-stone-100 text-stone-700 border border-stone-200' },
  { id: 'applied', label: 'Applied', color: 'border-blue-300', badgeBg: 'bg-blue-50 text-blue-800 border border-blue-200' },
  { id: 'interviewing', label: 'Interviewing', color: 'border-amber-300', badgeBg: 'bg-amber-50 text-amber-900 border border-amber-200' },
  { id: 'offer', label: 'Offers', color: 'border-emerald-300', badgeBg: 'bg-emerald-50 text-[#0F4A3E] border border-emerald-300 font-bold' },
  { id: 'rejected', label: 'Archived', color: 'border-stone-200', badgeBg: 'bg-stone-100 text-stone-600 border border-stone-200' },
];

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  applications,
  onSelectApplication,
  onUpdateStatus,
  onDeleteApplication,
  onOpenNewJobModal,
  onNavigateToScanner,
  onNavigateToResume,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Today's date in YYYY-MM-DD for follow-up calculations
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const isFilterActive = searchTerm !== '' || selectedStatus !== 'all' || selectedPriority !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedPriority('all');
  };

  const statusCounts = useMemo(() => {
    return {
      all: applications.length,
      wishlist: applications.filter((a) => a.status === 'wishlist').length,
      applied: applications.filter((a) => a.status === 'applied').length,
      interviewing: applications.filter((a) => a.status === 'interviewing').length,
      offer: applications.filter((a) => a.status === 'offer').length,
      rejected: applications.filter((a) => a.status === 'rejected').length,
    };
  }, [applications]);

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const query = searchTerm.toLowerCase().trim();
      const matchSearch =
        !query ||
        app.company.toLowerCase().includes(query) ||
        app.role.toLowerCase().includes(query) ||
        (app.location && app.location.toLowerCase().includes(query)) ||
        (app.tags && app.tags.some((t) => t.toLowerCase().includes(query)));

      const matchStatus = selectedStatus === 'all' || app.status === selectedStatus;
      const matchPriority = selectedPriority === 'all' || app.priority === selectedPriority;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [applications, searchTerm, selectedStatus, selectedPriority]);

  const visibleColumns = useMemo(() => {
    if (selectedStatus === 'all') return COLUMNS;
    return COLUMNS.filter((c) => c.id === selectedStatus);
  }, [selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = applications.length;
    const interviewing = applications.filter((a) => a.status === 'interviewing').length;
    const offers = applications.filter((a) => a.status === 'offer').length;
    const applied = applications.filter((a) => a.status === 'applied').length;
    const responseRate = total > 0 ? Math.round(((interviewing + offers) / Math.max(1, total - applications.filter(a => a.status === 'wishlist').length)) * 100) : 0;
    
    // Follow-ups due
    const followUpsDue = applications.filter((a) => {
      if (a.status !== 'applied' && a.status !== 'interviewing') return false;
      if (!a.followUpDate) return false;
      return a.followUpDate <= todayStr;
    }).length;

    return { total, interviewing, offers, applied, responseRate, followUpsDue };
  }, [applications, todayStr]);

  // Career Momentum Calculation: Tracks applications moving from Wishlist to Interview or Offer stages
  const momentumStats = useMemo(() => {
    const total = applications.length;
    const wishlist = applications.filter((a) => a.status === 'wishlist').length;
    const applied = applications.filter((a) => a.status === 'applied').length;
    const interviewing = applications.filter((a) => a.status === 'interviewing').length;
    const offer = applications.filter((a) => a.status === 'offer').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;

    // Advanced: Applications that successfully reached Interview or Offer stage
    const advancedCount = interviewing + offer;
    const momentumPercentage = total > 0 ? Math.round((advancedCount / total) * 100) : 0;

    // Segment widths
    const wishlistPct = total > 0 ? (wishlist / total) * 100 : 0;
    const appliedPct = total > 0 ? (applied / total) * 100 : 0;
    const interviewingPct = total > 0 ? (interviewing / total) * 100 : 0;
    const offerPct = total > 0 ? (offer / total) * 100 : 0;

    let momentumLabel = 'Building Pipeline';
    let momentumDescription = 'Add target roles to your wishlist and start tailoring submissions.';
    let statusTheme = 'text-stone-700 bg-stone-50 border-stone-200';

    if (offer > 0) {
      momentumLabel = 'Elite Momentum — Offer Secured!';
      momentumDescription = `${offer} opportunity reached the offer stage! Time to compare compensation packages and strategize counter-offers.`;
      statusTheme = 'text-[#0F4A3E] bg-emerald-50/80 border-emerald-300';
    } else if (interviewing > 0) {
      momentumLabel = 'High Momentum — Active Interview Loops';
      momentumDescription = `${interviewing} role${interviewing > 1 ? 's have' : ' has'} advanced into technical and behavioral rounds. Keep practicing STAR answers!`;
      statusTheme = 'text-amber-950 bg-amber-50/80 border-amber-300';
    } else if (applied > 0) {
      momentumLabel = 'Gaining Momentum — Applications Dispatched';
      momentumDescription = `${applied} submission${applied > 1 ? 's' : ''} sent. Follow-up reminders are queued to maintain response rates.`;
      statusTheme = 'text-blue-900 bg-blue-50/80 border-blue-200';
    }

    return {
      total,
      wishlist,
      applied,
      interviewing,
      offer,
      rejected,
      advancedCount,
      momentumPercentage,
      wishlistPct,
      appliedPct,
      interviewingPct,
      offerPct,
      momentumLabel,
      momentumDescription,
      statusTheme
    };
  }, [applications]);

  return (
    <div className="space-y-6">
      {/* Top Search and Filter Bar */}
      <div className="bg-white border border-[#EBE8E3] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Company Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search applications by company name, role, location, or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-stone-50 hover:bg-stone-50/80 focus:bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0F4A3E] focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                title="Clear company search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Priority Selector */}
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-transparent text-xs sm:text-sm text-stone-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Kanban Board view"
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Table view"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            {/* Fast Add Job CTA */}
            <button
              onClick={() => onOpenNewJobModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-300" />
              <span>Add Job</span>
            </button>
          </div>
        </div>

        {/* Second row: Status Quick-Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F2EFE9]">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-xs font-semibold text-stone-400 mr-1 hidden sm:inline">Filter by Status:</span>

            {[
              { id: 'all', label: 'All', count: statusCounts.all },
              { id: 'wishlist', label: 'Wishlist', count: statusCounts.wishlist },
              { id: 'applied', label: 'Applied', count: statusCounts.applied },
              { id: 'interviewing', label: 'Interviewing', count: statusCounts.interviewing },
              { id: 'offer', label: 'Offers', count: statusCounts.offer },
              { id: 'rejected', label: 'Archived', count: statusCounts.rejected }
            ].map((tab) => {
              const isActive = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0F4A3E] text-white font-semibold shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Results summary and Reset Filter action */}
          <div className="flex items-center gap-2.5 text-xs text-stone-500 ml-auto">
            <span>
              Showing <strong className="text-stone-800 font-semibold">{filteredApps.length}</strong> of{' '}
              {applications.length}
            </span>
            {isFilterActive && (
              <button
                onClick={resetFilters}
                className="text-xs text-[#0F4A3E] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-[#EBE8E3] rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-stone-500 font-medium">Total Pipeline</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif text-2xl font-bold text-stone-900">{stats.total}</span>
            <span className="text-xs text-stone-500">roles tracked</span>
          </div>
        </div>

        <div className="bg-white border border-[#EBE8E3] rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-stone-500 font-medium">Active Interviews</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif text-2xl font-bold text-amber-800">{stats.interviewing}</span>
            <span className="text-xs text-amber-700/80">in progress</span>
          </div>
        </div>

        <div className="bg-white border border-[#EBE8E3] rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-stone-500 font-medium">Offers</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif text-2xl font-bold text-[#0F4A3E]">{stats.offers}</span>
            <span className="text-xs text-emerald-700/80">received</span>
          </div>
        </div>

        <div className="bg-white border border-[#EBE8E3] rounded-2xl p-4 shadow-xs">
          <p className="text-xs text-stone-500 font-medium">Interview Rate</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif text-2xl font-bold text-stone-900">{stats.responseRate}%</span>
            <span className="text-xs text-stone-500">of sent apps</span>
          </div>
        </div>

        <div className={`col-span-2 sm:col-span-4 lg:col-span-1 border rounded-2xl p-4 shadow-xs ${
          stats.followUpsDue > 0
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-white border-[#EBE8E3] text-stone-700'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">Follow-ups Due</p>
            {stats.followUpsDue > 0 && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`font-serif text-2xl font-bold ${stats.followUpsDue > 0 ? 'text-rose-700' : 'text-stone-900'}`}>
              {stats.followUpsDue}
            </span>
            <span className="text-xs text-stone-500">
              {stats.followUpsDue > 0 ? 'action needed today' : 'all caught up'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Career Momentum Progress Bar */}
      <div className="bg-white border border-[#EBE8E3] rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#0F4A3E] text-xs font-semibold border border-emerald-300">
              <TrendingUp className="w-3.5 h-3.5 text-[#0F4A3E]" />
              <span>Career Momentum</span>
            </div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 tracking-tight">
              Wishlist → Interview & Offer Progression
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
              Tracks how effectively your saved opportunities convert into active interview rounds and job offers.
            </p>
          </div>

          <div className="flex items-baseline sm:items-end flex-col bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5 shadow-xs">
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#0F4A3E]">
                {momentumStats.advancedCount}
              </span>
              <span className="text-stone-500 text-xs font-mono">
                / {momentumStats.total} advanced
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
              <span>{momentumStats.momentumPercentage}% conversion rate</span>
            </div>
          </div>
        </div>

        {/* Multi-Segment Visual Progress Bar */}
        <div className="space-y-2 relative z-10">
          <div className="w-full bg-stone-100 border border-stone-200 rounded-full h-4 sm:h-5 p-0.5 flex overflow-hidden shadow-inner">
            {/* Wishlist Segment */}
            {momentumStats.wishlistPct > 0 && (
              <div
                style={{ width: `${momentumStats.wishlistPct}%` }}
                className="h-full bg-stone-300 hover:bg-stone-400 transition-all first:rounded-l-full last:rounded-r-full relative group cursor-pointer"
                title={`Wishlist / Saved: ${momentumStats.wishlist} (${Math.round(momentumStats.wishlistPct)}%)`}
              />
            )}

            {/* Applied Segment */}
            {momentumStats.appliedPct > 0 && (
              <div
                style={{ width: `${momentumStats.appliedPct}%` }}
                className="h-full bg-blue-500 hover:bg-blue-600 transition-all first:rounded-l-full last:rounded-r-full relative group cursor-pointer"
                title={`Applied: ${momentumStats.applied} (${Math.round(momentumStats.appliedPct)}%)`}
              />
            )}

            {/* Interviewing Segment (High Momentum) */}
            {momentumStats.interviewingPct > 0 && (
              <div
                style={{ width: `${momentumStats.interviewingPct}%` }}
                className="h-full bg-amber-400 hover:bg-amber-500 transition-all first:rounded-l-full last:rounded-r-full relative group cursor-pointer"
                title={`Interviewing: ${momentumStats.interviewing} (${Math.round(momentumStats.interviewingPct)}%)`}
              />
            )}

            {/* Offer Segment (Goal Stage) */}
            {momentumStats.offerPct > 0 && (
              <div
                style={{ width: `${momentumStats.offerPct}%` }}
                className="h-full bg-[#0F4A3E] hover:bg-[#0B382F] transition-all first:rounded-l-full last:rounded-r-full relative group cursor-pointer"
                title={`Offers: ${momentumStats.offer} (${Math.round(momentumStats.offerPct)}%)`}
              />
            )}

            {momentumStats.total === 0 && (
              <div className="w-full h-full bg-stone-200 rounded-full" />
            )}
          </div>

          {/* Interactive Legend & Stage Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-400 shrink-0" />
              <div className="truncate">
                <span className="text-stone-600 font-medium">Wishlist: </span>
                <span className="text-stone-900 font-bold font-mono">{momentumStats.wishlist}</span>
                <span className="text-[10px] text-stone-500 ml-1">({Math.round(momentumStats.wishlistPct)}%)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <div className="truncate">
                <span className="text-stone-600 font-medium">Applied: </span>
                <span className="text-stone-900 font-bold font-mono">{momentumStats.applied}</span>
                <span className="text-[10px] text-stone-500 ml-1">({Math.round(momentumStats.appliedPct)}%)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <div className="truncate">
                <span className="text-amber-900 font-medium">Interview: </span>
                <span className="text-amber-950 font-bold font-mono">{momentumStats.interviewing}</span>
                <span className="text-[10px] text-amber-700 ml-1">({Math.round(momentumStats.interviewingPct)}%)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F4A3E] shrink-0" />
              <div className="truncate">
                <span className="text-emerald-900 font-medium">Offers: </span>
                <span className="text-[#0F4A3E] font-bold font-mono">{momentumStats.offer}</span>
                <span className="text-[10px] text-emerald-700 ml-1">({Math.round(momentumStats.offerPct)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Momentum Status & Strategic Milestone */}
        <div className={`p-3 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${momentumStats.statusTheme} relative z-10`}>
          <div className="flex items-center gap-2">
            {momentumStats.offer > 0 ? (
              <Award className="w-4 h-4 text-[#0F4A3E] shrink-0" />
            ) : momentumStats.interviewing > 0 ? (
              <Flame className="w-4 h-4 text-amber-700 shrink-0" />
            ) : (
              <TrendingUp className="w-4 h-4 text-stone-600 shrink-0" />
            )}
            <div>
              <span className="font-bold mr-1.5">{momentumStats.momentumLabel}</span>
              <span className="text-stone-600 hidden sm:inline">{momentumStats.momentumDescription}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono shrink-0">
            <span className="font-bold text-stone-900">{momentumStats.advancedCount}</span>
            <span className="text-stone-500">of {momentumStats.total} reached final stages</span>
          </div>
        </div>
      </div>

      {/* AI Resume Tailor Dashboard Card */}
      <div className="bg-white border border-[#EBE8E3] rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0F4A3E] text-xs font-semibold border border-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-[#0F4A3E]" />
            <span>AI Resume Auto-Tailor</span>
          </div>
          <h3 className="font-serif text-base font-bold text-stone-900">
            Turn your resume into a role-specific version.
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 pt-1">
            <span className="flex items-center gap-1 text-emerald-800 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-600" /> Resume: Uploaded ✓
            </span>
            <span className="flex items-center gap-1 text-emerald-800 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-600" /> Job Description: Added ✓
            </span>
            <span className="text-stone-500">
              Current Match: <strong className="text-stone-800">64%</strong>
            </span>
            <span className="text-[#0F4A3E] font-bold font-mono">
              Optimized Match: 91%
            </span>
          </div>
        </div>

        {onNavigateToResume && (
          <button
            onClick={onNavigateToResume}
            className="px-5 py-2.5 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <Zap className="w-4 h-4 text-emerald-200" />
            <span>Optimize Resume</span>
          </button>
        )}
      </div>

      {/* Achievement Badges Showcase */}
      <AchievementBadges
        applications={applications}
        onNavigateToResume={onNavigateToResume}
        onNavigateToScanner={onNavigateToScanner}
        onOpenNewJobModal={() => onOpenNewJobModal()}
      />

      {/* Main Content: Kanban or Table */}
      {viewMode === 'kanban' ? (
        <div
          className={`grid gap-4 overflow-x-auto pb-4 ${
            visibleColumns.length === 1
              ? 'grid-cols-1 max-w-xl mx-auto'
              : visibleColumns.length === 2
              ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5'
          }`}
        >
          {visibleColumns.map((column) => {
            const columnApps = filteredApps.filter((app) => app.status === column.id);
            return (
              <div
                key={column.id}
                className="bg-stone-100/70 rounded-2xl border border-stone-200/90 flex flex-col min-w-[260px] h-[calc(100vh-320px)] min-h-[500px]"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-stone-200/90 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-serif font-bold text-stone-900">{column.label}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium ${column.badgeBg}`}>
                      {columnApps.length}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenNewJobModal(column.id)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
                    title={`Add to ${column.label}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Column Body Cards */}
                <div className="p-2.5 flex-1 overflow-y-auto space-y-3">
                  {columnApps.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-stone-400 text-xs border border-dashed border-stone-300 rounded-xl p-4 text-center">
                      <p>No applications here</p>
                      <button
                        onClick={() => onOpenNewJobModal(column.id)}
                        className="mt-2 text-[#0F4A3E] font-semibold hover:underline cursor-pointer"
                      >
                        + Add position
                      </button>
                    </div>
                  ) : (
                    columnApps.map((app) => {
                      const isFollowUpDue =
                        (app.status === 'applied' || app.status === 'interviewing') &&
                        app.followUpDate &&
                        app.followUpDate <= todayStr;

                      return (
                        <div
                          key={app.id}
                          onClick={() => onSelectApplication(app)}
                          className="group bg-white hover:bg-stone-50/80 border border-stone-200/90 hover:border-emerald-700/50 rounded-xl p-3.5 transition-all shadow-xs hover:shadow-sm cursor-pointer relative"
                        >
                          {/* Priority and Match Score */}
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                                app.priority === 'high'
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : app.priority === 'medium'
                                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                                  : 'bg-stone-100 text-stone-600 border-stone-200'
                              }`}
                            >
                              {app.priority}
                            </span>

                            {app.fitScore && (
                              <span className="text-[11px] font-mono font-semibold text-emerald-800 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-700" />
                                {app.fitScore}% match
                              </span>
                            )}
                          </div>

                          {/* Role and Company */}
                          <h4 className="font-bold text-stone-900 text-sm group-hover:text-[#0F4A3E] transition-colors line-clamp-1">
                            {app.role}
                          </h4>
                          <p className="text-xs text-stone-600 flex items-center gap-1 mt-0.5 font-medium">
                            <Building2 className="w-3 h-3 text-stone-400" />
                            {app.company}
                          </p>

                          {/* Location & Salary */}
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-[11px] text-stone-500">
                            {app.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5 text-stone-400" />
                                {app.location.split('/')[0]}
                              </span>
                            )}
                            {app.salary && (
                              <span className="flex items-center gap-1 text-stone-700 font-medium">
                                <DollarSign className="w-2.5 h-2.5 text-[#0F4A3E]" />
                                {app.salary.split('+')[0]}
                              </span>
                            )}
                          </div>

                          {/* Follow-up / Deadline Alert */}
                          {isFollowUpDue && (
                            <div className="mt-2.5 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-medium">
                              <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                              <span>Follow-up Due!</span>
                            </div>
                          )}

                          {/* Interview Scheduled Badge */}
                          {app.interviewDate && (
                            <div className="mt-2.5 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
                              <Clock className="w-3 h-3 text-[#0F4A3E] shrink-0" />
                              <span>
                                Interview: {new Date(app.interviewDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                              </span>
                            </div>
                          )}

                          {/* Tags */}
                          {app.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2.5">
                              {app.tags.slice(0, 3).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200"
                                >
                                  {tag}
                                </span>
                              ))}
                              {app.tags.length > 3 && (
                                <span className="text-[10px] text-stone-400 self-center">
                                  +{app.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Quick Status Dropdown on hover */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500"
                          >
                            <select
                              value={app.status}
                              onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                              className="bg-stone-50 text-stone-800 border border-stone-200 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                            >
                              <option value="wishlist">Wishlist</option>
                              <option value="applied">Applied</option>
                              <option value="interviewing">Interviewing</option>
                              <option value="offer">Offer</option>
                              <option value="rejected">Archived</option>
                            </select>

                            <button
                              onClick={() => onDeleteApplication(app.id)}
                              className="text-stone-400 hover:text-rose-600 p-1 rounded transition-colors"
                              title="Delete application"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 text-xs font-semibold uppercase text-stone-600 tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Company & Role</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Fit Score</th>
                  <th className="px-4 py-3.5">Location & Comp</th>
                  <th className="px-4 py-3.5">Follow-Up</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                      No applications matched your filter.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => onSelectApplication(app)}
                      className="hover:bg-stone-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-stone-900 group-hover:text-[#0F4A3E] transition-colors">
                          {app.role}
                        </div>
                        <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-stone-400" />
                          <span>{app.company}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <select
                          value={app.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                          className="bg-stone-50 text-stone-800 border border-stone-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                        >
                          <option value="wishlist">Wishlist</option>
                          <option value="applied">Applied</option>
                          <option value="interviewing">Interviewing</option>
                          <option value="offer">Offer</option>
                          <option value="rejected">Archived</option>
                        </select>
                      </td>

                      <td className="px-4 py-3.5">
                        {app.fitScore ? (
                          <span className="font-mono font-bold text-emerald-800 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                            {app.fitScore}%
                          </span>
                        ) : (
                          <span className="text-stone-400 text-xs">Pending scan</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-xs text-stone-700">{app.location || 'Remote'}</div>
                        <div className="text-xs text-stone-500 font-mono mt-0.5">{app.salary || 'Unlisted'}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        {app.followUpDate ? (
                          <div className="flex items-center gap-1.5 text-xs text-stone-700">
                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                            <span>{app.followUpDate}</span>
                            {app.followUpDate <= todayStr && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-50 text-rose-800 border border-rose-200 font-semibold">
                                Due
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-stone-400 text-xs">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectApplication(app)}
                            className="text-xs text-[#0F4A3E] hover:text-[#0B382F] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-200"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => onDeleteApplication(app.id)}
                            className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
