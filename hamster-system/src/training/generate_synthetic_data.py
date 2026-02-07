#!/usr/bin/env python3
"""
Synthetic Data Generation for Hamster System
Phase 1.3: Generate 1,000 examples per hamster (6,000 total)

This script generates high-quality, role-locked training data using GPT-4 API.
It's designed to be run once per hamster type, producing fine-tuning datasets.

Cost-saving features:
- Batch processing to minimize API overhead
- Local caching to avoid re-generation
- Validation during generation to catch issues early
"""

import json
import os
import random
import time
from typing import Dict, List
from datetime import datetime
import argparse

# pip install openai (works with OpenRouter too)
from openai import OpenAI

# Free models on OpenRouter
FREE_MODELS = [
    "google/gemma-3-27b-it:free",           # Best for structured generation
    "meta-llama/llama-3.2-3b-instruct:free", # Fast fallback
]


class SyntheticDataGenerator:
    """Generates synthetic training data for hamster fine-tuning."""
    
    def __init__(self, api_key: str = None, model: str = None, use_openrouter: bool = True):
        self.use_openrouter = use_openrouter

        if use_openrouter:
            self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
            self.model = model or "google/gemma-3-27b-it:free"
            self.client = OpenAI(
                api_key=self.api_key,
                base_url="https://openrouter.ai/api/v1"
            )
        else:
            self.api_key = api_key or os.getenv("OPENAI_API_KEY")
            self.model = model or "gpt-4"
            self.client = OpenAI(api_key=self.api_key)

        # Set paths relative to project root
        self.project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
        self.output_dir = os.path.join(self.project_root, "data/raw")
        os.makedirs(self.output_dir, exist_ok=True)

        # Load hamster frameworks
        config_path = os.path.join(self.project_root, "configs/hamster_frameworks.json")
        with open(config_path, "r") as f:
            self.frameworks = json.load(f)["hamsters"]
    
    def generate_seed_problems(self, count: int = 1000) -> List[str]:
        """
        Generate diverse, unfiltered user problems.
        These can also be manually curated or loaded from a file.
        """
        problem_templates = [
            # Identity/Purpose (Eriksonian)
            "I feel like I don't know who I am anymore",
            "I'm {age} and I still don't know what I want to do with my life",
            "Everyone else seems to have their life figured out except me",
            "I used to be passionate about {interest} but now I feel empty",
            "I feel stuck between who I was and who I want to become",
            "I keep changing my mind about my career path",
            "I feel like I'm living someone else's life",
            "I don't recognize myself anymore",
            "What if I never find my purpose?",
            "I feel like I'm running out of time to figure things out",
            
            # Relationship/Social (Adlerian)
            "My coworker keeps undermining me in meetings",
            "I feel like I don't fit in with my friend group",
            "My partner and I keep having the same argument",
            "I feel inferior to my more successful siblings",
            "I can't seem to make friends as an adult",
            "My team doesn't respect my ideas",
            "I feel like people are always judging me",
            "I struggle with asking for help",
            "I feel like I'm always the one putting in more effort",
            "I compare myself to others constantly",
            
            # Habits/Behavior (Behavioral)
            "I keep procrastinating on important projects",
            "I want to start exercising but I never do",
            "I can't stop scrolling on my phone",
            "I need to wake up earlier but keep hitting snooze",
            "I keep saying I'll start {habit} tomorrow",
            "I avoid difficult conversations",
            "I can't stick to a diet",
            "I keep checking my email instead of doing deep work",
            "I want to read more books but never start",
            "I keep putting off cleaning my apartment",
            
            # Thoughts/Anxiety (Cognitive)
            "I keep imagining worst-case scenarios",
            "I can't stop worrying about things I can't control",
            "I assume people are thinking negatively about me",
            "I always expect things to go wrong",
            "I catastrophize every small problem",
            "I can't stop ruminating on past mistakes",
            "I think in black and white terms",
            "I should be further along in life by now",
            "I never do anything right",
            "What if I fail and everyone sees?",
            
            # Business/Strategy
            "My startup is growing but I'm not sure how to scale",
            "Competitors keep copying our features",
            "We need to reduce customer acquisition costs",
            "Our product isn't getting traction",
            "I need to pivot but don't know which direction",
            "Our margins are shrinking",
            "We're struggling to retain customers",
            "I need to enter a new market",
            "Our team is inefficient",
            "Investors want to see faster growth",
            
            # Finance/Personal
            "I have credit card debt and don't know how to pay it off",
            "I want to start investing but don't know where to begin",
            "I keep losing money on stocks",
            "I can't seem to stick to a budget",
            "I'm not saving enough for retirement",
            "I spend impulsively when I'm stressed",
            "I don't know how much emergency fund I need",
            "I'm afraid to look at my bank account",
            "I keep holding onto losing investments hoping they'll recover",
            "I don't understand if I should rent or buy"
        ]
        
        # Expand templates with variations
        fillers = {
            "age": ["25", "30", "35", "40", "45", "in my 20s", "in my 30s", "in my 40s"],
            "interest": ["art", "music", "writing", "coding", "sports", "my job", "helping others"],
            "habit": ["meditating", "journaling", "cooking", "learning Spanish", "playing guitar"]
        }
        
        problems = []
        for _ in range(count):
            template = random.choice(problem_templates)
            try:
                problem = template.format(
                    age=random.choice(fillers["age"]),
                    interest=random.choice(fillers["interest"]),
                    habit=random.choice(fillers["habit"])
                )
            except:
                problem = template
            problems.append(problem)
        
        return problems
    
    def build_prompt(self, hamster_name: str, user_problem: str) -> str:
        """
        Build the strict, multi-constraint prompt for synthetic data generation.
        This is the CRUCIAL prompt that ensures high-quality, role-locked responses.
        """
        hamster = self.frameworks[hamster_name]
        
        prompt = f"""You are embodying the "{hamster['name']}" - a specific problem-solving persona.

FRAMEWORK: {hamster['framework']}
FOCUS: {hamster['focus']}
VOICE: {hamster['voice']}

KEY CONCEPTS: {', '.join(hamster['key_concepts'][:5])}

---

USER PROBLEM: "{user_problem}"

---

TASK: Generate a SINGLE, CONCISE response ("take") from this hamster's perspective.

STRICT CONSTRAINTS (MANDATORY):
1. MAXIMUM 40 words (ideally 25-35 words)
2. MAXIMUM 55 tokens
3. MUST reference a specific framework concept
4. MUST include an actionable insight or probing question
5. MUST maintain the hamster's voice throughout
6. MUST NOT use any forbidden phrases

FORBIDDEN PHRASES (NEVER USE):
- "I'm not your therapist"
- "I am an AI"
- "I'm just a tool"
- "seek a professional"
- "I cannot provide medical advice"
- "It sounds like you are feeling"
- "It's important to process your feelings"
- "Please consult a mental health professional"
- "If you are in crisis, please seek help"
- "I understand that you"
- "As an AI language model"
- "I don't have personal experiences"

RESPONSE STYLE: {hamster['response_style']}

EXAMPLE TAKE: "{hamster['example_take']}"

---

OUTPUT FORMAT:
Respond with ONLY the hamster's take. No preamble, no explanation, no quotation marks around the response. Just the raw text of the take.

YOUR TAKE:"""
        
        return prompt
    
    def call_api(self, prompt: str, retries: int = 3) -> str:
        """
        Call the API to generate a response.
        Handles retries and model fallbacks for free tier rate limits.
        """
        models_to_try = [self.model] + [m for m in FREE_MODELS if m != self.model] if self.use_openrouter else [self.model]

        for model in models_to_try:
            for attempt in range(retries):
                try:
                    extra_headers = {}
                    if self.use_openrouter:
                        extra_headers = {
                            "HTTP-Referer": "https://glowchi.app",
                            "X-Title": "GlowChi Hamster Training"
                        }

                    response = self.client.chat.completions.create(
                        model=model,
                        messages=[{"role": "user", "content": prompt}],
                        max_tokens=80,
                        temperature=0.7,
                        extra_headers=extra_headers if extra_headers else None
                    )
                    return response.choices[0].message.content.strip()

                except Exception as e:
                    error_str = str(e).lower()
                    if "rate" in error_str or "limit" in error_str or "429" in error_str:
                        print(f"  Rate limited on {model}, waiting...")
                        time.sleep(5 * (attempt + 1))  # Exponential backoff
                        continue
                    elif attempt < retries - 1:
                        print(f"  Error with {model}: {e}, retrying...")
                        time.sleep(2)
                        continue
                    else:
                        print(f"  Failed with {model}: {e}, trying next model...")
                        break

        raise Exception("All models failed")
    
    def validate_response(self, response: str, hamster_name: str) -> Dict:
        """
        Validate the generated response against constraints.
        Returns validation results with any issues found.
        """
        forbidden_phrases = [
            "I'm not your therapist", "I am an AI", "I'm just a tool",
            "seek a professional", "I cannot provide medical advice",
            "It sounds like you are feeling", "It's important to process your feelings",
            "Please consult a mental health professional", "If you are in crisis",
            "I understand that you", "As an AI language model",
            "I don't have personal experiences", "I cannot diagnose"
        ]
        
        word_count = len(response.split())
        # Rough token estimate: words * 1.3
        estimated_tokens = int(word_count * 1.3)
        
        issues = []
        
        # Check word count
        if word_count > 40:
            issues.append(f"Word count ({word_count}) exceeds 40")
        
        # Check token estimate
        if estimated_tokens > 55:
            issues.append(f"Estimated tokens ({estimated_tokens}) exceeds 55")
        
        # Check forbidden phrases
        for phrase in forbidden_phrases:
            if phrase.lower() in response.lower():
                issues.append(f"Contains forbidden phrase: '{phrase}'")
        
        # Check for framework reference (basic check)
        hamster = self.frameworks[hamster_name]
        has_framework_ref = any(
            concept.split()[0].lower() in response.lower() 
            for concept in hamster['key_concepts']
        )
        if not has_framework_ref:
            issues.append("May lack explicit framework reference")
        
        return {
            "valid": len(issues) == 0,
            "word_count": word_count,
            "estimated_tokens": estimated_tokens,
            "issues": issues
        }
    
    def generate_hamster_dataset(
        self, 
        hamster_name: str, 
        count: int = 1000,
        seed_problems: List[str] = None,
        batch_size: int = 10,
        delay_between_calls: float = 1.5  # Longer delay for free tier rate limits
    ) -> List[Dict]:
        """
        Generate a complete dataset for one hamster.
        
        Args:
            hamster_name: Name of the hamster (e.g., 'eriksonian')
            count: Number of examples to generate
            seed_problems: List of user problems (if None, generates automatically)
            batch_size: Number of examples to process before saving checkpoint
            delay_between_calls: Delay between API calls (rate limiting)
        
        Returns:
            List of training examples in instruction-tuning format
        """
        print(f"\n{'='*60}")
        print(f"Generating dataset for: {hamster_name.upper()}")
        print(f"Target count: {count} examples")
        print(f"{'='*60}\n")
        
        # Generate or use seed problems
        if seed_problems is None:
            seed_problems = self.generate_seed_problems(count)
        
        dataset = []
        checkpoint_file = os.path.join(self.output_dir, f"{hamster_name}_checkpoint.json")
        
        # Load checkpoint if exists
        if os.path.exists(checkpoint_file):
            with open(checkpoint_file, 'r') as f:
                dataset = json.load(f)
            print(f"Loaded checkpoint with {len(dataset)} examples")
        
        start_idx = len(dataset)
        valid_count = 0
        invalid_count = 0
        
        for i in range(start_idx, count):
            problem = seed_problems[i % len(seed_problems)]
            prompt = self.build_prompt(hamster_name, problem)
            
            try:
                # Generate response
                response = self.call_api(prompt)
                
                # Validate response
                validation = self.validate_response(response, hamster_name)
                
                example = {
                    "instruction": problem,
                    "response": response,
                    "hamster": hamster_name,
                    "validation": validation,
                    "timestamp": datetime.now().isoformat()
                }
                
                if validation["valid"]:
                    valid_count += 1
                else:
                    invalid_count += 1
                    print(f"  Warning: Example {i+1} has issues: {validation['issues']}")
                
                dataset.append(example)
                
                # Save checkpoint every batch_size examples
                if (i + 1) % batch_size == 0:
                    with open(checkpoint_file, 'w') as f:
                        json.dump(dataset, f, indent=2)
                    print(f"Progress: {i+1}/{count} | Valid: {valid_count} | Invalid: {invalid_count}")
                
                # Rate limiting delay
                time.sleep(delay_between_calls)
                
            except Exception as e:
                print(f"Error generating example {i+1}: {e}")
                invalid_count += 1
                continue
        
        # Final save
        output_file = os.path.join(self.output_dir, f"{hamster_name}_raw.json")
        with open(output_file, 'w') as f:
            json.dump(dataset, f, indent=2)
        
        # Remove checkpoint
        if os.path.exists(checkpoint_file):
            os.remove(checkpoint_file)
        
        print(f"\n✓ Dataset complete: {output_file}")
        print(f"  Total: {len(dataset)} | Valid: {valid_count} | Invalid: {invalid_count}")
        
        return dataset
    
    def generate_all_hamsters(self, count_per_hamster: int = 1000):
        """Generate datasets for all six hamsters."""
        hamster_names = list(self.frameworks.keys())
        
        # Generate shared seed problems
        seed_problems = self.generate_seed_problems(count_per_hamster * 2)
        
        for hamster_name in hamster_names:
            self.generate_hamster_dataset(
                hamster_name=hamster_name,
                count=count_per_hamster,
                seed_problems=seed_problems
            )
        
        print("\n" + "="*60)
        print("ALL DATASETS GENERATED SUCCESSFULLY")
        print("="*60)


def main():
    parser = argparse.ArgumentParser(description="Generate synthetic training data for Hamster System")
    parser.add_argument("--hamster", type=str, help="Generate for specific hamster only")
    parser.add_argument("--count", type=int, default=1000, help="Number of examples per hamster")
    parser.add_argument("--api-key", type=str, help="API key (OpenRouter or OpenAI)")
    parser.add_argument("--model", type=str, help="Model to use (default: deepseek-r1 free)")
    parser.add_argument("--openai", action="store_true", help="Use OpenAI instead of OpenRouter")

    args = parser.parse_args()

    use_openrouter = not args.openai
    generator = SyntheticDataGenerator(
        api_key=args.api_key,
        model=args.model,
        use_openrouter=use_openrouter
    )

    print(f"\n🐹 Hamster Training Data Generator")
    print(f"   Using: {'OpenRouter (FREE)' if use_openrouter else 'OpenAI'}")
    print(f"   Model: {generator.model}")
    print(f"   Cost: {'$0' if use_openrouter and ':free' in generator.model else 'varies'}\n")
    
    if args.hamster:
        generator.generate_hamster_dataset(args.hamster, args.count)
    else:
        generator.generate_all_hamsters(args.count)


if __name__ == "__main__":
    main()
