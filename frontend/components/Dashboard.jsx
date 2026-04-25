'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Target, Eye, TrendingUp, Upload,
  CheckCircle, Loader, AlertCircle, Zap, AlertTriangle
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import StatsCard from './dashboard/StatsCard';

const emptySkills = [
  { subject: 'React',         A: 0, fullMark: 100 },
  { subject: 'Node.js',       A: 0, fullMark: 100 },
  { subject: 'TypeScript',    A: 0, fullMark: 100 },
  { subject: 'System Design', A: 0, fullMark: 100 },
  { subject: 'CSS/Tailwind',  A: 0, fullMark: 100 },
  { subject: 'Python',        A: 0, fullMark: 100 },
];

const emptyActivity = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(n => ({ name: n, score: 0 }));

export default function Dashboard() {
  const [status, setStatus]     = useState('idle'); // idle | analyzing | done | error
  const [resumeName, setName]   = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [errorMsg, setError]    = useState('');
  const fileRef = useRef(null);

  const isAnalyzing = status === 'analyzing';
  const isAnalyzed  = status === 'done';
  const isError     = status === 'error';

  const skillsData   = isAnalyzed ? analysis.skills        : emptySkills;
  const activityData = isAnalyzed ? analysis.activity_data : emptyActivity;

  function handleClick() { if (!isAnalyzing) fileRef.current?.click(); }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setName(file.name);
    setStatus('analyzing');
    setError('');
    setAnalysis(null);
    e.target.value = '';

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/analyze-resume', { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.message || `Error ${res.status}`);
      }
      setAnalysis(await res.json());
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Career Dashboard</h1>
          <p className="text-textMuted mt-1">
            {isAnalyzed ? `Analysis complete for "${resumeName}"` : 'Upload your resume to get your career intelligence overview.'}
          </p>
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFile} />
        <button id="upload-resume-btn" onClick={handleClick} disabled={isAnalyzing}
          className="bg-primary hover:bg-primaryHover disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center gap-2">
          {isAnalyzing ? <><Loader size={18} className="animate-spin" /> Analysing…</> : <><Upload size={18} /> Upload New Resume</>}
        </button>
      </div>

      {/* Banners */}
      <AnimatePresence mode="wait">
        {isAnalyzing && (
          <motion.div key="analyzing" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-primary/10 border border-primary/30 rounded-xl px-5 py-3 flex items-center gap-3 text-sm text-primary">
            <Loader size={16} className="animate-spin flex-shrink-0" />
            <span>Express is analysing <strong>{resumeName}</strong> — please wait…</span>
          </motion.div>
        )}
        {isAnalyzed && (
          <motion.div key="done" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-success/10 border border-success/30 rounded-xl px-5 py-3 flex items-center gap-3 text-sm text-success">
            <CheckCircle size={16} className="flex-shrink-0" />
            <span>Analysis complete! ATS Score: <strong>{analysis?.ats_score}%</strong> · {analysis?.word_count} words found.</span>
          </motion.div>
        )}
        {isError && (
          <motion.div key="error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3 flex items-center gap-3 text-sm text-red-400">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span><strong>Error:</strong> {errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Overall ATS Score" value={isAnalyzed ? `${analysis.ats_score}%` : '—'}
          subtitle={isAnalyzed ? 'Top applicants score 80%+' : 'Upload resume to see score'}
          icon={FileText} trend={isAnalyzed && analysis.ats_score >= 60 ? 'up' : null}
          trendValue={isAnalyzed ? `${analysis.ats_score}%` : null} colorClass="from-primary to-accent" />
        <StatsCard title="Profile Views" value={isAnalyzed ? analysis.profile_views.toLocaleString() : '—'}
          subtitle={isAnalyzed ? 'Estimated monthly reach' : 'Upload resume to see views'}
          icon={Eye} trend={isAnalyzed ? 'up' : null} trendValue="est." colorClass="from-accent to-pink-500" />
        <StatsCard title="Success Probability" value={isAnalyzed ? `${analysis.success_probability}%` : '—'}
          subtitle={isAnalyzed ? 'Based on detected skills' : 'Upload resume to see probability'}
          icon={Target} trend={isAnalyzed && analysis.success_probability >= 60 ? 'up' : null}
          trendValue={isAnalyzed ? `${analysis.success_probability}%` : null} colorClass="from-success to-emerald-400" />
        <StatsCard title="Market Demand" value={isAnalyzed ? analysis.market_demand : '—'}
          subtitle={isAnalyzed ? 'Based on in-demand skills' : 'Upload resume to see demand'}
          icon={TrendingUp} trend={isAnalyzed ? 'up' : null} trendValue="trend" colorClass="from-warning to-orange-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-surface border border-surfaceHighlight rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-textMain mb-6">Resume Strength Activity</h3>
          {!isAnalyzed ? (
            <div className="h-[300px] flex flex-col items-center justify-center gap-3 text-textMuted">
              <Upload size={40} className="opacity-30" /><p className="text-sm">Upload your resume to see activity data</p>
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232D3F" vertical={false} />
                  <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94A3B8" tick={{ fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1A2332', borderColor: '#232D3F', borderRadius: '8px' }} itemStyle={{ color: '#F8FAFC' }} />
                  <Area type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" isAnimationActive animationDuration={1200} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-surface border border-surfaceHighlight rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-textMain mb-6">Skill Analysis</h3>
          {!isAnalyzed ? (
            <div className="h-[300px] flex flex-col items-center justify-center gap-3 text-textMuted">
              <Target size={40} className="opacity-30" /><p className="text-sm text-center">Upload your resume to see skill analysis</p>
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsData}>
                  <PolarGrid stroke="#232D3F" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Skills" dataKey="A" stroke="#8B5CF6" strokeWidth={2} fill="#8B5CF6" fillOpacity={0.4} isAnimationActive animationDuration={1200} />
                  <Tooltip contentStyle={{ backgroundColor: '#1A2332', borderColor: '#232D3F', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      {isAnalyzed && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-surface border border-surfaceHighlight rounded-2xl p-6">
            <h3 className="text-base font-semibold text-textMain mb-4 flex items-center gap-2">
              <CheckCircle size={18} className="text-success" /> Strengths
            </h3>
            <ul className="space-y-2">
              {(analysis.strengths || []).map((s, i) => (
                <li key={i} className="text-sm text-textMuted flex items-start gap-2"><span className="mt-0.5 text-success">✓</span> {s}</li>
              ))}
            </ul>
          </div>
          <div className="bg-surface border border-surfaceHighlight rounded-2xl p-6">
            <h3 className="text-base font-semibold text-textMain mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-warning" /> Issues Found
            </h3>
            <ul className="space-y-2">
              {(analysis.issues || []).length > 0
                ? (analysis.issues || []).map((s, i) => (
                  <li key={i} className="text-sm text-textMuted flex items-start gap-2"><span className="mt-0.5 text-warning">!</span> {s}</li>
                ))
                : <li className="text-sm text-textMuted flex items-center gap-2"><CheckCircle size={14} className="text-success" /> No major issues found!</li>}
            </ul>
          </div>
          <div className="bg-surface border border-surfaceHighlight rounded-2xl p-6">
            <h3 className="text-base font-semibold text-textMain mb-4 flex items-center gap-2">
              <Zap size={18} className="text-primary" /> Missing Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {(analysis.missing_keywords || []).map((kw, i) => (
                <span key={i} className="text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full">{kw}</span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty CTA */}
      {status === 'idle' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-surface border border-surfaceHighlight rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText size={32} className="text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-textMain">No Resume Uploaded Yet</h2>
          <p className="text-textMuted max-w-md text-sm">
            Upload your resume (PDF, Word, or TXT) and our Express-powered AI will instantly analyse your ATS score, skills, market demand, and success probability.
          </p>
          <button id="upload-resume-cta-btn" onClick={handleClick}
            className="mt-2 bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center gap-2">
            <Upload size={18} /> Upload Your Resume
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
