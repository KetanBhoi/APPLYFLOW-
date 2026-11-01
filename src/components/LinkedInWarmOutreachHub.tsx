import React, { useState, useEffect, useMemo } from 'react';
import {
  JobApplication,
  UserProfile,
  StandingRule,
  WarmLinkedInContact,
  WarmContactAffinity,
  WarmOutreachStatus,
  WarmOutreachMessages
} from '../types/job';
import { generateWarmLinkedInMessage } from '../services/geminiService';
import {
  Users,
  Search,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Clock,
  Calendar,
  Building2,
  GraduationCap,
  Briefcase,
  Share2,
  CheckCircle2,
  MessageSquare,
  Coffee,
  AlertCircle,
  HelpCircle,
  Trash2,
  ArrowRight,
  Send,
  Linkedin,
  Filter,
  RefreshCw,
  X,
  Target,
  Flame,
  Award
} from 'lucide-react';

interface LinkedInWarmOutreachHubProps {
  applications: JobApplication[];
  userProfile: UserProfile;
  standingRules: StandingRule[];
  onUpdateApplication: (app: JobApplication) => void;
  onSelectApplicationForDetail?: (app: JobApplication) => void;
  initialSelectedAppId?: string;
}

// Helper to seed intelligent contacts based on company and candidate profile
function getInitialWarmContactsForApp(app: JobApplication, profile: UserProfile): WarmLinkedInContact[] {
  const company = app.company;
  const school = profile.experienceSnippets?.find((e) => e.includes('B.Tech') || e.includes('University') || e.includes('Institute'))
    ? 'MBIT / CVM University'
    : 'University Alumni Network';

  const defaultContacts: WarmLinkedInContact[] = [
    {
      id: `warm-${app.id}-1`,
      applicationId: app.id,
      company: company,
      name: company === 'Outlier AI' ? 'Arjun Mehta' : company === 'Tata Consultancy Services (TCS)' ? 'Pooja Patel' : 'David Chen',
      title: company === 'Outlier AI' ? 'Lead AI Evaluation Engineer' : company === 'Tata Consultancy Services (TCS)' ? 'Senior Systems Engineer & Campus Alumni' : 'Staff Software Engineer',
      affinity: 'alumni',
      affinityDetail: `Alumni: ${school} (Graduated 2 years prior)`,
      location: company === 'Outlier AI' ? 'Remote (India / US)' : 'Gandhinagar / Ahmedabad',
      linkedInUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company + ' ' + school)}`,
      mutualCount: 3,
      status: 'identified',
      notes: 'Active in engineering alumni group. Frequently comments on distributed systems and AI benchmarks.',
      generatedOutreach: {
        connectionInvite: `Hi ${company === 'Outlier AI' ? 'Arjun' : company === 'Tata Consultancy Services (TCS)' ? 'Pooja' : 'David'}, great to connect with a fellow ${school} alumni! I'm currently interviewing for the ${app.role} role at ${company} and admire your team's engineering craft. Would love to stay connected! —${profile.fullName.split(' ')[0]}`,
        inMailCoffeeChat: `Hi ${company === 'Outlier AI' ? 'Arjun' : company === 'Tata Consultancy Services (TCS)' ? 'Pooja' : 'David'},\n\nI hope you're having a productive week! I came across your profile through our shared ${school} alumni network and wanted to reach out.\n\nI am currently in the interview rounds for the ${app.role} position at ${company}. Given your tenure on the team, I would be deeply grateful for 10 minutes of your perspective on the engineering culture and key technical priorities.\n\nNo pressure at all if your calendar is full, but I would love to connect either way!\n\nBest,\n${profile.fullName}`,
        preInterviewAdviceAsk: `Hi ${company === 'Outlier AI' ? 'Arjun' : company === 'Tata Consultancy Services (TCS)' ? 'Pooja' : 'David'},\n\nI have my upcoming technical interview round for ${app.role} at ${company} this week! As a fellow ${school} alumni, is there any specific principle or engineering quality that ${company} interviewers especially appreciate seeing in candidate responses?\n\nAny quick tip would mean the world. Thank you for your time!\n\nBest,\n${profile.fullName}`
      }
    },
    {
      id: `warm-${app.id}-2`,
      applicationId: app.id,
      company: company,
      name: company === 'Outlier AI' ? 'Dr. Sarah Lin' : company === 'Tata Consultancy Services (TCS)' ? 'Rahul Sharma' : 'Elena Rostova',
      title: company === 'Outlier AI' ? 'Engineering Manager — LLM Safety & Benchmarks' : company === 'Tata Consultancy Services (TCS)' ? 'Digital Practice Technical Lead' : 'Engineering Manager',
      affinity: 'hiring_team',
      affinityDetail: 'Engineering Hiring Manager / Pod Lead',
      location: app.location || 'Remote',
      linkedInUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company + ' ' + app.role + ' manager')}`,
      mutualCount: 1,
      status: 'identified',
      notes: 'Direct hiring manager for this squad. Emphasizes clean code, metrics, and thoughtful trade-off analysis.',
      generatedOutreach: {
        connectionInvite: `Hello ${company === 'Outlier AI' ? 'Sarah' : company === 'Tata Consultancy Services (TCS)' ? 'Rahul' : 'Elena'}, I'm currently interviewing for the ${app.role} position with your team at ${company}. I've followed your work on scalable systems and would be honored to connect! —${profile.fullName.split(' ')[0]}`,
        inMailCoffeeChat: `Hello ${company === 'Outlier AI' ? 'Sarah' : company === 'Tata Consultancy Services (TCS)' ? 'Rahul' : 'Elena'},\n\nI recently advanced to the interview rounds for the ${app.role} role at ${company}.\n\nWith my background in ${profile.skills.slice(0, 3).join(', ')} and focus on reliable architectures, I am deeply impressed by your team's mission. I would welcome the chance to connect on LinkedIn as I prepare for the upcoming stages.\n\nThank you for your time,\n${profile.fullName}`,
        preInterviewAdviceAsk: `Hello ${company === 'Outlier AI' ? 'Sarah' : company === 'Tata Consultancy Services (TCS)' ? 'Rahul' : 'Elena'},\n\nI am thrilled to be interviewing for the ${app.role} role on your team at ${company}. As I prepare for my upcoming round, what is the single most critical challenge your engineering group is focused on solving over the next 6 months?\n\nLooking forward to the conversation,\n${profile.fullName}`
      }
    },
    {
      id: `warm-${app.id}-3`,
      applicationId: app.id,
      company: company,
      name: company === 'Outlier AI' ? 'Vikram Joshi' : company === 'Tata Consultancy Services (TCS)' ? 'Amit Verma' : 'Marcus Vance',
      title: 'Senior Software Engineer (Frontend & APIs)',
      affinity: 'domain_peer',
      affinityDetail: 'Tech Stack Peer (React, Node.js & REST APIs)',
      location: 'Remote / Hybrid',
      linkedInUrl: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company + ' frontend engineer')}`,
      mutualCount: 4,
      status: 'identified',
      notes: 'Peer engineer on the daily development squad. Great contact for understanding sprint cadence and codebase health.'
    }
  ];

  return defaultContacts;
}

export const LinkedInWarmOutreachHub: React.FC<LinkedInWarmOutreachHubProps> = ({
  applications,
  userProfile,
  standingRules,
  onUpdateApplication,
  onSelectApplicationForDetail,
  initialSelectedAppId
}) => {
  // Filter interviewing applications
  const interviewingApps = useMemo(
    () => applications.filter((a) => a.status === 'interviewing'),
    [applications]
  );

  const [filterMode, setFilterMode] = useState<'interviewing' | 'all'>('interviewing');
  const targetAppsList = filterMode === 'interviewing' ? (interviewingApps.length > 0 ? interviewingApps : applications) : applications;

  const [selectedAppId, setSelectedAppId] = useState<string>(
    initialSelectedAppId || targetAppsList[0]?.id || ''
  );

  const selectedApp = applications.find((a) => a.id === selectedAppId) || targetAppsList[0] || applications[0];

  // Warm contacts state for the selected application
  const [contacts, setContacts] = useState<WarmLinkedInContact[]>(() => {
    if (!selectedApp) return [];
    if (selectedApp.warmContacts && selectedApp.warmContacts.length > 0) {
      return selectedApp.warmContacts;
    }
    return getInitialWarmContactsForApp(selectedApp, userProfile);
  });

  // Keep contacts synced when switching selected application
  useEffect(() => {
    if (!selectedApp) return;
    if (selectedApp.warmContacts && selectedApp.warmContacts.length > 0) {
      setContacts(selectedApp.warmContacts);
    } else {
      const generated = getInitialWarmContactsForApp(selectedApp, userProfile);
      setContacts(generated);
      // Persist to app
      onUpdateApplication({
        ...selectedApp,
        warmContacts: generated
      });
    }
  }, [selectedApp?.id]);

  // Drawer / Generator State
  const [activeContactForDrawer, setActiveContactForDrawer] = useState<WarmLinkedInContact | null>(null);
  const [activeMessageType, setActiveMessageType] = useState<'invite' | 'coffee' | 'advice'>('invite');
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New Contact Form Modal
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newAffinity, setNewAffinity] = useState<WarmContactAffinity>('alumni');
  const [newAffinityDetail, setNewAffinityDetail] = useState('');
  const [newLinkedInUrl, setNewLinkedInUrl] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Extract candidate school
  const candidateSchool = useMemo(() => {
    const snip = userProfile.experienceSnippets?.find((e) => e.includes('B.Tech') || e.includes('University') || e.includes('Institute') || e.includes('College'));
    if (snip) {
      if (snip.includes('Madhuben') || snip.includes('MBIT') || snip.includes('CVM')) return 'MBIT CVM University';
      if (snip.includes('Berkeley')) return 'UC Berkeley';
    }
    return 'University Alumni';
  }, [userProfile]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleUpdateContactStatus = (contactId: string, newStatus: WarmOutreachStatus) => {
    const updated = contacts.map((c) => (c.id === contactId ? { ...c, status: newStatus, lastContactDate: new Date().toISOString().split('T')[0] } : c));
    setContacts(updated);
    if (selectedApp) {
      const timelineDesc = `Updated LinkedIn outreach for ${contacts.find((c) => c.id === contactId)?.name}: ${newStatus.replace('_', ' ')}`;
      onUpdateApplication({
        ...selectedApp,
        warmContacts: updated,
        activityTimeline: [
          {
            id: `act-${Date.now()}`,
            type: 'status_change',
            date: new Date().toISOString().split('T')[0],
            description: timelineDesc,
            details: `Status set to: ${newStatus}`
          },
          ...(selectedApp.activityTimeline || [])
        ],
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleDeleteContact = (contactId: string) => {
    const updated = contacts.filter((c) => c.id !== contactId);
    setContacts(updated);
    if (selectedApp) {
      onUpdateApplication({
        ...selectedApp,
        warmContacts: updated,
        updatedAt: new Date().toISOString()
      });
    }
    if (activeContactForDrawer?.id === contactId) {
      setActiveContactForDrawer(null);
    }
  };

  // Generate / Regenerate Outreach Messages for Contact
  const handleGenerateOutreach = async (contact: WarmLinkedInContact) => {
    if (!selectedApp) return;
    setIsGeneratingMessage(true);
    setActiveContactForDrawer(contact);

    try {
      const resp = await generateWarmLinkedInMessage({
        company: selectedApp.company,
        jobTitle: selectedApp.role,
        contactName: contact.name,
        contactTitle: contact.title,
        affinityType: contact.affinity,
        affinityDetail: contact.affinityDetail,
        interviewDate: selectedApp.interviewDate,
        userProfile,
        standingRules: standingRules.filter((r) => r.enabled).map((r) => `${r.title}: ${r.instruction}`)
      });

      const updatedContact: WarmLinkedInContact = {
        ...contact,
        generatedOutreach: resp.result
      };

      const updatedList = contacts.map((c) => (c.id === contact.id ? updatedContact : c));
      setContacts(updatedList);
      setActiveContactForDrawer(updatedContact);

      onUpdateApplication({
        ...selectedApp,
        warmContacts: updatedList,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to generate warm outreach:', err);
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  // Save New Custom Discovered Contact
  const handleSaveNewContact = async () => {
    if (!newName.trim() || !newTitle.trim() || !selectedApp) return;

    const newContactId = `warm-${Date.now()}`;
    const searchUrl =
      newLinkedInUrl.trim() ||
      `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(selectedApp.company + ' ' + newName.trim())}`;

    const newContact: WarmLinkedInContact = {
      id: newContactId,
      applicationId: selectedApp.id,
      company: selectedApp.company,
      name: newName.trim(),
      title: newTitle.trim(),
      affinity: newAffinity,
      affinityDetail: newAffinityDetail.trim() || 'LinkedIn Network Contact',
      linkedInUrl: searchUrl,
      status: 'identified',
      notes: newNotes.trim()
    };

    const updated = [newContact, ...contacts];
    setContacts(updated);
    setShowAddContactModal(false);

    // Reset Form
    setNewName('');
    setNewTitle('');
    setNewAffinityDetail('');
    setNewLinkedInUrl('');
    setNewNotes('');

    // Trigger auto-generation for the newly added contact
    await handleGenerateOutreach(newContact);
  };

  // Search URLs for Selected Company
  const alumniSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
    `${selectedApp?.company || ''} ${candidateSchool}`
  )}`;
  const hiringManagerSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
    `${selectedApp?.company || ''} ${selectedApp?.role || 'engineering'} manager`
  )}`;
  const mutualSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
    `${selectedApp?.company || ''}`
  )}&network=%5B%22S%22%5D`; // 2nd degree network filter code in LinkedIn

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
              <Linkedin className="w-3.5 h-3.5 text-blue-400" />
              <span>LinkedIn Warm Outreach & Alumni Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Warm Connection & Alumni Intelligence
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Identify common alumni, mutual company peers, and tech leads for companies in your{' '}
              <strong className="text-amber-400 font-semibold">'Interviewing'</strong> stage.
              Generate high-conversion, strictly sub-300-character LinkedIn connection notes and pre-interview insider advice inquiries.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {/* Filter Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setFilterMode('interviewing')}
                className={`px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5 ${
                  filterMode === 'interviewing'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Interviewing ({interviewingApps.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                  filterMode === 'all'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>All Pipeline ({applications.length})</span>
              </button>
            </div>

            <button
              onClick={() => setShowAddContactModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Contact</span>
            </button>
          </div>
        </div>
      </div>

      {/* Target Companies Strip (Interviewing Stage Highlighted) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            Target Companies in Scope ({targetAppsList.length})
          </span>
          <span className="text-slate-500">Select a company to discover warm touchpoints</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {targetAppsList.map((app) => {
            const isSelected = app.id === selectedApp?.id;
            const isInterviewing = app.status === 'interviewing';

            return (
              <div
                key={app.id}
                onClick={() => setSelectedAppId(app.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-slate-900 border-blue-500 shadow-md ring-1 ring-blue-500/40'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <h3 className="font-bold text-sm text-white truncate">{app.company}</h3>
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">{app.role}</div>
                  </div>

                  {isInterviewing ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider shrink-0">
                      Interviewing
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] capitalize shrink-0">
                      {app.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 font-mono">
                  {app.interviewDate ? (
                    <span className="flex items-center gap-1 text-amber-400">
                      <Clock className="w-3 h-3" />
                      <span>{app.interviewDate.split('T')[0]}</span>
                    </span>
                  ) : (
                    <span>Fit: {app.fitScore || 85}%</span>
                  )}

                  <span className="text-blue-400 hover:text-blue-300 font-sans font-medium flex items-center gap-0.5">
                    <span>{isSelected ? 'Active' : 'Select'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Company Action Bar & LinkedIn Deep Links */}
      {selectedApp && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Active Target: {selectedApp.company}
                </span>
                {selectedApp.status === 'interviewing' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                    Active Interview Stage
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5 flex items-center gap-2">
                <span>{selectedApp.role}</span>
                <span className="text-slate-500 text-sm font-normal">•</span>
                <span className="text-slate-400 text-sm font-normal">{contacts.length} Warm Contacts Identified</span>
              </h2>
            </div>

            {/* Launchers directly to LinkedIn */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={alumniSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                title={`Search LinkedIn for ${selectedApp.company} employees who attended ${candidateSchool}`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                <span>Search {candidateSchool} Alumni</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href={hiringManagerSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                title={`Search LinkedIn for Tech Leads and Engineering Managers at ${selectedApp.company}`}
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                <span>Find Hiring Managers</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href={mutualSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                title={`Search LinkedIn for 2nd Degree mutual connections at ${selectedApp.company}`}
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>2nd Degree Mutuals</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Warm Contacts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contacts.map((contact) => {
              const isDrawerActive = activeContactForDrawer?.id === contact.id;

              return (
                <div
                  key={contact.id}
                  className={`bg-slate-950 border rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between transition-all ${
                    isDrawerActive
                      ? 'border-blue-500 ring-1 ring-blue-500/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Contact Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {contact.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white truncate">{contact.name}</h4>
                          <p className="text-xs text-slate-400 truncate">{contact.title}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="text-slate-600 hover:text-rose-400 p-1 rounded-lg transition-colors"
                        title="Remove contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Affinity Badge */}
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center gap-1.5">
                        {contact.affinity === 'alumni' ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Common Alumni</span>
                          </span>
                        ) : contact.affinity === 'hiring_team' ? (
                          <span className="flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                            <Target className="w-3.5 h-3.5" />
                            <span>Hiring Squad Lead</span>
                          </span>
                        ) : contact.affinity === 'mutual_company' ? (
                          <span className="flex items-center gap-1 text-blue-400 font-semibold text-[11px]">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Mutual Past Company</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-purple-400 font-semibold text-[11px]">
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Domain Tech Kin</span>
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 text-[11px] leading-snug">{contact.affinityDetail}</p>
                    </div>

                    {contact.notes && (
                      <p className="text-[11px] text-slate-400 italic line-clamp-2">"{contact.notes}"</p>
                    )}
                  </div>

                  {/* Actions & Outreach Launcher */}
                  <div className="pt-3 border-t border-slate-900 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] uppercase font-semibold text-slate-500">Outreach SLA</span>
                      <select
                        value={contact.status}
                        onChange={(e) => handleUpdateContactStatus(contact.id, e.target.value as WarmOutreachStatus)}
                        className="text-[11px] font-semibold bg-slate-900 text-slate-300 border border-slate-800 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="identified">1. Identified</option>
                        <option value="invite_sent">2. Invite Sent</option>
                        <option value="connected">3. Connected</option>
                        <option value="chat_scheduled">4. Chat Booked</option>
                        <option value="advocate_referred">5. Advocate / Referral</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleGenerateOutreach(contact)}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Draft Message</span>
                      </button>

                      <a
                        href={contact.linkedInUrl || alumniSearchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                        <span>Open Search</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {contacts.length === 0 && (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <p>No contacts identified yet for {selectedApp.company}.</p>
              <button
                onClick={() => setShowAddContactModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
              >
                Add Your First Discovered Contact
              </button>
            </div>
          )}
        </div>
      )}

      {/* Live Warm Outreach Message Drawer / Modal */}
      {activeContactForDrawer && (
        <div className="bg-slate-900 border-2 border-blue-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Personalized Warm Outreach Assistant
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Outreach Drafts for {activeContactForDrawer.name} ({activeContactForDrawer.title} at {selectedApp?.company})
              </h3>
              <p className="text-xs text-slate-400">
                Grounding Angle: <strong className="text-slate-200">{activeContactForDrawer.affinityDetail}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGenerateOutreach(activeContactForDrawer)}
                disabled={isGeneratingMessage}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingMessage ? 'animate-spin' : ''}`} />
                <span>Regenerate with Gemini</span>
              </button>
              <button
                onClick={() => setActiveContactForDrawer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {isGeneratingMessage ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400 text-xs text-center">
              <div className="w-8 h-8 rounded-full border-3 border-slate-700 border-t-blue-500 animate-spin" />
              <div>Crafting personalized connection request respecting 300-character LinkedIn limit...</div>
            </div>
          ) : activeContactForDrawer.generatedOutreach ? (
            <div className="space-y-4">
              {/* Message Type Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveMessageType('invite')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeMessageType === 'invite'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn Connection Invite (≤300 Chars)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMessageType('coffee')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeMessageType === 'coffee'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>100-Word InMail / Coffee Chat Pitch</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMessageType('advice')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeMessageType === 'advice'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Pre-Interview Insider Advice Ask</span>
                </button>
              </div>

              {/* Message Box */}
              {(() => {
                const messageText =
                  activeMessageType === 'invite'
                    ? activeContactForDrawer.generatedOutreach.connectionInvite
                    : activeMessageType === 'coffee'
                    ? activeContactForDrawer.generatedOutreach.inMailCoffeeChat
                    : activeContactForDrawer.generatedOutreach.preInterviewAdviceAsk;

                const charCount = messageText.length;
                const isUnderLimit = charCount <= 300;

                return (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase text-slate-400">
                          {activeMessageType === 'invite'
                            ? 'Connection Request Note'
                            : activeMessageType === 'coffee'
                            ? 'Coffee Chat InMail'
                            : 'Interview Advice Ask'}
                        </span>

                        {activeMessageType === 'invite' && (
                          <span
                            className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-bold ${
                              isUnderLimit ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {charCount} / 300 chars {isUnderLimit ? '✓ Ready' : '⚠️ Exceeds limit'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(messageText, 'active_message')}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedKey === 'active_message' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'active_message' ? 'Copied to Clipboard' : 'Copy Message'}</span>
                        </button>

                        <a
                          href={activeContactForDrawer.linkedInUrl || alumniSearchUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                          <span>Paste on LinkedIn</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900 rounded-xl text-xs sm:text-sm text-slate-200 leading-relaxed font-sans border border-slate-800/80 whitespace-pre-line select-all">
                      {messageText}
                    </div>

                    {/* Pro Tip */}
                    <div className="flex items-start gap-2 text-[11px] text-slate-400 pt-1">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Networking Pro Tip:</strong> LinkedIn personal connection notes are strictly limited to 300 characters. Never ask for a referral in the first message—ask for their perspective or advice first to build genuine rapport.
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : null}
        </div>
      )}

      {/* Modal: Add Custom Contact */}
      {showAddContactModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">Add Discovered LinkedIn Contact</h3>
                <p className="text-xs text-slate-400">Target Company: {selectedApp.company}</p>
              </div>
              <button
                onClick={() => setShowAddContactModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                  Role / Title at {selectedApp.company} *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer / Tech Lead"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                    Warm Affinity Angle
                  </label>
                  <select
                    value={newAffinity}
                    onChange={(e) => setNewAffinity(e.target.value as WarmContactAffinity)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="alumni">🎓 College/University Alumni</option>
                    <option value="hiring_team">👔 Hiring Lead / Manager</option>
                    <option value="mutual_company">🏢 Shared Past Company</option>
                    <option value="domain_peer">⚡ Tech Stack Kin</option>
                    <option value="second_degree">🤝 2nd Degree Connection</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                    Affinity Detail
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. ${candidateSchool} '22`}
                    value={newAffinityDetail}
                    onChange={(e) => setNewAffinityDetail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                  LinkedIn Profile URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://linkedin.com/in/username"
                  value={newLinkedInUrl}
                  onChange={(e) => setNewLinkedInUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                  Private Notes / Mutual Context
                </label>
                <textarea
                  placeholder="e.g. Worked on the same open source library; graduated in 2022."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddContactModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewContact}
                disabled={!newName.trim() || !newTitle.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs disabled:opacity-50"
              >
                Save & Generate Messages
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
