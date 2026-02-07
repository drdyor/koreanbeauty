#!/bin/bash
# Setup script for Hamster System
# Run this to prepare your environment

set -e

echo "🐹 Hamster System Setup"
echo "========================"

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "📍 Python version: $PYTHON_VERSION"

if [[ $(python3 -c 'import sys; print(sys.version_info >= (3, 9))') == "False" ]]; then
    echo "❌ Error: Python 3.9+ required"
    exit 1
fi

# Create virtual environment
echo ""
echo "📦 Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

# Activate virtual environment
echo ""
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo ""
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Set your OpenAI API key: export OPENAI_API_KEY='your-key'"
echo "  2. Generate data: python src/training/generate_synthetic_data.py"
echo "  3. Train adapters: python src/training/finetune_qlora.py"
echo "  4. Run API: python src/api/app.py"
echo ""
