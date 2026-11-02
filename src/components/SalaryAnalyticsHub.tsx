import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  ReferenceLine,
  Cell
} from 'recharts';
import { JobApplication, UserProfile, ApplicationStatus } from '../types/job';
import {
  BadgeDollarSign,
  TrendingUp,
  Building2,
  Briefcase,
  Layers,
  ArrowUpRight,
  Filter,
  Sparkles,
  ChevronRight,
  DollarSign,
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  ExternalLink,
  Target,
  Scale,
  Award,
  CircleDollarSign,
  Copy,
  Check
} from 'lucide-react';

interface SalaryAnalyticsHubProps {
  applications: JobApplication[];
  userProfile?: UserProfile;
  onSelectApplication: (app: JobApplication) => void;
  onNavigateToOffers?: () => void;
  onNavigateToPipeline?: () => void;
}

export type CurrencyMode = 'INR' | 'USD';
export type GroupingDimension = 'industry' | 'role' | 'status';

export interface ParsedSalaryJob {
  application: JobApplication;
  company: string;
  role: string;
  status: ApplicationStatus;
  fitScore: number;
  industry: string;
  roleTrack: string;
  rawSalary: string;
  minLPA: number;
  maxLPA: number;
  midpointLPA: number;
  minUSD: number;
  maxUSD: number;
  midpointUSD: number;
  isHourly: boolean;
  isEstimated: boolean;
}

interface GroupAggregate {
  key: string;
  label: string;
  jobCount: number;
  min: number;
  max: number;
  avg: number;
  totalPool: number;
  sampleCompanies: string[];
  jobs: ParsedSalaryJob[];
}

const USD_TO_INR_RATE = 86.5;

/**
 * Intelligent parser that extracts structured salary numbers from diverse textual inputs
 * Handles:
 * - INR: ₹7,20,000 / year, ₹5,00,000 - ₹7,50,000 / year, 12 LPA
 * - USD: $25 - $35 / hour (~₹20 LPA), $120,000 - $160,000 / year
 */
