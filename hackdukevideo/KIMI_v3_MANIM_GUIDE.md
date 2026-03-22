# Complete Agent Guide: Creating 3D Educational Videos with Manim

**One-shot guide for agents to create 3B1B-style educational math videos using Manim (Community Edition).**

---

## PREREQUISITES CHECKLIST

Before starting, verify:
- [ ] Python 3.8+ installed
- [ ] Manim Community Edition installed: `pip install manim`
- [ ] LaTeX installed (TeX Live or MiKTeX) — required for math typesetting
- [ ] FFmpeg installed (for video encoding)
- [ ] Problem/solution markdown file exists (e.g., `1-1.md`)

---

## STEP 1: Read the Problem and Solution

**File to read:** The problem/solution markdown file provided by user

**What to extract:**
1. The mathematical function(s) involved
2. The domain (x range)
3. Each part of the problem (a, b, c, etc.)
4. Key insights or "aha moments"
5. Final answers for each part

**Example from spinning toy problem:**
- Function: `y = cx√(4-x²)`
- Domain: x ∈ [0, 2]
- Parts: Area (a), Volume (b), Solve for c (c)
- Key insight: u-substitution with u = 4 - x²

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

---

## Scene 1: Title (0:00 - 0:05)
**Visual:** Title card with function
**Voiceover:** "[Title] — [Source]"
**Manim elements:** Title, Subtitle, MathTex

---

## Scene 2: Setup (0:05 - 0:15)
**[0:05 - 0:08]** "[Context sentence]"
**Visual:** Curve appears
**[0:08 - 0:11]** "[Key variable explanation]"
**[0:11 - 0:15]** "[Region/domain description]"

**Manim elements:** Axes, Function graph, Write animations

[Continue for all scenes...]
```

**Rules for writing:**
1. Write spoken numbers as words: "x equals two" not "x = 2"
2. Use plain language: "square root of" not "√"
3. Mark intentional pauses
4. Note exact timing for visual cues

---

## STEP 3: Understand Manim Architecture

### Core Concepts

```python
# A Scene is a class that constructs the animation
from manim import *

class MyScene(Scene):
    def construct(self):
        # All animations go here
        pass
```

### Mobject Types

| Type | Use For | Example |
|------|---------|---------|
| `Text` | Plain text | `Text("Hello")` |
| `MathTex` | Equations | `MathTex("y = cx\\sqrt{4-x^2}")` |
| `Axes` | Coordinate system | `Axes(x_range=[0,3], y_range=[0,2])` |
| `FunctionGraph` | Plots | `axes.plot(lambda x: x**2)` |
| `SurroundingRectangle` | Highlights | `SurroundingRectangle(mobject)` |
| `Arrow` | Pointers | `Arrow(start, end)` |

### Key Animations

| Animation | Effect |
|-----------|--------|
| `Create(mob)` | Draws/appears |
| `FadeIn(mob)` | Opacity 0→1 |
| `Write(mob)` | Typewriter effect |
| `Transform(mob1, mob2)` | Morphs one to other |
| `ReplacementTransform(mob1, mob2)` | Replaces with morph |
| `Indicate(mob)` | Pulse highlight |
| `Circumscribe(mob)` | Circle around it |

### Always Use

```python
self.wait()           # Brief pause (default 1s)
self.wait(2)          # 2 second pause
self.play(..., run_time=3)  # Set animation duration
```

---

## STEP 4: Create the Complete Scene File

**File structure:**
```
manim/
├── scenes/
│   └── [TOPIC]_scene.py      # Your scene file
├── scripts/
│   └── [TOPIC]_script.md     # Voiceover script
└── media/                    # Output videos (auto-created)
```

**COMPLETE TEMPLATE - Copy and modify:**

```python
from manim import *

