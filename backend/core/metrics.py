"""
Metrics calculator module for SkillBridge AI.
Computes time-saved and readiness improvement metrics for onboarding pathways.
"""

import os

from dotenv import load_dotenv

load_dotenv()

STANDARD_ONBOARDING_HOURS = float(os.getenv("STANDARD_ONBOARDING_HOURS", "40"))


def calculate_metrics(pathway: list[dict], readiness_before: float) -> dict:
    """Calculate onboarding efficiency metrics for a personalized pathway.

    Computes total hours, time saved compared to standard onboarding,
    and readiness improvement percentages.

    Args:
        pathway: Ordered list of course dicts with duration_hours.
        readiness_before: Overall readiness score before the pathway (0.0-1.0).

    Returns:
        Dict with total_hours, standard_hours, time_saved_hours,
        time_saved_percent, readiness_improvement, and modules_count.
    """
    total_hours = sum(c.get("duration_hours", 0) for c in pathway)
    time_saved_hours = max(0.0, STANDARD_ONBOARDING_HOURS - total_hours)
    readiness_improvement = round((1.0 - readiness_before) * 100, 1)

    if STANDARD_ONBOARDING_HOURS > 0:
        time_saved_percent = round((time_saved_hours / STANDARD_ONBOARDING_HOURS) * 100, 1)
    else:
        time_saved_percent = 0.0

    metrics = {
        "total_hours": total_hours,
        "standard_hours": STANDARD_ONBOARDING_HOURS,
        "time_saved_hours": time_saved_hours,
        "time_saved_percent": time_saved_percent,
        "readiness_improvement": readiness_improvement,
        "modules_count": len(pathway),
    }

    print(f"[METRICS] {len(pathway)} modules, {total_hours}h total, "
          f"{time_saved_hours}h saved ({time_saved_percent}%), "
          f"readiness +{readiness_improvement}%")

    return metrics
