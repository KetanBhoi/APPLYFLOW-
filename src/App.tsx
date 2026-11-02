/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  JobApplication,
  StandingRule,
  UserProfile,
  VibePlan,
  ApplicationStatus
} from './types/job';
import {
  INITIAL_APPLICATIONS,
  INITIAL_RULES,
  INITIAL_PROFILE,
  INITIAL_PLAN
} from './data/initialData';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { GeminiChatbot } from './components/GeminiChatbot';
import { AIEvaluationLab } from './components/AIEvaluationLab';
import { SystemDesignStudio } from './components/SystemDesignStudio';
import { FollowUpReminderHub } from './components/FollowUpReminderHub';
import { JobClipperModal } from './components/JobClipperModal';
import { AchievementBadges } from './components/AchievementBadges';
import { WelcomeBanner } from './components/WelcomeBanner';
import { PipelineBoard } from './components/PipelineBoard';
import { JobScanner } from './components/JobScanner';
import { StandingRulesLab } from './components/StandingRulesLab';
import { PlanAndBlueprint } from './components/PlanAndBlueprint';
import { ProfileSettings } from './components/ProfileSettings';
import { ApplicationDetailModal } from './components/ApplicationDetailModal';
import { NewJobModal } from './components/NewJobModal';
import { ExportModal } from './components/ExportModal';
import { ResumeTailorStudio } from './components/ResumeTailorStudio';
import { MockInterviewerSimulator } from './components/MockInterviewerSimulator';
import { OfferNegotiationStudio } from './components/OfferNegotiationStudio';
import { CompanyResearchModal } from './components/CompanyResearchModal';
import { ExecutiveDossierModal } from './components/ExecutiveDossierModal';
import { InterviewDebriefModal } from './components/InterviewDebriefModal';
import { AtsKeywordGapModal } from './components/AtsKeywordGapModal';
import { LinkedInWarmOutreachHub } from './components/LinkedInWarmOutreachHub';
import { StarStoryVaultHub } from './components/StarStoryVaultHub';
import { TechnicalCodeLab } from './components/TechnicalCodeLab';
import { SalaryAnalyticsHub } from './components/SalaryAnalyticsHub';
import { checkServerHealth } from './services/geminiService';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Menu, X } from 'lucide-react';

type UserPersona = 'fulltime' | 'internship' | 'student_org';

