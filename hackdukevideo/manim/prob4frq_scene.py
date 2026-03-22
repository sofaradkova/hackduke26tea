from manim import *
import numpy as np


class Prob4FRQScene(Scene):
    """Complete walkthrough of 2019 AP Calculus AB FRQ #4 - Cylindrical Barrel."""
    
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
            'red': '#f06c6c',
            'green': '#7ecf7e',
        }
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 1: TITLE CARD
        # ═══════════════════════════════════════════════════════════════════════
        title = Text(
            "Cylindrical Barrel Problem",
            font_size=44,
            color=C['text'],
            weight=BOLD
        )
        
        subtitle = Text(
            "2019 AP Calculus AB · Free Response, Question 4",
            font_size=24,
            color=C['dim']
        )
        
        func_text = Text(
            "dh/dt = −(1/10)·√h",
            font_size=40,
            color=C['gold']
        )
        
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
        # SCENE 2: SETUP WITH CYLINDER DIAGRAM
        # ═══════════════════════════════════════════════════════════════════════
        
        # Create cylinder representation
        cylinder_top = Ellipse(width=2, height=0.5, color=C['blue'], fill_opacity=0.3)
        cylinder_bottom = Ellipse(width=2, height=0.5, color=C['blue'])
        cylinder_body = Rectangle(width=2, height=3, color=C['blue'])
        
        cylinder_bottom.move_to(DOWN * 1.5)
        cylinder_top.move_to(UP * 1.5)
        cylinder_body.move_to(ORIGIN)
        
        # Water fill (partial cylinder)
        water_top = Ellipse(width=1.8, height=0.45, color=C['teal'], fill_opacity=0.6)
        water_body = Rectangle(width=1.8, height=2, color=C['teal'], fill_opacity=0.4)
        
        water_body.move_to(DOWN * 0.5)
        water_top.move_to(UP * 0.5)
        
        # Cylinder lines (sides)
        left_line = Line(start=(-1, -1.5, 0), end=(-1, 1.5, 0), color=C['blue'])
        right_line = Line(start=(1, -1.5, 0), end=(1, 1.5, 0), color=C['blue'])
        
        cylinder_group = VGroup(
            cylinder_bottom, cylinder_body, cylinder_top,
            left_line, right_line, water_body, water_top
        )
        
        # Position cylinder to RIGHT with more space (anti-overlap)
        cylinder_group.to_edge(RIGHT, buff=3.0)
        cylinder_group.shift(UP * 0.5)
        
        # Labels - positioned to the LEFT of the cylinder to avoid cutoff
        radius_label = Text("r = 1 ft", font_size=20, color=C['dim'])
        radius_line = Line(start=(-1, -1.5, 0), end=(0, -1.5, 0), color=C['dim'])
        radius_label.next_to(radius_line, DOWN, buff=0.2)
        
        height_label = Text("h", font_size=24, color=C['gold'])
        height_arrow = Arrow(start=(-1.3, -1.5, 0), end=(-1.3, 0.5, 0), color=C['gold'], buff=0.1)
        height_label.next_to(height_arrow, LEFT, buff=0.2)
        
        labels_group = VGroup(radius_label, radius_line, height_label, height_arrow)
        labels_group.next_to(cylinder_group, LEFT, buff=0.3)
        
        # Text on LEFT side (anti-overlap)
        context_text1 = Text(
            "A cylindrical barrel with",
            font_size=26,
            color=C['text']
        )
        context_text2 = Text(
            "diameter 2 feet collects",
            font_size=26,
            color=C['text']
        )
        context_text3 = Text(
            "rainwater. Water drains",
            font_size=26,
            color=C['text']
        )
        context_text4 = Text(
            "through a valve at the bottom.",
            font_size=26,
            color=C['text']
        )
        
        context_group = VGroup(context_text1, context_text2, context_text3, context_text4)
        context_group.arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        context_group.to_edge(LEFT, buff=1.5)
        context_group.to_edge(UP, buff=2)
        
        # Rate equation
        rate_text = Text(
            "Rate: dh/dt = −(1/10)·√h",
            font_size=30,
            color=C['gold']
        )
        rate_text.next_to(context_group, DOWN, buff=1.0, aligned_edge=LEFT)
        
        volume_text = Text(
            "Volume: V = πr²h = πh",
            font_size=26,
            color=C['teal']
        )
        volume_text.next_to(rate_text, DOWN, buff=0.6, aligned_edge=LEFT)
        
        # Animate
        self.play(Write(context_group), run_time=2)
        self.wait(0.5)
        
        # Draw cylinder
        self.play(Create(cylinder_bottom), run_time=0.5)
        self.play(Create(left_line), Create(right_line), run_time=0.5)
        self.play(Create(cylinder_top), run_time=0.5)
        self.play(FadeIn(water_body), FadeIn(water_top), run_time=1)
        
        self.play(Write(rate_text), run_time=1.5)
        self.play(Write(volume_text), run_time=1.5)
        self.wait(0.5)
        
        self.play(Create(labels_group), run_time=1)
        self.wait(2)
        
        # Clear
        self.play(
            FadeOut(cylinder_group), FadeOut(labels_group),
            FadeOut(context_group), FadeOut(rate_text), FadeOut(volume_text),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 3: PART A - RATE OF CHANGE OF VOLUME
        # ═══════════════════════════════════════════════════════════════════════
        
        part_a_label = Text(
            "part (a)",
            font_size=20,
            color=C['dim']
        )
        part_a_question = Text(
            "Find dV/dt when h = 4 feet.",
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
        
        # Setup equations with spacing
        step1 = Text(
            "V = πh  (since r = 1)",
            font_size=28,
            color=C['eq']
        )
        step1.next_to(part_a_question, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(step1), run_time=1.5)
        self.wait(0.5)
        
        step2 = Text(
            "dV/dt = π · dh/dt",
            font_size=28,
            color=C['eq']
        )
        step2.next_to(step1, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(step2), run_time=1.5)
        self.wait(0.5)
        
        step3 = Text(
            "dV/dt = π · (−1/10)·√h",
            font_size=28,
            color=C['eq']
        )
        step3.next_to(step2, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(step3), run_time=1.5)
        self.wait(0.5)
        
        step4 = Text(
            "At h = 4:",
            font_size=26,
            color=C['dim']
        )
        step4.next_to(step3, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(step4), run_time=1)
        
        step5 = Text(
            "dV/dt = −π/10 · √4 = −π/5",
            font_size=30,
            color=C['gold']
        )
        step5.next_to(step4, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(step5), run_time=1.5)
        
        # Box the answer
        answer_box = SurroundingRectangle(
            step5,
            color=C['gold'],
            buff=0.25,
            stroke_width=2
        )
        
        self.play(Create(answer_box), run_time=0.8)
        
        units = Text(
            "ft³/sec",
            font_size=24,
            color=C['dim']
        )
        units.next_to(step5, RIGHT, buff=0.5)
        
        self.play(Write(units), run_time=0.8)
        self.wait(2)
        
        # Clear
        self.play(
            FadeOut(part_a_label), FadeOut(part_a_question),
            FadeOut(step1), FadeOut(step2), FadeOut(step3),
            FadeOut(step4), FadeOut(step5), FadeOut(answer_box),
            FadeOut(units),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 4: PART B - INCREASING OR DECREASING
        # ═══════════════════════════════════════════════════════════════════════
        
        part_b_label = Text(
            "part (b)",
            font_size=20,
            color=C['dim']
        )
        part_b_question = Text(
            "At h = 3, is dh/dt increasing or decreasing?",
            font_size=28,
            color=C['text']
        )
        
        part_b_label.to_edge(UP, buff=1)
        part_b_label.to_edge(LEFT, buff=1.5)
        part_b_question.next_to(part_b_label, DOWN, buff=0.4, aligned_edge=LEFT)
        
        self.play(FadeIn(part_b_label), run_time=0.5)
        self.play(Write(part_b_question), run_time=1.5)
        self.wait(1)
        
        # Find second derivative
        b_step1 = Text(
            "We need d²h/dt²",
            font_size=28,
            color=C['eq']
        )
        b_step1.next_to(part_b_question, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(b_step1), run_time=1.5)
        self.wait(0.5)
        
        b_step2 = Text(
            "dh/dt = −(1/10)·h^(1/2)",
            font_size=28,
            color=C['eq']
        )
        b_step2.next_to(b_step1, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(b_step2), run_time=1.5)
        self.wait(0.5)
        
        b_step3 = Text(
            "d²h/dt² = −(1/10)·(1/2)·h^(−1/2)·dh/dt",
            font_size=26,
            color=C['eq']
        )
        b_step3.next_to(b_step2, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(b_step3), run_time=1.5)
        self.wait(0.5)
        
        b_step4 = Text(
            "At h = 3: dh/dt = −(1/10)·√3 < 0",
            font_size=26,
            color=C['eq']
        )
        b_step4.next_to(b_step3, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(b_step4), run_time=1.5)
        self.wait(0.5)
        
        b_step5 = Text(
            "d²h/dt² = −(1/20)·(1/√3)·(negative)",
            font_size=26,
            color=C['eq']
        )
        b_step5.next_to(b_step4, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(b_step5), run_time=1.5)
        self.wait(0.5)
        
        conclusion = Text(
            "d²h/dt² > 0  →  dh/dt is INCREASING",
            font_size=32,
            color=C['green']
        )
        conclusion.next_to(b_step5, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(conclusion), run_time=1.5)
        
        conclusion_box = SurroundingRectangle(
            conclusion,
            color=C['green'],
            buff=0.25,
            stroke_width=2
        )
        
        self.play(Create(conclusion_box), run_time=0.8)
        self.wait(2)
        
        # Clear
        self.play(
            FadeOut(part_b_label), FadeOut(part_b_question),
            FadeOut(b_step1), FadeOut(b_step2), FadeOut(b_step3),
            FadeOut(b_step4), FadeOut(b_step5), FadeOut(conclusion),
            FadeOut(conclusion_box),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 5: PART C - SEPARATION OF VARIABLES
        # ═══════════════════════════════════════════════════════════════════════
        
        part_c_label = Text(
            "part (c)",
            font_size=20,
            color=C['dim']
        )
        part_c_question = Text(
            "Find h(t) given h(0) = 5",
            font_size=30,
            color=C['text']
        )
        
        part_c_label.to_edge(UP, buff=1)
        part_c_label.to_edge(LEFT, buff=1.5)
        part_c_question.next_to(part_c_label, DOWN, buff=0.4, aligned_edge=LEFT)
        
        self.play(FadeIn(part_c_label), run_time=0.5)
        self.play(Write(part_c_question), run_time=1.5)
        self.wait(1)
        
        # Separation of variables
        c_step1 = Text(
            "dh/dt = −(1/10)·√h",
            font_size=28,
            color=C['eq']
        )
        c_step1.next_to(part_c_question, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(c_step1), run_time=1.5)
        self.wait(0.5)
        
        c_step2 = Text(
            "dh/√h = −(1/10)·dt",
            font_size=28,
            color=C['eq']
        )
        c_step2.next_to(c_step1, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(c_step2), run_time=1.5)
        self.wait(0.5)
        
        c_step3 = Text(
            "∫ h^(−1/2) dh = ∫ −(1/10) dt",
            font_size=28,
            color=C['eq']
        )
        c_step3.next_to(c_step2, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(c_step3), run_time=1.5)
        self.wait(0.5)
        
        c_step4 = Text(
            "2·√h = −(1/10)·t + C",
            font_size=28,
            color=C['eq']
        )
        c_step4.next_to(c_step3, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(c_step4), run_time=1.5)
        self.wait(0.5)
        
        c_step5 = Text(
            "At t=0, h=5: 2·√5 = C",
            font_size=26,
            color=C['dim']
        )
        c_step5.next_to(c_step4, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(c_step5), run_time=1.5)
        self.wait(0.5)
        
        c_step6 = Text(
            "√h = √5 − t/20",
            font_size=30,
            color=C['eq']
        )
        c_step6.next_to(c_step5, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(c_step6), run_time=1.5)
        self.wait(0.5)
        
        final_answer = Text(
            "h(t) = (√5 − t/20)²",
            font_size=36,
            color=C['gold']
        )
        final_answer.next_to(c_step6, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(final_answer), run_time=1.5)
        
        final_box = SurroundingRectangle(
            final_answer,
            color=C['gold'],
            buff=0.25,
            stroke_width=2
        )
        
        self.play(Create(final_box), run_time=0.8)
        self.wait(2)
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 6: SUMMARY
        # ═══════════════════════════════════════════════════════════════════════
        self.play(
            FadeOut(part_c_label), FadeOut(part_c_question),
            FadeOut(c_step1), FadeOut(c_step2), FadeOut(c_step3),
            FadeOut(c_step4), FadeOut(c_step5), FadeOut(c_step6),
            FadeOut(final_answer), FadeOut(final_box),
            run_time=0.8
        )
        
        summary_title = Text(
            "Summary",
            font_size=40,
            color=C['text'],
            weight=BOLD
        )
        summary_title.to_edge(UP, buff=1.5)
        
        self.play(Write(summary_title), run_time=1)
        
        summary_a = Text(
            "(a) dV/dt = −π/5 ft³/sec",
            font_size=28,
            color=C['blue']
        )
        summary_b = Text(
            "(b) dh/dt is increasing",
            font_size=28,
            color=C['green']
        )
        summary_c = Text(
            "(c) h(t) = (√5 − t/20)²",
            font_size=28,
            color=C['gold']
        )
        
        summary_group = VGroup(summary_a, summary_b, summary_c)
        summary_group.arrange(DOWN, buff=0.8, aligned_edge=LEFT)
        summary_group.next_to(summary_title, DOWN, buff=1.5)
        summary_group.to_edge(LEFT, buff=1.5)
        
        self.play(Write(summary_a), run_time=1)
        self.play(Write(summary_b), run_time=1)
        self.play(Write(summary_c), run_time=1)
        self.wait(3)


if __name__ == "__main__":
    pass
