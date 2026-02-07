#!/bin/bash
# Deployment script for Hamster System
# Supports multiple deployment targets

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="hamster-system"
CONTAINER_NAME="hamster-api"
PORT=${PORT:-8000}

show_help() {
    echo "Hamster System Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [TARGET] [OPTIONS]"
    echo ""
    echo "Targets:"
    echo "  local       Run locally with Python"
    echo "  docker      Build and run Docker container"
    echo "  hf          Deploy to Hugging Face Spaces"
    echo "  runpod      Deploy to RunPod"
    echo ""
    echo "Options:"
    echo "  --port PORT     Set port (default: 8000)"
    echo "  --gpu           Use GPU (for docker)"
    echo "  --detach        Run in background"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh local"
    echo "  ./deploy.sh docker --gpu --detach"
    echo "  ./deploy.sh hf"
}

deploy_local() {
    echo -e "${GREEN}🚀 Deploying locally...${NC}"
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}⚠ Virtual environment not found. Running setup...${NC}"
        ./scripts/setup.sh
    fi
    
    # Activate and run
    source venv/bin/activate
    
    echo -e "${GREEN}✓ Starting API server on port $PORT${NC}"
    echo -e "${GREEN}📚 API docs: http://localhost:$PORT/docs${NC}"
    echo ""
    
    export PORT=$PORT
    python src/api/app.py
}

deploy_docker() {
    echo -e "${GREEN}🐳 Building Docker image...${NC}"
    
    # Build image
    docker build -t $IMAGE_NAME .
    
    echo -e "${GREEN}✓ Image built: $IMAGE_NAME${NC}"
    
    # Stop existing container if running
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        echo -e "${YELLOW}⚠ Stopping existing container...${NC}"
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
    fi
    
    # Run container
    echo -e "${GREEN}🚀 Starting container on port $PORT...${NC}"
    
    DOCKER_ARGS="-p $PORT:8000 --name $CONTAINER_NAME"
    
    # Add GPU support if requested
    if [ "$USE_GPU" = true ]; then
        DOCKER_ARGS="$DOCKER_ARGS --gpus all"
        echo -e "${GREEN}✓ GPU support enabled${NC}"
    fi
    
    # Add detach if requested
    if [ "$DETACH" = true ]; then
        DOCKER_ARGS="$DOCKER_ARGS -d"
        echo -e "${GREEN}✓ Running in detached mode${NC}"
    fi
    
    # Mount adapters volume
    DOCKER_ARGS="$DOCKER_ARGS -v $(pwd)/adapters:/app/adapters"
    
    docker run $DOCKER_ARGS $IMAGE_NAME
    
    echo ""
    echo -e "${GREEN}✓ Container started!${NC}"
    echo -e "${GREEN}📚 API docs: http://localhost:$PORT/docs${NC}"
    
    if [ "$DETACH" = true ]; then
        echo ""
        echo "To view logs: docker logs -f $CONTAINER_NAME"
        echo "To stop: docker stop $CONTAINER_NAME"
    fi
}

deploy_hf() {
    echo -e "${GREEN}🤗 Deploying to Hugging Face Spaces...${NC}"
    
    # Check if huggingface-cli is installed
    if ! command -v huggingface-cli &> /dev/null; then
        echo -e "${YELLOW}⚠ huggingface-cli not found. Installing...${NC}"
        pip install huggingface-hub
    fi
    
    # Check login status
    if ! huggingface-cli whoami &> /dev/null; then
        echo -e "${RED}❌ Not logged in to Hugging Face${NC}"
        echo "Run: huggingface-cli login"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Logged in as: $(huggingface-cli whoami)${NC}"
    
    # Prompt for space name
    read -p "Enter Space name (e.g., username/hamster-system): " SPACE_NAME
    
    # Create space if it doesn't exist
    echo -e "${GREEN}📦 Creating/updating Space...${NC}"
    
    # Prepare files for upload
    mkdir -p hf_deploy
    cp -r src configs adapters Dockerfile requirements.txt README.md hf_deploy/
    
    # Create app.py for HF Spaces
    cat > hf_deploy/app.py << 'EOF'
import sys
sys.path.append('src')
from api.app import app

# For Hugging Face Spaces
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
EOF
    
    echo -e "${GREEN}✓ Files prepared in hf_deploy/${NC}"
    echo ""
    echo -e "${YELLOW}⚠ Manual upload required:${NC}"
    echo "  1. Go to https://huggingface.co/spaces"
    echo "  2. Create a new Space (Docker type)"
    echo "  3. Upload files from hf_deploy/"
    echo "  4. Or use: huggingface-cli upload $SPACE_NAME hf_deploy/ ."
}

deploy_runpod() {
    echo -e "${GREEN}☁️ Deploying to RunPod...${NC}"
    
    echo -e "${YELLOW}⚠ This requires manual setup:${NC}"
    echo ""
    echo "Steps:"
    echo "  1. Go to https://runpod.io"
    echo "  2. Create a new Pod with PyTorch template"
    echo "  3. Upload your code and adapters"
    echo "  4. Run: pip install -r requirements.txt"
    echo "  5. Run: python src/api/app.py"
    echo ""
    echo "Recommended GPU: RTX 3090 or A5000"
    echo "Estimated cost: $0.20-0.50/hour (spot)"
}

# Parse arguments
TARGET=${1:-local}
USE_GPU=false
DETACH=false

shift || true
while [[ $# -gt 0 ]]; do
    case $1 in
        --port)
            PORT="$2"
            shift 2
            ;;
        --gpu)
            USE_GPU=true
            shift
            ;;
        --detach)
            DETACH=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Execute deployment
case $TARGET in
    local)
        deploy_local
        ;;
    docker)
        deploy_docker
        ;;
    hf|huggingface)
        deploy_hf
        ;;
    runpod)
        deploy_runpod
        ;;
    --help)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown target: $TARGET${NC}"
        show_help
        exit 1
        ;;
esac
