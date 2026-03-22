# Complete Agent Guide: Creating 3D Educational Videos with Manim

**One-shot guide for agents to create 3B1B-style educational math videos using Manim (Community Edition).**

---

## PREREQUISITES CHECKLIST

Before starting, verify:
- [ ] Python 3.8+ installed (`python3 --version`)
- [ ] Manim installed: `pip install manim`
- [ ] **OPTIONAL** - LaTeX for MathTex:
  - macOS: `brew install --cask mactex` (requires restart)
  - Ubuntu: `sudo apt-get install texlive-full`
  - Windows: Install MiKTeX from miktex.org
- [ ] FFmpeg installed (usually comes with Manim)
- [ ] Problem/solution markdown file exists (e.g., `1-1.md`)

**No LaTeX?** Use the Unicode fallback with `Text` instead of `MathTex` — works perfectly fine!

---

## STEP 1: Read the Problem and Solution

**File to read:** The problem/solution markdown file provided by user

**What to extract:**
1. The mathematical function(s) involved
2. The domain (x range)
3. Each part of the problem (a, b, c, etc.)
4. Key insights or "aha moments"
5. Final answers for each part
6. Variable names and constants

**Example from spinning toy problem:**
- Function: `y = cx√(4-x²)`
- Domain: x ∈ [0, 2]
- Parts: Area (a), Volume (b), Solve for c (c)
- Key insight: u-substitution with u = 4 - x²
- Constant: c (positive)

---

## STEP 2: Create the Voiceover Script

**File to create:** `scripts/[TOPIC]_script.md`

**Template:**

```markdown
# [TOPIC] Script

## Scene Timing Reference
Manim uses `run_time` in seconds.

| Scene | Duration | Content |
|-------|----------|---------|
| Title | 5s | Title card |
| Setup | 10s | Problem context |
| Part A | 25s | Question → setup → insight → work → answer |
| [etc...] | | |

Total: ~90 seconds

---

## Scene 1: Title (0:00 - 0:05)
**Visual:** Title card with function
**Voiceover:** "[Title] — [Source]"
**Manim elements:** Title, Subtitle, MathTex or Text

---

## Scene 2: Setup (0:05 - 0:15)
**[0:05 - 0:08]** "[Context sentence]"
**Visual:** Curve appears
**[0:08 - 0:11]** "[Key variable explanation]"
**[0:11 - 0:15]** "[Region/domain description]"

**Manim elements:** Axes, FunctionGraph, Area fill, Text

[Continue for all scenes...]
```

**Rules for writing:**
1. Write spoken numbers as words: "x equals two" not "x = 2"
2. Use plain language: "square root of" not "√"
3. Mark intentional pauses: `[pause 1 second]`
4. Note exact timing for visual cues

---

## STEP 3: Understand Manim Architecture

### Core Concepts

```python
# A Scene is a class that constructs the animation
from manim import *

class MyScene(Scene):  # or ThreeDScene for 3D
    def construct(self):
        # All animations go here
        self.add(mobject)      # Add without animation
        self.play(animation)   # Animate
        self.wait(seconds)     # Pause
```

### Mobject Types

| Type | Use For | Example |
|------|---------|---------|
| `Text` | Plain text, Unicode math | `Text("y = c·x·√(4−x²)")` |
| `MathTex` | LaTeX equations (requires LaTeX) | `MathTex("y = cx\\sqrt{4-x^2}")` |
| `Axes` | Coordinate system | `Axes(x_range=[0,3], y_range=[0,2])` |
| `FunctionGraph` | Plots | `axes.plot(lambda x: x**2)` |
| `SurroundingRectangle` | Highlights | `SurroundingRectangle(mobject)` |
| `Arrow` | Pointers | `Arrow(start, end)` |
| `Line` | Connections | `Line(start, end)` |

### ⚠️ TEXT OVERLAP FIXES

**Common Problem:** Text overlaps with axes, curves, or other elements.

**Solutions:**

1. **Use `next_to()` with `buff` parameter:**
```python
label.next_to(axes, RIGHT, buff=0.5)  # 0.5 units padding
equation.next_to(question, DOWN, buff=1.2)
```

2. **Use `shift()` for fine-tuning:**
```python
text.shift(UP * 0.5)      # Move up 0.5 units
text.shift(RIGHT * 1.0)   # Move right 1 unit
text.shift(DL * 0.3)      # Down-left diagonal
```

3. **Use `to_edge()` for screen positioning:**
```python
title.to_edge(UP, buff=1.0)
title.to_edge(LEFT, buff=1.5)
```

4. **Use `align_to()` for alignment:**
```python
label.align_to(axes, LEFT)
equation.align_to(question, LEFT)
```

5. **Create groups for complex layouts:**
```python
from manim import *

class NoOverlapExample(Scene):
    def construct(self):
        # Create axes
        axes = Axes(x_range=[0, 3], y_range=[0, 2])
        axes.to_edge(RIGHT, buff=1)
        
        # Text on left
        title = Text("Part (a)", font_size=24)
        title.to_edge(UP, buff=1)
        title.to_edge(LEFT, buff=1.5)
        
        question = Text("Find the area.", font_size=32)
        question.next_to(title, DOWN, buff=0.5, aligned_edge=LEFT)
        
        # Add spacing buffer
        equation = Text("A = ∫...", font_size=30)
        equation.next_to(question, DOWN, buff=1.2, aligned_edge=LEFT)
        
        self.add(axes, title, question, equation)
```

### Key Animations

| Animation | Effect | Duration |
|-----------|--------|----------|
| `Create(mob)` | Draws/appears | ~1-2s |
| `FadeIn(mob)` | Opacity 0→1 | ~0.5-1s |
| `Write(mob)` | Typewriter effect | ~1-3s |
| `Transform(mob1, mob2)` | Morphs one to other | ~2s |
| `ReplacementTransform(mob1, mob2)` | Replaces with morph | ~2s |
| `Indicate(mob)` | Pulse highlight | ~1s |
| `Circumscribe(mob)` | Circle around it | ~1.5s |

### Always Use

```python
self.wait()              # Brief pause (default 1s)
self.wait(2)             # 2 second pause
self.play(..., run_time=3)  # Set animation duration
```

---

## STEP 4: Create the Complete Scene File

**File structure:**
```
manim_project/
├── scenes/
│   └── [TOPIC]_scene.py       # Your scene file
├── scripts/
│   └── [TOPIC]_script.md     # Voiceover script
├── media/                     # Output videos (auto-created)
└── requirements.txt
```

**COMPLETE TEMPLATE - Copy and modify:**

```python
from manim import *
import numpy as np


class SpinningToyScene(Scene):
    """Complete walkthrough of the spinning toy problem with animations."""
    
    def construct(self):
        # ═══════════════════════════════════════════════════════════════════════
        # CONFIGURATION
        # ═══════════════════════════════════════════════════════════════════════
        self.camera.background_color = "#0e0f1a"  # Dark background
        
        # Color palette (3B1B style)
        C = {
            'bg': '#0e0f1a',
            'text': '#e4e4f0',
            'dim': '#6a6b82',
            'eq': '#f4f4ff',
            'gold': '#e8c060',
            'blue': '#5b9cf6',
            'teal': '#4ecdc4',
            'curve': '#4ecdc4',
            'surface': '#e8c060',
        }
        
        # MODIFY: Your function here
        def spinning_func(x, c=1.0):
            """The curve function."""
            if x < 0 or x > 2:
                return 0
            return c * x * np.sqrt(max(0, 4 - x**2))
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 1: TITLE CARD
        # ═══════════════════════════════════════════════════════════════════════
        title = Text(
            "The Spinning Toy Problem",
            font_size=48,
            color=C['text'],
            weight=BOLD
        )
        
        subtitle = Text(
            "2017 AP Calculus AB · Free Response, Question 5",
            font_size=24,
            color=C['dim']
        )
        
        # Option 1: Unicode text (NO LaTeX needed)
        func_text = Text(
            "y = c·x·√(4−x²)",
            font_size=44,
            color=C['gold']
        )
        
        # Option 2: MathTex (requires LaTeX)
        # func_text = MathTex(
        #     "y = cx\\sqrt{4-x^2}",
        #     font_size=44,
        #     color=C['gold']
        # )
        
        # Positioning (anti-overlap)
        title.to_edge(UP, buff=1.5)
        subtitle.next_to(title, DOWN, buff=0.6)
        func_text.next_to(subtitle, DOWN, buff=1.2)
        
        # Animate
        self.play(FadeIn(title), run_time=0.8)
        self.wait(0.3)
        self.play(FadeIn(subtitle), run_time=0.8)
        self.wait(0.5)
        self.play(Write(func_text), run_time=1.5)
        self.wait(2)
        
        # Clear
        self.play(
            FadeOut(title), FadeOut(subtitle), FadeOut(func_text),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 2: SETUP WITH GRAPH
        # ═══════════════════════════════════════════════════════════════════════
        
        # Create axes
        axes = Axes(
            x_range=[-0.5, 2.5, 0.5],
            y_range=[-0.5, 2.5, 0.5],
            x_length=7,
            y_length=5,
            axis_config={
                "color": C['dim'],
                "include_tip": True,
                "tip_length": 0.15,
            },
        )
        
        # Position axes to right to make room for text
        axes.to_edge(RIGHT, buff=1)
        
        # Axis labels (positioned away from axes)
        x_label = Text("x", font_size=28, color=C['dim'])
        y_label = Text("y", font_size=28, color=C['dim'])
        x_label.next_to(axes.x_axis.get_end(), DOWN, buff=0.2)
        y_label.next_to(axes.y_axis.get_end(), LEFT, buff=0.2)
        
        # Plot the curve
        curve = axes.plot(
            lambda x: spinning_func(x, c=1.0),
            x_range=[0, 2],
            color=C['curve'],
            stroke_width=4
        )
        
        # Text on left side (anti-overlap)
        context_text = Text(
            "A company designs spinning toys",
            font_size=26,
            color=C['text']
        )
        context_text2 = Text(
            "from a family of curves.",
            font_size=26,
            color=C['text']
        )
        
        context_group = VGroup(context_text, context_text2)
        context_group.arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        context_group.to_edge(LEFT, buff=1)
        context_group.to_edge(UP, buff=2)
        
        # Animate
        self.play(Create(axes), run_time=1.5)
        self.play(Create(x_label), Create(y_label), run_time=0.6)
        
        self.play(Write(context_group), run_time=1.5)
        self.wait(0.3)
        
        # Draw curve
        self.play(Create(curve), run_time=2)
        self.wait(1)
        
        # Fill region
        region_fill = axes.get_area(
            curve,
            x_range=[0, 2],
            color=C['blue'],
            opacity=0.25
        )
        
        self.play(FadeIn(region_fill), run_time=1.5)
        self.wait(1.5)
        
        # Clear
        self.play(
            FadeOut(axes), FadeOut(curve), FadeOut(region_fill),
            FadeOut(context_group), FadeOut(x_label), FadeOut(y_label),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 3: PART A - AREA (Add more scenes as needed)
        # ═══════════════════════════════════════════════════════════════════════
        
        part_a_label = Text(
            "part (a)",
            font_size=20,
            color=C['dim']
        )
        part_a_question = Text(
            "Find the area of region R in terms of c.",
            font_size=32,
            color=C['text']
        )
        
        # Anti-overlap positioning
        part_a_label.to_edge(UP, buff=1)
        part_a_label.to_edge(LEFT, buff=1.5)
        part_a_question.next_to(part_a_label, DOWN, buff=0.4, aligned_edge=LEFT)
        
        self.play(FadeIn(part_a_label), run_time=0.5)
        self.play(Write(part_a_question), run_time=1.5)
        self.wait(1)
        
        # Setup integral with spacing
        integral = Text(
            "A = ∫₀² c·x·√(4−x²) dx",
            font_size=38,
            color=C['eq']
        )
        integral.next_to(part_a_question, DOWN, buff=1.2, aligned_edge=LEFT)
        
        self.play(Write(integral), run_time=2)
        self.wait(1)
        
        # Continue with more steps...
        # MODIFY: Add your specific problem content here
        
        # Final answer with box
        answer = Text(
            "A = 8c/3",
            font_size=44,
            color=C['gold']
        )
        answer.next_to(integral, DOWN, buff=1.5, aligned_edge=LEFT)
        
        self.play(Write(answer), run_time=1.5)
        
        answer_box = SurroundingRectangle(
            answer,
            color=C['gold'],
            buff=0.25,
            stroke_width=2
        )
        
        self.play(Create(answer_box), run_time=0.8)
        self.wait(2)


if __name__ == "__main__":
    pass
```

---

## STEP 5: Render the Video

**Commands:**

```bash
# Navigate to project
cd manim

# Preview (lower quality, faster)
manim -pql scenes/spinning_toy_scene.py SpinningToyScene

# High quality render (1080p60)
manim -pqh scenes/spinning_toy_scene.py SpinningToyScene

# Production quality (1080p60, no preview)
manim --quality=h scenes/spinning_toy_scene.py SpinningToyScene
```

**Quality flags:**
- `-pql` = Preview, Quality Low (480p15, faster)
- `-pqm` = Preview, Quality Medium (720p30)
- `-pqh` = Preview, Quality High (1080p60)

**Output location:**
```
media/videos/[scene_name]/[quality]/[SceneClass].mp4
```

---

## STEP 6: Advanced Manim Features

### 3D Scenes

```python
from manim import *

class SolidOfRevolution(ThreeDScene):
    def construct(self):
        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES)
        
        # Create 3D axes
        axes = ThreeDAxes()
        
        # Surface of revolution
        surface = Surface(
            lambda u, v: np.array([
                u,
                np.sin(u) * np.cos(v),
                np.sin(u) * np.sin(v)
            ]),
            u_range=[0, PI],
            v_range=[0, TAU],
            resolution=(32, 32),
            color=BLUE
        )
        
        self.add(axes)
        self.play(Create(surface))
        self.begin_ambient_camera_rotation(rate=0.1)
        self.wait(5)
```

### Grouping and Layout

```python
# Group objects
group = VGroup(obj1, obj2, obj3)

# Arrange vertically with buffer
group.arrange(DOWN, buff=0.5)

# Arrange horizontally
group.arrange(RIGHT, buff=0.5)

# Center on screen
group.move_to(ORIGIN)
group.center()

# Align edges
obj1.align_to(obj2, LEFT)
obj1.next_to(obj2, DOWN, buff=0.3)

# Scale entire group
group.scale(0.8)
```

### Transformations

```python
# Morph one object to another
self.play(Transform(mob1, mob2))

# Replace with morph
self.play(ReplacementTransform(mob1, mob2))

# Transform matching parts (for equations)
self.play(TransformMatchingTex(eq1, eq2))

# Fade between
self.play(FadeOut(mob1), FadeIn(mob2))
```

---

## STEP 7: Complete Checklist

Before declaring success:

- [ ] Script markdown created with timing
- [ ] Python scene file created
- [ ] All MODIFY sections customized for your problem
- [ ] **Text positioned with proper buffers (no overlap)**
- [ ] Colors match palette
- [ ] Test with `-pql` first
- [ ] High quality render successful
- [ ] Output file > 1MB
- [ ] Video plays correctly

---

## STEP 8: Troubleshooting

### "LaTeX compilation error"
**Solution:** Install LaTeX (see Prerequisites) OR use `Text` with Unicode symbols instead of `MathTex`

### "Font not found"
**Solution:** Use system fonts. Manim falls back to available fonts.

### "ModuleNotFoundError: No module named 'manim'"
**Solution:** `pip install manim` in your virtual environment

### Video is blank/black
**Solution:** Check that you're calling `self.play()` or `self.add()` on mobjects

### Text overlaps graph/axes
**Solution:** Use these anti-overlap techniques:
```python
# 1. Position axes to one side
axes.to_edge(RIGHT, buff=1)

# 2. Position text to opposite side
text.to_edge(LEFT, buff=1.5)

# 3. Use large buffers
label.next_to(axes, UP, buff=1.0)

# 4. Shift for fine-tuning
text.shift(UP * 0.5)

# 5. Use scale for fitting
large_text.scale(0.8)
```

### Animations too fast/slow
**Solution:** Use `run_time` parameter:
```python
self.play(Write(text), run_time=3)  # 3 seconds
```

### 3D scene doesn't rotate
**Solution:** Use `ThreeDScene` not `Scene`, call:
```python
self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES)
self.begin_ambient_camera_rotation(rate=0.1)
```

---

## EXAMPLE: COMPLETE FILE STRUCTURE

```
manim_project/
├── scenes/
│   ├── spinning_toy_scene.py    # With MathTex (requires LaTeX)
│   └── spinning_toy_simple.py   # Unicode version (no LaTeX)
├── scripts/
│   └── spinning_toy_script.md
├── media/
│   └── videos/
│       └── spinning_toy_simple/
│           ├── 480p15/
│           │   └── SpinningToySimple.mp4
│           └── 1080p60/
│               └── SpinningToySimple.mp4
├── requirements.txt
└── README.md
```

---

## AGENT EXECUTION PROTOCOL

When given this guide + a problem/solution markdown file:

1. **READ** the problem markdown file first
2. **EXTRACT**: function, domain, parts, key insights, answers
3. **CREATE** script markdown with timing
4. **COPY** the complete scene template
5. **MODIFY** all sections marked with "MODIFY"
6. **POSITION** all text with proper buffers to avoid overlap
7. **TEST** with `manim -pql` (low quality preview)
8. **FIX** any errors (especially text overlap)
9. **RENDER** with `manim -pqh` (high quality)
10. **VERIFY** output file exists and plays

**Do NOT skip steps. Do NOT assume. Follow exactly.**

---

## Key Differences from Remotion

| Feature | Remotion | Manim |
|---------|----------|-------|
| **Language** | TypeScript/React | Python |
| **Rendering** | Browser + headless Chrome | Python + OpenGL + ffmpeg |
| **Math** | MathJax/Custom | LaTeX (optional) or Unicode |
| **3D** | Three.js | Built-in (OpenGL) |
| **Learning curve** | Higher (React knowledge) | Lower (Python only) |
| **Output** | MP4 via Chrome | MP4 via ffmpeg |
| **Equation beauty** | Good | Excellent (with LaTeX) |
| **Purpose-built** | General video | Math education |

**Manim is purpose-built for mathematical animations.** 3B1B uses it for a reason!

---

**Follow these steps exactly and the video will work.** 🎯

## Special Notes

### Text Positioning Cheat Sheet

| Problem | Solution |
|---------|----------|
| Text overlaps graph | Move graph to `RIGHT` with `buff=1`, text to `LEFT` with `buff=1.5` |
| Text too close to axes | Add `buff=0.5` to `next_to()` calls |
| Equation too wide | Use `scale(0.8)` or break into two lines |
| Title off-screen | Use `to_edge(UP, buff=1.5)` |
| Elements crowded | Increase `buff` values or use `shift()` |

### Unicode Math Characters

If not using LaTeX, use these Unicode characters in `Text`:

| Symbol | Unicode | Example |
|--------|---------|---------|
| ∫ | `\u222B` | `\u222B` (integral) |
| π | `\u03C0` | `\u03C0` (pi) |
| √ | `\u221A` | `\u221A` (sqrt) |
| ² | `\u00B2` | `x\u00B2` (squared) |
| ³ | `\u00B3` | `x\u00B3` (cubed) |
| ₀ | `\u2080` | `x\u2080` (subscript 0) |
| ₁ | `\u2081` | `x\u2081` (subscript 1) |
| ² | `\u00B2` | `x\u00B2` (superscript 2) |
| → | `\u2192` | `\u2192` (arrow) |
| · | `\u00B7` | `\u00B7` (dot multiply) |
| − | `\u2212` | `\u2212` (minus) |
| ∞ | `\u221E` | `\u221E` (infinity) |
| θ | `\u03B8` | `\u03B8` (theta) |

Or just copy-paste directly: `∫ π √ ² ³ ₀ ₁ → · − ∞ θ`

---

## Markdown to LaTeX Converter

For a faster workflow, use the included `md_to_tex.py` converter to automatically convert Markdown math expressions to proper LaTeX.

### Quick Start

```bash
# Convert a markdown file
python md_to_tex.py input.md

# Creates: input.tex.md with all fractions converted
```

### What It Does

| Input (Markdown) | Output (LaTeX) |
|------------------|----------------|
| `1/2` | `\frac{1}{2}` |
| `64c^2/15` | `\frac{64c^2}{15}` |
| `64\pi c^2/15` | `\frac{64\pi c^2}{15}` |
| `(a+b)/c` | `\frac{(a+b)}{c}` |
| `u^{1/2}` | `u^{\frac{1}{2}}` |
| `x^12` | `x^{12}` |
| `\frac{1}{2}` | `\frac{1}{2}` (preserved) |

### Usage in Manim

1. Write your equations in Markdown with simple notation:
```markdown
The answer is $A = 8c/3$ square inches.

The volume is $V = 64\pi c^2/15$ cubic inches.
```

2. Convert with the tool:
```bash
python md_to_tex.py input.md output.tex.md
```

3. Use the converted LaTeX in your Manim scene:
```python
from manim import *

class MyScene(Scene):
    def construct(self):
        # Use the converted LaTeX directly
        eq = MathTex(r"V = \frac{64\pi c^2}{15}")
        self.play(Write(eq))
```

### Watch Mode

Auto-convert on save:
```bash
python md_to_tex.py --watch input.md
```

### Options

```bash
python md_to_tex.py --help
# Usage: md_to_tex.py [-h] [--watch] [--stdout] input [output]
```

---

**Happy animating!** 🎬🐶
