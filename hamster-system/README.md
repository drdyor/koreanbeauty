# 🐹 Hamster System

A cost-effective, psychology-driven problem-solving system that provides six distinct perspectives ("hamsters") on user problems using fine-tuned language models.

## Overview

The Hamster System uses **QLoRA fine-tuning** to create six specialized problem-solving personas:

| Hamster | Framework | Focus |
|---------|-----------|-------|
| 🧠 **Eriksonian** | Erikson's Psychosocial Development | Identity, purpose, life transitions |
| 🤝 **Adlerian** | Adlerian Individual Psychology | Social interest, inferiority, belonging |
| ⚡ **Behavioral** | Applied Behavior Analysis | Habits, reinforcement, action |
| 💭 **Cognitive** | Cognitive Behavioral Therapy | Thoughts, distortions, reframing |
| 📊 **Business** | Strategic Business Frameworks | Competitive advantage, positioning |
| 💰 **Finance** | Behavioral Finance | Risk, biases, allocation |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INPUT                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLASSIFICATION LAYER                          │
│              (Keyword-based, fast, deterministic)                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DYNAMIC ADAPTER LOADING                         │
│              (Load appropriate LoRA adapter)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              CONSTRAINED GENERATION (max 55 tokens)              │
│                    (Hard token limit enforced)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              POST-PROCESSING FILTER                              │
│         (Remove forbidden phrases, validate output)              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      HAMSTER TAKES                               │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
hamster-system/
├── configs/
│   └── hamster_frameworks.json    # Framework definitions & constraints
├── data/
│   ├── raw/                       # Synthetic data (generated)
│   ├── cleaned/                   # Validated & cleaned data
│   └── final/                     # JSONL for training
├── adapters/                      # Trained LoRA adapters
│   ├── eriksonian/
│   ├── adlerian/
│   ├── behavioral/
│   ├── cognitive/
│   ├── business/
│   └── finance/
├── src/
│   ├── training/
│   │   ├── generate_synthetic_data.py   # Phase 1.3
│   │   ├── validate_and_clean.py        # Phase 1.4
│   │   └── finetune_qlora.py            # Phase 2.4
│   ├── inference/
│   │   ├── classifier.py                # Step 3.2
│   │   ├── post_processor.py            # Step 3.5
│   │   └── engine.py                    # Steps 3.3 & 3.4
│   └── api/
│       └── app.py                       # Phase 4
├── scripts/
│   ├── setup.sh                       # Environment setup
│   ├── train_all.sh                   # Train all hamsters
│   └── deploy.sh                      # Deployment script
├── Dockerfile
├── requirements.txt
└── README.md
```

## Quick Start

### 1. Installation

```bash
# Clone repository
git clone <repository-url>
cd hamster-system

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Data Generation (Phase 1)

```bash
# Set OpenAI API key
export OPENAI_API_KEY="your-key-here"

# Generate synthetic data for all hamsters
python src/training/generate_synthetic_data.py --count 1000

# Validate and clean
python src/training/validate_and_clean.py
```

### 3. Fine-Tuning (Phase 2)

#### Option A: Google Colab (Free)

1. Upload `src/training/finetune_qlora.py` to Colab
2. Mount your Google Drive
3. Run:

```python
!python finetune_qlora.py --hamster eriksonian --epochs 3
```

4. Repeat for all 6 hamsters
5. Download adapters to `adapters/`

#### Option B: Local GPU

```bash
# Train all hamsters sequentially
python src/training/finetune_qlora.py --epochs 3

# Or train specific hamster
python src/training/finetune_qlora.py --hamster eriksonian --epochs 3
```

### 4. Running the API (Phase 4)

```bash
# Development
python src/api/app.py

# Or with uvicorn directly
uvicorn src.api.app:app --reload --host 0.0.0.0 --port 8000
```

### 5. Using the API

```bash
# Health check
curl http://localhost:8000/health

# List hamsters
curl http://localhost:8000/hamsters

# Solve a problem
curl -X POST http://localhost:8000/solve_problem \
  -H "Content-Type: application/json" \
  -d '{
    "problem": "I keep procrastinating on important projects",
    "max_tokens": 55
  }'

# Classify only (no generation)
curl -X POST http://localhost:8000/classify \
  -H "Content-Type: application/json" \
  -d '{"problem": "I feel stuck in my career"}'
```

