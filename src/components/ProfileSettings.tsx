import React, { useState } from 'react';
import { UserProfile } from '../types/job';
import {
  UserCheck,
  Plus,
  X,
  Sparkles,
  Save,
  RotateCcw,
  Check,
  Briefcase,
  Code
} from 'lucide-react';
import { INITIAL_PROFILE } from '../data/initialData';

interface ProfileSettingsProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [newSkill, setNewSkill] = useState('');
  const [newSnippet, setNewSnippet] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove)
    });
  };

  const handleAddSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnippet.trim()) return;
    setFormData({
      ...formData,
      experienceSnippets: [...formData.experienceSnippets, newSnippet.trim()]
    });
    setNewSnippet('');
  };

  const handleRemoveSnippet = (index: number) => {
    setFormData({
      ...formData,
      experienceSnippets: formData.experienceSnippets.filter((_, idx) => idx !== index)
    });
  };

  const handleSave = () => {
    onUpdateProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleReset = () => {
    setFormData(INITIAL_PROFILE);
    onUpdateProfile(INITIAL_PROFILE);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Intro Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/20">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              Candidate Background & Truth Anchor
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Base Experience & Technical Arsenal
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              ApplyFlow tailors resume bullets and outreach emails based on your actual achievements below. It will never invent fake roles or credentials.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Reset to default sample profile"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Details Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-400" />
          General Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
              Headline
            </label>
            <input
              type="text"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
              Current / Most Recent Title
            </label>
            <input
              type="text"
              value={formData.currentRole}
              onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
              Years of Experience
            </label>
            <input
              type="number"
              min={0}
              max={50}
              value={formData.yearsOfExp}
              onChange={(e) => setFormData({ ...formData, yearsOfExp: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
              Target Compensation Range
            </label>
            <input
              type="text"
              value={formData.targetSalary}
              onChange={(e) => setFormData({ ...formData, targetSalary: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
              Target Locations
            </label>
            <input
              type="text"
              value={formData.targetLocations.join(', ')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetLocations: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                })
              }
              placeholder="e.g. Remote, San Francisco, New York"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Skills Pill Manager */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Code className="w-4 h-4 text-cyan-400" />
          Technical Skills & Keywords ({formData.skills.length})
        </h3>
        <p className="text-xs text-slate-400">
          These are cross-referenced during the gap analysis when analyzing job descriptions.
        </p>

        {/* Existing skills */}
        <div className="flex flex-wrap gap-2">
          {formData.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 font-medium"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="text-slate-400 hover:text-rose-400 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Add Skill Input */}
        <form onSubmit={handleAddSkill} className="flex gap-2 max-w-sm pt-2">
          <input
            type="text"
            placeholder="Add new skill (e.g. Next.js, Redis)..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Real Experience Snippets */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Past Project & Experience Anchors ({formData.experienceSnippets.length})
        </h3>
        <p className="text-xs text-slate-400">
          Raw notes of what you actually built, metrics achieved, and projects shipped. The AI draws from these to synthesize targeted XYZ resume bullets.
        </p>

        <div className="space-y-3">
          {formData.experienceSnippets.map((snippet, idx) => (
            <div
              key={idx}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-start justify-between gap-3 text-xs sm:text-sm text-slate-300"
            >
              <p className="leading-relaxed flex-1 font-sans">• {snippet}</p>
              <button
                type="button"
                onClick={() => handleRemoveSnippet(idx)}
                className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors shrink-0"
                title="Remove snippet"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Snippet Form */}
        <form onSubmit={handleAddSnippet} className="space-y-2 pt-2">
          <textarea
            rows={2}
            placeholder="Add another achievement, project result, or metric (e.g. Migrated backend auth to OAuth 2.0 reducing login friction by 25%)..."
            value={newSnippet}
            onChange={(e) => setNewSnippet(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Experience Snippet</span>
          </button>
        </form>
      </div>
    </div>
  );
};
