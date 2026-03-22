"""
Manim Scene: The Spinning Toy Problem
2017 AP Calculus AB Free Response, Question 5

A company designs spinning toys using the family of functions y = cx√(4-x²)
"""

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
        
        # Function definition: y = cx√(4-x²)
        def spinning_func(x, c=1.0):
            """The spinning toy curve function."""
            if x < 0 or x > 2:
                return 0
            return c * x * np.sqrt(max(0, 4 - x**2))
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 1: TITLE CARD (0:00 - 0:05)
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
        
        func_text = MathTex(
            "y = cx\\sqrt{4-x^2}",
            font_size=44,
            color=C['gold']
        )
        
        # Position elements
        title.to_edge(UP, buff=1.5)
        subtitle.next_to(title, DOWN, buff=0.6)
        func_text.next_to(subtitle, DOWN, buff=1.2)
        
        # Animate title card
        self.play(FadeIn(title), run_time=0.8)
        self.wait(0.3)
        self.play(FadeIn(subtitle), run_time=0.8)
        self.wait(0.5)
        self.play(Write(func_text), run_time=1.5)
        self.wait(2)
        
        # Clear for next scene
        self.play(
            FadeOut(title),
            FadeOut(subtitle),
            FadeOut(func_text),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 2: SETUP WITH GRAPH (0:05 - 0:15)
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
        
        # Axis labels
        x_label = MathTex("x", font_size=28, color=C['dim'])
        y_label = MathTex("y", font_size=28, color=C['dim'])
        x_label.next_to(axes.x_axis.get_end(), DOWN, buff=0.2)
        y_label.next_to(axes.y_axis.get_end(), LEFT, buff=0.2)
        
        # Plot the curve
        curve = axes.plot(
            lambda x: spinning_func(x, c=1.0),
            x_range=[0, 2],
            color=C['curve'],
            stroke_width=4
        )
        
        # Text content (positioned on left side)
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
        
        # Constant explanation
        c_explain = Text(
            "The constant c controls the shape.",
            font_size=24,
            color=C['fade']
        )
        c_explain.next_to(context_group, DOWN, buff=0.8, aligned_edge=LEFT)
        
        # Region description
        region_text = Text(
            "Region R is in the first quadrant,",
            font_size=24,
            color=C['fade']
        )
        region_text2 = Text(
            "under the curve from x = 0 to x = 2.",
            font_size=24,
            color=C['fade']
        )
        region_group = VGroup(region_text, region_text2)
        region_group.arrange(DOWN, buff=0.3, aligned_edge=LEFT)
        region_group.next_to(c_explain, DOWN, buff=0.6, aligned_edge=LEFT)
        
        # Animate
        self.play(Create(axes), run_time=1.5)
        self.play(Create(x_label), Create(y_label), run_time=0.6)
        
        self.play(Write(context_group), run_time=1.5)
        self.wait(0.3)
        self.play(Write(c_explain), run_time=1)
        self.wait(0.3)
        
        # Draw curve
        self.play(Create(curve), run_time=2)
        self.wait(0.5)
        
        self.play(Write(region_group), run_time=1.5)
        self.wait(0.5)
        
        # Fill region under curve
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
            FadeOut(axes),
            FadeOut(curve),
            FadeOut(region_fill),
            FadeOut(context_group),
            FadeOut(c_explain),
            FadeOut(region_group),
            FadeOut(x_label),
            FadeOut(y_label),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 3: PART A - AREA (0:15 - 0:40)
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
        
        part_a_label.to_edge(UP, buff=1)
        part_a_label.to_edge(LEFT, buff=1.5)
        part_a_question.next_to(part_a_label, DOWN, buff=0.4, aligned_edge=LEFT)
        
        self.play(FadeIn(part_a_label), run_time=0.5)
        self.play(Write(part_a_question), run_time=1.5)
        self.wait(1)
        
        # Setup integral
        integral = MathTex(
            "A = \\int_0^2 cx\\sqrt{4-x^2}\\, dx",
            font_size=38,
            color=C['eq']
        )
        integral.next_to(part_a_question, DOWN, buff=1.2, aligned_edge=LEFT)
        
        self.play(Write(integral), run_time=2)
        self.wait(1)
        
        # Key insight
        insight = Text(
            "Notice the x and the square root...",
            font_size=24,
            color=C['teal']
        )
        insight.next_to(integral, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(insight), run_time=1.2)
        self.wait(0.5)
        
        # Substitution hint
        u_sub = MathTex("u = 4 - x^2", font_size=32, color=C['gold'])
        du_line = MathTex("du = -2x\\, dx", font_size=32, color=C['gold'])
        x_dx_line = MathTex("x\\, dx = -\\frac{1}{2}\\, du", font_size=32, color=C['gold'])
        
        sub_group = VGroup(u_sub, du_line, x_dx_line)
        sub_group.arrange(DOWN, buff=0.4, aligned_edge=LEFT)
        sub_group.next_to(insight, DOWN, buff=0.6, aligned_edge=LEFT)
        
        self.play(Write(u_sub), run_time=1)
        self.wait(0.3)
        self.play(Write(du_line), run_time=1)
        self.wait(0.3)
        self.play(Write(x_dx_line), run_time=1)
        self.wait(1.5)
        
        # Clear and show work
        self.play(
            FadeOut(part_a_label),
            FadeOut(part_a_question),
            FadeOut(insight),
            FadeOut(sub_group),
            run_time=0.6
        )
        
        # Transform integral to show substitution
        integral_new = MathTex(
            "A = \\frac{c}{2} \\int_0^4 u^{1/2}\\, du",
            font_size=38,
            color=C['eq']
        )
        integral_new.move_to(integral.get_center())
        
        self.play(ReplacementTransform(integral, integral_new), run_time=2)
        self.wait(0.5)
        
        # Next step
        step2 = MathTex(
            "A = \\frac{c}{2} \\cdot \\frac{2}{3} u^{3/2} \\Big|_0^4",
            font_size=38,
            color=C['eq']
        )
        step2.next_to(integral_new, DOWN, buff=0.8)
        
        self.play(Write(step2), run_time=2)
        self.wait(0.5)
        
        # Final answer
        answer = MathTex(
            "A = \\frac{8c}{3}",
            font_size=44,
            color=C['gold']
        )
        answer.next_to(step2, DOWN, buff=0.8)
        
        self.play(Write(answer), run_time=1.5)
        
        # Answer box
        answer_box = SurroundingRectangle(
            answer,
            color=C['gold'],
            buff=0.25,
            stroke_width=2
        )
        
        self.play(Create(answer_box), run_time=0.8)
        self.wait(2)
        
        # Clear
        self.play(
            FadeOut(integral_new),
            FadeOut(step2),
            FadeOut(answer),
            FadeOut(answer_box),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 4: PART B - VOLUME (0:40 - 1:05)
        # ═══════════════════════════════════════════════════════════════════════
        
        part_b_label = Text(
            "part (b)",
            font_size=20,
            color=C['dim']
        )
        part_b_question = Text(
            "Find the volume when revolved about the x-axis.",
            font_size=30,
            color=C['text']
        )
        
        part_b_label.to_edge(UP, buff=1)
        part_b_label.to_edge(LEFT, buff=1.5)
        part_b_question.next_to(part_b_label, DOWN, buff=0.4, aligned_edge=LEFT)
        
        self.play(FadeIn(part_b_label), run_time=0.5)
        self.play(Write(part_b_question), run_time=1.5)
        self.wait(1)
        
        # Show disk visualization
        axes2 = Axes(
            x_range=[-0.5, 2.5, 0.5],
            y_range=[-2.5, 2.5, 0.5],
            x_length=5,
            y_length=4,
            axis_config={
                "color": C['dim'],
                "include_tip": True,
            },
        )
        axes2.to_edge(RIGHT, buff=1)
        axes2.shift(UP * 0.5)
        
        curve2 = axes2.plot(
            lambda x: spinning_func(x, c=1.0),
            x_range=[0, 2],
            color=C['curve'],
            stroke_width=3
        )
        
        self.play(Create(axes2), run_time=1)
        self.play(Create(curve2), run_time=1.5)
        
        # Draw disks to visualize disk method
        disks = VGroup()
        x_positions = [0.3, 0.7, 1.1, 1.5, 1.9]
        
        for i, x_pos in enumerate(x_positions):
            r = spinning_func(x_pos, c=1.0)
            # Create a line representing the disk radius
            disk_line = Line(
                axes2.c2p(x_pos, -r),
                axes2.c2p(x_pos, r),
                color=C['gold'],
                stroke_width=3
            )
            disks.add(disk_line)
            
            # Animate disks appearing one by one
            self.play(Create(disk_line), run_time=0.6)
        
        self.wait(0.5)
        
        # Volume formula
        volume_eq = MathTex(
            "V = \\pi \\int_0^2 [cx\\sqrt{4-x^2}]^2\\, dx",
            font_size=32,
            color=C['eq']
        )
        volume_eq.to_edge(LEFT, buff=1.5)
        volume_eq.shift(UP * 0.5)
        
        self.play(Write(volume_eq), run_time=2)
        self.wait(0.5)
        
        # Clear visualization
        self.play(
            FadeOut(axes2),
            FadeOut(curve2),
            FadeOut(disks),
            run_time=0.6
        )
        
        # Work through integral
        vol_step1 = MathTex(
            "V = \\pi c^2 \\int_0^2 (4x^2 - x^4)\\, dx",
            font_size=32,
            color=C['eq']
        )
        vol_step1.move_to(volume_eq.get_center())
        
        self.play(ReplacementTransform(volume_eq, vol_step1), run_time=2)
        self.wait(0.5)
        
        # Continue work
        vol_step2 = MathTex(
            "V = \\pi c^2 \\left[\\frac{4x^3}{3} - \\frac{x^5}{5}\\right]_0^2",
            font_size=30,
            color=C['eq']
        )
        vol_step2.next_to(vol_step1, DOWN, buff=0.8)
        
        self.play(Write(vol_step2), run_time=2)
        self.wait(0.5)
        
        # Simplify
        vol_step3 = MathTex(
            "V = \\pi c^2 \\cdot 32\\left(\\frac{1}{3} - \\frac{1}{5}\\right)",
            font_size=30,
            color=C['eq']
        )
        vol_step3.next_to(vol_step2, DOWN, buff=0.6)
        
        self.play(Write(vol_step3), run_time=1.5)
        self.wait(0.5)
        
        # Final answer
        vol_answer = MathTex(
            "V = \\frac{64\\pi c^2}{15}",
            font_size=40,
            color=C['gold']
        )
        vol_answer.next_to(vol_step3, DOWN, buff=0.8)
        
        self.play(Write(vol_answer), run_time=1.5)
        
        vol_box = SurroundingRectangle(
            vol_answer,
            color=C['gold'],
            buff=0.25
        )
        
        self.play(Create(vol_box), run_time=0.8)
        self.wait(2)
        
        # Clear
        self.play(
            FadeOut(part_b_label),
            FadeOut(part_b_question),
            FadeOut(vol_step1),
            FadeOut(vol_step2),
            FadeOut(vol_step3),
            FadeOut(vol_answer),
            FadeOut(vol_box),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 5: PART C - SOLVE FOR C (1:05 - 1:25)
        # ═══════════════════════════════════════════════════════════════════════
        
        part_c_label = Text(
            "part (c)",
            font_size=20,
            color=C['dim']
        )
        part_c_question = Text(
            "Find c when volume equals 2π.",
            font_size=32,
            color=C['text']
        )
        
        part_c_label.to_edge(UP, buff=1)
        part_c_label.to_edge(LEFT, buff=1.5)
        part_c_question.next_to(part_c_label, DOWN, buff=0.4, aligned_edge=LEFT)
        
        self.play(FadeIn(part_c_label), run_time=0.5)
        self.play(Write(part_c_question), run_time=1.5)
        self.wait(1)
        
        # Setup equation
        eq = MathTex(
            "\\frac{64\\pi c^2}{15} = 2\\pi",
            font_size=38,
            color=C['eq']
        )
        eq.next_to(part_c_question, DOWN, buff=1.2, aligned_edge=LEFT)
        
        self.play(Write(eq), run_time=1.5)
        self.wait(0.5)
        
        # Divide by π
        eq2 = MathTex(
            "\\frac{64c^2}{15} = 2",
            font_size=38,
            color=C['eq']
        )
        eq2.next_to(eq, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(eq2), run_time=1.5)
        self.wait(0.5)
        
        # Solve for c²
        eq3 = MathTex(
            "c^2 = \\frac{30}{64} = \\frac{15}{32}",
            font_size=38,
            color=C['eq']
        )
        eq3.next_to(eq2, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(eq3), run_time=2)
        self.wait(0.5)
        
        # Final answer
        c_answer = MathTex(
            "c = \\frac{\\sqrt{30}}{8} \\approx 0.684",
            font_size=42,
            color=C['gold']
        )
        c_answer.next_to(eq3, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(c_answer), run_time=1.5)
        
        c_box = SurroundingRectangle(
            c_answer,
            color=C['gold'],
            buff=0.25
        )
        
        self.play(Create(c_box), run_time=0.8)
        self.wait(2)
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 6: SUMMARY (1:25 - 1:35)
        # ═══════════════════════════════════════════════════════════════════════
        
        self.play(
            FadeOut(part_c_label),
            FadeOut(part_c_question),
            FadeOut(eq),
            FadeOut(eq2),
            FadeOut(eq3),
            run_time=0.6
        )
        
        # Keep answer for a moment, then clear
        self.wait(0.5)
        self.play(
            FadeOut(c_answer),
            FadeOut(c_box),
            run_time=0.5
        )
        
        # Summary title
        summary_title = Text(
            "Summary",
            font_size=40,
            color=C['text'],
            weight=BOLD
        )
        summary_title.to_edge(UP, buff=1.5)
        
        # Summary content
        summary_items = VGroup(
            MathTex(
                "\\text{Area: } A = \\frac{8c}{3} \\text{ in}^2",
                font_size=34,
                color=C['eq']
            ),
            MathTex(
                "\\text{Volume: } V = \\frac{64\\pi c^2}{15} \\text{ in}^3",
                font_size=34,
                color=C['eq']
            ),
            MathTex(
                "\\text{When } V = 2\\pi:\\ c = \\frac{\\sqrt{30}}{8}",
                font_size=34,
                color=C['gold']
            ),
        )
        
        summary_items.arrange(DOWN, buff=0.8)
        summary_items.next_to(summary_title, DOWN, buff=1.2)
        
        self.play(FadeIn(summary_title), run_time=0.8)
        
        for item in summary_items:
            self.play(Write(item), run_time=1.5)
            self.wait(0.3)
        
        self.wait(3)
        
        # Fade out
        self.play(
            FadeOut(summary_title),
            FadeOut(summary_items),
            run_time=1
        )
        
        self.wait(1)


class SpinningToy3D(ThreeDScene):
    """3D visualization of the solid of revolution."""
    
    def construct(self):
        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES)
        self.camera.background_color = "#0e0f1a"
        
        C = {
            'dim': '#6a6b82',
            'curve': '#4ecdc4',
            'surface': '#e8c060',
        }
        
        # 3D Axes
        axes = ThreeDAxes(
            x_range=[-0.5, 2.5, 0.5],
            y_range=[-2, 2, 0.5],
            z_range=[-2, 2, 0.5],
            axis_config={"color": C['dim']}
        )
        
        # Surface of revolution
        def surface_func(u, v, c=1.0):
            """Parametric surface: x=u, y=r*cos(v), z=r*sin(v)"""
            r = c * u * np.sqrt(max(0, 4 - u**2)) if 0 <= u <= 2 else 0
            return np.array([
                u,
                r * np.cos(v),
                r * np.sin(v)
            ])
        
        # Create surface
        surface = Surface(
            lambda u, v: surface_func(u, v, c=1.0),
            u_range=[0, 2],
            v_range=[0, TAU],
            resolution=(50, 50),
            color=C['surface'],
            fill_opacity=0.7,
            stroke_color=C['surface'],
            stroke_width=0.5
        )
        
        self.add(axes)
        self.play(Create(surface), run_time=3)
        
        # Rotate camera
        self.begin_ambient_camera_rotation(rate=0.1)
        self.wait(8)
        self.stop_ambient_camera_rotation()


if __name__ == "__main__":
    # Run with: manim -pqh spinning_toy_scene.py SpinningToyScene
    pass
