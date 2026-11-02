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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[#EBE8E3] rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-2xl space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-[#EBE8E3] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-[#0F4A3E] flex items-center justify-center">
              <Plus className="w-4 h-4 text-[#0F4A3E]" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900">
              Add Application to Pipeline
            </h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase text-stone-600 block mb-1 tracking-wider">
                Company *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Linear, Stripe, Figma"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-stone-600 block mb-1 tracking-wider">
                Role / Title *
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-stone-600 block mb-1 tracking-wider">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white cursor-pointer transition-colors"
              >
                <option value="wishlist">Wishlist / Saved</option>
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offer">Offer Received</option>
                <option value="rejected">Archived</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-stone-600 block mb-1 tracking-wider">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white cursor-pointer transition-colors"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-stone-600 block mb-1 tracking-wider">
                Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Remote or San Francisco"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-stone-600 block mb-1 tracking-wider">
                Salary / Compensation
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. $150k - $180k"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-stone-600 block mb-1 tracking-wider">
                Applied Date
              </label>
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-stone-600 block mb-1 tracking-wider">
                Follow-Up Due Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white transition-colors"
              />
            </div>

            {status === 'interviewing' && (
              <div className="sm:col-span-2 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
                <label className="text-xs font-semibold uppercase text-[#0F4A3E] block mb-1 tracking-wider">
                  Scheduled Interview Date & Time (Enables Visual Countdown)
                </label>
                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] font-mono"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-stone-600 block mb-1 tracking-wider">
              Job Posting URL
            </label>
            <input
              type="url"
              placeholder="https://company.com/careers/role"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-stone-600 block mb-1 tracking-wider">
              Skills / Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="React, TypeScript, Frontend, Top Choice"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-stone-600 block mb-1 tracking-wider">
              Job Description or Notes
            </label>
            <textarea
              rows={3}
              placeholder="Paste job description or requirements here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#0F4A3E] focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#EBE8E3]">
            {jobDescription && onOpenScannerWithText && (
              <button
                type="button"
                onClick={() => {
                  onOpenScannerWithText(jobDescription);
                  onClose();
                }}
                className="text-xs text-[#0F4A3E] hover:text-[#0B382F] font-medium underline cursor-pointer"
              >
                Scan & auto-tailor with Gemini instead →
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="h-9 inline-flex items-center justify-center px-4 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200 border border-stone-200 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 inline-flex items-center justify-center px-5 rounded-xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
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
