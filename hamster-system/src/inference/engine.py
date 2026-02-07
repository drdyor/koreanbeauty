#!/usr/bin/env python3
"""
Core Inference Engine (Steps 3.3 & 3.4)
Orchestrates classification, dynamic adapter loading, constrained generation, and filtering.
"""

import json
import os
from typing import Dict, List, Optional
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel

from classifier import HamsterClassifier
from post_processor import OutputFilter


class HamsterInferenceEngine:
    """
    Core inference engine for the Hamster System.
    
    This class handles:
    1. Classification of user input
    2. Dynamic loading of LoRA adapters
    3. Constrained generation (max_new_tokens=55)
    4. Post-processing filtering
    5. Memory management
    """
    
    def __init__(
        self,
        base_model_id: str = "mistralai/Mistral-7B-Instruct-v0.2",
        adapter_base_dir: str = "adapters",
        config_path: str = "configs/hamster_frameworks.json",
        load_in_4bit: bool = True,
        device: str = None
    ):
        """
        Initialize the inference engine.
        
        Args:
            base_model_id: HuggingFace model ID for base model
            adapter_base_dir: Directory containing LoRA adapters
            config_path: Path to hamster frameworks config
            load_in_4bit: Whether to use 4-bit quantization
            device: Device to use (None for auto)
        """
        self.base_model_id = base_model_id
        self.adapter_base_dir = adapter_base_dir
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        
        # Initialize components
        self.classifier = HamsterClassifier(config_path)
        self.filter = OutputFilter(config_path)
        
        # Load config
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        
        # Will be loaded on first use
        self.base_model = None
        self.tokenizer = None
        self.adapter_paths = self._discover_adapters()
        
        print(f"🐹 Hamster Inference Engine initialized")
        print(f"   Base model: {base_model_id}")
        print(f"   Device: {self.device}")
        print(f"   Adapters found: {list(self.adapter_paths.keys())}")
    
    def _discover_adapters(self) -> Dict[str, str]:
        """Discover available LoRA adapters."""
        adapter_paths = {}
        hamster_names = list(self.config["hamsters"].keys())
        
        for hamster in hamster_names:
            adapter_path = f"{self.adapter_base_dir}/{hamster}"
            if os.path.exists(adapter_path):
                # Check for adapter config
                if os.path.exists(f"{adapter_path}/adapter_config.json"):
                    adapter_paths[hamster] = adapter_path
        
        return adapter_paths
    
    def load_base_model(self):
        """Load the base model and tokenizer (run once at startup)."""
        if self.base_model is not None:
            return
        
        print(f"\n📦 Loading base model: {self.base_model_id}")
        
        # Quantization config
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16,
            bnb_4bit_use_double_quant=False,
        ) if self.device == "cuda" else None
        
        # Load model
        self.base_model = AutoModelForCausalLM.from_pretrained(
            self.base_model_id,
            quantization_config=bnb_config,
            device_map="auto" if self.device == "cuda" else None,
            torch_dtype=torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16,
            trust_remote_code=True
        )
        
        # Load tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(
            self.base_model_id,
            trust_remote_code=True
        )
        self.tokenizer.pad_token = self.tokenizer.eos_token
        
        print(f"✓ Base model loaded")
        if self.device == "cuda":
            print(f"   VRAM used: {torch.cuda.memory_allocated() / 1e9:.2f} GB")
    
    def _format_prompt(self, user_input: str, hamster_name: str) -> str:
        """
        Format the prompt for a specific hamster.
        The prompt is simple since fine-tuning taught the model the role.
        """
        hamster_config = self.config["hamsters"][hamster_name]
        
        # Simple, direct prompt
        prompt = f"User Problem: {user_input}\n\n"
        
        return prompt
    
    def generate_with_adapter(
        self,
        user_input: str,
        hamster_name: str,
        max_new_tokens: int = 55,
        temperature: float = 0.1,
        do_sample: bool = False
    ) -> str:
        """
        Generate a response using a specific hamster adapter.
        
        Args:
            user_input: The user's problem
            hamster_name: Which hamster to use
            max_new_tokens: Hard token constraint (default 55)
            temperature: Sampling temperature
            do_sample: Whether to use sampling
        
        Returns:
            Generated text
        """
        # Ensure base model is loaded
        if self.base_model is None:
            self.load_base_model()
        
        # Check if adapter exists
        if hamster_name not in self.adapter_paths:
            raise ValueError(f"Adapter not found for hamster: {hamster_name}")
        
        adapter_path = self.adapter_paths[hamster_name]
        
        # Load adapter dynamically
        print(f"  Loading adapter: {hamster_name}")
        model_with_adapter = PeftModel.from_pretrained(
            self.base_model,
            adapter_path
        )
        
        # Format prompt
        prompt = self._format_prompt(user_input, hamster_name)
        
        # Tokenize
        inputs = self.tokenizer(
            prompt,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=512
        )
        
        if self.device == "cuda":
            inputs = inputs.to(self.base_model.device)
        
        # Generate
        print(f"  Generating (max_tokens={max_new_tokens})...")
        with torch.no_grad():
            outputs = model_with_adapter.generate(
                **inputs,
                max_new_tokens=max_new_tokens,  # HARD TOKEN CONSTRAINT (Step 3.4)
                do_sample=do_sample,
                temperature=temperature if do_sample else None,
                pad_token_id=self.tokenizer.eos_token_id,
                eos_token_id=self.tokenizer.eos_token_id,
            )
        
        # Decode
        raw_output = self.tokenizer.decode(
            outputs[0],
            skip_special_tokens=True
        )
        
        # Extract only the generated part (after the prompt)
        generated_text = raw_output[len(prompt):].strip()
        
        # Clean up memory
        del model_with_adapter
        if self.device == "cuda":
            torch.cuda.empty_cache()
        
        return generated_text
    
    def get_hamster_takes(
        self,
        user_input: str,
        selected_hamsters: List[str] = None,
        max_new_tokens: int = 55,
        apply_filter: bool = True
    ) -> Dict[str, str]:
        """
        Generate constrained, role-locked takes from selected hamsters.
        
        This is the main entry point as specified in the playbook.
        
        Args:
            user_input: The user's problem
            selected_hamsters: Specific hamsters to use (None for auto-classify)
            max_new_tokens: Maximum tokens to generate
            apply_filter: Whether to apply post-processing filter
        
        Returns:
            Dictionary of hamster_name -> generated_take
        """
        results = {}
        
        # Classify if hamsters not specified
        if selected_hamsters is None:
            selected_hamsters = self.classifier.classify(user_input)
            print(f"🎯 Classified to: {selected_hamsters}")
        
        print(f"\n📝 Input: {user_input}")
        print("-" * 60)
        
        for hamster_name in selected_hamsters:
            if hamster_name not in self.adapter_paths:
                print(f"⚠ Adapter not found: {hamster_name}, skipping")
                continue
            
            try:
                # Generate raw take
                raw_take = self.generate_with_adapter(
                    user_input=user_input,
                    hamster_name=hamster_name,
                    max_new_tokens=max_new_tokens
                )
                
                # Apply post-processing filter
                if apply_filter:
                    filter_result = self.filter.filter_and_validate(raw_take)
                    final_take = filter_result["cleaned_text"]
                    
                    if not filter_result["validation"]["is_valid"]:
                        print(f"  ⚠ Validation issues: {filter_result['validation']['issues']}")
                else:
                    final_take = raw_take
                
                results[hamster_name] = final_take
                
                hamster_display = self.config["hamsters"][hamster_name]["name"]
                print(f"✓ {hamster_display}: {final_take[:80]}...")
                
            except Exception as e:
                print(f"✗ Error with {hamster_name}: {e}")
                results[hamster_name] = f"[Error: {str(e)}]"
        
        return results
    
    def get_single_take(
        self,
        user_input: str,
        hamster_name: str = None,
        **kwargs
    ) -> str:
        """
        Get a single take from one hamster (convenience method).
        
        Args:
            user_input: The user's problem
            hamster_name: Specific hamster (None for auto-select)
            **kwargs: Additional arguments for get_hamster_takes
        
        Returns:
            Single response string
        """
        if hamster_name is None:
            # Auto-classify and use first match
            hamsters = self.classifier.classify(user_input)
            if not hamsters:
                hamster_name = "behavioral"  # Default
            else:
                hamster_name = hamsters[0]
        
        results = self.get_hamster_takes(
            user_input=user_input,
            selected_hamsters=[hamster_name],
            **kwargs
        )
        
        return results.get(hamster_name, "[No response generated]")


