import React, { useState, useEffect, useMemo } from 'react';
import {
  StarStoryVaultItem,
  CompetencyDefinition,
  BarRaiserDrillItem,
  JobApplication,
  UserProfile,
  StandingRule
} from '../types/job';
import {
  polishStarStory,
  generateStarInterrogatorDrill,
  evaluateStarDefense
} from '../services/geminiService';
import {
  Award,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCcw,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Building2,
  Clock,
  Mic,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Flame,
  Monitor,
  X,
  Target,
  Zap,
  BookOpen
} from 'lucide-react';

interface StarStoryVaultHubProps {
  applications: JobApplication[];
  userProfile?: UserProfile;
  standingRules?: StandingRule[];
  onSelectApplication?: (app: JobApplication) => void;
  onNavigateToInterviewSimulator?: (appId?: string) => void;
}

// Master Competencies Catalog
const MASTER_COMPETENCIES: CompetencyDefinition[] = [
  // Amazon Leadership Principles
  {
    id: 'customer_obsession',
    name: 'Customer Obsession',
    framework: 'amazon_lp',
    frameworkLabel: 'Amazon LP',
    description: 'Start with the customer and work backwards. Work vigorously to earn and keep customer trust.',
    typicalQuestions: [
      'Tell me about a time you had to balance customer needs with engineering constraints.',
      'Describe a situation where you went above and beyond to solve a customer problem.'
    ]
  },
  {
    id: 'ownership',
    name: 'Ownership',
    framework: 'amazon_lp',
    frameworkLabel: 'Amazon LP',
    description: 'Leaders are owners. They think long term and don’t sacrifice long-term value for short-term results. They never say "that’s not my job".',
    typicalQuestions: [
      'Tell me about a time you took on something outside your official area of responsibility.',
      'Describe a time you saw a problem and fixed it before anyone asked you to.'
    ]
  },
  {
    id: 'bias_for_action',
    name: 'Bias for Action',
    framework: 'amazon_lp',
    frameworkLabel: 'Amazon LP',
    description: 'Speed matters in business. Many decisions and actions are reversible and do not need extensive study. Value calculated risk-taking.',
    typicalQuestions: [
      'Tell me about a calculated risk you took where speed was more critical than 100% certainty.',
      'Describe a time you made an architectural decision with incomplete information.'
    ]
  },
  {
    id: 'deliver_results',
    name: 'Deliver Results',
    framework: 'amazon_lp',
    frameworkLabel: 'Amazon LP',
    description: 'Leaders focus on the key inputs for their business and deliver them with the right quality and in a timely fashion. Despite setbacks, they rise to the occasion.',
    typicalQuestions: [
      'Describe a project with a seemingly impossible deadline that you delivered successfully.',
      'Tell me about a time when all odds were against you and how you managed to achieve your goal.'
    ]
  },
  {
    id: 'dive_deep',
    name: 'Dive Deep',
    framework: 'amazon_lp',
    frameworkLabel: 'Amazon LP',
    description: 'Leaders operate at all levels, stay connected to the details, audit frequently, and are skeptical when metrics and anecdote differ.',
    typicalQuestions: [
      'Tell me about the most difficult bug or architectural anomaly you personally isolated down to the root cause.',
      'Describe a time when telemetry data contradicted what stakeholders were reporting.'
    ]
  },
  {
    id: 'disagree_and_commit',
    name: 'Disagree and Commit',
    framework: 'amazon_lp',
    frameworkLabel: 'Amazon LP',
    description: 'Leaders are obligated to respectfully challenge decisions when they disagree, even when doing so is uncomfortable. Once a decision is determined, they commit wholly.',
    typicalQuestions: [
      'Tell me about a time you strongly disagreed with a tech lead or product manager. How did you handle it?',
      'Describe a situation where an architectural direction you opposed was chosen, and how you supported it.'
    ]
  },
  {
    id: 'earn_trust',
    name: 'Earn Trust',
    framework: 'amazon_lp',
    frameworkLabel: 'Amazon LP',
    description: 'Leaders listen attentively, speak candidly, and treat others respectfully. They are vocally self-critical, even when doing so is awkward.',
    typicalQuestions: [
      'Tell me about a significant mistake you made and how you earned back team trust.',
      'Describe how you built trust with a cross-functional squad that had previously been skeptical of engineering.'
    ]
  },
  {
    id: 'invent_and_simplify',
    name: 'Invent and Simplify',
    framework: 'amazon_lp',
    frameworkLabel: 'Amazon LP',
    description: 'Leaders expect and require innovation and invention from their teams and always find ways to simplify. They are externally aware and look for new ideas from everywhere.',
    typicalQuestions: [
      'Tell me about a complex process or system that you radically simplified.',
      'Describe an innovative technical solution you created that saved engineering overhead.'
    ]
  },

  // Google Values
  {
    id: 'navigating_ambiguity',
    name: 'Navigating Ambiguity',
    framework: 'google_values',
    frameworkLabel: 'Google Core',
    description: 'Comfortably operate when problem boundaries and requirements are fluid. Structure the unstructured.',
    typicalQuestions: [
      'Describe a project where requirements were vague or constantly shifting. How did you bring clarity?',
      'How do you prioritize your engineering roadmap when leadership hasn’t defined strict success criteria?'
    ]
  },
  {
    id: 'intellectual_humility',
    name: 'Intellectual Humility & Googliness',
    framework: 'google_values',
    frameworkLabel: 'Google Core',
    description: 'Prioritize doing the right thing for users, welcoming critical feedback, and admitting when an initial assumption was wrong.',
    typicalQuestions: [
      'Tell me about a time you realized your technical recommendation was wrong and had to pivot publicly.',
      'Describe a code review where a peer gave you tough feedback and how you incorporated it.'
    ]
  },
  {
    id: 'collaborative_spirit',
    name: 'Collaborative Spirit',
    framework: 'google_values',
    frameworkLabel: 'Google Core',
    description: 'Elevate team health over solo heroism. Foster psychological safety and shared ownership.',
    typicalQuestions: [
      'Tell me about a cross-team initiative where alignment between frontend, backend, and infra was fractured.',
      'Describe how you helped a struggling teammate get their pull requests up to team standards.'
    ]
  },

  // Executive Core
  {
    id: 'conflict_resolution',
    name: 'Conflict Resolution',
    framework: 'executive_core',
    frameworkLabel: 'Executive',
    description: 'De-escalate interpersonal and technical friction through objective data, active listening, and mutual respect.',
    typicalQuestions: [
      'Describe a high-stakes standoff between two senior engineers on an architecture choice.',
      'Tell me about a time when a product deadline conflicted with engineering quality and safety.'
    ]
  },
  {
    id: 'incident_management',
    name: 'P0 Incident & Crisis Management',
    framework: 'executive_core',
    frameworkLabel: 'Executive',
    description: 'Decisive calm during live production fires, clear stakeholder communication, and blameless postmortem remediation.',
    typicalQuestions: [
      'Walk me through the worst production outage you’ve managed. How did you restore service under pressure?',
      'How do you facilitate a blameless post-mortem that drives permanent systemic prevention?'
    ]
  },
  {
    id: 'technical_mentorship',
    name: 'Technical Mentorship',
    framework: 'executive_core',
    frameworkLabel: 'Executive',
    description: 'Grow adjacent engineers, multiply squad capabilities, and establish sustainable team coding ergonomics.',
    typicalQuestions: [
      'Tell me about an engineer you mentored who achieved a promotion or significant breakthrough.',
      'How do you foster a culture of constructive code reviews and continuous learning?'
    ]
  }
];

