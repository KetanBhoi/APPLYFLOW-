import React, { useState } from 'react';
import { History, Search, Filter, ArrowRight, ChevronRight, FileText } from 'lucide-react';
import { JobApplication } from '../types/job';

interface AnalysisHistoryProps {
  applications: JobApplication[];
  onSelectApplication: (app: JobApplication) => void;
  onStartNewAnalysis: () => void;
}

interface HistoryItem {
  id: string;
  candidateName: string;
  role: string;
  company: string;
  score: number;
  date: string;
  notes: string;
  application?: JobApplication;
}

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({
  applications,
  onSelectApplication,
  onStartNewAnalysis
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const staticHistory: HistoryItem[] = [
    {
      id: 'h-1',
      candidateName: 'Arjun Sharma',
      role: 'Business Analyst',
      company: 'Fintech Solutions',
      score: 39,
      date: 'Oct 02, 2026',
      notes: 'Initial scan of resume against requirements'
    },
    {
      id: 'h-2',
      candidateName: 'KETAN KAUSHIKBHAI BHOI',
      role: 'Business Analyst',
      company: 'Apex Logistics',
      score: 28,
      date: 'Oct 02, 2026',
      notes: 'ATS Keyword match: missing Agile user stories keyword'
    },
    {
      id: 'h-3',
      candidateName: 'KETAN KAUSHIKBHAI BHOI',
      role: 'Senior Data & Systems Analyst',
      company: 'CloudHealth',
      score: 35,
      date: 'Oct 01, 2026',
      notes: 'Strong hard skills match, tailored bullets generated'
    },
    {
      id: 'h-4',
      candidateName: 'KETAN KAUSHIKBHAI BHOI',
      role: 'Technical Product Analyst',
      company: 'NextGen AI Corp',
      score: 82,
      date: 'Sep 28, 2026',
      notes: 'Optimized version achieved 82% match with STAR metrics'
    }
  ];

  const appHistory = applications.map((app) => ({
    id: app.id,
    candidateName: 'KETAN KAUSHIKBHAI BHOI',
    role: app.role,
    company: app.company,
    score: app.fitScore || 30,
    date: app.appliedDate || 'Recent',
    notes: app.notes || 'Pipeline evaluation',
    application: app
  }));

  const allHistory = [...staticHistory, ...appHistory];
  const filtered = allHistory.filter(
    (h) =>
      h.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">
            Analysis History
          </h1>
          <p className="text-sm text-gray-500 font-sans mt-1">
            Complete log of resume scans, keyword gap diagnoses, and score improvements.
          </p>
        </div>

        <button
          onClick={onStartNewAnalysis}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B4B42] hover:bg-[#073630] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>New Analysis</span>
        </button>
      </div>

      <div className="bg-white border border-[#EAEAE8] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by candidate, role, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B4B42] focus:border-transparent transition-all"
          />
        </div>

        <div className="divide-y divide-gray-100 pt-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if ('application' in item && item.application) {
                  onSelectApplication(item.application);
                } else {
                  onStartNewAnalysis();
                }
              }}
              className="py-4 flex items-center justify-between gap-4 hover:bg-gray-50/80 -mx-3 px-3 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#0B4B42]">
                    {item.candidateName}
                  </h4>
                  <span className="text-xs text-gray-400">· {item.company}</span>
                </div>
                <p className="text-xs text-gray-600 font-medium">{item.role}</p>
                <p className="text-[11px] text-gray-400">{item.notes}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0 text-right">
                <div className="hidden sm:block">
                  <span className="text-xs text-gray-400 block">{item.date}</span>
                </div>
                <span className="font-serif text-2xl font-bold text-gray-950 min-w-[36px]">
                  {item.score}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
