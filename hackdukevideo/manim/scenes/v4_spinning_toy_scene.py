from manim import *
import numpy as np


class v4SpinningToyScene(Scene):
    """v4 complete walkthrough of the spinning toy problem with animations."""
    
    def construct(self):
        # ═══════════════════════════════════════════════════════════════════════
        # v4 CONFIGURATION
        # ═══════════════════════════════════════════════════════════════════════
        self.camera.background_color = "#0e0f1a"  # Dark background
        
        # v4 Color palette (3B1B style)
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
        
        # v4 Function definition
        def v4_spinning_func(x, c=1.0):
            """The curve function y = c*x*sqrt(4-x^2)."""
            if x < 0 or x > 2:
                return 0
            return c * x * np.sqrt(max(0, 4 - x**2))
        
        # ═══════════════════════════════════════════════════════════════════════
        # v4 SCENE 1: TITLE CARD
        # ═══════════════════════════════════════════════════════════════════════
        v4_title = Text(
            "The Spinning Toy Problem",
            font_size=48,
            color=C['text'],
            weight=BOLD
        )
        
        v4_subtitle = Text(
            "2017 AP Calculus AB · Free Response, Question 5",
            font_size=24,
            color=C['dim']
        )
        
        # v4 Unicode text (NO LaTeX needed)
        v4_func_text = Text(
            "y = c·x·√(4−x²)",
            font_size=44,
            color=C['gold']
        )
        
        # v4 Positioning (anti-overlap)
        v4_title.to_edge(UP, buff=1.5)
        v4_subtitle.next_to(v4_title, DOWN, buff=0.6)
        v4_func_text.next_to(v4_subtitle, DOWN, buff=1.2)
        
        # v4 Animate title
        self.play(FadeIn(v4_title), run_time=0.8)
        self.wait(0.3)
        self.play(FadeIn(v4_subtitle), run_time=0.8)
        self.wait(0.5)
        self.play(Write(v4_func_text), run_time=1.5)
        self.wait(2)
        
        # v4 Clear title
        self.play(
            FadeOut(v4_title), FadeOut(v4_subtitle), FadeOut(v4_func_text),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # v4 SCENE 2: SETUP WITH GRAPH
        # ═══════════════════════════════════════════════════════════════════════
        
        # v4 Create axes
        v4_axes = Axes(
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
        
        # v4 Position axes to right
        v4_axes.to_edge(RIGHT, buff=1)
        
        # v4 Axis labels
        v4_x_label = Text("x", font_size=28, color=C['dim'])
        v4_y_label = Text("y", font_size=28, color=C['dim'])
        v4_x_label.next_to(v4_axes.x_axis.get_end(), DOWN, buff=0.2)
        v4_y_label.next_to(v4_axes.y_axis.get_end(), LEFT, buff=0.2)
        
        # v4 Plot the curve
        v4_curve = v4_axes.plot(
            lambda x: v4_spinning_func(x, c=1.0),
            x_range=[0, 2],
            color=C['curve'],
            stroke_width=4
        )
        
        # v4 Text on left side
        v4_context_text = Text(
            "A company designs spinning toys",
            font_size=26,
            color=C['text']
        )
        v4_context_text2 = Text(
            "from a family of curves.",
            font_size=26,
            color=C['text']
        )
        
        v4_context_group = VGroup(v4_context_text, v4_context_text2)
        v4_context_group.arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        v4_context_group.to_edge(LEFT, buff=1)
        v4_context_group.to_edge(UP, buff=2)
        
        # v4 Animate setup
        self.play(Create(v4_axes), run_time=1.5)
        self.play(Create(v4_x_label), Create(v4_y_label), run_time=0.6)
        
        self.play(Write(v4_context_group), run_time=1.5)
        self.wait(0.3)
        
        # v4 Draw curve
        self.play(Create(v4_curve), run_time=2)
        self.wait(1)
        
        # v4 Fill region
        v4_region_fill = v4_axes.get_area(
            v4_curve,
            x_range=[0, 2],
            color=C['blue'],
            opacity=0.25
        )
        
        self.play(FadeIn(v4_region_fill), run_time=1.5)
        self.wait(1.5)
        
        # v4 Clear setup
        self.play(
            FadeOut(v4_axes), FadeOut(v4_curve), FadeOut(v4_region_fill),
            FadeOut(v4_context_group), FadeOut(v4_x_label), FadeOut(v4_y_label),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # v4 SCENE 3: PART A - AREA
        # ═══════════════════════════════════════════════════════════════════════
        
        v4_part_a_label = Text(
            "part (a)",
            font_size=20,
            color=C['dim']
        )
        v4_part_a_question = Text(
            "Find the area of region R in terms of c.",
            font_size=32,
            color=C['text']
        )
        
        # v4 Anti-overlap positioning
        v4_part_a_label.to_edge(UP, buff=1)
        v4_part_a_label.to_edge(LEFT, buff=1.5)
        v4_part_a_question.next_to(v4_part_a_label, DOWN, buff=0.4, aligned_edge=LEFT)
        
        self.play(FadeIn(v4_part_a_label), run_time=0.5)
        self.play(Write(v4_part_a_question), run_time=1.5)
        self.wait(1)
        
        # v4 Setup integral
        v4_integral = Text(
            "A = ∫₀² c·x·√(4−x²) dx",
            font_size=38,
            color=C['eq']
        )
        v4_integral.next_to(v4_part_a_question, DOWN, buff=1.2, aligned_edge=LEFT)
        
        self.play(Write(v4_integral), run_time=2)
        self.wait(1)
        
        # v4 Substitution hint
        v4_sub_hint = Text(
            "u-substitution: let u = 4 − x²",
            font_size=28,
            color=C['teal']
        )
        v4_sub_hint.next_to(v4_integral, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(FadeIn(v4_sub_hint), run_time=1)
        self.wait(1)
        
        # v4 Substitution details
        v4_sub_details = Text(
            "du = −2x·dx  →  x·dx = −½·du",
            font_size=26,
            color=C['dim']
        )
        v4_sub_details.next_to(v4_sub_hint, DOWN, buff=0.5, aligned_edge=LEFT)
        
        self.play(Write(v4_sub_details), run_time=1.5)
        self.wait(1.5)
        
        # v4 Final answer for part A
        v4_answer_a = Text(
            "A = 8c/3",
            font_size=44,
            color=C['gold']
        )
        v4_answer_a.next_to(v4_sub_details, DOWN, buff=1.2, aligned_edge=LEFT)
        
        self.play(Write(v4_answer_a), run_time=1.5)
        
        v4_answer_box_a = SurroundingRectangle(
            v4_answer_a,
            color=C['gold'],
            buff=0.25,
            stroke_width=2
        )
        
        self.play(Create(v4_answer_box_a), run_time=0.8)
        self.wait(2)
        
        # v4 Clear part A
        self.play(
            FadeOut(v4_part_a_label), FadeOut(v4_part_a_question),
            FadeOut(v4_integral), FadeOut(v4_sub_hint),
            FadeOut(v4_sub_details), FadeOut(v4_answer_a),
            FadeOut(v4_answer_box_a),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # v4 SCENE 4: PART B - VOLUME
        # ═══════════════════════════════════════════════════════════════════════
        
        v4_part_b_label = Text(
            "part (b)",
            font_size=20,
            color=C['dim']
        )
        v4_part_b_question = Text(
            "Find the volume of the solid in terms of c.",
            font_size=32,
            color=C['text']
        )
        
        v4_part_b_label.to_edge(UP, buff=1)
        v4_part_b_label.to_edge(LEFT, buff=1.5)
        v4_part_b_question.next_to(v4_part_b_label, DOWN, buff=0.4, aligned_edge=LEFT)
        
        self.play(FadeIn(v4_part_b_label), run_time=0.5)
        self.play(Write(v4_part_b_question), run_time=1.5)
        self.wait(1)
        
        # v4 Disk method formula
        v4_disk_formula = Text(
            "Disk Method: V = π ∫₀² [f(x)]² dx",
            font_size=32,
            color=C['eq']
        )
        v4_disk_formula.next_to(v4_part_b_question, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(v4_disk_formula), run_time=1.5)
        self.wait(1)
        
        # v4 Volume setup
        v4_volume_eq = Text(
            "V = π ∫₀² c²x²(4−x²) dx",
            font_size=34,
            color=C['teal']
        )
        v4_volume_eq.next_to(v4_disk_formula, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(v4_volume_eq), run_time=1.5)
        self.wait(1)
        
        # v4 Expand
        v4_expand = Text(
            "= πc² ∫₀² (4x² − x⁴) dx",
            font_size=34,
            color=C['eq']
        )
        v4_expand.next_to(v4_volume_eq, DOWN, buff=0.6, aligned_edge=LEFT)
        
        self.play(Write(v4_expand), run_time=1.5)
        self.wait(1)
        
        # v4 Integrate
        v4_integrate = Text(
            "= πc² [4x³/3 − x⁵/5]₀²",
            font_size=32,
            color=C['dim']
        )
        v4_integrate.next_to(v4_expand, DOWN, buff=0.6, aligned_edge=LEFT)
        
        self.play(Write(v4_integrate), run_time=1.5)
        self.wait(1)
        
        # v4 Final answer for part B
        v4_answer_b = Text(
            "V = 64πc²/15",
            font_size=44,
            color=C['gold']
        )
        v4_answer_b.next_to(v4_integrate, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(v4_answer_b), run_time=1.5)
        
        v4_answer_box_b = SurroundingRectangle(
            v4_answer_b,
            color=C['gold'],
            buff=0.25,
            stroke_width=2
        )
        
        self.play(Create(v4_answer_box_b), run_time=0.8)
        self.wait(2)
        
        # v4 Clear part B
        self.play(
            FadeOut(v4_part_b_label), FadeOut(v4_part_b_question),
            FadeOut(v4_disk_formula), FadeOut(v4_volume_eq),
            FadeOut(v4_expand), FadeOut(v4_integrate),
            FadeOut(v4_answer_b), FadeOut(v4_answer_box_b),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # v4 SCENE 5: PART C - SOLVE FOR C
        # ═══════════════════════════════════════════════════════════════════════
        
        v4_part_c_label = Text(
            "part (c)",
            font_size=20,
            color=C['dim']
        )
        v4_part_c_question = Text(
            "Find c when the volume equals 2π.",
            font_size=32,
            color=C['text']
        )
        
        v4_part_c_label.to_edge(UP, buff=1)
        v4_part_c_label.to_edge(LEFT, buff=1.5)
        v4_part_c_question.next_to(v4_part_c_label, DOWN, buff=0.4, aligned_edge=LEFT)
        
        self.play(FadeIn(v4_part_c_label), run_time=0.5)
        self.play(Write(v4_part_c_question), run_time=1.5)
        self.wait(1)
        
        # v4 Setup equation
        v4_eq_setup = Text(
            "64πc²/15 = 2π",
            font_size=38,
            color=C['eq']
        )
        v4_eq_setup.next_to(v4_part_c_question, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(v4_eq_setup), run_time=1.5)
        self.wait(1)
        
        # v4 Divide by pi
        v4_divide = Text(
            "÷π:  64c²/15 = 2",
            font_size=34,
            color=C['teal']
        )
        v4_divide.next_to(v4_eq_setup, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(v4_divide), run_time=1.2)
        self.wait(0.8)
        
        # v4 Solve for c²
        v4_solve_c2 = Text(
            "c² = 30/64 = 15/32",
            font_size=34,
            color=C['dim']
        )
        v4_solve_c2.next_to(v4_divide, DOWN, buff=0.6, aligned_edge=LEFT)
        
        self.play(Write(v4_solve_c2), run_time=1.2)
        self.wait(0.8)
        
        # v4 Final answer for part C
        v4_answer_c = Text(
            "c = √30/8 ≈ 0.684",
            font_size=44,
            color=C['gold']
        )
        v4_answer_c.next_to(v4_solve_c2, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(v4_answer_c), run_time=1.5)
        
        v4_answer_box_c = SurroundingRectangle(
            v4_answer_c,
            color=C['gold'],
            buff=0.25,
            stroke_width=2
        )
        
        self.play(Create(v4_answer_box_c), run_time=0.8)
        self.wait(2)
        
        # v4 Clear part C
        self.play(
            FadeOut(v4_part_c_label), FadeOut(v4_part_c_question),
            FadeOut(v4_eq_setup), FadeOut(v4_divide),
            FadeOut(v4_solve_c2), FadeOut(v4_answer_c),
            FadeOut(v4_answer_box_c),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # v4 SCENE 6: SUMMARY
        # ═══════════════════════════════════════════════════════════════════════
        
        v4_summary_title = Text(
            "Summary",
            font_size=40,
            color=C['text'],
            weight=BOLD
        )
        v4_summary_title.to_edge(UP, buff=1.5)
        
        self.play(FadeIn(v4_summary_title), run_time=0.8)
        
        # v4 Summary table
        v4_table_title = Text(
            "Spinning Toy Problem Results",
            font_size=28,
            color=C['teal']
        )
        v4_table_title.next_to(v4_summary_title, DOWN, buff=1.0)
        
        v4_row_a = Text(
            "Part (a) Area:       A = 8c/3",
            font_size=26,
            color=C['eq']
        )
        v4_row_b = Text(
            "Part (b) Volume:     V = 64πc²/15",
            font_size=26,
            color=C['eq']
        )
        v4_row_c = Text(
            "Part (c) Value of c: c = √30/8",
            font_size=26,
            color=C['eq']
        )
        
        v4_table_group = VGroup(v4_table_title, v4_row_a, v4_row_b, v4_row_c)
        v4_table_group.arrange(DOWN, buff=0.6, aligned_edge=LEFT)
        v4_table_group.next_to(v4_summary_title, DOWN, buff=1.0)
        
        self.play(Write(v4_table_group), run_time=2.5)
        self.wait(1)
        
        # v4 Key concepts
        v4_concepts = Text(
            "Key concepts: u-substitution · disk method · solving for parameters",
            font_size=22,
            color=C['dim']
        )
        v4_concepts.next_to(v4_table_group, DOWN, buff=1.2)
        
        self.play(FadeIn(v4_concepts), run_time=1)
        self.wait(2)
        
        # v4 Final fade
        v4_final_text = Text(
            "The spinning toy problem — solved.",
            font_size=32,
            color=C['gold']
        )
        v4_final_text.next_to(v4_concepts, DOWN, buff=1.0)
        
        self.play(Write(v4_final_text), run_time=1.5)
        self.wait(2)
        
        # v4 Fade everything out
        self.play(
            FadeOut(v4_summary_title), FadeOut(v4_table_group),
            FadeOut(v4_concepts), FadeOut(v4_final_text),
            run_time=1.5
        )
        
        self.wait(1)


if __name__ == "__main__":
    pass
