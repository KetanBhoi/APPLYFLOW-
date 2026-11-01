export type ApplicationStatus = 'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected';
export type Priority = 'high' | 'medium' | 'low';

export interface JobParsedDetails {
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  employmentType: string;
  experienceLevel: string;
  summary: string;
  coreSkills: string[];
  niceToHaveSkills: string[];
  keyResponsibilities: string[];
  redFlags: string[];
  culturePerks: string[];
  enforcedRules?: string[];
}

export interface TailoredBullet {
  text: string;
  targetKeyword: string;
  impactType: string;
  rulesFollowed: string[];
}

export interface OutreachDraft {
  subject: string;
  body: string;
  wordCount: number;
  keyAngle: string;
  type: 'recruiter' | 'hiring_manager' | 'peer_referral' | 'thank_you';
  enforcedRules: string[];
}

export interface StarQuestion {
  id: string;
  question: string;
  category: string;
  interviewerIntent: string;
  starGuide: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  pitfallsToAvoid: string;
  userNotes?: string;
}

export interface InterviewPrepPlan {
  questions: StarQuestion[];
  proTip: string;
}

export interface ContactPerson {
  id: string;
  name: string;
  title: string;
  emailOrLinkedIn: string;
  notes?: string;
}

export type WarmContactAffinity =
  | 'alumni'
  | 'mutual_company'
  | 'domain_peer'
  | 'hiring_team'
  | 'second_degree';

export type WarmOutreachStatus =
  | 'identified'
  | 'invite_sent'
  | 'connected'
  | 'chat_scheduled'
  | 'advocate_referred';

export interface WarmOutreachMessages {
  connectionInvite: string; // Strictly <= 300 chars for free connection note
  inMailCoffeeChat: string; // ~100 words
  preInterviewAdviceAsk: string; // Tailored to upcoming interview stage
}

export interface WarmLinkedInContact {
  id: string;
  applicationId: string;
  company: string;
  name: string;
  title: string;
  affinity: WarmContactAffinity;
  affinityDetail: string;
  location?: string;
  linkedInUrl?: string;
  mutualCount?: number;
  status: WarmOutreachStatus;
  lastContactDate?: string;
  notes?: string;
  generatedOutreach?: WarmOutreachMessages;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  salary: string;
  status: ApplicationStatus;
  priority: Priority;
  appliedDate?: string;
  followUpDate?: string;
  interviewDate?: string;
  jobUrl?: string;
  jobDescription: string;
  parsedDetails?: JobParsedDetails;
  tailoredBullets?: TailoredBullet[];
  fitScore?: number;
  fitRationale?: string;
  outreachDraft?: OutreachDraft;
  interviewPrep?: InterviewPrepPlan;
  contacts: ContactPerson[];
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  executiveDossier?: ExecutiveDossier;
  interviewRounds?: InterviewRoundLog[];
  warmContacts?: WarmLinkedInContact[];
  activityTimeline?: {
    id: string;
    type: 'applied' | 'created' | 'status_change' | 'interview' | 'follow_up' | 'note_added';
    date: string;
    description: string;
    details?: string;
  }[];
}

export interface StandingRule {
  id: string;
  title: string;
  category: 'tone' | 'brevity' | 'keywords' | 'integrity' | 'cadence' | 'custom';
  instruction: string;
  enabled: boolean;
  timesEnforced: number;
  description: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  headline: string;
  currentRole: string;
  yearsOfExp: number;
  skills: string[];
  experienceSnippets: string[];
  targetLocations: string[];
  targetSalary: string;
}

export interface VibePlan {
  taskName: string;
  problem: string;
  inputs: string;
  process: string;
  output: string;
  goal: string;
  standingRulesCount: number;
}

export interface ResumeExperience {
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
}

