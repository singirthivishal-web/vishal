'use client';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, AlertCircle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

// ─── CLIENT-SIDE ATS ANALYSIS ─────────────────────────────────────────────────

const ATS_KEYWORDS = [
  'experience', 'education', 'skills', 'summary', 'objective',
  'projects', 'certifications', 'contact', 'achievements', 'awards',
];
const TECH_KEYWORDS = [
  'react', 'javascript', 'typescript', 'node', 'python', 'sql', 'aws',
  'docker', 'git', 'agile', 'scrum', 'ci/cd', 'graphql', 'kubernetes',
  'machine learning', 'data science', 'rest api', 'microservices',
];
const POWER_VERBS = [
  'developed', 'built', 'designed', 'implemented', 'led', 'managed',
  'optimized', 'reduced', 'increased', 'created', 'launched', 'delivered',
  'architected', 'spearheaded', 'engineered', 'streamlined', 'scaled',
];
const ALL_TECH = [
  'Docker', 'Kubernetes', 'AWS', 'CI/CD', 'GraphQL', 'TypeScript',
  'Redis', 'Terraform', 'Jenkins', 'Agile / Scrum',
];

async function extractTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'pdf') {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      const pages = await Promise.all(
        Array.from({ length: pdf.numPages }, (_, i) =>
          pdf.getPage(i + 1)
            .then(p => p.getTextContent())
            .then(tc => tc.items.map(it => it.str).join(' '))
        )
      );
      const text = pages.join('\n').trim();
      if (text.length > 10) return text;
    } catch (e) {
      console.warn('[AtsSimulation] pdfjs failed, raw fallback:', e.message);
    }
    // Binary fallback
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const raw = e.target.result || '';
        resolve((raw.match(/[\x20-\x7E]{4,}/g) || []).join(' '));
      };
      reader.onerror = () => resolve('');
      reader.readAsBinaryString(file);
    });
  }

  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result || '');
    reader.onerror = () => resolve('');
    reader.readAsText(file);
  });
}

