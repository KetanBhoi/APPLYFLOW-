import React, { useState } from 'react';
import {
  JobApplication,
  ApplicationStatus,
  Priority,
  TailoredBullet,
  OutreachDraft,
  ContactPerson,
  StandingRule,
  UserProfile
} from '../types/job';
import {
  X,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Send,
  HelpCircle,
  Users,
  Clock,
  Plus,
  Trash2,
  RefreshCw,
  FileText,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Zap,
  Compass,
  Target,
  MessageSquare
} from 'lucide-react';
import {
  tailorResumeBullets,
  draftOutreachMessage,
  prepInterviewQuestions
} from '../services/geminiService';
import { InterviewCountdown } from './InterviewCountdown';
import { QuickPrepModal } from './QuickPrepModal';

interface ApplicationDetailModalProps {
  application: JobApplication;
  standingRules: StandingRule[];
  userProfile: UserProfile;
  onClose: () => void;
  onUpdateApplication: (updated: JobApplication) => void;
  onDeleteApplication: (id: string) => void;
  onOpenMockInterview?: (app: JobApplication) => void;
  onOpenCompanyDossier?: (app: JobApplication) => void;
  onOpenTailoredResume?: (app: JobApplication) => void;
  onOpenExecutiveDossier?: (app: JobApplication) => void;
  onOpenInterviewDebrief?: (app: JobApplication) => void;
  onOpenAtsGapMatrix?: (app: JobApplication) => void;
  onOpenWarmOutreach?: (app: JobApplication) => void;
}

