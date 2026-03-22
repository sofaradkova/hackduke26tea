#!/usr/bin/env python3
"""Tests for the md_to_tex converter."""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from md_to_tex import MathExpressionConverter, MarkdownToTex


def test_fractions():
    """Test fraction conversion."""
    c = MathExpressionConverter()
    
    test_cases = [
        # Simple fractions
        ("1/2", r"\frac{1}{2}"),
        ("a/b", r"\frac{a}{b}"),
        ("x/y", r"\frac{x}{y}"),
        
        # With numbers and variables
        ("8/3", r"\frac{8}{3}"),
        ("8c/3", r"\frac{8c}{3}"),
        ("64c^2/15", r"\frac{64c^2}{15}"),
        ("64\\pi c^2/15", r"\frac{64\pi c^2}{15}"),
        
        # With negative sign
        ("-1/2", r"-\frac{1}{2}"),
        ("c/2", r"\frac{c}{2}"),
        
        # Multiple fractions in expression
        ("1/2 + 3/4", r"\frac{1}{2} + \frac{3}{4}"),
        ("x/2 + y/3", r"\frac{x}{2} + \frac{y}{3}"),
        
        # Fractions in exponents
        ("u^{1/2}", r"u^{\frac{1}{2}}"),
        ("x^{3/2}", r"x^{\frac{3}{2}}"),
        
        # Complex with parentheses (parentheses are kept for clarity)
        ("(a+b)/c", r"\frac{(a+b)}{c}"),
        ("a/(b+c)", r"\frac{a}{(b+c)}"),
        
        # Preserve existing frac
        (r"\\frac{1}{2}", r"\\frac{1}{2}"),
        (r"x + \\frac{a}{b}", r"x + \\frac{a}{b}"),
    ]
    
    print("Testing fraction conversion:")
    all_passed = True
    for input_expr, expected in test_cases:
        result = c.convert_fractions(input_expr)
        status = "✓" if result == expected else "✗"
        if result != expected:
            all_passed = False
            print(f"  {status} '{input_expr}' -> '{result}'")
            print(f"     Expected: '{expected}'")
        else:
            print(f"  {status} '{input_expr}' -> '{result}'")
    
    return all_passed


def test_exponents():
    """Test exponent fixing."""
    c = MathExpressionConverter()
    
    test_cases = [
        ("x^2", "x^2"),  # Single digit stays as-is
        ("x^12", "x^{12}"),  # Multi-digit gets braces
        ("y^123", "y^{123}"),
    ]
    
    print("\nTesting exponent fixing:")
    all_passed = True
    for input_expr, expected in test_cases:
        result = c.fix_exponents(input_expr)
        status = "✓" if result == expected else "✗"
        if result != expected:
            all_passed = False
            print(f"  {status} '{input_expr}' -> '{result}'")
            print(f"     Expected: '{expected}'")
        else:
            print(f"  {status} '{input_expr}' -> '{result}'")
    
    return all_passed


def test_full_conversion():
    """Test full conversion pipeline."""
    c = MathExpressionConverter()
    
    test_cases = [
        # Combined conversions
        ("A = c/2 * [2/3]", r"A = \frac{c}{2} * [\frac{2}{3}]"),
        ("V = 64c^2/15", r"V = \frac{64c^2}{15}"),
        ("x = \\sqrt{15/32}", r"x = \sqrt{\frac{15}{32}}"),
    ]
    
    print("\nTesting full conversion:")
    all_passed = True
    for input_expr, expected in test_cases:
        result = c.convert(input_expr)
        status = "✓" if result == expected else "✗"
        if result != expected:
            all_passed = False
            print(f"  {status} '{input_expr}'")
            print(f"     Got:      '{result}'")
            print(f"     Expected: '{expected}'")
        else:
            print(f"  {status} '{input_expr}' -> '{result}'")
    
    return all_passed


def main():
    """Run all tests."""
    print("=" * 60)
    print("md_to_tex Converter Tests")
    print("=" * 60)
    
    results = [
        test_fractions(),
        test_exponents(),
        test_full_conversion(),
    ]
    
    print("\n" + "=" * 60)
    if all(results):
        print("All tests passed! ✓")
        return 0
    else:
        print("Some tests failed! ✗")
        return 1


if __name__ == "__main__":
    sys.exit(main())
