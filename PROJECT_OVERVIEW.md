# SkillBridge AI — Project Overview

## Tagline
*"From Day One to Done Right — Personalized Onboarding, Powered by AI"*

## Problem
Corporate onboarding uses static, one-size-fits-all curricula. Experienced hires waste time on known concepts; beginners are overwhelmed by advanced modules.

## Solution
SkillBridge AI is an AI-driven adaptive learning engine that:
1. Parses a new hire's resume and a target job description
2. Extracts and normalizes skills with proficiency levels
3. Computes a precise skill gap score using embedding similarity
4. Generates a personalized, prerequisite-aware learning pathway via a directed graph
5. Shows a full reasoning trace explaining every recommendation
6. Grounds ALL recommendations in a local course catalog (zero hallucinations)

## Extra Features (beyond minimum requirements)
- Diagnostic Quiz Mode (assess skills without a resume)
- Cross-Domain Support (Technical AND Operational roles)
- Time-Saved Metrics Dashboard
- Interactive Node Graph Pathway Visualization
- PDF Export of personalized learning plan
- Demo Mode (pre-loaded personas for judges)

## API Contract (Backend → Frontend)

### Base URL: http://localhost:8000

### POST /api/parse
Request: FormData { resume_file: File (PDF), job_description: string }
Response:
```json
{
  "resume_skills": [{"name": "string", "proficiency": "beginner|intermediate|advanced|expert", "years": "number|null"}],
  "jd_skills": [{"name": "string", "proficiency": "string", "years": null}],
  "parse_time_ms": "number"
}
```

### POST /api/analyze
Request: { "resume_skills": [...], "jd_skills": [...] }
Response:
```json
{
  "skill_gaps": [{"skill": "string", "required_level": "string", "current_level": "string|null", "gap_score": "number", "priority": "critical|recommended|optional"}],
  "overall_readiness_score": "number",
  "matched_skills": ["string"],
  "missing_skills": ["string"]
}
```

### POST /api/pathway
Request: { "skill_gaps": [...], "role_title": "string", "job_category": "technical|operational" }
Response:
```json
{
  "pathway": [{"position": "number", "course_id": "string", "title": "string", "domain": "string", "duration_hours": "number", "level": "string", "priority": "string", "skills_taught": ["string"]}],
  "reasoning_trace": [{"step": "number", "skill_addressed": "string", "gap_score": "number", "course_selected": "string", "reason": "string", "confidence": "number"}],
  "metrics": {"total_hours": "number", "standard_hours": "number", "time_saved_hours": "number", "readiness_improvement": "number", "modules_count": "number"}
}
```

### GET /health
Response: { "status": "ok", "version": "1.0.0" }

## Data Schemas

### Course (course_catalog.json)
```json
{
  "id": "string",
  "title": "string",
  "domain": "string",
  "description": "string",
  "skills_taught": ["string"],
  "prerequisite_ids": ["string"],
  "level": "beginner|intermediate|advanced",
  "duration_hours": "number",
  "job_categories": ["string"],
  "learning_objectives": ["string"],
  "assessment_type": "string"
}
```

## Color Palette (Frontend)
- Background: #0F172A
- Card surface: #1E293B
- Border: #334155
- Cyan accent: #06B6D4
- Green success: #10B981
- Amber warning: #F59E0B
- Red critical: #EF4444
- Text primary: #F1F5F9
- Text muted: #94A3B8

## Fonts
- Headings: 'Outfit' (Google Fonts)
- Body: 'Inter' (Google Fonts)
