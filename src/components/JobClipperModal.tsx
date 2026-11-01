import React, { useState } from 'react';
import {
  Link,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Building2,
  MapPin,
  DollarSign,
  Tag,
  ArrowRight,
  ExternalLink,
  FileText,
  RotateCcw,
  X
} from 'lucide-react';
import { JobApplication } from '../types/job';

interface JobClipperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToScanner: (jobData: { company: string; role: string; description: string; salary?: string; location?: string }) => void;
  onAddToPipeline: (newApp: JobApplication) => void;
}

export const JobClipperModal: React.FC<JobClipperModalProps> = ({
  isOpen,
  onClose,
  onSendToScanner,
  onAddToPipeline
}) => {
  const [jobUrl, setJobUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url');
  const [isClipping, setIsClipping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [clippedResult, setClippedResult] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClipJob = async () => {
    if (inputMode === 'url' && !jobUrl.trim()) return;
    if (inputMode === 'text' && !rawText.trim()) return;

    setIsClipping(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/jobs/clip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: inputMode === 'url' ? jobUrl.trim() : undefined,
          rawContent: inputMode === 'text' ? rawText.trim() : undefined
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to clip job posting');
      }

      setClippedResult(data.extracted);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error while clipping job');
    } finally {
      setIsClipping(false);
    }
  };

  const handleApplyToScanner = () => {
    if (!clippedResult) return;
    onSendToScanner({
      company: clippedResult.company,
      role: clippedResult.role,
      description: clippedResult.cleanedDescription || rawText,
      salary: clippedResult.salary,
      location: clippedResult.location
    });
    onClose();
  };

  const handleDirectAddToPipeline = () => {
    if (!clippedResult) return;
    const newApp: JobApplication = {
      id: 'app-' + Date.now(),
      company: clippedResult.company || 'Clipped Company',
      role: clippedResult.role || 'Software Engineer',
      location: clippedResult.location || 'Remote',
      salary: clippedResult.salary || 'Competitive',
      status: 'wishlist',
      priority: 'high',
      fitScore: 88,
      jobUrl: inputMode === 'url' ? jobUrl : undefined,
      jobDescription: clippedResult.cleanedDescription || rawText || 'Imported via ApplyFlow 1-Click Job Clipper.',
      contacts: [],
      tags: (clippedResult.requiredSkills && clippedResult.requiredSkills.slice(0, 4)) || ['Full-Stack', 'Engineering'],
      notes: clippedResult.summary || 'Imported via ApplyFlow 1-Click Job Clipper.',
      appliedDate: new Date().toISOString().split('T')[0],
      followUpDate: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onAddToPipeline(newApp);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[#EBE8E3] max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#F2EFE9]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DDF3EA] text-[#0F4A3E] text-[10px] font-bold font-mono">
              <Sparkles className="w-3 h-3" />
              <span>1-Click Job Posting Clipper</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
              Import & Extract Job Posting
            </h2>
            <p className="text-xs text-stone-500">
              Paste any LinkedIn, Indeed, Naukri, or Wellfound URL or raw JD text to automatically extract details with Gemini.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Mode Selector */}
        {!clippedResult && (
          <div className="space-y-4">
            <div className="flex p-1 bg-stone-100 rounded-2xl w-fit">
              <button
                onClick={() => setInputMode('url')}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  inputMode === 'url' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Paste URL
              </button>
              <button
                onClick={() => setInputMode('text')}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  inputMode === 'text' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Paste Raw Text / HTML
              </button>
            </div>

            {inputMode === 'url' ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5 text-stone-400" />
                  <span>Job Posting URL:</span>
                </label>
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/jobs/view/... or https://naukri.com/job-listings..."
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F4A3E] focus:bg-white font-mono"
                />
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-stone-400">
                  <span>Quick demo templates:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setJobUrl('https://linkedin.com/jobs/view/mern-stack-developer-haronex-tech');
                    }}
                    className="hover:text-stone-700 underline cursor-pointer"
                  >
                    Haronex (MERN)
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setJobUrl('https://outlier.ai/careers/ai-llm-evaluation-specialist');
                    }}
                    className="hover:text-stone-700 underline cursor-pointer"
                  >
                    Outlier AI (Evaluation)
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setJobUrl('https://tcs.com/careers/entry-level-systems-engineer');
                    }}
                    className="hover:text-stone-700 underline cursor-pointer"
                  >
                    TCS (Systems Engineer)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-stone-400" />
                  <span>Paste Job Description Text or HTML:</span>
                </label>
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste the full job posting text, qualifications, and company description..."
                  className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0F4A3E] focus:bg-white resize-y font-sans"
                />
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleClipJob}
              disabled={isClipping || (inputMode === 'url' ? !jobUrl.trim() : !rawText.trim())}
              className="w-full py-3 rounded-2xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isClipping ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin text-emerald-300" />
                  <span>Extracting with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Extract & Clip Job Posting</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Clipped Result Preview */}
        {clippedResult && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-[#FAF9F7] border border-[#EBE8E3] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg font-bold text-stone-900">
                      {clippedResult.role}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {clippedResult.jobType || 'Full-time'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-600 mt-1">
                    <span className="font-semibold text-stone-800 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-stone-400" />
                      {clippedResult.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      {clippedResult.location}
                    </span>
                    <span className="font-mono text-emerald-700 font-semibold flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-stone-400" />
                      {clippedResult.salary}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setClippedResult(null)}
                  className="text-xs text-stone-500 hover:text-stone-700 underline cursor-pointer self-start sm:self-auto"
                >
                  Clip another
                </button>
              </div>

              {/* Summary */}
              <p className="text-xs text-stone-600 leading-relaxed">
                {clippedResult.summary}
              </p>

              {/* Skills Tags */}
              {clippedResult.requiredSkills && clippedResult.requiredSkills.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                    Extracted Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {clippedResult.requiredSkills.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-mono"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleApplyToScanner}
                className="py-3 px-4 rounded-2xl bg-[#0F4A3E] hover:bg-[#0B382F] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Send to ATS Tailor & Scanner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleDirectAddToPipeline}
                className="py-3 px-4 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-[#0F4A3E]" />
                <span>Save Directly to Pipeline Board</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
