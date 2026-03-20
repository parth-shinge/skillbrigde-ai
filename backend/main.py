"""
SkillBridge AI — FastAPI Application Entry Point.
Configures middleware, routers, startup events, and the health endpoint.
"""

import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from api.routes import parse, analyze, pathway
from core import rag_catalog


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown events."""
    # Startup: initialize the RAG catalog
    print("[STARTUP] Initializing SkillBridge AI...")
    rag_catalog.initialize()
    print("[STARTUP] SkillBridge AI ready")
    yield
    # Shutdown
    print("[SHUTDOWN] SkillBridge AI shutting down")


app = FastAPI(
    title="SkillBridge AI API",
    version="1.0.0",
    description="AI-driven adaptive onboarding engine",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log every incoming request with method, path, and duration."""
    start = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start) * 1000, 1)
    print(f"[REQUEST] {request.method} {request.url.path} — {duration_ms}ms")
    return response


# Include API routers
app.include_router(parse.router, prefix="/api", tags=["Parse"])
app.include_router(analyze.router, prefix="/api", tags=["Analyze"])
app.include_router(pathway.router, prefix="/api", tags=["Pathway"])


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint returning API status and version."""
    return {"status": "ok", "version": "1.0.0"}
