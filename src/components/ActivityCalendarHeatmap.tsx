import React, { useState, useMemo } from 'react';
import { JobApplication } from '../types/job';
import {
  Calendar,
  Flame,
  Award,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  X,
  Plus
} from 'lucide-react';

export interface HeatmapActivityEvent {
  id: string;
  applicationId: string;
  company: string;
  role: string;
  type: 'applied' | 'interview' | 'status_change' | 'created' | 'follow_up' | 'note_added';
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  applicationRef?: JobApplication;
}

export interface DayHeatmapData {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 = Sun, 6 = Sat
  month: number;
  dayOfMonth: number;
  events: HeatmapActivityEvent[];
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  isInCurrentPeriod: boolean;
  isToday: boolean;
}

interface ActivityCalendarHeatmapProps {
  applications: JobApplication[];
  onSelectApplication?: (app: JobApplication) => void;
  onStartNewAnalysis?: () => void;
}

type ActivityFilter = 'all' | 'applied' | 'interviews' | 'updates';

export const ActivityCalendarHeatmap: React.FC<ActivityCalendarHeatmapProps> = ({
  applications,
  onSelectApplication,
  onStartNewAnalysis,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<ActivityFilter>('all');
  const [selectedDateString, setSelectedDateString] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<{ day: DayHeatmapData; x: number; y: number } | null>(null);

  // 1. Extract and normalize all activity events across applications
  const allRawEvents = useMemo<HeatmapActivityEvent[]>(() => {
    const events: HeatmapActivityEvent[] = [];

    applications.forEach((app) => {
      // Priority 1: Use explicit activityTimeline if present
      if (app.activityTimeline && app.activityTimeline.length > 0) {
        app.activityTimeline.forEach((t) => {
          let dateStr = t.date;
          if (dateStr.includes('T')) {
            dateStr = dateStr.split('T')[0];
          }
          events.push({
            id: t.id || `${app.id}-${t.type}-${dateStr}`,
            applicationId: app.id,
            company: app.company,
            role: app.role,
            type: t.type,
            date: dateStr,
            title:
              t.type === 'applied'
                ? 'Application Submitted'
                : t.type === 'interview'
                ? 'Interview Scheduled / Held'
                : t.type === 'status_change'
                ? 'Pipeline Status Update'
                : t.type === 'follow_up'
                ? 'Follow-Up Scheduled'
                : t.type === 'note_added'
                ? 'Notes & Research Logged'
                : 'Opportunity Tracked',
            description: t.description || `${app.company} · ${app.role}`,
            applicationRef: app,
          });
        });
        return;
      }

      // Priority 2: Synthesize events from core date fields
      if (app.appliedDate) {
        const d = app.appliedDate.includes('T') ? app.appliedDate.split('T')[0] : app.appliedDate;
        events.push({
          id: `${app.id}-applied-${d}`,
          applicationId: app.id,
          company: app.company,
          role: app.role,
          type: 'applied',
          date: d,
          title: 'Application Submitted',
          description: `Applied for ${app.role} at ${app.company}`,
          applicationRef: app,
        });
      }

      if (app.createdAt) {
        const d = app.createdAt.includes('T') ? app.createdAt.split('T')[0] : app.createdAt;
        // Only add created event if not on the exact same date as appliedDate to avoid double counting same moment
        if (d !== app.appliedDate) {
          events.push({
            id: `${app.id}-created-${d}`,
            applicationId: app.id,
            company: app.company,
            role: app.role,
            type: 'created',
            date: d,
            title: 'Opportunity Saved & Analyzed',
            description: `Added ${app.company} opportunity to pipeline`,
            applicationRef: app,
          });
        }
      }

      if (app.interviewDate) {
        const d = app.interviewDate.includes('T') ? app.interviewDate.split('T')[0] : app.interviewDate;
        events.push({
          id: `${app.id}-interview-${d}`,
          applicationId: app.id,
          company: app.company,
          role: app.role,
          type: 'interview',
          date: d,
          title: 'Interview Scheduled / Held',
          description: `Interview for ${app.role} at ${app.company}`,
          applicationRef: app,
        });
      }

      if (app.followUpDate) {
        const d = app.followUpDate.includes('T') ? app.followUpDate.split('T')[0] : app.followUpDate;
        events.push({
          id: `${app.id}-followup-${d}`,
          applicationId: app.id,
          company: app.company,
          role: app.role,
          type: 'follow_up',
          date: d,
          title: 'Follow-Up Cadence Task',
          description: `Outreach scheduled for ${app.company}`,
          applicationRef: app,
        });
      }

      if (app.updatedAt) {
        const d = app.updatedAt.includes('T') ? app.updatedAt.split('T')[0] : app.updatedAt;
        const createdDate = app.createdAt ? (app.createdAt.includes('T') ? app.createdAt.split('T')[0] : app.createdAt) : null;
        if (d !== createdDate && d !== app.appliedDate) {
          events.push({
            id: `${app.id}-updated-${d}`,
            applicationId: app.id,
            company: app.company,
            role: app.role,
            type: 'status_change',
            date: d,
            title: 'Application Progress Update',
            description: `Status updated to ${app.status} for ${app.company}`,
            applicationRef: app,
          });
        }
      }
    });

    return events;
  }, [applications]);

  // 2. Filter events based on active category selection
  const filteredEvents = useMemo(() => {
    if (selectedFilter === 'all') return allRawEvents;
    if (selectedFilter === 'applied') {
      return allRawEvents.filter((e) => e.type === 'applied');
    }
    if (selectedFilter === 'interviews') {
      return allRawEvents.filter((e) => e.type === 'interview' || e.type === 'follow_up');
    }
    if (selectedFilter === 'updates') {
      return allRawEvents.filter((e) => e.type === 'status_change' || e.type === 'created' || e.type === 'note_added');
    }
    return allRawEvents;
  }, [allRawEvents, selectedFilter]);

  // 3. Map events by date string (YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const map = new Map<string, HeatmapActivityEvent[]>();
    filteredEvents.forEach((ev) => {
      const existing = map.get(ev.date) || [];
      existing.push(ev);
      map.set(ev.date, existing);
    });
    return map;
  }, [filteredEvents]);

  // 4. Calculate Anchor date & 3-month calendar grid
  // We identify the latest application date or current date to establish the 90-day window
  const { weeks, monthHeaders, anchorDate, startDate, streakStats } = useMemo(() => {
    const today = new Date();

    // Find the latest activity date in our dataset to ensure the calendar covers active records seamlessly
    let maxTimestamp = today.getTime();
    allRawEvents.forEach((ev) => {
      const t = new Date(ev.date).getTime();
      if (!isNaN(t) && t > maxTimestamp) {
        maxTimestamp = t;
      }
    });

    const anchor = new Date(maxTimestamp);
    anchor.setHours(23, 59, 59, 999);

    // End on the Saturday of the current anchor week to complete the column
    const endDate = new Date(anchor);
    const dayOfEnd = endDate.getDay();
    const daysToAdd = 6 - dayOfEnd;
    endDate.setDate(endDate.getDate() + daysToAdd);

    // Calculate approximately 13-14 full weeks (91 to 98 days)
    const totalWeeks = 14;
    const start = new Date(endDate);
    start.setDate(endDate.getDate() - (totalWeeks * 7 - 1));
    start.setHours(0, 0, 0, 0);

    // Build the 2D grid: weeks -> days (Sunday = 0 to Saturday = 6)
    const grid: DayHeatmapData[][] = [];
    const current = new Date(start);
    const todayStr = today.toISOString().split('T')[0];

    // For tracking month labels
    const monthCols: { monthName: string; colIndex: number }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < totalWeeks; w++) {
      const weekDays: DayHeatmapData[] = [];

      for (let d = 0; d < 7; d++) {
        const dateCopy = new Date(current);
        const y = dateCopy.getFullYear();
        const m = String(dateCopy.getMonth() + 1).padStart(2, '0');
        const dayNum = String(dateCopy.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${dayNum}`;

        const evs = eventsByDate.get(dateStr) || [];
        const count = evs.length;

        // Intensity level scale (0 to 4)
        let level: 0 | 1 | 2 | 3 | 4 = 0;
        if (count === 1) level = 1;
        else if (count === 2) level = 2;
        else if (count === 3) level = 3;
        else if (count >= 4) level = 4;

        // Check if inside the 90-day reference window
        const diffDays = Math.round((anchor.getTime() - dateCopy.getTime()) / (1000 * 60 * 60 * 24));
        const isInPeriod = diffDays >= 0 && diffDays <= 92;

        weekDays.push({
          date: dateCopy,
          dateString: dateStr,
          dayOfWeek: d,
          month: dateCopy.getMonth(),
          dayOfMonth: dateCopy.getDate(),
          events: evs,
          count,
          level,
          isInCurrentPeriod: isInPeriod,
          isToday: dateStr === todayStr,
        });

        // Detect month label on the first day of each month
        if (dateCopy.getDate() <= 7 && dateCopy.getMonth() !== lastMonth && d === 0) {
          lastMonth = dateCopy.getMonth();
          const monthName = dateCopy.toLocaleDateString('en-US', { month: 'short' });
          monthCols.push({ monthName, colIndex: w });
        }

        current.setDate(current.getDate() + 1);
      }

      grid.push(weekDays);
    }

    // 5. Compute Streak & Stats
    // Flatten days within period sorted ascending
    const periodDays = grid
      .flat()
      .filter((d) => d.isInCurrentPeriod)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let activeDaysCount = 0;
    let peakDayCount = 0;
    let peakDayString = '';

    // Calculate longest streak and active days
    periodDays.forEach((d) => {
      if (d.count > 0) {
        activeDaysCount++;
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        if (d.count > peakDayCount) {
          peakDayCount = d.count;
          peakDayString = d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      } else {
        tempStreak = 0;
      }
    });

    // Calculate current streak from anchor backwards
    const reversed = [...periodDays].reverse();
    let countingCurrent = true;
    for (const d of reversed) {
      if (countingCurrent) {
        if (d.count > 0) {
          currentStreak++;
        } else if (currentStreak > 0) {
          // Break when streak ends
          break;
        }
      }
    }

    return {
      weeks: grid,
      monthHeaders: monthCols,
      anchorDate: anchor,
      startDate: start,
      streakStats: {
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        activeDaysCount,
        totalDays: periodDays.length,
        totalActions: filteredEvents.length,
        peakDay: peakDayString ? `${peakDayString} (${peakDayCount} actions)` : 'None yet',
      },
    };
  }, [allRawEvents, eventsByDate, filteredEvents]);

  // Color mapping for heatmap levels
  const getCellClasses = (level: number, isSelected: boolean, isToday: boolean) => {
    let base = 'transition-all duration-150 cursor-pointer rounded-[4px] ';

    if (isSelected) {
      base += 'ring-2 ring-stone-900 ring-offset-1 scale-110 z-20 shadow-sm ';
    } else {
      base += 'hover:ring-2 hover:ring-emerald-500 hover:scale-105 hover:z-10 ';
    }

    if (isToday) {
      base += 'border border-amber-500 ';
    } else {
      base += 'border ';
    }

    switch (level) {
      case 0:
        return base + 'bg-[#F4F2EE] border-[#E8E4DC] hover:bg-[#EAE6DF]';
      case 1:
        return base + 'bg-[#D3EFE3] border-[#B2E4CF] hover:bg-[#BEE9D7]';
      case 2:
        return base + 'bg-[#76CFAB] border-[#55C096] hover:bg-[#60C69C]';
      case 3:
        return base + 'bg-[#1B7A63] border-[#156753] hover:bg-[#14624F]';
      case 4:
        return base + 'bg-[#0F4A3E] border-[#0A362D] hover:bg-[#0B382F]';
      default:
        return base + 'bg-[#F4F2EE] border-[#E8E4DC]';
    }
  };

  // Selected day details
  const selectedDayData = useMemo(() => {
    if (!selectedDateString) return null;
    for (const w of weeks) {
      for (const d of w) {
        if (d.dateString === selectedDateString) return d;
      }
    }
    return null;
  }, [selectedDateString, weeks]);

  // Monthly breakdown summary for the 3 months
  const monthlySummary = useMemo(() => {
    const monthsMap = new Map<string, { label: string; count: number; activeDays: number }>();

    filteredEvents.forEach((ev) => {
      const d = new Date(ev.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const current = monthsMap.get(key) || { label, count: 0, activeDays: 0 };
      current.count++;
      monthsMap.set(key, current);
    });

    return Array.from(monthsMap.values());
  }, [filteredEvents]);

  // Day of week labels
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white border border-[#EBE8E3] rounded-2xl p-6 shadow-xs space-y-6">
      {/* 1. Header & Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F2EFE9]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#DDF3EA] text-[#0F4A3E]">
              <Calendar className="w-4 h-4" />
            </span>
            <h2 className="font-serif text-xl font-bold text-stone-900 tracking-tight">
              Application Activity Heatmap
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold border border-stone-200">
              Last 3 Months (90 Days)
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Visualizing daily momentum across applications submitted, interview rounds, and pipeline progressions.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF9F7] border border-[#EBE8E3] rounded-xl self-start md:self-auto">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Activity ({allRawEvents.length})
          </button>
          <button
            onClick={() => setSelectedFilter('applied')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedFilter === 'applied'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Applied
          </button>
          <button
            onClick={() => setSelectedFilter('interviews')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedFilter === 'interviews'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Interviews
          </button>
          <button
            onClick={() => setSelectedFilter('updates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedFilter === 'updates'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Updates
          </button>
        </div>
      </div>

      {/* 2. Key Stats Strip (Streaks & Active Days) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#FAF9F7] border border-[#EBE8E3] rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Active Streak</span>
          </div>
          <p className="text-2xl font-serif text-stone-900 font-bold mt-1">
            {streakStats.currentStreak} <span className="text-xs font-sans font-normal text-stone-500">days</span>
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">Consecutive active cadence</p>
        </div>

        <div className="bg-[#FAF9F7] border border-[#EBE8E3] rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Longest Streak</span>
          </div>
          <p className="text-2xl font-serif text-stone-900 font-bold mt-1">
            {streakStats.longestStreak} <span className="text-xs font-sans font-normal text-stone-500">days</span>
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">Best search momentum</p>
        </div>

        <div className="bg-[#FAF9F7] border border-[#EBE8E3] rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
            <Activity className="w-3.5 h-3.5 text-[#0F4A3E]" />
            <span>Active Days</span>
          </div>
          <p className="text-2xl font-serif text-stone-900 font-bold mt-1">
            {streakStats.activeDaysCount}{' '}
            <span className="text-xs font-sans font-normal text-stone-500">
              / {streakStats.totalDays} ({Math.round((streakStats.activeDaysCount / Math.max(streakStats.totalDays, 1)) * 100)}%)
            </span>
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">Days with pipeline progress</p>
        </div>

        <div className="bg-[#FAF9F7] border border-[#EBE8E3] rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
            <span>Total Actions (90d)</span>
          </div>
          <p className="text-2xl font-serif text-stone-900 font-bold mt-1">
            {streakStats.totalActions}
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5 truncate" title={streakStats.peakDay}>
            Peak: {streakStats.peakDay}
          </p>
        </div>
      </div>

      {/* 3. The Contribution Heatmap Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span className="font-medium">
            Timeline: {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} —{' '}
            {anchorDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-stone-400 italic">Click any cell to inspect actions</span>
        </div>

        <div className="overflow-x-auto pb-2 pt-1">
          <div className="inline-block min-w-full">
            {/* Month labels along the top */}
            <div className="flex ml-8 mb-1.5 text-[11px] font-semibold text-stone-500">
              {weeks.map((week, idx) => {
                // If this week begins a new month or contains the 1st of a month
                const firstOfMonth = week.find((d) => d.dayOfMonth === 1 || (idx === 0 && d.dayOfWeek === 0));
                const showMonthLabel =
                  firstOfMonth ||
                  (idx === 0
                    ? week[0].date.toLocaleDateString('en-US', { month: 'short' })
                    : idx === 4 || idx === 9
                    ? week[0].date.toLocaleDateString('en-US', { month: 'short' })
                    : null);

                return (
                  <div key={idx} className="w-[18px] mr-1.5 text-left shrink-0">
                    {showMonthLabel && typeof showMonthLabel === 'object' ? (
                      <span className="text-stone-700 font-bold uppercase tracking-wider text-[10px]">
                        {firstOfMonth?.date.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    ) : showMonthLabel && typeof showMonthLabel === 'string' ? (
                      <span className="text-stone-700 font-bold uppercase tracking-wider text-[10px]">
                        {showMonthLabel}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Heatmap Row by Day of Week */}
            <div className="flex gap-2">
              {/* Day Labels column (Mon, Wed, Fri) */}
              <div className="flex flex-col gap-1.5 text-[10px] font-medium text-stone-400 pr-1 shrink-0 select-none">
                <span className="h-[18px] leading-[18px] text-transparent">Sun</span>
                <span className="h-[18px] leading-[18px]">Mon</span>
                <span className="h-[18px] leading-[18px] text-transparent">Tue</span>
                <span className="h-[18px] leading-[18px]">Wed</span>
                <span className="h-[18px] leading-[18px] text-transparent">Thu</span>
                <span className="h-[18px] leading-[18px]">Fri</span>
                <span className="h-[18px] leading-[18px] text-transparent">Sat</span>
              </div>

              {/* 14 Columns of Weeks */}
              <div className="flex gap-1.5">
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1.5 shrink-0">
                    {week.map((day) => {
                      const isSelected = selectedDateString === day.dateString;
                      return (
                        <button
                          key={day.dateString}
                          onClick={() => {
                            if (selectedDateString === day.dateString) {
                              setSelectedDateString(null);
                            } else {
                              setSelectedDateString(day.dateString);
                            }
                          }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredDay({
                              day,
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }}
                          onMouseLeave={() => setHoveredDay(null)}
                          className={`w-[18px] h-[18px] ${getCellClasses(day.level, isSelected, day.isToday)}`}
                          title={`${day.date.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}: ${day.count} action${day.count === 1 ? '' : 's'}`}
                          aria-label={`${day.dateString}: ${day.count} actions`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 text-xs text-stone-500 border-t border-[#F2EFE9]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-stone-400">Activity Intensity:</span>
            <span className="text-[11px] text-stone-400">Less</span>
            <div className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-[3px] bg-[#F4F2EE] border border-[#E8E4DC]" title="0 activities" />
              <span className="w-3.5 h-3.5 rounded-[3px] bg-[#D3EFE3] border border-[#B2E4CF]" title="1 activity" />
              <span className="w-3.5 h-3.5 rounded-[3px] bg-[#76CFAB] border border-[#55C096]" title="2 activities" />
              <span className="w-3.5 h-3.5 rounded-[3px] bg-[#1B7A63] border border-[#156753]" title="3 activities" />
              <span className="w-3.5 h-3.5 rounded-[3px] bg-[#0F4A3E] border border-[#0A362D]" title="4+ activities" />
            </div>
            <span className="text-[11px] text-stone-400">More</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-stone-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Active Job Search Day
            </span>
            <span className="flex items-center gap-1 text-stone-600">
              <span className="w-2.5 h-2.5 rounded-full border border-amber-500 bg-amber-50 inline-block" />
              Current Date Anchor
            </span>
          </div>
        </div>
      </div>

      {/* 4. Floating Hover Tooltip (Portaled / Absolute Relative) */}
      {hoveredDay && !selectedDateString && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-stone-900 text-white rounded-xl px-3 py-2 text-xs shadow-xl max-w-xs border border-stone-800"
          style={{
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y - 8}px`,
          }}
        >
          <div className="font-semibold text-stone-100 flex items-center justify-between gap-3">
            <span>
              {hoveredDay.day.date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-800 text-emerald-300 font-mono">
              {hoveredDay.day.count} {hoveredDay.day.count === 1 ? 'action' : 'actions'}
            </span>
          </div>

          {hoveredDay.day.events.length > 0 ? (
            <div className="mt-1.5 space-y-1 text-[11px] text-stone-300">
              {hoveredDay.day.events.slice(0, 3).map((ev) => (
                <div key={ev.id} className="flex items-start gap-1.5 leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                  <span className="truncate">
                    <strong>{ev.company}</strong>: {ev.title}
                  </span>
                </div>
              ))}
              {hoveredDay.day.events.length > 3 && (
                <p className="text-[10px] text-stone-400 pt-0.5">
                  +{hoveredDay.day.events.length - 3} more actions
                </p>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-stone-400 mt-1 italic">No actions recorded</p>
          )}
        </div>
      )}

      {/* 5. Detailed Day Activity Inspector (shown when day is clicked) */}
      {selectedDayData && (
        <div className="bg-[#FAF9F7] border border-[#E0DBD1] rounded-xl p-5 shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBE8E3]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-100 text-[#0F4A3E]">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
                  <span>
                    {selectedDayData.date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {selectedDayData.isToday && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold uppercase tracking-wider">
                      Today
                    </span>
                  )}
                </h3>
                <p className="text-xs text-stone-500">
                  {selectedDayData.count}{' '}
                  {selectedDayData.count === 1 ? 'activity logged' : 'activities logged'} on this date
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedDateString(null)}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
              title="Close inspector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedDayData.events.length > 0 ? (
            <div className="mt-4 space-y-2.5">
              {selectedDayData.events.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white border border-[#EBE8E3] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-stone-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-stone-900">
                        {ev.company}
                      </span>
                      <span className="text-xs text-stone-500">· {ev.role}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          ev.type === 'applied'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : ev.type === 'interview'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : ev.type === 'status_change'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : ev.type === 'follow_up'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}
                      >
                        {ev.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 font-medium">{ev.title}</p>
                    <p className="text-xs text-stone-500">{ev.description}</p>
                  </div>

                  {ev.applicationRef && onSelectApplication && (
                    <button
                      onClick={() => onSelectApplication(ev.applicationRef!)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs font-semibold transition-all shrink-0 cursor-pointer self-start sm:self-auto"
                    >
                      <span>View in Pipeline</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 p-6 bg-white border border-[#EBE8E3] rounded-xl text-center space-y-2">
              <p className="text-xs text-stone-500">
                No activity was logged on this date.
              </p>
              {onStartNewAnalysis && (
                <button
                  onClick={onStartNewAnalysis}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log application analysis</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 6. Monthly Activity Distribution Footprint */}
      {monthlySummary.length > 0 && (
        <div className="bg-[#FAF9F7] border border-[#EBE8E3] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-stone-600 space-y-0.5">
            <span className="font-semibold text-stone-900">3-Month Intensity Trajectory:</span>
            <p className="text-stone-500">
              Consistency is key to landing top offers. Keep your active streak going!
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {monthlySummary.slice(-3).map((m, idx) => (
              <div key={idx} className="text-center">
                <p className="text-xs font-bold text-stone-800">{m.count}</p>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider">{m.label.split(' ')[0]}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
