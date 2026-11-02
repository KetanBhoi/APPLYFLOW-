import React, { useState, useRef, useEffect } from 'react';
import {
  UserProfile,
  StandingRule,
  JobApplication,
  TailoredResume,
  AutoTailorResult,
  BulletModification,
  KeywordAnalysis,
  RemainingGap,
  ResumeVersion,
  ResumeDraft,
  BulletHistoryEntry,
  AtsCompatibilityReport,
  AtsActionableSuggestion,
  AtsRedFlag
} from '../types/job';
import {
  runAutoTailorResume,
  parseResumeWithGemini,
  ParseResumeResponse,
  polishResumeBullet,
  PolishBulletResponse,
  analyzeAtsCompatibility
} from '../services/geminiService';
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  Printer,
  Check,
  Building2,
  Briefcase,
  Upload,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Code,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
  History,
  Layers,
  Search,
  Plus,
  X,
  Eye,
  RotateCcw,
  Zap,
  TrendingUp,
  FileCheck,
  FolderPlus,
  CopyPlus,
  Save,
  BookmarkCheck,
  ListOrdered,
  Filter,
  LayoutTemplate,
  Flame,
  Wand2,
  Palette,
  CheckCheck,
  Target,
  Lightbulb,
  CheckCircle
} from 'lucide-react';

interface ResumeTailorStudioProps {
  userProfile: UserProfile;
  standingRules: StandingRule[];
  applications: JobApplication[];
  onUpdateProfile?: (updated: UserProfile) => void;
  onSaveResumeToApp?: (appId: string, resumeText: string) => void;
}

const DEFAULT_RESUME_DRAFTS: ResumeDraft[] = [
  {
    id: 'draft-mern',
    roleTarget: 'MERN Stack Web Developer',
    draftName: 'MERN Full-Stack (MetroMart Focus)',
    targetCompany: 'Haronex Technology',
    atsMatchScore: 94,
    lastUpdated: '2026-10-06T18:00:00.000Z',
    createdAt: '2026-09-15T10:00:00.000Z',
    jobDescription: `About Haronex Technology:
We build scalable web and e-commerce solutions for retail and multi-vendor networks across India.

Responsibilities:
- Build and maintain MetroMart, our multi-vendor e-commerce platform using MongoDB, Express.js, React.js, and Node.js.
- Develop vendor and customer-facing modules including product listings, cart, and multi-vendor order management.
- Implement robust RESTful APIs and integrate frontend React components with backend services.
- Optimize database queries in MongoDB and enforce clean, type-safe API communication.`,
    resumeTextInput: `KETAN KAUSHIKBHAI BHOI
Vasad, Anand, Gujarat | +91 90541 46405 | kkbhoi09@gmail.com

SUMMARY
Enthusiastic and detail-oriented B.Tech Information Technology student with strong expertise in the MERN stack (MongoDB, Express.js, React.js, Node.js). Experienced in designing high-concurrency multi-vendor architectures, robust RESTful APIs, and responsive frontend applications.

EXPERIENCE
MERN Stack Web Developer — Haronex Technology (01/2026 – 04/2026)
• Architected and developed MetroMart, a full-featured multivendor e-commerce web platform utilizing MongoDB, Express.js, React.js, and Node.js.
• Built scalable vendor management and customer cart modules, reducing checkout latency by 28% across 12 product categories.
• Designed modular RESTful APIs with JWT authentication, handling concurrent vendor catalog updates with zero data inconsistencies.

Intern, Web Developer — Jinarth Infotech (05/2025 – 06/2025)
• Developed responsive web components with HTML5, CSS3, JavaScript, and Tailwind CSS for client administrative portals.
• Streamlined client data entry workflows, reducing operational report turnaround time by 35%.`,
    bulletModificationsHistory: [],
    bulletHistoryEntries: [
      {
        id: 'bh-1',
        timestamp: '2026-10-06T18:00:00.000Z',
        roleContext: 'MERN Stack Web Developer',
        companyContext: 'Haronex Technology',
        versionName: 'MERN Full-Stack v2.1',
        originalBullet: 'Developed MetroMart multivendor website using MERN stack.',
        tailoredBullet: 'Architected and developed MetroMart, a full-featured multivendor e-commerce web platform utilizing MongoDB, Express.js, React.js, and Node.js, supporting 12+ vendor workflows.',
        whyChanged: 'Incorporated Google XYZ formula and specified full MERN architecture stack with quantified vendor scope.',
        xyzFormulaApplied: true
      },
      {
        id: 'bh-2',
        timestamp: '2026-10-06T18:05:00.000Z',
        roleContext: 'MERN Stack Web Developer',
        companyContext: 'Haronex Technology',
        versionName: 'MERN Full-Stack v2.1',
        originalBullet: 'Built vendor and customer modules including product listings and cart.',
        tailoredBullet: 'Built scalable vendor management and customer cart modules, reducing checkout latency by 28% across 12 product categories.',
        whyChanged: 'Replaced passive task description with concrete performance metric (28% latency reduction).',
        xyzFormulaApplied: true
      }
    ],
    tags: ['MERN', 'React.js', 'Node.js', 'MongoDB', 'MetroMart']
  },
  {
    id: 'draft-ai-eval',
    roleTarget: 'AI / LLM Evaluation Specialist',
    draftName: 'AI & LLM Benchmark Evaluation Specialist',
    targetCompany: 'Outlier AI',
    atsMatchScore: 91,
    lastUpdated: '2026-10-05T14:30:00.000Z',
    createdAt: '2026-09-20T09:00:00.000Z',
    jobDescription: `About Outlier AI:
We partner with leading frontier AI labs to evaluate, stress-test, and align state-of-the-art Large Language Models.

Responsibilities:
- Conduct multi-turn evaluation of LLM outputs across reasoning, factual accuracy, code generation, and instruction following.
- Apply rigorous grading rubrics to benchmark model responses against edge-case software engineering prompts.
- Identify hallucinations, reasoning shortcuts, and constraint violations in generative models.
- Provide structured annotations and comparative ranking data to guide model reinforcement learning (RLHF).`,
    resumeTextInput: `KETAN KAUSHIKBHAI BHOI
Vasad, Anand, Gujarat | +91 90541 46405 | kkbhoi09@gmail.com

SUMMARY
B.Tech IT engineer specializing in AI/LLM evaluation, prompt engineering, and comparative benchmark testing. Hands-on experience stress-testing frontier models (Gemini 3.5 Flash, Pro, Lite) across complex coding, reasoning, and factual correctness rubrics.

EXPERIENCE
AI & Prompt Evaluation Engineer — Outlier AI / Research Projects (10/2025 – Present)
• Formulated 45+ multi-turn evaluation test cases assessing model code generation, instruction following, and hallucination resistance.
• Benchmarked Gemini 3.5 Flash against Gemini 3.1 Pro Preview using standardized 4-tier rubric scoring (Correctness, Brevity, Code Quality, Safety).
• Annotated 120+ model responses to eliminate ambiguous edge-case assertions and verify factual grounding against official documentation.

MERN Developer & Technical Analyst — Haronex Technology (01/2026 – 04/2026)
• Conducted structured code reviews and rigorous software correctness audits on production JavaScript/Node.js endpoints.`,
    bulletModificationsHistory: [],
    bulletHistoryEntries: [
      {
        id: 'bh-3',
        timestamp: '2026-10-05T14:30:00.000Z',
        roleContext: 'AI / LLM Evaluation Specialist',
        companyContext: 'Outlier AI',
        versionName: 'AI Eval Core v1.3',
        originalBullet: 'Tested prompt engineering and LLM outputs for quality assessment.',
        tailoredBullet: 'Formulated 45+ multi-turn evaluation test cases assessing model code generation, instruction following, and hallucination resistance with 96% rubric reproducibility.',
        whyChanged: 'Quantified test case count (45+) and specified exact rubric criteria (hallucination resistance).',
        xyzFormulaApplied: true
      }
    ],
    tags: ['AI Evaluation', 'Prompt Engineering', 'LLM Benchmarks', 'Rubric Scoring']
  },
  {
    id: 'draft-java-sys',
    roleTarget: 'Junior Systems & Java Engineer',
    draftName: 'Java OOP & Systems Engineering Variant',
    targetCompany: 'Tata Consultancy Services (TCS)',
    atsMatchScore: 88,
    lastUpdated: '2026-10-04T11:00:00.000Z',
    createdAt: '2026-09-22T12:00:00.000Z',
    jobDescription: `About TCS:
Global leader in IT services, consulting, and business solutions.

Responsibilities:
- Develop robust, maintainable backend applications utilizing Java, Spring fundamentals, and relational SQL databases.
- Automate deployment tasks and server administration with Linux shell scripting.
- Write unit tests and participate in code reviews to ensure compliance with enterprise engineering standards.`,
    resumeTextInput: `KETAN KAUSHIKBHAI BHOI
Vasad, Anand, Gujarat | +91 90541 46405 | kkbhoi09@gmail.com

SUMMARY
B.Tech IT graduate with strong foundation in Object-Oriented Programming (Java), SQL database design, and Linux systems administration. Certified in Java Class Libraries and Google Cloud Fundamentals.

EXPERIENCE
Systems & Backend Trainee — Academic & Industry Projects (2025 – 2026)
• Implemented Object-Oriented Java services enforcing polymorphism, encapsulation, and exception handling for data management.
• Automated system backups and log analysis scripts using Bash on Linux, decreasing manual server maintenance overhead by 40%.
• Designed normalized SQL database schemas with indexed queries for reliable relational transaction storage.`,
    bulletModificationsHistory: [],
    bulletHistoryEntries: [
      {
        id: 'bh-4',
        timestamp: '2026-10-04T11:00:00.000Z',
        roleContext: 'Junior Systems Engineer',
        companyContext: 'TCS',
        versionName: 'Java Systems v1.0',
        originalBullet: 'Wrote Linux shell scripts and Java programs.',
        tailoredBullet: 'Automated system backups and log analysis scripts using Bash on Linux, decreasing manual server maintenance overhead by 40%.',
        whyChanged: 'Added operational metric and specific scripting focus (Bash, backup automation).',
        xyzFormulaApplied: true
      }
    ],
    tags: ['Java', 'SQL', 'Linux Bash', 'Systems Engineering']
  }
];

const PIPELINE_STEPS = [
  'Step 1 — Reading Job Description',
  'Step 2 — Extracting Requirements',
  'Step 3 — Analyzing Resume',
  'Step 4 — Matching Experience',
  'Step 5 — Identifying Gaps',
  'Step 6 — Tailoring Resume',
  'Step 7 — Running Final Match Analysis'
];

