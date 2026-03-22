# Complete Agent Guide: Creating 3D Educational Videos with Manim (v5)

**Version 5 — STRICT MODE with Anti-Overlap Rules**

> ⚠️ **CRITICAL:** This guide uses STRICT anti-overlap layout rules. Text and graphics MUST NEVER overlap. Follow the mandatory positioning rules in Step 3.

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

### ⚠️ STRICT ANTI-OVERLAP RULES — MUST FOLLOW

**CRITICAL:** Text MUST NEVER overlap with axes, curves, or other elements. Follow these STRICT rules:

#### The Golden Layout Rule
```python
# ALWAYS use this split-screen layout:
# LEFT side: Text (40% of screen)
# RIGHT side: Graphics (55% of screen)  
# CENTER: 5% buffer between them

axes.to_edge(RIGHT, buff=1.0)      # Graphics on RIGHT
text_group.to_edge(LEFT, buff=1.5)  # Text on LEFT
```

#### Mandatory Buffer Values
| Spacing Type | Minimum Buff | Recommended |
|--------------|--------------|-------------|
| Between text and graphics | 1.5 | 2.0 |
| Title from top edge | 1.0 | 1.5 |
| Between text lines | 0.5 | 0.8 |
| Between equation steps | 0.8 | 1.2 |
| Labels from axes | 0.3 | 0.5 |

#### STRICT Positioning Rules

**1. Axes MUST be on RIGHT side:**
```python
axes = Axes(...)
axes.to_edge(RIGHT, buff=1.0)  # REQUIRED - never center or left
axes.shift(UP * 0.3)  # Fine-tune if needed
```

**2. Text groups MUST be on LEFT side:**
```python
# Create a container for all text
text_container = VGroup(title, question, steps)
text_container.to_edge(LEFT, buff=1.5)  # REQUIRED
text_container.align_to(axes, UP)  # Align tops
```

**3. ALWAYS use `aligned_edge=LEFT` for vertical stacking:**
```python
question.next_to(title, DOWN, buff=0.8, aligned_edge=LEFT)
step1.next_to(question, DOWN, buff=1.0, aligned_edge=LEFT)
step2.next_to(step1, DOWN, buff=0.8, aligned_edge=LEFT)
```

**4. Scale down if content doesn't fit:**
```python
# If text is too wide, scale BEFORE positioning
if equation.width > 6:
    equation.scale(0.8)
# Then position
equation.next_to(question, DOWN, buff=1.0, aligned_edge=LEFT)
```

#### Anti-Overlap Checklist (MANDATORY)
Before final render, verify:
- [ ] Axes positioned with `to_edge(RIGHT, buff>=1.0)`
- [ ] All text uses `to_edge(LEFT, buff>=1.5)`
- [ ] All `next_to()` calls use `aligned_edge=LEFT`
- [ ] All buff values are >= minimums from table
- [ ] No text extends past x = -4 (left of center)
- [ ] No graphics extend past x = 2 (right of center)
- [ ] **Labels are on OPPOSITE side from screen edge** (see Label Positioning section above)

#### Forbidden Patterns (NEVER DO THESE)
```python
# ❌ WRONG: Centering axes
axes.move_to(ORIGIN)  # NEVER - causes overlap

# ❌ WRONG: No buffer
label.next_to(axes, RIGHT)  # NEVER - text touches axes

# ❌ WRONG: Text on both sides
text1.to_edge(LEFT)
text2.to_edge(RIGHT)  # NEVER - crowds the graphics

# ❌ WRONG: Small buff values
title.next_to(subtitle, DOWN, buff=0.1)  # NEVER - text touches

# ❌ WRONG: Missing aligned_edge
equation.next_to(question, DOWN)  # NEVER - misaligned

# ❌ WRONG: Labels extending off-screen (see Label Positioning section below)
graphic.to_edge(RIGHT, buff=1.5)
labels.next_to(graphic, RIGHT, buff=0.3)  # NEVER - labels pushed OFF-SCREEN!
```

#### ⚠️ CRITICAL: Label Positioning to Prevent Cutoff

**THE #1 CAUSE OF CUTOFF:** Placing labels on the same side as the screen edge!

**The Rule:** Labels must always be on the OPPOSITE side from the nearest screen edge.

| Graphic Position | Labels Go On | Example |
|------------------|--------------|---------|
| `to_edge(RIGHT)` | LEFT side of graphic | `labels.next_to(graphic, LEFT, buff=0.3)` |
| `to_edge(LEFT)` | RIGHT side of graphic | `labels.next_to(graphic, RIGHT, buff=0.3)` |
| `to_edge(UP)` | BELOW the graphic | `labels.next_to(graphic, DOWN, buff=0.3)` |
| `to_edge(DOWN)` | ABOVE the graphic | `labels.next_to(graphic, UP, buff=0.3)` |

