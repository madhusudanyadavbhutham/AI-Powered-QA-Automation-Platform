from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models

from app.api.applications import router as applications_router
from app.api.discovery import router as discovery_router
from app.api.projects import router as projects_router
from app.api.test_cases import router as test_cases_router
from app.api.test_steps import router as test_steps_router
from app.api.test_runs import router as test_runs_router
from app.api.ai_test_generation import router as ai_test_generation_router

from app.schemas import HealthResponse, RootResponse


# =========================================================
# DATABASE
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="AI QA Automation Platform",
    version="0.2.0",
    description="AI-powered QA test management and browser automation platform",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# API ROUTES
# =========================================================

app.include_router(projects_router)
app.include_router(applications_router)
app.include_router(discovery_router)
app.include_router(test_cases_router)
app.include_router(test_steps_router)
app.include_router(test_runs_router)
app.include_router(ai_test_generation_router)


# =========================================================
# ROOT
# =========================================================

@app.get("/", response_model=RootResponse)
def root():
    return {
        "message": "AI QA Automation Platform API",
        "status": "running",
        "version": "0.2.0",
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health", response_model=HealthResponse)
def health():
    return {
        "status": "healthy",
    }