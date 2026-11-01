import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Calendar,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Check,
  X,
  ArrowRight,
  HelpCircle,
  Hourglass,
  Mic,
  Compass,
  Download,
  Users
} from 'lucide-react';

interface InterviewCountdownProps {
  interviewDate?: string;
  onUpdateInterviewDate: (newDate: string) => void;
  company: string;
  role: string;
  onSwitchToPrepTab?: () => void;
  onOpenQuickPrep?: () => void;
  onOpenMockInterview?: () => void;
  onOpenCompanyDossier?: () => void;
  onOpenWarmOutreach?: () => void;
}

interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export const InterviewCountdown: React.FC<InterviewCountdownProps> = ({
  interviewDate,
  onUpdateInterviewDate,
  company,
  role,
  onSwitchToPrepTab,
  onOpenQuickPrep,
  onOpenMockInterview,
  onOpenCompanyDossier,
  onOpenWarmOutreach,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputDate, setInputDate] = useState(interviewDate || '');

  // Google Calendar URL generator
  const getGoogleCalendarUrl = () => {
    if (!interviewDate) return '#';
    try {
      const start = new Date(interviewDate);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration
      const formatTime = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
      const title = encodeURIComponent(`Interview: ${role} at ${company}`);
      const details = encodeURIComponent(
        `ApplyFlow Interview Countdown reminder for ${role} with ${company}.\nPractice with ApplyFlow AI Mock Interviewer.`
      );
      const dates = `${formatTime(start)}/${formatTime(end)}`;
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`;
    } catch {
      return '#';
    }
  };

  // Download .ics file
  const handleDownloadICS = () => {
    if (!interviewDate) return;
    try {
      const start = new Date(interviewDate);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const formatTime = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
      const icsData = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ApplyFlow//Interview Assistant//EN',
        'BEGIN:VEVENT',
        `SUMMARY:Interview: ${role} at ${company}`,
        `DESCRIPTION:Scheduled interview for ${role} with ${company}. Practiced with ApplyFlow AI Assistant.`,
        `DTSTART:${formatTime(start)}`,
        `DTEND:${formatTime(end)}`,
        'STATUS:CONFIRMED',
        'BEGIN:VALARM',
        'TRIGGER:-PT30M',
        'ACTION:DISPLAY',
        'DESCRIPTION:Interview in 30 minutes! Final review time.',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${company.toLowerCase().replace(/\s+/g, '_')}_interview.ics`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to create ICS file', e);
    }
  };

  // Calculate remaining time
  const calculateTime = useMemo(() => {
    return (targetDateStr: string): TimeRemaining => {
      if (!targetDateStr) {
        return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false };
      }

      const target = new Date(targetDateStr).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        return {
          totalMs: diff,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
        };
      }

      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      return { totalMs: diff, days, hours, minutes, seconds, isPast: false };
    };
  }, []);

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTime(interviewDate || '')
  );

  // Live timer tick every 1000ms
  useEffect(() => {
    if (!interviewDate) return;

    setTimeRemaining(calculateTime(interviewDate));

    const interval = setInterval(() => {
      setTimeRemaining(calculateTime(interviewDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [interviewDate, calculateTime]);

  const handleSaveDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputDate) return;
    onUpdateInterviewDate(inputDate);
    setIsEditing(false);
  };

  const setQuickDate = (daysFromNow: number, hourOfDay = 14) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromNow);
    target.setHours(hourOfDay, 0, 0, 0);

    // Format YYYY-MM-DDTHH:mm for datetime-local
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    const hours = String(target.getHours()).padStart(2, '0');
    const mins = '00';

    const formatted = `${year}-${month}-${day}T${hours}:${mins}`;
    setInputDate(formatted);
    onUpdateInterviewDate(formatted);
    setIsEditing(false);
  };

  // Human formatted date string
  const formattedInterviewDate = useMemo(() => {
    if (!interviewDate) return null;
    try {
      const d = new Date(interviewDate);
      return d.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return interviewDate;
    }
  }, [interviewDate]);

  // If no date set yet
  if (!interviewDate && !isEditing) {
    return (
      <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/50 to-slate-900 border border-purple-500/30 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0 mt-0.5">
              <Hourglass className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                  Interview Stage Active
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  Countdown Ready
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                When is your interview with {company}?
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Set the date and time to unlock the real-time visual countdown and preparation reminders.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Set Interview Date</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Editing mode
  if (isEditing) {
    return (
      <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs sm:text-sm font-bold text-white">
              Schedule / Reschedule Interview with {company}
            </h4>
          </div>
          <button
            onClick={() => setIsEditing(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSaveDate} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <input
              type="datetime-local"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 flex-1 font-mono"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save & Start Countdown</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
            <span className="text-[11px]">Quick set:</span>
            <button
              type="button"
              onClick={() => setQuickDate(1, 10)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors"
            >
              Tomorrow at 10 AM
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(2, 14)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors"
            >
              In 2 Days at 2 PM
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(4, 11)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors"
            >
              In 4 Days at 11 AM
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Active Countdown Display
  const isUrgent = !timeRemaining.isPast && timeRemaining.days === 0 && timeRemaining.hours < 24;
  const isPast = timeRemaining.isPast;

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 border shadow-xl transition-all relative overflow-hidden ${
        isPast
          ? 'bg-slate-900 border-slate-700 text-slate-300'
          : isUrgent
          ? 'bg-gradient-to-r from-rose-950/40 via-purple-950/40 to-slate-900 border-rose-500/40 shadow-rose-950/30'
          : 'bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border-purple-500/40 shadow-purple-950/30'
      }`}
    >
      {/* Background glow element */}
      <div className="absolute top-0 right-1/4 -mt-8 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        
        {/* Left: Heading & Status */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                isPast
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : isUrgent
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
                  : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
              }`}
            >
              <Clock className="w-3 h-3" />
              {isPast ? 'Interview Concluded' : isUrgent ? 'Under 24 Hours!' : 'Interview Countdown'}
            </span>

            {formattedInterviewDate && (
              <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                {formattedInterviewDate}
              </span>
            )}

            <button
              onClick={() => {
                setInputDate(interviewDate || '');
                setIsEditing(true);
              }}
              className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 underline transition-colors cursor-pointer"
              title="Reschedule interview date"
            >
              <Edit2 className="w-3 h-3" />
              <span>Change</span>
            </button>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            {isPast
              ? `Interview completed with ${company}!`
              : `Upcoming Interview: ${role} at ${company}`}
          </h3>

          <p className="text-xs text-slate-300">
            {isPast
              ? 'Great job completing your interview! Record feedback in your notes below or update your pipeline status.'
              : isUrgent
              ? 'Final preparation hours! Run through the 5 STAR answer outlines and check your camera/audio setup.'
              : 'Keep your momentum sharp. Review the predicted company questions and architectural trade-offs.'}
          </p>
        </div>

        {/* Right: The Visual Countdown Cards & CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
          {!isPast ? (
            <div className="flex items-center gap-2">
              {/* Days card */}
              <div className="flex flex-col items-center bg-slate-950/80 border border-purple-500/30 rounded-xl px-2.5 sm:px-3 py-1.5 min-w-[52px] sm:min-w-[58px] shadow-inner">
                <span className="font-mono text-lg sm:text-2xl font-black text-white tracking-tight">
                  {String(timeRemaining.days).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-semibold text-purple-300/80 tracking-wider">
                  Days
                </span>
              </div>

              <span className="font-mono text-purple-400 font-bold text-lg -mt-3">:</span>

              {/* Hours card */}
              <div className="flex flex-col items-center bg-slate-950/80 border border-purple-500/30 rounded-xl px-2.5 sm:px-3 py-1.5 min-w-[52px] sm:min-w-[58px] shadow-inner">
                <span className="font-mono text-lg sm:text-2xl font-black text-white tracking-tight">
                  {String(timeRemaining.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-semibold text-purple-300/80 tracking-wider">
                  Hours
                </span>
              </div>

              <span className="font-mono text-purple-400 font-bold text-lg -mt-3">:</span>

              {/* Minutes card */}
              <div className="flex flex-col items-center bg-slate-950/80 border border-purple-500/30 rounded-xl px-2.5 sm:px-3 py-1.5 min-w-[52px] sm:min-w-[58px] shadow-inner">
                <span className="font-mono text-lg sm:text-2xl font-black text-white tracking-tight">
                  {String(timeRemaining.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-semibold text-purple-300/80 tracking-wider">
                  Mins
                </span>
              </div>

              <span className="font-mono text-purple-400 font-bold text-lg -mt-3">:</span>

              {/* Seconds card */}
              <div className="flex flex-col items-center bg-slate-950/80 border border-purple-500/30 rounded-xl px-2.5 sm:px-3 py-1.5 min-w-[52px] sm:min-w-[58px] shadow-inner">
                <span className="font-mono text-lg sm:text-2xl font-black text-amber-400 tracking-tight">
                  {String(timeRemaining.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-semibold text-amber-300/80 tracking-wider">
                  Secs
                </span>
              </div>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Interview Completed</span>
            </div>
          )}

          {/* Action Buttons Cluster */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Mock Interviewer Button */}
            {onOpenMockInterview && (
              <button
                onClick={onOpenMockInterview}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer whitespace-nowrap"
                title="Launch Live AI Mock Interview Simulator"
              >
                <Mic className="w-3.5 h-3.5 text-amber-300" />
                <span>Live Mock Interview</span>
              </button>
            )}

            {/* Quick Prep Studio Button */}
            {onOpenQuickPrep && (
              <button
                onClick={onOpenQuickPrep}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-200 hover:text-white border border-purple-500/40 font-semibold text-xs transition-all cursor-pointer whitespace-nowrap"
                title="Generate tailored STAR-format answers"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>STAR Answers</span>
              </button>
            )}

            {/* Company Dossier & Questions to Ask */}
            {onOpenCompanyDossier && (
              <button
                onClick={onOpenCompanyDossier}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                title="View Company Dossier and Reverse-Interview Questions"
              >
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span>Company Intel</span>
              </button>
            )}

            {/* Alumni & Warm Outreach Button */}
            {onOpenWarmOutreach && (
              <button
                onClick={onOpenWarmOutreach}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                title="Find common alumni and mutual contacts at this company"
              >
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Alumni & Warm Leads</span>
              </button>
            )}

            {/* Calendar Sync Dropdown / Buttons */}
            {interviewDate && !isPast && (
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[11px] font-medium transition-colors"
                  title="Add to Google Calendar"
                >
                  <Calendar className="w-3 h-3 text-indigo-400" />
                  <span>Google Cal</span>
                </a>
                <button
                  onClick={handleDownloadICS}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Download .ICS Calendar File (Outlook, Apple, Google)"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
