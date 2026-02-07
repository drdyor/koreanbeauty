#!/usr/bin/env python3
"""
QLoRA Fine-Tuning Script for Hamster System
Phase 2.4: Train 6 separate LoRA adapters using the same base model

This script is designed to run on:
- Google Colab (Free Tier) with T4 GPU
- Kaggle Notebooks with P100 GPU
- Local GPU with 8GB+ VRAM

Usage:
    python finetune_qlora.py --hamster eriksonian
    python finetune_qlora.py --hamster adlerian
    # ... repeat for all 6 hamsters
"""

import os
import argparse
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer
import json


def get_hamster_config(hamster_name: str) -> dict:
    """Load hamster-specific configuration."""
    with open("configs/hamster_frameworks.json", "r") as f:
        frameworks = json.load(f)["hamsters"]
    
    return frameworks.get(hamster_name, {})


def setup_model_and_tokenizer(model_id: str, bnb_config: BitsAndBytesConfig):
    """Load base model and tokenizer with 4-bit quantization."""
    print(f"Loading base model: {model_id}")
    
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True,
        torch_dtype=torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
    )
    
    model.config.use_cache = False
    model.config.pretraining_tp = 1
    
    # Prepare model for k-bit training
    model = prepare_model_for_kbit_training(model)
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"
    
    return model, tokenizer


def create_lora_config(r: int = 16, lora_alpha: int = 32, lora_dropout: float = 0.05) -> LoraConfig:
    """Create LoRA configuration."""
    return LoraConfig(
        r=r,
        lora_alpha=lora_alpha,
        lora_dropout=lora_dropout,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=[
            "q_proj", "v_proj", "k_proj", "o_proj",
            "gate_proj", "up_proj", "down_proj"
        ],
    )


def create_training_args(
    output_dir: str,
    num_epochs: int = 3,
    batch_size: int = 4,
    learning_rate: float = 1e-4
) -> TrainingArguments:
    """Create training arguments."""
    return TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=num_epochs,
        per_device_train_batch_size=batch_size,
        gradient_accumulation_steps=2,
        optim="paged_adamw_8bit",
        logging_steps=10,
        learning_rate=learning_rate,
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        max_grad_norm=0.3,
        warmup_ratio=0.03,
        group_by_length=True,
        lr_scheduler_type="cosine",
        save_strategy="epoch",
        save_total_limit=2,
        push_to_hub=False,
        report_to="none",  # Disable wandb for simplicity
    )


def format_instruction_template(example: dict, hamster_config: dict) -> str:
    """
    Format the instruction template for training.
    The prompt should be simple since fine-tuning teaches the role.
    """
    hamster_name = hamster_config.get("name", "Hamster")
    framework = hamster_config.get("framework", "")
    
    # Simple prompt structure
    prompt = f"""### Instruction:
You are the {hamster_name}, an expert in {framework}.
Provide a concise, actionable take on the user's problem (max 40 words).

User Problem: {example['instruction']}

### Response:
{example['response']}"""
    
    return prompt


def train_hamster(
    hamster_name: str,
    model_id: str = "mistralai/Mistral-7B-Instruct-v0.2",
    dataset_path: str = None,
    output_base_dir: str = "adapters",
    num_epochs: int = 3,
    batch_size: int = 4,
    learning_rate: float = 1e-4,
    lora_r: int = 16,
    lora_alpha: int = 32,
    max_seq_length: int = 512
):
    """
    Train a LoRA adapter for a specific hamster.
    
    Args:
        hamster_name: Name of the hamster (e.g., 'eriksonian')
        model_id: Base model to use
        dataset_path: Path to training data JSONL file
        output_base_dir: Base directory for saving adapters
        num_epochs: Number of training epochs
        batch_size: Training batch size
        learning_rate: Learning rate
        lora_r: LoRA rank
        lora_alpha: LoRA alpha
        max_seq_length: Maximum sequence length
    """
    print(f"\n{'='*60}")
    print(f"Training Hamster: {hamster_name.upper()}")
    print(f"{'='*60}\n")
    
    # Set default dataset path
    if dataset_path is None:
        dataset_path = f"data/final/{hamster_name}_train.jsonl"
    
    # Set output directory
    output_dir = f"{output_base_dir}/{hamster_name}"
    os.makedirs(output_dir, exist_ok=True)
    
    # Load hamster config
    hamster_config = get_hamster_config(hamster_name)
    print(f"Framework: {hamster_config.get('framework', 'Unknown')}")
    print(f"Dataset: {dataset_path}")
    print(f"Output: {output_dir}\n")
    
    # Check if dataset exists
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found: {dataset_path}")
    
    # Load dataset
    print("Loading dataset...")
    dataset = load_dataset('json', data_files=dataset_path, split="train")
    print(f"Loaded {len(dataset)} examples\n")
    
    # QLoRA Configuration (4-bit quantization)
    print("Setting up 4-bit quantization...")
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16,
        bnb_4bit_use_double_quant=False,
    )
    
    # Load model and tokenizer
    model, tokenizer = setup_model_and_tokenizer(model_id, bnb_config)
    
    # Create LoRA config
    print(f"\nLoRA config: r={lora_r}, alpha={lora_alpha}")
    peft_config = create_lora_config(r=lora_r, lora_alpha=lora_alpha)
    
    # Create training arguments
    training_args = create_training_args(
        output_dir=output_dir,
        num_epochs=num_epochs,
        batch_size=batch_size,
        learning_rate=learning_rate
    )
    
    # Format dataset for training
    def formatting_func(example):
        return format_instruction_template(example, hamster_config)
    
    # Initialize trainer
    print("\nInitializing SFTTrainer...")
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        peft_config=peft_config,
        formatting_func=formatting_func,
        max_seq_length=max_seq_length,
        tokenizer=tokenizer,
        args=training_args,
    )
    
    # Train
    print(f"\nStarting training for {num_epochs} epochs...")
    print("-" * 60)
    trainer.train()
    
    # Save final adapter
    print("\n" + "-" * 60)
    print("Saving adapter...")
    trainer.model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)
    
    # Save training info
    training_info = {
        "hamster": hamster_name,
        "base_model": model_id,
        "num_epochs": num_epochs,
        "batch_size": batch_size,
        "learning_rate": learning_rate,
        "lora_r": lora_r,
        "lora_alpha": lora_alpha,
        "training_samples": len(dataset),
        "output_dir": output_dir
    }
    
    with open(f"{output_dir}/training_info.json", 'w') as f:
        json.dump(training_info, f, indent=2)
    
    print(f"\n✓ Training complete!")
    print(f"  Adapter saved to: {output_dir}")
    print(f"  Size: ~{lora_r * 10}MB (estimated)")
    
    return output_dir


