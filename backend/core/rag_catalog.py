"""
RAG course catalog module for SkillBridge AI.
Uses ChromaDB to embed and query the course catalog for skill-based retrieval.
"""

import json
import os
from pathlib import Path

from dotenv import load_dotenv
import chromadb

load_dotenv()

_CATALOG_PATH = Path(__file__).parent.parent / "data" / "course_catalog.json"
_CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")

_chroma_client: chromadb.ClientAPI | None = None
_collection: chromadb.Collection | None = None
_catalog: list[dict] = []
_catalog_by_id: dict[str, dict] = {}


def initialize() -> None:
    """Initialize the ChromaDB vector store with course catalog data.

    Loads course_catalog.json, creates embeddings for each course using
    title + description + skills_taught, and stores them in ChromaDB.
    Idempotent: skips if collection already has documents.
    """
    global _chroma_client, _collection, _catalog, _catalog_by_id

    # Load catalog
    with open(_CATALOG_PATH, "r", encoding="utf-8") as f:
        _catalog = json.load(f)

    _catalog_by_id = {c["id"]: c for c in _catalog}
    print(f"[RAG] Loaded {len(_catalog)} courses from catalog")

    # Initialize ChromaDB
    _chroma_client = chromadb.PersistentClient(path=_CHROMA_PERSIST_DIR)
    _collection = _chroma_client.get_or_create_collection(
        name="courses",
        metadata={"hnsw:space": "cosine"},
    )

    # Check if already populated (idempotent)
    if _collection.count() >= len(_catalog):
        print(f"[RAG] ChromaDB collection already has {_collection.count()} documents, skipping indexing")
        return

    # Build documents for embedding
    documents = []
    ids = []
    metadatas = []

    for course in _catalog:
        doc_text = (
            f"{course['title']}. {course['description']}. "
            f"Skills: {', '.join(course['skills_taught'])}. "
            f"Domain: {course['domain']}. Level: {course['level']}."
        )
        documents.append(doc_text)
        ids.append(course["id"])

        # ChromaDB metadata must be flat (str, int, float, bool)
        metadatas.append({
            "title": course["title"],
            "domain": course["domain"],
            "level": course["level"],
            "duration_hours": course["duration_hours"],
            "job_categories": ",".join(course["job_categories"]),
            "skills_taught": ",".join(course["skills_taught"]),
            "prerequisite_ids": ",".join(course["prerequisite_ids"]),
            "assessment_type": course["assessment_type"],
        })

    _collection.add(documents=documents, ids=ids, metadatas=metadatas)
    print(f"[RAG] Indexed {len(documents)} courses into ChromaDB")


def query_courses(skill_name: str, job_category: str, top_k: int = 5) -> list[dict]:
    """Query the course catalog for courses matching a skill.

    Args:
        skill_name: The skill to search for.
        job_category: Job category filter ('technical' or 'operational').
        top_k: Maximum number of results to return.

    Returns:
        List of matching course dicts from the catalog.
    """
    if _collection is None:
        raise RuntimeError("RAG catalog not initialized. Call initialize() first.")

    # Query ChromaDB
    results = _collection.query(
        query_texts=[skill_name],
        n_results=min(top_k * 2, 20),  # Over-fetch to allow filtering
    )

    matched_courses = []
    if results and results["ids"] and results["ids"][0]:
        for course_id in results["ids"][0]:
            course = _catalog_by_id.get(course_id)
            if course and job_category in course.get("job_categories", []):
                matched_courses.append(course)
            elif course and not course.get("job_categories"):
                matched_courses.append(course)

    # If no category-specific results, fall back to all matches
    if not matched_courses and results and results["ids"] and results["ids"][0]:
        for course_id in results["ids"][0]:
            course = _catalog_by_id.get(course_id)
            if course:
                matched_courses.append(course)

    return matched_courses[:top_k]


def get_course_by_id(course_id: str) -> dict | None:
    """Retrieve a specific course by its ID.

    Args:
        course_id: The course identifier (e.g., 'PY-001').

    Returns:
        Course dict if found, None otherwise.
    """
    return _catalog_by_id.get(course_id)


def get_all_courses() -> list[dict]:
    """Return the full course catalog.

    Returns:
        List of all course dicts.
    """
    return _catalog.copy()
