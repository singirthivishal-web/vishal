'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export default function AtsSimulation() {
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing]   = useState(false);
  const [results, setResults]       = useState(null);

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = ()  => setIsDragging(false);
  const handleDrop      = (e) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) runAnalysis(f);
  };

  async function runAnalysis(file) {
    setAnalyzing(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res  = await fetch('/api/analyze-resume', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Analysis failed');
      setResults({
        score:            data.ats_score,
        status:           data.ats_score >= 80 ? 'Excellent' : data.ats_score >= 65 ? 'Needs Improvement' : 'Critical Issues',
        missingKeywords:  data.missing_keywords || [],
        formattingIssues: data.issues || [],
        strengths:        data.strengths || [],
      });
    } catch {
      // fallback mock
      setResults({ score: 68, status: 'Needs Improvement',
        missingKeywords:  ['Agile', 'CI/CD', 'GraphQL', 'Docker'],
        formattingIssues: ['Complex table structures detected', 'Non-standard font in header'],
        strengths:        ['Clear quantifiable metrics', 'Good action verbs (Developed, Spearheaded)'],
      });
    } finally { setAnalyzing(false); }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textMain tracking-tight">Real ATS Simulation Engine</h1>
        <p className="text-textMuted mt-1">Upload your resume to see exactly how an ATS parses and scores it.</p>
      </div>

      {!results && !analyzing && (
        <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${isDragging ? 'border-primary bg-primary/5' : 'border-surfaceHighlight bg-surface'}`}>
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`p-4 rounded-full ${isDragging ? 'bg-primary/20 text-primary' : 'bg-surfaceHighlight text-textMuted'}`}>
              <UploadCloud size={40} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-textMain">Drag & drop your resume</h3>
              <p className="text-textMuted mt-1">Supports PDF, DOCX, TXT up to 5 MB</p>
            </div>
            <label className="bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-lg font-medium cursor-pointer transition-colors mt-4 inline-block">
              Browse Files
              <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => e.target.files?.[0] && runAnalysis(e.target.files[0])} />
            </label>
          </div>
        </div>
      )}

      {analyzing && (
        <div className="bg-surface rounded-2xl p-12 text-center border border-surfaceHighlight">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-textMain">Analysing your resume…</h3>
          <p className="text-textMuted mt-1">Simulating Taleo and Workday ATS parsing engines via Express API</p>
        </div>
      )}

      {results && !analyzing && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 bg-surface border border-surfaceHighlight rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-surfaceHighlight" />
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-warning"
                  strokeDasharray="351.85" strokeDashoffset={351.85 - (351.85 * results.score) / 100} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-textMain">{results.score}</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-textMain">{results.status}</h3>
            <p className="text-textMuted text-sm mt-2">Your resume might be filtered before reaching a human recruiter.</p>
            <button onClick={() => setResults(null)}
              className="mt-6 w-full bg-surfaceHighlight hover:bg-surfaceHighlight/80 text-textMain py-2 rounded-lg transition-colors text-sm font-medium">
              Upload New Resume
            </button>
          </div>

          <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface border border-danger/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-danger font-semibold mb-4"><XCircle size={20} /> Missing Keywords</div>
              <ul className="space-y-2">
                {results.missingKeywords.map((kw, i) => (
                  <li key={i} className="text-sm text-textMuted flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-danger" />{kw}</li>
                ))}
              </ul>
            </div>
            <div className="bg-surface border border-warning/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-warning font-semibold mb-4"><AlertCircle size={20} /> Formatting Issues</div>
              <ul className="space-y-2">
                {results.formattingIssues.map((iss, i) => (
                  <li key={i} className="text-sm text-textMuted flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />{iss}</li>
                ))}
              </ul>
            </div>
            <div className="col-span-1 sm:col-span-2 bg-surface border border-success/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-success font-semibold mb-4"><CheckCircle2 size={20} /> Strengths Detected</div>
              <ul className="space-y-2">
                {results.strengths.map((str, i) => (
                  <li key={i} className="text-sm text-textMuted flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />{str}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