function parseSalaryFromApplication(app: JobApplication): ParsedSalaryJob {
  const text = (app.salary || app.parsedDetails?.salaryRange || '').trim();
  const lower = text.toLowerCase();

  let minLPA = 0;
  let maxLPA = 0;
  let isHourly = false;
  let isEstimated = false;

  // 1. Detect hourly USD (e.g. "$25 - $35 / hour (~₹20 LPA)")
  if (lower.includes('/ hour') || lower.includes('/hr') || lower.includes('hourly')) {
    isHourly = true;
    const matches = text.match(/\$?(\d+)(?:\s*-\s*\$?(\d+))?/);
    if (matches) {
      const hrMin = parseFloat(matches[1]) || 25;
      const hrMax = matches[2] ? parseFloat(matches[2]) : hrMin;
      // 2000 hours per year
      const usdMin = hrMin * 2000;
      const usdMax = hrMax * 2000;
      minLPA = (usdMin * USD_TO_INR_RATE) / 100000;
      maxLPA = (usdMax * USD_TO_INR_RATE) / 100000;
    } else {
      minLPA = 15;
      maxLPA = 20;
    }
  }
  // 2. Detect INR Rupee symbol or LPA format
  else if (text.includes('₹') || lower.includes('lpa') || lower.includes('lakh')) {
    // Check if written in full number: ₹7,20,000 or ₹5,00,000 - ₹7,50,000
    const rupeeMatches = text.match(/₹\s*([\d,]+)(?:\s*-\s*₹?\s*([\d,]+))?/);
    if (rupeeMatches) {
      const num1 = parseFloat(rupeeMatches[1].replace(/,/g, ''));
      const num2 = rupeeMatches[2] ? parseFloat(rupeeMatches[2].replace(/,/g, '')) : num1;

      if (num1 >= 10000) {
        minLPA = num1 / 100000;
        maxLPA = num2 / 100000;
      } else {
        minLPA = num1;
        maxLPA = num2;
      }
    } else {
      // e.g. "12 LPA" or "6 - 12 LPA"
      const lpaMatches = text.match(/([\d.]+)(?:\s*-\s*([\d.]+))?\s*lpa/i);
      if (lpaMatches) {
        minLPA = parseFloat(lpaMatches[1]);
        maxLPA = lpaMatches[2] ? parseFloat(lpaMatches[2]) : minLPA;
      }
    }
  }
  // 3. Detect standard USD annual numbers: $120,000 - $160,000
  else if (text.includes('$')) {
    const usdMatches = text.match(/\$\s*([\d,]+)(?:\s*-\s*\$?\s*([\d,]+))?/);
    if (usdMatches) {
      const u1 = parseFloat(usdMatches[1].replace(/,/g, ''));
      const u2 = usdMatches[2] ? parseFloat(usdMatches[2].replace(/,/g, '')) : u1;
      minLPA = (u1 * USD_TO_INR_RATE) / 100000;
      maxLPA = (u2 * USD_TO_INR_RATE) / 100000;
    }
  }

  // Fallback defaults if missing or unparseable
  if (minLPA === 0 && maxLPA === 0) {
    isEstimated = true;
    // Default estimate based on role
    const rLower = (app.role || '').toLowerCase();
    if (rLower.includes('frontend') || rLower.includes('react')) {
      minLPA = 8.0;
      maxLPA = 12.0;
    } else if (rLower.includes('mern') || rLower.includes('full-stack') || rLower.includes('fullstack')) {
      minLPA = 7.2;
      maxLPA = 14.0;
    } else if (rLower.includes('ai') || rLower.includes('llm')) {
      minLPA = 15.0;
      maxLPA = 22.0;
    } else {
      minLPA = 6.0;
      maxLPA = 9.0;
    }
  }

  if (maxLPA < minLPA) {
    maxLPA = minLPA;
  }

  const midpointLPA = Number(((minLPA + maxLPA) / 2).toFixed(2));
  const minUSD = Math.round((minLPA * 100000) / USD_TO_INR_RATE);
  const maxUSD = Math.round((maxLPA * 100000) / USD_TO_INR_RATE);
  const midpointUSD = Math.round((midpointLPA * 100000) / USD_TO_INR_RATE);

  // Industry Categorization
  const compLower = (app.company || '').toLowerCase();
  const descLower = (app.jobDescription || '').toLowerCase();
  const tagsStr = (app.tags || []).join(' ').toLowerCase();

  let industry = 'Software & Internet';
  if (compLower.includes('razorpay') || compLower.includes('stripe') || tagsStr.includes('fintech') || descLower.includes('payment')) {
    industry = 'FinTech & Payments';
  } else if (compLower.includes('outlier') || tagsStr.includes('ai') || tagsStr.includes('prompt') || descLower.includes('llm') || descLower.includes('frontier ai')) {
    industry = 'AI & Frontier Tech';
  } else if (compLower.includes('haronex') || compLower.includes('metromart') || descLower.includes('multi-vendor') || descLower.includes('ecommerce')) {
    industry = 'E-Commerce & RetailTech';
  } else if (compLower.includes('zomato') || compLower.includes('swiggy') || tagsStr.includes('foodtech') || descLower.includes('food delivery')) {
    industry = 'Consumer Tech & FoodTech';
  } else if (compLower.includes('zepto') || compLower.includes('blinkit') || tagsStr.includes('quickcommerce') || descLower.includes('dark store')) {
    industry = 'QuickCommerce & Logistics';
  } else if (compLower.includes('tcs') || compLower.includes('jinarth') || compLower.includes('tata') || tagsStr.includes('consulting') || descLower.includes('enterprise solutions')) {
    industry = 'Enterprise IT & Services';
  }

  // Role Track Categorization
  const roleLower = (app.role || '').toLowerCase();
  let roleTrack = 'General Software Engineer';
  if (roleLower.includes('mern') || roleLower.includes('full-stack') || roleLower.includes('fullstack')) {
    roleTrack = 'Full-Stack & MERN';
  } else if (roleLower.includes('frontend') || roleLower.includes('react') || roleLower.includes('ui')) {
    roleTrack = 'Frontend & UI Engineering';
  } else if (roleLower.includes('ai') || roleLower.includes('llm') || roleLower.includes('evaluat') || roleLower.includes('prompt')) {
    roleTrack = 'AI & LLM Evaluation';
  } else if (roleLower.includes('backend') || roleLower.includes('cloud') || roleLower.includes('node')) {
    roleTrack = 'Backend & Cloud Services';
  } else if (roleLower.includes('associate') || roleLower.includes('java')) {
    roleTrack = 'Enterprise & Java Engineering';
  }

  return {
    application: app,
    company: app.company,
    role: app.role,
    status: app.status,
    fitScore: app.fitScore || 85,
    industry,
    roleTrack,
    rawSalary: text || 'Estimated from market standards',
    minLPA: Number(minLPA.toFixed(2)),
    maxLPA: Number(maxLPA.toFixed(2)),
    midpointLPA,
    minUSD,
    maxUSD,
    midpointUSD,
    isHourly,
    isEstimated
  };
}

