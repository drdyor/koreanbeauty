#!/usr/bin/env python3
"""
Classification Layer (Step 3.2)
Keyword-based classifier for routing problems to appropriate hamsters.

This is a simple, fast, deterministic classifier that avoids costly LLM calls.
It uses keyword matching to determine which hamsters should respond to a problem.
"""

import json
from typing import List, Dict, Set
import re


class HamsterClassifier:
    """
    Simple keyword-based classifier for hamster selection.
    
    Instead of using a costly LLM call for classification,
    this uses fast string matching against domain-specific keywords.
    """
    
    def __init__(self, config_path: str = "configs/hamster_frameworks.json"):
        """Initialize classifier with hamster configurations."""
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        self.hamsters = config["hamsters"]
        self.keyword_map = self._build_keyword_map()
    
    def _build_keyword_map(self) -> Dict[str, Set[str]]:
        """Build a mapping of hamster names to their trigger keywords."""
        keyword_map = {}
        for hamster_name, hamster_config in self.hamsters.items():
            keywords = set(hamster_config.get("trigger_keywords", []))
            # Add framework concepts as additional keywords
            keywords.update(
                concept.lower().split()[0] 
                for concept in hamster_config.get("key_concepts", [])
            )
            keyword_map[hamster_name] = keywords
        return keyword_map
    
    def classify(self, user_input: str) -> List[str]:
        """
        Classify user input into one or more hamster domains.
        
        Args:
            user_input: The user's problem or question
        
        Returns:
            List of hamster names that should respond
        """
        input_lower = user_input.lower()
        matched_hamsters = []
        match_scores = {}
        
        # Check each hamster's keywords
        for hamster_name, keywords in self.keyword_map.items():
            score = 0
            for keyword in keywords:
                # Check for keyword presence (supports multi-word phrases)
                if keyword in input_lower:
                    # Count occurrences
                    count = input_lower.count(keyword)
                    # Longer keywords get higher weight (more specific)
                    weight = len(keyword.split())
                    score += count * weight * 10  # Multiply for better differentiation
            
            if score > 0:
                matched_hamsters.append(hamster_name)
                match_scores[hamster_name] = score
        
        # If no matches, default to behavioral (broad, actionable)
        if not matched_hamsters:
            return ["behavioral"]
        
        # Sort by score (highest first)
        matched_hamsters.sort(key=lambda h: match_scores[h], reverse=True)
        
        # Limit to top 3 most relevant hamsters to avoid overwhelming responses
        return matched_hamsters[:3]
    
    def classify_with_scores(self, user_input: str) -> Dict[str, float]:
        """
        Classify and return match scores for all hamsters.
        
        Args:
            user_input: The user's problem or question
        
        Returns:
            Dictionary of hamster names to match scores
        """
        input_lower = user_input.lower()
        scores = {}
        
        for hamster_name, keywords in self.keyword_map.items():
            score = 0
            for keyword in keywords:
                count = len(re.findall(r'\b' + re.escape(keyword) + r'\b', input_lower))
                if count > 0:
                    weight = len(keyword.split())
                    score += count * weight
            
            # Normalize by number of keywords to avoid bias toward hamsters with more keywords
            if len(keywords) > 0:
                score = score / len(keywords) * 100
            
            scores[hamster_name] = round(score, 2)
        
        return scores
    
    def get_explanation(self, user_input: str) -> Dict:
        """
        Get classification with explanation of why each hamster was selected.
        
        Args:
            user_input: The user's problem or question
        
        Returns:
            Dictionary with classification results and explanations
        """
        input_lower = user_input.lower()
        selected = self.classify(user_input)
        explanations = {}
        
        for hamster_name in selected:
            matched_keywords = []
            for keyword in self.keyword_map[hamster_name]:
                if keyword in input_lower:
                    matched_keywords.append(keyword)
            
            hamster_config = self.hamsters[hamster_name]
            explanations[hamster_name] = {
                "name": hamster_config["name"],
                "framework": hamster_config["framework"],
                "matched_keywords": matched_keywords[:5],  # Top 5 matches
                "focus": hamster_config["focus"]
            }
        
        return {
            "input": user_input,
            "selected_hamsters": selected,
            "explanations": explanations
        }


# Convenience function for direct use
def classify_problem(user_input: str) -> List[str]:
    """
    Classifies the user problem into one or more hamster domains.
    
    This is the standalone function as specified in the playbook.
    """
    classifier = HamsterClassifier()
    return classifier.classify(user_input)


# Example usage and testing
if __name__ == "__main__":
    classifier = HamsterClassifier()
    
    # Test cases
    test_inputs = [
        "I feel like I don't know who I am anymore and I'm stuck in life",
        "I keep procrastinating on my startup and can't seem to get started",
        "My competitor just launched a similar product and I'm worried about market share",
        "I have $10,000 in credit card debt and keep impulse buying when stressed",
        "I keep imagining worst-case scenarios about my relationship ending",
        "I feel inferior to my more successful coworkers and it's affecting my confidence",
    ]
    
    print("=" * 70)
    print("HAMSTER CLASSIFICATION TESTS")
    print("=" * 70)
    
    for user_input in test_inputs:
        result = classifier.get_explanation(user_input)
        scores = classifier.classify_with_scores(user_input)
        
        print(f"\n📝 Input: {user_input}")
        print(f"🎯 Selected: {result['selected_hamsters']}")
        print("📊 Scores:", {k: v for k, v in scores.items() if v > 0})
        
        for hamster, explanation in result['explanations'].items():
            print(f"  • {explanation['name']}: {explanation['framework']}")
            print(f"    Matched: {explanation['matched_keywords'][:3]}")
