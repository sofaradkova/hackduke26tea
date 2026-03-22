#!/usr/bin/env python3
"""
Markdown to LaTeX Converter for Manim/MacTeX

Converts markdown math expressions to proper LaTeX format:
- Converts inline divisions to \frac{}{}
- Ensures proper exponent formatting
- Handles complex expressions with parentheses
- Compatible with MacTeX/Manim's MathTex

Usage:
    python md_to_tex.py input.md [output.tex]
    python md_to_tex.py --watch input.md  # Auto-convert on change
"""

import re
import sys
import argparse
from pathlib import Path
from typing import List


class MathExpressionConverter:
    """Converts math expressions to proper LaTeX format."""
    
    def __init__(self):
        self.frac_depth = 0
        
    def convert_fractions(self, expr: str) -> str:
        """
        Convert division expressions to \frac{}{}.
        """
        # Protect existing \frac commands
        protected_fracs: List[str] = []
        counter = [0]
        
        def protect_frac(match):
            idx = counter[0]
            counter[0] += 1
            protected_fracs.append(match.group(0))
            return f"<<FRAC{idx}>>"
        
        # Protect existing \frac{...}{...}
        expr = re.sub(r'\\frac\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', 
                      protect_frac, expr)
        
        # Convert divisions to fractions - use iterative approach for nested
        prev = None
        while prev != expr:
            prev = expr
            expr = self._convert_divisions_once(expr)
        
        # Restore protected fractions
        for i, frac in enumerate(protected_fracs):
            expr = expr.replace(f"<<FRAC{i}>>", frac)
            
        return expr
    
    def _convert_divisions_once(self, expr: str) -> str:
        """Convert one level of division operators to \frac{}{}."""
        result = []
        i = 0
        
        while i < len(expr):
            if expr[i] == '/' and i > 0 and i < len(expr) - 1:
                # Check we're not inside an existing frac (heuristic)
                text_so_far = ''.join(result)
                frac_count = text_so_far.count('\\frac')
                open_braces = text_so_far.count('{') - text_so_far.count('}')
                
                # Simple heuristic: if we have unbalanced { after \frac, skip
                if frac_count > 0 and open_braces > 0:
                    # Check if we're inside a frac
                    last_frac = text_so_far.rfind('\\frac')
                    after_frac = text_so_far[last_frac:]
                    frac_open = after_frac.count('{') - after_frac.count('}')
                    if frac_open > 0:
                        result.append(expr[i])
                        i += 1
                        continue
                
                # Get left and right operands
                left = self._get_left_operand(expr, i - 1)
                right = self._get_right_operand(expr, i + 1)
                
                if left and right:
                    frac = f"\\frac{{{left}}}{{{right}}}"
                    # Trim result to remove left operand
                    left_len = len(left)
                    if len(result) >= left_len:
                        result = result[:-left_len]
                    result.extend(list(frac))
                    i += len(right) + 1  # skip past '/' and right operand
                    continue
            
            result.append(expr[i])
            i += 1
        
        return ''.join(result)
    
    def _get_left_operand(self, expr: str, end_pos: int) -> str:
        """Get the operand to the left of position end_pos."""
        i = end_pos
        
        # Skip whitespace
        while i >= 0 and expr[i].isspace():
            i -= 1
        if i < 0:
            return ""
        
        end = i
        start = i
        
        # Keep gathering tokens until we hit something that can't be part of operand
        while i >= 0:
            # Skip whitespace
            while i >= 0 and expr[i].isspace():
                i -= 1
            if i < 0:
                break
            
            # Check for closing paren - we stop here (parenthesized is atomic)
            if expr[i] == ')':
                depth = 1
                j = i - 1
                while j >= 0 and depth > 0:
                    if expr[j] == ')':
                        depth += 1
                    elif expr[j] == '(':
                        depth -= 1
                    j -= 1
                start = j + 1
                break  # Parenthesized expression is complete
            
            # Check for closing brace
            if expr[i] == '}':
                depth = 1
                j = i - 1
                while j >= 0 and depth > 0:
                    if expr[j] == '}':
                        depth += 1
                    elif expr[j] == '{':
                        depth -= 1
                    j -= 1
                # Check if preceded by ^ or _ (exponent/subscript)
                k = j
                if k >= 0 and expr[k] in '^_':
                    # Need to get the base too
                    k -= 1
                    if k >= 0:
                        if expr[k] == '}':
                            depth = 1
                            k -= 1
                            while k >= 0 and depth > 0:
                                if expr[k] == '}':
                                    depth += 1
                                elif expr[k] == '{':
                                    depth -= 1
                                k -= 1
                        elif expr[k].isalnum() or expr[k] == '_':
                            while k >= 0 and (expr[k].isalnum() or expr[k] == '_'):
                                k -= 1
                    start = k + 1
                    i = k
                    continue
                start = j + 1
                i = j
                continue
            
            # Check for digit (could be exponent like x^2)
            if expr[i].isdigit():
                num_end = i
                j = i
                while j >= 0 and expr[j].isdigit():
                    j -= 1
                if j >= 0 and expr[j] == '^':
                    # Get the base
                    k = j - 1
                    if k >= 0:
                        if expr[k] == '}':
                            depth = 1
                            k -= 1
                            while k >= 0 and depth > 0:
                                if expr[k] == '}':
                                    depth += 1
                                elif expr[k] == '{':
                                    depth -= 1
                                k -= 1
                        elif expr[k].isalnum() or expr[k] == '_':
                            while k >= 0 and (expr[k].isalnum() or expr[k] == '_'):
                                k -= 1
                    start = k + 1
                    i = k
                    continue
                # Just a number - keep it
                start = j + 1
                i = j
                continue
            
            # LaTeX command
            if expr[i].isalpha():
                j = i
                while j >= 0 and expr[j].isalpha():
                    j -= 1
                if j >= 0 and expr[j] == '\\':
                    start = j
                    i = j - 1
                    continue
                i = j
                continue
            
            # Number or variable
            if expr[i].isalnum() or expr[i] == '_':
                while i >= 0 and (expr[i].isalnum() or expr[i] == '_'):
                    i -= 1
                start = i + 1
                continue
            
            # Unknown character - stop
            break
        
        return expr[start:end + 1]
    
    def _get_right_operand(self, expr: str, start_pos: int) -> str:
        """Get the operand to the right of position start_pos."""
        n = len(expr)
        i = start_pos
        
        # Skip whitespace
        while i < n and expr[i].isspace():
            i += 1
        if i >= n:
            return ""
        
        start = i
        
        # Check for opening paren/brace
        if expr[i] == '(':
            depth = 1
            i += 1
            while i < n and depth > 0:
                if expr[i] == '(':
                    depth += 1
                elif expr[i] == ')':
                    depth -= 1
                i += 1
            return expr[start:i]
        
        if expr[i] == '{':
            depth = 1
            i += 1
            while i < n and depth > 0:
                if expr[i] == '{':
                    depth += 1
                elif expr[i] == '}':
                    depth -= 1
                i += 1
            return expr[start:i]
        
        # LaTeX command
        if expr[i] == '\\':
            i += 1
            while i < n and expr[i].isalpha():
                i += 1
            # Optional [arg]
            if i < n and expr[i] == '[':
                i += 1
                while i < n and expr[i] != ']':
                    i += 1
                if i < n:
                    i += 1
            # {arg}
            if i < n and expr[i] == '{':
                depth = 1
                i += 1
                while i < n and depth > 0:
                    if expr[i] == '{':
                        depth += 1
                    elif expr[i] == '}':
                        depth -= 1
                    i += 1
            return expr[start:i]
        
        # Number or variable
        while i < n and (expr[i].isalnum() or expr[i] == '_'):
            i += 1
        
        return expr[start:i] if i > start else ""
    
    def fix_exponents(self, expr: str) -> str:
        r"""Ensure exponents have braces for multi-digit numbers."""
        # x^12 -> x^{12}
        def add_braces(match):
            base = match.group(1)
            exp = match.group(2)
            if len(exp) > 1:
                return f"{base}^{{{exp}}}"
            return match.group(0)
        
        # Pattern: char^digits without braces
        return re.sub(r'([a-zA-Z}])\^(\d{2,})', add_braces, expr)
    
    def fix_sqrt(self, expr: str) -> str:
        r"""Ensure \sqrt has proper braces."""
        return re.sub(r'\\sqrt\s+([^{])', r'\\sqrt{\1}', expr)
    
    def fix_integrals(self, expr: str) -> str:
        r"""Fix integral limits notation."""
        # \int_0^2 -> \int_0^2 (keep simple)
        # \int_a^b where a or b is complex -> \int_{a}^{b}
        def fix_limits(match):
            lower = match.group(1)
            upper = match.group(2)
            
            # Only add braces if complex
            lower_fmt = f"{{{lower}}}" if len(lower) > 1 and not lower.isdigit() else lower
            upper_fmt = f"{{{upper}}}" if len(upper) > 1 and not upper.isdigit() else upper
                
            return f"\\int_{lower_fmt}^{upper_fmt}"
        
        return re.sub(r'\\int_([^{^\s]+)\^([^{^\s]+)', fix_limits, expr)
    
    def convert(self, expr: str) -> str:
        """Full conversion pipeline."""
        expr = self.convert_fractions(expr)
        expr = self.fix_exponents(expr)
        expr = self.fix_sqrt(expr)
        expr = self.fix_integrals(expr)
        return expr