type TabType = 'overview' | 'bullets' | 'outreach' | 'interview' | 'contacts';

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  standingRules,
  userProfile,
  onClose,
  onUpdateApplication,
  onDeleteApplication,
  onOpenMockInterview,
  onOpenCompanyDossier,
  onOpenTailoredResume,
  onOpenExecutiveDossier,
  onOpenInterviewDebrief,
  onOpenAtsGapMatrix,
  onOpenWarmOutreach,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isGeneratingBullets, setIsGeneratingBullets] = useState(false);
  const [isDraftingOutreach, setIsDraftingOutreach] = useState(false);
  const [isPreppingInterview, setIsPreppingInterview] = useState(false);
  const [outreachType, setOutreachType] = useState<'hiring_manager' | 'recruiter' | 'peer_referral' | 'thank_you'>('hiring_manager');
  const [showFullJD, setShowFullJD] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    application.interviewPrep?.questions?.[0]?.id || null
  );
  const [showQuickPrep, setShowQuickPrep] = useState(false);

  // Contact form state
  const [newContactName, setNewContactName] = useState('');
  const [newContactTitle, setNewContactTitle] = useState('');
  const [newContactLink, setNewContactLink] = useState('');

  // Active enabled rules strings for Gemini calls
  const enabledRuleStrings = standingRules.filter((r) => r.enabled).map((r) => `${r.title}: ${r.instruction}`);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate / Regenerate Bullets
  const handleGenerateBullets = async () => {
    setIsGeneratingBullets(true);
    try {
      const resp = await tailorResumeBullets({
        jobTitle: application.role,
        company: application.company,
        jobRequirements: application.parsedDetails?.coreSkills || [],
        userExperiences: userProfile.experienceSnippets,
        userSkills: userProfile.skills,
        standingRules: enabledRuleStrings
      });

      onUpdateApplication({
        ...application,
        tailoredBullets: resp.bullets,
        fitScore: resp.overallFitScore,
        fitRationale: resp.fitRationale,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to generate bullets:', err);
    } finally {
      setIsGeneratingBullets(false);
    }
  };

  // Generate Outreach
  const handleDraftOutreach = async (type: 'hiring_manager' | 'recruiter' | 'peer_referral' | 'thank_you') => {
    setIsDraftingOutreach(true);
    setOutreachType(type);
    try {
      const resp = await draftOutreachMessage({
        type,
        recipientName: application.contacts?.[0]?.name || (type === 'recruiter' ? 'Recruiting Team' : 'Hiring Manager'),
        jobTitle: application.role,
        company: application.company,
        userProfile,
        jobDetails: application.parsedDetails,
        standingRules: enabledRuleStrings
      });

      onUpdateApplication({
        ...application,
        outreachDraft: resp.result,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to draft outreach:', err);
    } finally {
      setIsDraftingOutreach(false);
    }
  };

  // Generate Interview Questions
  const handlePrepInterview = async () => {
    setIsPreppingInterview(true);
    try {
      const resp = await prepInterviewQuestions({
        jobTitle: application.role,
        company: application.company,
        coreSkills: application.parsedDetails?.coreSkills || [],
        userProfile,
        standingRules: enabledRuleStrings
      });

      onUpdateApplication({
        ...application,
        interviewPrep: resp.result,
        updatedAt: new Date().toISOString()
      });
      if (resp.result.questions?.length > 0) {
        setExpandedQuestionId(resp.result.questions[0].id);
      }
    } catch (err) {
      console.error('Failed to prep interview:', err);
    } finally {
      setIsPreppingInterview(false);
    }
  };

  // Add Contact Person
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;
    const newContact: ContactPerson = {
      id: `c-${Date.now()}`,
      name: newContactName.trim(),
      title: newContactTitle.trim() || 'Recruiter / Team Member',
      emailOrLinkedIn: newContactLink.trim()
    };
    onUpdateApplication({
      ...application,
      contacts: [...application.contacts, newContact],
      updatedAt: new Date().toISOString()
    });
    setNewContactName('');
    setNewContactTitle('');
    setNewContactLink('');
  };

  const handleDeleteContact = (contactId: string) => {
    onUpdateApplication({
      ...application,
      contacts: application.contacts.filter((c) => c.id !== contactId),
      updatedAt: new Date().toISOString()
    });
  };

  const handleUpdateInterviewDate = (newDate: string) => {
    onUpdateApplication({
      ...application,
      interviewDate: newDate,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div id="application-detail-modal-root" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {application.priority} priority
              </span>
              {application.fitScore && (
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  {application.fitScore}% Match
                </span>
              )}
              {application.appliedDate && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  Applied {application.appliedDate}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {application.role}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs sm:text-sm text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Building2 className="w-4 h-4 text-indigo-400" />
                {application.company}
              </span>
              {application.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {application.location}
                </span>
              )}
              {application.salary && (
                <span className="flex items-center gap-1 text-slate-300 font-mono">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  {application.salary}
                </span>
              )}
            </div>
          </div>

          {/* Status & Priority Controls + Quick Prep + Close */}
          <div className="flex items-center gap-2 self-end sm:self-center flex-wrap sm:flex-nowrap">
            {/* 100% Match Tailored Resume Button */}
            {onOpenTailoredResume && (
              <button
                onClick={() => onOpenTailoredResume(application)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-all cursor-pointer"
                title="Generate 100% ATS Matched Resume for this specific job"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Tailored Resume</span>
                <span className="sm:hidden">Resume</span>
              </button>
            )}

            {/* Executive 30-60-90 Day Dossier Button */}
            {onOpenExecutiveDossier && (
              <button
                onClick={() => onOpenExecutiveDossier(application)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700/20 hover:bg-emerald-700/30 text-emerald-200 border border-emerald-600/30 font-semibold text-xs transition-all cursor-pointer"
                title="Open Executive 30-60-90 Day Strategic Plan & Dossier"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">30-60-90 Plan</span>
                <span className="sm:hidden">30-60-90</span>
              </button>
            )}

            {/* ATS Keyword Match Matrix */}
            {onOpenAtsGapMatrix && (
              <button
                onClick={() => onOpenAtsGapMatrix(application)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold text-xs transition-all cursor-pointer"
                title="View ATS Keyword Match Matrix and generate gap-closing XYZ bullets"
              >
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">ATS Keywords</span>
                <span className="sm:hidden">ATS</span>
              </button>
            )}

            {/* Interview Debrief Logger */}
            {onOpenInterviewDebrief && (
              <button
                onClick={() => onOpenInterviewDebrief(application)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-all cursor-pointer"
                title="Log interview debriefs and generate post-round thank-you notes"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Debriefs ({application.interviewRounds?.length || 0})</span>
                <span className="sm:hidden">Debrief</span>
              </button>
            )}

            {/* LinkedIn Alumni & Warm Outreach */}
            {onOpenWarmOutreach && (
              <button
                onClick={() => onOpenWarmOutreach(application)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold text-xs transition-all cursor-pointer"
                title="Identify alumni and mutual contacts at this company on LinkedIn"
              >
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Warm Leads</span>
                <span className="sm:hidden">Leads</span>
              </button>
            )}

            {/* Quick Prep button for applications in interview stage */}
            {(application.status === 'interviewing' || (application.status as string) === 'interview') && (
              <button
                onClick={() => setShowQuickPrep(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                title="Launch STAR-format Interview Quick Prep based on job description & resume"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Quick Prep</span>
              </button>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400">Status</label>
              <select
                value={application.status}
                onChange={(e) =>
                  onUpdateApplication({
                    ...application,
                    status: e.target.value as ApplicationStatus,
                    updatedAt: new Date().toISOString()
                  })
                }
                className="bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="wishlist">Wishlist / Saved</option>
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offer">Offer Received</option>
                <option value="rejected">Archived</option>
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer self-start"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/60 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Fit
          </button>
          <button
            onClick={() => setActiveTab('bullets')}
            className={`py-3 px-4 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'bullets'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Tailored Bullets</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
              {application.tailoredBullets?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('outreach')}
            className={`py-3 px-4 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'outreach'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Cold Outreach</span>
            {application.outreachDraft && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            className={`py-3 px-4 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'interview'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Interview Prep</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
              {application.interviewPrep?.questions?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-3 px-4 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'contacts'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Contacts & Follow-Up</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {application.contacts.length}
            </span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* Visual Countdown Timer for Applications in Interview Stage */}
          {(application.status === 'interviewing' || (application.status as string) === 'interview' || Boolean(application.interviewDate)) && (
            <InterviewCountdown
              interviewDate={application.interviewDate}
              onUpdateInterviewDate={handleUpdateInterviewDate}
              company={application.company}
              role={application.role}
              onSwitchToPrepTab={() => setActiveTab('interview')}
              onOpenQuickPrep={() => setShowQuickPrep(true)}
              onOpenMockInterview={
                onOpenMockInterview ? () => onOpenMockInterview(application) : undefined
              }
              onOpenCompanyDossier={
                onOpenCompanyDossier ? () => onOpenCompanyDossier(application) : undefined
              }
              onOpenWarmOutreach={
                onOpenWarmOutreach ? () => onOpenWarmOutreach(application) : undefined
              }
            />
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Fit Rationale Box */}
              {application.fitRationale && (
                <div className="bg-slate-850 border border-slate-700/80 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs uppercase mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Fit Analysis & Strategic Angle</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {application.fitRationale}
                  </p>
                </div>
              )}

              {/* Skills Analysis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <h4 className="text-xs font-semibold uppercase text-slate-400 mb-3 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Core Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {application.parsedDetails?.coreSkills?.map((skill, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium"
                      >
                        {skill}
                      </span>
                    )) || <span className="text-xs text-slate-500">None extracted</span>}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <h4 className="text-xs font-semibold uppercase text-slate-400 mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    Nice to Have / Bonus Stack
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {application.parsedDetails?.niceToHaveSkills?.map((skill, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium"
                      >
                        {skill}
                      </span>
                    )) || <span className="text-xs text-slate-500">None extracted</span>}
                  </div>
                </div>
              </div>

              {/* Red Flags & Perks */}
              {application.parsedDetails && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Red flags */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                    <h4 className="text-xs font-semibold uppercase text-rose-400 mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      Rule Engine Red Flags
                    </h4>
                    {application.parsedDetails.redFlags?.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-rose-300">
                        {application.parsedDetails.redFlags.map((flag, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-400">•</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400">
                        No red flags detected by your Standing Rules. Good signs!
                      </p>
                    )}
                  </div>

                  {/* Culture Perks */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                    <h4 className="text-xs font-semibold uppercase text-emerald-400 mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Highlights & Perks
                    </h4>
                    {application.parsedDetails.culturePerks?.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {application.parsedDetails.culturePerks.map((perk, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400">•</span>
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400">Standard benefits indicated.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Full Job Description Accordion */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <button
                  onClick={() => setShowFullJD(!showFullJD)}
                  className="w-full flex items-center justify-between text-xs font-semibold uppercase text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Original Job Description Text
                  </span>
                  {showFullJD ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showFullJD && (
                  <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {application.jobDescription || 'No description text recorded.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TAILORED BULLETS */}
          {activeTab === 'bullets' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl p-4">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    ATS-Optimized XYZ Resume Bullets
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Crafted specifically for {application.role} at {application.company} strictly adhering to your Standing Rules.
                  </p>
                </div>

                <button
                  onClick={handleGenerateBullets}
                  disabled={isGeneratingBullets}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium transition-all shadow cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingBullets ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingBullets ? 'Synthesizing...' : 'Regenerate Bullets'}</span>
                </button>
              </div>

              {/* Bullet list */}
              {(!application.tailoredBullets || application.tailoredBullets.length === 0) ? (
                <div className="text-center py-12 bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-6">
                  <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-300 text-sm font-medium">No tailored bullets generated yet.</p>
                  <p className="text-slate-500 text-xs mt-1 mb-4">
                    Click below to generate 4 quantifiable bullets matching this job spec.
                  </p>
                  <button
                    onClick={handleGenerateBullets}
                    disabled={isGeneratingBullets}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors cursor-pointer"
                  >
                    Generate Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {application.tailoredBullets.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-slate-100 text-sm leading-relaxed flex-1 font-sans">
                          • {bullet.text}
                        </p>
                        <button
                          onClick={() => handleCopy(bullet.text, `b-${idx}`)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                          title="Copy bullet"
                        >
                          {copiedKey === `b-${idx}` ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Metadata tags */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                        <span className="text-slate-400">Target:</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                          {bullet.targetKeyword}
                        </span>
                        <span className="text-slate-500">|</span>
                        <span className="text-slate-400">Impact:</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">
                          {bullet.impactType}
                        </span>
                        {bullet.rulesFollowed?.map((rule, rIdx) => (
                          <span
                            key={rIdx}
                            className="inline-flex items-center gap-1 text-slate-400 ml-auto"
                          >
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>{rule}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                    <span>Copy all 4 bullets to clipboard for your resume:</span>
                    <button
                      onClick={() =>
                        handleCopy(
                          application.tailoredBullets!.map((b) => `• ${b.text}`).join('\n\n'),
                          'all-bullets'
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'all-bullets' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy All Bullets</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OUTREACH & COLD EMAIL */}
          {activeTab === 'outreach' && (
            <div className="space-y-6">
              {/* Type selector */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'hiring_manager', label: 'To Hiring Manager' },
                  { id: 'recruiter', label: 'To Recruiter' },
                  { id: 'peer_referral', label: 'Peer Referral Ask' },
                  { id: 'thank_you', label: 'Post-Interview Thank You' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleDraftOutreach(item.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      outreachType === item.id
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

                <button
                  onClick={() => handleDraftOutreach(outreachType)}
                  disabled={isDraftingOutreach}
                  className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isDraftingOutreach ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
              </div>

              {/* Draft Body */}
              {application.outreachDraft ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  {/* Subject Line */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Subject Line
                    </label>
                    <div className="flex items-center justify-between gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-sm font-medium text-white">
                      <span>{application.outreachDraft.subject}</span>
                      <button
                        onClick={() => handleCopy(application.outreachDraft!.subject, 'subject')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        title="Copy Subject"
                      >
                        {copiedKey === 'subject' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Body Text */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Email Body
                      </label>
                      <span className="text-xs font-mono text-slate-400">
                        {application.outreachDraft.wordCount} words{' '}
                        {application.outreachDraft.wordCount <= 150 ? (
                          <span className="text-emerald-400 font-semibold">(under 150-word cap ✅)</span>
                        ) : (
                          <span className="text-amber-400">(close to limit)</span>
                        )}
                      </span>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/80 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {application.outreachDraft.body}
                    </div>
                  </div>

                  {/* Footer rule check & copy */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>{application.outreachDraft.keyAngle}</span>
                    </div>

                    <button
                      onClick={() =>
                        handleCopy(
                          `Subject: ${application.outreachDraft!.subject}\n\n${application.outreachDraft!.body}`,
                          'full-email'
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors flex items-center gap-2 cursor-pointer shadow"
                    >
                      {copiedKey === 'full-email' ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>Copied Email!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Full Email</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-6">
                  <Send className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-300 text-sm font-medium">No outreach message drafted yet.</p>
                  <p className="text-slate-500 text-xs mt-1 mb-4">
                    Generate a crisp, non-robotic cold email adhering to your brevity rules.
                  </p>
                  <button
                    onClick={() => handleDraftOutreach('hiring_manager')}
                    disabled={isDraftingOutreach}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors cursor-pointer"
                  >
                    Draft Message
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: INTERVIEW PREP & STAR FLASHCARDS */}
          {activeTab === 'interview' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-950/20 border border-purple-500/30 rounded-2xl p-4">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    5 Predicted Interview Questions & STAR Flashcards
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tailored specifically for {application.company} and {application.role}.
                  </p>
                </div>

                <button
                  onClick={handlePrepInterview}
                  disabled={isPreppingInterview}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-medium transition-all shadow cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPreppingInterview ? 'animate-spin' : ''}`} />
                  <span>{isPreppingInterview ? 'Generating...' : 'Refresh Questions'}</span>
                </button>
              </div>

              {application.interviewPrep?.proTip && (
                <div className="p-3.5 rounded-xl bg-slate-850 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-purple-300">Company Pro Tip: </span>
                    {application.interviewPrep.proTip}
                  </div>
                </div>
              )}

              {/* Questions List / Accordion */}
              {(!application.interviewPrep?.questions || application.interviewPrep.questions.length === 0) ? (
                <div className="text-center py-12 bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-6">
                  <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-300 text-sm font-medium">No interview questions prepared yet.</p>
                  <button
                    onClick={handlePrepInterview}
                    disabled={isPreppingInterview}
                    className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors cursor-pointer"
                  >
                    Generate 5 STAR Questions
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {application.interviewPrep.questions.map((q, idx) => {
                    const isExpanded = expandedQuestionId === q.id;
                    return (
                      <div
                        key={q.id || idx}
                        className={`bg-slate-900 border rounded-2xl transition-all overflow-hidden ${
                          isExpanded ? 'border-purple-500/50 shadow-md' : 'border-slate-800'
                        }`}
                      >
                        {/* Question Title Header */}
                        <button
                          onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                          className="w-full text-left p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-850/60 transition-colors"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                              {q.category}
                            </span>
                            <h4 className="text-sm font-semibold text-white mt-1">
                              {idx + 1}. {q.question}
                            </h4>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                        </button>

                        {/* Expanded STAR Breakdown */}
                        {isExpanded && (
                          <div className="p-4 pt-0 border-t border-slate-800/80 space-y-4 text-xs">
                            {/* Intent */}
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300">
                              <span className="font-semibold text-purple-300 block mb-0.5">
                                Interviewer Evaluation Intent:
                              </span>
                              {q.interviewerIntent}
                            </div>

                            {/* STAR Matrix */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                                <span className="font-bold text-indigo-400 block mb-1">
                                  Situation (S):
                                </span>
                                <p className="text-slate-300">{q.starGuide.situation}</p>
                              </div>

                              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                                <span className="font-bold text-cyan-400 block mb-1">
                                  Task (T):
                                </span>
                                <p className="text-slate-300">{q.starGuide.task}</p>
                              </div>

                              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                                <span className="font-bold text-amber-400 block mb-1">
                                  Action (A):
                                </span>
                                <p className="text-slate-300">{q.starGuide.action}</p>
                              </div>

                              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                                <span className="font-bold text-emerald-400 block mb-1">
                                  Result (R):
                                </span>
                                <p className="text-slate-300">{q.starGuide.result}</p>
                              </div>
                            </div>

                            {/* Pitfalls to avoid */}
                            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                              <span>
                                <strong>Trap to avoid:</strong> {q.pitfallsToAvoid}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CONTACTS & FOLLOW-UP */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              {/* Follow up date setting */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    Follow-Up Cadence Rule (6 business days)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ApplyFlow alerts you when it is time to politely re-engage if no response.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Target Follow-Up Date:</label>
                  <input
                    type="date"
                    value={application.followUpDate || ''}
                    onChange={(e) =>
                      onUpdateApplication({
                        ...application,
                        followUpDate: e.target.value,
                        updatedAt: new Date().toISOString()
                      })
                    }
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Contact List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    Key Company Contacts & Recruiters
                  </h4>
                </div>

                {application.contacts.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No contacts added yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {application.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-semibold text-white text-xs">{contact.name}</div>
                          <div className="text-[11px] text-slate-400">{contact.title}</div>
                          {contact.emailOrLinkedIn && (
                            <div className="text-[11px] text-indigo-400 truncate max-w-[200px] mt-0.5 font-mono">
                              {contact.emailOrLinkedIn}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                          title="Remove contact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Contact Form */}
                <form
                  onSubmit={handleAddContact}
                  className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3"
                >
                  <h5 className="text-xs font-semibold text-white">Add New Contact</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Name (e.g. Sarah Miller)"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Role (e.g. Tech Recruiter)"
                      value={newContactTitle}
                      onChange={(e) => setNewContactTitle(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Email or LinkedIn URL"
                      value={newContactLink}
                      onChange={(e) => setNewContactLink(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Contact</span>
                  </button>
                </form>
              </div>

              {/* Notes Area */}
              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                  Private Application Notes & Interview Logs
                </label>
                <textarea
                  rows={4}
                  value={application.notes || ''}
                  onChange={(e) =>
                    onUpdateApplication({
                      ...application,
                      notes: e.target.value,
                      updatedAt: new Date().toISOString()
                    })
                  }
                  placeholder="Record interview impressions, technical questions asked, compensation figures mentioned, or referrals..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            onClick={() => onDeleteApplication(application.id)}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Role</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

      {/* Quick Prep Studio Modal */}
      {showQuickPrep && (
        <QuickPrepModal
          application={application}
          userProfile={userProfile}
          standingRules={standingRules}
          onClose={() => setShowQuickPrep(false)}
          onSaveToQuestions={(newQuestion) => {
            const existing = application.interviewPrep?.questions || [];
            onUpdateApplication({
              ...application,
              interviewPrep: {
                questions: [newQuestion, ...existing],
                proTip:
                  application.interviewPrep?.proTip ||
                  `For ${application.company}, lead answers with concrete metrics.`
              },
              updatedAt: new Date().toISOString()
            });
          }}
        />
      )}
    </div>
  );
};
