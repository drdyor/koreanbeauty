# 🐹 Hamster System - Quick Start Guide

Get the Hamster System running in 5 minutes (with pre-trained adapters) or 2 hours (training from scratch).

## Option 1: Quick Start (Pre-trained Adapters) ⏱️ 5 min

### 1. Download Pre-trained Adapters

```bash
# Download adapters from HuggingFace (when available)
# Or use your own trained adapters

# Place adapters in this structure:
adapters/
├── eriksonian/
│   ├── adapter_config.json
│   └── adapter_model.safetensors
├── adlerian/
├── behavioral/
├── cognitive/
├── business/
└── finance/
```

### 2. Install & Run

```bash
# Setup
./scripts/setup.sh

# Run API
source venv/bin/activate
python src/api/app.py
```

### 3. Test

```bash
# In another terminal
curl -X POST http://localhost:8000/solve_problem \
  -H "Content-Type: application/json" \
  -d '{"problem": "I keep procrastinating on my work"}'
```

---

## Option 2: Full Setup (Train Your Own) ⏱️ 2 hours

### Phase 1: Data Generation (30 min)

```bash
# 1. Set API key
export OPENAI_API_KEY="your-key-here"

# 2. Generate synthetic data
python src/training/generate_synthetic_data.py --count 1000

# 3. Validate and clean
python src/training/validate_and_clean.py
```

### Phase 2: Fine-Tuning (60-90 min)

#### Option A: Google Colab (Recommended - Free)

1. Go to [Google Colab](https://colab.research.google.com)
2. Upload `src/training/finetune_qlora.py`
3. Mount Google Drive
4. Run:

```python
!pip install transformers peft accelerate bitsandbytes trl
!python finetune_qlora.py --hamster eriksonian --epochs 3
```

5. Download the `adapters/eriksonian` folder
6. Repeat for all 6 hamsters

#### Option B: Local GPU

```bash
# Train all hamsters
./scripts/train_all.sh

# Or train specific hamster
python src/training/finetune_qlora.py --hamster eriksonian --epochs 3
```

### Phase 3: Deployment (5 min)

```bash
# Local development
python src/api/app.py

# Docker
docker build -t hamster-system .
docker run -p 8000:8000 -v $(pwd)/adapters:/app/adapters hamster-system
```

---

## API Usage Examples

### Get All Perspectives

```bash
curl -X POST http://localhost:8000/solve_problem \
  -H "Content-Type: application/json" \
  -d '{
    "problem": "I feel stuck in my career and don't know what to do"
  }'
```

**Response:**
```json
{
  "problem": "I feel stuck in my career and don't know what to do",
  "classified_hamsters": ["eriksonian", "business"],
  "takes": {
    "eriksonian": "This sounds like generativity vs stagnation. What legacy do you want to create?",
    "business": "You're facing career plateau. Consider: skills gap, market positioning, or pivot?"
  },
  "processing_time_ms": 1250.5,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Get Single Perspective

```bash
curl "http://localhost:8000/solve_problem/single?problem=I%20keep%20procrastinating&hamster=behavioral"
```

### Classify Only (No Generation)

```bash
curl -X POST http://localhost:8000/classify \
  -H "Content-Type: application/json" \
  -d '{"problem": "I'm worried about my investments"}'
```

---

## Common Issues

### Issue: `ModuleNotFoundError`

```bash
# Solution: Install dependencies
pip install -r requirements.txt

# Or run setup
./scripts/setup.sh
```

### Issue: `CUDA out of memory`

```bash
# Solution: Reduce batch size
python src/training/finetune_qlora.py --batch-size 1 --hamster <name>
```

### Issue: `Adapter not found`

```bash
# Solution: Check adapter structure
ls -la adapters/

# Should see:
# eriksonian/  adlerian/  behavioral/  cognitive/  business/  finance/

# Each should contain:
# adapter_config.json  adapter_model.safetensors
```

### Issue: `OpenAI API error`

```bash
# Solution: Set API key
export OPENAI_API_KEY="sk-..."

# Or create .env file
cp .env.example .env
# Edit .env with your key
```

---

## Next Steps

- **Read the full docs**: [README.md](README.md)
- **Customize frameworks**: Edit `configs/hamster_frameworks.json`
- **Deploy to cloud**: See deployment options in README
- **Contribute**: Submit PRs for improvements

---

**Need Help?** Open an issue on GitHub or check the troubleshooting section in README.md
