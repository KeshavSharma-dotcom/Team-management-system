import base64
import re
from difflib import SequenceMatcher
from io import BytesIO
from typing import Dict, List, Optional, Set

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from PyPDF2 import PdfReader

try:
    import spacy

    NLP = spacy.blank("en")
except Exception:
    NLP = None


app = FastAPI(title="TeamControl Resume Analysis Service", version="1.0.0")


class AnalyzeRequest(BaseModel):
    text: Optional[str] = Field(default=None, description="Plain resume text")
    pdf_base64: Optional[str] = Field(default=None, description="Base64 encoded PDF")
    requirements: str = Field(min_length=10, description="Project or role requirements")
    candidate_name: Optional[str] = None


class SkillResult(BaseModel):
    skill: str
    category: str


class AnalyzeResponse(BaseModel):
    score: int
    matchedSkills: List[str]
    missingSkills: List[str]
    extractedSkills: List[SkillResult]
    summary: str
    recommendations: List[str]
    textStats: Dict[str, int]


SKILL_MAP = {
    "frontend": {
        "React": ["react", "react.js", "reactjs"],
        "Vite": ["vite"],
        "JavaScript": ["javascript", "js", "ecmascript"],
        "TypeScript": ["typescript", "ts"],
        "HTML": ["html", "html5"],
        "CSS": ["css", "css3"],
        "Tailwind": ["tailwind", "tailwindcss"],
        "Redux": ["redux", "redux toolkit"],
    },
    "backend": {
        "Node.js": ["node", "node.js", "nodejs"],
        "Express": ["express", "express.js"],
        "Python": ["python"],
        "FastAPI": ["fastapi"],
        "Flask": ["flask"],
        "REST API": ["rest", "rest api", "restful"],
        "GraphQL": ["graphql"],
    },
    "database": {
        "MongoDB": ["mongodb", "mongo"],
        "Mongoose": ["mongoose"],
        "PostgreSQL": ["postgresql", "postgres"],
        "MySQL": ["mysql"],
        "Redis": ["redis"],
    },
    "ai_ml": {
        "NLP": ["nlp", "natural language processing"],
        "spaCy": ["spacy"],
        "PyPDF2": ["pypdf2"],
        "Machine Learning": ["machine learning", "ml"],
        "Gemini": ["gemini", "google generative ai"],
        "OpenAI": ["openai", "gpt"],
    },
    "devops": {
        "Docker": ["docker"],
        "Git": ["git", "github", "gitlab"],
        "CI/CD": ["ci/cd", "continuous integration", "continuous deployment"],
        "AWS": ["aws", "amazon web services"],
        "Azure": ["azure"],
        "GCP": ["gcp", "google cloud"],
    },
    "security": {
        "JWT": ["jwt", "json web token"],
        "OAuth": ["oauth", "oauth2"],
        "Authentication": ["authentication", "auth"],
        "Encryption": ["encryption", "encrypted"],
    },
}


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.lower()).strip()


def tokenize(value: str) -> Set[str]:
    if NLP:
        return {
            token.text.lower()
            for token in NLP(value)
            if not token.is_stop and not token.is_punct and len(token.text) > 2
        }

    return {token.lower() for token in re.findall(r"[a-zA-Z][a-zA-Z0-9+#.]{2,}", value)}


def strip_data_uri(value: str) -> str:
    if "," in value and value.split(",", 1)[0].startswith("data:"):
        return value.split(",", 1)[1]
    return value


def extract_pdf_text(pdf_base64: str) -> str:
    try:
        pdf_bytes = base64.b64decode(strip_data_uri(pdf_base64), validate=True)
        reader = PdfReader(BytesIO(pdf_bytes))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages).strip()
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Unable to extract text from PDF") from exc


def find_skills(text: str) -> List[SkillResult]:
    normalized = normalize_text(text)
    found: List[SkillResult] = []
    seen: Set[str] = set()

    for category, skills in SKILL_MAP.items():
        for canonical, aliases in skills.items():
            for alias in aliases:
                pattern = rf"(?<![a-z0-9+#.]){re.escape(alias.lower())}(?![a-z0-9+#.])"
                if re.search(pattern, normalized):
                    if canonical not in seen:
                        found.append(SkillResult(skill=canonical, category=category))
                        seen.add(canonical)
                    break

    return found


def score_resume(resume_text: str, requirements: str, resume_skills: List[SkillResult], requirement_skills: List[SkillResult]) -> int:
    resume_skill_set = {item.skill for item in resume_skills}
    requirement_skill_set = {item.skill for item in requirement_skills}

    if requirement_skill_set:
        skill_score = len(resume_skill_set.intersection(requirement_skill_set)) / len(requirement_skill_set)
    else:
        skill_score = 0.0

    requirement_tokens = tokenize(requirements)
    resume_tokens = tokenize(resume_text)
    token_score = len(resume_tokens.intersection(requirement_tokens)) / len(requirement_tokens) if requirement_tokens else 0
    similarity = SequenceMatcher(None, normalize_text(resume_text)[:6000], normalize_text(requirements)[:3000]).ratio()
    combined = (skill_score * 0.7) + (similarity * 0.2) + (token_score * 0.1)
    return max(0, min(100, round(combined * 100)))


def build_summary(score: int, matched: List[str], missing: List[str]) -> str:
    if score >= 80:
        fit = "strong"
    elif score >= 55:
        fit = "moderate"
    else:
        fit = "limited"

    matched_text = ", ".join(matched[:5]) if matched else "no direct requirement skills"
    missing_text = ", ".join(missing[:5]) if missing else "no major mapped gaps"
    return f"This resume shows a {fit} match. Matched skills include {matched_text}. Missing mapped requirements include {missing_text}."


def build_recommendations(missing: List[str], score: int) -> List[str]:
    recommendations = []
    if missing:
        recommendations.append(f"Probe experience with: {', '.join(missing[:5])}.")
    if score < 70:
        recommendations.append("Ask for concrete project examples before shortlisting.")
    recommendations.append("Validate seniority, ownership level, and recent hands-on usage during the interview.")
    return recommendations


@app.get("/health")
def health():
    return {"success": True, "message": "Resume analysis service is healthy"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest):
    resume_text = payload.text.strip() if payload.text else ""
    if payload.pdf_base64:
        resume_text = extract_pdf_text(payload.pdf_base64)

    if not resume_text:
        raise HTTPException(status_code=400, detail="Provide resume text or a base64 encoded PDF")

    resume_skills = find_skills(resume_text)
    requirement_skills = find_skills(payload.requirements)

    resume_skill_set = {item.skill for item in resume_skills}
    requirement_skill_set = {item.skill for item in requirement_skills}
    matched = sorted(resume_skill_set.intersection(requirement_skill_set))
    missing = sorted(requirement_skill_set.difference(resume_skill_set))
    score = score_resume(resume_text, payload.requirements, resume_skills, requirement_skills)

    return AnalyzeResponse(
        score=score,
        matchedSkills=matched,
        missingSkills=missing,
        extractedSkills=resume_skills,
        summary=build_summary(score, matched, missing),
        recommendations=build_recommendations(missing, score),
        textStats={
            "wordCount": len(resume_text.split()),
            "requirementSkillCount": len(requirement_skill_set),
            "matchedRequirementSkillCount": len(matched),
        },
    )
