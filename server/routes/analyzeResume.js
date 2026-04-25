/**
 * POST /api/analyze-resume
 * Accepts multipart/form-data with field name "file".
 * Returns JSON analysis — NO external deps required at load time.
 * pdf-parse is loaded lazily inside the handler (graceful fallback if absent).
 */

import express from 'express';
import multer  from 'multer';
import path    from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const router  = express.Router();

// ── Multer — keep file in RAM ─────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const ok  = ['.pdf', '.doc', '.docx', '.txt'].includes(ext);
    cb(ok ? null : new Error('Unsupported file type. Use PDF, DOCX or TXT.'), ok);
  },
});

// ── Skill keyword map ─────────────────────────────────────────────────────
const SKILL_MAP = {
  'React':         ['react', 'jsx', 'next.js', 'nextjs', 'redux', 'react native'],
  'Node.js':       ['node.js', 'nodejs', 'express', 'nestjs', 'node '],
  'TypeScript':    ['typescript', ' ts ', '.tsx', 'type-safe'],
  'Python':        ['python', 'django', 'flask', 'fastapi', 'pandas', 'numpy'],
  'CSS/Tailwind':  ['css', 'tailwind', 'sass', 'scss', 'styled-components', 'bootstrap'],
  'System Design': ['system design', 'microservice', 'distributed', 'architecture', 'aws', 'azure', 'docker', 'kubernetes'],
  'SQL':           ['sql', 'postgresql', 'mysql', 'mongodb', 'nosql', 'redis'],
  'DevOps':        ['ci/cd', 'github actions', 'jenkins', 'terraform', 'docker compose'],
};

const ATS_SECTIONS = ['experience', 'education', 'skills', 'summary', 'objective', 'projects', 'certifications', 'contact'];
const ACTION_VERBS = ['developed', 'built', 'designed', 'implemented', 'led', 'managed', 'optimized',
  'reduced', 'increased', 'created', 'launched', 'delivered', 'architected', 'spearheaded'];
const HIGH_DEMAND  = new Set(['React', 'Node.js', 'TypeScript', 'Python', 'System Design']);
const DEMAND_MAP   = { 5: 'Very High', 4: 'High', 3: 'High', 2: 'Medium', 1: 'Low', 0: 'Low' };

// ── Text extraction (pdf-parse loaded lazily so a missing package ─────────
// won't crash the server — it falls back to raw buffer text)
async function extractText(buffer, filename) {
  const ext = path.extname(filename).toLowerCase();

  if (ext === '.pdf') {
    try {
      const pdfParse = require('pdf-parse'); // lazy — throws only if pkg missing
      const data = await pdfParse(buffer);
      return data.text || '';
    } catch (e) {
      console.warn('[analyze-resume] pdf-parse unavailable, using raw text fallback:', e.message);
      return buffer.toString('latin1'); // PDFs are binary, best-effort
    }
  }

  if (ext === '.docx' || ext === '.doc') {
    return buffer.toString('utf8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  }

  return buffer.toString('utf8');
}

// ── Scoring helpers ───────────────────────────────────────────────────────
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

  if (ats >= 70) strengths.push('Strong overall ATS compatibility');
  if (ACTION_VERBS.some(v => low.includes(v))) strengths.push('Good use of action verbs (e.g. Developed, Led)');
  if (/\b\d+[%x]?\b/.test(low))              strengths.push('Quantified achievements detected');
  if (low.includes('summary') || low.includes('objective')) strengths.push('Professional summary section found');

  if (ats < 60) issues.push('ATS score is low — add more relevant keywords');
  if (low.split(/\s+/).filter(Boolean).length < 150) issues.push('Resume too short — aim for 300–700 words');
  if (!low.includes('linkedin') && !low.includes('github')) issues.push('No LinkedIn or GitHub profile detected');

  ['Docker', 'AWS', 'CI/CD', 'GraphQL', 'Agile', 'Kubernetes'].forEach(kw => {
    if (!low.includes(kw.toLowerCase())) missing_keywords.push(kw);
  });

  return {
    strengths:        strengths.slice(0, 4),
    issues:           issues.slice(0, 3),
    missing_keywords: missing_keywords.slice(0, 5),
  };
}

// ── Route handler ─────────────────────────────────────────────────────────
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided.' });

    const text       = await extractText(req.file.buffer, req.file.originalname);
    const low        = text.toLowerCase();
    const word_count = text.split(/\s+/).filter(Boolean).length;

    const skillScores = scoreSkills(low);
    const ats_score   = scoreAts(text, low, skillScores);
    const insights    = buildInsights(low, skillScores, ats_score);

    return res.json({
      filename:            req.file.originalname,
      ats_score,
      success_probability: successProb(ats_score, skillScores),
      market_demand:       marketDemand(skillScores),
      profile_views:       Math.round(ats_score * 13.7),
      skills:              Object.entries(skillScores).map(([subject, A]) => ({ subject, A, fullMark: 100 })),
      activity_data:       buildActivity(ats_score),
      word_count,
      ...insights,
    });
  } catch (err) {
    console.error('[analyze-resume] ERROR:', err.message);
    res.status(500).json({ message: err.message || 'Resume analysis failed.' });
  }
});

export default router;
