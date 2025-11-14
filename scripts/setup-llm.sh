#!/bin/bash

# Setup script for vLLM with TildeOpen-30b model
# This script sets up vLLM to serve the TildeOpen model

set -e

echo "🚀 vLLM Setup Script (TildeOpen-30b)"
echo "======================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check for GPU support
echo "Checking GPU availability..."
if ! command -v nvidia-smi &> /dev/null; then
    echo "⚠️  WARNING: nvidia-smi not found. GPU may not be available."
    echo "TildeOpen-30b requires a GPU for optimal performance."
    echo ""
    read -p "Do you want to continue anyway? (y/N): " continue_choice
    if [[ ! "$continue_choice" =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 1
    fi
else
    echo "✅ GPU detected:"
    nvidia-smi --query-gpu=name,memory.total --format=csv,noheader | head -1
fi

echo ""
echo "Starting vLLM container with TildeOpen-30b..."
echo "This will:"
echo "  1. Start the vLLM Docker container"
echo "  2. Download TildeOpen-30b model from HuggingFace (~60GB)"
echo "  3. Load the model into GPU memory"
echo ""
echo "⚠️  First-time setup may take 15-30 minutes depending on your internet speed."
echo ""

# Check if vLLM container is already running
if docker ps | grep -q openmap-vllm; then
    echo "✅ vLLM container is already running"
else
    echo "Starting Docker services..."
    docker-compose up -d vllm
fi

echo ""
echo "Waiting for vLLM to download and load the model..."
echo "(This may take a while on first run...)"
echo ""

MAX_RETRIES=90  # 15 minutes with 10s intervals
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
        echo ""
        echo "✅ vLLM service is ready!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    
    # Show progress every 6 iterations (1 minute)
    if [ $((RETRY_COUNT % 6)) -eq 0 ]; then
        echo "Still waiting... ($((RETRY_COUNT * 10))s elapsed)"
        echo "Check container logs: docker-compose logs -f vllm"
    fi
    
    sleep 10
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo ""
    echo "❌ vLLM service failed to start within expected time"
    echo ""
    echo "Please check the logs:"
    echo "  docker-compose logs vllm"
    echo ""
    echo "Common issues:"
    echo "  - Insufficient GPU memory (TildeOpen-30b needs ~60GB VRAM)"
    echo "  - Slow internet connection (model download takes time)"
    echo "  - GPU drivers not properly installed"
    exit 1
fi

# Update .env.local if it exists
if [ -f .env.local ]; then
    if grep -q "VLLM_BASE_URL=" .env.local; then
        echo "✅ .env.local already configured"
    else
        echo "" >> .env.local
        echo "# vLLM konfigūracija (TildeOpen-30b modelis)" >> .env.local
        echo "VLLM_BASE_URL=http://localhost:8000" >> .env.local
        echo "VLLM_MODEL=TildeAI/TildeOpen-30b" >> .env.local
        echo "✅ Added vLLM configuration to .env.local"
    fi
else
    cp .env.example .env.local
    echo "✅ Created .env.local from .env.example"
fi

echo ""
echo "🎉 Setup complete! vLLM is serving TildeOpen-30b."
echo ""
echo "To test the model, run:"
echo '  curl http://localhost:8000/v1/chat/completions \\'
echo '    -H "Content-Type: application/json" \\'
echo '    -d '"'"'{'
echo '      "model": "TildeAI/TildeOpen-30b",'
echo '      "messages": [{"role": "user", "content": "Kas yra Vilnius?"}],'
echo '      "max_tokens": 100'
echo '    }'"'"''
echo ""
echo "You can now use natural language search in the application!"
echo ""
