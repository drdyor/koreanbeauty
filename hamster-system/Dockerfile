# Hamster System API - Docker Configuration
# Supports both CPU and GPU deployments

# ============================================================================
# Base Image Selection
# ============================================================================

# For GPU deployment (recommended for production)
# FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04

# For CPU-only deployment (cheaper, slower)
FROM python:3.10-slim

# ============================================================================
# System Dependencies
# ============================================================================

RUN apt-get update && apt-get install -y \
    git \
    wget \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# ============================================================================
# Working Directory
# ============================================================================

WORKDIR /app

# ============================================================================
# Python Dependencies
# ============================================================================

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ============================================================================
# Application Code
# ============================================================================

# Copy configuration
COPY configs/ ./configs/

# Copy source code
COPY src/ ./src/

# Copy adapters (if pre-trained)
# Note: Adapters can also be mounted as volumes
COPY adapters/ ./adapters/ 2>/dev/null || echo "No adapters included in build"

# ============================================================================
# Environment Variables
# ============================================================================

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV HF_HOME=/app/.cache/huggingface
ENV TRANSFORMERS_CACHE=/app/.cache/huggingface

# API Configuration
ENV HOST=0.0.0.0
ENV PORT=8000

# ============================================================================
# Health Check
# ============================================================================

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# ============================================================================
# Expose Port
# ============================================================================

EXPOSE 8000

# ============================================================================
# Run Command
# ============================================================================

CMD ["python", "src/api/app.py"]
