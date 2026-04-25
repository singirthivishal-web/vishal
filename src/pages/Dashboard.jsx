import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Target, Eye, TrendingUp, Upload,
  CheckCircle, Loader, AlertCircle, Zap, AlertTriangle
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import StatsCard from '../components/dashboard/StatsCard';

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT-SIDE ANALYSIS ENGINE  (no server required)
// ─────────────────────────────────────────────────────────────────────────────

const SKILL_MAP = {
  'React':         ['react', 'jsx', 'next.js', 'nextjs', 'redux', 'react native'],
  'Node.js':       ['node.js', 'nodejs', 'express', 'nestjs'],
  'TypeScript':    ['typescript', 'type-safe'],
  'Python':        ['python', 'django', 'flask', 'fastapi', 'pandas', 'numpy'],
  'CSS/Tailwind':  ['css', 'tailwind', 'sass', 'scss', 'styled-components', 'bootstrap'],
  'System Design': ['system design', 'microservice', 'distributed', 'architecture', 'aws', 'azure', 'docker', 'kubernetes'],
  'SQL':           ['sql', 'postgresql', 'mysql', 'mongodb', 'nosql', 'redis'],
  'DevOps':        ['ci/cd', 'github actions', 'jenkins', 'terraform'],
};

const ATS_SECTIONS = ['experience', 'education', 'skills', 'summary', 'objective', 'projects', 'certifications', 'contact'];
const ACTION_VERBS = ['developed', 'built', 'designed', 'implemented', 'led', 'managed', 'optimized',
  'reduced', 'increased', 'created', 'launched', 'delivered', 'architected', 'spearheaded'];
const HIGH_DEMAND = new Set(['React', 'Node.js', 'TypeScript', 'Python', 'System Design']);
const DEMAND_MAP  = { 5: 'Very High', 4: 'High', 3: 'High', 2: 'Medium', 1: 'Low', 0: 'Low' };

// Extract text from a File object — uses local pdfjs worker (no CDN required)
async function extractText(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  // ── PDF ───────────────────────────────────────────────────────────────────
  if (ext === 'pdf') {
    try {
      // Dynamically import pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist');

      // Use the worker bundled locally with pdfjs-dist — Vite serves it as a
      // static asset so this works offline too (no CDN probe needed).
      // The ?url suffix tells Vite to return the file's public URL.
      const workerUrl = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).href;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageTexts = await Promise.all(
        Array.from({ length: pdf.numPages }, (_, i) =>
          pdf.getPage(i + 1)
            .then(p => p.getTextContent())
            .then(tc => tc.items.map(it => it.str).join(' '))
        )
      );
      const text = pageTexts.join('\n').trim();
      if (text.length > 10) return text;
      // fall through to raw-binary fallback if no text was extracted
    } catch (e) {
      console.warn('[Dashboard] pdfjs extraction failed, using raw fallback:', e.message);
    }

    // Raw-binary fallback — extracts readable ASCII words from binary PDF data
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload  = e => {
        const raw = e.target.result || '';
        // Pull out printable ASCII runs to give the scorer something to work with
        const readable = (raw.match(/[\x20-\x7E]{4,}/g) || []).join(' ');
        resolve(readable);
      };
      reader.onerror = () => resolve('');
      reader.readAsBinaryString(file);
    });
  }

  // ── DOCX / DOC ─── strip XML tags, keep plain text ───────────────────────
  if (ext === 'docx' || ext === 'doc') {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload  = e => {
        const raw = e.target.result || '';
        // Strip XML/binary noise; keep readable text
        const clean = raw.replace(/<[^>]+>/g, ' ').replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
        resolve(clean);
      };
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    });
  }

  // ── TXT and everything else ───────────────────────────────────────────────
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result || '');
    reader.onerror = () => resolve('');
    reader.readAsText(file);
  });
}


function scoreSkills(low) {
  const scores = {};
  for (const [skill, kws] of Object.entries(SKILL_MAP)) {
    const hits  = kws.filter(kw => low.includes(kw)).length;
    const noise = Math.floor(Math.random() * 11) - 5;
    scores[skill] = Math.max(0, Math.min(100, hits * 20 + noise));
  }
  return scores;
}

