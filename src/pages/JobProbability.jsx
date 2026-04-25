import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

const ROLES = [
  { label: 'Frontend Developer',  skills: ['react', 'javascript', 'css', 'html', 'typescript', 'tailwind', 'git'] },
  { label: 'Backend Developer',   skills: ['node', 'express', 'python', 'sql', 'mongodb', 'rest api', 'docker'] },
  { label: 'Full Stack Developer',skills: ['react', 'node', 'javascript', 'sql', 'git', 'docker', 'rest api'] },
  { label: 'Data Scientist',      skills: ['python', 'machine learning', 'pandas', 'numpy', 'sql', 'tensorflow', 'jupyter'] },
  { label: 'DevOps Engineer',     skills: ['docker', 'kubernetes', 'ci/cd', 'aws', 'terraform', 'linux', 'jenkins'] },
  { label: 'Cloud Architect',     skills: ['aws', 'azure', 'docker', 'kubernetes', 'terraform', 'networking', 'security'] },
];

function calcProbability(userSkills, roleSkills) {
  const low  = userSkills.toLowerCase();
  const hits = roleSkills.filter(s => low.includes(s)).length;
  return Math.min(Math.round((hits / roleSkills.length) * 100), 100);
}

const CIRCUMFERENCE = 2 * Math.PI * 56;

export default function JobProbability() {
  const [role,       setRole]       = useState(ROLES[0]);
  const [userSkills, setUserSkills] = useState('');
  const [result,     setResult]     = useState(null);

  function handleCalc() {
    if (!userSkills.trim()) return;
    const prob   = calcProbability(userSkills, role.skills);
    const found  = role.skills.filter(s => userSkills.toLowerCase().includes(s));
    const missing = role.skills.filter(s => !userSkills.toLowerCase().includes(s));
    setResult({ prob, found, missing });
  }

  const color =
    result?.prob >= 80 ? '#22c55e' :
    result?.prob >= 60 ? '#6366f1' :
    result?.prob >= 40 ? '#f59e0b' : '#ef4444';

  const label =
    result?.prob >= 80 ? 'Excellent Match' :
    result?.prob >= 60 ? 'Good Match'      :
    result?.prob >= 40 ? 'Partial Match'   : 'Low Match';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-textMain tracking-tight">Job Success Probability</h1>
        <p className="text-textMuted mt-1">Select a role and enter your skills to see how well you match.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input panel */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-textMain mb-2">Target Role</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(r => (
                <button
                  key={r.label}
                  onClick={() => { setRole(r); setResult(null); }}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all border ${
                    role.label === r.label
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                      : 'bg-surface border-surfaceHighlight text-textMuted hover:border-primary/50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-textMain mb-2">Your Skills</label>
            <textarea
              value={userSkills}
              onChange={e => { setUserSkills(e.target.value); setResult(null); }}
              placeholder="e.g. React, Node.js, TypeScript, Docker, SQL, AWS..."
              className="w-full h-36 bg-surface border border-surfaceHighlight rounded-xl p-4 text-sm text-textMain focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleCalc}
            disabled={!userSkills.trim()}
            className="w-full bg-primary hover:bg-primaryHover disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            <Target size={18} /> Calculate Match
          </button>
        </div>

        {/* Result panel */}
        <div className="flex flex-col items-center justify-center bg-surface border border-surfaceHighlight rounded-2xl p-8 gap-6">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 text-textMuted text-center"
              >
                <TrendingUp size={48} className="opacity-20" />
                <p className="text-sm">Enter your skills and click Calculate Match</p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-5 w-full"
              >
                {/* Score ring */}
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="56" stroke="#232D3F" strokeWidth="12" fill="transparent" />
                    <motion.circle
                      cx="64" cy="64" r="56"
                      stroke={color}
                      strokeWidth="12"
                      fill="transparent"
                      strokeLinecap="round"
                      strokeDasharray={CIRCUMFERENCE}
                      initial={{ strokeDashoffset: CIRCUMFERENCE }}
                      animate={{ strokeDashoffset: CIRCUMFERENCE - (CIRCUMFERENCE * result.prob) / 100 }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-textMain">{result.prob}%</span>
                    <span className="text-xs text-textMuted">match</span>
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-bold text-textMain">{label}</h3>
                  <p className="text-sm text-textMuted mt-1">for {role.label}</p>
                </div>

                {/* Found / Missing */}
                <div className="w-full grid grid-cols-2 gap-3">
                  <div className="bg-success/10 border border-success/20 rounded-xl p-3">
                    <p className="text-xs font-semibold text-success mb-2 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Matched ({result.found.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {result.found.map(s => (
                        <span key={s} className="text-xs bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full capitalize">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <p className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1">
                      <AlertCircle size={13} /> Missing ({result.missing.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {result.missing.map(s => (
                        <span key={s} className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full capitalize">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Pro tip */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-2xl px-6 py-4 flex items-start gap-3 text-sm text-primary"
        >
          <Zap size={16} className="shrink-0 mt-0.5" />
          <span>
            <strong>Tip:</strong> Learn the missing skills to push your match score to 100%.
            Even 1–2 more skills can significantly improve your chances.
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