**❌ WRONG - Labels Cut Off:**
```python
# Graphic on RIGHT, labels also on RIGHT = CUTOFF!
cylinder.to_edge(RIGHT, buff=1.5)
labels.next_to(cylinder, RIGHT, buff=0.3)  # ❌ OFF-SCREEN!
```

**✅ CORRECT - Labels Visible:**
```python
# Graphic on RIGHT, labels on LEFT side of graphic = VISIBLE!
cylinder.to_edge(RIGHT, buff=3.0)  # Extra buffer for labels
labels.next_to(cylinder, LEFT, buff=0.3)  # ✅ VISIBLE!
```

**Complete Cylinder Example (Fixed):**
```python
# ═══════════════════════════════════════════════════════════
# GRAPHICS - RIGHT SIDE with room for labels
# ═══════════════════════════════════════════════════════════
cylinder = VGroup(bottom, body, top, water)
cylinder.to_edge(RIGHT, buff=3.0)  # Extra buffer for safety!
cylinder.shift(UP * 0.5)

# ═══════════════════════════════════════════════════════════
# LABELS - On LEFT side of cylinder (not right!)
# ═══════════════════════════════════════════════════════════
radius_label = Text("r = 1 ft", font_size=20)
radius_line = Line(start=(-1, -1.5, 0), end=(0, -1.5, 0))  # Points right
radius_label.next_to(radius_line, DOWN, buff=0.2)

height_label = Text("h", font_size=24)
height_arrow = Arrow(start=(-1.3, -1.5, 0), end=(-1.3, 0.5, 0))  # Left side
height_label.next_to(height_arrow, LEFT, buff=0.2)

labels_group = VGroup(radius_label, radius_line, height_label, height_arrow)
labels_group.next_to(cylinder, LEFT, buff=0.3)  # ✅ LEFT of cylinder!
```

**Label Cutoff Checklist (MANDATORY):**
- [ ] If graphic is at `to_edge(RIGHT)`, labels use `next_to(graphic, LEFT)`
- [ ] If graphic is at `to_edge(LEFT)`, labels use `next_to(graphic, RIGHT)`
- [ ] Labels never extend beyond screen boundaries (x: -7 to 7, y: -4 to 4)
- [ ] Graphic buffer increased (`buff=3.0`) when labels are attached

#### Correct Pattern (ALWAYS DO THIS)
```python
from manim import *

class StrictNoOverlap(Scene):
    def construct(self):
        # ═══════════════════════════════════════════════════════════
        # GRAPHICS - RIGHT SIDE
        # ═══════════════════════════════════════════════════════════
        axes = Axes(
            x_range=[0, 3],
            y_range=[0, 2],
            x_length=5,  # Smaller to leave room
            y_length=4,
        )
        axes.to_edge(RIGHT, buff=1.0)  # REQUIRED
        
        curve = axes.plot(lambda x: x**0.5, color=BLUE)
        
        # ═══════════════════════════════════════════════════════════
        # TEXT - LEFT SIDE  
        # ═══════════════════════════════════════════════════════════
        title = Text("Problem Title", font_size=36)
        title.to_edge(UP, buff=1.5)
        title.to_edge(LEFT, buff=1.5)  # REQUIRED
        
        question = Text("Find the area under the curve.", font_size=28)
        question.next_to(title, DOWN, buff=0.8, aligned_edge=LEFT)  # REQUIRED
        
        integral = Text("A = ∫₀² √(x) dx", font_size=32)
        integral.next_to(question, DOWN, buff=1.2, aligned_edge=LEFT)  # REQUIRED
        
        answer = Text("A = 4/3", font_size=36, color=YELLOW)
        answer.next_to(integral, DOWN, buff=1.0, aligned_edge=LEFT)  # REQUIRED
        
        # ═══════════════════════════════════════════════════════════
        # ANIMATE
        # ═══════════════════════════════════════════════════════════
        self.play(Create(axes), run_time=1)
        self.play(Create(curve), run_time=1.5)
        self.play(Write(title), run_time=0.8)
        self.play(Write(question), run_time=1)
        self.play(Write(integral), run_time=1.5)
        self.play(Write(answer), run_time=1)
        self.wait(2)
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

## SCREEN LAYOUT REFERENCE

```
┌─────────────────────────────────────────────────────────┐
│  TEXT ZONE (LEFT)          │      GRAPHICS ZONE (RIGHT) │
│  x: -7 to -2               │      x: 0 to 7             │
│  buff: 1.5 from LEFT       │      buff: 1.0 from RIGHT  │
│                            │                            │
│  ┌──────────────────┐      │      ┌────────────────┐    │
│  │ Title            │      │      │                │    │
│  │                  │ 2.0  │      │     AXES       │    │
│  │ Question         │ buff │      │                │    │
│  │                  │──────│      │    CURVE       │    │
│  │ Step 1           │      │      │                │    │
│  │                  │      │      │    REGION      │    │
│  │ Step 2           │      │      │                │    │
│  │                  │      │      └────────────────┘    │
│  │ Answer (boxed)   │      │                            │
│  └──────────────────┘      │                            │
│                            │                            │
└─────────────────────────────────────────────────────────┘
```

**Visual Buffer Zones:**
- 1.5 units from LEFT edge → start of text
- 2.0 units between text and graphics  
- 1.0 units from RIGHT edge → end of graphics

---

## STEP 4: Create the Complete Scene File (STRICT MODE)

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

### Labels or graphics cut off at screen edge
**Root Cause:** Labels placed on the same side as the screen edge get pushed off-screen.

**Example of the problem:**
```python
# ❌ WRONG - labels extend off-screen
cylinder.to_edge(RIGHT, buff=1.5)
labels.next_to(cylinder, RIGHT, buff=0.3)  # Pushed off right edge!
```

**Solution:** Place labels on OPPOSITE side from screen edge:
```python
# ✅ CORRECT - labels visible
cylinder.to_edge(RIGHT, buff=3.0)  # Extra buffer
labels.next_to(cylinder, LEFT, buff=0.3)  # Labels on LEFT side of graphic