class SpinningToyScene(Scene):
    def construct(self):
        # ═══════════════════════════════════════════════════
        # CONFIGURATION
        # ═══════════════════════════════════════════════════
        self.camera.background_color = "#0e0f1a"  # Dark background
        
        # Color palette (3B1B style)
        C = {
            'text': '#e4e4f0',
            'dim': '#6a6b82',
            'eq': '#f4f4ff',
            'gold': '#e8c060',
            'blue': '#5b9cf6',
            'teal': '#4ecdc4',
            'curve': '#4ecdc4',
            'surface': '#e8c060',
        }
        
        # ═══════════════════════════════════════════════════
        # SCENE 1: TITLE CARD
        # ═══════════════════════════════════════════════════
        title = Text("The Spinning Toy Problem", font="Lora", font_size=48, color=C['text'])
        subtitle = Text("2017 AP Calculus AB · Free Response, Question 5", 
                        font="Lora", font_size=24, color=C['dim'])
        func = MathTex("y = cx\\sqrt{4-x^2}", font_size=36, color=C['gold'])
        
        # Positioning
        title.to_edge(UP, buff=1.5)
        subtitle.next_to(title, DOWN, buff=0.5)
        func.next_to(subtitle, DOWN, buff=1)
        
        # Animate
        self.play(FadeIn(title), run_time=0.8)
        self.play(FadeIn(subtitle), run_time=0.8)
        self.wait(0.5)
        self.play(Write(func), run_time=1.5)
        self.wait(2)
        
        # Clear for next scene
        self.play(FadeOut(title), FadeOut(subtitle), FadeOut(func))
        
        # ═══════════════════════════════════════════════════
        # SCENE 2: SETUP WITH GRAPH
        # ═══════════════════════════════════════════════════
        
        # Create axes
        axes = Axes(
            x_range=[-0.5, 2.5, 0.5],
            y_range=[-0.5, 2.5, 0.5],
            x_length=6,
            y_length=4,
            axis_config={
                "color": C['dim'],
                "include_tip": True,
            },
        )
        
        # Labels
        x_label = axes.get_x_axis_label("x")
        y_label = axes.get_y_axis_label("y", edge=LEFT, direction=LEFT)
        
        # MODIFY: Your function here
        def func_def(x, c=1):
            import math
            if x < 0 or x > 2:
                return 0
            return c * x * math.sqrt(max(0, 4 - x**2))
        
        # Plot the curve
        curve = axes.plot(
            lambda x: func_def(x, c=1),
            x_range=[0, 2],
            color=C['curve'],
            stroke_width=3
        )
        
        # Text on left
        context = Text(
            "A company designs spinning toys from a family of curves.",
            font="Lora", font_size=28, color=C['text']
        ).to_edge(LEFT, buff=1)
        
        context.shift(UP * 2)
        
        # Animate
        self.play(Create(axes), run_time=1.5)
        self.play(Create(x_label), Create(y_label), run_time=0.8)
        self.play(Write(context), run_time=1.5)
        self.wait(0.5)
        
        # Draw the curve
        self.play(Create(curve), run_time=2)
        self.wait(1)
        
        # Fill region under curve
        region = axes.get_area(curve, x_range=[0, 2], color=C['blue'], opacity=0.2)
        self.play(FadeIn(region), run_time=1.5)
        self.wait(1)
        
        # Clear
        self.play(
            FadeOut(axes), FadeOut(curve), FadeOut(region),
            FadeOut(context), FadeOut(x_label), FadeOut(y_label)
        )
        
        # ═══════════════════════════════════════════════════
        # SCENE 3: PART A - AREA QUESTION
        # ═══════════════════════════════════════════════════
        
        part_a_label = Text("Part (a)", font="Lora", font_size=20, color=C['dim'])
        part_a_question = Text(
            "Find the area of region R in terms of c.",
            font="Lora", font_size=32, color=C['text']
        )
        
        part_a_label.to_edge(UP, buff=1)
        part_a_question.next_to(part_a_label, DOWN, buff=0.3, aligned_edge=LEFT)
        
        self.play(FadeIn(part_a_label), run_time=0.5)
        self.play(Write(part_a_question), run_time=1.5)
        self.wait(1)
        
        # Setup integral
        integral = MathTex(
            "A = \\int_0^2 cx\\sqrt{4-x^2}\\, dx",
            font_size=36, color=C['eq']
        ).next_to(part_a_question, DOWN, buff=1)
        
        self.play(Write(integral), run_time=2)
        self.wait(1)
        
        # Key insight - substitution
        insight = Text(
            "Notice the x and the square root...",
            font="Lora", font_size=24, color=C['teal']
        ).next_to(integral, DOWN, buff=0.8)
        
        self.play(Write(insight), run_time=1.2)
        self.wait(0.5)
        
        # Show substitution hint
        u_sub = MathTex("u = 4 - x^2", font_size=30, color=C['gold'])
        du = MathTex("du = -2x\\, dx", font_size=30, color=C['gold'])
        
        u_sub.next_to(insight, DOWN, buff=0.5)
        du.next_to(u_sub, DOWN, buff=0.3)
        
        self.play(Write(u_sub), run_time=1)
        self.play(Write(du), run_time=1)
        self.wait(1.5)
        
        # Clear and show work
        self.play(
            FadeOut(part_a_label), FadeOut(part_a_question),
            FadeOut(insight), FadeOut(u_sub), FadeOut(du)
        )
        
        # Work through the integral
        step1 = MathTex(
            "A = \\frac{c}{2} \\int_0^4 u^{1/2}\\, du",
            font_size=36, color=C['eq']
        )
        step2 = MathTex(
            "A = \\frac{c}{2} \\cdot \\frac{2}{3} u^{3/2} \\Big|_0^4",
            font_size=36, color=C['eq']
        )
        step3 = MathTex(
            "A = \\frac{c}{3} \\cdot 8 = \\frac{8c}{3}",
            font_size=40, color=C['gold']
        )
        
        steps = VGroup(step1, step2, step3).arrange(DOWN, buff=0.8)
        steps.move_to(ORIGIN)
        
        self.play(Write(step1), run_time=2)
        self.wait(0.5)
        self.play(Transform(step1, step2), run_time=2)
        self.wait(0.5)
        self.play(Transform(step1, step3), run_time=2)
        
        # Answer box
        answer_box = SurroundingRectangle(step3, color=C['gold'], buff=0.3, stroke_width=2)
        self.play(Create(answer_box), run_time=0.8)
        self.wait(2)
        
        # Clear
        self.play(FadeOut(step1), FadeOut(answer_box), FadeOut(integral))
        
        # ═══════════════════════════════════════════════════
        # SCENE 4: PART B - VOLUME (Disk Method)
        # ═══════════════════════════════════════════════════
        
        part_b_label = Text("Part (b)", font="Lora", font_size=20, color=C['dim'])
        part_b_question = Text(
            "Find the volume when revolved about the x-axis.",
            font="Lora", font_size=32, color=C['text']
        )
        
        part_b_label.to_edge(UP, buff=1)
        part_b_question.next_to(part_b_label, DOWN, buff=0.3, aligned_edge=LEFT)
        
        self.play(FadeIn(part_b_label), run_time=0.5)
        self.play(Write(part_b_question), run_time=1.5)
        self.wait(1)
        
        # Disk method visualization
        axes2 = Axes(
            x_range=[-0.5, 2.5, 0.5],
            y_range=[-2, 2, 0.5],
            x_length=6,
            y_length=4,
            axis_config={"color": C['dim']},
        )
        
        # Draw disks
        disks = VGroup()
        for x in [0.3, 0.7, 1.1, 1.5]:
            r = func_def(x, c=1)
            disk = Circle(radius=r*0.5, color=C['gold'], fill_opacity=0.3)
            disk.move_to(axes2.c2p(x, 0))
            disks.add(disk)
        
        self.play(Create(axes2), run_time=1)
        self.play(FadeIn(disks), run_time=1.5)
        self.wait(1)
        
        # Volume formula
        volume_eq = MathTex(
            "V = \\pi \\int_0^2 [cx\\sqrt{4-x^2}]^2\\, dx",
            font_size=32, color=C['eq']
        ).next_to(part_b_question, DOWN, buff=1)
        
        self.play(Write(volume_eq), run_time=2)
        self.wait(1)
        
        # Work
        vol_steps = MathTex(
            "V = \\pi c^2 \\int_0^2 (4x^2 - x^4)\\, dx",
            font_size=32, color=C['eq']
        )
        vol_answer = MathTex(
            "V = \\frac{64\\pi c^2}{15}",
            font_size=40, color=C['gold']
        )
        
        vol_steps.next_to(volume_eq, DOWN, buff=0.8)
        vol_answer.next_to(vol_steps, DOWN, buff=0.5)
        
        self.play(Write(vol_steps), run_time=2)
        self.wait(0.5)
        self.play(Write(vol_answer), run_time=1.5)
        
        # Answer box
        vol_box = SurroundingRectangle(vol_answer, color=C['gold'], buff=0.3)
        self.play(Create(vol_box), run_time=0.8)
        self.wait(2)
        
        # Clear
        self.play(
            FadeOut(part_b_label), FadeOut(part_b_question),
            FadeOut(axes2), FadeOut(disks),
            FadeOut(volume_eq), FadeOut(vol_steps),
            FadeOut(vol_answer), FadeOut(vol_box)
        )
        
        # ═══════════════════════════════════════════════════
        # SCENE 5: PART C - SOLVE FOR C
        # ═══════════════════════════════════════════════════
        
        part_c_label = Text("Part (c)", font="Lora", font_size=20, color=C['dim'])
        part_c_question = Text(
            "Find c when volume equals 2π.",
            font="Lora", font_size=32, color=C['text']
        )
        
        part_c_label.to_edge(UP, buff=1)
        part_c_question.next_to(part_c_label, DOWN, buff=0.3)
        
        self.play(FadeIn(part_c_label), run_time=0.5)
        self.play(Write(part_c_question), run_time=1.5)
        self.wait(1)
        
        # Setup equation
        eq = MathTex(
            "\\frac{64\\pi c^2}{15} = 2\\pi",
            font_size=36, color=C['eq']
        ).next_to(part_c_question, DOWN, buff=1)
        
        self.play(Write(eq), run_time=1.5)
        self.wait(0.5)
        
        # Simplify
        simplify = MathTex(
            "c^2 = \\frac{30}{64} = \\frac{15}{32}",
            font_size=36, color=C['eq']
        ).next_to(eq, DOWN, buff=0.8)
        
        self.play(Write(simplify), run_time=2)
        self.wait(0.5)
        
        # Final answer
        c_answer = MathTex(
            "c = \\frac{\\sqrt{30}}{8} \\approx 0.684",
            font_size=42, color=C['gold']
        ).next_to(simplify, DOWN, buff=0.8)
        
        self.play(Write(c_answer), run_time=1.5)
        
        c_box = SurroundingRectangle(c_answer, color=C['gold'], buff=0.3)
        self.play(Create(c_box), run_time=0.8)
        self.wait(2)
        
        # ═══════════════════════════════════════════════════
        # SCENE 6: SUMMARY
        # ═══════════════════════════════════════════════════
        
        self.play(
            FadeOut(part_c_label), FadeOut(part_c_question),
            FadeOut(eq), FadeOut(simplify),
            FadeOut(c_answer), FadeOut(c_box)
        )
        
        summary_title = Text("Summary", font="Lora", font_size=40, color=C['text'])
        summary_title.to_edge(UP, buff=1)
        
        summary = VGroup(
            MathTex("\\text{Area: } A = \\frac{8c}{3}", font_size=32, color=C['eq']),
            MathTex("\\text{Volume: } V = \\frac{64\\pi c^2}{15}", font_size=32, color=C['eq']),
            MathTex("\\text{When } V = 2\\pi: c = \\frac{\\sqrt{30}}{8}", font_size=32, color=C['gold']),
        ).arrange(DOWN, buff=0.8)
        
        summary.next_to(summary_title, DOWN, buff=1)
        
        self.play(FadeIn(summary_title), run_time=0.8)
        
        for item in summary:
            self.play(Write(item), run_time=1.5)
            self.wait(0.3)
        
        self.wait(3)
        
        # Fade out
        self.play(FadeOut(summary_title), FadeOut(summary))
        self.wait(1)