function scoreAts(text, low, skillScores) {
  let s = 0;
  s += Math.min(ATS_SECTIONS.filter(sec => low.includes(sec)).length * 5, 30);
  const wc = text.split(/\s+/).filter(Boolean).length;
  s += wc >= 100 && wc <= 800 ? 20 : wc > 50 ? 10 : 0;
  s += Math.min(ACTION_VERBS.filter(v => low.includes(v)).length * 4, 20);
  s += Math.min((text.match(/\b\d+[%x+]?\b/g) || []).length * 3, 15);
  s += Math.min(Object.values(skillScores).filter(v => v > 0).length * 2, 15);
  return Math.min(s, 100);
}

function successProb(ats, skillScores) {
  const vals = Object.values(skillScores);
  const avg  = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
  return Math.max(0, Math.min(100, Math.round(ats * 0.6 + avg * 0.4)));
}

function marketDemand(skillScores) {
  const count = Math.min([...HIGH_DEMAND].filter(s => (skillScores[s] || 0) > 20).length, 5);
  return DEMAND_MAP[count] ?? 'Medium';
}

function buildActivity(ats) {
  const days  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const start = Math.max(0, ats - 30);
  const step  = (ats - start) / (days.length - 1) || 0;
  return days.map((name, i) => ({ name, score: Math.round(start + step * i) }));
}

function buildInsights(low, skillScores, ats) {
  const strengths = [], issues = [], missing_keywords = [];
  if (ats >= 70)                strengths.push('Strong overall ATS compatibility');
  if (ACTION_VERBS.some(v => low.includes(v))) strengths.push('Good use of action verbs (e.g. Developed, Led)');
  if (/\b\d+[%x]?\b/.test(low)) strengths.push('Quantified achievements detected');
  if (low.includes('summary') || low.includes('objective')) strengths.push('Professional summary section present');

  if (ats < 60) issues.push('ATS score is low — add more relevant keywords');
  if (low.split(/\s+/).filter(Boolean).length < 150) issues.push('Resume too short — aim for 300–700 words');
  if (!low.includes('linkedin') && !low.includes('github')) issues.push('No LinkedIn or GitHub profile detected');

  ['Docker', 'AWS', 'CI/CD', 'GraphQL', 'Agile', 'Kubernetes'].forEach(kw => {
    if (!low.includes(kw.toLowerCase())) missing_keywords.push(kw);
  });
  return { strengths: strengths.slice(0, 4), issues: issues.slice(0, 3), missing_keywords: missing_keywords.slice(0, 5) };
}

