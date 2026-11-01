import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  Clock,
  Mail,
  Send,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Settings2,
  Check,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Eye,
  Sliders,
  ShieldCheck,
  Building2,
  Inbox
} from 'lucide-react';
import { JobApplication } from '../types/job';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface FollowUpReminderHubProps {
  applications: JobApplication[];
  onUpdateApplication: (app: JobApplication) => void;
  onNavigateToPipeline: () => void;
}

interface ReminderSettings {
  recipientEmail: string;
  dailySummaryEnabled: boolean;
  weeklySummaryEnabled: boolean;
  frequency: 'daily' | 'weekly' | 'both' | 'off';
  preferredTime: string;
  leadDaysBeforeFollowUp: number;
}

export const FollowUpReminderHub: React.FC<FollowUpReminderHubProps> = ({
  applications,
  onUpdateApplication,
  onNavigateToPipeline
}) => {
  const { user } = useAuth();

  const [settings, setSettings] = useState<ReminderSettings>(() => {
    try {
      const saved = localStorage.getItem('applyflow_reminder_settings');
      return saved
        ? JSON.parse(saved)
        : {
            recipientEmail: 'kkbhoi09@gmail.com',
            dailySummaryEnabled: true,
            weeklySummaryEnabled: true,
            frequency: 'both',
            preferredTime: '09:00',
            leadDaysBeforeFollowUp: 1
          };
    } catch {
      return {
        recipientEmail: 'kkbhoi09@gmail.com',
        dailySummaryEnabled: true,
        weeklySummaryEnabled: true,
        frequency: 'both',
        preferredTime: '09:00',
        leadDaysBeforeFollowUp: 1
      };
    }
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTriggeringTest, setIsTriggeringTest] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [selectedAppForEmail, setSelectedAppForEmail] = useState<JobApplication | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load preferences from Firestore if available
  useEffect(() => {
    if (!user) return;
    const loadFirestoreSettings = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'settings', 'reminders');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as ReminderSettings;
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.warn('Could not load reminder settings from Firestore:', err);
      }
    };
    loadFirestoreSettings();
  }, [user]);

  // Save settings to LocalStorage and Firestore
  const handleSaveSettings = async () => {
    try {
      localStorage.setItem('applyflow_reminder_settings', JSON.stringify(settings));

      // Sync with server API
      await fetch('/api/reminders/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      // Sync with Firestore if logged in
      if (user) {
        const docRef = doc(db, 'users', user.uid, 'settings', 'reminders');
        await setDoc(docRef, {
          ...settings,
          userId: user.uid,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save reminder settings:', err);
    }
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter applications that have follow-up tasks
  const dueItems = useMemo(() => {
    return applications
      .filter((app) => app.followUpDate && (app.status === 'applied' || app.status === 'interviewing'))
      .sort((a, b) => (a.followUpDate || '').localeCompare(b.followUpDate || ''));
  }, [applications]);

  const overdueCount = useMemo(() => {
    return dueItems.filter((app) => (app.followUpDate || '') <= todayStr).length;
  }, [dueItems, todayStr]);

  // Postpone follow-up by 3 days
  const handlePostpone = (app: JobApplication, days: number = 3) => {
    const current = app.followUpDate ? new Date(app.followUpDate) : new Date();
    current.setDate(current.getDate() + days);
    const updated: JobApplication = {
      ...app,
      followUpDate: current.toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    };
    onUpdateApplication(updated);
  };

  // Mark followed up
  const handleMarkFollowedUp = (app: JobApplication) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 7);
    const updated: JobApplication = {
      ...app,
      followUpDate: nextDate.toISOString().split('T')[0],
      notes: (app.notes ? app.notes + '\n' : '') + `Followed up on ${todayStr}.`,
      updatedAt: new Date().toISOString()
    };
    onUpdateApplication(updated);
  };

  // Trigger test reminder via Cloud Function simulator
  const handleTriggerTestReminder = async () => {
    setIsTriggeringTest(true);
    try {
      const res = await fetch('/api/reminders/trigger-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applications,
          email: settings.recipientEmail
        })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      console.error('Trigger test reminder error:', err);
    } finally {
      setIsTriggeringTest(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-[#EBE8E3] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDF3EA] text-[#0F4A3E] text-xs font-bold font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>Firebase Cloud Functions · Automated Follow-Up Reminders</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight leading-tight">
              Follow-Up Task Scheduler & Pipeline Digest
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              Never let an application go cold. Firebase Cloud Functions runs a scheduled daily cron (<strong>0 9 * * *</strong>) to check your pipeline for pending follow-ups and delivers crisp daily or weekly summaries straight to your inbox.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2.5 w-full lg:w-auto shrink-0">
            <button
              onClick={handleTriggerTestReminder}
              disabled={isTriggeringTest}
              className="px-5 py-2.5 rounded-2xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isTriggeringTest ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                  <span>Checking Cloud Function...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Send Test Email Digest Now</span>
                </>
              )}
            </button>

            <button
              onClick={onNavigateToPipeline}
              className="px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View Pipeline Board</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Function Status & Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cloud Functions Opt-in Settings (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-[#EBE8E3] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2EFE9]">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0F4A3E]" />
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Email Digest Preferences
              </h2>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Cron
            </span>
          </div>

          <div className="space-y-4">
            {/* Recipient Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span>Recipient Email Address</span>
              </label>
              <input
                type="email"
                value={settings.recipientEmail}
                onChange={(e) => setSettings({ ...settings, recipientEmail: e.target.value })}
                placeholder="your.email@example.com"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F4A3E] focus:bg-white"
              />
            </div>

            {/* Daily Follow-Up Toggle */}
            <div className="flex items-start justify-between gap-4 p-3.5 rounded-2xl bg-stone-50 border border-stone-150">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-stone-900">
                  Daily Follow-Up Digest
                </div>
                <div className="text-[11px] text-stone-500 leading-snug">
                  Scheduled daily at 9:00 AM if any applications are overdue or due today.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.dailySummaryEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, dailySummaryEnabled: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#0F4A3E] focus:ring-[#0F4A3E] cursor-pointer mt-1"
              />
            </div>

            {/* Weekly Pipeline Summary Toggle */}
            <div className="flex items-start justify-between gap-4 p-3.5 rounded-2xl bg-stone-50 border border-stone-150">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-stone-900">
                  Weekly Pipeline Summary
                </div>
                <div className="text-[11px] text-stone-500 leading-snug">
                  Every Monday morning: conversion rates, active interviews, and stalled leads.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.weeklySummaryEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, weeklySummaryEnabled: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#0F4A3E] focus:ring-[#0F4A3E] cursor-pointer mt-1"
              />
            </div>

            {/* Preferred Delivery Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700">Delivery Time</label>
                <select
                  value={settings.preferredTime}
                  onChange={(e) => setSettings({ ...settings, preferredTime: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0F4A3E]"
                >
                  <option value="08:00">8:00 AM IST</option>
                  <option value="09:00">9:00 AM IST (Default)</option>
                  <option value="10:00">10:00 AM IST</option>
                  <option value="18:00">6:00 PM IST (Evening)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700">Notice Lead Time</label>
                <select
                  value={settings.leadDaysBeforeFollowUp}
                  onChange={(e) =>
                    setSettings({ ...settings, leadDaysBeforeFollowUp: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0F4A3E]"
                >
                  <option value="0">Same Day (Due Date)</option>
                  <option value="1">1 Day Prior</option>
                  <option value="2">2 Days Prior</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveSettings}
              className="w-full py-2.5 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Preferences Saved to Cloud!</span>
                </>
              ) : (
                <span>Save Notification Settings</span>
              )}
            </button>
          </div>

          {/* Cloud Function Technical Spec Note */}
          <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 space-y-1">
            <div className="flex items-center gap-1 font-semibold text-stone-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Firebase Cloud Functions Cron:</span>
            </div>
            <p className="font-mono text-[10px] bg-stone-100 p-2 rounded-lg text-stone-700">
              dailyFollowUpCron: onSchedule("0 9 * * *", "Asia/Kolkata")
            </p>
          </div>
        </div>

        {/* Right Column: Follow-Up Action Queue (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-[#EBE8E3] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2EFE9]">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-[#0F4A3E]" />
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Actionable Follow-Up Queue
              </h2>
            </div>
            {overdueCount > 0 ? (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-600" />
                {overdueCount} Due / Overdue
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                All Caught Up
              </span>
            )}
          </div>

          <p className="text-xs text-stone-500">
            Based on your standing rule (<em>Follow-Up Inactivity Alert: 6 business days after submission</em>), these opportunities require direct recruiter outreach.
          </p>

          {/* Queue List */}
          <div className="divide-y divide-stone-100">
            {dueItems.map((app) => {
              const isOverdue = (app.followUpDate || '') <= todayStr;
              return (
                <div
                  key={app.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 px-2 rounded-2xl transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-stone-900 truncate">
                        {app.company}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border capitalize ${
                          app.status === 'offer'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-purple-50 text-purple-800 border-purple-200'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="text-xs text-stone-600 font-medium">
                      {app.role}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-stone-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Follow-Up: <strong className={isOverdue ? 'text-rose-600 font-mono' : 'text-stone-700 font-mono'}>{app.followUpDate}</strong>
                      </span>
                      {isOverdue && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                          Action Required
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedAppForEmail(app)}
                      className="px-3 py-1.5 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      <Mail className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Draft Email</span>
                    </button>

                    <button
                      onClick={() => handlePostpone(app, 3)}
                      className="px-2.5 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 text-xs font-medium cursor-pointer transition-colors"
                      title="Postpone follow-up by 3 days"
                    >
                      +3 Days
                    </button>

                    <button
                      onClick={() => handleMarkFollowedUp(app)}
                      className="p-1.5 rounded-xl border border-stone-200 hover:bg-emerald-50 hover:border-emerald-300 text-stone-500 hover:text-emerald-700 cursor-pointer transition-colors"
                      title="Mark as followed up"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {dueItems.length === 0 && (
              <div className="py-8 text-center text-xs text-stone-500 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-semibold text-stone-700">Zero Pending Follow-Ups</p>
                <p>All active applications in your pipeline have up-to-date recruiter interactions.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test Result Toast / Live Preview */}
      {testResult && (
        <div className="bg-[#FAF9F7] border border-[#0F4A3E]/30 rounded-3xl p-5 shadow-xs animate-in fade-in duration-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0F4A3E]" />
              <h3 className="font-serif text-sm font-bold text-stone-900">
                Cloud Function Simulation Result
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Status: {testResult.status}
            </span>
          </div>

          <div className="p-3.5 bg-white border border-stone-200 rounded-2xl text-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-stone-600 gap-1">
              <span><strong>Subject:</strong> {testResult.subject}</span>
              <span className="font-mono text-stone-400">Recipient: {testResult.recipientEmail}</span>
            </div>
            <p className="text-stone-500 text-[11px]">
              Found <strong>{testResult.dueItemsCount}</strong> items requiring follow-up and <strong>{testResult.upcomingInterviewsCount}</strong> upcoming interviews. The HTML summary matches your configured standing rules format.
            </p>
          </div>
        </div>
      )}

      {/* Recruiter Follow-Up Quick Composer Modal */}
      {selectedAppForEmail && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#EBE8E3] max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Follow-Up Outreach Script
                </h3>
                <p className="text-xs text-stone-500">
                  Tailored for {selectedAppForEmail.company} — {selectedAppForEmail.role}
                </p>
              </div>
              <button
                onClick={() => setSelectedAppForEmail(null)}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Email Draft Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700">Subject:</label>
              <input
                readOnly
                value={`Following up on ${selectedAppForEmail.role} application — Ketan Kaushikbhai Bhoi`}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900"
              />

              <label className="text-xs font-bold text-stone-700 block pt-1">Email Body (Under 100 words):</label>
              <textarea
                readOnly
                rows={6}
                value={`Dear Hiring Team at ${selectedAppForEmail.company},\n\nI wanted to respectfully follow up on my application for the ${selectedAppForEmail.role} position submitted recently.\n\nWith my practical background building MERN stack applications (MetroMart multivendor platform) and dedicated focus in AI/LLM evaluation and software correctness, I remain very excited about this role.\n\nPlease let me know if any additional details, GitHub samples, or references would be helpful.\n\nThank you for your time,\nKetan Kaushikbhai Bhoi\n+91 90541 46405 | kkbhoi09@gmail.com`}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-sans resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  const subject = encodeURIComponent(`Following up on ${selectedAppForEmail.role} application — Ketan Kaushikbhai Bhoi`);
                  const body = encodeURIComponent(
                    `Dear Hiring Team at ${selectedAppForEmail.company},\n\nI wanted to respectfully follow up on my application for the ${selectedAppForEmail.role} position submitted recently.\n\nWith my practical background building MERN stack applications (MetroMart multivendor platform) and dedicated focus in AI/LLM evaluation and software correctness, I remain very excited about this role.\n\nPlease let me know if any additional details, GitHub samples, or references would be helpful.\n\nThank you for your time,\nKetan Kaushikbhai Bhoi\n+91 90541 46405 | kkbhoi09@gmail.com`
                  );
                  window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
                }}
                className="px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Email App</span>
              </button>

              <button
                onClick={() => {
                  const fullText = `Subject: Following up on ${selectedAppForEmail.role} application — Ketan Kaushikbhai Bhoi\n\nDear Hiring Team at ${selectedAppForEmail.company},\n\nI wanted to respectfully follow up on my application for the ${selectedAppForEmail.role} position submitted recently.\n\nWith my practical background building MERN stack applications (MetroMart multivendor platform) and dedicated focus in AI/LLM evaluation and software correctness, I remain very excited about this role.\n\nPlease let me know if any additional details, GitHub samples, or references would be helpful.\n\nThank you for your time,\nKetan Kaushikbhai Bhoi\n+91 90541 46405 | kkbhoi09@gmail.com`;
                  handleCopyText(fullText, 'composer');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copiedId === 'composer' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <span>Copy to Clipboard</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