```

---

## STEP 5: Render the Video

**Command:**
```bash
# Preview (lower quality, faster)
manim -pql scenes/spinning_toy_scene.py SpinningToyScene

# High quality render
manim -pqh scenes/spinning_toy_scene.py SpinningToyScene

# Production (1080p)
manim --quality=h scenes/spinning_toy_scene.py SpinningToyScene
```

**Quality flags:**
- `-pql` = Preview, Quality Low (480p, faster)
- `-pqm` = Preview, Quality Medium (720p)
- `-pqh` = Preview, Quality High (1080p)

**Output location:**
```
media/videos/spinning_toy_scene/1080p60/SpinningToyScene.mp4
```

---

## STEP 6: Advanced Manim Features

### 3D Scenes

```python
from manim import *

class SolidOfRevolution(ThreeDScene):
    def construct(self):
        # Set up 3D camera
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

### Grouping and Alignment

```python
# Group objects
group = VGroup(obj1, obj2, obj3)

# Arrange vertically
group.arrange(DOWN, buff=0.5)

# Arrange horizontally
group.arrange(RIGHT, buff=0.5)

# Center on screen
group.move_to(ORIGIN)
group.center()

# Align edges
obj1.align_to(obj2, LEFT)
obj1.next_to(obj2, DOWN, buff=0.3)
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

### Custom Animations

```python
class DrawLine(Animation):
    def __init__(self, line, **kwargs):
        super().__init__(line, **kwargs)
        self.line = line
        
    def interpolate_mobject(self, alpha):
        # alpha goes from 0 to 1
        self.line.set_length(alpha * self.target_length)
