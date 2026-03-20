# SkillBridge AI ⚡

[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> *"From Day One to Done Right — Personalized Onboarding, Powered by AI"*

---

## 🎯 The Problem

Corporate onboarding is broken. Most organizations rely on static, one-size-fits-all training curricula that push every new hire through the same sequence of modules — regardless of their experience level, existing skills, or target role. The result? Experienced hires waste days sitting through material they already know, while junior employees are overwhelmed by advanced concepts they have no foundation for.

The cost is staggering — companies spend an average of 40+ hours per employee on generic onboarding, yet studies show that up to 30% of that time is wasted on redundant content. This isn't just an inconvenience; it translates to lost productivity, slower time-to-competency, higher early-stage attrition, and frustrated employees who feel their time isn't valued from day one.

## 💡 Our Solution

**SkillBridge AI** is an AI-driven adaptive learning engine that transforms onboarding from a static checklist into a personalized, skill-gap-aware learning pathway. By analyzing a new hire's resume against a target job description, SkillBridge identifies exactly what each employee needs to learn — and builds a prerequisite-ordered, time-optimized training plan grounded in a curated course catalog.

- 🔍 **Resume & JD Parsing** — Extracts and normalizes skills with proficiency levels via Claude LLM
- 📊 **Embedding-Based Skill Gap Analysis** — Computes precise gap scores using semantic similarity
- 🗺️ **Adaptive Pathway Generation** — Builds prerequisite-aware learning paths using graph algorithms
- 🧠 **Full Reasoning Trace** — Explains every recommendation with step-by-step transparency
- 📈 **Time-Saved Metrics** — Quantifies efficiency gains vs. standard onboarding
- 🔒 **Zero Hallucinations** — All recommendations grounded in a local course catalog via RAG

## ✨ Key Features

- ⚡ **AI-Powered Skill Extraction** — Claude 3 parses resumes and job descriptions into structured skill profiles with proficiency levels
- 🔬 **Semantic Gap Detection** — MiniLM-L6-v2 embeddings + cosine similarity produce precise gap scores per skill
- 🗺️ **AdaptPath™ Algorithm** — Graph-based, topologically sorted learning pathways with prerequisite validation
- 🧠 **Reasoning Trace Viewer** — Step-by-step AI decision log showing why each course was selected, with confidence scores
- 📝 **Diagnostic Quiz Mode** — Assess skills interactively without uploading a resume
- 🌐 **Cross-Domain Support** — Handles both Technical (Python, ML, Cloud) and Operational (Logistics, Safety, Leadership) roles
- ⏱️ **Time-Saved Dashboard** — Visual metrics comparing personalized vs. standard onboarding hours
- 🎭 **Demo Mode** — Pre-loaded personas (Junior Dev, Senior Analyst, Operations Manager) for instant evaluation
- 📄 **PDF Export** — Download the complete personalized learning plan as a formatted PDF
- 📊 **Interactive Node Graph** — React Flow-powered DAG visualization of course dependencies and pathway flow
- 🎨 **Dark-Theme UI** — Premium glassmorphism design with smooth Framer Motion animations

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 18 + Vite)               │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐  │
│  │  Upload   │ │ Gap View │ │  Pathway  │ │  Metrics Dash    │  │
│  │  Widget   │ │  Table   │ │ DAG Graph │ │  (Recharts)      │  │
│  └─────┬─────┘ └─────┬────┘ └─────┬─────┘ └────────┬─────────┘  │
│        └──────────────┼───────────┼─────────────────┘            │
│                       │    Axios HTTP                            │
├───────────────────────┼─────────────────────────────────────────┤
│                 BACKEND (FastAPI + Uvicorn)                      │
│  ┌────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐  │
│  │  /api/parse │ │ /api/analyze│ │ /api/pathway│ │  /health  │  │
│  └─────┬──────┘ └──────┬──────┘ └──────┬──────┘ └───────────┘  │
│        │               │               │                        │
│  ┌─────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐                │
│  │  Parser    │ │  Analyzer   │ │  Pathway    │                │
│  │ (Claude +  │ │ (MiniLM +   │ │ (NetworkX + │                │
│  │  PyMuPDF)  │ │  Sklearn)   │ │  ChromaDB)  │                │
│  └────────────┘ └─────────────┘ └─────────────┘                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              ChromaDB Vector Store                       │   │
│  │         (course_catalog.json → 40 modules)               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Frontend Layer** — React 18 SPA with React Flow (DAG visualization), Recharts (metrics), and Framer Motion (animations). Communicates via Axios HTTP to the backend.

