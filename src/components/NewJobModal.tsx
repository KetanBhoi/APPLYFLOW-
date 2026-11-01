import React, { useState } from 'react';
import { JobApplication, ApplicationStatus, Priority } from '../types/job';
import { X, Plus, Building2, Briefcase, MapPin, DollarSign, Calendar } from 'lucide-react';

interface NewJobModalProps {
  defaultStatus?: ApplicationStatus;
  onClose: () => void;
  onAddApplication: (app: JobApplication) => void;
  onOpenScannerWithText?: (text: string) => void;
}

export const NewJobModal: React.FC<NewJobModalProps> = ({
  defaultStatus = 'wishlist',
  onClose,
  onAddApplication,
  onOpenScannerWithText,
}) => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>(defaultStatus);
  const [priority, setPriority] = useState<Priority>('medium');
  const [appliedDate, setAppliedDate] = useState(
    defaultStatus === 'applied' ? new Date().toISOString().split('T')[0] : ''
  );
  const [followUpDate, setFollowUpDate] = useState(
    defaultStatus === 'applied'
      ? new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : ''
  );
  const [interviewDate, setInterviewDate] = useState(
    defaultStatus === 'interviewing'
      ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
      : ''
  );
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      company: company.trim(),
      role: role.trim(),
      location: location.trim() || 'Remote',
      salary: salary.trim() || 'Unlisted',
      status,
      priority,
      appliedDate: appliedDate || undefined,
      followUpDate: followUpDate || undefined,
      interviewDate: interviewDate || undefined,
      jobUrl: jobUrl.trim() || undefined,
      jobDescription: jobDescription.trim(),
      contacts: [],
      notes: '',
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAddApplication(newApp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4 my-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            Add Application to Pipeline
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-300 block mb-1">
                Company *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Linear, Stripe, Figma"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-300 block mb-1">
                Role / Title *
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-300 block mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="wishlist">Wishlist / Saved</option>
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offer">Offer Received</option>
                <option value="rejected">Archived</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-300 block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-300 block mb-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Remote or San Francisco"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-300 block mb-1">
                Salary / Compensation
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. $150k - $180k"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-300 block mb-1">
                Applied Date
              </label>
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-300 block mb-1">
                Follow-Up Due Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {status === 'interviewing' && (
              <div className="sm:col-span-2 bg-purple-950/30 p-3 rounded-xl border border-purple-500/30">
                <label className="text-xs font-semibold uppercase text-purple-300 block mb-1">
                  Scheduled Interview Date & Time (Enables Visual Countdown)
                </label>
                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-purple-500/40 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-300 block mb-1">
              Job Posting URL
            </label>
            <input
              type="url"
              placeholder="https://company.com/careers/role"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-300 block mb-1">
              Skills / Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="React, TypeScript, Frontend, Top Choice"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-300 block mb-1">
              Job Description or Notes
            </label>
            <textarea
              rows={3}
              placeholder="Paste job description or requirements here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {jobDescription && onOpenScannerWithText && (
              <button
                type="button"
                onClick={() => {
                  onOpenScannerWithText(jobDescription);
                  onClose();
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
              >
                Scan & auto-tailor with Gemini instead →
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-750"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors"
              >
                Add Role
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