export interface TailoredResume {
  targetJobTitle: string;
  targetCompany: string;
  atsMatchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    links: { label: string; url: string }[];
  };
  summary: string;
  skillsCategorized: {
    category: string;
    skills: string[];
  }[];
  experience: ResumeExperience[];
  education: {
    degree: string;
    school: string;
    year: string;
    highlights?: string[];
  }[];
  certifications?: string[];
}

export interface JobOffer {
  id: string;
  company: string;
  role: string;
  baseSalary: number;
  annualEquity: number;
  signOnBonus: number;
  annualBonus: number;
  benefitsValue: number;
  remoteStipend: number;
  ptoDays: number;
  workMode: 'remote' | 'hybrid' | 'onsite';
  location: string;
  deadline?: string;
  pros: string[];
  cons: string[];
  notes?: string;
}

export interface CompanyResearchDossier {
  company: string;
  overview: string;
  businessModel: string;
  techStackHighlights: string[];
  engineeringCulture: string[];
  reverseInterviewQuestions: {
    target: 'hiring_manager' | 'peer_engineer' | 'founder_exec';
    question: string;
    whyAskThis: string;
  }[];
}

export interface MockInterviewMessage {
  id: string;
  sender: 'ai_interviewer' | 'candidate';
  text: string;
  timestamp: string;
  feedback?: {
    durationSeconds?: number;
    fillerWordsDetected?: string[];
    confidenceRating?: number;
    clarityScore?: number;
    strengths?: string[];
    improvementTip?: string;
  };
}

