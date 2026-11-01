import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { JobApplication, ApplicationStatus } from '../types/job';
import { PieChart as PieIcon, ArrowRight } from 'lucide-react';

interface StatusSliceData {
  status: 'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected';
  label: string;
  count: number;
  color: string;
  hoverColor: string;
  badgeBg: string;
  badgeText: string;
}

interface ApplicationStatusPieChartProps {
  applications: JobApplication[];
  onSelectStatusFilter?: (status: string) => void;
  onNavigateToPipeline?: () => void;
}

const STATUS_CONFIG: Record<
  'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected',
  { label: string; color: string; hoverColor: string; badgeBg: string; badgeText: string }
> = {
  wishlist: {
    label: 'Wishlist',
    color: '#94A3B8', // Slate 400
    hoverColor: '#64748B',
    badgeBg: '#F1F5F9',
    badgeText: '#475569'
  },
  applied: {
    label: 'Applied',
    color: '#3B82F6', // Blue 500
    hoverColor: '#2563EB',
    badgeBg: '#EFF6FF',
    badgeText: '#1D4ED8'
  },
  interviewing: {
    label: 'Interview',
    color: '#8B5CF6', // Purple 500
    hoverColor: '#7C3AED',
    badgeBg: '#F5F3FF',
    badgeText: '#6D28D9'
  },
  offer: {
    label: 'Offer',
    color: '#10B981', // Emerald 500
    hoverColor: '#059669',
    badgeBg: '#ECFDF5',
    badgeText: '#047857'
  },
  rejected: {
    label: 'Rejected',
    color: '#F43F5E', // Rose 500
    hoverColor: '#E11D48',
    badgeBg: '#FFF1F2',
    badgeText: '#BE123C'
  }
};