**API Layer** — FastAPI with three core endpoints (`/api/parse`, `/api/analyze`, `/api/pathway`) plus health check. Pydantic models enforce request/response validation.

**Core Engine** — Parser (Claude LLM + PyMuPDF), Analyzer (sentence-transformers + scikit-learn), and Pathway Builder (NetworkX graph + ChromaDB RAG retrieval).

**Data Layer** — ChromaDB vector store indexes 40 course modules with embeddings for semantic retrieval. The catalog spans 8 domains from Python Programming to Safety & Compliance.

## 🔄 User Journey

1. **Land on Dashboard** → User arrives at the SkillBridge home page (or selects a Demo Mode persona)
2. **Upload Documents** → Drag-and-drop a PDF resume + paste the target job description
3. **AI Parsing** → Claude extracts structured skill profiles with proficiency levels from both documents
4. **Gap Analysis** → System computes semantic similarity between resume skills and JD requirements, producing gap scores and priority classifications
5. **Pathway Generation** → AdaptPath™ algorithm builds a prerequisite-ordered, topologically-sorted course sequence from the catalog
6. **Review Results** → Interactive dashboard shows skill gap table, DAG-based pathway graph, reasoning trace, and time-saved metrics
7. **Export & Go** → Download the personalized learning plan as a PDF and begin onboarding

## 🛠️ Tech Stack

### Backend

| Technology | Purpose | Version |
|---|---|---|
| Python | Core runtime | 3.11+ |
| FastAPI | REST API framework | 0.111.0 |
| Anthropic SDK | Claude LLM integration | 0.26.0 |
| sentence-transformers | Embedding generation (MiniLM-L6-v2) | 2.7.0 |
| ChromaDB | Vector store for course catalog | 0.5.0 |
| NetworkX | Graph algorithms (DAG, topological sort) | 3.3 |
| PyMuPDF | PDF text extraction | 1.24.3 |
| scikit-learn | Cosine similarity computation | 1.4.2 |
| Pydantic | Data validation & schemas | 2.7.0 |
| Uvicorn | ASGI server | 0.29.0 |

### Frontend

