"""
Skill extraction module for SkillBridge AI.
Uses Claude API to extract and normalize skills from resume/JD text.
"""

import json
import os
import re
from pathlib import Path

from dotenv import load_dotenv
import anthropic

load_dotenv()

_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Load O*NET skills taxonomy for normalization
_ONET_SKILLS_PATH = Path(__file__).parent.parent / "data" / "onet_skills.json"
_ALL_KNOWN_SKILLS: set[str] = set()


def _load_onet_skills() -> None:
    """Load the O*NET skills taxonomy into memory for normalization."""
    global _ALL_KNOWN_SKILLS
    if _ALL_KNOWN_SKILLS:
        return
    try:
        with open(_ONET_SKILLS_PATH, "r", encoding="utf-8") as f:
            taxonomy = json.load(f)
        for category_skills in taxonomy.values():
            _ALL_KNOWN_SKILLS.update(category_skills)
    except FileNotFoundError:
        print("[WARN] onet_skills.json not found, skipping normalization")


def _normalize_skill_name(name: str) -> str:
    """Normalize a skill name to match taxonomy format.

    Args:
        name: Raw skill name from extraction.

    Returns:
        Lowercase, hyphenated skill name.
    """
    normalized = name.lower().strip()
    # Replace spaces and underscores with hyphens
    normalized = re.sub(r"[\s_]+", "-", normalized)
    # Remove special characters except hyphens
    normalized = re.sub(r"[^a-z0-9\-]", "", normalized)
    # Collapse multiple hyphens
    normalized = re.sub(r"-{2,}", "-", normalized)
    return normalized.strip("-")


def _find_closest_taxonomy_match(skill_name: str) -> str:
    """Find the closest matching skill in the O*NET taxonomy.

    Args:
        skill_name: Normalized skill name to match.

    Returns:
        Best matching taxonomy skill, or original name if no close match.
    """
    if not _ALL_KNOWN_SKILLS:
        return skill_name
    # Exact match
    if skill_name in _ALL_KNOWN_SKILLS:
        return skill_name
    # Check if taxonomy skill is contained in the name or vice versa
    for known in _ALL_KNOWN_SKILLS:
        if known in skill_name or skill_name in known:
            return known
    return skill_name


SYSTEM_PROMPT = (
    "You are a precise skill extraction specialist. Extract ALL skills, technologies, "
    "tools, and competencies from the provided text. For each skill:\n"
    "- Normalize the name to lowercase (e.g., 'Python' → 'python', 'AWS Lambda' → 'aws-lambda')\n"
    "- Estimate proficiency: beginner/intermediate/advanced/expert\n"
    "- Estimate years of experience if mentioned, else null\n"
    "- Include both technical AND soft skills\n"
    'Return ONLY a JSON object with no markdown, no explanation: '
    '{"skills": [{"name": string, "proficiency": string, "years": number|null}]}'
)


async def extract_skills(text: str, source: str) -> list[dict]:
    """Extract skills from text using Claude API.

    Args:
        text: Resume or job description text content.
        source: Either "resume" or "jd" to indicate text type.

    Returns:
        List of skill dicts with name, proficiency, and years fields.

    Raises:
        RuntimeError: If Claude API call fails or response parsing fails.
    """
    _load_onet_skills()

    user_message = f"Extract skills from this {source}:\n\n{text[:8000]}"

    try:
        response = _client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
        )

        raw_text = response.content[0].text.strip()
        parsed = _parse_json_response(raw_text)
        skills = parsed.get("skills", [])

        # Normalize each skill against taxonomy
        normalized_skills = []
        for skill in skills:
            name = _normalize_skill_name(skill.get("name", ""))
            if not name:
                continue
            name = _find_closest_taxonomy_match(name)
            normalized_skills.append({
                "name": name,
                "proficiency": skill.get("proficiency", "beginner").lower(),
                "years": skill.get("years"),
            })

        print(f"[EXTRACT] Extracted {len(normalized_skills)} skills from {source}")
        return normalized_skills

    except anthropic.APIError as e:
        raise RuntimeError(f"Claude API error during skill extraction: {str(e)}")
    except Exception as e:
        raise RuntimeError(f"Skill extraction failed: {str(e)}")


def _parse_json_response(raw: str) -> dict:
    """Parse JSON from Claude's response, stripping markdown fences if present.

    Args:
        raw: Raw text response from Claude.

    Returns:
        Parsed JSON as a dict.

    Raises:
        ValueError: If JSON parsing fails after all attempts.
    """
    # Strip markdown code fences
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        # Remove opening fence (with optional language tag)
        cleaned = re.sub(r"^```[a-zA-Z]*\n?", "", cleaned)
        # Remove closing fence
        cleaned = re.sub(r"\n?```$", "", cleaned)
        cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Try to find JSON object in the response
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        raise ValueError(f"Failed to parse JSON from Claude response: {raw[:200]}")