export const ApplicationStatusPieChart: React.FC<ApplicationStatusPieChartProps> = ({
  applications,
  onSelectStatusFilter,
  onNavigateToPipeline
}) => {
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  // Group applications by status
  const sliceData: StatusSliceData[] = useMemo(() => {
    const counts: Record<string, number> = {
      wishlist: 0,
      applied: 0,
      interviewing: 0,
      offer: 0,
      rejected: 0
    };

    applications.forEach((app) => {
      const s = app.status as keyof typeof counts;
      if (counts[s] !== undefined) {
        counts[s]++;
      } else {
        counts.wishlist++;
      }
    });

    const statuses: ('wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected')[] = [
      'wishlist',
      'applied',
      'interviewing',
      'offer',
      'rejected'
    ];

    return statuses.map((statusKey) => ({
      status: statusKey,
      label: STATUS_CONFIG[statusKey].label,
      count: counts[statusKey],
      color: STATUS_CONFIG[statusKey].color,
      hoverColor: STATUS_CONFIG[statusKey].hoverColor,
      badgeBg: STATUS_CONFIG[statusKey].badgeBg,
      badgeText: STATUS_CONFIG[statusKey].badgeText
    }));
  }, [applications]);

  const totalCount = applications.length;

  // D3 Pie Generator
  const width = 220;
  const height = 220;
  const outerRadius = 95;
  const innerRadius = 58; // Donut style
  const hoverOuterRadius = 104;

  const pieGenerator = useMemo(() => {
    return d3
      .pie<StatusSliceData>()
      .value((d) => d.count)
      .sort(null)
      .padAngle(totalCount > 0 ? 0.03 : 0);
  }, [totalCount]);

  // If no applications, render a placeholder slice
  const activeSlices = useMemo(() => {
    const hasData = sliceData.some((d) => d.count > 0);
    if (!hasData) {
      return [];
    }
    return pieGenerator(sliceData.filter((d) => d.count > 0));
  }, [sliceData, pieGenerator]);

  // Compute hovered slice info
  const activeHoverData = useMemo(() => {
    if (!hoveredStatus) return null;
    return sliceData.find((d) => d.status === hoveredStatus);
  }, [hoveredStatus, sliceData]);

  return (
    <div className="bg-white border border-[#EBE8E3] rounded-2xl p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F2EFE9]">
        <div>
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#0F4A3E]" />
            <h2 className="font-serif text-lg font-bold text-stone-900 tracking-tight">
              Application Status Distribution
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            D3-powered breakdown across pipeline stages (Wishlist, Applied, Interview, Offer, Rejected)
          </p>
        </div>

        {onNavigateToPipeline && (
          <button
            onClick={onNavigateToPipeline}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer transition-colors self-start sm:self-auto"
          >
            <span>Pipeline Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Chart + Legend Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-5">
        {/* D3 SVG Donut / Pie Chart */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible select-none"
          >
            <g transform={`translate(${width / 2}, ${height / 2})`}>
              {/* If no data, show empty ring */}
              {activeSlices.length === 0 ? (
                <circle
                  r={outerRadius}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth={outerRadius - innerRadius}
                  strokeDasharray="4 4"
                />
              ) : (
                activeSlices.map((arcDatum) => {
                  const isHovered = hoveredStatus === arcDatum.data.status;
                  const arcGen = d3
                    .arc<d3.PieArcDatum<StatusSliceData>>()
                    .innerRadius(innerRadius)
                    .outerRadius(isHovered ? hoverOuterRadius : outerRadius)
                    .cornerRadius(4);

                  const pathString = arcGen(arcDatum) || '';

                  return (
                    <path
                      key={arcDatum.data.status}
                      d={pathString}
                      fill={isHovered ? arcDatum.data.hoverColor : arcDatum.data.color}
                      className="transition-all duration-200 cursor-pointer"
                      style={{
                        filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none'
                      }}
                      onMouseEnter={() => setHoveredStatus(arcDatum.data.status)}
                      onMouseLeave={() => setHoveredStatus(null)}
                      onClick={() => onSelectStatusFilter?.(arcDatum.data.status)}
                    >
                      <title>{`${arcDatum.data.label}: ${arcDatum.data.count} (${Math.round(
                        (arcDatum.data.count / totalCount) * 100
                      )}%)`}</title>
                    </path>
                  );
                })
              )}
            </g>
          </svg>

          {/* Center Callout inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {activeHoverData ? (
              <div className="text-center animate-in fade-in zoom-in-95 duration-150">
                <span className="text-[11px] font-semibold text-stone-500 block uppercase tracking-wider">
                  {activeHoverData.label}
                </span>
                <span className="text-2xl font-serif font-bold text-stone-900 leading-none my-0.5 block">
                  {activeHoverData.count}
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  {totalCount > 0
                    ? `${Math.round((activeHoverData.count / totalCount) * 100)}% of total`
                    : '0%'}
                </span>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-[10px] font-semibold text-stone-400 block uppercase tracking-wider">
                  Total
                </span>
                <span className="text-3xl font-serif font-bold text-stone-900 leading-none my-0.5 block">
                  {totalCount}
                </span>
                <span className="text-[10px] text-stone-400">
                  {totalCount === 1 ? 'Opportunity' : 'Opportunities'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Legend & Breakdown Table */}
        <div className="md:col-span-7 space-y-2.5">
          <div className="grid grid-cols-1 gap-2">
            {sliceData.map((item) => {
              const isHovered = hoveredStatus === item.status;
              const percent = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;

              return (
                <div
                  key={item.status}
                  onMouseEnter={() => setHoveredStatus(item.status)}
                  onMouseLeave={() => setHoveredStatus(null)}
                  onClick={() => onSelectStatusFilter?.(item.status)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isHovered
                      ? 'bg-stone-50 border-stone-300 shadow-xs ring-1 ring-stone-200'
                      : 'bg-white border-[#F2EFE9] hover:bg-stone-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Color Swatch Dot */}
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-800">
                        {item.label}
                      </span>
                      {item.status === 'offer' && item.count > 0 && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                          Won
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Visual miniature bar */}
                    <div className="w-16 sm:w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>

                    <div className="flex items-baseline gap-2 min-w-[54px] justify-end">
                      <span className="text-xs font-bold text-stone-900 font-mono">
                        {item.count}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono w-7 text-right">
                        {percent}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-stone-400 border-t border-[#F2EFE9]">
            <span>Tip: Hover over chart slices or list rows to inspect percentage share.</span>
            {onNavigateToPipeline && (
              <button
                onClick={onNavigateToPipeline}
                className="text-[#0F4A3E] font-semibold hover:underline cursor-pointer"
              >
                Open in Pipeline →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