function ApplyFlowApp() {
  // Persistence state
  const [applications, setApplications] = useState<JobApplication[]>(() => {
    try {
      const saved = localStorage.getItem('applyflow_apps');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasOldLinear = parsed.some((a) => a.company === 'Linear');
          if (!hasOldLinear) {
            const existingIds = new Set(parsed.map((a: JobApplication) => a.id));
            const newInitials = INITIAL_APPLICATIONS.filter((a) => !existingIds.has(a.id));
            return [...parsed, ...newInitials];
          }
        }
      }
      return INITIAL_APPLICATIONS;
    } catch {
      return INITIAL_APPLICATIONS;
    }
  });

  const [standingRules, setStandingRules] = useState<StandingRule[]>(() => {
    try {
      const saved = localStorage.getItem('applyflow_rules');
      return saved ? JSON.parse(saved) : INITIAL_RULES;
    } catch {
      return INITIAL_RULES;
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('applyflow_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.fullName && parsed.fullName !== 'Alex Chen') {
          return parsed;
        }
      }
      return INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  });

  const [plan, setPlan] = useState<VibePlan>(() => {
    try {
      const saved = localStorage.getItem('applyflow_plan');
      return saved ? JSON.parse(saved) : INITIAL_PLAN;
    } catch {
      return INITIAL_PLAN;
    }
  });

  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('applyflow_welcome_dismissed');
      return saved !== 'true';
    } catch {
      return false;
    }
  });

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedPersona, setSelectedPersona] = useState<UserPersona>('fulltime');
  const [apiHealth, setApiHealth] = useState({ status: 'checking', hasApiKey: false });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals state
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [newJobDefaultStatus, setNewJobDefaultStatus] = useState<ApplicationStatus>('wishlist');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCompanyDossierApp, setShowCompanyDossierApp] = useState<JobApplication | null>(null);
  const [mockInterviewApp, setMockInterviewApp] = useState<JobApplication | null>(null);
  const [showJobClipperModal, setShowJobClipperModal] = useState(false);
  const [clippedJobData, setClippedJobData] = useState<{ company?: string; role?: string; description?: string; salary?: string; location?: string } | undefined>(undefined);
  const [showExecutiveDossierApp, setShowExecutiveDossierApp] = useState<JobApplication | null>(null);
  const [showInterviewDebriefApp, setShowInterviewDebriefApp] = useState<JobApplication | null>(null);
  const [showAtsGapMatrixApp, setShowAtsGapMatrixApp] = useState<JobApplication | null>(null);
  const [warmOutreachTargetAppId, setWarmOutreachTargetAppId] = useState<string | undefined>(undefined);

  // Sync state to LocalStorage
  // Prevent background scrolling on mobile when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      const scrollY = window.scrollY;
      const originalBodyOverscroll = document.body.style.overscrollBehavior;
      const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior;
      const originalBodyOverscrollY = document.body.style.overscrollBehaviorY;
      const originalHtmlOverscrollY = document.documentElement.style.overscrollBehaviorY;

      // Specifically check and disable overscroll-behavior on body and html elements
      if (document.body.style.overscrollBehavior !== 'none') {
        document.body.style.overscrollBehavior = 'none';
      }
      if (document.documentElement.style.overscrollBehavior !== 'none') {
        document.documentElement.style.overscrollBehavior = 'none';
      }
      document.body.style.overscrollBehaviorY = 'none';
      document.documentElement.style.overscrollBehaviorY = 'none';

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.style.overscrollBehavior = originalBodyOverscroll;
        document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;
        document.body.style.overscrollBehaviorY = originalBodyOverscrollY;
        document.documentElement.style.overscrollBehaviorY = originalHtmlOverscrollY;
        window.scrollTo(0, scrollY);
      };
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    try {
      localStorage.setItem('applyflow_apps', JSON.stringify(applications));
    } catch (e) {
      console.warn('Failed to save applications to localStorage', e);
    }
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem('applyflow_rules', JSON.stringify(standingRules));
    } catch (e) {
      console.warn('Failed to save rules to localStorage', e);
    }
  }, [standingRules]);

  useEffect(() => {
    try {
      localStorage.setItem('applyflow_profile', JSON.stringify(userProfile));
    } catch (e) {
      console.warn('Failed to save profile to localStorage', e);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('applyflow_plan', JSON.stringify(plan));
    } catch (e) {
      console.warn('Failed to save plan to localStorage', e);
    }
  }, [plan]);

  // Check health on load
  useEffect(() => {
    checkServerHealth().then((res) => {
      setApiHealth({ status: res.status, hasApiKey: res.hasApiKey });
    });
  }, []);

  const { user, syncApplicationsToCloud, fetchApplicationsFromCloud } = useAuth();

  // Cloud sync on user authentication
  useEffect(() => {
    if (user) {
      fetchApplicationsFromCloud().then((cloudApps) => {
        if (cloudApps && cloudApps.length > 0) {
          setApplications(cloudApps);
        } else {
          syncApplicationsToCloud(applications);
        }
      });
    }
  }, [user]);

  // Sync back to cloud when applications change for logged-in user
  useEffect(() => {
    if (user && applications.length > 0) {
      syncApplicationsToCloud(applications);
    }
  }, [applications, user]);

  const handleDismissWelcome = () => {
    setShowWelcome(false);
    try {
      localStorage.setItem('applyflow_welcome_dismissed', 'true');
    } catch (e) {
      console.warn(e);
    }
  };

  // Handlers for Applications
  const handleUpdateStatus = (id: string, newStatus: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;
        const todayDate = new Date().toISOString().split('T')[0];
        const eventType: 'applied' | 'interview' | 'status_change' =
          newStatus === 'applied' ? 'applied' : newStatus === 'interviewing' ? 'interview' : 'status_change';
        const newTimelineEvent = {
          id: `act-st-${Date.now()}`,
          type: eventType,
          date: todayDate,
          description: `Moved to ${newStatus} status`
        };
        const existingTimeline = app.activityTimeline || [];
        return {
          ...app,
          status: newStatus,
          appliedDate: newStatus === 'applied' && !app.appliedDate ? todayDate : app.appliedDate,
          followUpDate:
            newStatus === 'applied' && !app.followUpDate
              ? new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              : app.followUpDate,
          updatedAt: new Date().toISOString(),
          activityTimeline: [newTimelineEvent, ...existingTimeline]
        };
      })
    );
  };

  const handleDeleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    if (selectedApp?.id === id) {
      setSelectedApp(null);
    }
  };

  const handleUpdateApplication = (updated: JobApplication) => {
    setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setSelectedApp(updated);
  };

  const handleAddApplication = (newApp: JobApplication) => {
    const todayDate = new Date().toISOString().split('T')[0];
    const enrichedApp: JobApplication = {
      ...newApp,
      activityTimeline: newApp.activityTimeline || [
        {
          id: `act-new-${Date.now()}`,
          type: newApp.status === 'applied' ? 'applied' : 'created',
          date: todayDate,
          description: newApp.status === 'applied' ? 'Submitted application' : 'Added opportunity to pipeline'
        }
      ]
    };
    setApplications((prev) => [enrichedApp, ...prev]);
  };

  // Handlers for Standing Rules
  const handleToggleRule = (id: string) => {
    setStandingRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleAddRule = (newRule: Omit<StandingRule, 'id' | 'timesEnforced'>) => {
    const created: StandingRule = {
      ...newRule,
      id: `rule-${Date.now()}`,
      timesEnforced: 0
    };
    setStandingRules((prev) => [...prev, created]);
  };

  const handleDeleteRule = (id: string) => {
    setStandingRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleResetRules = () => {
    setStandingRules(INITIAL_RULES);
  };

  // Persona quick-switch
  const handleSelectPersona = (persona: UserPersona) => {
    setSelectedPersona(persona);
    if (persona === 'internship') {
      setUserProfile((prev) => ({
        ...prev,
        currentRole: 'Computer Science Undergraduate',
        targetSalary: '$35 - $50/hour',
        headline: 'Aspiring Software Engineering Intern | React, TypeScript & Data Structures'
      }));
    } else if (persona === 'student_org') {
      setUserProfile((prev) => ({
        ...prev,
        currentRole: 'Student Org Tech Lead / Project Coordinator',
        targetSalary: '$25 - $35/hour or Volunteer',
        headline: 'Campus Tech Lead | Event Automation, Google Sheets to Web Apps, Mentorship'
      }));
    } else {
      setUserProfile(INITIAL_PROFILE);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FBFBFA] text-stone-900 flex flex-col md:flex-row antialiased">
      {/* Mobile Topbar */}
      <header className="sticky top-0 z-30 md:hidden flex items-center justify-between px-4 py-3 bg-[#FAF9F7]/95 backdrop-blur-md border-b border-[#EBE8E3] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0F4A3E] flex items-center justify-center text-white shrink-0 shadow-xs">
            <svg
              className="w-4 h-4 text-emerald-200"
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
            <span className="font-serif font-bold text-base text-stone-900 block leading-tight">ApplyFlow</span>
            <span className="text-[10px] text-stone-500 font-mono">Job Command Center</span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 cursor-pointer transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <div
        className={`fixed inset-y-0 left-0 z-50 md:sticky md:top-0 md:h-screen md:z-20 transform transition-transform duration-300 ease-in-out md:transform-none ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setIsMobileMenuOpen(false);
          }}
          onOpenNewJob={() => {
            setNewJobDefaultStatus('wishlist');
            setShowNewJobModal(true);
            setIsMobileMenuOpen(false);
          }}
          onOpenJobClipper={() => {
            setShowJobClipperModal(true);
            setIsMobileMenuOpen(false);
          }}
          activeRulesCount={standingRules.filter((r) => r.enabled).length}
          totalApplicationsCount={applications.length}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />
      </div>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          onTouchStart={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-40 md:hidden touch-none overscroll-none"
        />
      )}

      {/* Main Container */}
      <main className="flex-1 min-w-0 w-full max-w-full p-4 sm:p-6 lg:p-10 overflow-y-auto overflow-x-hidden">
        {/* Tab 0: Dashboard (Exact Screenshot match) */}
        {currentTab === 'dashboard' && (
          <DashboardView
            applications={applications}
            userProfile={userProfile}
            onStartNewAnalysis={() => setCurrentTab('scanner')}
            onNavigateToResume={() => setCurrentTab('resume')}
            onSelectApplication={setSelectedApp}
            onNavigateToPipeline={() => setCurrentTab('pipeline')}
            onNavigateToReminders={() => setCurrentTab('reminders')}
            onNavigateToOffers={() => setCurrentTab('offers')}
            onNavigateToWarmOutreach={() => setCurrentTab('warm-outreach')}
            onNavigateToStarVault={() => setCurrentTab('star-vault')}
            onNavigateToCodeStudio={() => setCurrentTab('code-studio')}
            onNavigateToSalaryAnalytics={() => setCurrentTab('salary-analytics')}
            onOpenJobClipper={() => setShowJobClipperModal(true)}
          />
        )}

        {/* Tab 0.2: Salary Analytics & Comp Visualization Hub (D3 & Recharts) */}
        {currentTab === 'salary-analytics' && (
          <SalaryAnalyticsHub
            applications={applications}
            userProfile={userProfile}
            onSelectApplication={setSelectedApp}
            onNavigateToOffers={() => setCurrentTab('offers')}
            onNavigateToPipeline={() => setCurrentTab('pipeline')}
          />
        )}

        {/* Tab 0.5: Gemini Career Coach Multi-Turn Chatbot */}
        {currentTab === 'chat' && (
          <GeminiChatbot
            userProfile={userProfile}
            standingRules={standingRules}
          />
        )}

        {/* Tab 0.7: AI Model Evaluation & Prompt Benchmark Lab */}
        {currentTab === 'ai-lab' && (
          <AIEvaluationLab
            onNavigateToApplications={() => setCurrentTab('pipeline')}
          />
        )}

        {/* Tab 0.8: System Design Scalability Studio */}
        {currentTab === 'system-design' && (
          <SystemDesignStudio />
        )}

        {/* Tab 0.9: Technical Code Lab & Take-Home Studio */}
        {currentTab === 'code-studio' && (
          <TechnicalCodeLab
            applications={applications}
            userProfile={userProfile}
            onSelectApplicationForDetail={setSelectedApp}
          />
        )}

        {/* Tab 1: Pipeline Board */}
        {currentTab === 'pipeline' && (
          <PipelineBoard
            applications={applications}
            onSelectApplication={setSelectedApp}
            onUpdateStatus={handleUpdateStatus}
            onDeleteApplication={handleDeleteApplication}
            onOpenNewJobModal={(status) => {
              setNewJobDefaultStatus(status || 'wishlist');
              setShowNewJobModal(true);
            }}
            onNavigateToScanner={() => setCurrentTab('scanner')}
            onNavigateToResume={() => setCurrentTab('resume')}
          />
        )}

        {/* Tab 1.2: LinkedIn Warm Outreach & Alumni Assistant */}
        {currentTab === 'warm-outreach' && (
          <LinkedInWarmOutreachHub
            applications={applications}
            userProfile={userProfile}
            standingRules={standingRules}
            onUpdateApplication={handleUpdateApplication}
            onSelectApplicationForDetail={setSelectedApp}
            initialSelectedAppId={warmOutreachTargetAppId}
          />
        )}

        {/* Tab 1.3: FAANG & Tier-1 Behavioral STAR Story Vault */}
        {currentTab === 'star-vault' && (
          <StarStoryVaultHub
            applications={applications}
            userProfile={userProfile}
            standingRules={standingRules}
            onSelectApplication={setSelectedApp}
            onNavigateToInterviewSimulator={(appId) => {
              if (appId) {
                const target = applications.find((a) => a.id === appId);
                if (target) setSelectedApp(target);
              }
              setCurrentTab('interview-simulator');
            }}
          />
        )}

        {/* Tab 1.5: Automated Follow-Up Reminders & Scheduled Cloud Functions */}
        {currentTab === 'reminders' && (
          <FollowUpReminderHub
            applications={applications}
            onUpdateApplication={handleUpdateApplication}
            onNavigateToPipeline={() => setCurrentTab('pipeline')}
          />
        )}

        {/* Tab 2: Job Scanner & Tailor */}
        {currentTab === 'scanner' && (
          <JobScanner
            standingRules={standingRules}
            userProfile={userProfile}
            initialJobData={clippedJobData}
            onOpenJobClipper={() => setShowJobClipperModal(true)}
            onSaveToPipeline={(newApp) => {
              handleAddApplication(newApp);
            }}
            onNavigateToPipeline={() => setCurrentTab('pipeline')}
          />
        )}

        {/* Tab 3: Exact 100% Match Resume Studio */}
        {currentTab === 'resume' && (
          <ResumeTailorStudio
            userProfile={userProfile}
            standingRules={standingRules}
            applications={applications}
            onUpdateProfile={setUserProfile}
          />
        )}

        {/* Tab 4: Live AI Mock Interviewer Simulator */}
        {currentTab === 'interview-simulator' && (
          <MockInterviewerSimulator
            userProfile={userProfile}
            applications={applications}
            initialApp={mockInterviewApp || undefined}
          />
        )}

        {/* Tab 5: Offer Matrix & Salary Negotiation */}
        {currentTab === 'offers' && (
          <OfferNegotiationStudio
            standingRules={standingRules}
          />
        )}

        {/* Tab 6: Standing Rules Lab */}
        {currentTab === 'rules' && (
          <StandingRulesLab
            rules={standingRules}
            onToggleRule={handleToggleRule}
            onAddRule={handleAddRule}
            onDeleteRule={handleDeleteRule}
            onResetRules={handleResetRules}
          />
        )}

        {/* Tab 7: Achievement Badges */}
        {currentTab === 'badges' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="pb-2 border-b border-[#EBE8E3]">
              <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
                Achievement Badges
              </h1>
              <p className="text-sm text-stone-500 mt-1">
                Milestones and career velocity breakthroughs earned across your journey.
              </p>
            </div>
            <AchievementBadges
              applications={applications}
              onNavigateToResume={() => setCurrentTab('resume')}
              onNavigateToScanner={() => setCurrentTab('scanner')}
              onOpenNewJobModal={() => {
                setNewJobDefaultStatus('wishlist');
                setShowNewJobModal(true);
              }}
            />
          </div>
        )}

        {/* Tab 8: Plan & Blueprint */}
        {currentTab === 'blueprint' && (
          <PlanAndBlueprint
            plan={plan}
            standingRules={standingRules}
            onUpdatePlan={setPlan}
          />
        )}

        {/* Tab 9: Profile Settings */}
        {currentTab === 'profile' && (
          <ProfileSettings
            profile={userProfile}
            onUpdateProfile={setUserProfile}
          />
        )}
      </main>

      {/* Application Detail Modal / Drawer */}
      {selectedApp && (
        <ApplicationDetailModal
          application={selectedApp}
          standingRules={standingRules}
          userProfile={userProfile}
          onClose={() => setSelectedApp(null)}
          onUpdateApplication={handleUpdateApplication}
          onDeleteApplication={(id) => {
            handleDeleteApplication(id);
            setSelectedApp(null);
          }}
          onOpenTailoredResume={() => {
            setCurrentTab('resume');
            setSelectedApp(null);
          }}
          onOpenMockInterview={(app) => {
            setMockInterviewApp(app);
            setCurrentTab('interview-simulator');
            setSelectedApp(null);
          }}
          onOpenCompanyDossier={(app) => {
            setShowCompanyDossierApp(app);
          }}
          onOpenExecutiveDossier={(app) => {
            setShowExecutiveDossierApp(app);
          }}
          onOpenInterviewDebrief={(app) => {
            setShowInterviewDebriefApp(app);
          }}
          onOpenAtsGapMatrix={(app) => {
            setShowAtsGapMatrixApp(app);
          }}
          onOpenWarmOutreach={(app) => {
            setWarmOutreachTargetAppId(app.id);
            setCurrentTab('warm-outreach');
            setSelectedApp(null);
          }}
        />
      )}

      {/* Executive 30-60-90 Day Strategic Dossier Modal */}
      {showExecutiveDossierApp && (
        <ExecutiveDossierModal
          application={showExecutiveDossierApp}
          userProfile={userProfile}
          standingRules={standingRules}
          onClose={() => setShowExecutiveDossierApp(null)}
          onSaveDossier={(appId, dossier) => {
            const updated = applications.map((a) =>
              a.id === appId
                ? {
                    ...a,
                    executiveDossier: dossier,
                    activityTimeline: [
                      {
                        id: `act-${Date.now()}`,
                        type: 'note_added' as const,
                        date: new Date().toISOString().split('T')[0],
                        description: `Synthesized Executive 30-60-90 Day Dossier`,
                        details: `Milestones and panel alignment blueprint generated.`
                      },
                      ...(a.activityTimeline || [])
                    ],
                    updatedAt: new Date().toISOString()
                  }
                : a
            );
            setApplications(updated);
            if (selectedApp && selectedApp.id === appId) {
              setSelectedApp({ ...selectedApp, executiveDossier: dossier });
            }
          }}
        />
      )}

      {/* Multi-Round Interview Debrief & Question Logger Modal */}
      {showInterviewDebriefApp && (
        <InterviewDebriefModal
          application={showInterviewDebriefApp}
          standingRules={standingRules}
          onClose={() => setShowInterviewDebriefApp(null)}
          onUpdateApplication={(updatedApp) => {
            handleUpdateApplication(updatedApp);
            setShowInterviewDebriefApp(updatedApp);
            if (selectedApp && selectedApp.id === updatedApp.id) {
              setSelectedApp(updatedApp);
            }
          }}
        />
      )}

      {/* ATS Keyword Match Matrix & Gap Studio Modal */}
      {showAtsGapMatrixApp && (
        <AtsKeywordGapModal
          application={showAtsGapMatrixApp}
          userProfile={userProfile}
          onClose={() => setShowAtsGapMatrixApp(null)}
          onInsertBullet={(bulletText) => {
            if (showAtsGapMatrixApp) {
              const updatedApp: JobApplication = {
                ...showAtsGapMatrixApp,
                tailoredBullets: [
                  ...(showAtsGapMatrixApp.tailoredBullets || []),
                  {
                    text: bulletText,
                    targetKeyword: 'ATS Gap Closing',
                    impactType: 'Scale & Performance',
                    rulesFollowed: ['XYZ formula', 'No AI clichés']
                  }
                ],
                updatedAt: new Date().toISOString()
              };
              handleUpdateApplication(updatedApp);
              setShowAtsGapMatrixApp(updatedApp);
              if (selectedApp && selectedApp.id === updatedApp.id) {
                setSelectedApp(updatedApp);
              }
            }
          }}
        />
      )}

      {/* Company Dossier & Reverse Interview Modal */}
      {showCompanyDossierApp && (
        <CompanyResearchModal
          company={showCompanyDossierApp.company}
          jobTitle={showCompanyDossierApp.role}
          jobDescription={showCompanyDossierApp.jobDescription}
          onClose={() => setShowCompanyDossierApp(null)}
        />
      )}

      {/* Quick Add Job Modal */}
      {showNewJobModal && (
        <NewJobModal
          defaultStatus={newJobDefaultStatus}
          onClose={() => setShowNewJobModal(false)}
          onAddApplication={handleAddApplication}
          onOpenScannerWithText={(text) => {
            setCurrentTab('scanner');
          }}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          applications={applications}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* 1-Click Job Posting Clipper Modal */}
      {showJobClipperModal && (
        <JobClipperModal
          isOpen={showJobClipperModal}
          onClose={() => setShowJobClipperModal(false)}
          onSendToScanner={(jobData) => {
            setClippedJobData(jobData);
            setCurrentTab('scanner');
          }}
          onAddToPipeline={(newApp) => {
            handleAddApplication(newApp);
            setCurrentTab('pipeline');
          }}
        />
      )}

      {/* Firebase Authentication Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ApplyFlowApp />
    </AuthProvider>
  );
}
