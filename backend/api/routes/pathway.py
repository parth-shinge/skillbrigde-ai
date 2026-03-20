"""
Pathway API route for SkillBridge AI.
Generates personalized learning pathways with reasoning traces and metrics.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from core import rag_catalog, graph_engine, reasoning_tracer, metrics

router = APIRouter()


class SkillGapInput(BaseModel):
    """Skill gap input from analyze results."""

    skill: str
    required_level: str
    current_level: str | None = None
    gap_score: float
    priority: str


class PathwayRequest(BaseModel):
    """Request body for the /pathway endpoint."""

    skill_gaps: list[SkillGapInput]
    role_title: str
    job_category: str = "technical"


class CourseItem(BaseModel):
    """Course entry in the pathway."""

    position: int
    course_id: str
    title: str
    domain: str
    duration_hours: float
    level: str
    priority: str
    skills_taught: list[str]
    learning_objectives: list[str] = []


class TraceItem(BaseModel):
    """Reasoning trace entry for a pathway step."""

    step: int
    skill_addressed: str
    gap_score: float
    course_selected: str
    reason: str
    confidence: float


class MetricsResult(BaseModel):
    """Onboarding metrics summary."""

    total_hours: float
    standard_hours: float
    time_saved_hours: float
    time_saved_percent: float
    readiness_improvement: float
    modules_count: int


class PathwayResponse(BaseModel):
    """Response schema for the /pathway endpoint."""

    pathway: list[CourseItem]
    reasoning_trace: list[TraceItem]
    metrics: MetricsResult


@router.post("/pathway", response_model=PathwayResponse)
async def generate_pathway(request: PathwayRequest):
    """Generate a personalized learning pathway based on skill gaps.

    Queries the RAG catalog for relevant courses, builds a prerequisite-aware
    pathway graph, generates reasoning traces, and calculates efficiency metrics.
    """
    try:
        all_courses = rag_catalog.get_all_courses()
        candidate_courses = []
        seen_ids = set()

        # 1. For each critical/recommended gap, query RAG catalog
        for gap in request.skill_gaps:
            if gap.priority in ("critical", "recommended"):
                matches = rag_catalog.query_courses(
                    skill_name=gap.skill,
                    job_category=request.job_category,
                    top_k=3,
                )
                for course in matches:
                    if course["id"] not in seen_ids:
                        course_with_priority = {**course, "_priority": gap.priority}
                        candidate_courses.append(course_with_priority)
                        seen_ids.add(course["id"])

        # Also include optional gaps if we have few courses
        if len(candidate_courses) < 3:
            for gap in request.skill_gaps:
                if gap.priority == "optional":
                    matches = rag_catalog.query_courses(
                        skill_name=gap.skill,
                        job_category=request.job_category,
                        top_k=2,
                    )
                    for course in matches:
                        if course["id"] not in seen_ids:
                            course_with_priority = {**course, "_priority": gap.priority}
                            candidate_courses.append(course_with_priority)
                            seen_ids.add(course["id"])

        # 2. Build ordered pathway graph
        pathway = graph_engine.build_pathway_graph(candidate_courses, all_courses)

        # 3. Generate reasoning trace
        gap_dicts = [g.model_dump() for g in request.skill_gaps]
        trace = reasoning_tracer.generate_trace(gap_dicts, pathway)

        # 4. Calculate metrics
        # Compute readiness before from gap scores
        if request.skill_gaps:
            avg_gap = sum(g.gap_score for g in request.skill_gaps) / len(request.skill_gaps)
            readiness_before = 1.0 - avg_gap
        else:
            readiness_before = 1.0

        pathway_metrics = metrics.calculate_metrics(pathway, readiness_before)

        # 5. Build response
        pathway_items = [
            CourseItem(
                position=c["position"],
                course_id=c["id"],
                title=c["title"],
                domain=c["domain"],
                duration_hours=c["duration_hours"],
                level=c["level"],
                priority=c.get("priority", "recommended"),
                skills_taught=c["skills_taught"],
                learning_objectives=c.get("learning_objectives", []),
            )
            for c in pathway
        ]

        trace_items = [TraceItem(**t) for t in trace]

        print(f"[PATHWAY] Generated {len(pathway_items)} courses for '{request.role_title}' "
              f"({request.job_category})")

        return PathwayResponse(
            pathway=pathway_items,
            reasoning_trace=trace_items,
            metrics=MetricsResult(**pathway_metrics),
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pathway generation failed: {str(e)}")
