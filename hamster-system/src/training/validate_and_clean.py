#!/usr/bin/env python3
"""
Data Validation & Cleaning Pipeline
Phase 1.4: Programmatically check all responses for quality

This script:
1. Validates token count (<= 55 tokens)
2. Checks for forbidden phrases
3. Removes or flags problematic examples
4. Outputs clean JSONL ready for fine-tuning
"""

import json
import os
import re
from typing import Dict, List, Tuple
import argparse


class DataValidator:
    """Validates and cleans synthetic training data."""
    
    def __init__(self, input_dir: str = "data/raw", output_dir: str = "data/cleaned"):
        self.input_dir = input_dir
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
        # Load forbidden phrases from config
        with open("configs/hamster_frameworks.json", "r") as f:
            config = json.load(f)
            self.forbidden_phrases = config["global_constraints"]["forbidden_phrases"]
            self.max_tokens = config["global_constraints"]["max_tokens"]
            self.max_words = config["global_constraints"]["max_words"]
    
    def estimate_tokens(self, text: str) -> int:
        """
        Estimate token count.
        Rough estimate: ~1.3 tokens per word for English text.
        """
        words = len(text.split())
        return int(words * 1.3)
    
    def check_forbidden_phrases(self, text: str) -> List[str]:
        """Check if text contains any forbidden phrases."""
        found = []
        text_lower = text.lower()
        for phrase in self.forbidden_phrases:
            if phrase.lower() in text_lower:
                found.append(phrase)
        return found
    
    def validate_example(self, example: Dict) -> Dict:
        """
        Validate a single training example.
        Returns validation report with all issues found.
        """
        response = example.get("response", "")
        issues = []
        warnings = []
        
        # Check word count
        word_count = len(response.split())
        if word_count > self.max_words:
            issues.append(f"Word count ({word_count}) exceeds {self.max_words}")
        elif word_count > 35:
            warnings.append(f"Word count ({word_count}) is high (recommended: <35)")
        
        # Check token estimate
        token_count = self.estimate_tokens(response)
        if token_count > self.max_tokens:
            issues.append(f"Token count ({token_count}) exceeds {self.max_tokens}")
        
        # Check forbidden phrases
        forbidden_found = self.check_forbidden_phrases(response)
        if forbidden_found:
            issues.append(f"Contains forbidden phrases: {forbidden_found}")
        
        # Check for empty or too short responses
        if not response or len(response.strip()) < 10:
            issues.append("Response is empty or too short")
        
        # Check for generic responses
        generic_patterns = [
            r"(?i)^here\s+is",
            r"(?i)^the\s+response",
            r"(?i)^as\s+a",
            r"(?i)^i\s+would",
            r"(?i)^you\s+should",
        ]
        for pattern in generic_patterns:
            if re.search(pattern, response):
                warnings.append("Response may be too generic or explanatory")
                break
        
        # Check for question marks (should have at least one probing question or insight)
        if "?" not in response and word_count > 20:
            warnings.append("No question found - consider adding a probing question")
        
        return {
            "example_id": example.get("instruction", "")[:50],
            "word_count": word_count,
            "token_estimate": token_count,
            "is_valid": len(issues) == 0,
            "issues": issues,
            "warnings": warnings,
            "forbidden_phrases_found": forbidden_found
        }
    
    def clean_response(self, response: str) -> str:
        """
        Attempt to clean a response by removing forbidden phrases.
        Returns cleaned text or None if uncleanable.
        """
        cleaned = response
        
        # Remove forbidden phrases
        for phrase in self.forbidden_phrases:
            cleaned = re.sub(re.escape(phrase), "", cleaned, flags=re.IGNORECASE)
        
        # Clean up extra spaces, newlines
        cleaned = " ".join(cleaned.split()).strip()
        
        # Remove leading/trailing punctuation
        cleaned = cleaned.strip('"\'.,;:! ')
        
        # Check if still valid after cleaning
        if len(cleaned) < 10:
            return None
        
        return cleaned
    
    def process_hamster_dataset(self, hamster_name: str, auto_clean: bool = True) -> Dict:
        """
        Process and validate a single hamster's dataset.
        
        Args:
            hamster_name: Name of the hamster
            auto_clean: Whether to attempt auto-cleaning of problematic examples
        
        Returns:
            Processing statistics
        """
        input_file = f"{self.input_dir}/{hamster_name}_raw.json"
        
        if not os.path.exists(input_file):
            print(f"⚠ Input file not found: {input_file}")
            return {"error": "File not found"}
        
        print(f"\n{'='*60}")
        print(f"Processing: {hamster_name.upper()}")
        print(f"{'='*60}")
        
        # Load raw data
        with open(input_file, 'r') as f:
            raw_data = json.load(f)
        
        print(f"Loaded {len(raw_data)} raw examples")
        
        valid_examples = []
        invalid_examples = []
        cleaned_examples = []
        
        for i, example in enumerate(raw_data):
            validation = self.validate_example(example)
            
            if validation["is_valid"]:
                valid_examples.append(example)
            else:
                invalid_examples.append({
                    "example": example,
                    "validation": validation
                })
                
                # Attempt auto-cleaning
                if auto_clean:
                    cleaned_response = self.clean_response(example["response"])
                    if cleaned_response:
                        example["response"] = cleaned_response
                        example["was_cleaned"] = True
                        cleaned_examples.append(example)
        
        # Statistics
        total = len(raw_data)
        valid = len(valid_examples)
        cleaned = len(cleaned_examples)
        invalid = len(invalid_examples) - cleaned
        
        print(f"\nValidation Results:")
        print(f"  Total: {total}")
        print(f"  Valid (no issues): {valid}")
        print(f"  Auto-cleaned: {cleaned}")
        print(f"  Invalid (removed): {invalid}")
        print(f"  Success rate: {((valid + cleaned) / total * 100):.1f}%")
        
        # Combine valid and cleaned for final dataset
        final_examples = valid_examples + cleaned_examples
        
        # Save cleaned dataset
        cleaned_file = f"{self.output_dir}/{hamster_name}_cleaned.json"
        with open(cleaned_file, 'w') as f:
            json.dump(final_examples, f, indent=2)
        
        # Save invalid examples for manual review
        if invalid > 0:
            invalid_file = f"{self.output_dir}/{hamster_name}_invalid.json"
            with open(invalid_file, 'w') as f:
                json.dump(invalid_examples, f, indent=2)
            print(f"  Invalid examples saved to: {invalid_file}")
        
        print(f"  Cleaned dataset saved to: {cleaned_file}")
        
        return {
            "hamster": hamster_name,
            "total": total,
            "valid": valid,
            "cleaned": cleaned,
            "invalid": invalid,
            "success_rate": (valid + cleaned) / total * 100,
            "output_file": cleaned_file
        }
    
    def convert_to_jsonl(self, hamster_name: str):
        """
        Convert cleaned JSON to JSONL format for instruction-tuning.
        Format: {"instruction": "...", "response": "..."}
        """
        input_file = f"{self.output_dir}/{hamster_name}_cleaned.json"
        output_file = f"data/final/{hamster_name}_train.jsonl"
        
        os.makedirs("data/final", exist_ok=True)
        
        with open(input_file, 'r') as f:
            data = json.load(f)
        
        with open(output_file, 'w') as f:
            for example in data:
                # Format for instruction tuning
                formatted = {
                    "instruction": example["instruction"],
                    "response": example["response"]
                }
                f.write(json.dumps(formatted) + '\n')
        
        print(f"  JSONL saved to: {output_file}")
        return output_file
    
    def process_all_hamsters(self, auto_clean: bool = True):
        """Process all hamster datasets."""
        hamster_names = ["eriksonian", "adlerian", "behavioral", "cognitive", "business", "finance"]
        
        all_stats = []
        for hamster_name in hamster_names:
            stats = self.process_hamster_dataset(hamster_name, auto_clean)
            all_stats.append(stats)
            
            # Convert to JSONL
            if "error" not in stats:
                self.convert_to_jsonl(hamster_name)
        
        # Print summary
        print("\n" + "="*60)
        print("VALIDATION SUMMARY")
        print("="*60)
        
        total_all = sum(s.get("total", 0) for s in all_stats if "error" not in s)
        valid_all = sum(s.get("valid", 0) for s in all_stats if "error" not in s)
        cleaned_all = sum(s.get("cleaned", 0) for s in all_stats if "error" not in s)
        
        print(f"Total examples processed: {total_all}")
        print(f"Valid examples: {valid_all}")
        print(f"Auto-cleaned examples: {cleaned_all}")
        print(f"Overall success rate: {((valid_all + cleaned_all) / total_all * 100):.1f}%")
        
        # Save summary
        summary_file = f"{self.output_dir}/validation_summary.json"
        with open(summary_file, 'w') as f:
            json.dump(all_stats, f, indent=2)
        print(f"\nSummary saved to: {summary_file}")


def main():
    parser = argparse.ArgumentParser(description="Validate and clean synthetic training data")
    parser.add_argument("--hamster", type=str, help="Process specific hamster only")
    parser.add_argument("--no-auto-clean", action="store_true", help="Disable auto-cleaning")
    parser.add_argument("--input-dir", type=str, default="data/raw", help="Input directory")
    parser.add_argument("--output-dir", type=str, default="data/cleaned", help="Output directory")
    
    args = parser.parse_args()
    
    validator = DataValidator(input_dir=args.input_dir, output_dir=args.output_dir)
    
    if args.hamster:
        stats = validator.process_hamster_dataset(args.hamster, auto_clean=not args.no_auto_clean)
        if "error" not in stats:
            validator.convert_to_jsonl(args.hamster)
    else:
        validator.process_all_hamsters(auto_clean=not args.no_auto_clean)


if __name__ == "__main__":
    main()