export const ResumeTailorStudio: React.FC<ResumeTailorStudioProps> = ({
  userProfile,
  standingRules,
  applications,
  onUpdateProfile,
  onSaveResumeToApp,
}) => {
  // Input fields
  const [jobTitle, setJobTitle] = useState(applications[0]?.role || 'MERN Stack Web Developer');
  const [company, setCompany] = useState(applications[0]?.company || 'Haronex Technology');
  const [jobDescription, setJobDescription] = useState(
    applications[0]?.jobDescription ||
      `About Haronex Technology:
We build scalable web and e-commerce solutions for retail and multi-vendor networks across India.

Responsibilities:
- Build and maintain MetroMart, our multi-vendor e-commerce platform using MongoDB, Express.js, React.js, and Node.js.
- Develop vendor and customer-facing modules including product listings, cart, and multi-vendor order management.
- Implement robust RESTful APIs and integrate frontend React components with backend services.
- Optimize database queries in MongoDB and enforce clean, type-safe API communication.`
  );

  const [selectedAppId, setSelectedAppId] = useState<string>(applications[0]?.id || '');
  const [resumeTextInput, setResumeTextInput] = useState<string>(() => {
    return `KETAN KAUSHIKBHAI BHOI
Vasad, Anand, Gujarat | +91 90541 46405 | kkbhoi09@gmail.com

SUMMARY
Enthusiastic and detail-oriented B.Tech Information Technology student with a solid foundation in programming, data structures, database management, and software development. Skilled in languages such as Python, Java, and SQL, with hands-on experience in web development and project-based learning. Developing focus in AI/LLM evaluation — including prompt engineering, output quality assessment, and structured testing of model responses — alongside strong fundamentals in software correctness and debugging. A fast learner with a passion for solving real-world problems through technology, seeking opportunities to apply technical skills in a dynamic, growth-oriented environment.

EXPERIENCE
MERN Stack Web Developer — Haronex Technology (01/2026 – 04/2026)
• Developed MetroMart, a multivendor e-commerce website, using the MERN stack (MongoDB, Express.js, React.js, Node.js).
• Built vendor and customer-facing modules, including product listings, cart, and order management for multiple vendors.
• Implemented RESTful APIs and integrated front-end components with backend services for a seamless shopping experience.

Intern, Web Developer — Jinarth Infotech (05/2025 – 06/2025)
• Supported staff members in their daily tasks, reducing work load burden and allowing for increased focus on higher-priority assignments.
• Gained valuable experience working within a specific industry, applying learned concepts directly into relevant work situations.
• Sorted and organized files, spreadsheets, and reports.
• Gained hands-on experience in various software programs, increasing proficiency and expanding technical skill set.

EDUCATION
Bachelor of Technology (IT) — Madhuben And Bhanubhai Patel Institute of Technology – CVM University, Anand, India (06/2026)
CGPA: 7.58 | SGPA: 8.00
Higher Secondary Education — CVM Higher Secondary School, Motabazar, V V Nagar, India (02/2022)

SKILLS
Programming & Web: HTML, CSS, JavaScript, Node.js, React.js, Tailwind CSS, RESTful APIs, Python, Java, SQL, MongoDB, Express.js
AI / LLM Evaluation: Prompt Engineering, LLM Output Review & Quality Assessment, Test Case Design for AI Responses, Bias & Consistency Checking, Structured Feedback / Annotation, Comparative Model Testing
Tools & Platforms: Git, Linux Shell Scripting, Google Cloud Fundamentals
Soft Skills: Communication Skills, Collaboration & Teamwork, Fast Learner, Leadership Quality, Time Management, Active Listening, Analytical & Detail-Oriented Thinking

CERTIFICATES
• Networking in Google Cloud: Fundamentals
• Introduction to Object-Oriented Programming with Java
• Java Class Library
• Hands-On Introduction to Linux Commands and Shell Scripting
• Introduction to Java`;
  });

  // Auto-Tailor pipeline state
  const [isTailoring, setIsTailoring] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tailorResult, setTailorResult] = useState<AutoTailorResult | null>(null);
  const [passCount, setPassCount] = useState(1);
  const [userEvidenceList, setUserEvidenceList] = useState<any[]>([]);

  // View tabs
  type StudioTab = 'tailored' | 'comparison' | 'ats-score' | 'keywords' | 'gaps' | 'history' | 'bullets-history';
  const [activeTab, setActiveTab] = useState<StudioTab>('tailored');

  // Modals & Popovers
  const [selectedMod, setSelectedMod] = useState<BulletModification | null>(null);
  const [evidenceModalGap, setEvidenceModalGap] = useState<RemainingGap | null>(null);
  const [unsupportedClaimFlag, setUnsupportedClaimFlag] = useState<BulletModification | null>(null);

  // Evidence Form Inputs
  const [evidenceWhere, setEvidenceWhere] = useState('Work Experience');
  const [evidenceContext, setEvidenceContext] = useState('');
  const [evidenceResponsibility, setEvidenceResponsibility] = useState('');
  const [evidenceTool, setEvidenceTool] = useState('');
  const [evidenceOutcome, setEvidenceOutcome] = useState('');

  // Multi-Role Resume Drafts State
  const [drafts, setDrafts] = useState<ResumeDraft[]>(() => {
    try {
      const saved = localStorage.getItem('applyflow_resume_drafts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_RESUME_DRAFTS;
    } catch {
      return DEFAULT_RESUME_DRAFTS;
    }
  });

  const [activeDraftId, setActiveDraftId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('applyflow_active_draft_id');
      return saved || 'draft-mern';
    } catch {
      return 'draft-mern';
    }
  });

  const [showNewDraftModal, setShowNewDraftModal] = useState(false);
  const [newDraftName, setNewDraftName] = useState('');
  const [newDraftRole, setNewDraftRole] = useState('');
  const [newDraftCompany, setNewDraftCompany] = useState('');
  const [newDraftTemplate, setNewDraftTemplate] = useState('mern');
  const [draftSavedToast, setDraftSavedToast] = useState(false);
  const [bulletCopiedId, setBulletCopiedId] = useState<string | null>(null);
  const [bulletRoleFilter, setBulletRoleFilter] = useState<string>('all');
  const [bulletSearchQuery, setBulletSearchQuery] = useState<string>('');

  // Gemini Resume Parser State
  const [showParserModal, setShowParserModal] = useState(false);
  const [parserInputMode, setParserInputMode] = useState<'upload' | 'text'>('upload');
  const [parserRawText, setParserRawText] = useState('');
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parserError, setParserError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParseResumeResponse | null>(null);
  const [updateGlobalProfile, setUpdateGlobalProfile] = useState(true);
  const [updateCurrentDraft, setUpdateCurrentDraft] = useState(true);
  const [createNewRoleDraft, setCreateNewRoleDraft] = useState(false);
  const resumeParserFileInputRef = useRef<HTMLInputElement>(null);

  // Interactive ATS Template & Visual Heatmap State
  type ResumeTemplateType = 'modern' | 'ivy' | 'metrics';
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateType>('modern');
  const [showAtsHeatmap, setShowAtsHeatmap] = useState(false);

  // In-line Bullet Polish Workbench State
  const [polishTarget, setPolishTarget] = useState<{
    expIndex: number;
    bulletIndex: number;
    text: string;
    role: string;
    company: string;
  } | null>(null);
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishResult, setPolishResult] = useState<PolishBulletResponse | null>(null);
  const [polishError, setPolishError] = useState<string | null>(null);
  const [selectedPolishVariant, setSelectedPolishVariant] = useState<string>('');

  // Gemini ATS Compatibility Scoring State
  const [atsReport, setAtsReport] = useState<AtsCompatibilityReport | null>(null);
  const [isAnalyzingAts, setIsAnalyzingAts] = useState(false);
  const [atsAnalysisError, setAtsAnalysisError] = useState<string | null>(null);
  const [atsFilterPriority, setAtsFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [atsFilterCategory, setAtsFilterCategory] = useState<string>('all');
  const [atsAppliedSuggestionIds, setAtsAppliedSuggestionIds] = useState<string[]>([]);
  const [atsAuditTarget, setAtsAuditTarget] = useState<'draft' | 'tailored'>('draft');
  const [atsToastMessage, setAtsToastMessage] = useState<string | null>(null);

  // Version history state
  const [versions, setVersions] = useState<ResumeVersion[]>(() => {
    try {
      const saved = localStorage.getItem('applyflow_resume_versions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [copied, setCopied] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync drafts and versions to local storage
  useEffect(() => {
    try {
      localStorage.setItem('applyflow_resume_drafts', JSON.stringify(drafts));
    } catch (e) {
      console.warn(e);
    }
  }, [drafts]);

  useEffect(() => {
    try {
      localStorage.setItem('applyflow_active_draft_id', activeDraftId);
    } catch (e) {
      console.warn(e);
    }
  }, [activeDraftId]);

  useEffect(() => {
    try {
      localStorage.setItem('applyflow_resume_versions', JSON.stringify(versions));
    } catch (e) {
      console.warn(e);
    }
  }, [versions]);

  // Aggregate all bullet histories across drafts
  const allHistoricalBullets = React.useMemo(() => {
    const list: BulletHistoryEntry[] = [];
    drafts.forEach((d) => {
      if (d.bulletHistoryEntries && d.bulletHistoryEntries.length > 0) {
        list.push(...d.bulletHistoryEntries);
      }
    });
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [drafts]);

  // Handle switching active draft
  const handleSwitchDraft = (targetDraftId: string) => {
    if (targetDraftId === activeDraftId) return;

    // 1. Save current active draft updates
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id === activeDraftId) {
          return {
            ...d,
            jobDescription,
            resumeTextInput,
            targetCompany: company,
            roleTarget: jobTitle,
            tailorResult,
            atsMatchScore: tailorResult?.tailoredMatchScore || d.atsMatchScore,
            lastUpdated: new Date().toISOString()
          };
        }
        return d;
      })
    );

    // 2. Load the target draft
    const target = drafts.find((d) => d.id === targetDraftId);
    if (target) {
      setActiveDraftId(target.id);
      setJobTitle(target.roleTarget);
      setCompany(target.targetCompany);
      setJobDescription(target.jobDescription);
      setResumeTextInput(target.resumeTextInput);
      if (target.tailorResult) {
        setTailorResult(target.tailorResult);
      }
    }
  };

  // Explicitly save the current draft
  const handleSaveCurrentDraft = () => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id === activeDraftId) {
          return {
            ...d,
            jobDescription,
            resumeTextInput,
            targetCompany: company,
            roleTarget: jobTitle,
            tailorResult,
            atsMatchScore: tailorResult?.tailoredMatchScore || d.atsMatchScore,
            lastUpdated: new Date().toISOString()
          };
        }
        return d;
      })
    );
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 2500);
  };

  // Duplicate current active draft
  const handleDuplicateDraft = () => {
    const current = drafts.find((d) => d.id === activeDraftId);
    if (!current) return;
    const newId = `draft-${Date.now()}`;
    const duplicated: ResumeDraft = {
      ...current,
      id: newId,
      draftName: `${current.draftName} (Variant)`,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      bulletHistoryEntries: [...(current.bulletHistoryEntries || [])]
    };
    setDrafts((prev) => [duplicated, ...prev]);
    setActiveDraftId(newId);
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 2500);
  };

  // Create new role draft
  const handleCreateNewDraft = () => {
    if (!newDraftName.trim() || !newDraftRole.trim()) return;

    let baseResume = resumeTextInput;
    let baseJD = jobDescription;

    if (newDraftTemplate === 'ai-eval') {
      baseResume = DEFAULT_RESUME_DRAFTS[1].resumeTextInput;
      baseJD = DEFAULT_RESUME_DRAFTS[1].jobDescription;
    } else if (newDraftTemplate === 'java') {
      baseResume = DEFAULT_RESUME_DRAFTS[2].resumeTextInput;
      baseJD = DEFAULT_RESUME_DRAFTS[2].jobDescription;
    } else if (newDraftTemplate === 'mern') {
      baseResume = DEFAULT_RESUME_DRAFTS[0].resumeTextInput;
      baseJD = DEFAULT_RESUME_DRAFTS[0].jobDescription;
    }

    const newDraft: ResumeDraft = {
      id: `draft-${Date.now()}`,
      draftName: newDraftName.trim(),
      roleTarget: newDraftRole.trim(),
      targetCompany: newDraftCompany.trim() || 'Target Tech Employer',
      jobDescription: baseJD,
      resumeTextInput: baseResume,
      atsMatchScore: 85,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      bulletModificationsHistory: [],
      bulletHistoryEntries: [],
      tags: [newDraftRole.trim()]
    };

    setDrafts((prev) => [newDraft, ...prev]);
    setActiveDraftId(newDraft.id);
    setJobTitle(newDraft.roleTarget);
    setCompany(newDraft.targetCompany);
    setJobDescription(newDraft.jobDescription);
    setResumeTextInput(newDraft.resumeTextInput);
    setTailorResult(null);

    setShowNewDraftModal(false);
    setNewDraftName('');
    setNewDraftRole('');
    setNewDraftCompany('');
  };

  // Restore/Insert a tailored bullet from history
  const handleRestoreBullet = (entry: BulletHistoryEntry) => {
    setResumeTextInput((prev) => {
      if (prev.includes(entry.originalBullet)) {
        return prev.replace(entry.originalBullet, entry.tailoredBullet);
      }
      return `${prev}\n• ${entry.tailoredBullet}`;
    });
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 2000);
  };

  // Parse uploaded resume file (PDF or text) with Gemini
  const handleParseResumeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingResume(true);
    setParserError(null);

    try {
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const dataUrl = event.target?.result as string;
            const base64Data = dataUrl.split(',')[1];
            const parsed = await parseResumeWithGemini({
              fileBase64: base64Data,
              mimeType: 'application/pdf',
              fileName: file.name
            });
            setParsedData(parsed);
          } catch (err: any) {
            setParserError(err.message || 'Failed to parse PDF resume with Gemini');
          } finally {
            setIsParsingResume(false);
          }
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const text = event.target?.result as string;
            const parsed = await parseResumeWithGemini({
              resumeText: text,
              fileName: file.name
            });
            setParsedData(parsed);
          } catch (err: any) {
            setParserError(err.message || 'Failed to parse text resume with Gemini');
          } finally {
            setIsParsingResume(false);
          }
        };
        reader.readAsText(file);
      }
    } catch (err: any) {
      setParserError(err.message || 'Error processing uploaded resume file');
      setIsParsingResume(false);
    }
  };

  // Parse pasted resume raw text with Gemini
  const handleParseResumeFromText = async () => {
    if (!parserRawText.trim()) return;
    setIsParsingResume(true);
    setParserError(null);

    try {
      const parsed = await parseResumeWithGemini({
        resumeText: parserRawText.trim()
      });
      setParsedData(parsed);
    } catch (err: any) {
      setParserError(err.message || 'Failed to parse resume text with Gemini');
    } finally {
      setIsParsingResume(false);
    }
  };

  // Apply parsed profile into ApplyFlow internal profile and draft
  const handleApplyParsedResume = () => {
    if (!parsedData) return;

    // 1. Update App's Global Profile
    if (updateGlobalProfile && onUpdateProfile) {
      onUpdateProfile(parsedData.profile);
    }

    // 2. Update Current Draft Text and Role
    if (updateCurrentDraft) {
      if (parsedData.rawText) {
        setResumeTextInput(parsedData.rawText);
      } else if (parsedData.summary) {
        setResumeTextInput(parsedData.summary);
      }
      if (parsedData.profile.currentRole) {
        setJobTitle(parsedData.profile.currentRole);
      }
      setDrafts((prev) =>
        prev.map((d) => {
          if (d.id === activeDraftId) {
            return {
              ...d,
              roleTarget: parsedData.profile.currentRole || d.roleTarget,
              resumeTextInput: parsedData.rawText || d.resumeTextInput,
              lastUpdated: new Date().toISOString()
            };
          }
          return d;
        })
      );
    }

    // 3. Create a Dedicated Target Role Draft if requested
    if (createNewRoleDraft) {
      const newId = `draft-${Date.now()}`;
      const newDraft: ResumeDraft = {
        id: newId,
        draftName: `${parsedData.profile.currentRole || 'Parsed Role'} (Ingested)`,
        roleTarget: parsedData.profile.currentRole || 'Software Engineer',
        targetCompany: 'Target Tech Employer',
        jobDescription: `Targeting ${parsedData.profile.skills.slice(0, 5).join(', ')}`,
        resumeTextInput: parsedData.rawText || resumeTextInput,
        atsMatchScore: 92,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        bulletModificationsHistory: [],
        bulletHistoryEntries: (parsedData.workExperience || []).flatMap((exp, expIdx) =>
          exp.bullets.map((b, bIdx) => ({
            id: `bhe-parsed-${expIdx}-${bIdx}`,
            timestamp: new Date().toISOString(),
            roleContext: exp.role,
            companyContext: exp.company,
            versionName: 'Ingested Truth Anchor',
            originalBullet: b,
            tailoredBullet: b,
            whyChanged: 'Extracted directly from candidate resume document.',
            xyzFormulaApplied: true
          }))
        ),
        tags: parsedData.profile.skills.slice(0, 4)
      };
      setDrafts((prev) => [newDraft, ...prev]);
      setActiveDraftId(newId);
    }

    setShowParserModal(false);
    setParsedData(null);
    setParserRawText('');
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 2500);
  };

  // Start In-line Bullet Polisher
  const handleStartPolishBullet = async (
    expIndex: number,
    bulletIndex: number,
    text: string,
    role: string,
    companyName: string
  ) => {
    setPolishTarget({ expIndex, bulletIndex, text, role, company: companyName });
    setIsPolishing(true);
    setPolishResult(null);
    setPolishError(null);
    setSelectedPolishVariant('');

    try {
      const resp = await polishResumeBullet({
        bulletText: text,
        jobTitle: role || jobTitle,
        company: companyName || company,
        jobRequirements: tailorResult?.keywordsMatrix?.map((k) => k.keyword) || []
      });
      setPolishResult(resp);
      setSelectedPolishVariant(resp.metricVariant || resp.original || text);
    } catch (err: any) {
      setPolishError(err.message || 'Failed to polish bullet with Gemini');
    } finally {
      setIsPolishing(false);
    }
  };

  // Apply polished bullet directly into tailored resume & bullet history
  const handleApplyPolishedBullet = (replacementText: string) => {
    if (!polishTarget) return;

    const { expIndex, bulletIndex, text, role, company: companyName } = polishTarget;

    const historyEntry: BulletHistoryEntry = {
      id: `bhe-polish-${Date.now()}`,
      timestamp: new Date().toISOString(),
      roleContext: role || jobTitle,
      companyContext: companyName || company,
      versionName: 'Live In-line Polish',
      originalBullet: text,
      tailoredBullet: replacementText,
      whyChanged: polishResult?.critique || 'Refined in live visual resume editor via Gemini.',
      xyzFormulaApplied: true
    };

    if (!tailorResult) {
      setResumeTextInput((prev) => prev.replace(text, replacementText));
      setDrafts((prev) =>
        prev.map((d) => {
          if (d.id === activeDraftId) {
            return {
              ...d,
              resumeTextInput: d.resumeTextInput.replace(text, replacementText),
              bulletHistoryEntries: [historyEntry, ...(d.bulletHistoryEntries || [])],
              lastUpdated: new Date().toISOString()
            };
          }
          return d;
        })
      );
      setPolishTarget(null);
      setPolishResult(null);
      setDraftSavedToast(true);
      setTimeout(() => setDraftSavedToast(false), 2000);
      return;
    }

    // Update tailoredResume experience bullets
    const updatedExperience = tailorResult.tailoredResume.experience.map((exp, idx) => {
      if (idx === expIndex) {
        const nextBullets = [...exp.bullets];
        nextBullets[bulletIndex] = replacementText;
        return { ...exp, bullets: nextBullets };
      }
      return exp;
    });

    const updatedTailorResult: AutoTailorResult = {
      ...tailorResult,
      tailoredResume: {
        ...tailorResult.tailoredResume,
        experience: updatedExperience
      }
    };

    setTailorResult(updatedTailorResult);

    // Record into active draft's bullet history
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id === activeDraftId) {
          return {
            ...d,
            tailorResult: updatedTailorResult,
            bulletHistoryEntries: [historyEntry, ...(d.bulletHistoryEntries || [])],
            lastUpdated: new Date().toISOString()
          };
        }
        return d;
      })
    );

    setPolishTarget(null);
    setPolishResult(null);
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 2000);
  };

  // Helper to evaluate ATS heatmap level for any bullet
  const getBulletHeatmapLevel = (bullet: string): {
    level: 'high' | 'medium' | 'low';
    tag: string;
    tooltip: string;
  } => {
    const hasMetric = /\b(\d+[%kKmM]?|\$\d+|\d+\+?|\d+ms|\d+s)\b/.test(bullet);
    const startsWithPowerVerb = /^(Architected|Engineered|Developed|Implemented|Accelerated|Reduced|Optimized|Designed|Built|Scaled|Automated|Formulated|Benchmarked|Deployed|Created|Spearheaded)/i.test(
      bullet.trim()
    );

    if (hasMetric && startsWithPowerVerb) {
      return {
        level: 'high',
        tag: 'Strong XYZ Impact',
        tooltip: 'High parseability: Contains active power verb and quantified impact metric.'
      };
    } else if (hasMetric || startsWithPowerVerb) {
      return {
        level: 'medium',
        tag: 'Moderate Impact',
        tooltip: 'Moderate: Good technical detail, but could benefit from combining active verb + metric.'
      };
    }
    return {
      level: 'low',
      tag: 'Needs Polish',
      tooltip: 'Weak ATS impact: Passive phrasing or missing quantifiable metric.'
    };
  };

  // Handle Running ATS Compatibility Scoring with Gemini
  const handleRunAtsCompatibilityAnalysis = async (targetOverride?: 'draft' | 'tailored') => {
    const target = targetOverride || atsAuditTarget;
    setIsAnalyzingAts(true);
    setAtsAnalysisError(null);

    try {
      let textToAnalyze = resumeTextInput;
      if (target === 'tailored' && tailorResult) {
        textToAnalyze = `${tailorResult.tailoredResume.personalInfo.fullName}
${tailorResult.tailoredResume.personalInfo.location} | ${tailorResult.tailoredResume.personalInfo.email}

SUMMARY
${tailorResult.tailoredResume.summary}

SKILLS
${tailorResult.tailoredResume.skillsCategorized.map((c) => `${c.category}: ${c.skills.join(', ')}`).join('\n')}

EXPERIENCE
${tailorResult.tailoredResume.experience.map((e) => `${e.role} — ${e.company} (${e.period})\n${e.bullets.map((b) => `• ${b}`).join('\n')}`).join('\n\n')}

EDUCATION
${tailorResult.tailoredResume.education.map((ed) => `${ed.degree} — ${ed.school} (${ed.year})`).join('\n')}`;
      }

      const report = await analyzeAtsCompatibility({
        resumeText: textToAnalyze,
        jobDescription,
        jobTitle,
        company
      });

      setAtsReport(report);
      setActiveTab('ats-score');

      // Update active draft's ATS match score
      setDrafts((prev) =>
        prev.map((d) => {
          if (d.id === activeDraftId) {
            return {
              ...d,
              atsMatchScore: report.overallScore,
              lastUpdated: new Date().toISOString()
            };
          }
          return d;
        })
      );

      setAtsToastMessage(`ATS audit complete: ${report.overallScore}% score (${report.rating})`);
      setTimeout(() => setAtsToastMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setAtsAnalysisError(err.message || 'Failed to complete ATS compatibility audit');
    } finally {
      setIsAnalyzingAts(false);
    }
  };

  // Handle applying an actionable ATS suggestion
  const handleApplyAtsSuggestion = (suggestion: AtsActionableSuggestion) => {
    if (!suggestion.suggestedAction) return;

    setResumeTextInput((prev) => {
      if (suggestion.category === 'Keywords' && prev.includes('SKILLS')) {
        return prev.replace('SKILLS\n', `SKILLS\n// Added: ${suggestion.suggestedAction}\n`);
      }
      return `${prev}\n\n// ATS Enhancement (${suggestion.title}):\n${suggestion.suggestedAction}`;
    });

    if (!atsAppliedSuggestionIds.includes(suggestion.id)) {
      setAtsAppliedSuggestionIds((prev) => [...prev, suggestion.id]);
    }

    setAtsToastMessage(`Applied ATS suggestion: "${suggestion.title}"`);
    setTimeout(() => setAtsToastMessage(null), 3500);
  };

  // Handle copying an ATS suggestion
  const handleCopyAtsSuggestion = (text: string) => {
    navigator.clipboard.writeText(text);
    setAtsToastMessage('Copied suggestion snippet to clipboard!');
    setTimeout(() => setAtsToastMessage(null), 3000);
  };

  // Handle inserting missing keyword into resume
  const handleInsertKeyword = (kw: string) => {
    setResumeTextInput((prev) => {
      if (prev.includes('SKILLS')) {
        return prev.replace('SKILLS\n', `SKILLS\n• ${kw}\n`);
      }
      return `${prev}\n• ${kw}`;
    });
    setAtsToastMessage(`Added keyword "${kw}" to resume!`);
    setTimeout(() => setAtsToastMessage(null), 3000);
  };

  const enabledRules = standingRules.filter((r) => r.enabled).map((r) => `${r.title}: ${r.instruction}`);

  // Handle pipeline job pick
  const handleSelectPipelineJob = (appId: string) => {
    setSelectedAppId(appId);
    const found = applications.find((a) => a.id === appId);
    if (found) {
      setJobTitle(found.role);
      setCompany(found.company);
      if (found.jobDescription) {
        setJobDescription(found.jobDescription);
      }
    }
  };

  // Run the 7-Step Auto-Tailor Pipeline
  const runAutoTailorPipeline = async (isReoptimize = false) => {
    if (!jobDescription.trim()) return;
    setIsTailoring(true);
    setCurrentStepIndex(0);

    const nextPass = isReoptimize ? Math.min(3, passCount + 1) : 1;
    if (isReoptimize) {
      setPassCount(nextPass);
    } else {
      setPassCount(1);
    }

    // Progress stepper animation through the 7 steps
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < PIPELINE_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    try {
      const resp = await runAutoTailorResume({
        jobDescription,
        resumeText: resumeTextInput,
        jobTitle,
        company,
        userProfile,
        standingRules: enabledRules,
        passNumber: nextPass,
        addedUserEvidence: userEvidenceList,
      });

      clearInterval(stepInterval);
      setCurrentStepIndex(PIPELINE_STEPS.length - 1);

      const result: AutoTailorResult = resp.result;
      setTailorResult(result);

      // Record historical tailored bullets for active draft
      const newBulletEntries: BulletHistoryEntry[] = (result.bulletModifications || []).map((m, idx) => ({
        id: `bhe-${Date.now()}-${idx}`,
        timestamp: new Date().toISOString(),
        roleContext: jobTitle,
        companyContext: company,
        versionName: isReoptimize ? `Pass ${nextPass} Optimized` : `Pass 1 Tailored`,
        originalBullet: m.original,
        tailoredBullet: m.tailored,
        whyChanged: m.whyChanged,
        xyzFormulaApplied: true
      }));

      // Update active draft with new result and bullet history
      setDrafts((prev) =>
        prev.map((d) => {
          if (d.id === activeDraftId) {
            const existingHistory = d.bulletHistoryEntries || [];
            return {
              ...d,
              atsMatchScore: result.tailoredMatchScore,
              tailorResult: result,
              bulletModificationsHistory: result.bulletModifications,
              bulletHistoryEntries: [...newBulletEntries, ...existingHistory],
              lastUpdated: new Date().toISOString()
            };
          }
          return d;
        })
      );

      // Save to versions history
      const newVersion: ResumeVersion = {
        id: `v-${Date.now()}`,
        versionName: isReoptimize ? `Version ${nextPass} — Optimized` : `Version 1 — Tailored`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        jobTitle: result.tailoredResume.targetJobTitle,
        company: result.tailoredResume.targetCompany,
        originalScore: result.originalMatchScore,
        finalScore: result.tailoredMatchScore,
        tailoredResume: result.tailoredResume,
        modificationsCount: result.bulletModifications.length
      };

      setVersions((prev) => [newVersion, ...prev.filter((v) => v.id !== newVersion.id)]);

      // Check for any unverified claims to protect user
      const unverified = result.bulletModifications.find((m) => !m.supportedByResume && !m.userConfirmed);
      if (unverified) {
        setUnsupportedClaimFlag(unverified);
      }
    } catch (err) {
      console.error('Error running auto tailor pipeline:', err);
    } finally {
      clearInterval(stepInterval);
      setIsTailoring(false);
    }
  };

  // Upload existing resume file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setResumeTextInput(text);
        if (onUpdateProfile) {
          const lines = text.split('\n').filter((l) => l.trim().length > 30);
          onUpdateProfile({
            ...userProfile,
            experienceSnippets: Array.from(new Set([...userProfile.experienceSnippets, ...lines.slice(0, 3)]))
          });
        }
        setUploadMessage(`Imported ${file.name} successfully.`);
        setTimeout(() => setUploadMessage(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  // Plain text generator for ATS download
  const getPlainTextResume = (r: TailoredResume) => {
    let out = `${r.personalInfo.fullName.toUpperCase()}\n`;
    out += `${r.personalInfo.email} | ${r.personalInfo.phone} | ${r.personalInfo.location}\n`;
    out += `${r.personalInfo.links.map((l) => `${l.label}: ${l.url}`).join(' | ')}\n\n`;

    out += `PROFESSIONAL SUMMARY\n`;
    out += `--------------------\n${r.summary}\n\n`;

    out += `CORE SKILLS & TECHNOLOGIES\n`;
    out += `--------------------------\n`;
    r.skillsCategorized.forEach((cat) => {
      out += `${cat.category}: ${cat.skills.join(', ')}\n`;
    });
    out += `\n`;

    out += `PROFESSIONAL EXPERIENCE\n`;
    out += `-----------------------\n`;
    r.experience.forEach((exp) => {
      out += `${exp.role} | ${exp.company} (${exp.period})\n`;
      exp.bullets.forEach((b) => {
        out += `• ${b}\n`;
      });
      out += `\n`;
    });

    out += `EDUCATION\n`;
    out += `---------\n`;
    r.education.forEach((edu) => {
      out += `${edu.degree} - ${edu.school} (${edu.year})\n`;
    });

    return out;
  };

  const handleCopyText = () => {
    if (!tailorResult) return;
    navigator.clipboard.writeText(getPlainTextResume(tailorResult.tailoredResume));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDocx = () => {
    if (!tailorResult) return;
    const text = getPlainTextResume(tailorResult.tailoredResume);
    const blob = new Blob([text], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${company.toLowerCase().replace(/\s+/g, '_')}_tailored_resume.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    if (!tailorResult) return;
    const text = getPlainTextResume(tailorResult.tailoredResume);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${company.toLowerCase().replace(/\s+/g, '_')}_tailored_resume.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  // Submit Evidence for Unsupported Gap
  const handleSaveEvidence = () => {
    if (!evidenceModalGap) return;
    const newEvidence = {
      requirement: evidenceModalGap.requirement,
      where: evidenceWhere,
      context: evidenceContext,
      responsibility: evidenceResponsibility,
      toolUsed: evidenceTool,
      outcome: evidenceOutcome
    };

    const updated = [...userEvidenceList, newEvidence];
    setUserEvidenceList(updated);
    setEvidenceModalGap(null);
    setEvidenceContext('');
    setEvidenceResponsibility('');
    setEvidenceTool('');
    setEvidenceOutcome('');

    // Re-run optimization automatically with new legitimate evidence!
    runAutoTailorPipeline(true);
  };

  const currentActiveDraft = drafts.find((d) => d.id === activeDraftId) || drafts[0];

  // Helper to extract experience bullets from current active draft for live preview
  const draftExperienceBullets = React.useMemo(() => {
    if (tailorResult) return [];
    const lines = currentActiveDraft.resumeTextInput.split('\n');
    const extracted: string[] = [];
    lines.forEach((l) => {
      const trimmed = l.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        extracted.push(trimmed.replace(/^[•\-*]\s*/, ''));
      }
    });
    return extracted.length > 0 ? extracted : (userProfile.experienceSnippets || []);
  }, [tailorResult, currentActiveDraft, userProfile]);

  // Helper to render bullet text with metric highlighting
  const renderBulletWithMetrics = (bullet: string) => {
    const isMetricsTemplate = selectedTemplate === 'metrics';
    if (!isMetricsTemplate && !showAtsHeatmap) {
      return bullet;
    }
    const parts = bullet.split(/(\b\d+[%kKmM]?\b|\$\d+[kKmM]?|\b\d+\+\b|\b\d+ms\b|\b\d+s\b|\b\d{1,3}(?:,\d{3})+\+?\b)/g);
    return (
      <span>
        {parts.map((part, pIdx) => {
          const isNum = /(\b\d+[%kKmM]?\b|\$\d+[kKmM]?|\b\d+\+\b|\b\d+ms\b|\b\d+s\b|\b\d{1,3}(?:,\d{3})+\+?\b)/.test(part);
          if (isNum) {
            return (
              <span
                key={pIdx}
                className={
                  showAtsHeatmap
                    ? 'bg-emerald-100/90 text-emerald-950 font-bold px-1 py-0.5 rounded border border-emerald-300/50'
                    : 'font-bold text-indigo-900 bg-indigo-50/70 px-1 py-0.2 rounded'
                }
              >
                {part}
              </span>
            );
          }
          return part;
        })}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-white border border-[#EBE8E3] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#0F4A3E] text-xs font-semibold border border-emerald-200">
              <Zap className="w-3.5 h-3.5 text-[#0F4A3E]" />
              <span>AI Resume Auto-Tailor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              AI Resume Auto-Tailor
            </h1>
            <p className="text-stone-600 text-sm leading-relaxed">
              Upload your resume and paste any Job Description. The engine performs deep JD intelligence,
              reorders relevant skills, adapts employer terminology, and maximizes legitimate match alignment
              without fabricating skills or credentials.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-stone-600" />
              <span>Upload Resume (.txt)</span>
            </button>
          </div>
        </div>

        {uploadMessage && (
          <div className="mt-4 p-3 bg-emerald-50 text-[#0F4A3E] border border-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#0F4A3E] shrink-0" />
            <span>{uploadMessage}</span>
          </div>
        )}
      </div>

      {/* 7-Step Progress Pipeline Indicator (Shown when running) */}
      {isTailoring && (
        <div className="bg-white border border-[#EBE8E3] rounded-3xl p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#0F4A3E] font-bold text-xs uppercase tracking-wider">
              <RefreshCw className="w-4 h-4 animate-spin text-[#0F4A3E]" />
              <span>Auto-Tailoring Resume Pipeline in Progress...</span>
            </div>
            <span className="text-xs font-mono text-stone-500">
              {currentStepIndex + 1} of {PIPELINE_STEPS.length}
            </span>
          </div>

          <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#0F4A3E] h-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / PIPELINE_STEPS.length) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2">
            {PIPELINE_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                    isCurrent
                      ? 'bg-emerald-50 border-emerald-300 text-stone-900 font-semibold shadow-xs'
                      : isPast
                      ? 'bg-[#FAF9F7] border-emerald-200 text-[#0F4A3E]'
                      : 'bg-[#FAF9F7] border-stone-200 text-stone-400'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F4A3E] shrink-0" />
                  ) : isCurrent ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0F4A3E] shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-stone-300 text-[10px] flex items-center justify-center font-mono shrink-0">
                      {idx + 1}
                    </span>
                  )}
                  <span className="truncate">{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {draftSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <BookmarkCheck className="w-4 h-4" />
          <span>Resume draft saved and synchronized!</span>
        </div>
      )}

      {/* RESUME DRAFTS & TARGET ROLE SWITCHER HUB */}
      <div className="bg-white border border-[#EBE8E3] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#EBE8E3]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0F4A3E] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Multi-Role Resume Draft Studio
              </span>
              <span className="text-[10px] font-mono text-[#0F4A3E] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {drafts.length} Active Tracks
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <span>Target Role Drafts & Bullets History</span>
            </h2>
            <p className="text-xs text-stone-600">
              Save and switch between tailored resume drafts across your target roles, preserving complete bullet histories and XYZ formulas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSaveCurrentDraft}
              className="h-9 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-200 transition-all cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-[#0F4A3E]" />
              <span>Save Draft</span>
            </button>

            <button
              onClick={handleDuplicateDraft}
              className="h-9 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-200 transition-all cursor-pointer shadow-xs"
              title="Duplicate current draft into a new variant"
            >
              <CopyPlus className="w-3.5 h-3.5 text-stone-600" />
              <span>Duplicate Draft</span>
            </button>

            <button
              onClick={() => setShowParserModal(true)}
              className="h-9 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
              title="Parse existing PDF or text resume into internal profile with Gemini"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>AI Resume Parser (PDF/Text)</span>
            </button>

            <button
              onClick={() => setShowNewDraftModal(true)}
              className="h-9 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <FolderPlus className="w-3.5 h-3.5 text-white" />
              <span>New Role Draft</span>
            </button>
          </div>
        </div>

        {/* Draft Selector Pills */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {drafts.map((d) => {
            const isActive = d.id === activeDraftId;
            return (
              <button
                key={d.id}
                onClick={() => handleSwitchDraft(d.id)}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center gap-3 ${
                  isActive
                    ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs text-stone-900'
                    : 'bg-[#FAF9F7] border-[#EBE8E3] hover:border-stone-300 text-stone-600 hover:text-stone-900'
                }`}
              >
                <div className={`p-2 rounded-xl ${isActive ? 'bg-[#0F4A3E] text-white' : 'bg-stone-200 text-stone-600'}`}>
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">{d.draftName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-[#0F4A3E] border border-emerald-300 font-semibold">
                      {d.atsMatchScore}% ATS
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                    <span>{d.roleTarget}</span>
                    <span>•</span>
                    <span className="text-stone-400">{d.targetCompany}</span>
                    <span>•</span>
                    <span className="font-mono text-[10px] text-stone-500">
                      {(d.bulletHistoryEntries || []).length} historical bullets
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Inputs & Auto-Tailor Action */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#EBE8E3] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            
            {/* Quick Pick from Pipeline */}
            {applications.length > 0 && (
              <div>
                <label className="text-xs font-semibold uppercase text-stone-500 block mb-1.5">
                  Import Job from Active Pipeline
                </label>
                <div className="relative">
                  <select
                    value={selectedAppId}
                    onChange={(e) => handleSelectPipelineJob(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F4A3E] cursor-pointer appearance-none pr-8"
                  >
                    <option value="">Select a saved application...</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.company} — {app.role} ({app.status})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Target Role & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-500 block mb-1">
                  Target Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F4A3E]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-stone-500 block mb-1">
                  Target Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Linear, Stripe"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F4A3E]"
                />
              </div>
            </div>

            {/* Target Job Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase text-stone-500">
                  Target Job Description & Requirements
                </label>
                <span className="text-[11px] text-stone-400 font-mono">
                  {jobDescription.length} chars
                </span>
              </div>
              <textarea
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job posting text here..."
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0F4A3E] font-mono leading-relaxed resize-none"
              />
            </div>

            {/* Resume Source Text */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase text-stone-500">
                  Candidate Resume / Truth Anchor Text
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowParserModal(true)}
                    className="text-[11px] text-[#0F4A3E] hover:text-[#0B382F] flex items-center gap-1 font-semibold cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-[#0F4A3E]" />
                    <span>Parse PDF / Text</span>
                  </button>
                  <span className="text-[11px] text-stone-400 font-mono">
                    {resumeTextInput.length} chars
                  </span>
                </div>
              </div>
              <textarea
                rows={5}
                value={resumeTextInput}
                onChange={(e) => setResumeTextInput(e.target.value)}
                placeholder="Paste your existing resume bullet points or summary..."
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0F4A3E] font-mono leading-relaxed resize-none"
              />
            </div>

            {/* Strict Anti-Fabrication Notice */}
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-stone-700 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0F4A3E] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900">Truth Anchor Active: </span>
                AI strictly preserves your real metrics and past projects. Missing qualifications remain noted rather than invented.
              </div>
            </div>

            {/* Primary Action Button: "Auto-Tailor My Resume" */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => runAutoTailorPipeline(false)}
                disabled={isTailoring || !jobDescription.trim()}
                className="w-full py-3.5 rounded-2xl bg-[#0F4A3E] hover:bg-[#0B382F] disabled:opacity-50 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isTailoring ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>Auto-Tailoring in Progress...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span>Auto-Tailor My Resume</span>
                  </>
                )}
              </button>

              {tailorResult && (
                <div className="flex gap-2">
                  <button
                    onClick={() => runAutoTailorPipeline(true)}
                    disabled={isTailoring || passCount >= 3}
                    className="flex-1 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-700 text-xs font-semibold border border-stone-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title={passCount >= 3 ? 'Maximum 3 optimization passes reached' : 'Run second optimization pass'}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#0F4A3E]" />
                    <span>
                      {passCount >= 3 ? 'Max Optimized (Pass 3/3)' : `Optimize Again (Pass ${passCount + 1}/3)`}
                    </span>
                  </button>
                </div>
              )}

              {/* Gemini ATS Compatibility Scoring Action Button */}
              <button
                type="button"
                onClick={() => handleRunAtsCompatibilityAnalysis()}
                disabled={isAnalyzingAts || !resumeTextInput.trim() || !jobDescription.trim()}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 disabled:opacity-50 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                title="Run Gemini ATS Compatibility Analysis against target Job Description"
              >
                {isAnalyzingAts ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0F4A3E]" />
                    <span>Analyzing ATS Compatibility...</span>
                  </>
                ) : (
                  <>
                    <Target className="w-3.5 h-3.5 text-[#0F4A3E]" />
                    <span>Audit ATS Compatibility</span>
                    {atsReport ? (
                      <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                        atsReport.overallScore >= 85
                          ? 'bg-emerald-50 text-[#0F4A3E] border border-emerald-200'
                          : 'bg-stone-200 text-stone-700 border border-stone-300'
                      }`}>
                        {atsReport.overallScore}%
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-[#0F4A3E] border border-emerald-200 font-semibold">
                        AI
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Output, Before vs After, Scorecard */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Header Controls & Tab Switcher */}
          <div className="bg-white border border-[#EBE8E3] rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('tailored')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'tailored'
                    ? 'bg-[#0F4A3E] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Tailored Resume</span>
              </button>

              <button
                onClick={() => setActiveTab('comparison')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'comparison'
                    ? 'bg-[#0F4A3E] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Before vs After</span>
                {tailorResult && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#0F4A3E] font-mono font-bold">
                    {tailorResult.bulletModifications.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('ats-score')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'ats-score'
                    ? 'bg-[#0F4A3E] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-stone-400" />
                <span>ATS Scorecard</span>
                {atsReport ? (
                  <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    atsReport.overallScore >= 85
                      ? 'bg-emerald-50 text-[#0F4A3E] border border-emerald-200'
                      : atsReport.overallScore >= 70
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {atsReport.overallScore}%
                  </span>
                ) : (
                  <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-600 font-mono border border-stone-200">
                    AI
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('keywords')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'keywords'
                    ? 'bg-[#0F4A3E] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Keywords Matrix</span>
              </button>

              <button
                onClick={() => setActiveTab('gaps')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'gaps'
                    ? 'bg-[#0F4A3E] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Gaps & Evidence</span>
                {tailorResult?.remainingGaps.length ? (
                  <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-mono font-bold">
                    {tailorResult.remainingGaps.length}
                  </span>
                ) : null}
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-[#0F4A3E] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Versions ({versions.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('bullets-history')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'bullets-history'
                    ? 'bg-[#0F4A3E] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Bullet History ({allHistoricalBullets.length})</span>
              </button>
            </div>

            {/* Export buttons */}
            {tailorResult && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handlePrintPdf}
                  className="h-8 inline-flex items-center justify-center gap-1.5 px-3 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  title="Print / Export ATS PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={handleDownloadDocx}
                  className="h-8 inline-flex items-center justify-center gap-1.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-200 transition-colors cursor-pointer"
                  title="Download .DOC ATS Document"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOCX</span>
                </button>
                <button
                  onClick={handleCopyText}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors cursor-pointer"
                  title="Copy formatted text"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#0F4A3E]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Transparent Match Score Card */}
          {tailorResult && (
            <div className="bg-white border border-[#EBE8E3] rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE8E3] pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0F4A3E]">
                    <TrendingUp className="w-6 h-6 text-[#0F4A3E]" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                      ATS & JD Alignment Score
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm line-through text-stone-400 font-mono">
                        {tailorResult.originalMatchScore}%
                      </span>
                      <ArrowRight className="w-3 h-3 text-stone-400" />
                      <span className="text-2xl font-black text-stone-900 font-mono">
                        {tailorResult.tailoredMatchScore}%
                      </span>
                      <span className="text-xs font-bold text-[#0F4A3E] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                        +{tailorResult.scoreImprovement}% Gain
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-stone-500 block">
                    Optimized for {tailorResult.tailoredResume.targetCompany}
                  </span>
                  <span className="text-[10px] text-[#0F4A3E] font-mono font-semibold">
                    Pass {tailorResult.passNumber} of 3
                  </span>
                </div>
              </div>

              {/* Category Breakdown Progress Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {tailorResult.categories.map((cat, idx) => (
                  <div key={idx} className="bg-[#FAF9F7] p-2.5 rounded-xl border border-[#EBE8E3] space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-700 font-semibold">{cat.category}</span>
                      <span className="font-mono text-[#0F4A3E] font-bold">{cat.score}%</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#0F4A3E] h-full rounded-full"
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Audit Explanation */}
              <p className="text-[11px] text-stone-600 bg-[#FAF9F7] p-2.5 rounded-xl border border-[#EBE8E3] leading-relaxed">
                <span className="font-semibold text-stone-900">Evidence Audit: </span>
                {tailorResult.auditExplanation}
              </p>
            </div>
          )}

          {/* TAB 1: TAILORED RESUME DOCUMENT */}
          {activeTab === 'tailored' && (
            <div className="space-y-4">
              {/* ATS Formatting Toolbar & Heatmap Controller */}
              <div className="bg-white border border-[#EBE8E3] rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 no-print shadow-xs">
                {/* Template Selection */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider flex items-center gap-1 mr-1">
                    <LayoutTemplate className="w-3.5 h-3.5 text-[#0F4A3E]" />
                    <span>Format:</span>
                  </span>
                  <button
                    onClick={() => setSelectedTemplate('modern')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedTemplate === 'modern'
                        ? 'bg-[#0F4A3E] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    Modern Tech
                  </button>
                  <button
                    onClick={() => setSelectedTemplate('ivy')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-serif transition-all cursor-pointer ${
                      selectedTemplate === 'ivy'
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    Ivy League Classic
                  </button>
                  <button
                    onClick={() => setSelectedTemplate('metrics')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedTemplate === 'metrics'
                        ? 'bg-[#0F4A3E] text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    Metrics-First (High Scan)
                  </button>
                </div>

                {/* Heatmap Toggle & Live Status */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAtsHeatmap(!showAtsHeatmap)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      showAtsHeatmap
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                    title="Toggle visual ATS impact heatmap to evaluate active verbs and quantifiable metrics"
                  >
                    <Flame className={`w-3.5 h-3.5 ${showAtsHeatmap ? 'text-amber-600 animate-pulse' : 'text-stone-400'}`} />
                    <span>ATS Heatmap: {showAtsHeatmap ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Heatmap Legend */}
              {showAtsHeatmap && (
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-3 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-3 no-print animate-in fade-in">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      Visual ATS Heatmap Active:
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> Strong XYZ Impact
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-amber-300 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-amber-400" /> Moderate Impact
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-rose-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-rose-400" /> Needs Polish
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    Click <Wand2 className="w-3 h-3 text-indigo-400 inline mx-0.5" /> on any bullet to rewrite with Google XYZ formula.
                  </span>
                </div>
              )}

              {/* Resume Sheet */}
              <div
                id="printable-resume-sheet"
                className={`transition-all duration-200 ${
                  selectedTemplate === 'ivy'
                    ? 'bg-[#FCFBF8] text-stone-900 rounded-none sm:rounded-2xl p-8 sm:p-12 shadow-xl space-y-5 font-serif text-xs sm:text-sm selection:bg-stone-200 border border-stone-300'
                    : selectedTemplate === 'metrics'
                    ? 'bg-[#FAFCFB] text-slate-900 rounded-2xl p-8 sm:p-10 shadow-2xl space-y-6 font-sans text-xs sm:text-sm selection:bg-emerald-100 border border-emerald-300/60'
                    : 'bg-white text-slate-900 rounded-2xl p-8 sm:p-10 shadow-2xl space-y-6 font-sans text-xs sm:text-sm selection:bg-indigo-100 selection:text-indigo-900 border border-slate-200'
                }`}
              >
                {tailorResult ? (
                  <>
                    {/* Header */}
                    <div
                      className={`space-y-1 ${
                        selectedTemplate === 'ivy'
                          ? 'text-center border-b-2 border-stone-800 pb-3'
                          : 'text-center border-b border-slate-300 pb-4'
                      }`}
                    >
                      {selectedTemplate === 'metrics' && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold uppercase tracking-wider mb-1 no-print">
                          <span>High-Scan Technical Engineering Resume</span>
                        </div>
                      )}

                      <h2
                        className={`tracking-tight ${
                          selectedTemplate === 'ivy'
                            ? 'text-2xl font-bold uppercase tracking-widest text-stone-950 font-serif'
                            : selectedTemplate === 'metrics'
                            ? 'text-2xl font-black text-slate-950 tracking-tight'
                            : 'text-2xl font-black text-slate-900'
                        }`}
                      >
                        {tailorResult.tailoredResume.personalInfo.fullName}
                      </h2>
                      <p
                        className={`text-xs font-semibold tracking-wide uppercase ${
                          selectedTemplate === 'ivy'
                            ? 'text-stone-700 font-serif normal-case'
                            : selectedTemplate === 'metrics'
                            ? 'text-emerald-800 font-bold'
                            : 'text-indigo-700'
                        }`}
                      >
                        {tailorResult.tailoredResume.targetJobTitle} • {tailorResult.tailoredResume.targetCompany}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {tailorResult.tailoredResume.personalInfo.email} • {tailorResult.tailoredResume.personalInfo.phone} • {tailorResult.tailoredResume.personalInfo.location}
                      </p>
                    </div>

                    {/* Professional Summary */}
                    <div className="space-y-1.5">
                      <h3
                        className={`uppercase tracking-wider pb-0.5 ${
                          selectedTemplate === 'ivy'
                            ? 'text-xs font-bold font-serif tracking-widest text-stone-900 border-b border-stone-400'
                            : selectedTemplate === 'metrics'
                            ? 'text-xs font-black tracking-wider text-emerald-950 border-b-2 border-emerald-500/40'
                            : 'text-xs font-bold text-slate-900 border-b border-slate-300'
                        }`}
                      >
                        Professional Summary
                      </h3>
                      <p className={`leading-relaxed ${selectedTemplate === 'ivy' ? 'font-serif text-stone-800 text-xs' : 'text-xs text-slate-700'}`}>
                        {tailorResult.tailoredResume.summary}
                      </p>
                    </div>

                    {/* Skills Categorized */}
                    <div className="space-y-1.5">
                      <h3
                        className={`uppercase tracking-wider pb-0.5 ${
                          selectedTemplate === 'ivy'
                            ? 'text-xs font-bold font-serif tracking-widest text-stone-900 border-b border-stone-400'
                            : selectedTemplate === 'metrics'
                            ? 'text-xs font-black tracking-wider text-emerald-950 border-b-2 border-emerald-500/40'
                            : 'text-xs font-bold text-slate-900 border-b border-slate-300'
                        }`}
                      >
                        Technical Skills & Core Competencies
                      </h3>
                      <div className="space-y-1 text-xs text-slate-800">
                        {tailorResult.tailoredResume.skillsCategorized.map((cat, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row">
                            <span className={`font-bold sm:w-44 shrink-0 ${selectedTemplate === 'ivy' ? 'font-serif text-stone-900' : 'text-slate-900'}`}>
                              {cat.category}:
                            </span>
                            <span className={selectedTemplate === 'ivy' ? 'font-serif text-stone-800' : 'text-slate-700'}>
                              {cat.skills.join(', ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Professional Experience */}
                    <div className="space-y-4">
                      <h3
                        className={`uppercase tracking-wider pb-0.5 ${
                          selectedTemplate === 'ivy'
                            ? 'text-xs font-bold font-serif tracking-widest text-stone-900 border-b border-stone-400'
                            : selectedTemplate === 'metrics'
                            ? 'text-xs font-black tracking-wider text-emerald-950 border-b-2 border-emerald-500/40'
                            : 'text-xs font-bold text-slate-900 border-b border-slate-300'
                        }`}
                      >
                        Professional Experience
                      </h3>

                      {tailorResult.tailoredResume.experience.map((exp, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                            <span className={`font-bold ${selectedTemplate === 'ivy' ? 'font-serif text-stone-950' : 'text-slate-900'}`}>
                              {exp.role} — <span className="font-semibold text-slate-800">{exp.company}</span>
                            </span>
                            <span className={`text-[11px] ${selectedTemplate === 'ivy' ? 'font-serif italic text-stone-600' : 'text-slate-500 font-mono'}`}>
                              {exp.period} | {exp.location}
                            </span>
                          </div>

                          <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed pl-1">
                            {exp.bullets.map((bullet, bIdx) => {
                              const hm = getBulletHeatmapLevel(bullet);
                              return (
                                <li key={bIdx} className="group relative flex items-start gap-2">
                                  <span className="text-slate-400 mt-0.5 select-none shrink-0">•</span>
                                  <div className="flex-1 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                    <span className={`${selectedTemplate === 'ivy' ? 'font-serif text-stone-800' : 'text-slate-700'}`}>
                                      {renderBulletWithMetrics(bullet)}
                                    </span>

                                    {/* Action Bar / Heatmap Tag */}
                                    <div className="flex items-center gap-1.5 shrink-0 self-start no-print">
                                      {showAtsHeatmap && (
                                        <span
                                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                                            hm.level === 'high'
                                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                              : hm.level === 'medium'
                                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                                              : 'bg-rose-100 text-rose-800 border-rose-300'
                                          }`}
                                          title={hm.tooltip}
                                        >
                                          {hm.tag}
                                        </span>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => handleStartPolishBullet(idx, bIdx, bullet, exp.role, exp.company)}
                                        className={`transition-all p-1 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                                          showAtsHeatmap
                                            ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 opacity-100'
                                            : 'opacity-0 group-hover:opacity-100 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200'
                                        }`}
                                        title="Polish bullet using Google XYZ formula with Gemini"
                                      >
                                        <Wand2 className="w-3 h-3 text-indigo-600" />
                                        <span className="hidden md:inline">Polish</span>
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Education */}
                    <div className="space-y-2">
                      <h3
                        className={`uppercase tracking-wider pb-0.5 ${
                          selectedTemplate === 'ivy'
                            ? 'text-xs font-bold font-serif tracking-widest text-stone-900 border-b border-stone-400'
                            : selectedTemplate === 'metrics'
                            ? 'text-xs font-black tracking-wider text-emerald-950 border-b-2 border-emerald-500/40'
                            : 'text-xs font-bold text-slate-900 border-b border-slate-300'
                        }`}
                      >
                        Education
                      </h3>
                      {tailorResult.tailoredResume.education.map((edu, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-800">
                          <div>
                            <span className="font-bold text-slate-900">{edu.degree}</span> — {edu.school}
                          </div>
                          <span className={`text-[11px] ${selectedTemplate === 'ivy' ? 'font-serif italic text-stone-600' : 'text-slate-500 font-mono'}`}>
                            {edu.year}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  /* Master Draft Interactive Live Preview */
                  <div className="space-y-6">
                    {/* Live Preview Notice */}
                    <div className="bg-indigo-50 border border-indigo-200/80 rounded-2xl p-4 text-xs text-indigo-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10px] uppercase font-mono">
                            Master Draft Preview
                          </span>
                          <span className="font-bold text-slate-900">{currentActiveDraft.draftName}</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Targeting: <strong>{currentActiveDraft.roleTarget}</strong> at <strong>{currentActiveDraft.targetCompany}</strong>. You can polish bullets below or click &quot;Auto-Tailor My Resume&quot; on the left.
                        </p>
                      </div>

                      <button
                        onClick={() => runAutoTailorPipeline(false)}
                        disabled={isTailoring || !jobDescription.trim()}
                        className="px-4 py-2 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Auto-Tailor for this JD</span>
                      </button>
                    </div>

                    {/* Candidate Name & Header */}
                    <div
                      className={`space-y-1 ${
                        selectedTemplate === 'ivy'
                          ? 'text-center border-b-2 border-stone-800 pb-3'
                          : 'text-center border-b border-slate-300 pb-4'
                      }`}
                    >
                      <h2
                        className={`tracking-tight ${
                          selectedTemplate === 'ivy'
                            ? 'text-2xl font-bold uppercase tracking-widest text-stone-950 font-serif'
                            : selectedTemplate === 'metrics'
                            ? 'text-2xl font-black text-slate-950 tracking-tight'
                            : 'text-2xl font-black text-slate-900'
                        }`}
                      >
                        {userProfile.fullName || 'KETAN KAUSHIKBHAI BHOI'}
                      </h2>
                      <p
                        className={`text-xs font-semibold tracking-wide uppercase ${
                          selectedTemplate === 'ivy'
                            ? 'text-stone-700 font-serif normal-case'
                            : selectedTemplate === 'metrics'
                            ? 'text-emerald-800 font-bold'
                            : 'text-indigo-700'
                        }`}
                      >
                        {currentActiveDraft.roleTarget} • {currentActiveDraft.targetCompany}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {userProfile.email || 'kkbhoi09@gmail.com'} • +91 90541 46405 • {userProfile.targetLocations?.[0] || 'Vasad, Anand, Gujarat'}
                      </p>
                    </div>

                    {/* Summary */}
                    <div className="space-y-1.5">
                      <h3
                        className={`uppercase tracking-wider pb-0.5 ${
                          selectedTemplate === 'ivy'
                            ? 'text-xs font-bold font-serif tracking-widest text-stone-900 border-b border-stone-400'
                            : selectedTemplate === 'metrics'
                            ? 'text-xs font-black tracking-wider text-emerald-950 border-b-2 border-emerald-500/40'
                            : 'text-xs font-bold text-slate-900 border-b border-slate-300'
                        }`}
                      >
                        Professional Summary
                      </h3>
                      <p className={`leading-relaxed ${selectedTemplate === 'ivy' ? 'font-serif text-stone-800 text-xs' : 'text-xs text-slate-700'}`}>
                        {userProfile.headline || 'Enthusiastic and detail-oriented B.Tech Information Technology student with strong expertise in full-stack software development, RESTful APIs, and AI/LLM evaluation benchmarks.'}
                      </p>
                    </div>

                    {/* Experience Bullets */}
                    <div className="space-y-4">
                      <h3
                        className={`uppercase tracking-wider pb-0.5 ${
                          selectedTemplate === 'ivy'
                            ? 'text-xs font-bold font-serif tracking-widest text-stone-900 border-b border-stone-400'
                            : selectedTemplate === 'metrics'
                            ? 'text-xs font-black tracking-wider text-emerald-950 border-b-2 border-emerald-500/40'
                            : 'text-xs font-bold text-slate-900 border-b border-slate-300'
                        }`}
                      >
                        Experience Achievements & Bullets
                      </h3>

                      <ul className="space-y-2 text-xs text-slate-700 leading-relaxed pl-1">
                        {draftExperienceBullets.map((bullet, bIdx) => {
                          const hm = getBulletHeatmapLevel(bullet);
                          return (
                            <li key={bIdx} className="group relative flex items-start gap-2">
                              <span className="text-slate-400 mt-0.5 select-none shrink-0">•</span>
                              <div className="flex-1 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                <span className={`${selectedTemplate === 'ivy' ? 'font-serif text-stone-800' : 'text-slate-700'}`}>
                                  {renderBulletWithMetrics(bullet)}
                                </span>

                                <div className="flex items-center gap-1.5 shrink-0 self-start no-print">
                                  {showAtsHeatmap && (
                                    <span
                                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                                        hm.level === 'high'
                                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                          : hm.level === 'medium'
                                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                                          : 'bg-rose-100 text-rose-800 border-rose-300'
                                      }`}
                                      title={hm.tooltip}
                                    >
                                      {hm.tag}
                                    </span>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleStartPolishBullet(0, bIdx, bullet, currentActiveDraft.roleTarget, currentActiveDraft.targetCompany)}
                                    className={`transition-all p-1 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                                      showAtsHeatmap
                                        ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 opacity-100'
                                        : 'opacity-0 group-hover:opacity-100 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200'
                                    }`}
                                    title="Polish bullet using Google XYZ formula with Gemini"
                                  >
                                    <Wand2 className="w-3 h-3 text-indigo-600" />
                                    <span className="hidden md:inline">Polish</span>
                                  </button>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Education */}
                    <div className="space-y-2">
                      <h3
                        className={`uppercase tracking-wider pb-0.5 ${
                          selectedTemplate === 'ivy'
                            ? 'text-xs font-bold font-serif tracking-widest text-stone-900 border-b border-stone-400'
                            : selectedTemplate === 'metrics'
                            ? 'text-xs font-black tracking-wider text-emerald-950 border-b-2 border-emerald-500/40'
                            : 'text-xs font-bold text-slate-900 border-b border-slate-300'
                        }`}
                      >
                        Education
                      </h3>
                      <div className="flex justify-between text-xs text-slate-800">
                        <div>
                          <span className="font-bold text-slate-900">Bachelor of Technology (IT)</span> — MBIT, CVM University
                        </div>
                        <span className={`text-[11px] ${selectedTemplate === 'ivy' ? 'font-serif italic text-stone-600' : 'text-slate-500 font-mono'}`}>
                          06/2026 | CGPA: 7.58
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BEFORE VS AFTER COMPARISON */}
          {activeTab === 'comparison' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-stone-800">
                <span className="font-semibold text-stone-900">Interactive Change Inspection: </span>
                Click any modified or added bullet below to view the exact reason why the AI reworded it.
              </div>

              {tailorResult?.bulletModifications.map((mod) => (
                <div
                  key={mod.id}
                  onClick={() => setSelectedMod(mod)}
                  className="bg-white border border-[#EBE8E3] hover:border-emerald-600/40 rounded-2xl p-4 space-y-3 transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                          mod.type === 'MODIFIED'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : mod.type === 'ADDED'
                            ? 'bg-emerald-50 text-[#0F4A3E] border border-emerald-200'
                            : 'bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {mod.type}
                      </span>
                      <span className="text-xs text-stone-500 uppercase font-semibold">
                        Section: {mod.section}
                      </span>
                    </div>

                    <span className="text-[11px] text-[#0F4A3E] hover:text-[#0B382F] font-semibold flex items-center gap-1">
                      <span>Why did AI change this?</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Left: Original */}
                    <div className="p-3 bg-[#FAF9F7] rounded-xl border border-[#EBE8E3] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">
                        Original Resume Text:
                      </span>
                      <p className="text-stone-600 leading-relaxed">{mod.original}</p>
                    </div>

                    {/* Right: Tailored */}
                    <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-[#0F4A3E] block font-serif">
                          AI-Tailored Text:
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartPolishBullet(0, 0, mod.tailored, jobTitle, company);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-[#0F4A3E] border border-emerald-300 text-[10px] font-semibold transition-all cursor-pointer"
                          title="Polish this bullet with Google XYZ formula"
                        >
                          <Wand2 className="w-3 h-3 text-[#0F4A3E]" />
                          <span>Polish with XYZ</span>
                        </button>
                      </div>
                      <p className="text-stone-900 leading-relaxed font-medium">{mod.tailored}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: ATS COMPATIBILITY SCORING & ACTIONABLE SUGGESTIONS */}
          {activeTab === 'ats-score' && (
            <div className="space-y-4">
              {/* Toast message if present */}
              {atsToastMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-[#0F4A3E] flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0F4A3E] shrink-0" />
                    <span>{atsToastMessage}</span>
                  </div>
                  <button
                    onClick={() => setAtsToastMessage(null)}
                    className="text-[#0F4A3E] hover:text-stone-900 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* ATS Top Engine Bar */}
              <div className="bg-white border border-[#EBE8E3] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[#0F4A3E]">
                      <Target className="w-5 h-5 text-[#0F4A3E]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        <span>ATS Compatibility Engine</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-[#0F4A3E] font-mono border border-emerald-200">
                          Gemini 3.8 Flash
                        </span>
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Target: <span className="text-stone-800 font-medium">{jobTitle || 'Target Role'}</span> at{' '}
                        <span className="text-stone-800 font-medium">{company || 'Target Employer'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Audit Target Toggle & Run Button */}
                <div className="flex flex-wrap items-center gap-2">
                  {tailorResult && (
                    <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setAtsAuditTarget('draft');
                          handleRunAtsCompatibilityAnalysis('draft');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          atsAuditTarget === 'draft'
                            ? 'bg-[#0F4A3E] text-white'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Master Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAtsAuditTarget('tailored');
                          handleRunAtsCompatibilityAnalysis('tailored');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          atsAuditTarget === 'tailored'
                            ? 'bg-[#0F4A3E] text-white'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Tailored Resume
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRunAtsCompatibilityAnalysis()}
                    disabled={isAnalyzingAts || !resumeTextInput.trim() || !jobDescription.trim()}
                    className="px-4 py-2 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingAts ? 'animate-spin' : ''}`} />
                    <span>{atsReport ? 'Re-Audit ATS Score' : 'Run ATS Audit'}</span>
                  </button>
                </div>
              </div>

              {/* Analyzing State */}
              {isAnalyzingAts && (
                <div className="bg-white border border-[#EBE8E3] rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-xs animate-in fade-in">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-[#0F4A3E] animate-spin flex items-center justify-center" />
                    <Target className="w-7 h-7 text-[#0F4A3E] absolute inset-0 m-auto" />
                  </div>
                  <div className="space-y-1.5 max-w-md">
                    <h4 className="text-sm font-bold text-stone-900 font-serif">Analyzing ATS Compatibility with Gemini...</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Auditing keywords, formatting parseability, Google XYZ quantifiable metrics, and hard skills alignment against the target job description.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[10px] text-stone-600 font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-stone-700">
                      • Greenhouse & Workday Filters
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-stone-700">
                      • Keyword Frequency Audit
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-stone-700">
                      • Metric Density Scoring
                    </span>
                  </div>
                </div>
              )}

              {/* Error State */}
              {atsAnalysisError && !isAnalyzingAts && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{atsAnalysisError}</span>
                  </div>
                  <button
                    onClick={() => handleRunAtsCompatibilityAnalysis()}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Empty Launcher State (When no report yet and not analyzing) */}
              {!atsReport && !isAnalyzingAts && !atsAnalysisError && (
                <div className="bg-white border border-[#EBE8E3] rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-xs">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0F4A3E] flex items-center justify-center mx-auto">
                    <Target className="w-8 h-8 text-[#0F4A3E]" />
                  </div>
                  <div className="space-y-2 max-w-lg mx-auto">
                    <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                      Instant ATS Compatibility Audit & Scoring
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Evaluate how your resume scores against modern Applicant Tracking Systems (Workday, Taleo, Greenhouse, Lever). Get exact compatibility percentages, missing high-priority keywords, and step-by-step improvements.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left text-xs">
                    <div className="bg-[#FAF9F7] p-3.5 rounded-2xl border border-[#EBE8E3] space-y-1">
                      <div className="flex items-center gap-1.5 text-stone-900 font-bold">
                        <Search className="w-3.5 h-3.5 text-[#0F4A3E]" />
                        <span>Keyword Gaps</span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Pinpoints essential hard & soft skills missing from your resume text.
                      </p>
                    </div>

                    <div className="bg-[#FAF9F7] p-3.5 rounded-2xl border border-[#EBE8E3] space-y-1">
                      <div className="flex items-center gap-1.5 text-stone-900 font-bold">
                        <TrendingUp className="w-3.5 h-3.5 text-[#0F4A3E]" />
                        <span>Quantifiable Impact</span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Detects Google XYZ formula coverage and quantifiable metrics.
                      </p>
                    </div>

                    <div className="bg-[#FAF9F7] p-3.5 rounded-2xl border border-[#EBE8E3] space-y-1">
                      <div className="flex items-center gap-1.5 text-stone-900 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#0F4A3E]" />
                        <span>Parser Friendliness</span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Flags section header traps and unindexed contact information.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleRunAtsCompatibilityAnalysis()}
                      disabled={!resumeTextInput.trim() || !jobDescription.trim()}
                      className="px-6 py-3 rounded-2xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      <span>Run Full ATS Compatibility Audit with Gemini</span>
                    </button>
                  </div>
                </div>
              )}

              {/* FULL ATS COMPATIBILITY REPORT */}
              {atsReport && !isAnalyzingAts && (
                <div className="space-y-5 animate-in fade-in">
                  
                  {/* Hero Scorecard */}
                  <div className="bg-white border border-[#EBE8E3] rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                      {/* Left: Overall Score Circle & Rating */}
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center p-2 border shadow-xs ${
                            atsReport.overallScore >= 85
                              ? 'bg-emerald-50 border-emerald-200 text-[#0F4A3E]'
                              : atsReport.overallScore >= 70
                              ? 'bg-amber-50 border-amber-200 text-amber-800'
                              : 'bg-rose-50 border-rose-200 text-rose-700'
                          }`}
                        >
                          <span className="text-3xl font-black font-mono leading-none">
                            {atsReport.overallScore}%
                          </span>
                          <span className="text-[9px] uppercase tracking-wider font-bold mt-1 text-stone-500">
                            ATS Score
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                                atsReport.overallScore >= 85
                                  ? 'bg-emerald-50 text-[#0F4A3E] border border-emerald-200'
                                  : atsReport.overallScore >= 70
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {atsReport.rating} Match
                            </span>
                            <span className="text-[11px] text-stone-500 font-medium">
                              • {atsReport.passProbability}
                            </span>
                          </div>
                          <p className="text-xs text-stone-700 max-w-xl leading-relaxed">
                            {atsReport.summary}
                          </p>
                        </div>
                      </div>

                      {/* Right: Quick Action */}
                      <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                        <div className="text-right hidden md:block">
                          <span className="text-[10px] text-stone-400 font-mono block">
                            Audited against {company || 'Target Co.'}
                          </span>
                          <span className="text-[10px] text-[#0F4A3E] font-mono block font-semibold">
                            Model: {atsReport.source || 'gemini-3.8-flash'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 6-Second Recruiter First Impression Card */}
                    {atsReport.recruiterScanVerdict && (
                      <div className="p-3.5 rounded-2xl bg-[#FAF9F7] border border-[#EBE8E3] text-xs flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 shrink-0 mt-0.5">
                          <Eye className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="space-y-0.5 flex-1">
                          <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                            6-Second Recruiter Scan Simulation:
                          </span>
                          <p className="text-stone-700 leading-relaxed text-[11px]">
                            {atsReport.recruiterScanVerdict}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5 Sub-Scores Breakdown */}
                  <div className="bg-white border border-[#EBE8E3] rounded-3xl p-5 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5 font-serif">
                        <Sliders className="w-3.5 h-3.5 text-[#0F4A3E]" />
                        <span>ATS Algorithmic Sub-Score Breakdown</span>
                      </h4>
                      <span className="text-[10px] text-stone-400 font-mono">5 Core Dimensions</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {/* Sub-Score 1: Keywords */}
                      <div className="bg-[#FAF9F7] p-3 rounded-2xl border border-[#EBE8E3] space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-600 font-medium text-[11px]">Keywords Match</span>
                          <span className="font-mono font-bold text-[#0F4A3E]">
                            {atsReport.subScores.keywordMatch}%
                          </span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#0F4A3E] h-full rounded-full transition-all"
                            style={{ width: `${atsReport.subScores.keywordMatch}%` }}
                          />
                        </div>
                      </div>

                      {/* Sub-Score 2: Format */}
                      <div className="bg-[#FAF9F7] p-3 rounded-2xl border border-[#EBE8E3] space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-600 font-medium text-[11px]">Format & Headers</span>
                          <span className="font-mono font-bold text-[#0F4A3E]">
                            {atsReport.subScores.formatAndParseability}%
                          </span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#0F4A3E] h-full rounded-full transition-all"
                            style={{ width: `${atsReport.subScores.formatAndParseability}%` }}
                          />
                        </div>
                      </div>

                      {/* Sub-Score 3: Impact */}
                      <div className="bg-[#FAF9F7] p-3 rounded-2xl border border-[#EBE8E3] space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-600 font-medium text-[11px]">XYZ Metric Density</span>
                          <span className="font-mono font-bold text-[#0F4A3E]">
                            {atsReport.subScores.quantifiableImpact}%
                          </span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#0F4A3E] h-full rounded-full transition-all"
                            style={{ width: `${atsReport.subScores.quantifiableImpact}%` }}
                          />
                        </div>
                      </div>

                      {/* Sub-Score 4: Hard Skills */}
                      <div className="bg-[#FAF9F7] p-3 rounded-2xl border border-[#EBE8E3] space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-600 font-medium text-[11px]">Hard Skills Fit</span>
                          <span className="font-mono font-bold text-[#0F4A3E]">
                            {atsReport.subScores.hardSkillsMatch}%
                          </span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#0F4A3E] h-full rounded-full transition-all"
                            style={{ width: `${atsReport.subScores.hardSkillsMatch}%` }}
                          />
                        </div>
                      </div>

                      {/* Sub-Score 5: Soft Skills */}
                      <div className="bg-[#FAF9F7] p-3 rounded-2xl border border-[#EBE8E3] space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-600 font-medium text-[11px]">Velocity & Ownership</span>
                          <span className="font-mono font-bold text-[#0F4A3E]">
                            {atsReport.subScores.softSkillsMatch}%
                          </span>
                        </div>
                        <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#0F4A3E] h-full rounded-full transition-all"
                            style={{ width: `${atsReport.subScores.softSkillsMatch}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Keywords Comparison: Missing vs Matched */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Top Missing Keywords (Actionable) */}
                    <div className="bg-white border border-[#EBE8E3] rounded-3xl p-5 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-serif">
                            Critical Missing Keywords ({atsReport.topMissingKeywords.length})
                          </h4>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono">Click to Add</span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        These high-weight terms from the job posting are missing from your resume. Click any keyword to inject it into your resume skills section:
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {atsReport.topMissingKeywords.map((kw, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleInsertKeyword(kw)}
                            className="group px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            title={`Click to add "${kw}" to resume`}
                          >
                            <Plus className="w-3 h-3 text-rose-600 group-hover:rotate-90 transition-transform" />
                            <span>{kw}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Successfully Matched Keywords */}
                    <div className="bg-white border border-[#EBE8E3] rounded-3xl p-5 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#0F4A3E]" />
                          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-serif">
                            Matched JD Keywords ({atsReport.matchedKeywords.length})
                          </h4>
                        </div>
                        <span className="text-[10px] text-[#0F4A3E] font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Indexed</span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        These key technical terms are clearly articulated in your resume and recognized by ATS parsing dictionaries:
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {atsReport.matchedKeywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 text-[#0F4A3E] border border-emerald-200 text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Check className="w-3 h-3 text-[#0F4A3E]" />
                            <span>{kw}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Prioritized Actionable Improvement Suggestions */}
                  <div className="bg-white border border-[#EBE8E3] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <h4 className="text-sm font-bold text-stone-900 font-serif">
                            Actionable Improvement Suggestions ({atsReport.actionableSuggestions.length})
                          </h4>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          Tailored fixes prioritized by their algorithmic impact on ATS clearance.
                        </p>
                      </div>

                      {/* Filters */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-stone-500 font-semibold">Priority:</span>
                        <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs">
                          {(['all', 'high', 'medium', 'low'] as const).map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setAtsFilterPriority(p)}
                              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                                atsFilterPriority === p
                                  ? 'bg-[#0F4A3E] text-white'
                                  : 'text-stone-600 hover:text-stone-900'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Suggestions List */}
                    <div className="space-y-3">
                      {atsReport.actionableSuggestions
                        .filter((sug) => atsFilterPriority === 'all' || sug.priority === atsFilterPriority)
                        .map((sug) => {
                          const isApplied = atsAppliedSuggestionIds.includes(sug.id);
                          return (
                            <div
                              key={sug.id}
                              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                                isApplied
                                  ? 'bg-emerald-50/60 border-emerald-200'
                                  : sug.priority === 'high'
                                  ? 'bg-[#FAF9F7] border-rose-200 hover:border-rose-300'
                                  : sug.priority === 'medium'
                                  ? 'bg-[#FAF9F7] border-amber-200 hover:border-amber-300'
                                  : 'bg-[#FAF9F7] border-stone-200 hover:border-stone-300'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                                        sug.priority === 'high'
                                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                                          : sug.priority === 'medium'
                                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                                          : 'bg-stone-100 text-stone-700 border-stone-200'
                                      }`}
                                    >
                                      {sug.priority === 'high' ? 'Critical Priority' : `${sug.priority} Priority`}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-stone-600 border border-stone-200 font-mono">
                                      {sug.category}
                                    </span>
                                    {isApplied && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-[#0F4A3E] border border-emerald-300 font-semibold flex items-center gap-1">
                                        <Check className="w-3 h-3 text-[#0F4A3E]" />
                                        <span>Applied</span>
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="text-xs font-bold text-stone-900">{sug.title}</h5>
                                  <p className="text-[11px] text-stone-600 leading-relaxed">
                                    {sug.explanation}
                                  </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyAtsSuggestion(sug.suggestedAction)}
                                    className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold border border-stone-200 flex items-center gap-1 transition-all cursor-pointer"
                                    title="Copy suggested action"
                                  >
                                    <Copy className="w-3 h-3 text-stone-500" />
                                    <span>Copy</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleApplyAtsSuggestion(sug)}
                                    className="px-3 py-1 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                    title="Add directly to active resume input"
                                  >
                                    <Sparkles className="w-3 h-3 text-emerald-300" />
                                    <span>{isApplied ? 'Applied' : 'Apply to Resume'}</span>
                                  </button>
                                </div>
                              </div>

                              {/* Concrete Example Snippet */}
                              {sug.suggestedAction && (
                                <div className="p-3 bg-white rounded-xl border border-stone-200 text-[11px] font-mono text-stone-900 leading-relaxed">
                                  {sug.suggestedAction}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Red Flags & Passed Checks Split Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Passed Checks */}
                    <div className="bg-white border border-[#EBE8E3] rounded-3xl p-5 space-y-3 shadow-xs">
                      <div className="flex items-center gap-2">
                        <CheckCheck className="w-4 h-4 text-[#0F4A3E]" />
                        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-serif">
                          Passed ATS Parser Checks ({atsReport.passedChecks.length})
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {atsReport.passedChecks.map((checkText, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-[#FAF9F7] border border-[#EBE8E3] text-[11px] text-stone-700 flex items-start gap-2"
                          >
                            <Check className="w-3.5 h-3.5 text-[#0F4A3E] shrink-0 mt-0.5" />
                            <span>{checkText}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detected Red Flags */}
                    <div className="bg-white border border-[#EBE8E3] rounded-3xl p-5 space-y-3 shadow-xs">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-serif">
                          ATS Parser Red Flags & Traps ({atsReport.atsRedFlags.length})
                        </h4>
                      </div>
                      {atsReport.atsRedFlags.length === 0 ? (
                        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300">
                          Zero structural red flags detected. Your document layout is optimal for all mainstream ATS engines.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {atsReport.atsRedFlags.map((rf, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-amber-900 text-[11px]">{rf.title}</span>
                                <span className="text-[9px] uppercase font-mono px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                  {rf.severity} risk
                                </span>
                              </div>
                              <p className="text-[11px] text-amber-800 leading-relaxed">{rf.advice}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: KEYWORDS MATRIX */}
          {activeTab === 'keywords' && tailorResult && (
            <div className="bg-white border border-[#EBE8E3] rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-[#EBE8E3]">
                <h3 className="text-xs font-bold uppercase text-stone-800 tracking-wider font-serif">
                  JD vs Resume Keyword Alignment Matrix
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 text-stone-600 uppercase text-[10px] font-mono border-b border-stone-200">
                    <tr>
                      <th className="p-3">Keyword</th>
                      <th className="p-3">JD Freq</th>
                      <th className="p-3">Resume Status</th>
                      <th className="p-3">Evidence Source</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-700">
                    {tailorResult.keywordsMatrix.map((kw, idx) => (
                      <tr key={idx} className="hover:bg-stone-50 transition-colors">
                        <td className="p-3 font-semibold text-stone-900 flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              kw.priority === 'CRITICAL'
                                ? 'bg-rose-500'
                                : kw.priority === 'HIGH'
                                ? 'bg-amber-500'
                                : 'bg-[#0F4A3E]'
                            }`}
                          />
                          {kw.keyword}
                        </td>
                        <td className="p-3 font-mono">{kw.jdFrequency}x</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              kw.resumePresence === 'Present'
                                ? 'bg-emerald-50 text-[#0F4A3E] border border-emerald-200'
                                : kw.resumePresence === 'Partial'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {kw.resumePresence}
                          </span>
                        </td>
                        <td className="p-3 text-stone-500">{kw.evidenceSource}</td>
                        <td className="p-3">
                          <span className="font-mono text-[#0F4A3E] text-[11px] font-semibold">{kw.action}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: GAPS & ADD EVIDENCE WORKFLOW */}
          {activeTab === 'gaps' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <span className="font-bold text-amber-950">&quot;Get to 90%+&quot; Ethical Guidance: </span>
                If your match score is below 90%, ApplyFlow refuses to fake qualifications. You can legitimately add genuine experience using the verified evidence workflow below.
              </div>

              {tailorResult?.remainingGaps.map((gap) => (
                <div
                  key={gap.id}
                  className="bg-white border border-[#EBE8E3] rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold font-mono">
                          Remaining Gap
                        </span>
                        <span className="text-xs text-stone-500">{gap.category}</span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900">{gap.requirement}</h4>
                    </div>

                    <button
                      onClick={() => setEvidenceModalGap(gap)}
                      className="px-3 py-1.5 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Evidence</span>
                    </button>
                  </div>

                  <p className="text-xs text-stone-600 bg-[#FAF9F7] p-3 rounded-xl border border-[#EBE8E3]">
                    <span className="font-semibold text-stone-900">Why this was omitted: </span>
                    {gap.reason}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: VERSION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {versions.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs">
                  No previous tailored versions saved yet.
                </div>
              ) : (
                versions.map((ver) => (
                  <div
                    key={ver.id}
                    className="bg-white border border-[#EBE8E3] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-900">{ver.versionName}</span>
                        <span className="text-[11px] font-mono text-[#0F4A3E] font-semibold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                          {ver.finalScore}% ATS Match
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {ver.company} • {ver.jobTitle} • {ver.date} ({ver.modificationsCount} changes)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setTailorResult({
                            ...tailorResult!,
                            tailoredResume: ver.tailoredResume,
                            tailoredMatchScore: ver.finalScore
                          });
                          setActiveTab('tailored');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium border border-stone-200 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Restore View</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 6: TAILORED BULLETS HISTORY */}
          {activeTab === 'bullets-history' && (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#EBE8E3] p-3.5 rounded-2xl shadow-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-stone-600 font-semibold mr-1 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-[#0F4A3E]" />
                    <span>Role:</span>
                  </span>
                  <button
                    onClick={() => setBulletRoleFilter('all')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      bulletRoleFilter === 'all'
                        ? 'bg-[#0F4A3E] text-white font-bold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    All Roles ({allHistoricalBullets.length})
                  </button>
                  {Array.from(new Set(allHistoricalBullets.map((b) => b.roleContext))).map((role) => (
                    <button
                      key={role}
                      onClick={() => setBulletRoleFilter(role)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                        bulletRoleFilter === role
                          ? 'bg-[#0F4A3E] text-white font-bold'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[200px]">
                  <input
                    type="text"
                    value={bulletSearchQuery}
                    onChange={(e) => setBulletSearchQuery(e.target.value)}
                    placeholder="Search tailored bullets..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] pl-8"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Bullet Cards List */}
              <div className="space-y-3">
                {allHistoricalBullets
                  .filter((b) => (bulletRoleFilter === 'all' ? true : b.roleContext === bulletRoleFilter))
                  .filter((b) =>
                    bulletSearchQuery.trim()
                      ? b.tailoredBullet.toLowerCase().includes(bulletSearchQuery.toLowerCase()) ||
                        b.originalBullet.toLowerCase().includes(bulletSearchQuery.toLowerCase()) ||
                        b.whyChanged.toLowerCase().includes(bulletSearchQuery.toLowerCase())
                      : true
                  )
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-white border border-[#EBE8E3] rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs hover:border-stone-300 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-stone-900 font-serif">{entry.roleContext}</span>
                          <span className="text-[10px] font-mono text-[#0F4A3E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {entry.companyContext}
                          </span>
                          <span className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                            {entry.versionName}
                          </span>
                        </div>

                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date(entry.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Before / After Comparison */}
                      <div className="space-y-2 text-xs">
                        {entry.originalBullet && (
                          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-500 space-y-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                              Original Bullet:
                            </span>
                            <p className="line-through">{entry.originalBullet}</p>
                          </div>
                        )}

                        <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200 text-stone-900 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F4A3E] flex items-center gap-1 font-serif">
                              <Sparkles className="w-3 h-3 text-[#0F4A3E]" />
                              Tailored Bullet (Google XYZ Formula):
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-[#0F4A3E] border border-emerald-300">
                              Quantified Impact
                            </span>
                          </div>
                          <p className="font-medium text-stone-900 leading-relaxed">• {entry.tailoredBullet}</p>
                        </div>

                        {entry.whyChanged && (
                          <div className="text-[11px] text-stone-600 bg-[#FAF9F7] p-2 rounded-xl border border-[#EBE8E3]">
                            <strong className="text-stone-900">Strategy Rationale: </strong>
                            {entry.whyChanged}
                          </div>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(entry.tailoredBullet);
                            setBulletCopiedId(entry.id);
                            setTimeout(() => setBulletCopiedId(null), 2000);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-200 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {bulletCopiedId === entry.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-700" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-stone-500" />
                              <span>Copy Bullet</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleRestoreBullet(entry)}
                          className="px-3 py-1.5 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                        >
                          <RotateCcw className="w-3 h-3 text-emerald-300" />
                          <span>Insert to Active Resume</span>
                        </button>
                      </div>
                    </div>
                  ))}

                {allHistoricalBullets.length === 0 && (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No tailored bullets recorded yet. Run Auto-Tailor on any draft to generate and preserve historical bullets!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: "WHY DID AI CHANGE THIS?" */}
      {selectedMod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#EBE8E3] rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE8E3] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-[#0F4A3E] flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-[#0F4A3E]" />
                </div>
                <h3 className="text-sm font-serif font-bold text-stone-900">Why Did AI Change This?</h3>
              </div>
              <button
                onClick={() => setSelectedMod(null)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#FAF9F7] rounded-xl border border-[#EBE8E3] space-y-1">
                <span className="font-bold text-stone-500 uppercase text-[10px] tracking-wider">Original Text:</span>
                <p className="text-stone-600 font-mono text-[11px]">{selectedMod.original}</p>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1">
                <span className="font-bold text-[#0F4A3E] uppercase text-[10px] tracking-wider">AI-Tailored Text:</span>
                <p className="text-stone-900 font-medium text-[11px] leading-relaxed">{selectedMod.tailored}</p>
              </div>

              <div className="p-3.5 bg-[#FAF9F7] rounded-xl border border-[#EBE8E3] space-y-1.5">
                <span className="font-bold text-[#0F4A3E] uppercase text-[10px] flex items-center gap-1 tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#0F4A3E]" />
                  Strategic Alignment Rationale:
                </span>
                <p className="text-stone-700 leading-relaxed text-[11px]">{selectedMod.whyChanged}</p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-emerald-800 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F4A3E]" />
                <span>Verified: Grounded 100% in your actual experience without manufactured claims.</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedMod(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD EVIDENCE WORKFLOW */}
      {evidenceModalGap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#EBE8E3] rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE8E3] pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#0F4A3E] font-mono tracking-wider">
                  Verified Evidence Intake
                </span>
                <h3 className="text-sm font-serif font-bold text-stone-900">
                  Add Genuine Evidence for: {evidenceModalGap.requirement}
                </h3>
              </div>
              <button
                onClick={() => setEvidenceModalGap(null)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-600 font-semibold block mb-1">Where did you use this?</label>
                <select
                  value={evidenceWhere}
                  onChange={(e) => setEvidenceWhere(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white"
                >
                  <option value="Work Experience">Work Experience</option>
                  <option value="Internship">Internship</option>
                  <option value="Production Project">Production Project</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Certification / Coursework">Certification / Coursework</option>
                </select>
              </div>

              <div>
                <label className="text-stone-600 font-semibold block mb-1">Context & Company / Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. ScaleCraft Software or Open-Source Project"
                  value={evidenceContext}
                  onChange={(e) => setEvidenceContext(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-stone-600 font-semibold block mb-1">What was your specific responsibility?</label>
                <input
                  type="text"
                  placeholder="e.g. Designed asynchronous job worker with Redis"
                  value={evidenceResponsibility}
                  onChange={(e) => setEvidenceResponsibility(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-stone-600 font-semibold block mb-1">Tools / Technologies Used</label>
                <input
                  type="text"
                  placeholder="e.g. AWS SQS, Docker, Node.js"
                  value={evidenceTool}
                  onChange={(e) => setEvidenceTool(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-stone-600 font-semibold block mb-1">Outcome & Optional Metric</label>
                <input
                  type="text"
                  placeholder="e.g. Processed 1.2M events/day with 99.98% reliability"
                  value={evidenceOutcome}
                  onChange={(e) => setEvidenceOutcome(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#EBE8E3]">
              <button
                onClick={() => setEvidenceModalGap(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Keep Missing
              </button>
              <button
                onClick={handleSaveEvidence}
                disabled={!evidenceContext.trim() || !evidenceResponsibility.trim()}
                className="px-4 py-2 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] disabled:opacity-50 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                Confirm Evidence & Re-Optimize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE NEW ROLE DRAFT */}
      {showNewDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#EBE8E3] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE8E3] pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#0F4A3E] font-mono tracking-wider">
                  Multi-Role Target Track
                </span>
                <h3 className="text-sm font-serif font-bold text-stone-900">Create New Resume Draft</h3>
              </div>
              <button
                onClick={() => setShowNewDraftModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-600 block mb-1 font-semibold">Draft Name</label>
                <input
                  type="text"
                  placeholder="e.g. MERN Full-Stack Specialist v2"
                  value={newDraftName}
                  onChange={(e) => setNewDraftName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-stone-600 block mb-1 font-semibold">Target Job Role</label>
                <input
                  type="text"
                  placeholder="e.g. MERN Stack Web Developer or AI / LLM Evaluator"
                  value={newDraftRole}
                  onChange={(e) => setNewDraftRole(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-stone-600 block mb-1 font-semibold">Target Company (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Haronex Technology, Outlier AI, TCS"
                  value={newDraftCompany}
                  onChange={(e) => setNewDraftCompany(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-stone-600 block mb-1 font-semibold">Starting Template / Focus</label>
                <select
                  value={newDraftTemplate}
                  onChange={(e) => setNewDraftTemplate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white"
                >
                  <option value="mern">MERN Stack Specialist (MetroMart E-Commerce)</option>
                  <option value="ai-eval">AI / LLM Evaluation Specialist (Model Benchmarking)</option>
                  <option value="java">Junior Systems & Java Engineer (Enterprise Stack)</option>
                  <option value="current">Clone Current Resume Text</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#EBE8E3]">
              <button
                onClick={() => setShowNewDraftModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewDraft}
                disabled={!newDraftName.trim() || !newDraftRole.trim()}
                className="px-4 py-2 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] disabled:opacity-50 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                Create & Switch to Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: GEMINI RESUME PARSER & PROFILE MAPPER */}
      {showParserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white border border-[#EBE8E3] rounded-3xl w-full max-w-2xl p-6 sm:p-7 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#EBE8E3] pb-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0F4A3E] text-[10px] font-bold font-mono border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-[#0F4A3E]" />
                  <span>Gemini 3.8 Flash · Resume Intelligence Engine</span>
                </div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 tracking-tight">
                  AI Resume Parser & Profile Mapper
                </h3>
                <p className="text-xs text-stone-500">
                  Upload a PDF/text resume or paste raw text. Gemini extracts your profile, verified technical skills, and experience snippets into ApplyFlow.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowParserModal(false);
                  setParsedData(null);
                  setParserError(null);
                }}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {parserError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{parserError}</span>
              </div>
            )}

            {/* If Not Parsed Yet: Intake Forms */}
            {!parsedData && !isParsingResume && (
              <div className="space-y-4">
                {/* Tabs: Upload File vs Paste Text */}
                <div className="flex p-1 bg-stone-100 rounded-2xl w-fit border border-stone-200">
                  <button
                    onClick={() => setParserInputMode('upload')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      parserInputMode === 'upload'
                        ? 'bg-[#0F4A3E] text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Upload Document (PDF / TXT)
                  </button>
                  <button
                    onClick={() => setParserInputMode('text')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      parserInputMode === 'text'
                        ? 'bg-[#0F4A3E] text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Paste Resume Text
                  </button>
                </div>

                {parserInputMode === 'upload' ? (
                  <div className="space-y-3">
                    <input
                      ref={resumeParserFileInputRef}
                      type="file"
                      accept=".pdf,.txt,.md"
                      onChange={handleParseResumeFile}
                      className="hidden"
                    />

                    <div
                      onClick={() => resumeParserFileInputRef.current?.click()}
                      className="border-2 border-dashed border-stone-300 hover:border-[#0F4A3E] bg-[#FAF9F7] hover:bg-stone-100/60 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3 group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0F4A3E] flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-semibold text-stone-900">
                          Click to upload PDF or Plain Text Resume
                        </p>
                        <p className="text-[11px] text-stone-500">
                          Supports native multi-page PDF documents and text files up to 10MB
                        </p>
                      </div>
                      <span className="inline-block px-3 py-1 rounded-full bg-stone-200 text-stone-700 text-[10px] font-mono">
                        Native Gemini PDF Parsing Enabled
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-stone-700 block">
                      Paste Plain Resume Text:
                    </label>
                    <textarea
                      rows={8}
                      value={parserRawText}
                      onChange={(e) => setParserRawText(e.target.value)}
                      placeholder="Paste your full resume text including Summary, Experience, Education, and Skills..."
                      className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0F4A3E] font-mono resize-y leading-relaxed"
                    />

                    <button
                      onClick={handleParseResumeFromText}
                      disabled={!parserRawText.trim()}
                      className="w-full py-3 rounded-2xl bg-[#0F4A3E] hover:bg-[#0B382F] disabled:opacity-50 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      <span>Parse Text with Gemini</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* While Parsing Spinner */}
            {isParsingResume && (
              <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-[#0F4A3E] animate-spin" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-stone-900">Gemini 3.8 Flash is Analyzing Resume...</p>
                  <p className="text-xs text-stone-500">
                    Extracting work experience metrics, verified technical skills, and structural metadata.
                  </p>
                </div>
              </div>
            )}

            {/* When Parsed: Review & Mapping Screen */}
            {parsedData && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-[#EBE8E3] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EBE8E3] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-stone-900 font-serif">
                          {parsedData.profile.fullName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-[#0F4A3E] border border-emerald-200 font-semibold">
                          {parsedData.profile.yearsOfExp} Yr{parsedData.profile.yearsOfExp === 1 ? '' : 's'} Exp
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 mt-0.5">{parsedData.profile.headline}</p>
                      <p className="text-[11px] text-stone-500">{parsedData.profile.email}</p>
                    </div>

                    <button
                      onClick={() => setParsedData(null)}
                      className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer self-start sm:self-auto transition-colors"
                    >
                      Re-upload
                    </button>
                  </div>

                  {/* Summary */}
                  {parsedData.summary && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                        Summary
                      </span>
                      <p className="text-xs text-stone-700 leading-relaxed">{parsedData.summary}</p>
                    </div>
                  )}

                  {/* Skills Chips */}
                  {parsedData.profile.skills && parsedData.profile.skills.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                        Extracted Technical Skills ({parsedData.profile.skills.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                        {parsedData.profile.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-white border border-[#EBE8E3] text-stone-700 text-[11px] font-mono shadow-2xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Work Experience Snippets */}
                  {parsedData.profile.experienceSnippets && parsedData.profile.experienceSnippets.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                        Key Experience Achievement Snippets:
                      </span>
                      <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                        {parsedData.profile.experienceSnippets.map((snippet, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-xl bg-white border border-[#EBE8E3] text-[11px] text-stone-700 leading-relaxed shadow-2xs"
                          >
                            • {snippet}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mapping Options */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-2 text-xs">
                  <span className="text-[10px] uppercase font-bold text-[#0F4A3E] tracking-wider block">
                    Automatic Profile Mapping Options:
                  </span>

                  <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                    <input
                      type="checkbox"
                      checked={updateGlobalProfile}
                      onChange={(e) => setUpdateGlobalProfile(e.target.checked)}
                      className="rounded accent-[#0F4A3E]"
                    />
                    <span>Update App&apos;s Global Candidate Profile (`userProfile`) & Truth Anchor</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                    <input
                      type="checkbox"
                      checked={updateCurrentDraft}
                      onChange={(e) => setUpdateCurrentDraft(e.target.checked)}
                      className="rounded accent-[#0F4A3E]"
                    />
                    <span>Update Active Resume Draft Source Text & Role ({jobTitle})</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                    <input
                      type="checkbox"
                      checked={createNewRoleDraft}
                      onChange={(e) => setCreateNewRoleDraft(e.target.checked)}
                      className="rounded accent-[#0F4A3E]"
                    />
                    <span>Create a New Dedicated Target Role Draft for this Ingested Resume</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EBE8E3]">
                  <button
                    onClick={() => {
                      setShowParserModal(false);
                      setParsedData(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyParsedResume}
                    className="px-5 py-2.5 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Apply Parsed Resume to ApplyFlow</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* In-Line Bullet Polish Workbench Modal */}
      {polishTarget && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white border border-[#EBE8E3] rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative my-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#EBE8E3] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0F4A3E]">
                  <Wand2 className="w-5 h-5 text-[#0F4A3E]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-serif font-bold text-stone-900 tracking-tight">
                      AI Bullet Polish Workbench
                    </h3>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-[#0F4A3E] border border-emerald-200">
                      Google XYZ Formula
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Role: <span className="text-stone-800 font-medium">{polishTarget.role}</span> · Company: <span className="text-stone-800 font-medium">{polishTarget.company}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPolishTarget(null);
                  setPolishResult(null);
                  setPolishError(null);
                }}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Original Bullet */}
            <div className="p-3 bg-[#FAF9F7] rounded-2xl border border-[#EBE8E3] space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-500 block tracking-wider">
                Current Bullet Point:
              </span>
              <p className="text-xs text-stone-700 leading-relaxed font-mono">
                &quot;{polishTarget.text}&quot;
              </p>
            </div>

            {/* Loading state */}
            {isPolishing && (
              <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
                <RefreshCw className="w-7 h-7 text-[#0F4A3E] animate-spin" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-stone-900">
                    Polishing bullet with Gemini AI...
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Applying Google&apos;s XYZ formula, upgrading action verbs, and quantifying performance impact.
                  </p>
                </div>
              </div>
            )}

            {/* Error state */}
            {polishError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{polishError}</span>
                </div>
                <button
                  onClick={() => handleStartPolishBullet(polishTarget.expIndex, polishTarget.bulletIndex, polishTarget.text, polishTarget.role, polishTarget.company)}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Result state */}
            {polishResult && !isPolishing && (
              <div className="space-y-4 animate-in fade-in">
                {/* Critique & Strength Score */}
                <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">Recruiter Critique:</span>
                      {polishResult.activeVerbUsed && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                          Verb: {polishResult.activeVerbUsed}
                        </span>
                      )}
                    </div>
                    <p className="text-stone-700 leading-relaxed text-[11px]">
                      {polishResult.critique}
                    </p>
                  </div>
                  <div className="text-center shrink-0 pl-3 border-l border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block tracking-wider">
                      Strength
                    </span>
                    <span className="text-xl font-serif font-black text-[#0F4A3E]">
                      {polishResult.strengthScore}/100
                    </span>
                  </div>
                </div>

                {/* 3 Selectable Variants */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">
                    Select High-Impact Formula:
                  </span>

                  {/* Option 1: Metric XYZ */}
                  <div
                    onClick={() => setSelectedPolishVariant(polishResult.metricVariant)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                      selectedPolishVariant === polishResult.metricVariant
                        ? 'bg-emerald-50 border-emerald-400 text-stone-900 shadow-xs ring-1 ring-emerald-400'
                        : 'bg-[#FAF9F7] border-[#EBE8E3] text-stone-700 hover:border-emerald-300 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-[#0F4A3E] border border-emerald-300 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-[#0F4A3E]" />
                        <span>Google XYZ Formula (Metric & Impact)</span>
                      </span>
                      {selectedPolishVariant === polishResult.metricVariant && (
                        <CheckCircle2 className="w-4 h-4 text-[#0F4A3E]" />
                      )}
                    </div>
                    <p className="text-xs leading-relaxed font-mono">
                      {polishResult.metricVariant}
                    </p>
                  </div>

                  {/* Option 2: Brevity */}
                  <div
                    onClick={() => setSelectedPolishVariant(polishResult.brevityVariant)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                      selectedPolishVariant === polishResult.brevityVariant
                        ? 'bg-emerald-50 border-emerald-400 text-stone-900 shadow-xs ring-1 ring-emerald-400'
                        : 'bg-[#FAF9F7] border-[#EBE8E3] text-stone-700 hover:border-emerald-300 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 border border-stone-300 flex items-center gap-1">
                        <Target className="w-3 h-3 text-stone-700" />
                        <span>High Brevity & High Density</span>
                      </span>
                      {selectedPolishVariant === polishResult.brevityVariant && (
                        <CheckCircle2 className="w-4 h-4 text-[#0F4A3E]" />
                      )}
                    </div>
                    <p className="text-xs leading-relaxed font-mono">
                      {polishResult.brevityVariant}
                    </p>
                  </div>

                  {/* Option 3: Keyword Dense */}
                  <div
                    onClick={() => setSelectedPolishVariant(polishResult.keywordVariant)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                      selectedPolishVariant === polishResult.keywordVariant
                        ? 'bg-emerald-50 border-emerald-400 text-stone-900 shadow-xs ring-1 ring-emerald-400'
                        : 'bg-[#FAF9F7] border-[#EBE8E3] text-stone-700 hover:border-emerald-300 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 border border-stone-300 flex items-center gap-1">
                        <Search className="w-3 h-3 text-stone-700" />
                        <span>ATS Keyword Infused</span>
                      </span>
                      {selectedPolishVariant === polishResult.keywordVariant && (
                        <CheckCircle2 className="w-4 h-4 text-[#0F4A3E]" />
                      )}
                    </div>
                    <p className="text-xs leading-relaxed font-mono">
                      {polishResult.keywordVariant}
                    </p>
                  </div>
                </div>

                {/* Editable Textarea */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-stone-500 block tracking-wider">
                    Customize or Review Before Applying:
                  </label>
                  <textarea
                    rows={3}
                    value={selectedPolishVariant}
                    onChange={(e) => setSelectedPolishVariant(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F4A3E] focus:bg-white font-mono leading-relaxed resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EBE8E3]">
                  <button
                    onClick={() => {
                      setPolishTarget(null);
                      setPolishResult(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleApplyPolishedBullet(selectedPolishVariant || polishResult.metricVariant)}
                    disabled={!selectedPolishVariant.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Apply to Resume & Save to History</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
