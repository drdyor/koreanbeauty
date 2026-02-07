# Guardian Voice Training - RunPod Serverless
# Trains user voice models using Applio/RVC

FROM nvidia/cuda:12.1.0-cudnn8-runtime-ubuntu22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV CUDA_HOME=/usr/local/cuda

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3-pip \
    ffmpeg \
    libsndfile1 \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip3 install --upgrade pip

# Install PyTorch with CUDA support
RUN pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Install audio processing libraries
RUN pip3 install \
    librosa==0.10.1 \
    soundfile==0.12.1 \
    scipy==1.11.4 \
    numpy==1.24.3 \
    resampy==0.4.2

# Install RVC dependencies
RUN pip3 install \
    faiss-gpu==1.7.2 \
    praat-parselmouth==0.4.3 \
    pyworld==0.3.4 \
    audioread==3.0.1

# Install FastAPI for API server
RUN pip3 install \
    fastapi==0.104.1 \
    uvicorn[standard]==0.24.0 \
    python-multipart==0.0.6

# Install RunPod SDK
RUN pip3 install runpod

# Create working directory
WORKDIR /app

# Copy training scripts
COPY train.py /app/train.py
COPY rvc_trainer.py /app/rvc_trainer.py
COPY requirements.txt /app/requirements.txt

# Install any additional requirements
RUN pip3 install -r requirements.txt

# Expose port (for local testing)
EXPOSE 8000

# Set entrypoint
CMD ["python3", "train.py"]
