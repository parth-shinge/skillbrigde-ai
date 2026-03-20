"""
Parse API route for SkillBridge AI.
Handles resume and job description upload, text extraction, and skill parsing.
"""

import time

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from core.parser import parse_document
from core.skill_extractor import extract_skills

router = APIRouter()


class SkillItem(BaseModel):
    """Individual skill with proficiency and experience."""

    name: str
    proficiency: str
    years: float | None = None


class ParseResponse(BaseModel):
    """Response schema for the /parse endpoint."""

    resume_skills: list[SkillItem]
    jd_skills: list[SkillItem]
    parse_time_ms: float


@router.post("/parse", response_model=ParseResponse)
async def parse_resume_and_jd(
    resume_file: UploadFile = File(...),
    job_description: str = Form(""),
    jd_file: UploadFile | None = File(None),
):
    """Parse a resume and job description to extract skills.

    Accepts a resume PDF/TXT file and either a JD text string or JD file.
    Returns extracted and normalized skills for both documents.
    """
    start = time.time()

    # 1. Parse resume
    try:
        resume_bytes = await resume_file.read()
        resume_text = await parse_document(resume_bytes, resume_file.filename or "resume.pdf")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"Resume parse error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume processing failed: {str(e)}")

    # 2. Parse JD
    try:
        if jd_file and jd_file.filename:
            jd_bytes = await jd_file.read()
            jd_text = await parse_document(jd_bytes, jd_file.filename)
        elif job_description and job_description.strip():
            jd_text = job_description.strip()
        else:
            raise HTTPException(
                status_code=422,
                detail="Either job_description text or jd_file must be provided",
            )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"JD parse error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"JD processing failed: {str(e)}")

    # 3. Extract skills
    try:
        resume_skills = await extract_skills(resume_text, "resume")
        jd_skills = await extract_skills(jd_text, "jd")
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    elapsed_ms = round((time.time() - start) * 1000, 1)
    print(f"[PARSE] Completed in {elapsed_ms}ms — "
          f"{len(resume_skills)} resume skills, {len(jd_skills)} JD skills")

    return ParseResponse(
        resume_skills=[SkillItem(**s) for s in resume_skills],
        jd_skills=[SkillItem(**s) for s in jd_skills],
        parse_time_ms=elapsed_ms,
    )
