"""
Skill gap analyzer module for SkillBridge AI.
Uses sentence-transformer embeddings to compute semantic skill gap scores.
"""

import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load embedding model at module level for reuse
print("[INIT] Loading sentence-transformers model...")
_model = SentenceTransformer("all-MiniLM-L6-v2")
print("[INIT] Embedding model loaded successfully")

PROFICIENCY_LEVELS = {"beginner": 1, "intermediate": 2, "advanced": 3, "expert": 4}


def _proficiency_to_int(level: str) -> int:
    """Convert proficiency string to integer level.

    Args:
        level: Proficiency level string.

    Returns:
        Integer 1-4 representing the proficiency.
    """
    return PROFICIENCY_LEVELS.get(level.lower(), 1)


def _embed_skills(skill_names: list[str]) -> np.ndarray:
    """Generate embeddings for a list of skill names.

    Args:
        skill_names: List of skill name strings.

    Returns:
        Numpy array of embeddings, shape (n_skills, embedding_dim).
    """
    if not skill_names:
        return np.array([])
    return _model.encode(skill_names, convert_to_numpy=True)


def compute_skill_gaps(resume_skills: list[dict], jd_skills: list[dict]) -> dict:
    """Compute skill gaps between resume and job description skills.

    Uses cosine similarity on sentence embeddings to match skills semantically,
    then computes gap scores based on proficiency differences.

    Args:
        resume_skills: List of skill dicts from resume extraction.
        jd_skills: List of skill dicts from JD extraction.

    Returns:
        Dict with skill_gaps, overall_readiness_score, matched_skills, missing_skills.
    """
    if not jd_skills:
        return {
            "skill_gaps": [],
            "overall_readiness_score": 1.0,
            "matched_skills": [s["name"] for s in resume_skills],
            "missing_skills": [],
        }

    # Extract names for embedding
    resume_names = [s["name"] for s in resume_skills]
    jd_names = [s["name"] for s in jd_skills]

    # Build proficiency lookup for resume
    resume_prof_map = {}
    for s in resume_skills:
        resume_prof_map[s["name"]] = s.get("proficiency", "beginner")

    # Compute embeddings
    jd_embeddings = _embed_skills(jd_names)

    if resume_names:
        resume_embeddings = _embed_skills(resume_names)
        # Compute similarity matrix: (n_jd, n_resume)
        sim_matrix = cosine_similarity(jd_embeddings, resume_embeddings)
    else:
        sim_matrix = np.zeros((len(jd_names), 0))

    skill_gaps = []
    matched_skills = []
    missing_skills = []
    all_gap_scores = []

    for i, jd_skill in enumerate(jd_skills):
        jd_name = jd_skill["name"]
        jd_prof = jd_skill.get("proficiency", "intermediate")
        jd_level = _proficiency_to_int(jd_prof)

        if resume_names and sim_matrix.shape[1] > 0:
            best_idx = int(np.argmax(sim_matrix[i]))
            best_sim = float(sim_matrix[i][best_idx])
            best_resume_name = resume_names[best_idx]
            best_resume_prof = resume_prof_map.get(best_resume_name, "beginner")
            resume_level = _proficiency_to_int(best_resume_prof)
        else:
            best_sim = 0.0
            best_resume_prof = None
            resume_level = 0

        # Determine gap score
        if best_sim < 0.4:
            # Skill is MISSING — no meaningful match found
            gap_score = 1.0
            current_level = None
            missing_skills.append(jd_name)
        elif resume_level < jd_level:
            # Partial gap — has skill but at lower proficiency
            gap_score = round((jd_level - resume_level) / 4.0, 2)
            current_level = best_resume_prof
        else:
            # No gap — resume meets or exceeds requirement
            gap_score = 0.0
            current_level = best_resume_prof
            matched_skills.append(jd_name)

        # Assign priority
        if gap_score >= 0.7:
            priority = "critical"
        elif gap_score >= 0.4:
            priority = "recommended"
        else:
            priority = "optional"

        all_gap_scores.append(gap_score)

        # Only include non-zero gaps in the gaps list
        if gap_score > 0:
            skill_gaps.append({
                "skill": jd_name,
                "required_level": jd_prof,
                "current_level": current_level,
                "gap_score": gap_score,
                "priority": priority,
            })

    # Overall readiness
    if all_gap_scores:
        overall_readiness = round(1.0 - float(np.mean(all_gap_scores)), 3)
    else:
        overall_readiness = 1.0

    # Clamp readiness to [0, 1]
    overall_readiness = max(0.0, min(1.0, overall_readiness))

    print(f"[GAP] Analyzed {len(jd_skills)} JD skills: "
          f"{len(matched_skills)} matched, {len(missing_skills)} missing, "
          f"{len(skill_gaps)} gaps. Readiness: {overall_readiness}")

    return {
        "skill_gaps": skill_gaps,
        "overall_readiness_score": overall_readiness,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
    }