# For arrows pointing to graphic, position them on the accessible side:
height_arrow = Arrow(start=(-1.3, -1.5, 0), end=(-1.3, 0.5, 0))  # Left side
height_label.next_to(height_arrow, LEFT, buff=0.2)
```

**Screen boundaries in Manim:**
- X-axis: -7 (left) to 7 (right)
- Y-axis: -4 (bottom) to 4 (top)
- Anything beyond these coordinates gets cut off!

**Always check:** If graphic is at `to_edge(RIGHT)`, labels go on `next_to(graphic, LEFT)`

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

### Text Positioning Cheat Sheet (Strict Mode)

| Problem | Solution | Prevention |
|---------|----------|------------|
| Text overlaps graph | Move graph to `RIGHT` with `buff=1`, text to `LEFT` with `buff=1.5` | Use split-screen layout from start |
| Text too close to axes | Add `buff=0.5` to `next_to()` calls | Always use minimum buff values |
| Equation too wide | Use `scale(0.8)` or break into two lines | Check width BEFORE positioning |
| Title off-screen | Use `to_edge(UP, buff=1.5)` | Never use buff < 1.0 for edges |
| Elements crowded | Increase `buff` values or use `shift()` | Use buff >= 0.8 for all spacing |
| Misaligned equations | Add `aligned_edge=LEFT` to all `next_to()` | Mandatory for all vertical stacks |
| **Labels cut off** | **Place labels on OPPOSITE side from screen edge** | **See Label Positioning section above** |

---

## VALIDATION CHECKLIST

Before rendering, verify EVERY item:

### Graphics Position
- [ ] Axes use `to_edge(RIGHT, buff>=1.0)`
- [ ] Axis dimensions (x_length, y_length) <= 6
- [ ] Labels use buff >= 0.3 from axes

### Text Position  
- [ ] All text uses `to_edge(LEFT, buff>=1.5)`
- [ ] Title uses `to_edge(UP, buff>=1.0)`
- [ ] All `next_to()` use `aligned_edge=LEFT`
- [ ] All `next_to()` use `buff>=0.8`

### Sizing
- [ ] Font sizes <= 36 for equations
- [ ] Font sizes <= 28 for body text
- [ ] Wide equations scaled with `scale(0.8-0.9)`

### Forbidden Patterns Checked
- [ ] No `move_to(ORIGIN)` for axes
- [ ] No missing `buff` in `next_to()`
- [ ] No missing `aligned_edge` in vertical stacks
- [ ] No text on both LEFT and RIGHT sides

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

## QUICK REFERENCE CARD

Print this and keep it visible:

```
┌─────────────────────────────────────────────────────────┐
│  STRICT ANTI-OVERLAP RULES                              │
├─────────────────────────────────────────────────────────┤
│  1. Graphics: axes.to_edge(RIGHT, buff=1.0)             │
│  2. Text: text.to_edge(LEFT, buff=1.5)                  │
│  3. Stack: next_to(..., aligned_edge=LEFT)              │
│  4. Space: buff >= 0.8 between elements                 │
│  5. Size: Scale wide equations with scale(0.8)          │
├─────────────────────────────────────────────────────────┤
│  FORBIDDEN:                                             │
│  - axes.move_to(ORIGIN)                                 │
│  - next_to() without buff                               │
│  - next_to() without aligned_edge                       │
│  - Text on both sides of screen                         │
└─────────────────────────────────────────────────────────┘
```

---

**Happy animating!** 🎬🐶

---

*This is version 5 of the Manim guide. STRICT MODE with mandatory anti-overlap rules.*
