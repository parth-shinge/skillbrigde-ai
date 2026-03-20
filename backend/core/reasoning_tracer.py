"""
Reasoning trace generator for SkillBridge AI.
Produces human-readable explanations for each course recommendation in the pathway.
"""


def generate_trace(skill_gaps: list[dict], pathway: list[dict]) -> list[dict]:
    """Generate a reasoning trace linking each pathway course to the skill gap it addresses.

    For each course in the pathway, finds the most relevant skill gap and produces
    a human-readable explanation of why the course was selected.

    Args:
        skill_gaps: List of skill gap dicts from gap analysis.
        pathway: Ordered list of course dicts in the learning pathway.

    Returns:
        List of trace entry dicts with step, skill_addressed, gap_score,
        course_selected, reason, and confidence.
    """
    # Build lookup from skill name to gap info
    gap_lookup = {g["skill"].lower(): g for g in skill_gaps}

    trace = []
    addressed_skills = set()

    for course in pathway:
        course_skills = course.get("skills_taught", [])
        course_title = course.get("title", "Unknown Course")
        course_priority = course.get("priority", "recommended")

        # Find the best matching skill gap for this course
        best_gap = None
        for skill in course_skills:
            skill_lower = skill.lower()
            if skill_lower in gap_lookup and skill_lower not in addressed_skills:
                candidate = gap_lookup[skill_lower]
                if best_gap is None or candidate["gap_score"] > best_gap["gap_score"]:
                    best_gap = candidate

        # If no unaddressed gap found, try any gap this course covers
        if best_gap is None:
            for skill in course_skills:
                skill_lower = skill.lower()
                if skill_lower in gap_lookup:
                    best_gap = gap_lookup[skill_lower]
                    break

        # Build trace entry
        if best_gap:
            skill_addressed = best_gap["skill"]
            gap_score = best_gap["gap_score"]
            current_level = best_gap.get("current_level")
            required_level = best_gap.get("required_level", "intermediate")
            addressed_skills.add(skill_addressed.lower())

            current_str = current_level if current_level else "no"
            reason = (
                f"Your profile shows {current_str} proficiency in {skill_addressed}. "
                f"The target role requires {required_level} level, so {course_title} "
                f"was selected to bridge this gap."
            )
            confidence = round(max(0.7, min(0.99, 1.0 - (gap_score * 0.3))), 2)
        else:
            # Prerequisite course — not directly tied to a gap
            skill_addressed = course_skills[0] if course_skills else "general"
            gap_score = 0.0
            reason = (
                f"{course_title} is included as a prerequisite foundation. "
                f"It teaches {', '.join(course_skills[:3])} which are required "
                f"before advancing to later courses in the pathway."
            )
            confidence = 0.95

        step_num = course.get("position", len(trace) + 1)

        entry = {
            "step": step_num,
            "skill_addressed": skill_addressed,
            "gap_score": round(gap_score, 2),
            "course_selected": course_title,
            "reason": reason,
            "confidence": confidence,
        }

        trace.append(entry)
        print(f"[TRACE] Step {step_num}: {course_title} → {skill_addressed} "
              f"(gap={gap_score:.2f}, conf={confidence:.2f})")

    return trace