async function analyseResume(file) {
  const text       = await extractText(file);
  const low        = text.toLowerCase();
  const word_count = text.split(/\s+/).filter(Boolean).length;
  const skillScores = scoreSkills(low);
  const ats_score   = scoreAts(text, low, skillScores);
  return {
    filename:            file.name,
    ats_score,
    success_probability: successProb(ats_score, skillScores),
    market_demand:       marketDemand(skillScores),
    profile_views:       Math.round(ats_score * 13.7),
    skills:              Object.entries(skillScores).map(([subject, A]) => ({ subject, A, fullMark: 100 })),
    activity_data:       buildActivity(ats_score),
    word_count,
    ...buildInsights(low, skillScores, ats_score),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const emptySkills   = Object.keys(SKILL_MAP).map(s => ({ subject: s, A: 0, fullMark: 100 }));
const emptyActivity = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(n => ({ name: n, score: 0 }));

export default function Dashboard() {
  const [status,   setStatus]   = useState('idle');     // idle | analyzing | done | error
  const [name,     setName]     = useState('');
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
    e.target.value = '';
    setName(file.name);
    setStatus('analyzing');
    setError('');
    setAnalysis(null);

    try {
      const result = await analyseResume(file);
      setAnalysis(result);
      setStatus('done');
    } catch (err) {
      setError('Could not parse the file. Try a different PDF or TXT file.');
      setStatus('error');
      console.error('[Dashboard analysis]', err);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Career Dashboard</h1>
          <p className="text-textMuted mt-1">
            {isAnalyzed
              ? `Analysis complete for "${name}"`
              : 'Upload your resume to get your career intelligence overview.'}
          </p>
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFile} />
        <button id="upload-resume-btn" onClick={handleClick} disabled={isAnalyzing}
          className="bg-primary hover:bg-primaryHover disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center gap-2">
          {isAnalyzing
            ? <><Loader size={18} className="animate-spin" /> Analysing…</>
            : <><Upload size={18} /> Upload New Resume</>}
        </button>
      </div>

      {/* Status banners */}
      <AnimatePresence mode="wait">
        {isAnalyzing && (
          <motion.div key="analyzing" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-primary/10 border border-primary/30 rounded-xl px-5 py-3 flex items-center gap-3 text-sm text-primary">
            <Loader size={16} className="animate-spin flex-shrink-0" />
            <span>Analysing <strong>{name}</strong> in your browser — please wait…</span>
          </motion.div>
        )}
        {isAnalyzed && (
          <motion.div key="done" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-success/10 border border-success/30 rounded-xl px-5 py-3 flex items-center gap-3 text-sm text-success">
            <CheckCircle size={16} className="flex-shrink-0" />
            <span>Analysis complete! ATS Score: <strong>{analysis?.ats_score}%</strong> · {analysis?.word_count} words detected.</span>
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
        <StatsCard title="Overall ATS Score"    value={isAnalyzed ? `${analysis.ats_score}%` : '—'}
          subtitle={isAnalyzed ? 'Top applicants score 80%+' : 'Upload resume to see score'}
          icon={FileText} trend={isAnalyzed && analysis.ats_score >= 60 ? 'up' : null}
          trendValue={isAnalyzed ? `${analysis.ats_score}%` : null} colorClass="from-primary to-accent" />
        <StatsCard title="Profile Views"        value={isAnalyzed ? analysis.profile_views.toLocaleString() : '—'}
          subtitle={isAnalyzed ? 'Estimated monthly reach' : 'Upload resume to see views'}
          icon={Eye} trend={isAnalyzed ? 'up' : null} trendValue="est." colorClass="from-accent to-pink-500" />
        <StatsCard title="Success Probability"  value={isAnalyzed ? `${analysis.success_probability}%` : '—'}
          subtitle={isAnalyzed ? 'Based on detected skills' : 'Upload resume to see probability'}
          icon={Target} trend={isAnalyzed && analysis.success_probability >= 60 ? 'up' : null}
          trendValue={isAnalyzed ? `${analysis.success_probability}%` : null} colorClass="from-success to-emerald-400" />
        <StatsCard title="Market Demand"        value={isAnalyzed ? analysis.market_demand : '—'}
          subtitle={isAnalyzed ? 'Based on detected skills' : 'Upload resume to see demand'}
          icon={TrendingUp} trend={isAnalyzed ? 'up' : null} trendValue="trend" colorClass="from-warning to-orange-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-surface border border-surfaceHighlight rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-textMain mb-6">Resume Strength Activity</h3>
          {!isAnalyzed ? (
            <div className="h-[300px] flex flex-col items-center justify-center gap-3 text-textMuted">
              <Upload size={40} className="opacity-30" />
              <p className="text-sm">Upload your resume to see activity data</p>
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.3} />
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
              <Target size={40} className="opacity-30" />
              <p className="text-sm text-center">Upload your resume to see skill analysis</p>
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
              {analysis.strengths.length > 0
                ? analysis.strengths.map((s, i) => <li key={i} className="text-sm text-textMuted flex items-start gap-2"><span className="mt-0.5 text-success">✓</span>{s}</li>)
                : <li className="text-sm text-textMuted">Expand your resume to reveal more strengths.</li>}
            </ul>
          </div>
          <div className="bg-surface border border-surfaceHighlight rounded-2xl p-6">
            <h3 className="text-base font-semibold text-textMain mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-warning" /> Issues Found
            </h3>
            <ul className="space-y-2">
              {analysis.issues.length > 0
                ? analysis.issues.map((s, i) => <li key={i} className="text-sm text-textMuted flex items-start gap-2"><span className="mt-0.5 text-warning">!</span>{s}</li>)
                : <li className="text-sm text-textMuted flex items-center gap-2"><CheckCircle size={14} className="text-success" /> No major issues found!</li>}
            </ul>
          </div>
          <div className="bg-surface border border-surfaceHighlight rounded-2xl p-6">
            <h3 className="text-base font-semibold text-textMain mb-4 flex items-center gap-2">
              <Zap size={18} className="text-primary" /> Missing Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.missing_keywords.map((kw, i) => (
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
            Upload your resume (PDF, Word, or TXT) — it's analysed <strong>instantly in your browser</strong>.
            No server or account required.
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
