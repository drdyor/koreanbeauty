# 🧠 Synthetic Training Data for LLM Council Think Tank

This directory contains synthetic training data for a multi-agent consensus system that transforms unstructured user "mental dumps" into structured debate formats for training.

## 📁 Directory Structure

```
synthetic_council/
├── mental_dumps/
│   ├── raw_dumps.json              # 38 unstructured user inputs
│   └── structured_propositions.json # Extracted debate prompts
├── mags/                            # Multi-Agent Graphs (38 debates)
│   ├── debate_001_mag.json
│   ├── debate_002_mag.json
│   └── ...
└── dpo_training/
    ├── dpo_pairs.json              # 1,178 DPO training pairs
    ├── dpo_pairs.jsonl             # Same in JSONL format
    └── tree_dpo.json               # 38 Tree-Structured DPO trees
```

## 📊 Data Statistics

| Component | Count | Description |
|-----------|-------|-------------|
| Mental Dumps | 38 | Unstructured user inputs (avg 132 words) |
| Structured Propositions | 38 | Extracted debate prompts |
| MAGs | 38 | Full council debates |
| DPO Pairs | 1,178 | Training pairs for preference learning |
| Tree-DPO | 38 | Hierarchical preference structures |

### Domain Distribution

- **Ethics**: 11 debates (moral dilemmas, workplace ethics)
- **Creative/Existential**: 7 debates (meaning, death anxiety, creativity)
- **Health**: 6 debates (ADHD, eating, sleep)
- **Career**: 5 debates (job changes, bosses, startups)
- **Relationships**: 5 debates (partners, friends, kids)
- **Finance**: 4 debates (debt, inheritance, retirement)

## 🎭 Council Agents

Each debate involves 6 agents with distinct perspectives:

1. **The Analyst** - Evidence-focused, data-driven
2. **The Skeptic** - Contrarian, risk-aware
3. **The Synthesist** - Holistic, pattern-recognizing
4. **The Empath** - Emotion-focused, validating
5. **The Pragmatist** - Action-oriented, concrete
6. **The Philosopher** - Paradigm-challenging, meaning-focused

## 📖 Data Pipeline

```
Mental Dump → Structured Proposition → Council Debate → MAG → DPO Pairs
```

### Stage 1: Mental Dump
Unstructured user input expressing confusion, anxiety, or conflict.

**Example**:
```
I don't know what I'm doing with my life. I'm 32, I've been in this job 
for 5 years and I just feel... stuck? Like I'm not growing anymore but 
I don't know if I should quit because the money is good...
```

### Stage 2: Structured Proposition
Extracted debate question with context and assumptions.

**Example**:
```json
{
  "reformulated_query": "Should I leave my stable but unfulfilling job 
                        to pursue something more meaningful?",
  "implicit_assumptions": [
    "Money and stability are more important than fulfillment",
    "It's too late to change careers"
  ],
  "domain_classification": "career",
  "council_specializations_needed": [
    "career_coach", "financial_advisor", "psychologist"
  ]
}
```

### Stage 3: Council Debate (MAG)
Multi-Agent Graph with:
- **Round 1**: Initial responses from all 6 agents
- **Round 2**: Reviews, rankings, and self-reflections
- **Consensus**: Synthesized final response

### Stage 4: DPO Training Pairs
Extracted preferences for training:

#### Preference Types

| Type | Count | Description |
|------|-------|-------------|
| `ranking_preference` | 38 | High-ranked vs low-ranked responses |
| `synthesis_preference` | 228 | Consensus vs individual responses |
| `critique_preference` | 684 | Reviewer's response vs critiqued response |
| `consensus_preference` | 228 | Final synthesis vs initial responses |

**Example DPO Pair**:
```json
{
  "prompt": "Should I leave my stable but unfulfilling job?",
  "chosen": "Document three incidents. Then schedule a conversation...",
  "rejected": "What if the question isn't 'what should I do?' but 
              'who do I want to become?'...",
  "preference_type": "ranking_preference",
  "margin": 3.33,
  "chosen_agent": "pragmatist",
  "rejected_agent": "philosopher"
}
```

## 🌳 Tree-Structured DPO

Hierarchical preference structure capturing improvement paths:

```
Root (Proposition)
├── Level 1: Initial Responses (6 agents)
│   ├── analyst_initial
│   ├── skeptic_initial
│   └── ...
├── Level 2: After Self-Reflection
│   ├── analyst_reflected
│   ├── skeptic_reflected
│   └── ...
└── Level 3: Consensus Synthesis

Edges:
- Self-improvement: initial → reflected
- Synthesis: all → consensus
```

## 🚀 Usage for Training

### Standard DPO Training

```python
from datasets import load_dataset

# Load DPO pairs
dataset = load_dataset('json', data_files='dpo_training/dpo_pairs.jsonl')

# Use with TRL
trainer = DPOTrainer(
    model=model,
    train_dataset=dataset,
    ...
)
```

### Tree-DPO Training

```python
# Tree-DPO captures hierarchical improvement
# Loss considers paths through the tree, not just pairwise preferences

from tree_dpo import TreeDPOTrainer

trainer = TreeDPOTrainer(
    model=model,
    tree_data='dpo_training/tree_dpo.json',
    ...
)
```

## 🔧 Integration with Karpathy's llm-council

This data format is designed to integrate with [karpathy/llm-council](https://github.com/karpathy/llm-council):

1. **Preprocessing**: Add `backend/preprocessor.py` to convert mental dumps → propositions
2. **Data Capture**: Modify `backend/main.py` to save debate logs as MAGs
3. **Training Pipeline**: Add `backend/synthetic_trainer.py` to extract DPO pairs

See the full integration guide in the main project documentation.

## 📈 Data Quality

- **Consensus Quality Scores**: 0.75-0.95 (simulated user feedback)
- **Response Diversity**: 6 distinct agent perspectives per debate
- **Critique Depth**: Each agent reviews 2-3 other agents
- **Self-Reflection**: All agents generate self-critique

## 🔄 Extending the Dataset

To generate more synthetic data:

1. **Add Mental Dump Templates**: Add more domain-specific templates to the generation script
2. **Vary Agent Personalities**: Modify agent definitions for different council compositions
3. **Increase Debate Rounds**: Add Round 3 for recursive refinement
4. **User Feedback Loop**: Collect real quality scores to replace simulated ones

## 📚 Research Basis

This synthetic training pipeline is based on:

- **Multi-Agent Debate**: [Du et al., 2023](https://arxiv.org/abs/2305.19118) - "Improving Factuality and Reasoning in Language Models through Multiagent Debate"
- **Tree-DPO**: [Xie et al., 2024](https://arxiv.org/abs/2402.09097) - "Tree-Structured DPO"
- **Constitutional AI**: [Bai et al., 2022](https://arxiv.org/abs/2212.08073) - RL from AI Feedback
- **Self-Reflection**: [Shinn et al., 2023](https://arxiv.org/abs/2303.11366) - Reflexion

## 📜 License

This synthetic data is provided for research and educational purposes.
