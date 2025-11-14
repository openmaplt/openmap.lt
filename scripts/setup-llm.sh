#!/bin/bash

# Setup script for Ollama LLM model
# This script pulls the TildeOpen model into the Ollama container

set -e

echo "🚀 Ollama LLM Setup Script"
echo "=============================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Ollama container is running
if ! docker ps | grep -q openmap-ollama; then
    echo "⚠️  Ollama container is not running."
    echo "Starting Docker services..."
    docker-compose up -d
    echo "Waiting for Ollama to be ready..."
    sleep 10
fi

# Check Ollama health
echo "Checking Ollama service..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker exec openmap-ollama ollama list > /dev/null 2>&1; then
        echo "✅ Ollama service is ready"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Waiting for Ollama to be ready... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Ollama service failed to start"
    exit 1
fi

echo ""
echo "Select the model to install:"
echo "1) tildeopen:latest (recommended for Lithuanian language)"
echo "2) llama3.2:latest (alternative, good multilingual support)"
echo "3) llama3.2:3b (smaller, faster, less accurate)"
echo ""
read -p "Enter your choice (1-3, default: 1): " choice
choice=${choice:-1}

case $choice in
    1)
        MODEL="tildeopen:latest"
        ;;
    2)
        MODEL="llama3.2:latest"
        ;;
    3)
        MODEL="llama3.2:3b"
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "📥 Pulling model: $MODEL"
echo "This may take several minutes depending on your internet connection..."
echo ""

if docker exec -it openmap-ollama ollama pull "$MODEL"; then
    echo ""
    echo "✅ Model $MODEL has been successfully installed!"
    echo ""
    echo "Installed models:"
    docker exec openmap-ollama ollama list
    echo ""
    
    # Update .env.local if it exists
    if [ -f .env.local ]; then
        if grep -q "OLLAMA_MODEL=" .env.local; then
            # Update existing OLLAMA_MODEL
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s|OLLAMA_MODEL=.*|OLLAMA_MODEL=$MODEL|" .env.local
            else
                # Linux
                sed -i "s|OLLAMA_MODEL=.*|OLLAMA_MODEL=$MODEL|" .env.local
            fi
            echo "✅ Updated OLLAMA_MODEL in .env.local to $MODEL"
        else
            # Add OLLAMA_MODEL if not present
            echo "OLLAMA_MODEL=$MODEL" >> .env.local
            echo "✅ Added OLLAMA_MODEL=$MODEL to .env.local"
        fi
    fi
    
    echo ""
    echo "🎉 Setup complete! You can now use natural language search."
    echo ""
    echo "To test the model, run:"
    echo '  curl http://localhost:11434/api/generate -d '"'"'{'
    echo '    "model": "'"$MODEL"'",'
    echo '    "prompt": "Kas yra Vilnius?",'
    echo '    "stream": false'
    echo '  }'"'"''
    echo ""
else
    echo ""
    echo "❌ Failed to pull model $MODEL"
    echo ""
    echo "If TildeOpen is not available, try installing Llama instead:"
    echo "  docker exec -it openmap-ollama ollama pull llama3.2:latest"
    echo ""
    echo "Then update your .env.local file:"
    echo "  OLLAMA_MODEL=llama3.2:latest"
    exit 1
fi
