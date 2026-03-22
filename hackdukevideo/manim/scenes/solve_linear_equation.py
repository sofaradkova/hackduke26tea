from manim import *


class SolveLinearEquation(Scene):
    """Step-by-step solution for 3x - 5 = 16"""
    
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
            'green': '#4ade80',
            'red': '#f87171',
        }
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 1: TITLE CARD
        # ═══════════════════════════════════════════════════════════════════════
        title = Text(
            "Solving Linear Equations",
            font_size=44,
            color=C['text'],
            weight=BOLD
        )
        
        subtitle = Text(
            "Step-by-step walkthrough",
            font_size=24,
            color=C['dim']
        )
        
        equation_title = Text(
            "3x − 5 = 16",
            font_size=48,
            color=C['gold']
        )
        
        # Positioning
        title.to_edge(UP, buff=1.5)
        subtitle.next_to(title, DOWN, buff=0.6)
        equation_title.next_to(subtitle, DOWN, buff=1.0)
        
        # Animate title
        self.play(FadeIn(title), run_time=0.8)
        self.wait(0.3)
        self.play(FadeIn(subtitle), run_time=0.8)
        self.wait(0.5)
        self.play(Write(equation_title), run_time=1.5)
        self.wait(2)
        
        # Clear title scene
        self.play(
            FadeOut(title), FadeOut(subtitle), FadeOut(equation_title),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 2: THE ORIGINAL EQUATION
        # ═══════════════════════════════════════════════════════════════════════
        
        # Create the original equation (centered for emphasis)
        original_eq = Text(
            "3x − 5 = 16",
            font_size=54,
            color=C['gold']
        )
        original_eq.move_to(ORIGIN)
        
        # Label on the left
        step_label = Text(
            "Original Equation:",
            font_size=28,
            color=C['text']
        )
        step_label.to_edge(LEFT, buff=1.5)
        step_label.to_edge(UP, buff=2)
        
        self.play(Write(step_label), run_time=1)
        self.wait(0.5)
        self.play(Write(original_eq), run_time=1.5)
        self.wait(2)
        
        # Fade out and prepare for step-by-step
        self.play(
            FadeOut(step_label),
            original_eq.animate.scale(0.7).to_edge(UP, buff=1.5).shift(RIGHT * 2),
            run_time=1
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 3: STEP 1 - ADD 5 TO BOTH SIDES
        # ═══════════════════════════════════════════════════════════════════════
        
        step1_label = Text(
            "Step 1: Add 5 to both sides",
            font_size=26,
            color=C['text']
        )
        step1_label.to_edge(LEFT, buff=1.5)
        step1_label.shift(UP * 1.5)
        
        self.play(Write(step1_label), run_time=1)
        self.wait(0.5)
        
        # Show the operation
        operation = Text(
            "3x − 5 + 5 = 16 + 5",
            font_size=36,
            color=C['blue']
        )
        operation.next_to(step1_label, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(operation), run_time=1.5)
        self.wait(1)
        
        # Highlight the cancellation
        minus_five = Text("− 5", font_size=32, color=C['red'])
        plus_five = Text("+ 5", font_size=32, color=C['red'])
        
        minus_five.next_to(operation, UP, buff=0.3)
        minus_five.shift(LEFT * 1.5)
        plus_five.next_to(minus_five, RIGHT, buff=0.1)
        
        self.play(
            FadeIn(minus_five),
            FadeIn(plus_five),
            run_time=0.8
        )
        
        # Show they cancel out
        cancel_line1 = Line(
            start=minus_five.get_left() + LEFT * 0.1,
            end=minus_five.get_right() + RIGHT * 0.1,
            color=C['red']
        )
        cancel_line2 = Line(
            start=plus_five.get_left() + LEFT * 0.1,
            end=plus_five.get_right() + RIGHT * 0.1,
            color=C['red']
        )
        
        self.play(
            Create(cancel_line1),
            Create(cancel_line2),
            run_time=0.5
        )
        self.wait(1)
        
        # Result after step 1
        result1 = Text(
            "3x = 21",
            font_size=44,
            color=C['teal']
        )
        result1.next_to(operation, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(result1), run_time=1.5)
        self.wait(2)
        
        # Clear step 1 elements, keep result
        self.play(
            FadeOut(step1_label),
            FadeOut(operation),
            FadeOut(minus_five),
            FadeOut(plus_five),
            FadeOut(cancel_line1),
            FadeOut(cancel_line2),
            run_time=0.6
        )
        
        # Move result up to become the working equation
        self.play(
            result1.animate.scale(0.9).to_edge(UP, buff=1.5).shift(RIGHT * 2),
            FadeOut(original_eq),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 4: STEP 2 - DIVIDE BOTH SIDES BY 3
        # ═══════════════════════════════════════════════════════════════════════
        
        step2_label = Text(
            "Step 2: Divide both sides by 3",
            font_size=26,
            color=C['text']
        )
        step2_label.to_edge(LEFT, buff=1.5)
        step2_label.shift(UP * 1.5)
        
        self.play(Write(step2_label), run_time=1)
        self.wait(0.5)
        
        # Show the division
        division = Text(
            "3x / 3 = 21 / 3",
            font_size=36,
            color=C['blue']
        )
        division.next_to(step2_label, DOWN, buff=0.8, aligned_edge=LEFT)
        
        self.play(Write(division), run_time=1.5)
        self.wait(1)
        
        # Highlight the 3s canceling
        three_left = Text("3", font_size=32, color=C['red'])
        three_right = Text("3", font_size=32, color=C['red'])
        
        three_left.next_to(division, UP, buff=0.3)
        three_left.shift(LEFT * 1.3)
        three_right.next_to(three_left, RIGHT, buff=0.8)
        
        self.play(
            FadeIn(three_left),
            FadeIn(three_right),
            run_time=0.8
        )
        
        # Show they cancel out
        cancel_line3 = Line(
            start=three_left.get_left() + LEFT * 0.1,
            end=three_left.get_right() + RIGHT * 0.1,
            color=C['red']
        )
        cancel_line4 = Line(
            start=three_right.get_left() + LEFT * 0.1,
            end=three_right.get_right() + RIGHT * 0.1,
            color=C['red']
        )
        
        self.play(
            Create(cancel_line3),
            Create(cancel_line4),
            run_time=0.5
        )
        self.wait(1)
        
        # Final answer
        final_answer = Text(
            "x = 7",
            font_size=54,
            color=C['green']
        )
        final_answer.next_to(division, DOWN, buff=1.0, aligned_edge=LEFT)
        
        self.play(Write(final_answer), run_time=1.5)
        
        # Box the answer
        answer_box = SurroundingRectangle(
            final_answer,
            color=C['gold'],
            buff=0.3,
            stroke_width=3
        )
        
        self.play(Create(answer_box), run_time=0.8)
        self.wait(2)
        
        # Clear step 2 elements
        self.play(
            FadeOut(step2_label),
            FadeOut(division),
            FadeOut(three_left),
            FadeOut(three_right),
            FadeOut(cancel_line3),
            FadeOut(cancel_line4),
            FadeOut(result1),
            run_time=0.6
        )
        
        # Move final answer to center
        self.play(
            final_answer.animate.move_to(ORIGIN).scale(1.2),
            answer_box.animate.move_to(ORIGIN).scale(1.2),
            run_time=0.8
        )
        
        # ═══════════════════════════════════════════════════════════════════════
        # SCENE 5: CHECK THE ANSWER
        # ═══════════════════════════════════════════════════════════════════════
        
        self.wait(1)
        
        check_label = Text(
            "Let's verify:",
            font_size=28,
            color=C['text']
        )
        check_label.to_edge(UP, buff=1)
        
        self.play(FadeIn(check_label), run_time=0.8)
        self.wait(0.5)
        
        # Show substitution
        check_eq = Text(
            "3(7) − 5 = 16",
            font_size=36,
            color=C['blue']
        )
        check_eq.next_to(check_label, DOWN, buff=0.8)
        
        self.play(Write(check_eq), run_time=1.5)
        self.wait(1)
        
        # Show calculation
        calc_eq = Text(
            "21 − 5 = 16",
            font_size=36,
            color=C['teal']
        )
        calc_eq.next_to(check_eq, DOWN, buff=0.6)
        
        self.play(Write(calc_eq), run_time=1.5)
        self.wait(1)
        
        # Show final verification
        verify_eq = Text(
            "16 = 16 ✓",
            font_size=40,
            color=C['green']
        )
        verify_eq.next_to(calc_eq, DOWN, buff=0.6)
        
        self.play(Write(verify_eq), run_time=1.5)
        self.wait(2)
        
        # ═══════════════════════════════════════════════════════════════════════
        # FINAL SCENE: SUMMARY
        # ═══════════════════════════════════════════════════════════════════════
        
        self.play(
            FadeOut(check_label),
            FadeOut(check_eq),
            FadeOut(calc_eq),
            FadeOut(verify_eq),
            run_time=0.6
        )
        
        summary_title = Text(
            "Solution Complete!",
            font_size=36,
            color=C['text'],
            weight=BOLD
        )
        summary_title.to_edge(UP, buff=1.5)
        
        self.play(FadeIn(summary_title), run_time=0.8)
        
        # Show final answer again
        final_display = Text(
            "x = 7",
            font_size=64,
            color=C['gold']
        )
        final_display.move_to(ORIGIN)
        
        final_box = SurroundingRectangle(
            final_display,
            color=C['gold'],
            buff=0.4,
            stroke_width=4
        )
        
        self.play(
            FadeOut(final_answer),
            FadeOut(answer_box),
            run_time=0.3
        )
        
        self.play(
            Write(final_display),
            Create(final_box),
            run_time=1.5
        )
        
        # Steps summary on the left
        steps_summary = VGroup(
            Text("1. Add 5 to both sides", font_size=22, color=C['dim']),
            Text("2. Divide by 3", font_size=22, color=C['dim']),
            Text("3. Check: 3(7) − 5 = 16 ✓", font_size=22, color=C['dim']),
        )
        steps_summary.arrange(DOWN, buff=0.4, aligned_edge=LEFT)
        steps_summary.to_edge(LEFT, buff=1.5)
        steps_summary.shift(DOWN * 0.5)
        
        self.play(FadeIn(steps_summary), run_time=1.5)
        self.wait(3)
        
        # Fade out everything
        self.play(
            FadeOut(summary_title),
            FadeOut(final_display),
            FadeOut(final_box),
            FadeOut(steps_summary),
            run_time=1
        )
        
        # End screen
        thanks = Text(
            "Thanks for watching!",
            font_size=36,
            color=C['text']
        )
        thanks.move_to(ORIGIN)
        
        self.play(FadeIn(thanks), run_time=1)
        self.wait(2)


if __name__ == "__main__":
    pass