def train_all_hamsters(
    model_id: str = "mistralai/Mistral-7B-Instruct-v0.2",
    num_epochs: int = 3,
    **kwargs
):
    """Train all 6 hamster adapters sequentially."""
    hamsters = ["eriksonian", "adlerian", "behavioral", "cognitive", "business", "finance"]
    
    results = []
    for hamster in hamsters:
        try:
            output_dir = train_hamster(
                hamster_name=hamster,
                model_id=model_id,
                num_epochs=num_epochs,
                **kwargs
            )
            results.append({
                "hamster": hamster,
                "status": "success",
                "output_dir": output_dir
            })
        except Exception as e:
            print(f"\n✗ Error training {hamster}: {e}")
            results.append({
                "hamster": hamster,
                "status": "failed",
                "error": str(e)
            })
    
    # Save summary
    with open("adapters/training_summary.json", 'w') as f:
        json.dump(results, f, indent=2)
    
    print("\n" + "="*60)
    print("TRAINING SUMMARY")
    print("="*60)
    for r in results:
        status = "✓" if r["status"] == "success" else "✗"
        print(f"{status} {r['hamster']}: {r['status']}")


def main():
    parser = argparse.ArgumentParser(description="QLoRA Fine-tuning for Hamster System")
    parser.add_argument("--hamster", type=str, help="Train specific hamster only")
    parser.add_argument("--model-id", type=str, default="mistralai/Mistral-7B-Instruct-v0.2",
                        help="Base model ID")
    parser.add_argument("--dataset-path", type=str, help="Path to training dataset")
    parser.add_argument("--output-dir", type=str, default="adapters",
                        help="Base output directory")
    parser.add_argument("--epochs", type=int, default=3, help="Number of epochs")
    parser.add_argument("--batch-size", type=int, default=4, help="Batch size")
    parser.add_argument("--learning-rate", type=float, default=1e-4, help="Learning rate")
    parser.add_argument("--lora-r", type=int, default=16, help="LoRA rank")
    parser.add_argument("--lora-alpha", type=int, default=32, help="LoRA alpha")
    parser.add_argument("--max-seq-length", type=int, default=512, help="Max sequence length")
    
    args = parser.parse_args()
    
    # Check CUDA availability
    if not torch.cuda.is_available():
        print("⚠ WARNING: CUDA not available. Training will be very slow on CPU.")
    else:
        print(f"✓ CUDA available: {torch.cuda.get_device_name(0)}")
        print(f"  VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
    
    if args.hamster:
        train_hamster(
            hamster_name=args.hamster,
            model_id=args.model_id,
            dataset_path=args.dataset_path,
            output_base_dir=args.output_dir,
            num_epochs=args.epochs,
            batch_size=args.batch_size,
            learning_rate=args.learning_rate,
            lora_r=args.lora_r,
            lora_alpha=args.lora_alpha,
            max_seq_length=args.max_seq_length
        )
    else:
        train_all_hamsters(
            model_id=args.model_id,
            num_epochs=args.epochs,
            batch_size=args.batch_size,
            learning_rate=args.learning_rate,
            lora_r=args.lora_r,
            lora_alpha=args.lora_alpha,
            max_seq_length=args.max_seq_length
        )


if __name__ == "__main__":
    main()
