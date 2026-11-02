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
      <div className="bg-white border border-[#EBE8E3] rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-[#0F4A3E] border border-emerald-200 shrink-0 mt-0.5">
              <Hourglass className="w-5 h-5 text-[#0F4A3E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-serif font-bold uppercase tracking-wider text-stone-900">
                  Interview Stage Active
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                  Countdown Ready
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-serif font-bold text-stone-900 mt-0.5">
                When is your interview with {company}?
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Set the date and time to unlock the real-time visual countdown and preparation reminders.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
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
      <div className="bg-white border border-[#EBE8E3] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0F4A3E]" />
            <h4 className="text-xs sm:text-sm font-serif font-bold text-stone-900">
              Schedule / Reschedule Interview with {company}
            </h4>
          </div>
          <button
            onClick={() => setIsEditing(false)}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
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
              className="bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 flex-1 font-mono"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save & Start Countdown</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-500">
            <span className="text-[11px]">Quick set:</span>
            <button
              type="button"
              onClick={() => setQuickDate(1, 10)}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] border border-stone-200 transition-colors"
            >
              Tomorrow at 10 AM
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(2, 14)}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] border border-stone-200 transition-colors"
            >
              In 2 Days at 2 PM
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(4, 11)}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] border border-stone-200 transition-colors"
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
      className={`rounded-2xl p-4 sm:p-5 border shadow-xs transition-all relative overflow-hidden ${
        isPast
          ? 'bg-stone-50 border-stone-200 text-stone-700'
          : isUrgent
          ? 'bg-rose-50/50 border-rose-200'
          : 'bg-white border-[#EBE8E3]'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        
        {/* Left: Heading & Status */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                isPast
                  ? 'bg-stone-100 text-stone-600 border-stone-200'
                  : isUrgent
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              {isPast ? 'Interview Concluded' : isUrgent ? 'Under 24 Hours!' : 'Interview Countdown'}
            </span>

            {formattedInterviewDate && (
              <span className="text-xs text-stone-600 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#0F4A3E]" />
                {formattedInterviewDate}
              </span>
            )}

            <button
              onClick={() => {
                setInputDate(interviewDate || '');
                setIsEditing(true);
              }}
              className="text-[11px] text-[#0F4A3E] hover:underline font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Reschedule interview date"
            >
              <Edit2 className="w-3 h-3" />
              <span>Change</span>
            </button>
          </div>

          <h3 className="text-sm sm:text-base font-serif font-bold text-stone-900 tracking-tight">
            {isPast
              ? `Interview completed with ${company}!`
              : `Upcoming Interview: ${role} at ${company}`}
          </h3>

          <p className="text-xs text-stone-600">
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
              <div className="flex flex-col items-center bg-[#FAF9F7] border border-stone-200 rounded-xl px-2.5 sm:px-3 py-1.5 min-w-[52px] sm:min-w-[58px] shadow-xs">
                <span className="font-serif text-lg sm:text-2xl font-bold text-stone-900 tracking-tight">
                  {String(timeRemaining.days).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-semibold text-stone-500 tracking-wider">
                  Days
                </span>
              </div>

              <span className="font-mono text-stone-400 font-bold text-lg -mt-3">:</span>

              {/* Hours card */}
              <div className="flex flex-col items-center bg-[#FAF9F7] border border-stone-200 rounded-xl px-2.5 sm:px-3 py-1.5 min-w-[52px] sm:min-w-[58px] shadow-xs">
                <span className="font-serif text-lg sm:text-2xl font-bold text-stone-900 tracking-tight">
                  {String(timeRemaining.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-semibold text-stone-500 tracking-wider">
                  Hours
                </span>
              </div>

              <span className="font-mono text-stone-400 font-bold text-lg -mt-3">:</span>

              {/* Minutes card */}
              <div className="flex flex-col items-center bg-[#FAF9F7] border border-stone-200 rounded-xl px-2.5 sm:px-3 py-1.5 min-w-[52px] sm:min-w-[58px] shadow-xs">
                <span className="font-serif text-lg sm:text-2xl font-bold text-stone-900 tracking-tight">
                  {String(timeRemaining.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-semibold text-stone-500 tracking-wider">
                  Mins
                </span>
              </div>

              <span className="font-mono text-stone-400 font-bold text-lg -mt-3">:</span>

              {/* Seconds card */}
              <div className="flex flex-col items-center bg-[#FAF9F7] border border-stone-200 rounded-xl px-2.5 sm:px-3 py-1.5 min-w-[52px] sm:min-w-[58px] shadow-xs">
                <span className="font-serif text-lg sm:text-2xl font-bold text-[#0F4A3E] tracking-tight">
                  {String(timeRemaining.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-semibold text-emerald-800 tracking-wider">
                  Secs
                </span>
              </div>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Interview Completed</span>
            </div>
          )}

          {/* Action Buttons Cluster */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Mock Interviewer Button */}
            {onOpenMockInterview && (
              <button
                onClick={onOpenMockInterview}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap"
                title="Launch Live AI Mock Interview Simulator"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-200" />
                <span>Live Mock Interview</span>
              </button>
            )}

            {/* Quick Prep Studio Button */}
            {onOpenQuickPrep && (
              <button
                onClick={onOpenQuickPrep}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 font-semibold text-xs transition-all cursor-pointer whitespace-nowrap shadow-xs"
                title="Generate tailored STAR-format answers"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0F4A3E]" />
                <span>STAR Answers</span>
              </button>
            )}

            {/* Company Dossier & Questions to Ask */}
            {onOpenCompanyDossier && (
              <button
                onClick={onOpenCompanyDossier}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-xs"
                title="View Company Dossier and Reverse-Interview Questions"
              >
                <Compass className="w-3.5 h-3.5 text-stone-500" />
                <span>Company Intel</span>
              </button>
            )}

            {/* Alumni & Warm Outreach Button */}
            {onOpenWarmOutreach && (
              <button
                onClick={onOpenWarmOutreach}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0F4A3E] border border-emerald-200 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                title="Find common alumni and mutual contacts at this company"
              >
                <Users className="w-3.5 h-3.5 text-[#0F4A3E]" />
                <span>Alumni & Warm Leads</span>
              </button>
            )}

            {/* Calendar Sync Dropdown / Buttons */}
            {interviewDate && !isPast && (
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-[11px] font-medium transition-colors"
                  title="Add to Google Calendar"
                >
                  <Calendar className="w-3 h-3 text-[#0F4A3E]" />
                  <span>Google Cal</span>
                </a>
                <button
                  onClick={handleDownloadICS}
                  className="p-1 rounded-lg hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
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
