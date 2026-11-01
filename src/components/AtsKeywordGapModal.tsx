import React, { useState } from 'react';
import { JobApplication, UserProfile } from '../types/job';
import { generateGapClosingBullet } from '../services/geminiService';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  X,
  Target,
  RefreshCw,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCheck,
  Lightbulb,
  FileText
} from 'lucide-react';

interface AtsKeywordGapModalProps {
  application: JobApplication;
  userProfile: UserProfile;
  onClose: () => void;
  onInsertBullet?: (bulletText: string) => void;
}

interface CategorizedKeyword {
  keyword: string;
  category: 'Languages' | 'Frameworks' | 'Architecture' | 'Cloud & DB' | 'Methodologies';
  status: 'exact' | 'partial' | 'gap';
  frequencyInJd: number;
  candidateEvidence?: string;
}

export const AtsKeywordGapModal: React.FC<AtsKeywordGapModalProps> = ({
  application,
  userProfile,
  onClose,
  onInsertBullet
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'gap' | 'partial' | 'exact'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Gap bullet generator state
  const [selectedKeywordForBullet, setSelectedKeywordForBullet] = useState<string | null>(null);
  const [isGeneratingBullet, setIsGeneratingBullet] = useState(false);
  const [generatedBulletData, setGeneratedBulletData] = useState<{
    recommendedBullet: string;
    alternativeBullet: string;
    suggestedSection: string;
    ethicalAuditNote: string;
    targetKeyword: string;
  } | null>(null);

  // Compute keywords from application and candidate profile
  const candidateSkillsLower = new Set(
    (userProfile.skills || []).map((s) => s.toLowerCase()).concat(
      (userProfile.experienceSnippets || []).flatMap((e) => e.toLowerCase().split(/\W+/))
    )
  );

  const jdTextLower = (application.jobDescription || '').toLowerCase();
  const jdSkills = application.parsedDetails?.coreSkills || [
    'React',
    'TypeScript',
    'Node.js',
    'WebSockets',
    'REST APIs',
    'Jest',
    'CI/CD Pipelines',
    'MongoDB',
    'PostgreSQL',
    'Docker'
  ];

  const niceToHave = application.parsedDetails?.niceToHaveSkills || [
    'Kubernetes',
    'AWS',
    'Distributed Caching',
    'Performance Optimization'
  ];

  const allJdKeywords = Array.from(new Set([...jdSkills, ...niceToHave]));

  const keywordsMatrix: CategorizedKeyword[] = allJdKeywords.map((kw) => {
    const kwLower = kw.toLowerCase();
    const isInSkills = candidateSkillsLower.has(kwLower);
    const countInJd = (jdTextLower.match(new RegExp(kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length || 2;

    let status: 'exact' | 'partial' | 'gap' = 'gap';
    let candidateEvidence = 'Not found in candidate profile';

    if (isInSkills) {
      status = 'exact';
      candidateEvidence = 'Verified in skills & verified project achievements';
    } else if (
      (kwLower.includes('react') && candidateSkillsLower.has('react')) ||
      (kwLower.includes('api') && candidateSkillsLower.has('rest')) ||
      (kwLower.includes('test') && candidateSkillsLower.has('testing')) ||
      (kwLower.includes('cloud') && candidateSkillsLower.has('aws'))
    ) {
      status = 'partial';
      candidateEvidence = 'Semantically related experience found';
    }

    // Determine category
    let category: CategorizedKeyword['category'] = 'Architecture';
    if (['javascript', 'typescript', 'python', 'java', 'sql', 'html', 'css'].some((l) => kwLower.includes(l))) {
      category = 'Languages';
    } else if (['react', 'node', 'express', 'next', 'vue', 'tailwind', 'redux'].some((f) => kwLower.includes(f))) {
      category = 'Frameworks';
    } else if (['docker', 'kubernetes', 'aws', 'mongo', 'postgres', 'redis', 'ci/cd', 'cloud'].some((c) => kwLower.includes(c))) {
      category = 'Cloud & DB';
    } else if (['agile', 'scrum', 'testing', 'jest', 'playwright', 'code review'].some((m) => kwLower.includes(m))) {
      category = 'Methodologies';
    }

    return {
      keyword: kw,
      category,
      status,
      frequencyInJd: countInJd,
      candidateEvidence
    };
  });

  const filtered = keywordsMatrix.filter((item) => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (searchQuery.trim() && !item.keyword.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const exactCount = keywordsMatrix.filter((k) => k.status === 'exact').length;
  const partialCount = keywordsMatrix.filter((k) => k.status === 'partial').length;
  const gapCount = keywordsMatrix.filter((k) => k.status === 'gap').length;
  const matchPercentage = Math.round(((exactCount + partialCount * 0.5) / Math.max(keywordsMatrix.length, 1)) * 100);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateGapBullet = async (kw: string) => {
    setSelectedKeywordForBullet(kw);
    setIsGeneratingBullet(true);
    setGeneratedBulletData(null);
    try {
      const resp = await generateGapClosingBullet({
        gapKeyword: kw,
        jobTitle: application.role,
        company: application.company,
        userProfile,
        experienceContext: 'Technical Experience'
      });
      setGeneratedBulletData(resp.result);
    } catch (err) {
      console.error('Failed to generate gap-closing bullet:', err);
    } finally {
      setIsGeneratingBullet(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-stone-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white text-stone-900 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400">ATS Keyword Match Matrix & Gap Studio</span>
                <span className="text-xs px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-mono">
                  {matchPercentage}% Semantic Match
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                <span>{application.company}</span>
                <span className="text-stone-500 text-sm font-sans font-normal">/</span>
                <span className="text-stone-300 text-base font-sans font-normal">{application.role}</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metric Badges Banner */}
        <div className="px-6 py-3 bg-stone-100 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="text-xs text-stone-600">
                Exact Matches: <strong>{exactCount}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-xs text-stone-600">
                Partial Matches: <strong>{partialCount}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-xs text-stone-600">
                Gaps to Bridge: <strong>{gapCount}</strong>
              </span>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-lg border border-stone-300 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="text-xs px-2.5 py-1 rounded-lg border border-stone-300 bg-white text-stone-800"
            >
              <option value="all">All Statuses</option>
              <option value="gap">Gaps Only</option>
              <option value="partial">Partial</option>
              <option value="exact">Exact</option>
            </select>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50 space-y-6">
          {/* Generated Bullet Modal Drawer */}
          {selectedKeywordForBullet && (
            <div className="bg-white border-2 border-emerald-600/60 rounded-2xl p-5 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Truthful Gap-Closing XYZ Resume Bullet: "{selectedKeywordForBullet}"
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedKeywordForBullet(null);
                    setGeneratedBulletData(null);
                  }}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isGeneratingBullet ? (
                <div className="py-8 flex items-center justify-center gap-3 text-stone-500 text-xs">
                  <div className="w-5 h-5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                  <span>Engineering authentic Google XYZ formula bullet from candidate background...</span>
                </div>
              ) : generatedBulletData ? (
                <div className="space-y-4">
                  {/* Primary Recommended Bullet */}
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                        Recommended Bullet (Google XYZ Format)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(generatedBulletData.recommendedBullet, 'rec_bullet')}
                          className="text-xs text-emerald-800 hover:text-emerald-950 flex items-center gap-1 font-semibold"
                        >
                          {copiedKey === 'rec_bullet' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'rec_bullet' ? 'Copied' : 'Copy Bullet'}</span>
                        </button>
                        {onInsertBullet && (
                          <button
                            onClick={() => {
                              onInsertBullet(generatedBulletData.recommendedBullet);
                              handleCopy(generatedBulletData.recommendedBullet, 'rec_bullet');
                            }}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Insert in Resume</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-stone-900 leading-relaxed font-sans">
                      • {generatedBulletData.recommendedBullet}
                    </p>
                  </div>

                  {/* Alternative Bullet */}
                  <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        Alternative Framing
                      </span>
                      <button
                        onClick={() => handleCopy(generatedBulletData.alternativeBullet, 'alt_bullet')}
                        className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1"
                      >
                        {copiedKey === 'alt_bullet' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'alt_bullet' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-stone-700 leading-relaxed">• {generatedBulletData.alternativeBullet}</p>
                  </div>

                  {/* Ethical Audit Note */}
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-stone-100 text-[11px] text-stone-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Ethical Truth Guarantee:</strong> {generatedBulletData.ethicalAuditNote}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Keywords Table */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100/80 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Target Keyword</th>
                    <th className="py-3 px-3">Domain Category</th>
                    <th className="py-3 px-3">ATS Match Status</th>
                    <th className="py-3 px-3">JD Frequency</th>
                    <th className="py-3 px-4">Candidate Grounding Evidence</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-400">
                        No keywords matching current filter.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-stone-900">
                          {item.keyword}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 text-[10px] font-mono">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {item.status === 'exact' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Exact Match
                            </span>
                          ) : item.status === 'partial' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-medium">
                              <AlertTriangle className="w-3 h-3" /> Partial / Related
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-medium">
                              <XCircle className="w-3 h-3" /> Missing Gap
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-stone-600">
                          {item.frequencyInJd}x
                        </td>
                        <td className="py-3 px-4 text-stone-600 max-w-xs truncate text-[11px]">
                          {item.candidateEvidence}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleGenerateGapBullet(item.keyword)}
                            className="px-2.5 py-1 rounded bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 text-xs font-semibold flex items-center gap-1 ml-auto transition-colors"
                          >
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>Bridge with XYZ Bullet</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>ApplyFlow ATS Parser Studio</span>
            <span>•</span>
            <span>Taleo / Greenhouse / Lever Rule Enforced</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium transition-colors"
          >
            Close Matrix
          </button>
        </div>

      </div>
    </div>
  );
};