| Technology | Purpose | Version |
|---|---|---|
| React | UI framework | 18.3 |
| Vite | Build tool & dev server | Latest |
| React Flow | Interactive DAG pathway graph | 12.10 |
| Recharts | Metrics dashboard charts | 2.15 |
| Framer Motion | Animations & transitions | 11.18 |
| Axios | HTTP client | 1.13 |
| Tailwind CSS | Utility-first styling | 3.4 |
| Lucide React | Icon library | 0.383 |

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** — [Download](https://python.org/downloads)
- **Node.js 18+** — [Download](https://nodejs.org)
- **Docker & Docker Compose** *(optional)* — [Download](https://docker.com)
- **Anthropic API Key** — [Get one here](https://console.anthropic.com)

### Option A: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/skillbridge-ai.git
cd skillbridge-ai

# Create backend environment file
cp .env.example backend/.env
# Edit backend/.env and set your ANTHROPIC_API_KEY

# Build and run all services
docker-compose up --build
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:8000`.

### Option B: Manual Setup

**Backend:**

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt

# Create .env file
cp ../.env.example .env
# Edit .env and set your ANTHROPIC_API_KEY

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `ANTHROPIC_API_KEY` | API key for Claude LLM access | `sk-ant-api03-...` |
| `CHROMA_PERSIST_DIR` | ChromaDB persistence directory | `./chroma_db` |
| `STANDARD_ONBOARDING_HOURS` | Baseline hours for time-saved calculation | `40` |

## 📡 API Reference

### `GET /health`

Health check endpoint.

**Response:** `200 OK`

```json
{ "status": "ok", "version": "1.0.0" }
```

---

### `POST /api/parse`

Parse a resume PDF and job description to extract structured skill profiles.

**Request:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `resume_file` | File (PDF) | Candidate's resume |
| `job_description` | string | Target job description text |

<details>
<summary><strong>Response Example</strong></summary>

```json
{
  "resume_skills": [
    { "name": "python", "proficiency": "advanced", "years": 5 },
    { "name": "sql", "proficiency": "intermediate", "years": 3 },
    { "name": "machine-learning", "proficiency": "beginner", "years": 1 }
  ],
  "jd_skills": [
    { "name": "python", "proficiency": "expert", "years": null },
    { "name": "deep-learning", "proficiency": "advanced", "years": null },
    { "name": "kubernetes", "proficiency": "intermediate", "years": null }
  ],
  "parse_time_ms": 1842
}
```

</details>

---

### `POST /api/analyze`

Compute skill gaps between resume and job description skill profiles.

**Request Body:**

```json
{
  "resume_skills": [{ "name": "python", "proficiency": "advanced", "years": 5 }],
  "jd_skills": [{ "name": "deep-learning", "proficiency": "advanced", "years": null }]
}
```

<details>
<summary><strong>Response Example</strong></summary>

```json
{
  "skill_gaps": [
    {
      "skill": "deep-learning",
      "required_level": "advanced",
      "current_level": null,
      "gap_score": 0.92,
      "priority": "critical"
    }
  ],
  "overall_readiness_score": 0.45,
  "matched_skills": ["python"],
  "missing_skills": ["deep-learning", "kubernetes"]
}
```

</details>

---

### `POST /api/pathway`

Generate a personalized, prerequisite-ordered learning pathway.

**Request Body:**

```json
{
  "skill_gaps": [
    { "skill": "deep-learning", "required_level": "advanced", "current_level": null, "gap_score": 0.92, "priority": "critical" }
  ],
  "role_title": "ML Engineer",
  "job_category": "technical"
}
```

<details>
<summary><strong>Response Example</strong></summary>

```json
{
  "pathway": [
    {
      "position": 1,
      "course_id": "ML-001",
      "title": "Introduction to Machine Learning",
      "domain": "Machine Learning",
      "duration_hours": 6,
      "level": "intermediate",
      "priority": "critical",
      "skills_taught": ["machine-learning", "data-analysis", "statistical-analysis"]
    }
  ],
  "reasoning_trace": [
    {
      "step": 1,
      "skill_addressed": "deep-learning",
      "gap_score": 0.92,
      "course_selected": "ML-001",
      "reason": "Foundation course required before deep learning modules; covers core ML concepts and scikit-learn workflow.",
      "confidence": 0.95
    }
  ],
  "metrics": {
    "total_hours": 22,
    "standard_hours": 40,
    "time_saved_hours": 18,
    "readiness_improvement": 0.47,
    "modules_count": 4
  }
}
```

</details>

## 🧠 Skill-Gap Analysis Logic

The analyzer uses a multi-stage pipeline to compute precise skill gaps:

1. **Skill Extraction** — Claude LLM parses raw text into structured `{name, proficiency, years}` objects, normalizing synonyms (e.g., "ML" → "machine-learning")
2. **Embedding Generation** — Each skill name is encoded into a 384-dimensional vector using `all-MiniLM-L6-v2`
3. **Cosine Similarity Matching** — Resume skills are matched to JD skills via pairwise cosine similarity; matches above threshold 0.7 are linked
4. **Proficiency Delta Scoring** — Gap score = `(required_level - current_level) / max_level`, using ordinal encoding: beginner=1, intermediate=2, advanced=3, expert=4
5. **Priority Classification** — Skills are classified based on gap score: **Critical** (≥ 0.7), **Recommended** (0.4–0.69), **Optional** (< 0.4)

```
Pseudocode:
for each jd_skill in jd_skills:
    best_match = max(cosine_sim(embed(jd_skill), embed(r)) for r in resume_skills)
    if best_match.score >= THRESHOLD:
        gap = proficiency_delta(jd_skill.level, best_match.skill.level)
    else:
        gap = 1.0  # completely missing skill
    priority = classify(gap)  # critical | recommended | optional
    skill_gaps.append({skill, gap, priority})
```

## 🗺️ AdaptPath™ Algorithm

The pathway builder constructs an optimized learning sequence using graph-based pathfinding:

1. **DAG Construction** — Each course in the catalog becomes a node; prerequisite relationships form directed edges
2. **RAG Retrieval** — ChromaDB semantic search retrieves the top-K courses matching each identified skill gap
3. **Subgraph Extraction** — Selected courses + all transitive prerequisites are extracted into a subgraph
4. **Topological Sort** — NetworkX `topological_sort()` orders courses so prerequisites always come first
5. **Cycle Detection** — `nx.is_directed_acyclic_graph()` validates the DAG; any cycles are resolved by edge removal

```
Course DAG Example:

  PY-001 ──► PY-002 ──► PY-003 ──► ML-001
                                      │
  DA-001 ──► DA-002 ────────────────►─┘
                                      │
                                  ML-002 ──► ML-003
```

In this example, a learner needing Deep Learning (ML-003) would receive the full chain: PY-001 → PY-002 → PY-003 → DA-001 → DA-002 → ML-001 → ML-002 → ML-003, ensuring no knowledge gaps.

## 🔍 Reasoning Trace

Every pathway recommendation includes a transparent reasoning trace — a step-by-step decision log explaining *why* each course was selected:

```json
{
  "step": 1,
  "skill_addressed": "deep-learning",
  "gap_score": 0.92,
  "course_selected": "ML-003: Deep Learning Fundamentals",
  "reason": "Directly addresses the critical deep-learning gap. Covers neural network architectures (feedforward, CNN, RNN) using PyTorch, matching the JD requirement for hands-on DL experience.",
  "confidence": 0.95
}
```

Each trace entry includes the **skill being addressed**, the **gap score** that triggered it, the **selected course** with rationale, and a **confidence score** (0–1) reflecting match quality. This enables full auditability of AI decisions.

## 🌐 Cross-Domain Scalability

SkillBridge supports both technical and operational roles through a unified course catalog spanning 8 domains. The `job_category` field routes recommendations to the appropriate course pool:

| Aspect | Technical Role | Operational Role |
|---|---|---|
| **Example Role** | ML Engineer | Operations Manager |
| **Skill Domains** | Python, ML, Cloud & DevOps, Data & SQL | Logistics, Safety & Compliance, Leadership |
| **Sample Courses** | Deep Learning Fundamentals, Kubernetes & Orchestration | Lean Operations, Regulatory Compliance |
| **Assessment Types** | Coding projects, Capstone projects | Case studies, Practical exams |
| **Catalog Coverage** | 17 technical modules | 23 operational/cross-functional modules |

## 📊 Datasets Used

| Dataset | Source | Usage | License |
|---|---|---|---|
| O*NET Database | [onetonline.org](https://www.onetonline.org/) | Occupational skill taxonomies & proficiency benchmarks | Public Domain |
| Kaggle Resume Dataset | [kaggle.com/datasets](https://www.kaggle.com/datasets/gauravduttakiit/resume-dataset) | Resume parsing model validation | CC0 |
| Kaggle Job Descriptions | [kaggle.com/datasets](https://www.kaggle.com/datasets/andrewmvd/data-scientist-jobs) | JD parsing model validation | CC0 |
| Custom Course Catalog | Internal (40 modules) | Core knowledge base indexed in ChromaDB | MIT |

## 📈 Evaluation Metrics

| Metric | Description | Target |
|---|---|---|
| **Path Coverage Score** | % of identified skill gaps addressed by the generated pathway | ≥ 95% |
| **Hallucination Rate** | % of recommended courses not found in the catalog | 0% |
| **Readiness Delta** | Improvement in readiness score after completing the pathway | ≥ 0.40 |
| **Time Efficiency %** | Hours saved vs. standard onboarding ÷ standard hours × 100 | ≥ 30% |
| **Prerequisite Validity** | % of pathway orderings that satisfy all prerequisite constraints | 100% |

## 🤝 Team

| Name | Role | Contribution |
|---|---|---|
| *Team Member 1* | Lead Developer | Backend architecture, pathway algorithm |
| *Team Member 2* | Frontend Developer | React UI, visualizations, PDF export |
| *Team Member 3* | ML Engineer | Skill extraction, gap analysis, embeddings |
| *Team Member 4* | Product & Docs | UX design, documentation, evaluation |

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for smarter onboarding
</p>
