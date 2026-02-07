#!/usr/bin/env python3
"""
FastAPI Deployment Endpoint (Phase 4)
Simple, high-performance API for the Hamster System.

Usage:
    # Development
    uvicorn app:app --reload --host 0.0.0.0 --port 8000
    
    # Production
    uvicorn app:app --host 0.0.0.0 --port 8000 --workers 1

Endpoints:
    POST /solve_problem - Main endpoint for getting hamster takes
    GET /health - Health check
    GET /hamsters - List available hamsters
    POST /classify - Classify a problem without generating
"""

import os
import sys
import json
from typing import List, Optional, Dict
from datetime import datetime

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# Import inference components
try:
    from inference.engine import HamsterInferenceEngine
    from inference.classifier import HamsterClassifier
    from inference.post_processor import OutputFilter
    INFERENCE_AVAILABLE = True
except ImportError as e:
    print(f"⚠ Inference components not available: {e}")
    INFERENCE_AVAILABLE = False


# ============================================================================
# Pydantic Models
# ============================================================================

class SolveProblemRequest(BaseModel):
    """Request model for /solve_problem endpoint."""
    problem: str = Field(
        ...,
        min_length=5,
        max_length=1000,
        description="The user's problem or question"
    )
    hamsters: Optional[List[str]] = Field(
        None,
        description="Specific hamsters to use (auto-classify if not provided)"
    )
    max_tokens: int = Field(
        55,
        ge=20,
        le=100,
        description="Maximum tokens to generate"
    )
    apply_filter: bool = Field(
        True,
        description="Whether to apply post-processing filter"
    )


class SolveProblemResponse(BaseModel):
    """Response model for /solve_problem endpoint."""
    problem: str
    classified_hamsters: List[str]
    takes: Dict[str, str]
    processing_time_ms: float
    timestamp: str


class ClassificationRequest(BaseModel):
    """Request model for /classify endpoint."""
    problem: str = Field(
        ...,
        min_length=5,
        max_length=1000,
        description="The user's problem or question"
    )


class ClassificationResponse(BaseModel):
    """Response model for /classify endpoint."""
    problem: str
    selected_hamsters: List[str]
    scores: Dict[str, float]
    explanations: Dict


class HamsterInfo(BaseModel):
    """Information about a hamster."""
    name: str
    framework: str
    focus: str
    domain: str


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    inference_available: bool
    loaded_hamsters: List[str]
    version: str


# ============================================================================
# FastAPI App
# ============================================================================

app = FastAPI(
    title="Hamster System API",
    description="Psychology-driven problem-solving system with 6 specialized perspectives",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global inference engine (initialized on first request)
engine = None
classifier = None
filter_obj = None


def get_engine():
    """Get or initialize the inference engine."""
    global engine
    if engine is None and INFERENCE_AVAILABLE:
        print("🚀 Initializing inference engine...")
        engine = HamsterInferenceEngine()
    return engine


def get_classifier():
    """Get or initialize the classifier."""
    global classifier
    if classifier is None and INFERENCE_AVAILABLE:
        classifier = HamsterClassifier()
    return classifier


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/", response_model=Dict)
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Hamster System API",
        "version": "1.0.0",
        "description": "Psychology-driven problem-solving with 6 specialized perspectives",
        "endpoints": {
            "solve_problem": "POST /solve_problem - Get hamster takes on a problem",
            "classify": "POST /classify - Classify a problem without generating",
            "hamsters": "GET /hamsters - List available hamsters",
            "health": "GET /health - Health check",
            "docs": "GET /docs - API documentation"
        }
    }


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    loaded_hamsters = []
    if engine is not None:
        loaded_hamsters = list(engine.adapter_paths.keys())
    
    return HealthResponse(
        status="healthy",
        inference_available=INFERENCE_AVAILABLE,
        loaded_hamsters=loaded_hamsters,
        version="1.0.0"
    )


@app.get("/hamsters", response_model=List[HamsterInfo])
async def list_hamsters():
    """List all available hamsters with their information."""
    try:
        with open("configs/hamster_frameworks.json", 'r') as f:
            config = json.load(f)
        
        hamsters = []
        for key, hamster in config["hamsters"].items():
            hamsters.append(HamsterInfo(
                name=hamster["name"],
                framework=hamster["framework"],
                focus=hamster["focus"],
                domain=hamster["domain"]
            ))
        
        return hamsters
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading hamster config: {str(e)}")


@app.post("/classify", response_model=ClassificationResponse)
async def classify_problem(request: ClassificationRequest):
    """
    Classify a problem without generating responses.
    
    Returns the selected hamsters and match scores.
    """
    if not INFERENCE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Inference components not available")
    
    try:
        clf = get_classifier()
        
        selected = clf.classify(request.problem)
        scores = clf.classify_with_scores(request.problem)
        explanation = clf.get_explanation(request.problem)
        
        return ClassificationResponse(
            problem=request.problem,
            selected_hamsters=selected,
            scores=scores,
            explanations=explanation["explanations"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification error: {str(e)}")


@app.post("/solve_problem", response_model=SolveProblemResponse)
async def solve_problem(request: SolveProblemRequest):
    """
    Main endpoint for getting hamster takes on a problem.
    
    This endpoint:
    1. Classifies the problem (if hamsters not specified)
    2. Loads appropriate LoRA adapters
    3. Generates constrained responses
    4. Applies post-processing filters
    5. Returns all takes
    """
    if not INFERENCE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Inference components not available")
    
    import time
    start_time = time.time()
    
    try:
        eng = get_engine()
        
        # Generate takes
        results = eng.get_hamster_takes(
            user_input=request.problem,
            selected_hamsters=request.hamsters,
            max_new_tokens=request.max_tokens,
            apply_filter=request.apply_filter
        )
        
        # Get classified hamsters (either from request or auto-classified)
        classified_hamsters = request.hamsters or eng.classifier.classify(request.problem)
        
        processing_time = (time.time() - start_time) * 1000  # Convert to ms
        
        return SolveProblemResponse(
            problem=request.problem,
            classified_hamsters=classified_hamsters,
            takes=results,
            processing_time_ms=round(processing_time, 2),
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


@app.post("/solve_problem/single")
async def solve_problem_single(
    problem: str,
    hamster: Optional[str] = None,
    max_tokens: int = 55
):
    """
    Simplified endpoint for getting a single hamster's take.
    
    Args:
        problem: The user's problem
        hamster: Specific hamster to use (auto-classify if not provided)
        max_tokens: Maximum tokens to generate
    
    Returns:
        Single response string
    """
    if not INFERENCE_AVAILABLE:
        raise HTTPException(status_code=503, detail="Inference components not available")
    
    try:
        eng = get_engine()
        
        take = eng.get_single_take(
            user_input=problem,
            hamster_name=hamster,
            max_new_tokens=max_tokens
        )
        
        return {
            "problem": problem,
            "hamster": hamster or eng.classifier.classify(problem)[0],
            "take": take
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


# ============================================================================
# Startup Event
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize components on startup."""
    print("\n" + "=" * 70)
    print("🐹 HAMSTER SYSTEM API STARTING")
    print("=" * 70)
    
    if INFERENCE_AVAILABLE:
        print("✓ Inference components available")
        # Optionally pre-load the engine
        # get_engine()
    else:
        print("⚠ Inference components not available (running in mock mode)")
    
    print(f"📚 API Documentation: http://localhost:8000/docs")
    print("=" * 70 + "\n")


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "false").lower() == "true"
    
    # Run server
    uvicorn.run(
        "app:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )
