# Visual FRQ

## Inspiration
AP Calculus free-response questions are hard for a lot of students for the same reason: the algebra is only half the battle. The real struggle is seeing what the problem is describing.

We wanted to make math explanations feel less like a wall of symbols and more like something you can actually watch unfold. Instead of static notes or generic slides, we built a system for turning calculus problems into polished, visual walkthroughs with live geometry, animated equations, and 3D solids.

The goal was simple: make hard STEM problems feel intuitive.

## What it does
Visual FRQ turns AP Calculus-style free-response problems into animated educational videos.

In this project, the system takes a problem about a spinning toy defined by the curve `y = cx√(4 - x²)` and generates a step-by-step explainer that shows:
- the original curve and shaded region
- the area under the curve
- the solid of revolution formed by rotating the region around the x-axis
- disk-method cross sections
- the symbolic solution for area, volume, and the value of `c`

The repo also includes a parallel Manim workflow for creating 3Blue1Brown-style math scenes, plus a Markdown-to-LaTeX utility for converting math-heavy scripts into clean renderable expressions.

## How we built it
We built the video pipeline with:
- **Remotion** for programmatic video generation
- **React + TypeScript** for scene composition and reusable UI primitives
- **Three.js via @remotion/three** for live 3D visualizations inside the video
- **Manim** for an alternate math-animation workflow
- **Python** for utility tooling like Markdown-to-LaTeX conversion

A few concrete implementation details from the project:
- Scene timing is defined in code with per-section durations and a derived total runtime
- The main tutorial uses a split-screen layout: explanation on the left, live 3D visualization on the right
- The 3D panel can switch modes between curve view, region fill, disk slices, solid build, and solved-parameter views
- The solid of revolution is generated programmatically from the curve instead of being faked with pre-rendered assets
- Equation styling and pacing are controlled directly in code so the visuals stay consistent

## Challenges we ran into
One of the biggest challenges was balancing **mathematical clarity** with **visual pacing**.

If the animation is too flashy, it distracts from the math. If it is too static, it just becomes another digital worksheet. We spent a lot of time tuning the visual language: restrained colors, slow reveals, and scene-by-scene pacing that gives the idea room to breathe.

We also ran into technical issues with rendering 3D scenes in a video pipeline. WebGL-based Remotion compositions need careful configuration, especially for headless rendering, and the geometry for the solid of revolution had to be generated in a way that was both performant and understandable.

Another challenge was making the content pipeline reusable instead of building one-off scenes. We wanted a system that could support future STEM explainers, not just a single calculus video.

## Accomplishments that we're proud of
We’re proud that this became more than a slideshow.

A few things we’re especially happy with:
- building a real code-driven pipeline for educational video generation
- combining symbolic math explanation with live 3D geometry in the same composition
- creating a visual style that feels closer to an actual explainer video than a generic AI video demo
- keeping the project extensible enough to support new problems and new animation workflows
- shipping both a Remotion-based and Manim-based path for math content creation

## What we learned
We learned that educational video generation is not just a rendering problem — it is a pedagogy problem.

Good explainers need structure, pacing, hierarchy, and restraint. Code can absolutely help with repeatability and polish, but the best results come from encoding teaching decisions directly into the system.

On the technical side, we learned a lot about:
- orchestrating scene-based rendering in Remotion
- embedding Three.js in a deterministic video workflow
- generating math visuals programmatically instead of relying on manual editing
- building tooling around scripts and equation formatting to reduce content-production friction

## What's next for Visual FRQ
Next, we want to expand this from a single demo into a full educational content engine.

Our roadmap includes:
- support for more AP Calculus FRQs and other STEM topics
- script-to-video tooling that can transform structured lesson outlines into full animations
- better narration, captions, and audio synchronization
- reusable templates for common concepts like solids of revolution, related rates, and optimization
- a teacher/student-facing workflow where educators can generate custom walkthroughs from problem text

## Built With
- Remotion
- React
- TypeScript
- Three.js
- @remotion/three
- Python
- Manim

## Try it / Repo Notes
Relevant files in this repo include:
- `testremotion/src/educational/SpinningToyTutorial.tsx` — main Remotion educational video composition
- `testremotion/src/Root.tsx` — composition registry
- `manim/prob4frq_scene.py` — Manim-based math explainer scene
- `manim/md_to_tex.py` — Markdown-to-LaTeX converter for math scripts

Example render commands:

```bash
cd testremotion
npm install
npm run dev
```

For a 3D render with Remotion:

```bash
npx remotion render src/index.ts SpinningToyTutorial out/out.mp4 --gl=angle --concurrency=1
```

For the Manim workflow:

```bash
cd manim
pip install -r requirements.txt
manim -pqh prob4frq_scene.py Prob4FRQScene
```