export interface KeywordAnalysis {
  keyword: string;
  jdFrequency: number;
  resumePresence: 'Present' | 'Partial' | 'Missing';
  evidenceSource: string;
  action: 'Strengthen' | 'Move higher' | 'Add to relevant bullet' | 'Do not add' | 'Rewrite evidence';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface BulletModification {
  id: string;
  section: 'summary' | 'experience' | 'skills' | 'projects';
  type: 'MODIFIED' | 'ADDED' | 'REORDERED' | 'REMOVED' | 'UNCHANGED';
  original: string;
  tailored: string;
  whyChanged: string;
  supportedByResume: boolean;
  unsupportedFlag?: string;
  userConfirmed?: boolean;
}

export interface MatchBreakdownCategory {
  category: string;
  weight: number;
  score: number;
  description: string;
}

export interface RemainingGap {
  id: string;
  requirement: string;
  reason: string;
  category: string;
  isResolved?: boolean;
  userEvidence?: string;
}

export interface AutoTailorResult {
  originalMatchScore: number;
  tailoredMatchScore: number;
  scoreImprovement: number;
  categories: MatchBreakdownCategory[];
  keywordsMatrix: KeywordAnalysis[];
  bulletModifications: BulletModification[];
  strongMatches: string[];
  improvedMatches: string[];
  remainingGaps: RemainingGap[];
  originalResumeText: string;
  tailoredResume: TailoredResume;
  passNumber: number;
  canOptimizeFurther: boolean;
  auditExplanation: string;
}

export interface ResumeVersion {
  id: string;
  versionName: string;
  date: string;
  jobTitle: string;
  company: string;
  originalScore: number;
  finalScore: number;
  tailoredResume: TailoredResume;
  modificationsCount: number;
}

export interface BulletHistoryEntry {
  id: string;
  timestamp: string;
  originalBullet: string;
  tailoredBullet: string;
  whyChanged: string;
  roleContext: string;
  companyContext: string;
  versionName: string;
  xyzFormulaApplied?: boolean;
}

export interface ResumeDraft {
  id: string;
  roleTarget: string;
  draftName: string;
  targetCompany: string;
  jobDescription: string;
  resumeTextInput: string;
  atsMatchScore: number;
  lastUpdated: string;
  createdAt: string;
  tailorResult?: AutoTailorResult | null;
  bulletModificationsHistory: BulletModification[];
  bulletHistoryEntries?: BulletHistoryEntry[];
  tags?: string[];
}

export interface AtsActionableSuggestion {
  id: string;
  category: 'Keywords' | 'Metrics' | 'Formatting' | 'Summary' | 'Experience' | 'Education';
  priority: 'high' | 'medium' | 'low';
  title: string;
  explanation: string;
  suggestedAction: string;
}

export interface AtsRedFlag {
  title: string;
  severity: 'high' | 'medium' | 'low';
  advice: string;
}

export interface AtsCompatibilityReport {
  success: boolean;
  overallScore: number;
  rating: 'Excellent' | 'Good' | 'Moderate' | 'Needs Improvement';
  summary: string;
  passProbability: string;
  subScores: {
    keywordMatch: number;
    formatAndParseability: number;
    quantifiableImpact: number;
    hardSkillsMatch: number;
    softSkillsMatch: number;
  };
  topMissingKeywords: string[];
  matchedKeywords: string[];
  actionableSuggestions: AtsActionableSuggestion[];
  atsRedFlags: AtsRedFlag[];
  passedChecks: string[];
  recruiterScanVerdict: string;
  source?: string;
  analyzedAt?: string;
}

export interface DossierMilestone {
  theme: string;
  goals: string[];
  kpis: string[];
  deliverables: string[];
}

export interface PanelAlignmentItem {
  interviewerRole: string;
  keyEvaluationFocus: string;
  recommendedProofPoint: string;
  reverseQuestion: string;
}

export interface StrategicRiskItem {
  risk: string;
  mitigation: string;
  earlySignal: string;
}

export interface ExecutiveDossier {
  executiveSummary: string;
  targetRole: string;
  targetCompany: string;
  valueProposition: string[];
  plan30Days: DossierMilestone;
  plan60Days: DossierMilestone;
  plan90Days: DossierMilestone;
  panelAlignment: PanelAlignmentItem[];
  strategicRisks: StrategicRiskItem[];
  generatedAt: string;
  source?: string;
}

export type InterviewRoundType =
  | 'recruiter_screen'
  | 'technical_coding'
  | 'system_design'
  | 'hiring_manager'
  | 'leadership_culture'
  | 'executive_panel'
  | 'case_study';

export interface LoggedInterviewQuestion {
  id: string;
  question: string;
  answerSummary: string;
  category: 'technical' | 'behavioral' | 'architecture' | 'culture' | 'scenario';
  confidence: 'high' | 'medium' | 'low';
}

export interface InterviewRoundLog {
  id: string;
  roundType: InterviewRoundType;
  roundName: string;
  interviewerName: string;
  interviewerTitle: string;
  date: string;
  durationMinutes: number;
  questions: LoggedInterviewQuestion[];
  whatWentWell: string;
  areasToImprove: string;
  followUpPromises: string;
  selfRating: number; // 1 to 5
  thankYouNoteDraft?: {
    subject: string;
    body: string;
    talkingPointsReinforced: string[];
  };
  createdAt: string;
}

export type LeadershipFramework = 'amazon_lp' | 'google_values' | 'meta_values' | 'executive_core';

export interface CompetencyDefinition {
  id: string;
  name: string;
  framework: LeadershipFramework;
  frameworkLabel: string;
  description: string;
  typicalQuestions: string[];
}

export interface BarRaiserDrillItem {
  id: string;
  question: string;
  interviewerIntent: string;
  userDefense?: string;
  aiEvaluation?: {
    score: number; // 0 - 100
    strengths: string[];
    riskPoints: string[];
    suggestedRefinement: string;
  };
}

export interface StarStoryVaultItem {
  id: string;
  title: string;
  companyContext: string;
  roleContext: string;
  timeframe: string;
  targetCompetencies: string[];
  rawNotes?: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  quantifiedMetrics: string[];
  hookSoundbite: string;
  spokenPitch90s: string;
  whatIdDoDifferently: string;
  associatedApplicationIds: string[];
  barRaiserDrills: BarRaiserDrillItem[];
  strengthScore: number;
  lastPracticedDate?: string;
  practiceCount: number;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}
