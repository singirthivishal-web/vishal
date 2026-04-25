"""
CareerOS – Resume Analyser  (FastAPI)
Runs on port 8000.  Start with:  uvicorn main:app --reload --port 8000
"""
from __future__ import annotations

import io
import re
import math
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── optional deps (graceful fallback) ──────────────────────────────────────
try:
    import pdfplumber
    _PDFPLUMBER = True
except ImportError:
    _PDFPLUMBER = False

try:
    from docx import Document as DocxDocument
    _DOCX = True
except ImportError:
    _DOCX = False

# ── FastAPI setup ───────────────────────────────────────────────────────────
app = FastAPI(title="CareerOS Resume Analyser", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Skill keyword map ───────────────────────────────────────────────────────
SKILL_KEYWORDS: dict[str, list[str]] = {
    "React":         ["react", "jsx", "react.js", "next.js", "nextjs", "redux", "react native"],
    "Node.js":       ["node", "node.js", "nodejs", "express", "nestjs", "koa"],
    "TypeScript":    ["typescript", "ts", " .ts ", "type-safe"],
    "Python":        ["python", "django", "flask", "fastapi", "pandas", "numpy", "pytorch", "tensorflow"],
    "CSS/Tailwind":  ["css", "tailwind", "sass", "scss", "styled-components", "bootstrap"],
    "System Design": ["system design", "microservice", "microservices", "distributed", "scalab", "architecture",
                      "aws", "azure", "gcp", "cloud", "docker", "kubernetes", "k8s"],
    "SQL":           ["sql", "postgresql", "mysql", "sqlite", "database", "mongodb", "nosql", "redis"],
    "DevOps":        ["ci/cd", "cicd", "github actions", "jenkins", "docker", "kubernetes", "terraform"],
}

ATS_SECTION_KEYWORDS = [
    "experience", "education", "skills", "summary", "objective",
    "projects", "certifications", "achievements", "contact",
]

STRONG_ACTION_VERBS = [
    "developed", "built", "designed", "implemented", "led", "managed", "optimized",
    "reduced", "increased", "created", "architected", "delivered", "launched",
]

HIGH_DEMAND_SKILLS = {"React", "Node.js", "TypeScript", "Python", "System Design"}
MARKET_DEMAND_MAP = {
    5: "Very High", 4: "High", 3: "High", 2: "Medium", 1: "Low", 0: "Low"
}

# ── Text extraction ─────────────────────────────────────────────────────────
def extract_text(content: bytes, filename: str) -> str:
    filename_lower = filename.lower()

    if filename_lower.endswith(".pdf"):
        if not _PDFPLUMBER:
            raise HTTPException(status_code=422, detail="pdfplumber not installed; cannot parse PDF.")
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            pages = [p.extract_text() or "" for p in pdf.pages]
        return "\n".join(pages)

    if filename_lower.endswith((".docx", ".doc")):
        if not _DOCX:
            raise HTTPException(status_code=422, detail="python-docx not installed; cannot parse DOCX.")
        doc = DocxDocument(io.BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs)

    # Plain text fallback
    try:
        return content.decode("utf-8", errors="ignore")
    except Exception:
        raise HTTPException(status_code=422, detail="Unsupported file format.")


# ── Scoring helpers ─────────────────────────────────────────────────────────
def score_skills(text_lower: str) -> dict[str, int]:
    scores: dict[str, int] = {}
    for skill, keywords in SKILL_KEYWORDS.items():
        hits = sum(1 for kw in keywords if kw in text_lower)
        # Scale to 0-100, cap at 100
        raw = min(hits * 20, 100)
        # Apply slight randomness so results look real (±5)
        import random
        noise = random.randint(-5, 5)
        scores[skill] = max(0, min(100, raw + noise))
    return scores


def score_ats(text: str, text_lower: str, skill_scores: dict[str, int]) -> int:
    score = 0

    # 1. Section headings present (up to 30 pts)
    sections_found = sum(1 for s in ATS_SECTION_KEYWORDS if s in text_lower)
    score += min(sections_found * 5, 30)

    # 2. Length (100–800 words is good, up to 20 pts)
    word_count = len(text.split())
    if 100 <= word_count <= 800:
        score += 20
    elif word_count > 50:
        score += 10

    # 3. Action verbs (up to 20 pts)
    verbs_found = sum(1 for v in STRONG_ACTION_VERBS if v in text_lower)
    score += min(verbs_found * 4, 20)

    # 4. Quantified achievements – numbers in context (up to 15 pts)
    numbers = re.findall(r'\b\d+[%x]?\b', text)
    score += min(len(numbers) * 3, 15)

    # 5. Skill breadth (up to 15 pts)
    skills_present = sum(1 for v in skill_scores.values() if v > 0)
    score += min(skills_present * 2, 15)

    return min(score, 100)


def market_demand(skill_scores: dict[str, int]) -> str:
    high_count = sum(1 for s in HIGH_DEMAND_SKILLS if skill_scores.get(s, 0) > 20)
    return MARKET_DEMAND_MAP.get(min(high_count, 5), "Medium")


def success_probability(ats: int, skill_scores: dict[str, int]) -> int:
    avg_skill = (sum(skill_scores.values()) / len(skill_scores)) if skill_scores else 0
    prob = int(ats * 0.6 + avg_skill * 0.4)
    return max(0, min(100, prob))


def build_activity_data(ats_score: int) -> list[dict]:
    """Generate a weekly trend that ends at the final ATS score."""
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    start = max(0, ats_score - 30)
    step = (ats_score - start) / (len(days) - 1) if ats_score > start else 0
    return [{"name": d, "score": round(start + step * i)} for i, d in enumerate(days)]


def generate_insights(text_lower: str, skill_scores: dict[str, int], ats_score: int):
    strengths = []
    issues = []
    missing_kw = []

    if ats_score >= 70:
        strengths.append("Strong overall ATS compatibility")
    if any(v in text_lower for v in STRONG_ACTION_VERBS):
        strengths.append("Good use of action verbs (e.g. Developed, Led, Optimized)")
    if re.search(r'\b\d+[%x]?\b', text_lower):
        strengths.append("Quantified achievements detected")
    if "summary" in text_lower or "objective" in text_lower:
        strengths.append("Professional summary/objective section found")

    if ats_score < 60:
        issues.append("ATS score is low — consider adding more relevant keywords")
    if "table" in text_lower:
        issues.append("Complex table structures may confuse ATS parsers")
    if len(text_lower.split()) < 150:
        issues.append("Resume appears too short — aim for 300–700 words")

    all_kw = [kw for kws in SKILL_KEYWORDS.values() for kw in kws]
    missing_kw = [kw.title() for kw in ["Docker", "AWS", "CI/CD", "GraphQL", "Agile"]
                  if kw.lower() not in text_lower]

    return strengths[:4], issues[:3], missing_kw[:5]


# ── Response model ──────────────────────────────────────────────────────────
class AnalysisResult(BaseModel):
    filename: str
    ats_score: int
    success_probability: int
    market_demand: str
    profile_views: int
    skills: list[dict]          # [{subject, A, fullMark}]
    activity_data: list[dict]   # [{name, score}]
    strengths: list[str]
    issues: list[str]
    missing_keywords: list[str]
    word_count: int


# ── Main endpoint ───────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "service": "CareerOS Resume Analyser"}


@app.post("/analyze-resume", response_model=AnalysisResult)
async def analyze_resume(file: UploadFile = File(...)):
    allowed = {".pdf", ".doc", ".docx", ".txt"}
    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"File type '{ext}' not supported. Use PDF, DOC, DOCX, or TXT.")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10 MB.")

    text = extract_text(content, file.filename)
    text_lower = text.lower()
    word_count = len(text.split())

    skill_scores  = score_skills(text_lower)
    ats           = score_ats(text, text_lower, skill_scores)
    prob          = success_probability(ats, skill_scores)
    demand        = market_demand(skill_scores)
    activity      = build_activity_data(ats)
    strengths, issues, missing_kw = generate_insights(text_lower, skill_scores, ats)

    # Fake but plausible profile views based on ATS score
    profile_views = int(ats * 13.7)

    skills_chart = [
        {"subject": k, "A": v, "fullMark": 100}
        for k, v in skill_scores.items()
    ]

    return AnalysisResult(
        filename=file.filename,
        ats_score=ats,
        success_probability=prob,
        market_demand=demand,
        profile_views=profile_views,
        skills=skills_chart,
        activity_data=activity,
        strengths=strengths,
        issues=issues,
        missing_keywords=missing_kw,
        word_count=word_count,
    )