// Initial Anchor Stories based on User Background
const INITIAL_STAR_STORIES: StarStoryVaultItem[] = [
  {
    id: 'story-1',
    title: 'High-Concurrency Multivendor E-Commerce Latency Optimization',
    companyContext: 'Haronex Technology',
    roleContext: 'MERN Stack Web Developer',
    timeframe: '2026',
    targetCompetencies: ['ownership', 'deliver_results', 'dive_deep', 'customer_obsession'],
    situation: 'At Haronex Technology, as our multivendor e-commerce platform scaled past thousands of active catalog listings, simultaneous checkout requests caused database connection spikes and degraded p95 API response times to 1,200ms during peak campaign hours.',
    task: 'As the lead engineer on the backend and API boundary, my direct responsibility was to reduce endpoint latency below 200ms and eliminate inventory race conditions during flash sales, with zero downtime during deployment.',
    action: 'I profiled database query patterns using MongoDB explain plans, identified unindexed collection scans, and architected a Redis read-through caching layer for high-demand vendor listings. For writes, I introduced optimistic concurrency tokens and refactored the checkout endpoint with asynchronous queueing. I also wrote an automated integration test suite simulating 50 concurrent checkout collisions.',
    result: 'We reduced p95 API response latency by 82% (from 1,200ms down to 180ms), successfully sustained a 4x surge in peak order volume without a single inventory double-spend, and cut vendor onboarding turnaround from 3 days to under 4 hours.',
    quantifiedMetrics: [
      '82% reduction in p95 latency (1.2s → 180ms)',
      '4x increase in peak concurrent order throughput',
      'Zero inventory double-spend collisions across 50+ vendors',
      '100% automated E2E test coverage for checkout data paths'
    ],
    hookSoundbite: 'When sudden promotional surges caused our multivendor checkout endpoints to throttle, I redesigned our caching and concurrency pipeline—slashing latency by 82% with zero order collisions.',
    spokenPitch90s: 'At Haronex Technology, our multivendor platform hit a critical inflection point where catalog traffic was surging and checkout p95 latency had reached 1.2 seconds, threatening customer conversions.\n\nMy responsibility was to overhaul the API data path and inventory concurrency guarantees without disrupting active sellers.\n\nI profiled our query bottlenecks, introduced Redis distributed caching for read-heavy SKU queries, and architected optimistic concurrency controls with atomic updates for simultaneous cart checkouts. I also instituted automated regression suites to guarantee data isolation.\n\nAs a result, we brought p95 latency down to 180 milliseconds—an 82% improvement—while supporting a 4x traffic surge with zero order collisions. This taught me how to pair deep architectural refactoring with immediate commercial impact.',
    whatIdDoDifferently: 'If doing this again, I would establish distributed tracing telemetry earlier in development rather than relying initially on standard log aggregation. Having trace-level waterfall visualization would have cut our root-cause isolation time in half.',
    associatedApplicationIds: [],
    barRaiserDrills: [
      {
        id: 'drill-1',
        question: 'You claimed an 82% latency reduction. How did you isolate that this gain came specifically from your Redis caching versus other database index tweaks or lighter traffic patterns?',
        interviewerIntent: 'Checking if you truly measured baseline telemetry using A/B load tests or if you are quoting an unverified vanity number.',
        userDefense: 'We ran synthetic load tests in staging simulating 500 concurrent virtual users before and after each isolated commit. The indexing alone shaved 25% of query execution time, while the Redis read-through layer absorbed 70% of cache hits, driving the aggregate latency down from 1,200ms to 180ms under identical load.'
      }
    ],
    strengthScore: 94,
    practiceCount: 3,
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'story-2',
    title: 'Resolving Architectural Impasse on API Schemas Under Tight Launch Deadline',
    companyContext: 'Jinarth Infotech',
    roleContext: 'Web Developer',
    timeframe: '2025',
    targetCompetencies: ['disagree_and_commit', 'conflict_resolution', 'bias_for_action', 'navigating_ambiguity'],
    situation: 'During a cross-functional sprint before a major client demo, our frontend and backend engineers reached a 5-day deadlock over adopting GraphQL versus standardized RESTful endpoints, stalling three critical feature PRs.',
    task: 'My goal was to break the impasse, align both sides on a viable consensus contract, and prevent the sprint from missing our external stakeholder commitment.',
    action: 'Rather than debating theoretical purism, I scheduled a 45-minute working spike. I mapped out the 3 highest-traffic endpoints, demonstrated a hybrid REST contract with query-filtered fields that satisfied frontend payloads, and created an OpenAPI specification with automated mock server fixtures so frontend development could resume immediately.',
    result: 'Both squads unanimously agreed to the contract within 24 hours. We unblocked all 3 pending features, completed integration testing 2 days ahead of schedule, and delivered the client demo with zero API contract defects.',
    quantifiedMetrics: [
      'Unblocked 5-day team deadlock within 24 hours',
      'Delivered client release 2 days ahead of schedule',
      'Zero API contract regression defects during live client demo'
    ],
    hookSoundbite: 'To resolve a 5-day architectural deadlock between frontend and backend teams before a critical demo, I engineered a pragmatic API contract spike that unblocked both squads in 24 hours.',
    spokenPitch90s: 'Before a high-visibility client demo, our frontend and backend squads hit a multi-day impasse over whether to migrate to GraphQL or stay on REST, which halted sprint progress.\n\nSeeing our delivery date threatened, I took the initiative to broker alignment without reigniting ideological debates.\n\nI organized a focused 45-minute session where we evaluated our 3 core endpoints. I proposed an OpenAPI-driven JSON contract with field filtering that solved the frontend’s over-fetching concerns while requiring zero backend architecture rewrites. To make it tangible, I generated mock endpoints that unblocked client UI work in under 2 hours.\n\nBoth teams committed fully, we finished integration 2 days early, and the client demo passed flawlessly. It taught me that pragmatic compromise paired with rapid prototyping always beats theoretical debate.',
    whatIdDoDifferently: 'I would establish schema-first contract reviews as a mandatory sprint planning artifact upfront, rather than waiting for integration week when disagreements become costly.',
    associatedApplicationIds: [],
    barRaiserDrills: [
      {
        id: 'drill-2',
        question: 'When you proposed the hybrid compromise, how did you ensure the GraphQL advocate felt heard rather than overruled?',
        interviewerIntent: 'Testing empathy and ego management in technical conflict.',
        userDefense: 'I explicitly acknowledged the benefits of GraphQL for future client querying and agreed to document GraphQL as an RFC topic for Q3, while showing that our immediate launch constraint made the OpenAPI specification the lowest-risk path forward.'
      }
    ],
    strengthScore: 92,
    practiceCount: 2,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'story-3',
    title: 'Triage of Production Connection Freeze & Blameless Prevention Protocol',
    companyContext: 'Modern Web Solutions',
    roleContext: 'Software Engineer',
    timeframe: '2025 - 2026',
    targetCompetencies: ['earn_trust', 'incident_management', 'dive_deep', 'customer_obsession'],
    situation: 'During a midday traffic surge, an unindexed background report query caused database pool exhaustion, triggering intermittent 500 errors and degraded experiences for roughly 1,400 active users for 12 minutes.',
    task: 'My objective was to restore database availability immediately, identify the offending query, and codify automated protections so this failure class could never recur.',
    action: 'I immediately killed the long-running analytical query process, scaled the connection pool threshold, and restored customer checkout transactions in under 4 minutes. In the post-mortem, rather than pointing fingers, I analyzed the slow-query log, added compound indexes, and instituted a CI/CD lint check that fails any PR containing unindexed collection queries.',
    result: 'Full service was restored within 14 minutes with zero customer data loss. Over the subsequent 6 months, our platform experienced zero query-induced connection freezes.',
    quantifiedMetrics: [
      '14-minute full Mean Time to Recovery (MTTR)',
      'Zero customer transaction data loss',
      'Zero query-induced pool exhaustion incidents over 6 months',
      'Codified automated CI/CD static query performance gates'
    ],
    hookSoundbite: 'When an unindexed analytical query locked our production database pool, I mitigated the outage in 14 minutes and established CI/CD query budgets that permanently prevented recurrence.',
    spokenPitch90s: 'During a busy afternoon window, an ad-hoc analytics query saturated our connection pool, causing intermittent 500 errors for our web users.\n\nI stepped into the incident commander role to restore user checkout availability and prevent cascading failures.\n\nI terminated the locking process, temporarily raised connection headroom, and monitored latency as error rates dropped back to 0%. Following recovery, I led a blameless postmortem. Instead of just adding the missing index, I created a query performance audit rule in our CI pipeline that flags collection scans on large datasets before code can merge.\n\nWe recovered in 14 minutes with zero data corruption, and that failure pattern has not recurred once in 6 months.',
    whatIdDoDifferently: 'I should have isolated analytical reporting to a dedicated read-replica earlier. Mixing heavy analytical batch queries with transactional web traffic was an architectural vulnerability we should have decoupled sooner.',
    associatedApplicationIds: [],
    barRaiserDrills: [],
    strengthScore: 90,
    practiceCount: 1,
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'story-4',
    title: 'Accelerating Junior Developer Ramp-Up Through Interactive Code Sandboxes',
    companyContext: 'Engineering Community',
    roleContext: 'Technical Mentor & Developer',
    timeframe: '2025',
    targetCompetencies: ['technical_mentorship', 'collaborative_spirit', 'intellectual_humility'],
    situation: 'Two new engineering interns joined the team and were intimidated by our multi-layered monorepo, leading to confusion and delayed first PR submissions.',
    task: 'My goal was to onboard them effectively, boost their technical confidence, and enable them to merge their first production-ready feature within 30 days.',
    action: 'I built a lightweight sandbox boilerplate repo reproducing our core patterns with mock data. I scheduled daily 20-minute pair-programming touchpoints, reviewed their pull requests with detailed contextual explanations, and encouraged them to ask questions in a blame-free setting.',
    result: 'Both engineers shipped their first independent production pull requests within 18 days (40% faster than typical onboarding cohorts) and successfully owned their modules with zero regressions.',
    quantifiedMetrics: [
      'First PR shipped in 18 days (40% faster than 30-day baseline)',
      'Zero production rollbacks on intern-shipped modules',
      'Created reusable developer onboarding sandbox adopted across the team'
    ],
    hookSoundbite: 'To help new engineers overcome monorepo complexity, I built interactive code sandboxes and paired daily—enabling them to ship to production in 18 days.',
    spokenPitch90s: 'When new team members joined our squad, they felt overwhelmed navigating our legacy monorepo, causing anxiety and slow ramp-up.\n\nI wanted to make their onboarding smooth, supportive, and empowering.\n\nI extracted our key architectural patterns into an interactive sandbox with mock APIs, allowing them to test code freely without fear of breaking staging. I conducted supportive code reviews focusing on the "why" behind patterns and paired with them on their first tasks.\n\nBoth teammates successfully merged independent production PRs within 18 days—40% faster than the team average—and the onboarding sandbox is now standard practice for all incoming engineers.',
    whatIdDoDifferently: 'I would have recorded short 3-minute Loom video walkthroughs of the common setup pitfalls earlier, which would have saved us even more repetitive debugging time.',
    associatedApplicationIds: [],
    barRaiserDrills: [],
    strengthScore: 89,
    practiceCount: 2,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const StarStoryVaultHub: React.FC<StarStoryVaultHubProps> = ({
  applications,
  userProfile,
  standingRules,
  onSelectApplication,
  onNavigateToInterviewSimulator
}) => {
  // Master Stories State
  const [stories, setStories] = useState<StarStoryVaultItem[]>(() => {
    try {
      const saved = localStorage.getItem('applyflow_star_story_vault');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_STAR_STORIES;
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('applyflow_star_story_vault', JSON.stringify(stories));
    } catch (e) {
      console.warn('Failed to save STAR story vault:', e);
    }
  }, [stories]);

  // UI Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompetencyFilter, setSelectedCompetencyFilter] = useState<string>('all');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'stories' | 'matrix' | 'cheatsheet'>('stories');

  // Modals & Drawers
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Partial<StarStoryVaultItem> | null>(null);
  const [isPolishing, setIsPolishing] = useState(false);

  // Drill Interrogation State
  const [activeDrillStory, setActiveDrillStory] = useState<StarStoryVaultItem | null>(null);
  const [drillQuestions, setDrillQuestions] = useState<BarRaiserDrillItem[]>([]);
  const [isLoadingDrills, setIsLoadingDrills] = useState(false);
  const [selectedDrillIndex, setSelectedDrillIndex] = useState(0);
  const [userDefenseInput, setUserDefenseInput] = useState('');
  const [isEvaluatingDefense, setIsEvaluatingDefense] = useState(false);
  const [defenseEvaluation, setDefenseEvaluation] = useState<any>(null);

  // 90s Speech Teleprompter Drawer
  const [teleprompterStory, setTeleprompterStory] = useState<StarStoryVaultItem | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Active interviewing companies
  const interviewingCompanies = useMemo(() => {
    return applications.filter((a) => a.status === 'interviewing');
  }, [applications]);

  // Coverage Analysis
  const coverageAnalysis = useMemo(() => {
    const map = new Map<string, StarStoryVaultItem[]>();
    MASTER_COMPETENCIES.forEach((c) => map.set(c.id, []));

    stories.forEach((story) => {
      story.targetCompetencies.forEach((comp) => {
        const list = map.get(comp) || [];
        list.push(story);
        map.set(comp, list);
      });
    });

    let coveredCount = 0;
    let blindSpotCount = 0;

    MASTER_COMPETENCIES.forEach((c) => {
      const count = map.get(c.id)?.length || 0;
      if (count >= 1) coveredCount++;
      else blindSpotCount++;
    });

    return {
      map,
      coveredCount,
      blindSpotCount,
      coveragePercent: Math.round((coveredCount / MASTER_COMPETENCIES.length) * 100)
    };
  }, [stories]);

  // Filtered Stories
  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText =
          story.title.toLowerCase().includes(q) ||
          story.situation.toLowerCase().includes(q) ||
          story.action.toLowerCase().includes(q) ||
          story.result.toLowerCase().includes(q) ||
          story.companyContext.toLowerCase().includes(q);
        if (!matchesText) return false;
      }

      // Competency filter
      if (selectedCompetencyFilter !== 'all') {
        if (!story.targetCompetencies.includes(selectedCompetencyFilter)) {
          return false;
        }
      }

      // Company filter
      if (selectedCompanyFilter !== 'all') {
        if (
          !story.associatedApplicationIds.includes(selectedCompanyFilter) &&
          !story.companyContext.toLowerCase().includes(selectedCompanyFilter.toLowerCase())
        ) {
          return false;
        }
      }

      return true;
    });
  }, [stories, searchQuery, selectedCompetencyFilter, selectedCompanyFilter]);

  // Open Editor for New Story
  const handleOpenNewStory = (preselectedComp?: string) => {
    setEditingStory({
      id: `story-${Date.now()}`,
      title: '',
      companyContext: 'Current / Recent Project',
      roleContext: userProfile?.currentRole || 'Software Engineer',
      timeframe: '2025 - 2026',
      targetCompetencies: preselectedComp ? [preselectedComp] : ['ownership', 'deliver_results'],
      rawNotes: '',
      situation: '',
      task: '',
      action: '',
      result: '',
      quantifiedMetrics: [],
      hookSoundbite: '',
      spokenPitch90s: '',
      whatIdDoDifferently: '',
      associatedApplicationIds: interviewingCompanies[0] ? [interviewingCompanies[0].id] : [],
      barRaiserDrills: [],
      strengthScore: 90,
      practiceCount: 0,
      isFavorite: false
    });
    setIsEditorOpen(true);
  };

  // Polish Story with Gemini 3.8 Flash
  const handlePolishWithGemini = async () => {
    if (!editingStory) return;
    setIsPolishing(true);

    try {
      const response = await polishStarStory({
        rawNotes: editingStory.rawNotes || `${editingStory.situation} ${editingStory.action} ${editingStory.result}`,
        title: editingStory.title,
        companyContext: editingStory.companyContext,
        roleContext: editingStory.roleContext,
        targetCompetencies: editingStory.targetCompetencies,
        userProfile,
        standingRules: standingRules?.map((r) => r.title)
      });

      const res = response.result;
      setEditingStory((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          title: prev.title || res.title,
          situation: res.situation,
          task: res.task,
          action: res.action,
          result: res.result,
          quantifiedMetrics: res.quantifiedMetrics,
          hookSoundbite: res.hookSoundbite,
          spokenPitch90s: res.spokenPitch90s,
          whatIdDoDifferently: res.whatIdDoDifferently,
          strengthScore: res.strengthScore
        };
      });
    } catch (err) {
      console.error('Failed to polish story with Gemini:', err);
    } finally {
      setIsPolishing(false);
    }
  };

  // Save Story from Editor
  const handleSaveStory = () => {
    if (!editingStory || !editingStory.title?.trim()) {
      alert('Please provide a title for your STAR story.');
      return;
    }

    const completeStory: StarStoryVaultItem = {
      id: editingStory.id || `story-${Date.now()}`,
      title: editingStory.title || 'Untitled STAR Story',
      companyContext: editingStory.companyContext || 'Previous Employer',
      roleContext: editingStory.roleContext || 'Software Engineer',
      timeframe: editingStory.timeframe || '2025',
      targetCompetencies: editingStory.targetCompetencies || ['ownership'],
      rawNotes: editingStory.rawNotes || '',
      situation: editingStory.situation || '',
      task: editingStory.task || '',
      action: editingStory.action || '',
      result: editingStory.result || '',
      quantifiedMetrics: editingStory.quantifiedMetrics || [],
      hookSoundbite: editingStory.hookSoundbite || '',
      spokenPitch90s: editingStory.spokenPitch90s || '',
      whatIdDoDifferently: editingStory.whatIdDoDifferently || '',
      associatedApplicationIds: editingStory.associatedApplicationIds || [],
      barRaiserDrills: editingStory.barRaiserDrills || [],
      strengthScore: editingStory.strengthScore || 90,
      practiceCount: editingStory.practiceCount || 0,
      isFavorite: editingStory.isFavorite || false,
      createdAt: editingStory.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setStories((prev) => {
      const exists = prev.some((s) => s.id === completeStory.id);
      if (exists) {
        return prev.map((s) => (s.id === completeStory.id ? completeStory : s));
      }
      return [completeStory, ...prev];
    });

    setIsEditorOpen(false);
    setEditingStory(null);
  };

  // Delete Story
  const handleDeleteStory = (storyId: string) => {
    if (confirm('Are you sure you want to delete this STAR story?')) {
      setStories((prev) => prev.filter((s) => s.id !== storyId));
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (storyId: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  // Open Bar Raiser Interrogation Drill
  const handleOpenDrill = async (story: StarStoryVaultItem) => {
    setActiveDrillStory(story);
    setSelectedDrillIndex(0);
    setUserDefenseInput('');
    setDefenseEvaluation(null);

    // Increment practice count
    setStories((prev) =>
      prev.map((s) =>
        s.id === story.id
          ? { ...s, practiceCount: (s.practiceCount || 0) + 1, lastPracticedDate: new Date().toISOString() }
          : s
      )
    );

    if (story.barRaiserDrills && story.barRaiserDrills.length > 0) {
      setDrillQuestions(story.barRaiserDrills);
      return;
    }

    setIsLoadingDrills(true);
    try {
      const targetCompany = applications.find((a) =>
        story.associatedApplicationIds.includes(a.id)
      )?.company || 'Tier-1 Tech';

      const response = await generateStarInterrogatorDrill({
        story,
        targetCompany
      });

      const drills: BarRaiserDrillItem[] = response.result.map((d: any) => ({
        id: d.id,
        question: d.question,
        interviewerIntent: d.interviewerIntent,
        userDefense: d.sampleStrongAnswer
      }));

      setDrillQuestions(drills);

      // Save drills back to the story
      setStories((prev) =>
        prev.map((s) => (s.id === story.id ? { ...s, barRaiserDrills: drills } : s))
      );
    } catch (err) {
      console.error('Failed to load drill questions:', err);
    } finally {
      setIsLoadingDrills(false);
    }
  };

  // Evaluate Candidate Defense
  const handleEvaluateDefense = async () => {
    if (!activeDrillStory || !drillQuestions[selectedDrillIndex] || !userDefenseInput.trim()) {
      return;
    }

    setIsEvaluatingDefense(true);
    try {
      const response = await evaluateStarDefense({
        question: drillQuestions[selectedDrillIndex].question,
        story: activeDrillStory,
        userDefense: userDefenseInput
      });

      setDefenseEvaluation(response.result);

      // Save user defense
      setDrillQuestions((prev) =>
        prev.map((d, idx) =>
          idx === selectedDrillIndex ? { ...d, userDefense: userDefenseInput } : d
        )
      );
    } catch (err) {
      console.error('Failed to evaluate defense:', err);
    } finally {
      setIsEvaluatingDefense(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EBE8E3]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
              <Award className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
              Behavioral STAR Story Vault
            </h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider font-sans border border-emerald-300">
              Amazon & Google Bar-Raiser Aligned
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1.5">
            Architect, polish, and pressure-test anchor career stories across Amazon Leadership Principles, Google Googliness, and Executive competencies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* View Toggle */}
          <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('stories')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'stories'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Story Vault ({stories.length})
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Competency Matrix ({coverageAnalysis.coveredCount}/{MASTER_COMPETENCIES.length})
            </button>
            <button
              onClick={() => setActiveTab('cheatsheet')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'cheatsheet'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Interview Day Screen</span>
            </button>
          </div>

          <button
            onClick={() => handleOpenNewStory()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-300" />
            <span>New STAR Story</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Master Stories */}
        <div className="bg-white border border-[#EBE8E3] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Master Anchor Stories</span>
            <BookOpen className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-3xl font-serif text-stone-900 font-bold my-1.5">
            {stories.length}
          </p>
          <p className="text-xs text-stone-500">
            Target 5–8 anchor stories for senior loops
          </p>
        </div>

        {/* Metric 2: Competency Coverage */}
        <div className="bg-white border border-[#EBE8E3] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Competency Coverage</span>
            <Target className="w-4 h-4 text-indigo-700" />
          </div>
          <div className="flex items-baseline gap-2 my-1.5">
            <span className="text-3xl font-serif text-stone-900 font-bold">
              {coverageAnalysis.coveragePercent}%
            </span>
            <span className="text-xs text-stone-500 font-sans">
              ({coverageAnalysis.coveredCount}/{MASTER_COMPETENCIES.length} LPs)
            </span>
          </div>
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${coverageAnalysis.coveragePercent}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Critical Blind Spots */}
        <div className="bg-white border border-[#EBE8E3] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Uncovered Blind Spots</span>
            <AlertTriangle className={`w-4 h-4 ${coverageAnalysis.blindSpotCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
          </div>
          <p className="text-3xl font-serif text-stone-900 font-bold my-1.5">
            {coverageAnalysis.blindSpotCount}
          </p>
          <p className="text-xs text-stone-500">
            {coverageAnalysis.blindSpotCount > 0
              ? 'Principles without mapped stories'
              : '100% full leadership coverage!'}
          </p>
        </div>

        {/* Metric 4: Interviewing Stage Target Companies */}
        <div className="bg-white border border-[#EBE8E3] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Interviewing Companies</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-serif text-stone-900 font-bold my-1.5">
            {interviewingCompanies.length}
          </p>
          <p className="text-xs text-stone-500 truncate">
            {interviewingCompanies.map((c) => c.company).join(', ') || 'Active pipeline applications'}
          </p>
        </div>
      </div>

      {/* TAB 1: STORY VAULT DIRECTORY */}
      {activeTab === 'stories' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stories by metric, tech stack, or situation..."
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#0F4A3E]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Competency Filter */}
              <select
                value={selectedCompetencyFilter}
                onChange={(e) => setSelectedCompetencyFilter(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-hidden"
              >
                <option value="all">All Competencies ({MASTER_COMPETENCIES.length})</option>
                {MASTER_COMPETENCIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.frameworkLabel}: {c.name}
                  </option>
                ))}
              </select>

              {/* Company Filter */}
              <select
                value={selectedCompanyFilter}
                onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-hidden"
              >
                <option value="all">All Companies</option>
                {interviewingCompanies.map((a) => (
                  <option key={a.id} value={a.id}>
                    Active Interview: {a.company}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stories List */}
          {filteredStories.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                No matching stories found
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Try resetting your filters, or create a new STAR story to cover this leadership competency.
              </p>
              <button
                onClick={() => handleOpenNewStory()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F4A3E] text-white text-xs font-semibold transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New STAR Story</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {filteredStories.map((story) => {
                const mappedCompetencies = MASTER_COMPETENCIES.filter((c) =>
                  story.targetCompetencies.includes(c.id)
                );

                return (
                  <div
                    key={story.id}
                    className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs hover:border-emerald-700/40 transition-all space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif text-lg font-bold text-stone-900">
                            {story.title}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                            {story.strengthScore}% Bar-Raiser Ready
                          </span>
                          {story.practiceCount > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200 flex items-center gap-1">
                              <Flame className="w-3 h-3 text-blue-500" />
                              <span>Practiced {story.practiceCount}x</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-stone-500 font-medium">
                          {story.companyContext} · {story.roleContext} ({story.timeframe})
                        </p>
                      </div>

                      {/* Top Action Buttons */}
                      <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                        <button
                          onClick={() => setTeleprompterStory(story)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                        >
                          <Mic className="w-3.5 h-3.5 text-emerald-700" />
                          <span>90s Verbal Script</span>
                        </button>

                        <button
                          onClick={() => handleOpenDrill(story)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-900 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>AI Pressure Drill</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditingStory(story);
                            setIsEditorOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
                          title="Edit Story"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteStory(story.id)}
                          className="p-1.5 rounded-lg border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Delete Story"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Opening Hook Soundbite */}
                    {story.hookSoundbite && (
                      <div className="p-3.5 rounded-xl bg-gradient-to-r from-stone-50 to-emerald-50/30 border border-stone-200/80 flex items-start gap-3">
                        <Sparkles className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                            15-Second Opening Hook
                          </p>
                          <p className="text-xs text-stone-800 italic mt-0.5 leading-relaxed font-serif">
                            "{story.hookSoundbite}"
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopy(story.hookSoundbite, `hook-${story.id}`)}
                          className="text-stone-400 hover:text-stone-700 p-1 rounded-md"
                          title="Copy Hook"
                        >
                          {copiedField === `hook-${story.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Quantified Metrics Chips */}
                    {story.quantifiedMetrics && story.quantifiedMetrics.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-stone-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>Metrics:</span>
                        </span>
                        {story.quantifiedMetrics.map((metric, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-2xs font-mono"
                          >
                            {metric}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* STAR Breakdown Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                      {/* S: Situation */}
                      <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                            S · Situation
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">15%</span>
                        </div>
                        <p className="text-xs text-stone-700 leading-relaxed">
                          {story.situation}
                        </p>
                      </div>

                      {/* T: Task */}
                      <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">
                            T · Task (Ownership)
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">15%</span>
                        </div>
                        <p className="text-xs text-stone-700 leading-relaxed">
                          {story.task}
                        </p>
                      </div>

                      {/* A: Action */}
                      <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                            A · Action (Execution)
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">50%</span>
                        </div>
                        <p className="text-xs text-stone-700 leading-relaxed">
                          {story.action}
                        </p>
                      </div>

                      {/* R: Result */}
                      <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                            R · Result (Quantified)
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">20%</span>
                        </div>
                        <p className="text-xs text-stone-700 leading-relaxed">
                          {story.result}
                        </p>
                      </div>
                    </div>

                    {/* Competency Pills Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-stone-400 font-medium">Mapped Principles:</span>
                        {mappedCompetencies.map((c) => (
                          <span
                            key={c.id}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-semibold border border-stone-200"
                          >
                            {c.frameworkLabel}: {c.name}
                          </span>
                        ))}
                      </div>

                      {story.whatIdDoDifferently && (
                        <p className="text-[11px] text-stone-500 italic max-w-md truncate">
                          <strong>Reflection:</strong> {story.whatIdDoDifferently}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPETENCY COVERAGE MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-stone-900 tracking-tight">
              FAANG & Tier-1 Leadership Principles Heatmap
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Top tech companies evaluate you against specific core values. Green indicates adequate coverage (2+ stories), amber indicates minimal coverage (1 story), and red indicates a dangerous blind spot!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {MASTER_COMPETENCIES.map((competency) => {
                const mappedStories = coverageAnalysis.map.get(competency.id) || [];
                const count = mappedStories.length;

                const statusColor =
                  count >= 2
                    ? 'border-emerald-300 bg-emerald-50/40 text-emerald-950'
                    : count === 1
                    ? 'border-amber-300 bg-amber-50/40 text-amber-950'
                    : 'border-rose-300 bg-rose-50/30 text-rose-950';

                const badge =
                  count >= 2 ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                      Strong ({count} Stories)
                    </span>
                  ) : count === 1 ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                      Minimal ({count} Story)
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-300">
                      Blind Spot (0 Stories)
                    </span>
                  );

                return (
                  <div
                    key={competency.id}
                    className={`p-5 rounded-2xl border transition-all space-y-3 ${statusColor}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-sans">
                          {competency.frameworkLabel}
                        </span>
                        <h3 className="font-serif font-bold text-base text-stone-900">
                          {competency.name}
                        </h3>
                      </div>
                      {badge}
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {competency.description}
                    </p>

                    {/* Typical Question Sample */}
                    <div className="pt-2 border-t border-stone-200/50">
                      <p className="text-[10px] font-semibold text-stone-400 uppercase">
                        Typical Interviewer Question:
                      </p>
                      <p className="text-xs text-stone-700 italic mt-0.5">
                        "{competency.typicalQuestions[0]}"
                      </p>
                    </div>

                    {/* Mapped Stories Chips or Quick Add */}
                    <div className="pt-2 flex items-center justify-between gap-2">
                      {count > 0 ? (
                        <div className="space-y-1 w-full">
                          <p className="text-[10px] text-stone-400 font-semibold">Mapped Anchor Stories:</p>
                          <div className="flex flex-col gap-1">
                            {mappedStories.map((s) => (
                              <button
                                key={s.id}
                                onClick={() => {
                                  setSelectedCompetencyFilter(competency.id);
                                  setActiveTab('stories');
                                }}
                                className="text-left text-xs font-semibold text-emerald-900 hover:underline truncate"
                              >
                                • {s.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenNewStory(competency.id)}
                          className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Generate Story for this LP</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DUAL-MONITOR INTERVIEW DAY SCREEN */}
      {activeTab === 'cheatsheet' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-stone-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="font-serif text-base font-bold text-white">
                  Dual-Monitor Virtual Interview Mode
                </h2>
                <p className="text-xs text-stone-400">
                  Keep this high-contrast screen open on your second monitor or iPad during virtual interview loops.
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-emerald-400 font-semibold">
              LIVE CHEAT SHEET
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-stone-900 border border-stone-800 rounded-2xl p-5 text-stone-100 shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between gap-2 border-b border-stone-800 pb-2">
                  <div>
                    <h3 className="font-serif text-base font-bold text-emerald-400">
                      {story.title}
                    </h3>
                    <p className="text-[11px] text-stone-400 font-mono">
                      {story.companyContext} · {story.roleContext}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(story.spokenPitch90s, `pitch-${story.id}`)}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === `pitch-${story.id}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy 90s</span>
                  </button>
                </div>

                {/* Soundbite Hook */}
                <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    Opening Hook (15s):
                  </p>
                  <p className="text-xs text-stone-200 italic mt-0.5 font-serif">
                    "{story.hookSoundbite}"
                  </p>
                </div>

                {/* Metrics */}
                <div className="flex flex-wrap gap-1.5">
                  {story.quantifiedMetrics.map((m, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-bold"
                    >
                      {m}
                    </span>
                  ))}
                </div>

                {/* Quick STAR Bullets */}
                <div className="space-y-1.5 text-xs text-stone-300 leading-snug">
                  <p>
                    <strong className="text-amber-400">S:</strong> {story.situation}
                  </p>
                  <p>
                    <strong className="text-indigo-400">T:</strong> {story.task}
                  </p>
                  <p>
                    <strong className="text-emerald-400">A:</strong> {story.action}
                  </p>
                  <p>
                    <strong className="text-blue-400">R:</strong> {story.result}
                  </p>
                </div>

                {/* Follow-up reflection */}
                {story.whatIdDoDifferently && (
                  <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-400">
                    <strong className="text-stone-300">"What I'd do differently":</strong> {story.whatIdDoDifferently}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: STAR STORY POLISHER & EDITOR */}
      {isEditorOpen && editingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-900">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-900">
                    {editingStory.title ? 'Edit STAR Story' : 'New Anchor STAR Story'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Gemini 3.8 Flash transforms messy project memories into Amazon & Google Bar-Raiser gold.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metadata Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Story Title
                </label>
                <input
                  type="text"
                  value={editingStory.title || ''}
                  onChange={(e) =>
                    setEditingStory((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. Distributed Checkout Latency Optimization"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0F4A3E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={editingStory.companyContext || ''}
                  onChange={(e) =>
                    setEditingStory((prev) => ({ ...prev, companyContext: e.target.value }))
                  }
                  placeholder="e.g. Haronex Technology"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Role Title & Timeline
                </label>
                <input
                  type="text"
                  value={editingStory.roleContext || ''}
                  onChange={(e) =>
                    setEditingStory((prev) => ({ ...prev, roleContext: e.target.value }))
                  }
                  placeholder="e.g. MERN Stack Developer (2026)"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                />
              </div>
            </div>

            {/* Target Competencies Selector */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Target Leadership Principles & Competencies (Select 2-4)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-stone-50 border border-stone-200">
                {MASTER_COMPETENCIES.map((comp) => {
                  const isSelected = editingStory.targetCompetencies?.includes(comp.id);
                  return (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => {
                        const current = editingStory.targetCompetencies || [];
                        const updated = isSelected
                          ? current.filter((c) => c !== comp.id)
                          : [...current, comp.id];
                        setEditingStory((prev) => ({ ...prev, targetCompetencies: updated }));
                      }}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0F4A3E] text-white border-[#0F4A3E]'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {comp.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Raw Notes / Brain Dump Box with Polish Trigger */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-300/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>Raw Notes or Project Memory</span>
                </span>
                <button
                  type="button"
                  onClick={handlePolishWithGemini}
                  disabled={isPolishing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isPolishing ? 'Polishing with Gemini...' : 'Polish Story with Gemini'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={editingStory.rawNotes || ''}
                onChange={(e) =>
                  setEditingStory((prev) => ({ ...prev, rawNotes: e.target.value }))
                }
                placeholder="Paste messy bullet points, Jira ticket description, or project reflection. Gemini will structure it into a quantified, rigorous STAR story..."
                className="w-full p-3 bg-white border border-amber-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-hidden"
              />
            </div>

            {/* Detailed STAR Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  Situation (Context, Commercial Stakes, Constraints — ~15%)
                </label>
                <textarea
                  rows={2}
                  value={editingStory.situation || ''}
                  onChange={(e) =>
                    setEditingStory((prev) => ({ ...prev, situation: e.target.value }))
                  }
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-900 mb-1">
                  Task (Your Personal Responsibility & Ownership — ~15%)
                </label>
                <textarea
                  rows={2}
                  value={editingStory.task || ''}
                  onChange={(e) =>
                    setEditingStory((prev) => ({ ...prev, task: e.target.value }))
                  }
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  Action (Technical Decisions, Trade-Offs, Obstacles Overcome — ~50%)
                </label>
                <textarea
                  rows={3}
                  value={editingStory.action || ''}
                  onChange={(e) =>
                    setEditingStory((prev) => ({ ...prev, action: e.target.value }))
                  }
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-900 mb-1">
                  Result (Quantified Impact: Latency %, Volume, User Growth — ~20%)
                </label>
                <textarea
                  rows={2}
                  value={editingStory.result || ''}
                  onChange={(e) =>
                    setEditingStory((prev) => ({ ...prev, result: e.target.value }))
                  }
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  15-Second Opening Hook Soundbite
                </label>
                <input
                  type="text"
                  value={editingStory.hookSoundbite || ''}
                  onChange={(e) =>
                    setEditingStory((prev) => ({ ...prev, hookSoundbite: e.target.value }))
                  }
                  placeholder="One sentence that hooks the interviewer before you dive into the STAR details"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Follow-Up Reflection: "Looking back, what would you do differently?"
                </label>
                <input
                  type="text"
                  value={editingStory.whatIdDoDifferently || ''}
                  onChange={(e) =>
                    setEditingStory((prev) => ({ ...prev, whatIdDoDifferently: e.target.value }))
                  }
                  placeholder="Demonstrates intellectual humility and post-mortem maturity"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveStory}
                className="px-5 py-2 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Save STAR Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: 90-SECOND VERBAL SCRIPT TELEPROMPTER */}
      {teleprompterStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-emerald-700" />
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  90-Second Verbal Script
                </h3>
              </div>
              <button
                onClick={() => setTeleprompterStory(null)}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="font-serif font-bold text-sm text-stone-900">
                {teleprompterStory.title}
              </h4>
              <p className="text-xs text-stone-500">
                Formatted for natural, conversational pacing (~130 words/minute). Do not sound like you are reciting a memorized script.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 text-sm leading-relaxed font-serif whitespace-pre-wrap max-h-80 overflow-y-auto">
              {teleprompterStory.spokenPitch90s ||
                `${teleprompterStory.situation}\n\nMy responsibility was: ${teleprompterStory.task}\n\nI executed this by: ${teleprompterStory.action}\n\nAs a result: ${teleprompterStory.result}`}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-stone-400">
                Word Count: ~{(teleprompterStory.spokenPitch90s || '').split(/\s+/).length} words
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleCopy(teleprompterStory.spokenPitch90s, 'pitch-modal')
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold cursor-pointer"
                >
                  {copiedField === 'pitch-modal' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy Verbal Script</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: BAR-RAISER INTERROGATION PRESSURE DRILL */}
      {activeDrillStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500 text-stone-900">
                  <Zap className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    AI Bar-Raiser Interrogator Drill
                  </h3>
                  <p className="text-xs text-stone-500">
                    Rigorous follow-up pressure test on "{activeDrillStory.title}"
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDrillStory(null)}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingDrills ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-stone-600 font-semibold">
                  Generating adversarial Bar-Raiser follow-up probes with Gemini 3.8 Flash...
                </p>
              </div>
            ) : drillQuestions.length === 0 ? (
              <p className="text-xs text-stone-500">No drill questions available.</p>
            ) : (
              <div className="space-y-5">
                {/* Question Selector Tabs */}
                <div className="flex gap-2 border-b border-stone-200 pb-2">
                  {drillQuestions.map((q, idx) => (
                    <button
                      key={q.id || idx}
                      onClick={() => {
                        setSelectedDrillIndex(idx);
                        setUserDefenseInput(q.userDefense || '');
                        setDefenseEvaluation(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedDrillIndex === idx
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      Probe #{idx + 1}
                    </button>
                  ))}
                </div>

                {/* Current Active Question */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                      Adversarial Question #{selectedDrillIndex + 1}
                    </span>
                    <span className="text-[10px] text-amber-800 font-mono">
                      Bar-Raiser Follow-Up
                    </span>
                  </div>
                  <p className="text-sm font-serif font-bold text-stone-900 leading-snug">
                    "{drillQuestions[selectedDrillIndex]?.question}"
                  </p>
                  <p className="text-xs text-stone-600 italic">
                    <strong>Interviewer Trap:</strong> {drillQuestions[selectedDrillIndex]?.interviewerIntent}
                  </p>
                </div>

                {/* Candidate Defense Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700">
                      Your Defense (Use "I", cite specific metrics & operational mechanisms)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (drillQuestions[selectedDrillIndex]?.userDefense) {
                          setUserDefenseInput(drillQuestions[selectedDrillIndex].userDefense || '');
                        }
                      }}
                      className="text-[11px] font-semibold text-emerald-800 hover:underline"
                    >
                      Fill Strong Model Answer
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={userDefenseInput}
                    onChange={(e) => setUserDefenseInput(e.target.value)}
                    placeholder="Type how you would defend your technical decisions, prove data validity, or explain conflict resolution..."
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#0F4A3E]"
                  />
                </div>

                {/* Submit Defense for Evaluation */}
                <div className="flex justify-end">
                  <button
                    onClick={handleEvaluateDefense}
                    disabled={isEvaluatingDefense || !userDefenseInput.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isEvaluatingDefense ? 'Grading Defense...' : 'Audit My Defense with Gemini'}</span>
                  </button>
                </div>

                {/* Defense Evaluation Results */}
                {defenseEvaluation && (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-md bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                        <h4 className="font-serif font-bold text-sm text-stone-900">
                          Bar-Raiser Verdict: {defenseEvaluation.verdict}
                        </h4>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Score: {defenseEvaluation.score}/100
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <p className="font-bold text-emerald-900">Strengths Detected:</p>
                        <ul className="list-disc list-inside text-stone-600 space-y-0.5">
                          {defenseEvaluation.strengths?.map((s: string, i: number) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <p className="font-bold text-amber-900">Risk Points / Gaps:</p>
                        <ul className="list-disc list-inside text-stone-600 space-y-0.5">
                          {defenseEvaluation.riskPoints?.map((r: string, i: number) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {defenseEvaluation.suggestedRefinement && (
                      <div className="pt-2 border-t border-stone-200">
                        <p className="text-[11px] font-bold text-stone-700">
                          Suggested Refinement:
                        </p>
                        <p className="text-xs text-stone-600 italic mt-0.5">
                          "{defenseEvaluation.suggestedRefinement}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
