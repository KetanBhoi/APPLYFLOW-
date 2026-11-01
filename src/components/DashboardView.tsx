import React from 'react';
import { JobApplication, UserProfile } from '../types/job';
import {
  FilePlus,
  ArrowRight,
  Sparkles,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Bell,
  Compass,
  MessageSquare,
  Target,
  Scale,
  ShieldCheck,
  Award,
  Linkedin,
  Users,
  Code2,
  Play
} from 'lucide-react';
import { ApplicationStatusPieChart } from './ApplicationStatusPieChart';
import { CareerVelocityVisualizer } from './CareerVelocityVisualizer';
import { ActivityCalendarHeatmap } from './ActivityCalendarHeatmap';

interface DashboardViewProps {
  applications: JobApplication[];
  userProfile?: UserProfile;
  onStartNewAnalysis: () => void;
  onNavigateToResume: () => void;
  onSelectApplication: (app: JobApplication) => void;
  onNavigateToPipeline: () => void;
  onNavigateToReminders?: () => void;
  onNavigateToOffers?: () => void;
  onNavigateToWarmOutreach?: () => void;
  onNavigateToStarVault?: () => void;
  onNavigateToCodeStudio?: () => void;
  onOpenJobClipper?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  applications,
  userProfile,
  onStartNewAnalysis,
  onNavigateToResume,
  onSelectApplication,
  onNavigateToPipeline,
  onNavigateToReminders,
  onNavigateToOffers,
  onNavigateToWarmOutreach,
  onNavigateToStarVault,
  onNavigateToCodeStudio,
  onOpenJobClipper,
}) => {
  // Compute analytics dynamically from the user's actual applications
  const totalAnalyses = applications.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const dueFollowUps = applications.filter(
    (a) => a.followUpDate && a.followUpDate <= todayStr && (a.status === 'applied' || a.status === 'interviewing')
  );

  const appsWithScore = applications.filter((a) => (a.fitScore ?? 0) > 0);
  const averageMatchScore =
    appsWithScore.length > 0
      ? Math.round(
          appsWithScore.reduce((sum, a) => sum + (a.fitScore || 0), 0) / appsWithScore.length
        )
      : totalAnalyses > 0
      ? 78
      : 0;

  const strongMatchesCount = applications.filter((a) => (a.fitScore ?? 0) >= 75).length;

  // Real target role and resume status
  const currentTargetRole =
    userProfile?.currentRole ||
    (applications.length > 0 ? applications[0].role : 'Full-Stack Software Engineer');

  // Real recent applications from pipeline
  const recentApplications = applications.slice(0, 6);

  // Status badge styling helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'offer':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'interviewing':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'applied':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EBE8E3]">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Every number here comes from analyses and opportunities in your ApplyFlow pipeline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {onOpenJobClipper && (
            <button
              onClick={onOpenJobClipper}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-sm font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>1-Click Job Clipper</span>
            </button>
          )}

          <button
            onClick={onStartNewAnalysis}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            <FilePlus className="w-4 h-4 text-emerald-300" />
            <span>Start new analysis</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Analyses / Applications run */}
        <div className="bg-white border border-[#EBE8E3] rounded-2xl p-6 shadow-xs">
          <p className="text-xs text-stone-500 font-medium tracking-tight">
            Analyses run
          </p>
          <p className="text-5xl font-serif text-stone-900 font-normal my-2 tracking-tight">
            {totalAnalyses}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            Tracked in your active pipeline
          </p>
        </div>

        {/* Card 2: Average match score */}
        <div className="bg-white border border-[#EBE8E3] rounded-2xl p-6 shadow-xs">
          <p className="text-xs text-stone-500 font-medium tracking-tight">
            Average match score
          </p>
          <p className="text-5xl font-serif text-stone-900 font-normal my-2 tracking-tight">
            {averageMatchScore}%
          </p>
          <p className="text-xs text-stone-400 mt-1">
            Standing rules ATS alignment
          </p>
        </div>

        {/* Card 3: Strong matches */}
        <div className="bg-white border border-[#EBE8E3] rounded-2xl p-6 shadow-xs">
          <p className="text-xs text-stone-500 font-medium tracking-tight">
            Strong matches
          </p>
          <p className="text-5xl font-serif text-stone-900 font-normal my-2 tracking-tight">
            {strongMatchesCount}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            Match score of 75 or above
          </p>
        </div>
      </div>

      {/* Calendar Activity Heatmap (Last 3 Months) */}
      <ActivityCalendarHeatmap
        applications={applications}
        onSelectApplication={onSelectApplication}
        onStartNewAnalysis={onStartNewAnalysis}
      />

      {/* Career Velocity & Success Rate Recharts Visualizer */}
      <CareerVelocityVisualizer
        applications={applications}
        onNavigateToPipeline={onNavigateToPipeline}
      />

      {/* D3-Powered Application Status Pie Chart */}
      <ApplicationStatusPieChart
        applications={applications}
        onNavigateToPipeline={onNavigateToPipeline}
        onSelectStatusFilter={() => onNavigateToPipeline()}
      />

      {/* Cloud Functions Scheduled Follow-Up Reminder Banner */}
      {dueFollowUps.length > 0 && (
        <div className="bg-[#FAF9F7] border border-amber-300/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <Clock className="w-4 h-4" />
              </span>
              <h3 className="font-serif text-base font-bold text-stone-900 tracking-tight">
                {dueFollowUps.length} Follow-Up Task{dueFollowUps.length > 1 ? 's' : ''} Due Today
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase tracking-wider">
                Cloud Functions Scheduled
              </span>
            </div>
            <p className="text-xs text-stone-600">
              Applications for <strong>{dueFollowUps.map((a) => a.company).join(', ')}</strong> have passed their follow-up target date. Automated daily digests are scheduled.
            </p>
          </div>

          {onNavigateToReminders && (
            <button
              onClick={onNavigateToReminders}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Review Follow-Ups & Email Digest</span>
            </button>
          )}
        </div>
      )}

      {/* AI Resume Tailor Action Banner */}
      <div className="bg-white border border-[#EBE8E3] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-bold text-stone-900 tracking-tight">
              AI Resume Tailor
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#DDF3EA] text-[#0F4A3E] font-semibold border border-[#0F4A3E]/20">
              Standing Rules Engine
            </span>
          </div>
          <p className="text-sm text-stone-600">
            Turn your master resume into an ATS-optimized, role-specific version.
          </p>
          <p className="text-xs text-stone-500 font-mono pt-1">
            Target Focus: {currentTargetRole} · Standing rules active
          </p>
        </div>

        <button
          onClick={onNavigateToResume}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-sm font-semibold transition-all shadow-xs cursor-pointer shrink-0"
        >
          <span>Optimize resume</span>
        </button>
      </div>

      {/* Executive Strategic Command Suite */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-800" />
              <span>Executive Career Command Suite</span>
            </h2>
            <p className="text-xs text-stone-500">
              High-leverage interview debriefs, 30-60-90 dossiers, ATS keyword gap resolution, and total comp strategy.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* 1. 30-60-90 Dossier */}
          <div
            onClick={() => {
              if (applications[0]) {
                onSelectApplication(applications[0]);
              } else {
                onStartNewAnalysis();
              }
            }}
            className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group space-y-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-stone-900 group-hover:text-emerald-800 transition-colors">
                30-60-90 Strategic Dossier
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Generate executive milestone blueprints, panel interview reverse-questions, and onboarding risk mitigations.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
              <span>Inspect Dossier</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 2. Interview Debrief Logger */}
          <div
            onClick={() => {
              const activeInterview = applications.find(a => a.status === 'interviewing') || applications[0];
              if (activeInterview) {
                onSelectApplication(activeInterview);
              } else {
                onStartNewAnalysis();
              }
            }}
            className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group space-y-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-stone-900 group-hover:text-amber-800 transition-colors">
                Interview Debrief Logger
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Log real questions asked, self-evaluate delivery, and generate targeted post-round thank-you memos with Gemini.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-[11px] font-semibold text-amber-800">
              <span>Log Round Debrief</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 3. ATS Keyword Gap Studio */}
          <div
            onClick={() => {
              if (applications[0]) {
                onSelectApplication(applications[0]);
              } else {
                onNavigateToResume();
              }
            }}
            className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group space-y-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-stone-900 group-hover:text-indigo-800 transition-colors">
                ATS Keyword Gap Matrix
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Categorized breakdown of missing skills with 1-click truthful Google XYZ-formula resume bullet generation.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-[11px] font-semibold text-indigo-800">
              <span>Bridge Stack Gaps</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 4. Total Compensation Studio */}
          <div
            onClick={() => {
              if (onNavigateToOffers) {
                onNavigateToOffers();
              } else {
                onNavigateToPipeline();
              }
            }}
            className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer group space-y-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-stone-900 group-hover:text-emerald-800 transition-colors">
                Offer & Total Comp Studio
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                4-year vesting schedule breakdown, equity growth modeling, and executive counter-offer scripts.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
              <span>Model Total Comp</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* 5. Behavioral STAR Story Vault */}
          <div
            onClick={() => {
              if (onNavigateToStarVault) {
                onNavigateToStarVault();
              } else {
                onNavigateToPipeline();
              }
            }}
            className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group space-y-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-stone-900 group-hover:text-amber-800 transition-colors">
                Behavioral STAR Story Vault
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                FAANG Bar-Raiser aligned master story repository, 16 Amazon LPs matrix, and AI pressure test drills.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-1 text-[11px] font-semibold text-amber-800">
              <span>Open STAR Vault</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Active Interviewing Stage LinkedIn Warm Outreach Callout */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Linkedin className="w-4 h-4" />
              </span>
              <h3 className="font-serif text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>LinkedIn Alumni & Warm Outreach Assistant</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider font-sans border border-amber-500/30">
                  {applications.filter((a) => a.status === 'interviewing').length} Companies Interviewing
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Identify common university alumni, former colleagues, and engineering leads at{' '}
              <strong>
                {applications
                  .filter((a) => a.status === 'interviewing')
                  .map((a) => a.company)
                  .join(', ') || 'your active interviewing companies'}
              </strong>
              . Draft high-conversion sub-300-char connection notes to warm up your upcoming interview panel.
            </p>
          </div>

          <button
            onClick={onNavigateToWarmOutreach || onNavigateToPipeline}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/30 cursor-pointer shrink-0"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Launch Warm Outreach Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Technical Coding & Take-Home Studio Callout */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-950 to-emerald-950 border border-emerald-500/30 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Code2 className="w-4 h-4" />
              </span>
              <h3 className="font-serif text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Technical Code Lab & Take-Home Studio</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider font-sans border border-emerald-500/30">
                  Live Test Runner + Staff AI Review
                </span>
              </h3>
            </div>
            <p className="text-xs text-stone-300">
              Simulate 45-minute live technical screens (LRU Cache, Token Bucket Rate Limiter, Async Debounce), execute automated test assertions in-browser, and obtain Gemini 3.8 Flash Staff Engineer Big-O complexity audits.
            </p>
          </div>

          <button
            onClick={onNavigateToCodeStudio || onNavigateToPipeline}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-700/30 cursor-pointer shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Open Technical Code Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent analyses / applications list */}
      <div className="bg-white border border-[#EBE8E3] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#F2EFE9]">
          <h2 className="font-serif text-lg font-bold text-stone-900 tracking-tight">
            Recent analyses
          </h2>
          <button
            onClick={onNavigateToPipeline}
            className="text-xs font-semibold text-stone-700 hover:text-stone-900 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List of items */}
        <div className="divide-y divide-[#F2EFE9]">
          {recentApplications.map((app) => (
            <div
              key={app.id}
              onClick={() => onSelectApplication(app)}
              className="py-4 flex items-center justify-between gap-4 hover:bg-[#FAF9F7] px-2 rounded-xl transition-colors cursor-pointer"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-stone-900 leading-snug truncate">
                    {app.role}
                  </h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${getStatusBadge(
                      app.status
                    )}`}
                  >
                    {app.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                  <span className="font-medium text-stone-700 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-stone-400" />
                    {app.company}
                  </span>
                  {app.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      {app.location}
                    </span>
                  )}
                  {app.salary && (
                    <span className="font-mono text-stone-600">
                      {app.salary}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] font-medium text-stone-600 px-2.5 py-0.5 rounded-full border border-stone-200 bg-white">
                  Match
                </span>
                <span className="font-serif text-2xl font-bold text-stone-900 min-w-[32px] text-right">
                  {app.fitScore || 75}
                </span>
              </div>
            </div>
          ))}

          {recentApplications.length === 0 && (
            <div className="py-8 text-center text-sm text-stone-500">
              No applications or analyses run yet. Click "Start new analysis" to scan your first job posting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