## Deployment Options

### Option 1: Hugging Face Spaces (Free)

1. Create a new Space on Hugging Face
2. Upload your code and adapters
3. Use the provided Dockerfile
4. Deploy (may have higher latency on free tier)

**Cost: $0/month**

### Option 2: RunPod/Vast.ai (Spot Market)

```bash
# Deploy on RunPod spot instance
# Cost: $0.10 - $0.50/hour (only when running)
```

### Option 3: Cloud VPS (Dedicated)

```bash
# Build and run with Docker
docker build -t hamster-system .
docker run -p 8000:8000 -v $(pwd)/adapters:/app/adapters hamster-system
```

**Cost: $50-150/month for small GPU instance**

## Configuration

### Global Constraints

Edit `configs/hamster_frameworks.json`:

```json
{
  "global_constraints": {
    "max_tokens": 55,
    "max_words": 40,
    "forbidden_phrases": [
      "I'm not your therapist",
      "I am an AI",
      "..."
    ]
  }
}
```

### Hamster Frameworks

Each hamster has configurable:
- Framework name and description
- Trigger keywords for classification
- Response style guidelines
- Key concepts to reference

## Cost Breakdown

| Phase | Activity | Cost |
|-------|----------|------|
| 1.3 | Synthetic Data Generation (6,000 examples) | ~$30-60 (GPT-4 API) |
| 2.4 | Fine-Tuning (6 adapters) | $0 (Google Colab Free) |
| 4.1 | API Development | $0 |
| 4.3 | Deployment (Hugging Face Free) | $0/month |
| 4.4 | Deployment (RunPod Spot) | $0.10-0.50/hour |
| 4.4 | Deployment (Dedicated VPS) | $50-150/month |

**Total One-Time Cost: ~$30-60**
**Ongoing Cost: $0-150/month depending on deployment**

## API Reference

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/health` | GET | Health check |
| `/hamsters` | GET | List available hamsters |
| `/classify` | POST | Classify problem |
| `/solve_problem` | POST | Get hamster takes |
| `/solve_problem/single` | POST | Get single take |

### Example Response

```json
{
  "problem": "I keep procrastinating on important projects",
  "classified_hamsters": ["behavioral", "cognitive"],
  "takes": {
    "behavioral": "Your procrastination is negatively reinforced by anxiety reduction. Set a 2-minute timer and define the first micro-action.",
    "cognitive": "That's catastrophizing the task's difficulty. What's the smallest step you could take in the next 5 minutes?"
  },
  "processing_time_ms": 1250.5,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Development

### Running Tests

```bash
# Test classifier
python src/inference/classifier.py

# Test post-processor
python src/inference/post_processor.py

# Test inference engine
python src/inference/engine.py
```

### Training New Adapters

```bash
# 1. Prepare data
python src/training/generate_synthetic_data.py --hamster custom --count 1000
python src/training/validate_and_clean.py --hamster custom

# 2. Train
python src/training/finetune_qlora.py --hamster custom --epochs 3

# 3. Test
python -c "from src.inference.engine import HamsterInferenceEngine; e = HamsterInferenceEngine(); print(e.get_single_take('test', 'custom'))"
```

## Troubleshooting

### Out of Memory During Training

- Reduce `batch_size` to 2 or 1
- Reduce `max_seq_length` to 256
- Use `r=8` instead of `r=16` for LoRA

### Slow Inference

- Ensure model is loaded on GPU: `torch.cuda.is_available()`
- Use 4-bit quantization (enabled by default)
- Consider using a smaller base model (e.g., Llama 3 8B)

### Adapters Not Found

```bash
# Check adapter structure
ls -la adapters/
# Should contain: adapter_config.json, adapter_model.bin

# Re-train if missing
python src/training/finetune_qlora.py --hamster <name>
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Based on the "Hamster System" playbook for cost-effective LLM fine-tuning
- Uses QLoRA (Dettmers et al.) for efficient fine-tuning
- Built on HuggingFace Transformers and PEFT

---

**Built with 🐹 by the Hamster System Team**
