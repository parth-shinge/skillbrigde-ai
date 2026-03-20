"""
Analyze API route for SkillBridge AI.
Computes skill gaps between resume and job description skills.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from core.gap_analyzer import compute_skill_gaps

router = APIRouter()


class SkillInput(BaseModel):
    """Skill input from parse results."""

    name: str
    proficiency: str
    years: float | None = None


class AnalyzeRequest(BaseModel):
    """Request body for the /analyze endpoint."""

    resume_skills: list[SkillInput]
    jd_skills: list[SkillInput]


class SkillGapItem(BaseModel):
    """Individual skill gap result."""

    skill: str
    required_level: str
    current_level: str | None = None
    gap_score: float
    priority: str


class AnalyzeResponse(BaseModel):
    """Response schema for the /analyze endpoint."""

    skill_gaps: list[SkillGapItem]
    overall_readiness_score: float
    matched_skills: list[str]
    missing_skills: list[str]


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_skill_gaps(request: AnalyzeRequest):
    """Analyze skill gaps between resume and job description skills.

    Compares resume skills against JD requirements using semantic embeddings
    and proficiency levels to compute gap scores and readiness.
    """
    try:
        resume_dicts = [s.model_dump() for s in request.resume_skills]
        jd_dicts = [s.model_dump() for s in request.jd_skills]

        result = compute_skill_gaps(resume_dicts, jd_dicts)

        print(f"[ANALYZE] Readiness: {result['overall_readiness_score']}, "
              f"Gaps: {len(result['skill_gaps'])}, "
              f"Matched: {len(result['matched_skills'])}")

        return AnalyzeResponse(
            skill_gaps=[SkillGapItem(**g) for g in result["skill_gaps"]],
            overall_readiness_score=result["overall_readiness_score"],
            matched_skills=result["matched_skills"],
            missing_skills=result["missing_skills"],
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill gap analysis failed: {str(e)}")
