# v4 Spinning Toy Script

## Scene Timing Reference
Manim uses `run_time` in seconds.

| Scene | Duration | Content |
|-------|----------|---------|
| Title | 5s | Title card |
| Setup | 10s | Problem context |
| Part A | 25s | Area question → setup → insight → work → answer |
| Part B | 25s | Volume question → disk method → work → answer |
| Part C | 20s | Solve for c → algebra → final answer |
| Summary | 5s | Key takeaways |

Total: ~90 seconds

---

## Scene 1: Title (0:00 - 0:05)
**Visual:** Title card with function
**Voiceover:** "The Spinning Toy Problem — 2017 AP Calculus AB, Free Response Question 5"
**Manim elements:** Title, Subtitle, MathTex with function

---

## Scene 2: Setup (0:05 - 0:15)
**[0:05 - 0:08]** "A company designs spinning toys from a family of curves."
**Visual:** Curve appears
**[0:08 - 0:11]** "The curve is y equals c times x times the square root of 4 minus x squared."
**[0:11 - 0:15]** "This region in the first quadrant spins around the x-axis to create each toy."

**Manim elements:** Axes, FunctionGraph, Area fill, Text labels

---

## Scene 3: Part A - Area (0:15 - 0:40)
**[0:15 - 0:18]** "Part A: Find the area of region R in terms of c."
**Visual:** Area integral setup
**[0:18 - 0:23]** "The area is the integral from 0 to 2 of c x root 4 minus x squared dx."
**[0:23 - 0:28]** "Here's the insight: use u-substitution. Let u equal 4 minus x squared."
**Visual:** Substitution highlighted
**[0:28 - 0:35]** "Then du equals negative 2x dx, so x dx equals negative one half du."
**[0:35 - 0:40]** "After changing limits and integrating, the area equals 8c over 3."

**Manim elements:** Integral equation, u-substitution box, step-by-step work, answer box

---

## Scene 4: Part B - Volume (0:40 - 1:05)
**[0:40 - 0:43]** "Part B: Find the volume when this region spins around the x-axis."
**Visual:** Disk method setup
**[0:43 - 0:48]** "Using the disk method: V equals pi times the integral of r squared dx."
**[0:48 - 0:53]** "Here, r equals c x root 4 minus x squared. Squaring gives c squared x squared times 4 minus x squared."
**[0:53 - 1:00]** "Expand to 4 x squared minus x to the fourth, then integrate term by term."
**[1:00 - 1:05]** "The volume equals 64 pi c squared over 15."

**Manim elements:** Disk formula, radius substitution, expanded integral, step work, final answer

---

## Scene 5: Part C - Solve for c (1:05 - 1:25)
**[1:05 - 1:08]** "Part C: Find c when the volume equals 2 pi."
**Visual:** Equation setup
**[1:08 - 1:13]** "Set 64 pi c squared over 15 equal to 2 pi."
**[1:13 - 1:18]** "Divide both sides by pi, then multiply by 15 over 64."
**[1:18 - 1:23]** "C squared equals 15 over 32, so c equals root 30 over 8."
**[1:23 - 1:25]** "Which is approximately 0.684."

**Manim elements:** Equation, algebraic steps, boxed answer

---

## Scene 6: Summary (1:25 - 1:30)
**[1:25 - 1:28]** "Key concepts: u-substitution, disk method, and solving for parameters."
**Visual:** Summary table with all three answers
**[1:28 - 1:30]** "The spinning toy problem — solved."

**Manim elements:** Summary table, fade out

---

## Animation Notes

1. **Colors:** Use dark background (#0e0f1a) with teal curve, gold highlights
2. **Timing:** Use 1-2s for equation reveals, 0.5s for highlights
3. **Transitions:** Fade between scenes, not hard cuts
4. **Text positioning:** Keep text on left, graphs on right to avoid overlap
5. **Math display:** Use Unicode text for no-LaTeX compatibility