export const SalaryAnalyticsHub: React.FC<SalaryAnalyticsHubProps> = ({
  applications,
  userProfile,
  onSelectApplication,
  onNavigateToOffers,
  onNavigateToPipeline
}) => {
  const [currency, setCurrency] = useState<CurrencyMode>('INR');
  const [grouping, setGrouping] = useState<GroupingDimension>('industry');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // SVG ref for D3 Scatter/Bubble chart
  const d3SvgRef = useRef<SVGSVGElement | null>(null);

  // Parse all applications into structured salary data
  const parsedJobs: ParsedSalaryJob[] = useMemo(() => {
    return applications.map(parseSalaryFromApplication);
  }, [applications]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return parsedJobs.filter((job) => {
      if (selectedStatusFilter !== 'all' && job.status !== selectedStatusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          job.company.toLowerCase().includes(q) ||
          job.role.toLowerCase().includes(q) ||
          job.industry.toLowerCase().includes(q) ||
          job.roleTrack.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [parsedJobs, selectedStatusFilter, searchQuery]);

  // Executive Top Metrics
  const summaryMetrics = useMemo(() => {
    if (parsedJobs.length === 0) {
      return {
        topOffer: 0,
        topOfferCompany: 'None',
        highestComp: 0,
        highestCompCompany: 'None',
        avgMidpoint: 0,
        totalPipelinePool: 0,
        expectedConversionValue: 0
      };
    }

    const offers = parsedJobs.filter((j) => j.status === 'offer');
    const topOfferJob = offers.sort((a, b) => b.midpointLPA - a.midpointLPA)[0];

    const sortedByComp = [...parsedJobs].sort((a, b) => b.maxLPA - a.maxLPA);
    const highestCompJob = sortedByComp[0];

    const totalMidpoint = parsedJobs.reduce((acc, j) => acc + j.midpointLPA, 0);
    const avgMidpoint = Number((totalMidpoint / parsedJobs.length).toFixed(1));

    // Expected value weighted by stage probabilities:
    // Offer = 100%, Interviewing = 40%, Applied = 15%, Wishlist = 5%
    const expectedValue = parsedJobs.reduce((acc, j) => {
      let weight = 0.15;
      if (j.status === 'offer') weight = 1.0;
      else if (j.status === 'interviewing') weight = 0.45;
      else if (j.status === 'wishlist') weight = 0.05;
      return acc + j.midpointLPA * weight;
    }, 0);

    return {
      topOffer: topOfferJob ? topOfferJob.midpointLPA : 0,
      topOfferCompany: topOfferJob ? topOfferJob.company : 'Under Negotiation',
      highestComp: highestCompJob ? highestCompJob.maxLPA : 0,
      highestCompCompany: highestCompJob ? `${highestCompJob.company} (${highestCompJob.role})` : 'None',
      avgMidpoint,
      totalPipelinePool: Number(totalMidpoint.toFixed(1)),
      expectedConversionValue: Number(expectedValue.toFixed(1))
    };
  }, [parsedJobs]);

  // Aggregate Data by Grouping (Industry, Role Track, or Pipeline Status)
  const groupAggregates: GroupAggregate[] = useMemo(() => {
    const map = new Map<string, ParsedSalaryJob[]>();

    filteredJobs.forEach((job) => {
      let key = job.industry;
      if (grouping === 'role') key = job.roleTrack;
      else if (grouping === 'status') {
        key = job.status.toUpperCase();
      }

      const list = map.get(key) || [];
      list.push(job);
      map.set(key, list);
    });

    const aggregates: GroupAggregate[] = [];

    map.forEach((jobs, key) => {
      const mins = jobs.map((j) => (currency === 'INR' ? j.minLPA : j.minUSD));
      const maxs = jobs.map((j) => (currency === 'INR' ? j.maxLPA : j.maxUSD));
      const midpoints = jobs.map((j) => (currency === 'INR' ? j.midpointLPA : j.midpointUSD));

      const min = Math.min(...mins);
      const max = Math.max(...maxs);
      const avg = Number((midpoints.reduce((a, b) => a + b, 0) / midpoints.length).toFixed(1));
      const totalPool = Number(midpoints.reduce((a, b) => a + b, 0).toFixed(1));
      const sampleCompanies = Array.from(new Set(jobs.map((j) => j.company))).slice(0, 3);

      aggregates.push({
        key,
        label: key,
        jobCount: jobs.length,
        min,
        max,
        avg,
        totalPool,
        sampleCompanies,
        jobs
      });
    });

    return aggregates.sort((a, b) => b.avg - a.avg);
  }, [filteredJobs, grouping, currency]);

  // Recharts Chart Data (Floating range bar with min base and range spread)
  const rechartsData = useMemo(() => {
    return groupAggregates.map((g) => ({
      name: g.label,
      minBase: g.min,
      rangeSpread: Number((g.max - g.min).toFixed(1)),
      avg: g.avg,
      count: g.jobCount,
      companies: g.sampleCompanies.join(', ')
    }));
  }, [groupAggregates]);

  // Target Salary Benchmark Line
  const targetSalaryBenchmark = currency === 'INR' ? 12.0 : 65000;

  // D3 Interactive Scatter / Bubble Chart Rendering
  useEffect(() => {
    if (!d3SvgRef.current || parsedJobs.length === 0) return;

    const svg = d3.select(d3SvgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 320;
    const margin = { top: 30, right: 40, bottom: 50, left: 60 };

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // X Scale: Salary Midpoint
    const xMax = d3.max(parsedJobs, (d) => (currency === 'INR' ? d.maxLPA : d.maxUSD)) || 25;
    const xMin = Math.max(0, (d3.min(parsedJobs, (d) => (currency === 'INR' ? d.minLPA : d.minUSD)) || 4) - 2);

    const xScale = d3.scaleLinear().domain([xMin, xMax * 1.05]).range([0, innerWidth]);

    // Y Scale: Fit Match Score (0 - 100)
    const yScale = d3.scaleLinear().domain([75, 100]).range([innerHeight, 0]);

    // Gridlines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.15)
      .call(d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => ''));

    // X Axis
    const xAxis = d3.axisBottom(xScale).ticks(7).tickFormat((d) => (currency === 'INR' ? `₹${d}L` : `$${Math.round(Number(d) / 1000)}k`));
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis)
      .attr('color', '#78716C')
      .selectAll('text')
      .attr('font-size', '11px')
      .attr('font-family', 'sans-serif');

    // Y Axis
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${d}%`);
    g.append('g')
      .call(yAxis)
      .attr('color', '#78716C')
      .selectAll('text')
      .attr('font-size', '11px')
      .attr('font-family', 'sans-serif');

    // Axis Labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('fill', '#78716C')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('text-anchor', 'middle')
      .text(`Pipeline Job Salary (${currency === 'INR' ? '₹ LPA' : '$ USD Annual'})`);

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -42)
      .attr('fill', '#78716C')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('text-anchor', 'middle')
      .text('ATS & Opportunity Fit Score');

    // Target Benchmark Reference Line
    if (xScale(targetSalaryBenchmark) >= 0 && xScale(targetSalaryBenchmark) <= innerWidth) {
      g.append('line')
        .attr('x1', xScale(targetSalaryBenchmark))
        .attr('x2', xScale(targetSalaryBenchmark))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#059669')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4 4');

      g.append('text')
        .attr('x', xScale(targetSalaryBenchmark) + 6)
        .attr('y', 14)
        .attr('fill', '#059669')
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .text(`Target: ${currency === 'INR' ? '₹12 LPA' : '$65k'}`);
    }

    // Color mapper by status
    const statusColors: Record<ApplicationStatus, string> = {
      offer: '#10B981', // Emerald
      interviewing: '#8B5CF6', // Purple
      applied: '#3B82F6', // Blue
      wishlist: '#94A3B8', // Slate
      rejected: '#F43F5E'
    };

    // Tooltip Container
    const tooltip = d3
      .select('body')
      .selectAll('.d3-salary-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'd3-salary-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', '#18181B')
      .style('color', '#FFFFFF')
      .style('padding', '10px 14px')
      .style('border-radius', '12px')
      .style('font-size', '12px')
      .style('box-shadow', '0 10px 25px rgba(0,0,0,0.3)')
      .style('pointer-events', 'none')
      .style('z-index', '9999');

    // Draw Bubbles
    g.selectAll('.job-bubble')
      .data(parsedJobs)
      .enter()
      .append('circle')
      .attr('class', 'job-bubble')
      .attr('cx', (d) => xScale(currency === 'INR' ? d.midpointLPA : d.midpointUSD))
      .attr('cy', (d) => yScale(d.fitScore))
      .attr('r', (d) => (d.status === 'offer' ? 12 : d.status === 'interviewing' ? 10 : 8))
      .attr('fill', (d) => statusColors[d.status] || '#10B981')
      .attr('fill-opacity', 0.85)
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', (event: MouseEvent, d) => {
        d3.select(event.currentTarget as SVGCircleElement).attr('r', 14).attr('stroke', '#0F4A3E').attr('stroke-width', 3);
        tooltip
          .style('visibility', 'visible')
          .html(`
            <div style="font-weight: bold; font-size: 13px; color: #34D399;">${d.company}</div>
            <div style="font-size: 11px; color: #E4E4E7; margin-top: 2px;">${d.role}</div>
            <div style="font-size: 11px; color: #A1A1AA; margin-top: 4px;">
              Salary: <strong>${d.rawSalary}</strong>
            </div>
            <div style="font-size: 10px; color: #FBBF24; margin-top: 2px;">
              Industry: ${d.industry} · Fit: ${d.fitScore}%
            </div>
            <div style="font-size: 9px; color: #9CA3AF; margin-top: 4px;">(Click bubble to open details)</div>
          `);
      })
      .on('mousemove', (event: MouseEvent) => {
        tooltip.style('top', `${event.pageY - 70}px`).style('left', `${event.pageX + 15}px`);
      })
      .on('mouseout', (event: MouseEvent, d) => {
        d3.select(event.currentTarget as SVGCircleElement)
          .attr('r', d.status === 'offer' ? 12 : d.status === 'interviewing' ? 10 : 8)
          .attr('stroke', '#FFFFFF')
          .attr('stroke-width', 2);
        tooltip.style('visibility', 'hidden');
      })
      .on('click', (_event, d) => {
        tooltip.style('visibility', 'hidden');
        onSelectApplication(d.application);
      });

    return () => {
      tooltip.remove();
    };
  }, [parsedJobs, currency, targetSalaryBenchmark, onSelectApplication]);

  // Copy Executive Markdown Summary
  const handleCopySummary = () => {
    const lines = [
      `# ApplyFlow Salary Analytics Report`,
      `Date: ${new Date().toLocaleDateString()}`,
      `Total Applications Analyzed: ${parsedJobs.length}`,
      `Top Confirmed Offer: ₹${summaryMetrics.topOffer} LPA (${summaryMetrics.topOfferCompany})`,
      `Highest Pipeline Comp: ₹${summaryMetrics.highestComp} LPA (${summaryMetrics.highestCompCompany})`,
      `Average Pipeline Salary: ₹${summaryMetrics.avgMidpoint} LPA`,
      `Total Active Pipeline Potential: ₹${summaryMetrics.totalPipelinePool} LPA`,
      `Probability-Weighted Pipeline Value: ₹${summaryMetrics.expectedConversionValue} LPA`,
      ``,
      `## Breakdown by Industry:`,
      ...groupAggregates.map(
        (g) => `- **${g.label}**: ${currency === 'INR' ? `₹${g.min}L - ₹${g.max}L (Avg ₹${g.avg}L)` : `$${g.min.toLocaleString()} - $${g.max.toLocaleString()}`} across ${g.jobCount} opportunities (${g.sampleCompanies.join(', ')})`
      )
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EBE8E3]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300">
              <BadgeDollarSign className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
              Salary Analytics & Pipeline Valuation
            </h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider font-sans border border-emerald-300">
              D3 & Recharts Visualizer
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1.5">
            Aggregated compensation ranges, industry benchmarks, and probability-weighted pipeline equity valuation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* Currency Toggle */}
          <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs font-semibold">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currency === 'INR' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              ₹ INR (LPA)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currency === 'USD' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              $ USD Annual
            </button>
          </div>

          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
            <span>{copiedSummary ? 'Copied Report' : 'Export Comp Report'}</span>
          </button>
        </div>
      </div>

      {/* 5 Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Top Confirmed Offer */}
        <div className="bg-white border border-[#EBE8E3] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Top Confirmed Offer</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-serif text-stone-900 font-bold my-1.5">
            {currency === 'INR' ? `₹${summaryMetrics.topOffer}L` : `$${Math.round((summaryMetrics.topOffer * 100000) / USD_TO_INR_RATE).toLocaleString()}`}
          </p>
          <p className="text-xs text-emerald-700 font-semibold truncate">
            {summaryMetrics.topOfferCompany}
          </p>
        </div>

        {/* Card 2: Highest Comp Opportunity */}
        <div className="bg-white border border-[#EBE8E3] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Highest Ceiling Lead</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-serif text-stone-900 font-bold my-1.5">
            {currency === 'INR' ? `₹${summaryMetrics.highestComp}L` : `$${Math.round((summaryMetrics.highestComp * 100000) / USD_TO_INR_RATE).toLocaleString()}`}
          </p>
          <p className="text-xs text-stone-500 truncate" title={summaryMetrics.highestCompCompany}>
            {summaryMetrics.highestCompCompany}
          </p>
        </div>

        {/* Card 3: Average Pipeline Midpoint */}
        <div className="bg-white border border-[#EBE8E3] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Average Pipeline Salary</span>
            <CircleDollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-serif text-stone-900 font-bold my-1.5">
            {currency === 'INR' ? `₹${summaryMetrics.avgMidpoint}L` : `$${Math.round((summaryMetrics.avgMidpoint * 100000) / USD_TO_INR_RATE).toLocaleString()}`}
          </p>
          <p className="text-xs text-stone-500">
            Across {parsedJobs.length} tracked roles
          </p>
        </div>

        {/* Card 4: Total Pipeline Potential Pool */}
        <div className="bg-white border border-[#EBE8E3] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Total Pipeline Value</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-serif text-stone-900 font-bold my-1.5">
            {currency === 'INR' ? `₹${summaryMetrics.totalPipelinePool}L` : `$${Math.round((summaryMetrics.totalPipelinePool * 100000) / USD_TO_INR_RATE).toLocaleString()}`}
          </p>
          <p className="text-xs text-stone-500">
            Sum of all active opportunities
          </p>
        </div>

        {/* Card 5: Probability-Weighted Value */}
        <div className="bg-white border border-emerald-300/80 bg-emerald-50/20 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
            <span>Weighted Expected Value</span>
            <Sparkles className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-3xl font-serif text-emerald-950 font-bold my-1.5">
            {currency === 'INR' ? `₹${summaryMetrics.expectedConversionValue}L` : `$${Math.round((summaryMetrics.expectedConversionValue * 100000) / USD_TO_INR_RATE).toLocaleString()}`}
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold">
            Stage conversion adjusted
          </p>
        </div>
      </div>

      {/* Visualizer Controls Filter Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Grouping Dimension Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Group Breakdown By:
          </span>
          <div className="inline-flex rounded-xl bg-stone-100 p-1 text-xs font-semibold">
            <button
              onClick={() => setGrouping('industry')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                grouping === 'industry' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Industry / Sector
            </button>
            <button
              onClick={() => setGrouping('role')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                grouping === 'role' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Role Track
            </button>
            <button
              onClick={() => setGrouping('status')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                grouping === 'status' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Pipeline Stage
            </button>
          </div>
        </div>

        {/* Pipeline Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-hidden"
          >
            <option value="all">All Stages ({parsedJobs.length} roles)</option>
            <option value="offer">Offer Letter Received</option>
            <option value="interviewing">Actively Interviewing</option>
            <option value="applied">Applied & Pending</option>
            <option value="wishlist">Wishlist Bookmarks</option>
          </select>
        </div>
      </div>

      {/* SECTION 1: RECHARTS FLOATING RANGE BAR CHART */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-800" />
              <span>Salary Range Distribution by {grouping === 'industry' ? 'Industry Sector' : grouping === 'role' ? 'Role Track' : 'Pipeline Stage'}</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Visualizes the minimum, spread, and average salary benchmarks across your pipeline compared to your target goal.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-stone-600">
              <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" />
              <span>Salary Range Span</span>
            </span>
            <span className="flex items-center gap-1.5 text-stone-600">
              <span className="w-3 h-1 bg-amber-500 inline-block" />
              <span>Average / Midpoint</span>
            </span>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={rechartsData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EFE9" />
              <XAxis
                dataKey="name"
                angle={-15}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 11, fill: '#78716C' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#78716C' }}
                unit={currency === 'INR' ? 'L' : ''}
                tickFormatter={(val) => (currency === 'INR' ? `₹${val}` : `$${Math.round(val / 1000)}k`)}
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const min = data.minBase;
                    const max = Number((data.minBase + data.rangeSpread).toFixed(1));
                    return (
                      <div className="bg-stone-900 text-white p-3.5 rounded-xl shadow-xl border border-stone-800 text-xs space-y-1">
                        <p className="font-bold text-emerald-400 text-sm font-serif">
                          {data.name}
                        </p>
                        <p className="text-stone-300">
                          Range:{' '}
                          <strong>
                            {currency === 'INR' ? `₹${min}L - ₹${max}L` : `$${min.toLocaleString()} - $${max.toLocaleString()}`}
                          </strong>
                        </p>
                        <p className="text-amber-300">
                          Average Midpoint: <strong>{currency === 'INR' ? `₹${data.avg}L` : `$${data.avg.toLocaleString()}`}</strong>
                        </p>
                        <p className="text-stone-400 text-[10px]">
                          Opportunities: {data.count} ({data.companies})
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={targetSalaryBenchmark}
                stroke="#059669"
                strokeDasharray="4 4"
                label={{
                  value: `Target: ${currency === 'INR' ? '₹12 LPA' : '$65k'}`,
                  position: 'insideTopRight',
                  fill: '#059669',
                  fontSize: 11,
                  fontWeight: 700
                }}
              />
              {/* Stacked transparent base bar to elevate floating range */}
              <Bar dataKey="minBase" stackId="a" fill="transparent" />
              {/* Floating Range Bar */}
              <Bar dataKey="rangeSpread" stackId="a" fill="#0F4A3E" radius={[6, 6, 0, 0]}>
                {rechartsData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index % 2 === 0 ? '#0F4A3E' : '#155E50'}
                  />
                ))}
              </Bar>
              {/* Average line overlay */}
              <Line
                type="monotone"
                dataKey="avg"
                stroke="#F59E0B"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#F59E0B' }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 2: D3 INTERACTIVE SALARY VS FIT SCORE SCATTER BUBBLE PLOT */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-indigo-700" />
              <span>D3 Interactive Opportunity Valuation Matrix</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Maps every job in your pipeline along Salary (X-axis) and Resume Fit Score (Y-axis). Hover for deep tooltips; click any bubble to view application.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-stone-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Offer</span>
            </span>
            <span className="flex items-center gap-1.5 text-stone-600">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
              <span>Interview</span>
            </span>
            <span className="flex items-center gap-1.5 text-stone-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              <span>Applied</span>
            </span>
            <span className="flex items-center gap-1.5 text-stone-600">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
              <span>Wishlist</span>
            </span>
          </div>
        </div>

        {/* D3 SVG Container */}
        <div className="w-full overflow-x-auto">
          <svg ref={d3SvgRef} className="w-full h-auto min-w-[650px]" />
        </div>
      </div>

      {/* SECTION 3: GRANULAR SALARY BREAKDOWN DIRECTORY TABLE */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Opportunity Compensation Directory ({filteredJobs.length} Roles)
            </h3>
            <p className="text-xs text-stone-500">
              Direct comparison of confirmed base offers, target market alignment, and negotiation ceilings.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company, tech, or industry..."
              className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#0F4A3E]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/60 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Company & Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Industry Sector</th>
                <th className="py-3 px-4">Listed Salary</th>
                <th className="py-3 px-4">Normalized Range ({currency})</th>
                <th className="py-3 px-4">Target Benchmark</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredJobs.map((job) => {
                const isAboveTarget = (currency === 'INR' ? job.maxLPA : job.maxUSD) >= targetSalaryBenchmark;
                const statusBadgeColor =
                  job.status === 'offer'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : job.status === 'interviewing'
                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                    : job.status === 'applied'
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-stone-100 text-stone-700 border-stone-200';

                return (
                  <tr
                    key={job.application.id}
                    className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelectApplication(job.application)}
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                        {job.company}
                      </p>
                      <p className="text-[11px] text-stone-500">{job.role}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadgeColor}`}>
                        {job.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-stone-700">
                      {job.industry}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-stone-700 font-medium">
                      {job.rawSalary}
                      {job.isEstimated && (
                        <span className="block text-[9px] text-amber-700 italic">Estimated</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      {currency === 'INR'
                        ? `₹${job.minLPA}L - ₹${job.maxLPA}L`
                        : `$${job.minUSD.toLocaleString()} - $${job.maxUSD.toLocaleString()}`}
                    </td>

                    <td className="py-3.5 px-4">
                      {isAboveTarget ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Meets Target</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                          <span>Below ₹12L</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectApplication(job.application);
                        }}
                        className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-semibold text-xs"
                      >
                        <span>View</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
