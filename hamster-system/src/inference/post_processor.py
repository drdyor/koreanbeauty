#!/usr/bin/env python3
"""
Post-Processing Filter (Step 3.5)
Final layer of control to ensure output is free of therapeutic or defensive language.
"""

import json
import re
from typing import List, Dict


class OutputFilter:
    """
    Post-processing filter to clean and validate hamster outputs.
    
    This is the final, non-negotiable layer of control to ensure:
    1. No forbidden phrases (therapeutic/defensive language)
    2. Proper formatting
    3. Length constraints
    """
    
    def __init__(self, config_path: str = "configs/hamster_frameworks.json"):
        """Initialize filter with forbidden phrases from config."""
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        self.forbidden_phrases = config["global_constraints"]["forbidden_phrases"]
        self.max_tokens = config["global_constraints"]["max_tokens"]
        self.max_words = config["global_constraints"]["max_words"]
    
    def clean_output(self, text: str) -> str:
        """
        Removes forbidden phrases and cleans up spacing.
        
        Args:
            text: Raw model output
        
        Returns:
            Cleaned text
        """
        if not text:
            return ""
        
        cleaned_text = text
        
        # Remove forbidden phrases (case-insensitive)
        for phrase in self.forbidden_phrases:
            # Use word boundaries for whole phrase matching
            pattern = re.compile(re.escape(phrase), re.IGNORECASE)
            cleaned_text = pattern.sub("", cleaned_text)
        
        # Remove common AI disclaimer patterns
        ai_patterns = [
            r"(?i)^as an?\s+\w+\s*,?\s*",
            r"(?i)^i('m| am) an?\s+\w+\s*,?\s*",
            r"(?i)^i (don't|do not) have\s+[^.]*\.?",
            r"(?i)^please note[^.]*\.?",
            r"(?i)^important[:;][^.]*\.?",
            r"(?i)^disclaimer[:;][^.]*\.?",
        ]
        
        for pattern in ai_patterns:
            cleaned_text = re.sub(pattern, "", cleaned_text)
        
        # Final cleanup of extra spaces, newlines, and leading/trailing whitespace
        cleaned_text = " ".join(cleaned_text.split()).strip()
        
        # Remove leading/trailing punctuation that's left over
        cleaned_text = cleaned_text.strip('"\'.,;:!-–— ')
        
        # Ensure first letter is capitalized
        if cleaned_text:
            cleaned_text = cleaned_text[0].upper() + cleaned_text[1:]
        
        return cleaned_text
    
    def validate_output(self, text: str) -> Dict:
        """
        Validate cleaned output against constraints.
        
        Args:
            text: Cleaned text
        
        Returns:
            Validation report
        """
        issues = []
        warnings = []
        
        # Check word count
        word_count = len(text.split())
        if word_count > self.max_words:
            issues.append(f"Word count ({word_count}) exceeds {self.max_words}")
        elif word_count > 35:
            warnings.append(f"Word count ({word_count}) is high")
        
        # Check token estimate
        estimated_tokens = int(word_count * 1.3)
        if estimated_tokens > self.max_tokens:
            issues.append(f"Estimated tokens ({estimated_tokens}) exceeds {self.max_tokens}")
        
        # Check for remaining forbidden phrases
        remaining_forbidden = []
        text_lower = text.lower()
        for phrase in self.forbidden_phrases:
            if phrase.lower() in text_lower:
                remaining_forbidden.append(phrase)
        
        if remaining_forbidden:
            issues.append(f"Still contains forbidden phrases: {remaining_forbidden}")
        
        # Check for empty output
        if not text or len(text.strip()) < 10:
            issues.append("Output is too short or empty")
        
        # Check for question marks (encourages engagement)
        if "?" not in text and word_count > 20:
            warnings.append("No question found - responses are more engaging with questions")
        
        return {
            "is_valid": len(issues) == 0,
            "word_count": word_count,
            "estimated_tokens": estimated_tokens,
            "issues": issues,
            "warnings": warnings
        }
    
    def filter_and_validate(self, text: str) -> Dict:
        """
        Full pipeline: clean and validate in one call.
        
        Args:
            text: Raw model output
        
        Returns:
            Dictionary with cleaned text and validation results
        """
        cleaned = self.clean_output(text)
        validation = self.validate_output(cleaned)
        
        return {
            "cleaned_text": cleaned,
            "validation": validation,
            "original_length": len(text.split()),
            "cleaned_length": len(cleaned.split())
        }
    
    def truncate_to_limit(self, text: str, max_words: int = None) -> str:
        """
        Truncate text to word limit if it exceeds constraints.
        Tries to end at a sentence boundary.
        
        Args:
            text: Text to truncate
            max_words: Maximum word count (defaults to config)
        
        Returns:
            Truncated text
        """
        if max_words is None:
            max_words = self.max_words
        
        words = text.split()
        if len(words) <= max_words:
            return text
        
        # Try to find a sentence boundary within limit
        truncated = " ".join(words[:max_words])
        
        # Look for last sentence-ending punctuation
        for punct in ['. ', '? ', '! ']:
            last_punct = truncated.rfind(punct)
            if last_punct > len(truncated) * 0.7:  # Only truncate if we keep 70%
                truncated = truncated[:last_punct + 1]
                break
        
        return truncated.strip()


# Standalone function as specified in playbook
def clean_output(text: str) -> str:
    """
    Removes forbidden phrases and cleans up spacing.
    
    This is the standalone function as specified in the playbook.
    """
    filter_obj = OutputFilter()
    return filter_obj.clean_output(text)


# Example usage and testing
if __name__ == "__main__":
    filter_obj = OutputFilter()
    
    # Test cases with various issues
    test_outputs = [
        # Clean output
        "That's catastrophizing—taking a possibility and treating it as probability. What's the actual evidence? What would you tell a friend?",
        
        # With forbidden phrase
        "I'm not your therapist, but I can suggest that you seek a professional. This sounds like cognitive distortion.",
        
        # With AI disclaimer
        "As an AI language model, I don't have personal experiences, but I can tell you that this is loss aversion.",
        
        # Too long
        "This is a very long response that goes on and on about various psychological concepts without really getting to the point and it just keeps going with more and more words that don't add much value to the actual response and should definitely be truncated.",
        
        # Multiple issues
        "I am an AI and I cannot provide medical advice. Please consult a mental health professional. However, I can say this looks like Porter's Five Forces analysis.",
    ]
    
    print("=" * 70)
    print("POST-PROCESSING FILTER TESTS")
    print("=" * 70)
    
    for i, output in enumerate(test_outputs, 1):
        result = filter_obj.filter_and_validate(output)
        
        print(f"\n📝 Test {i}:")
        print(f"   Original: {output[:80]}...")
        print(f"   Cleaned:  {result['cleaned_text'][:80]}...")
        print(f"   Valid: {result['validation']['is_valid']}")
        print(f"   Words: {result['original_length']} → {result['cleaned_length']}")
        
        if result['validation']['issues']:
            print(f"   ⚠ Issues: {result['validation']['issues']}")
        if result['validation']['warnings']:
            print(f"   ℹ Warnings: {result['validation']['warnings']}")
