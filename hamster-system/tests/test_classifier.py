#!/usr/bin/env python3
"""
Unit tests for the Hamster Classifier
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.inference.classifier import HamsterClassifier, classify_problem


def test_classifier():
    """Test the classifier with various inputs."""
    classifier = HamsterClassifier()
    
    test_cases = [
        {
            "input": "I feel like I don't know who I am anymore",
            "expected": ["eriksonian"],
            "description": "Identity crisis"
        },
        {
            "input": "I keep procrastinating on my work",
            "expected": ["behavioral"],
            "description": "Procrastination"
        },
        {
            "input": "My competitor just launched a similar product",
            "expected": ["business"],
            "description": "Competitive threat"
        },
        {
            "input": "I have $10,000 in credit card debt",
            "expected": ["finance"],
            "description": "Financial problem"
        },
        {
            "input": "I keep imagining worst-case scenarios",
            "expected": ["cognitive"],
            "description": "Catastrophizing"
        },
        {
            "input": "I feel inferior to my coworkers",
            "expected": ["adlerian"],
            "description": "Social comparison"
        }
    ]
    
    print("=" * 70)
    print("CLASSIFIER TESTS")
    print("=" * 70)
    
    passed = 0
    failed = 0
    
    for test in test_cases:
        result = classifier.classify(test["input"])
        
        # Check if any expected hamster is in the result
        match = any(exp in result for exp in test["expected"])
        
        status = "✅" if match else "❌"
        
        print(f"\n{status} {test['description']}")
        print(f"   Input: {test['input']}")
        print(f"   Expected: {test['expected']}")
        print(f"   Got: {result}")
        
        if match:
            passed += 1
        else:
            failed += 1
    
    print("\n" + "=" * 70)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 70)
    
    return failed == 0


def test_classify_function():
    """Test the standalone classify_problem function."""
    print("\n" + "=" * 70)
    print("STANDALONE FUNCTION TEST")
    print("=" * 70)
    
    result = classify_problem("I'm worried about my relationship ending")
    print(f"Input: 'I'm worried about my relationship ending'")
    print(f"Result: {result}")
    
    assert isinstance(result, list), "Result should be a list"
    assert len(result) > 0, "Result should not be empty"
    
    print("✅ Standalone function works correctly")
    return True


if __name__ == "__main__":
    success = test_classifier() and test_classify_function()
    sys.exit(0 if success else 1)