function runAtsAnalysis(text, filename) {
  const low = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wc = words.length;

  // Section score (max 30)
  const sectionHits = ATS_KEYWORDS.filter(k => low.includes(k)).length;
  let score = Math.min(sectionHits * 4, 30);

  // Keyword density (max 25)
  const techHits = TECH_KEYWORDS.filter(k => low.includes(k)).length;
  score += Math.min(techHits * 3, 25);

  // Power verbs (max 20)
  const verbHits = POWER_VERBS.filter(v => low.includes(v)).length;
  score += Math.min(verbHits * 3, 20);

  // Quantified achievements (max 15)
  const numbers = (text.match(/\b\d+[%x+k]?\b/g) || []).length;
  score += Math.min(numbers * 2, 15);

  // Word count bonus (max 10)
  score += wc >= 200 && wc <= 800 ? 10 : wc > 100 ? 5 : 0;

  score = Math.min(score, 100);

  // Missing keywords
  const missingKeywords = ALL_TECH.filter(kw => !low.includes(kw.toLowerCase())).slice(0, 6);

  // Formatting issues
  const formattingIssues = [];
  if (!low.includes('linkedin') && !low.includes('github'))
    formattingIssues.push('No LinkedIn or GitHub profile URL detected');
  if (wc < 150)
    formattingIssues.push('Resume is too short — aim for 300–700 words');
  if ((text.match(/[A-Z]{4,}/g) || []).length > 10)
    formattingIssues.push('Excessive ALL-CAPS text detected — ATS may misparse');
  if (!low.includes('contact') && !text.match(/\b[\w.]+@[\w.]+\b/))
    formattingIssues.push('No contact section or email address found');
  if (formattingIssues.length === 0)
    formattingIssues.push('No major formatting issues found ✓');

  // Strengths
  const strengths = [];
  if (score >= 70) strengths.push('Strong overall ATS compatibility score');
  if (verbHits >= 3) strengths.push(`Good use of power verbs (${verbHits} detected)`);
  if (numbers >= 3) strengths.push('Quantified achievements found — recruiters love numbers');
  if (sectionHits >= 4) strengths.push('Well-structured with proper resume sections');
  if (low.includes('linkedin') || low.includes('github'))
    strengths.push('Professional profile links detected (LinkedIn/GitHub)');
  if (strengths.length === 0)
    strengths.push('Add more ATS keywords and action verbs to improve your score');

  const status =
    score >= 80 ? 'Excellent' :
    score >= 65 ? 'Good'       :
    score >= 45 ? 'Needs Work' : 'Critical Issues';

  return { score, status, missingKeywords, formattingIssues, strengths };
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function AtsSimulation() {
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing,  setAnalyzing]  = useState(false);
  const [results,    setResults]    = useState(null);
  const [errorMsg,   setError]      = useState('');
  const fileRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx', 'txt'].includes(ext)) {
      setError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    setResults(null);
    setError('');
    setAnalyzing(true);
    try {
      const text   = await extractTextFromFile(file);
      const result = runAtsAnalysis(text, file.name);
      setResults(result);
    } catch (e) {
      setError('Could not analyse the file. Please try a different document.');
      console.error('[AtsSimulation]', e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = ()  => setIsDragging(false);
  const handleDrop      = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };
  const handleChange = (e) => {
    processFile(e.target.files?.[0]);
    e.target.value = '';
  };
  const reset = () => { setResults(null); setError(''); };

  const scoreColor =
    results?.score >= 80 ? '#22c55e' :
    results?.score >= 65 ? '#6366f1' :
    results?.score >= 45 ? '#f59e0b' : '#ef4444';

  const circumference = 2 * Math.PI * 56; // r=56

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-textMain tracking-tight">Real ATS Simulation Engine</h1>
        <p className="text-textMuted mt-1">
          Upload your resume to see how an ATS parses and scores it — fully analysed in your browser.
        </p>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            key="err"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3 flex items-center gap-3 text-sm text-red-400"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
            <button onClick={reset} className="ml-auto text-red-400 hover:text-red-300"><XCircle size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop zone */}
      {!results && !analyzing && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-surfaceHighlight bg-surface'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-primary/20 text-primary' : 'bg-surfaceHighlight text-textMuted'}`}>
              <UploadCloud size={40} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-textMain">Drag &amp; drop your resume</h3>
              <p className="text-textMuted mt-1 text-sm">PDF, DOCX or TXT — analysed instantly in your browser</p>
            </div>
            <label className="bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-lg font-medium cursor-pointer transition-colors mt-2 inline-flex items-center gap-2">
              <FileText size={16} /> Browse Files
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleChange} />
            </label>
          </div>
        </div>
      )}

      {/* Analysing spinner */}
      {analyzing && (
        <div className="bg-surface rounded-2xl p-12 text-center border border-surfaceHighlight">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <h3 className="text-lg font-semibold text-textMain">Analysing your resume…</h3>
          <p className="text-textMuted mt-1 text-sm">Simulating ATS parsing engines (Taleo, Workday, Greenhouse)</p>
        </div>
      )}

      {/* Results */}
      {results && !analyzing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Score ring */}
          <div className="col-span-1 bg-surface border border-surfaceHighlight rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="56" stroke="#232D3F" strokeWidth="12" fill="transparent" />
                <motion.circle
                  cx="64" cy="64" r="56"
                  stroke={scoreColor}
                  strokeWidth="12"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference - (circumference * results.score) / 100 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-3xl font-bold text-textMain"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                >
                  {results.score}
                </motion.span>
                <span className="text-xs text-textMuted">/100</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-textMain">{results.status}</h3>
              <p className="text-textMuted text-sm mt-1">
                {results.score >= 80
                  ? 'Your resume passes most ATS filters.'
                  : results.score >= 65
                  ? 'Minor improvements will boost your pass rate.'
                  : 'Your resume may be filtered before reaching a recruiter.'}
              </p>
            </div>
            <button
              onClick={reset}
              className="w-full mt-2 bg-surfaceHighlight hover:bg-surfaceHighlight/80 text-textMain py-2.5 rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} /> Analyse Another Resume
            </button>
          </div>

          {/* Right panels */}
          <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Missing keywords */}
            <div className="bg-surface border border-red-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-red-400 font-semibold mb-4 text-sm">
                <XCircle size={18} /> Missing Keywords
              </div>
              <div className="flex flex-wrap gap-2">
                {results.missingKeywords.map((kw, i) => (
                  <span key={i} className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full">{kw}</span>
                ))}
                {results.missingKeywords.length === 0 && (
                  <p className="text-sm text-textMuted">All common keywords detected!</p>
                )}
              </div>
            </div>

            {/* Formatting issues */}
            <div className="bg-surface border border-warning/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-warning font-semibold mb-4 text-sm">
                <AlertCircle size={18} /> Formatting Notes
              </div>
              <ul className="space-y-2">
                {results.formattingIssues.map((iss, i) => (
                  <li key={i} className="text-sm text-textMuted flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
                    {iss}
                  </li>
                ))}
              </ul>
            </div>

            {/* Strengths */}
            <div className="sm:col-span-2 bg-surface border border-success/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-success font-semibold mb-4 text-sm">
                <CheckCircle2 size={18} /> Strengths Detected
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.strengths.map((str, i) => (
                  <li key={i} className="text-sm text-textMuted flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                    {str}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