# Standalone function as specified in playbook
def get_hamster_takes(
    user_input: str,
    base_model,
    tokenizer,
    adapter_paths: Dict[str, str],
    max_new_tokens: int = 55
) -> Dict[str, str]:
    """
    Standalone function for generating takes (as specified in playbook).
    
    This version assumes base_model and tokenizer are already loaded.
    """
    # Initialize classifier and filter
    classifier = HamsterClassifier()
    filter_obj = OutputFilter()
    
    # Classify input
    selected_hamsters = classifier.classify(user_input)
    results = {}
    
    for hamster_name in selected_hamsters:
        adapter_path = adapter_paths.get(hamster_name)
        if not adapter_path:
            continue
        
        # Dynamic Adapter Loading
        model_with_adapter = PeftModel.from_pretrained(base_model, adapter_path)
        
        # Simple Prompt Construction
        prompt = f"User Problem: {user_input}"
        
        inputs = tokenizer(prompt, return_tensors="pt").to(base_model.device)
        
        with torch.no_grad():
            outputs = model_with_adapter.generate(
                **inputs,
                max_new_tokens=max_new_tokens,  # HARD TOKEN CONSTRAINT
                do_sample=False,
                temperature=0.1,
                pad_token_id=tokenizer.eos_token_id
            )
        
        raw_take = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Post-Processing Filter
        final_take = filter_obj.clean_output(raw_take)
        
        results[hamster_name] = final_take
        
        # Clean up memory
        del model_with_adapter
        torch.cuda.empty_cache()
    
    return results


# Example usage
if __name__ == "__main__":
    # Initialize engine
    engine = HamsterInferenceEngine()
    
    # Test inputs
    test_inputs = [
        "I feel like I don't know who I am anymore",
        "I keep procrastinating on important projects",
        "My competitor just launched a similar product",
        "I have $10,000 in credit card debt",
    ]
    
    print("\n" + "=" * 70)
    print("HAMSTER INFERENCE ENGINE TESTS")
    print("=" * 70)
    
    for user_input in test_inputs:
        results = engine.get_hamster_takes(user_input)
        print("\n" + "-" * 70)
