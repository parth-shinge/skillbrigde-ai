"""
Graph engine module for SkillBridge AI.
Uses NetworkX to build prerequisite-aware, topologically sorted learning pathways.
"""

import networkx as nx


def build_pathway_graph(candidate_courses: list[dict], all_courses: list[dict]) -> list[dict]:
    """Build a prerequisite-aware learning pathway using a directed graph.

    Creates a DAG of courses where edges represent prerequisite relationships,
    recursively resolves all prerequisites, and returns a topologically sorted
    pathway with position numbers.

    Args:
        candidate_courses: Courses selected to address skill gaps.
        all_courses: Full course catalog for prerequisite resolution.

    Returns:
        Ordered list of course dicts with 'position' and 'priority' fields added.
    """
    catalog_by_id = {c["id"]: c for c in all_courses}
    candidate_ids = {c["id"] for c in candidate_courses}

    # Track which courses are in the pathway and why
    pathway_courses: dict[str, str] = {}  # course_id -> priority reason
    for c in candidate_courses:
        pathway_courses[c["id"]] = c.get("_priority", "recommended")

    # Recursively resolve prerequisites
    to_resolve = list(candidate_ids)
    resolved = set()

    while to_resolve:
        course_id = to_resolve.pop()
        if course_id in resolved:
            continue
        resolved.add(course_id)

        course = catalog_by_id.get(course_id)
        if not course:
            continue

        for prereq_id in course.get("prerequisite_ids", []):
            if prereq_id in catalog_by_id and prereq_id not in pathway_courses:
                pathway_courses[prereq_id] = "prerequisite"
                to_resolve.append(prereq_id)

    # Build directed graph
    graph = nx.DiGraph()

    for course_id in pathway_courses:
        course = catalog_by_id.get(course_id)
        if course:
            graph.add_node(course_id, **course, _priority=pathway_courses[course_id])

    # Add prerequisite edges (prereq → course)
    for course_id in pathway_courses:
        course = catalog_by_id.get(course_id)
        if not course:
            continue
        for prereq_id in course.get("prerequisite_ids", []):
            if prereq_id in pathway_courses:
                graph.add_edge(prereq_id, course_id)

    # Handle cycles gracefully
    ordered_ids = _topological_sort_safe(graph)

    # Build ordered pathway with positions
    pathway = []
    for position, course_id in enumerate(ordered_ids, start=1):
        course = catalog_by_id.get(course_id)
        if not course:
            continue
        course_entry = {**course}
        course_entry["position"] = position
        course_entry["priority"] = pathway_courses.get(course_id, "recommended")
        pathway.append(course_entry)

    print(f"[GRAPH] Built pathway with {len(pathway)} courses "
          f"({len(candidate_ids)} selected + {len(pathway) - len(candidate_ids)} prerequisites)")

    return pathway


def _topological_sort_safe(graph: nx.DiGraph) -> list[str]:
    """Perform topological sort, breaking cycles if necessary.

    Args:
        graph: NetworkX directed graph of course relationships.

    Returns:
        List of course IDs in topological order.
    """
    if not graph.nodes():
        return []

    # Check for cycles
    try:
        cycles = list(nx.simple_cycles(graph))
    except Exception:
        cycles = []

    # Break cycles by removing lowest-priority edges
    for cycle in cycles:
        if len(cycle) < 2:
            continue
        # Find the edge connecting the two lowest-priority nodes
        worst_edge = None
        worst_score = float("inf")

        for i in range(len(cycle)):
            src = cycle[i]
            dst = cycle[(i + 1) % len(cycle)]
            if graph.has_edge(src, dst):
                node_data = graph.nodes[dst]
                # Prerequisites have lowest removal priority (keep them)
                priority = node_data.get("_priority", "recommended")
                priority_scores = {"prerequisite": 3, "critical": 2, "recommended": 1, "optional": 0}
                score = priority_scores.get(priority, 1)
                if score < worst_score:
                    worst_score = score
                    worst_edge = (src, dst)

        if worst_edge and graph.has_edge(*worst_edge):
            graph.remove_edge(*worst_edge)
            print(f"[GRAPH] Broke cycle by removing edge {worst_edge[0]} → {worst_edge[1]}")

    # Topological sort
    try:
        return list(nx.topological_sort(graph))
    except nx.NetworkXUnfeasible:
        # Fallback: return nodes in order of in-degree (least dependencies first)
        print("[GRAPH] Warning: topological sort failed, using in-degree ordering")
        return sorted(graph.nodes(), key=lambda n: graph.in_degree(n))
