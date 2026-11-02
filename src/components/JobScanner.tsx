import React, { useState } from 'react';
import {
  JobApplication,
  JobParsedDetails,
  TailoredBullet,
  OutreachDraft,
  InterviewPrepPlan,
  StandingRule,
  UserProfile,
  ApplicationStatus,
  Priority
} from '../types/job';
import {
  parseJobPosting,
  tailorResumeBullets,
  draftOutreachMessage,
  prepInterviewQuestions
} from '../services/geminiService';
import { SAMPLE_JOB_POSTINGS } from '../data/initialData';
import {
  Sparkles,
  FileSearch,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Building2,
  MapPin,
  DollarSign,
  Send,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Plus
} from 'lucide-react';

interface JobScannerProps {
  standingRules: StandingRule[];
  userProfile: UserProfile;
  onSaveToPipeline: (newApp: JobApplication) => void;
  onNavigateToPipeline: () => void;
  initialJobData?: { company?: string; role?: string; description?: string; salary?: string; location?: string };
  onOpenJobClipper?: () => void;
}

export const JobScanner: React.FC<JobScannerProps> = ({
  standingRules,
  userProfile,
  onSaveToPipeline,
  onNavigateToPipeline,
  initialJobData,
  onOpenJobClipper,
}) => {
  const [rawText, setRawText] = useState(initialJobData?.description || SAMPLE_JOB_POSTINGS[0].text);

  React.useEffect(() => {
    if (initialJobData?.description) {
      setRawText(
        `Job Title: ${initialJobData.role || ''}\nCompany: ${initialJobData.company || ''}\nLocation: ${initialJobData.location || ''}\nSalary: ${initialJobData.salary || ''}\n\nDescription:\n${initialJobData.description}`
      );
    }
  }, [initialJobData]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<JobParsedDetails | null>(null);
  const [bulletsResult, setBulletsResult] = useState<TailoredBullet[]>([]);
  const [fitScore, setFitScore] = useState<number>(0);
  const [fitRationale, setFitRationale] = useState<string>('');
  const [outreachDraft, setOutreachDraft] = useState<OutreachDraft | null>(null);
  const [interviewPrep, setInterviewPrep] = useState<InterviewPrepPlan | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<ApplicationStatus>('wishlist');
  const [targetPriority, setTargetPriority] = useState<Priority>('high');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const enabledRuleStrings = standingRules.filter((r) => r.enabled).map((r) => `${r.title}: ${r.instruction}`);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleScanAndGenerate = async () => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    setSavedSuccess(false);

    try {
      // Step 1: Parse job
      setCurrentStep('Parsing job posting & scanning for red flags...');
      const parseResp = await parseJobPosting(rawText, enabledRuleStrings);
      setParsedResult(parseResp.result);

      // Step 2: Tailor bullets
      setCurrentStep('Synthesizing ATS-aligned XYZ resume bullets...');
      const bulletsResp = await tailorResumeBullets({
        jobTitle: parseResp.result.title,
        company: parseResp.result.company,
        jobRequirements: parseResp.result.coreSkills,
        userExperiences: userProfile.experienceSnippets,
        userSkills: userProfile.skills,
        standingRules: enabledRuleStrings
      });
      setBulletsResult(bulletsResp.bullets);
      setFitScore(bulletsResp.overallFitScore);
      setFitRationale(bulletsResp.fitRationale);

      // Step 3: Draft outreach
      setCurrentStep('Drafting sub-150-word cold outreach message...');
      const outreachResp = await draftOutreachMessage({
        type: 'hiring_manager',
        recipientName: 'Hiring Manager',
        jobTitle: parseResp.result.title,
        company: parseResp.result.company,
        userProfile,
        jobDetails: parseResp.result,
        standingRules: enabledRuleStrings
      });
      setOutreachDraft(outreachResp.result);

      // Step 4: Prep interview
      setCurrentStep('Generating 5 STAR interview cards & company pro-tips...');
      const interviewResp = await prepInterviewQuestions({
        jobTitle: parseResp.result.title,
        company: parseResp.result.company,
        coreSkills: parseResp.result.coreSkills,
        userProfile,
        standingRules: enabledRuleStrings
      });
      setInterviewPrep(interviewResp.result);

      setCurrentStep('Done!');
    } catch (err) {
      console.error('Workflow error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveApp = () => {
    if (!parsedResult) return;

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      company: parsedResult.company,
      role: parsedResult.title,
      location: parsedResult.location,
      salary: parsedResult.salaryRange,
      status: targetStatus,
      priority: targetPriority,
      appliedDate: targetStatus === 'applied' ? new Date().toISOString().split('T')[0] : undefined,
      followUpDate:
        targetStatus === 'applied'
          ? new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : undefined,
      interviewDate:
        targetStatus === 'interviewing'
          ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
          : undefined,
      jobDescription: rawText,
      parsedDetails: parsedResult,
      tailoredBullets: bulletsResult,
      fitScore,
      fitRationale,
      outreachDraft: outreachDraft || undefined,
      interviewPrep: interviewPrep || undefined,
      contacts: [],
      notes: `Generated via ApplyFlow Scanner.\nFit Score: ${fitScore}%\nRationale: ${fitRationale}`,
      tags: parsedResult.coreSkills.slice(0, 3),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveToPipeline(newApp);
    setSavedSuccess(true);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Sample Buttons */}
      <div className="bg-white border border-[#EBE8E3] rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#0F4A3E] text-xs font-semibold mb-2 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-[#0F4A3E]" />
              Automated Job Scanner & Tailor
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
              Paste Any Raw Job Description
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-2xl">
              ApplyFlow extracts requirements, measures alignment, crafts XYZ resume bullets, drafts cold outreach, and builds STAR interview flashcards — enforcing your permanent standing rules on every step.
            </p>
          </div>

            {/* Preset Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {onOpenJobClipper && (
                <button
                  type="button"
                  onClick={onOpenJobClipper}
                  className="h-8 inline-flex items-center gap-1.5 px-3 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                  <span>1-Click Clip from URL</span>
                </button>
              )}
              <span className="text-xs text-stone-500 font-medium">Try Sample:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {SAMPLE_JOB_POSTINGS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setRawText(sample.text)}
                    className="h-8 inline-flex items-center px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium border border-stone-200 transition-colors cursor-pointer"
                  >
                    {sample.company}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input Textarea */}
          <div className="relative">
            <textarea
              rows={7}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw job posting text, qualifications, responsibilities from LinkedIn, Indeed, Handshake..."
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 leading-relaxed font-sans"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <ShieldCheck className="w-4 h-4 text-[#0F4A3E]" />
                <span>
                  Applying <strong>{standingRules.filter((r) => r.enabled).length} Standing Rules</strong> (Zero AI Slop, XYZ formulas, &lt;150w brevity)
                </span>
              </div>

              <button
                onClick={handleScanAndGenerate}
                disabled={isProcessing || !rawText.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{currentStep || 'Analyzing...'}</span>
                  </>
                ) : (
                  <>
                    <FileSearch className="w-4 h-4" />
                    <span>Scan & Generate All Materials</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Generated Results Section */}
        {parsedResult && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header Action Bar */}
            <div className="bg-[#FAF9F7] border border-[#EBE8E3] rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#0F4A3E]" />
                    {fitScore}% Match Score
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    {parsedResult.experienceLevel} • {parsedResult.employmentType}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
                  {parsedResult.title} at {parsedResult.company}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
                  {fitRationale || parsedResult.summary}
                </p>
              </div>

              {/* Save to pipeline controls */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 bg-white p-2 rounded-2xl border border-stone-200 shadow-xs">
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as ApplicationStatus)}
                  className="h-8 bg-stone-50 text-stone-800 border border-stone-200 rounded-xl px-3 text-xs font-semibold cursor-pointer focus:outline-none"
                >
                  <option value="wishlist">Save to Wishlist</option>
                  <option value="applied">Mark as Applied</option>
                  <option value="interviewing">Interview Scheduled</option>
                </select>

                <select
                  value={targetPriority}
                  onChange={(e) => setTargetPriority(e.target.value as Priority)}
                  className="h-8 bg-stone-50 text-stone-800 border border-stone-200 rounded-xl px-3 text-xs font-semibold cursor-pointer focus:outline-none"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>

                {savedSuccess ? (
                  <div className="flex items-center gap-2">
                    <span className="h-8 px-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold inline-flex items-center gap-1 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      Saved to Pipeline!
                    </span>
                    <button
                      onClick={onNavigateToPipeline}
                      className="h-8 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 border border-stone-200"
                    >
                      <span>View Board</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSaveApp}
                    className="h-8 px-4 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save to Pipeline</span>
                  </button>
                )}
              </div>
            </div>

          {/* Grid of Results */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Column 1: Structured JD & Red Flags */}
            <div className="space-y-4">
              <div className="bg-white border border-[#EBE8E3] rounded-2xl p-5 space-y-4 shadow-xs">
                <h4 className="text-xs font-semibold uppercase text-stone-600 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#0F4A3E]" />
                  Role Specifications
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-stone-100">
                    <span className="text-stone-500">Location</span>
                    <span className="text-stone-900 font-medium">{parsedResult.location}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-100">
                    <span className="text-stone-500">Compensation</span>
                    <span className="text-[#0F4A3E] font-mono font-bold">{parsedResult.salaryRange}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-100">
                    <span className="text-stone-500">Seniority</span>
                    <span className="text-stone-900 font-medium">{parsedResult.experienceLevel}</span>
                  </div>
                </div>

                <div>
                  <h5 className="text-[11px] font-semibold text-stone-500 uppercase mb-2">Required Tech Stack</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedResult.coreSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 border border-stone-200 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {parsedResult.redFlags && parsedResult.redFlags.length > 0 && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    <span className="font-semibold text-rose-800 flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Rule Engine Red Flags Detected:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 font-medium">
                      {parsedResult.redFlags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: ATS Resume Bullets */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-[#EBE8E3] rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase text-stone-600 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#0F4A3E]" />
                    Tailored XYZ Resume Bullets (Ready to Paste)
                  </h4>
                  <button
                    onClick={() =>
                      handleCopy(bulletsResult.map((b) => `• ${b.text}`).join('\n\n'), 'all-scanned-bullets')
                    }
                    className="text-xs text-[#0F4A3E] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    {copiedKey === 'all-scanned-bullets' ? (
                      <Check className="w-3.5 h-3.5 text-[#0F4A3E]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy All</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {bulletsResult.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="bg-[#FAF9F7] border border-stone-200 hover:border-emerald-300 rounded-xl p-3.5 transition-colors space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-stone-800 text-xs sm:text-sm leading-relaxed flex-1">
                          • {bullet.text}
                        </p>
                        <button
                          onClick={() => handleCopy(bullet.text, `b-${idx}`)}
                          className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer shrink-0 border border-stone-200 shadow-2xs"
                          title="Copy bullet"
                        >
                          {copiedKey === `b-${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-[#0F4A3E]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-stone-500 pt-1 border-t border-stone-200">
                        <span className="font-mono text-stone-700">{bullet.targetKeyword}</span>
                        <span>•</span>
                        <span className="text-[#0F4A3E] font-mono font-bold">{bullet.impactType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outreach Preview */}
              {outreachDraft && (
                <div className="bg-white border border-[#EBE8E3] rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase text-stone-600 flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-[#0F4A3E]" />
                      Cold Email Draft ({outreachDraft.wordCount} words)
                    </h4>
                    <button
                      onClick={() =>
                        handleCopy(`Subject: ${outreachDraft.subject}\n\n${outreachDraft.body}`, 'scanner-email')
                      }
                      className="text-xs text-[#0F4A3E] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      {copiedKey === 'scanner-email' ? (
                        <Check className="w-3.5 h-3.5 text-[#0F4A3E]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy Email</span>
                    </button>
                  </div>

                  <div className="bg-[#FAF9F7] p-3 rounded-xl border border-stone-200 text-xs font-medium text-stone-800">
                    <span className="text-stone-500 font-mono">Subject: </span>
                    {outreachDraft.subject}
                  </div>

                  <div className="bg-[#FAF9F7] p-3 rounded-xl border border-stone-200 text-xs text-stone-800 whitespace-pre-wrap leading-relaxed font-sans">
                    {outreachDraft.body}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
