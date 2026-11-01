import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Star,
  Download,
  Filter,
  Search,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { JobApplication } from '../types/job';

interface RecruiterViewProps {
  applications: JobApplication[];
  onSelectApplication: (app: JobApplication) => void;
  onNavigateToResume: () => void;
}

export const RecruiterView: React.FC<RecruiterViewProps> = ({
  applications,
  onSelectApplication,
  onNavigateToResume
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<string>('ketan');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">
            Recruiter View
          </h1>
          <p className="text-sm text-gray-500 font-sans mt-1">
            See how hiring managers and enterprise ATS scanners evaluate your resume profile.
          </p>
        </div>

        <button
          onClick={onNavigateToResume}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B4B42] hover:bg-[#073630] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>Optimize Candidate Score</span>
        </button>
      </div>

      {/* Recruiter Evaluation Card */}
      <div className="bg-white border border-[#EAEAE8] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-gray-900">
                KETAN KAUSHIKBHAI BHOI
              </h2>
              <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
                Senior Candidate
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Target: Business Analyst / Systems Analyst · 7+ Years Experience
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-xs text-gray-400 block font-sans">Recruiter Match</span>
              <span className="font-serif text-3xl font-bold text-gray-900">84/100</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block font-sans">ATS Parsability</span>
              <span className="font-serif text-3xl font-bold text-emerald-700">98%</span>
            </div>
          </div>
        </div>

        {/* 3 Pillars of Recruiter Screening */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Core Strengths Verified</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Demonstrated mastery of cross-functional requirements gathering, SQL queries, data pipelines, and agile backlog prioritization.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Keyword Density Flags</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Add explicit mentions of "Tableau / PowerBI dashboard metrics" and "stakeholder sign-off" in the top summary bullets.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs">
              <Star className="w-4 h-4" />
              <span>Executive Presence</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              High STAR metric impact: 4 of 6 bullets include quantified dollar or percentage outcomes ($1.2M cost avoidance, 35% speedup).
            </p>
          </div>
        </div>
      </div>

      {/* Candidate Pipeline Pool */}
      <div className="bg-white border border-[#EAEAE8] rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-serif text-lg font-bold text-gray-900">
          Evaluated Application Profiles ({applications.length})
        </h3>

        <div className="divide-y divide-gray-100">
          {applications.map((app) => (
            <div
              key={app.id}
              onClick={() => onSelectApplication(app)}
              className="py-4 flex items-center justify-between gap-4 hover:bg-gray-50/80 -mx-3 px-3 rounded-xl transition-colors cursor-pointer group"
            >
              <div>
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#0B4B42]">
                  {app.company} · {app.role}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Stage: <span className="capitalize font-medium text-gray-700">{app.status}</span> · Priority: {app.priority}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-serif text-2xl font-bold text-gray-900">
                  {app.fitScore || 70}
                </span>
                <span className="text-xs text-gray-400">match</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