```

---

## STEP 7: Complete Checklist

Before declaring success:

- [ ] Script markdown created with timing
- [ ] Python scene file created
- [ ] All MODIFY sections customized
- [ ] Colors match palette
- [ ] Test with `-pql` first
- [ ] High quality render successful
- [ ] Output file > 5MB
- [ ] Video plays correctly

---

## TROUBLESHOOTING

### "LaTeX compilation error"
**Solution:** Install TeX Live: `sudo apt-get install texlive-full`

### "Font not found"
**Solution:** Use system fonts or install them. Or use default LaTeX fonts.

### "ModuleNotFoundError: No module named 'manim'"
**Solution:** `pip install manim` in your virtual environment

### Video is blank/black
**Solution:** Check that you're calling `self.play()` or `self.add()` on mobjects

### Animations too fast/slow
**Solution:** Use `run_time` parameter: `self.play(..., run_time=3)`

### 3D scene doesn't rotate
**Solution:** Use `ThreeDScene` not `Scene`, call `set_camera_orientation()`

---

## EXAMPLE: COMPLETE FILE STRUCTURE

```
manim_project/
├── scenes/
│   ├── spinning_toy_scene.py
│   └── __init__.py
├── scripts/
│   └── spinning_toy_script.md
├── media/
│   └── videos/
│       └── spinning_toy_scene/
│           └── 1080p60/
│               └── SpinningToyScene.mp4
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
6. **TEST** with `manim -pql` (low quality preview)
7. **FIX** any errors
8. **RENDER** with `manim -pqh` (high quality)
9. **VERIFY** output file exists and plays

**Do NOT skip steps. Do NOT assume. Follow exactly.**

---

**Follow these steps exactly and the video will work.** 🎯

## Key Differences from Remotion

| Feature | Remotion | Manim |
|---------|----------|-------|
| Language | TypeScript/React | Python |
| Rendering | Browser-based | Python/OpenGL |
| Math | MathJax/Custom | LaTeX |
| 3D | Three.js | Built-in (OpenGL) |
| Animation | CSS/React | Timeline-based |
| Output | MP4 via headless Chrome | MP4 via ffmpeg |
| Learning curve | Higher (React knowledge) | Lower (Python only) |

**Manim is purpose-built for mathematical animations.** 3B1B uses it for a reason! 🎬
