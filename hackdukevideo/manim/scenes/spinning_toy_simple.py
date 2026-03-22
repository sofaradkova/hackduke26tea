"""
Manim Scene: The Spinning Toy Problem (No-LaTeX Version)
Uses Text with Unicode instead of MathTex

ANTI-OVERLAP DESIGN:
- All graphics positioned on RIGHT side: axes.to_edge(RIGHT, buff=1.0)
- All text positioned on LEFT side: text.to_edge(LEFT, buff=1.5)
- All vertical stacking uses aligned_edge=LEFT
- Minimum buff values: 0.8 between elements, 1.0 from edges
- Reduced font sizes and element dimensions to prevent crowding
"""

from manim import *
import numpy as np


class SpinningToySimple(Scene):
    """Complete walkthrough without requiring LaTeX."""
    
    def construct(self):
        # ═══════════════════════════════════════════════════════════════════════
        # CONFIGURATION
        # ═══════════════════════════════════════════════════════════════════════
        self.camera.background_color = "#0e0f1a"
        
        # Color palette
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
        
        def spinning_func(x, c=1.0):
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
        
        # Use Text with Unicode sqrt symbol instead of MathTex
        func_text = Text(
            "y = c·x·√(4−x²)",
            font_size=44,
            color=C['gold']
        )
        
        title.to_edge(UP, buff=1.5)
        subtitle.next_to(title, DOWN, buff=0.6)
        func_text.next_to(subtitle, DOWN, buff=1.2)
        
        self.play(FadeIn(title), run_time=0.8)
        self.wait(0.3)
        self.play(FadeIn(subtitle), run_time=0.8)
        self.wait(0.5)
        self.play(Write(func_text), run_time=1.5)
        self.wait(2)
        
        self.play(
            FadeOut(title), FadeOut(subtitle), FadeOut(func_text),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 2: SETUP WITH GRAPH (STRICT ANTI-OVERLAP LAYOUT)
        # ═══════════════════════════════════════════════════════════════════════
        # GRAPHICS - RIGHT SIDE
        axes = Axes(
            x_range=[-0.5, 2.5, 0.5],
            y_range=[-0.5, 2.5, 0.5],
            x_length=5.5,  # Reduced from 7 to prevent overlap
            y_length=4.5,  # Reduced from 5
            axis_config={
                "color": C['dim'],
                "include_tip": True,
                "tip_length": 0.15,
            },
        )
        axes.to_edge(RIGHT, buff=1.0)  # STRICT: Keep graphics on right
        axes.shift(UP * 0.3)
        
        x_label = Text("x", font_size=24, color=C['dim'])
        y_label = Text("y", font_size=24, color=C['dim'])
        x_label.next_to(axes.x_axis.get_end(), DOWN, buff=0.3)
        y_label.next_to(axes.y_axis.get_end(), LEFT, buff=0.3)
        
        curve = axes.plot(
            lambda x: spinning_func(x, c=1.0),
            x_range=[0, 2],
            color=C['curve'],
            stroke_width=4
        )
        
        # TEXT - LEFT SIDE (STRICT: buff >= 1.5)
        context_text = Text(
            "A company designs spinning toys",
            font_size=24,
            color=C['text']
        )
        context_text2 = Text(
            "from a family of curves.",
            font_size=24,
            color=C['text']
        )
        
        context_group = VGroup(context_text, context_text2)
        context_group.arrange(DOWN, buff=0.5, aligned_edge=LEFT)
        context_group.to_edge(LEFT, buff=1.5)  # STRICT: 1.5 minimum
        context_group.to_edge(UP, buff=2.0)
        
        c_explain = Text(
            "The constant c controls the shape.",
            font_size=22,
            color=C['dim']
        )
        c_explain.next_to(context_group, DOWN, buff=0.8, aligned_edge=LEFT)
        
        region_text = Text(
            "Region R is in the first quadrant,",
            font_size=22,
            color=C['dim']
        )
        region_text2 = Text(
            "under the curve from x = 0 to x = 2.",
            font_size=22,
            color=C['dim']
        )
        region_group = VGroup(region_text, region_text2)
        region_group.arrange(DOWN, buff=0.4, aligned_edge=LEFT)
        region_group.next_to(c_explain, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Create(axes), run_time=1.5)
        self.play(Create(x_label), Create(y_label), run_time=0.6)
        
        self.play(Write(context_group), run_time=1.5)
        self.wait(0.3)
        self.play(Write(c_explain), run_time=1)
        self.wait(0.3)
        
        self.play(Create(curve), run_time=2)
        self.wait(0.5)
        
        self.play(Write(region_group), run_time=1.5)
        self.wait(0.5)
        
        region_fill = axes.get_area(
            curve,
            x_range=[0, 2],
            color=C['blue'],
            opacity=0.25
        )
        
        self.play(FadeIn(region_fill), run_time=1.5)
        self.wait(1.5)
        
        self.play(
            FadeOut(axes), FadeOut(curve), FadeOut(region_fill),
            FadeOut(context_group), FadeOut(c_explain),
            FadeOut(region_group), FadeOut(x_label), FadeOut(y_label),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 3: PART A - AREA (STRICT ANTI-OVERLAP)
        # ═══════════════════════════════════════════════════════════════════════
        part_a_label = Text("part (a)", font_size=20, color=C['dim'])
        part_a_label.to_edge(UP, buff=1.0)
        part_a_label.to_edge(LEFT, buff=1.5)  # STRICT
        
        part_a_question = Text(
            "Find the area of region R in terms of c.",
            font_size=28,
            color=C['text']
        )
        part_a_question.next_to(part_a_label, DOWN, buff=0.5, aligned_edge=LEFT)
        
        self.play(FadeIn(part_a_label), run_time=0.5)
        self.play(Write(part_a_question), run_time=1.5)
        self.wait(1)
        
        integral = Text(
            "A = ∫₀² c·x·√(4−x²) dx",
            font_size=32,
            color=C['eq']
        )
        integral.next_to(part_a_question, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(integral), run_time=2)
        self.wait(1)
        
        insight = Text(
            "Notice the x and the square root...",
            font_size=22,
            color=C['teal']
        )
        insight.next_to(integral, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(insight), run_time=1.2)
        self.wait(0.5)
        
        u_sub = Text("u = 4 − x²", font_size=28, color=C['gold'])
        du_line = Text("du = −2x dx", font_size=28, color=C['gold'])
        x_dx = Text("x dx = −½ du", font_size=28, color=C['gold'])
        
        sub_group = VGroup(u_sub, du_line, x_dx)
        sub_group.arrange(DOWN, buff=0.4, aligned_edge=LEFT)
        sub_group.next_to(insight, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(u_sub), run_time=1)
        self.wait(0.3)
        self.play(Write(du_line), run_time=1)
        self.wait(0.3)
        self.play(Write(x_dx), run_time=1)
        self.wait(1.5)
        
        self.play(
            FadeOut(part_a_label), FadeOut(part_a_question),
            FadeOut(insight), FadeOut(sub_group),
            run_time=0.6
        )
        
        # Transform to show work - all steps strictly left-aligned
        step1 = Text(
            "A = (c/2) ∫₀⁴ u^(1/2) du",
            font_size=30,
            color=C['eq']
        )
        step1.move_to(integral.get_center())
        
        self.play(ReplacementTransform(integral, step1), run_time=2)
        self.wait(0.5)
        
        step2 = Text(
            "A = (c/2) · (2/3) · u^(3/2) |₀⁴",
            font_size=28,
            color=C['eq']
        )
        step2.next_to(step1, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(step2), run_time=2)
        self.wait(0.5)
        
        answer = Text(
            "A = 8c/3",
            font_size=40,
            color=C['gold']
        )
        answer.next_to(step2, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(answer), run_time=1.5)
        
        answer_box = SurroundingRectangle(
            answer,
            color=C['gold'],
            buff=0.25,
            stroke_width=2
        )
        
        self.play(Create(answer_box), run_time=0.8)
        self.wait(2)
        
        self.play(
            FadeOut(step1), FadeOut(step2),
            FadeOut(answer), FadeOut(answer_box),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 4: PART B - VOLUME (STRICT ANTI-OVERLAP)
        # ═══════════════════════════════════════════════════════════════════════
        # TEXT - LEFT SIDE
        part_b_label = Text("part (b)", font_size=20, color=C['dim'])
        part_b_label.to_edge(UP, buff=1.0)
        part_b_label.to_edge(LEFT, buff=1.5)  # STRICT
        
        part_b_question = Text(
            "Find the volume when revolved",
            font_size=26,
            color=C['text']
        )
        part_b_question2 = Text(
            "about the x-axis.",
            font_size=26,
            color=C['text']
        )
        part_b_group = VGroup(part_b_question, part_b_question2)
        part_b_group.arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        part_b_group.next_to(part_b_label, DOWN, buff=0.5, aligned_edge=LEFT)
        
        self.play(FadeIn(part_b_label), run_time=0.5)
        self.play(Write(part_b_group), run_time=1.5)
        self.wait(1)
        
        # GRAPHICS - RIGHT SIDE (smaller to prevent overlap)
        axes2 = Axes(
            x_range=[-0.5, 2.5, 0.5],
            y_range=[-2.5, 2.5, 0.5],
            x_length=4.5,  # Reduced from 5
            y_length=3.5,  # Reduced from 4
            axis_config={
                "color": C['dim'],
                "include_tip": True,
            },
        )
        axes2.to_edge(RIGHT, buff=1.0)  # STRICT
        axes2.shift(UP * 0.3)
        
        curve2 = axes2.plot(
            lambda x: spinning_func(x, c=1.0),
            x_range=[0, 2],
            color=C['curve'],
            stroke_width=3
        )
        
        self.play(Create(axes2), run_time=1)
        self.play(Create(curve2), run_time=1.5)
        
        # Draw disks (fewer, smaller)
        disks = VGroup()
        x_positions = [0.5, 1.0, 1.5]  # Reduced from 5 to 3 disks
        
        for x_pos in x_positions:
            r = spinning_func(x_pos, c=1.0)
            disk_line = Line(
                axes2.c2p(x_pos, -r),
                axes2.c2p(x_pos, r),
                color=C['gold'],
                stroke_width=3
            )
            disks.add(disk_line)
            self.play(Create(disk_line), run_time=0.5)
        
        self.wait(0.5)
        
        # Equation below question, strictly left-aligned
        volume_eq = Text(
            "V = π ∫₀² [c·x·√(4−x²)]² dx",
            font_size=24,  # Reduced from 30
            color=C['eq']
        )
        volume_eq.scale(0.9)  # Scale down if too wide
        volume_eq.next_to(part_b_group, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(volume_eq), run_time=2)
        self.wait(0.5)
        
        self.play(
            FadeOut(axes2), FadeOut(curve2), FadeOut(disks),
            run_time=0.6
        )
        
        # All volume steps strictly left-aligned with proper buff
        vol_step1 = Text(
            "V = πc² ∫₀² (4x² − x⁴) dx",
            font_size=26,
            color=C['eq']
        )
        vol_step1.move_to(volume_eq.get_center())
        
        self.play(ReplacementTransform(volume_eq, vol_step1), run_time=2)
        self.wait(0.5)
        
        vol_step2 = Text(
            "V = πc² [4x³/3 − x⁵/5]₀²",
            font_size=24,
            color=C['eq']
        )
        vol_step2.next_to(vol_step1, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(vol_step2), run_time=2)
        self.wait(0.5)
        
        vol_step3 = Text(
            "V = πc² · 32 · (1/3 − 1/5)",
            font_size=24,
            color=C['eq']
        )
        vol_step3.next_to(vol_step2, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(vol_step3), run_time=1.5)
        self.wait(0.5)
        
        vol_answer = Text(
            "V = 64πc²/15",
            font_size=36,
            color=C['gold']
        )
        vol_answer.next_to(vol_step3, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(vol_answer), run_time=1.5)
        
        vol_box = SurroundingRectangle(
            vol_answer,
            color=C['gold'],
            buff=0.25
        )
        
        self.play(Create(vol_box), run_time=0.8)
        self.wait(2)
        
        self.play(
            FadeOut(part_b_label), FadeOut(part_b_question),
            FadeOut(vol_step1), FadeOut(vol_step2), FadeOut(vol_step3),
            FadeOut(vol_answer), FadeOut(vol_box),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 5: PART C - SOLVE FOR C (STRICT ANTI-OVERLAP)
        # ═══════════════════════════════════════════════════════════════════════
        part_c_label = Text("part (c)", font_size=20, color=C['dim'])
        part_c_label.to_edge(UP, buff=1.0)
        part_c_label.to_edge(LEFT, buff=1.5)  # STRICT
        
        part_c_question = Text(
            "Find c when volume equals 2π.",
            font_size=28,
            color=C['text']
        )
        part_c_question.next_to(part_c_label, DOWN, buff=0.5, aligned_edge=LEFT)
        
        self.play(FadeIn(part_c_label), run_time=0.5)
        self.play(Write(part_c_question), run_time=1.5)
        self.wait(1)
        
        # All equations strictly left-aligned with buff >= 0.8
        eq = Text(
            "64πc²/15 = 2π",
            font_size=32,
            color=C['eq']
        )
        eq.next_to(part_c_question, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(eq), run_time=1.5)
        self.wait(0.5)
        
        eq2 = Text(
            "64c²/15 = 2",
            font_size=32,
            color=C['eq']
        )
        eq2.next_to(eq, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(eq2), run_time=1.5)
        self.wait(0.5)
        
        eq3 = Text(
            "c² = 30/64 = 15/32",
            font_size=32,
            color=C['eq']
        )
        eq3.next_to(eq2, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(eq3), run_time=2)
        self.wait(0.5)
        
        c_answer = Text(
            "c = √30/8 ≈ 0.684",
            font_size=36,
            color=C['gold']
        )
        c_answer.next_to(eq3, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(c_answer), run_time=1.5)
        
        c_box = SurroundingRectangle(
            c_answer,
            color=C['gold'],
            buff=0.25
        )
        
        self.play(Create(c_box), run_time=0.8)
        self.wait(2)
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 6: SUMMARY
        # ═══════════════════════════════════════════════════════════════════════
        self.play(
            FadeOut(part_c_label), FadeOut(part_c_question),
            FadeOut(eq), FadeOut(eq2), FadeOut(eq3),
            run_time=0.6
        )
        
        self.wait(0.5)
        self.play(
            FadeOut(c_answer), FadeOut(c_box),
            run_time=0.5
        )
        
        summary_title = Text(
            "Summary",
            font_size=38,
            color=C['text'],
            weight=BOLD
        )
        summary_title.to_edge(UP, buff=1.5)
        summary_title.to_edge(LEFT, buff=1.5)  # STRICT
        
        summary_items = VGroup(
            Text("Area: A = 8c/3 in²", font_size=30, color=C['eq']),
            Text("Volume: V = 64πc²/15 in³", font_size=30, color=C['eq']),
            Text("When V = 2π: c = √30/8", font_size=30, color=C['gold']),
        )
        
        summary_items.arrange(DOWN, buff=0.8, aligned_edge=LEFT)
        summary_items.next_to(summary_title, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(FadeIn(summary_title), run_time=0.8)
        
        for item in summary_items:
            self.play(Write(item), run_time=1.5)
            self.wait(0.3)
        
        self.wait(3)
        
        self.play(
            FadeOut(summary_title), FadeOut(summary_items),
            run_time=1
        )
        
        self.wait(1)


if __name__ == "__main__":
    pass