class MarkdownToTex:
    """Converts Markdown files to LaTeX format with proper math."""
    
    def __init__(self):
        self.converter = MathExpressionConverter()
        
    def process_inline_math(self, match: re.Match) -> str:
        """Process inline math $...$."""
        content = match.group(1)
        converted = self.converter.convert(content)
        return f"${converted}$"
    
    def process_display_math(self, match: re.Match) -> str:
        """Process display math $$...$$."""
        content = match.group(1)
        converted = self.converter.convert(content)
        return f"$${converted}$$"
    
    def convert_file(self, input_path: Path, output_path: Path = None) -> str:
        """
        Convert a markdown file to LaTeX-enhanced format.
        """
        content = input_path.read_text(encoding='utf-8')
        
        # Process display math first (double $)
        content = re.sub(r'\$\$([^$]+)\$\$', self.process_display_math, content)
        
        # Process inline math (single $)
        content = re.sub(r'\$([^$]+)\$', self.process_inline_math, content)
        
        if output_path:
            output_path.write_text(content, encoding='utf-8')
            print(f"Converted: {input_path} -> {output_path}")
            
        return content


def main():
    parser = argparse.ArgumentParser(
        description="Convert Markdown math to proper LaTeX for MacTeX/Manim"
    )
    parser.add_argument("input", help="Input markdown file")
    parser.add_argument("output", nargs="?", help="Output file (default: input with .tex.md extension)")
    parser.add_argument("--watch", "-w", action="store_true", help="Watch for changes and auto-convert")
    parser.add_argument("--stdout", "-s", action="store_true", help="Print to stdout instead of file")
    
    args = parser.parse_args()
    
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: File not found: {input_path}")
        sys.exit(1)
    
    converter = MarkdownToTex()
    
    if args.output:
        output_path = Path(args.output)
    else:
        output_path = input_path.with_suffix('.tex.md')
    
    if args.watch:
        import time
        last_mtime = None
        print(f"Watching {input_path} for changes...")
        try:
            while True:
                current_mtime = input_path.stat().st_mtime
                if last_mtime is None or current_mtime != last_mtime:
                    content = converter.convert_file(input_path, output_path if not args.stdout else None)
                    if args.stdout:
                        print(content)
                    last_mtime = current_mtime
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nStopped watching.")
    else:
        content = converter.convert_file(input_path, output_path if not args.stdout else None)
        if args.stdout:
            print(content)


if __name__ == "__main__":
    main()
