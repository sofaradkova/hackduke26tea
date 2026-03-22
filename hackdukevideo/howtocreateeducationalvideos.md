# How to Create Educational Videos with Remotion

A guide for building math/STEM explainer videos in the style of 3Blue1Brown and
Khan Academy: concept-first, patient pacing, and no AI-generated dashboard chrome.

---

## 1. Project Setup

Project lives in `testremotion/`. Required packages:

```json
"dependencies": {
  "@remotion/google-fonts": "4.0.423",
  "@remotion/transitions": "^4.0.438",
  "react": "18.3.1",
  "remotion": "^4.0.423"
}
```

Install the fonts package if missing:

```bash
cd testremotion && npx remotion add @remotion/google-fonts
```

---

## 2. File Structure

```
testremotion/src/
  educational/
    TopicTutorial.tsx     ← all scenes, helpers, and constants in one file
  TopicAlias.tsx          ← thin re-export if Root.tsx uses a different name
  Root.tsx                ← registers Composition with getTotalDuration()
```

---

## 3. Design Philosophy (3B1B + KA)

**What to avoid** (looks AI-generated):
- `system-ui` font — use a proper serif (Lora, EB Garamond)
- Shadcn-style cards with border-left accents
- Bouncy spring badges for section headers
- "Step 1 —" labels in bold accent colors
- Many accent colors active at once

**What to do instead**:
- Near-black background (`#0e0f1a`), equations in white/near-white
- One warm accent color (gold `#e8c060`) reserved for THE final answer
- No cards, no borders — text floats directly on the background
- Section headers are just small dim text + a plain question
- Generous vertical padding and spacing; let ideas breathe
- Simple fades (not slides) for most elements
- Typewriter write-in for equations that are being "constructed"
- A thin line that draws across the screen to separate idea blocks

---

## 4. Fonts

Load Lora (warm academic serif) at the top of the composition file:

```tsx
import {loadFont} from '@remotion/google-fonts/Lora';

const {fontFamily: LORA} = loadFont('normal', {
  weights: ['400', '700'],
  subsets: ['latin'],
});
```

Use LORA for all prose, questions, and labels.
Use `'STIX Two Math', Georgia, serif` for displayed equations.

Never use `system-ui`, `sans-serif`, or Inter as your primary font.

---

## 5. Color Palette

```tsx
const C = {
  bg:   '#0e0f1a',   // near-black background — not pure black
  text: '#e4e4f0',   // primary text (titles, questions)
  dim:  '#6a6b82',   // part labels, footnotes, section dividers
  eq:   '#f4f4ff',   // equations — pure-ish white so they feel important
  gold: '#e8c060',   // answers ONLY — warm and authoritative
  blue: '#5b9cf6',   // highlight substitution variables (use sparingly)
  teal: '#4ecdc4',   // highlight geometric ideas (use sparingly)
  fade: '#9999b5',   // mid-level prose — less important than eq
};
```

**Rule:** `C.gold` appears on exactly one thing per scene — the final result.
Everything else is white, dim-white, or muted. Restraint is the style.

---

## 6. Timing Config

```tsx
const FPS = 30;

export const SCENE_DURATIONS = {
  title:         5 * FPS,
  setup:        10 * FPS,
  partAQuestion: 3 * FPS,
  partAIntegral: 5 * FPS,
  partAInsight:  7 * FPS,
  partAWork:     8 * FPS,
  partAAnswer:   4 * FPS,
  // ...
};

export const getTotalDuration = () =>
  Object.values(SCENE_DURATIONS).reduce((a, b) => a + b, 0);
```

Always multiply seconds by FPS. Never use raw frame counts.
Export `getTotalDuration` and reference it in Root.tsx.

---

## 7. Animation Primitives

### Fade (default for prose and layout elements)

```tsx
const Fade: React.FC<{
  delay?: number;    // seconds from Sequence start
  duration?: number; // seconds for fade to complete (default 0.6)
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({delay = 0, duration = 0.6, children, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const opacity = interpolate(
    frame,
    [delay * fps, (delay + duration) * fps],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return <div style={{opacity, ...style}}>{children}</div>;
};
```

No `translateY`, no spring-bounce. Just a clean opacity transition.

### WriteIn (for equations being "constructed")

```tsx
const WriteIn: React.FC<{
  text: string;
  delay?: number;
  charsPerSec?: number;  // ~28 for equations, ~40 for short labels
  style?: React.CSSProperties;
}> = ({text, delay = 0, charsPerSec = 28, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const startFrame = delay * fps;
  if (frame < startFrame) return null;

  const elapsed = frame - startFrame;
  const chars = Math.min(text.length, Math.floor((elapsed / fps) * charsPerSec));

  return (
    <span style={style}>
      {text.slice(0, chars)}
      {/* invisible placeholder keeps layout stable */}
      <span style={{opacity: 0}}>{text.slice(chars)}</span>
    </span>
  );
};
```

**Rule (from Remotion docs):** Always use string slicing for typewriter effects.
Never use per-character opacity.

### DrawLine (section dividers)

```tsx
const DrawLine: React.FC<{delay?: number; color?: string; width?: number}> = ({
  delay = 0, color = C.dim, width = 600
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const progress = interpolate(
    frame,
    [delay * fps, (delay + 0.7) * fps],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return <div style={{height: 1, width: width * progress, background: color, borderRadius: 1, margin: '18px 0'}} />;
};
```

---

## 8. Part Labels (not badges)

Replace colored badge buttons with this quiet two-line header:

```tsx
const PartLabel: React.FC<{part: string; question: string}> = ({part, question}) => (
  <div style={{marginBottom: 36}}>
    <Fade delay={0} duration={0.4}>
      <div style={{fontFamily: LORA, fontSize: 22, color: C.dim, letterSpacing: '0.08em', marginBottom: 10}}>
        part ({part})
      </div>
    </Fade>
    <Fade delay={0.3} duration={0.5}>
      <div style={{fontFamily: LORA, fontSize: 36, color: C.text, fontWeight: '400', lineHeight: 1.4}}>
        {question}
      </div>
    </Fade>
  </div>
);
```

The question IS the header. No colored boxes.

---

## 9. Answer Scene

The answer floats centered with an animated underline. Gold only here.

```tsx
const AnswerScene: React.FC<{
  part: string;
  equation: React.ReactNode;  // string or JSX with <Frac>
  note?: string;
}> = ({part, equation, note}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const eqScale = spring({frame: frame - 10, fps, config: {damping: 200}});
  const eqOpacity = interpolate(frame, [10, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const underlineWidth = interpolate(frame, [35, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: LORA, fontSize: 22, color: C.dim, marginBottom: 32}}>part ({part})</div>

      <div style={{opacity: eqOpacity, transform: `scale(${eqScale})`, fontFamily: `Georgia, serif`,
                   fontSize: 72, color: C.gold}}>
        {equation}
      </div>

      <div style={{width: `${underlineWidth * 420}px`, height: 2, background: C.gold, opacity: 0.6, marginTop: 16}} />

      {note && <div style={{fontFamily: LORA, fontSize: 24, color: C.dim, marginTop: 24}}>{note}</div>}
    </AbsoluteFill>
  );
};
```

---

## 10. Scene Layout Template

All scenes use this shell. The only thing that changes is `justifyContent`:
- `'center'` for title/question/answer scenes (sparse content)
- `'flex-start'` — not used; center works for work scenes too with generous padding

```tsx
const MyScene: React.FC = () => (
  <AbsoluteFill
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '60px 160px',    // 160px horizontal — gives breathing room
    }}
  >
    {/* Natural language framing */}
    <Fade delay={0} duration={0.5}
      style={{fontFamily: LORA, fontSize: 28, color: C.fade, marginBottom: 20, lineHeight: 1.6}}>
      A sentence that sets up what we're about to see.
    </Fade>

    {/* The equation */}
    <Fade delay={0.8} duration={0.4}>
      <div style={{fontFamily: `Georgia, serif`, fontSize: 48, color: C.eq, marginBottom: 28}}>
        equation here
      </div>
    </Fade>

    {/* Reflection / next question */}
    <Fade delay={2} duration={0.5}
      style={{fontFamily: LORA, fontSize: 28, color: C.fade, lineHeight: 1.6}}>
      What does this tell us? Or: here's the pattern to notice.
    </Fade>
  </AbsoluteFill>
);
```

---

## 11. Teaching Language Patterns (KA / 3B1B Voice)

| ❌ Avoid (lecture mode) | ✅ Use instead (reasoning-together mode) |
|-------------------------|------------------------------------------|
| "Step 1 — Set up the integral" | "Area under a curve is just an integral. So we write:" |
| "U-Substitution" (bold header) | "There's a pattern hiding here. Notice x dx is sitting right there..." |
| "PART (a)" badge | Small dim text `part (a)`, then the question itself as the header |
| "Evaluate at x=2" header | "Plug in x = 2 and we get..." inline, before the equation |
| List of answers with colored borders | Plain rows: dim label, muted descriptor, gold answer |

**Tone markers to include:**
- "Let's pause here..." — signals a conceptual moment
- "Notice something:" / "Look at this carefully." — draws attention
- "That's a hint." — Socratic nudge before the substitution
- "It was waiting there all along." — confirms the insight after it lands
- "That's just algebra." — low-pressure framing before mechanical work

---

## 12. Fractions Helper

```tsx
const Frac: React.FC<{num: React.ReactNode; den: React.ReactNode}> = ({num, den}) => (
  <span style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                verticalAlign: 'middle', margin: '0 2px', fontSize: '0.85em', lineHeight: 1.15}}>
    <span style={{borderBottom: `1.5px solid currentColor`, padding: '0 3px'}}>{num}</span>
    <span style={{padding: '0 3px'}}>{den}</span>
  </span>
);
```

Use for displayed fractions. For inline fractions in prose, just write `1/3` — it reads fine.

---

## 13. Scene Sequencing

```tsx
export const MyTutorial: React.FC = () => (
  <AbsoluteFill>
    <Background />  {/* sits outside Series so it persists across all scenes */}
    <Series>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.title} premountFor={FPS}>
        <TitleScene />
      </Series.Sequence>
      {/* one entry per scene, always premountFor={FPS} */}
    </Series>
  </AbsoluteFill>
);
```

**`useCurrentFrame()` inside a `Series.Sequence` returns 0 at the start of that scene.**
All `delay` values in `Fade` and `WriteIn` are relative to the scene start, in seconds.

---

## 14. Registering in Root.tsx

```tsx
import {SpinningToyTutorial, getTotalDuration} from './educational/SpinningToyTutorial';

<Composition
  id="SpinningToyTutorial"
  component={SpinningToyTutorial}
  durationInFrames={getTotalDuration()}  // NEVER hardcode this
  fps={30}
  width={1920}
  height={1080}
/>
```

---

## 15. Rendering

```bash
cd testremotion

# preview
npm run dev

# render WITHOUT 3D (fast, default concurrency)
npx remotion render src/index.ts SpinningToyTutorial out/spinning-toy-tutorial.mp4

# render WITH ThreeCanvas / @remotion/three (REQUIRED flags)
npx remotion render src/index.ts SpinningToyTutorial out/spinning-toy-tutorial.mp4 \
  --gl=angle \
  --concurrency=1
```

**`--gl=angle` is required whenever ThreeCanvas is used.** Without it, headless
Chrome cannot create a WebGL context and the render fails with
`BindToCurrentSequence failed`.

**`--concurrency=1` is required for 3D renders.** Multiple concurrent tabs each
try to create their own WebGL context, which causes them all to fail.

---

---

## 16. Adding 3D Visualizations (Split-Screen Layout)

### Install

```bash
npm install --save-exact @remotion/three@4.0.423 @react-three/fiber three @types/three --legacy-peer-deps
```

### Imports

```tsx
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import React, {useMemo} from 'react';
```

### Layout: 960 / 960 Split

The composition is 1920×1080. Divide it in half:

```tsx
const SplitScene: React.FC<{left: React.ReactNode; mode: PanelMode}> = ({left, mode}) => (
  <AbsoluteFill>
    {/* Left: text, 960px wide */}
    <div style={{
      position: 'absolute', left: 0, top: 0, width: 960, height: 1080,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '60px 64px 60px 100px',
    }}>
      {left}
    </div>
    {/* Right: 3D panel, 960px wide */}
    <Panel3D mode={mode} />
  </AbsoluteFill>
);

const Panel3D: React.FC<{mode: PanelMode}> = ({mode}) => (
  <div style={{position: 'absolute', right: 0, top: 0, width: 960, height: 1080, background: C.panel}}>
    <ThreeCanvas width={960} height={1080}>
      <Panel3DContent mode={mode} />
    </ThreeCanvas>
  </div>
);
```

**Rules:**
- `<ThreeCanvas>` MUST have explicit `width` and `height` props
- Always include lighting inside ThreeCanvas
- `useFrame()` from `@react-three/fiber` is FORBIDDEN — use `useCurrentFrame()` instead

### Camera Rig (must-have pattern)

R3F's `useThree()` is allowed. Drive camera position with `useCurrentFrame()`:

```tsx
const CameraRig: React.FC<{
  pos: [number, number, number];
  target: [number, number, number];
  rotateSpeed?: number; // radians per frame, 0 = static
}> = ({pos, target, rotateSpeed = 0}) => {
  const {camera} = useThree();
  const frame = useCurrentFrame();

  if (rotateSpeed > 0) {
    const angle = frame * rotateSpeed;
    const r = Math.hypot(pos[0], pos[2]);
    camera.position.set(Math.sin(angle) * r, pos[1], Math.cos(angle) * r);
  } else {
    camera.position.set(...pos);
  }
  camera.lookAt(...target);
  return null;
};
```

Slow rotation: `rotateSpeed={0.012}` (one full orbit ≈ 524 frames ≈ 17 s).

### Geometry Helpers

Always build geometries with `useMemo` so they aren't rebuilt every render call:

```tsx
// Curve line: y = cx√(4−x²)
const CurveLine: React.FC<{c: number}> = ({c}) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const x = (i / 120) * 2;
      pts.push(new THREE.Vector3(x - 1, c * x * Math.sqrt(Math.max(0, 4 - x*x)), 0));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [c]);

  // Use primitive to avoid JSX element naming conflicts with HTML <line>
  return <primitive object={new THREE.Line(geo, new THREE.LineBasicMaterial({color: '#5b9cf6'}))} />;
};
```

### Solid of Revolution (custom BufferGeometry)

Revolve y = cx√(4−x²) around the x-axis. Both endpoints are r=0 so no end caps needed:

```tsx
const SolidMesh: React.FC<{c: number; progress?: number}> = ({c, progress = 1}) => {
  const geometry = useMemo(() => {
    const curveSegs = 80;
    const radialSegs = 56;
    const active = Math.max(1, Math.floor(curveSegs * progress));
    const positions: number[] = [], normals: number[] = [], indices: number[] = [];

    for (let i = 0; i <= active; i++) {
      const xParam = (i / curveSegs) * 2;
      const r = c * xParam * Math.sqrt(Math.max(0, 4 - xParam * xParam));
      const px = xParam - 1; // center on origin

      for (let j = 0; j <= radialSegs; j++) {
        const a = (j / radialSegs) * Math.PI * 2;
        positions.push(px, r * Math.cos(a), r * Math.sin(a));
        normals.push(0, Math.cos(a), Math.sin(a)); // outward from x-axis
      }
    }
    for (let i = 0; i < active; i++) {
      for (let j = 0; j < radialSegs; j++) {
        const a = i * (radialSegs + 1) + j, b = a + radialSegs + 1;
        indices.push(a, b, a+1, b, b+1, a+1);
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('normal',   new THREE.Float32BufferAttribute(normals, 3));
    g.setIndex(indices);
    return g;
  }, [c, progress]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#4ecdc4" side={THREE.DoubleSide} transparent opacity={0.88} />
    </mesh>
  );
};
```

**Animate `progress` from 0→1** to reveal the solid building left-to-right:

```tsx
const progress = interpolate(frame, [0, 2 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
<SolidMesh c={1} progress={progress} />
```

### Disk Cross-Section (disk method visualization)

A thin cylinder oriented along the x-axis. CylinderGeometry axis is Y, so rotate 90°:

```tsx
const DiskSlice: React.FC<{c: number; xPos: number}> = ({c, xPos}) => {
  const r = c * xPos * Math.sqrt(Math.max(0, 4 - xPos * xPos));
  return (
    <mesh
      position={[xPos - 1, 0, 0]}
      rotation={[0, 0, Math.PI / 2]}          // align cylinder axis with x-axis
    >
      <cylinderGeometry args={[r, r, 0.035, 48]} />
      <meshStandardMaterial color="#e8c060" transparent opacity={0.65} side={THREE.DoubleSide} />
    </mesh>
  );
};
```

### Panel Mode System

Define a `PanelMode` type so each scene declares what the 3D panel should show:

```tsx
type PanelMode = 'curve' | 'region-fill' | 'disks' | 'solid-build' | 'solid' | 'solid-c';
```

The single `Panel3DContent` component reads the mode and renders the right combination:

```tsx
const Panel3DContent: React.FC<{mode: PanelMode}> = ({mode}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const isSolid = mode === 'solid-build' || mode === 'solid' || mode === 'solid-c';

  const solidProgress = mode === 'solid-build'
    ? interpolate(frame, [0, 2 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 1;

  return (
    <>
      <CameraRig
        pos={isSolid ? [3.2, 1.6, 3.5] : [0.5, 1.3, 4.2]}
        target={[0, 0.55, 0]}
      />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={0.95} />

      <group rotation={[0, isSolid ? frame * 0.012 : 0, 0]}>
        <Axes />
        <CurveLine c={1} />
        {mode === 'region-fill' && <RegionFill c={1} />}
        {mode === 'disks' && <>{DISK_POSITIONS.map(xp => <DiskSlice key={xp} c={1} xPos={xp} />)}</>}
        {isSolid && <SolidMesh c={mode === 'solid-c' ? Math.sqrt(30)/8 : 1} progress={solidProgress} />}
      </group>
    </>
  );
};
```

### Camera Angles

| Content | `pos` | `target` | Notes |
|---------|-------|----------|-------|
| 2D curve / region | `[0.5, 1.3, 4.2]` | `[0, 0.55, 0]` | Near-orthographic; shows XY plane clearly |
| 3D solid / disks | `[3.2, 1.6, 3.5]` | `[0, 0.55, 0]` | 45° angle; combine with `rotateSpeed={0.012}` |

### Coordinate System Convention

The curve x-parameter runs 0→2. Center the geometry on the origin by offsetting:

```tsx
const px = xParam - 1;  // maps [0, 2] → [-1, 1] centered on origin
```

Y range for c=1: 0 → 2 (max at x=√2). Camera at y≈1.6 puts it at mid-height.

---

## 17. Scene Duration Sizing Guide

| Scene Type        | Duration  | Notes                                               |
|-------------------|-----------|-----------------------------------------------------|
| Title             | 4–6 s     | Just the name and the function. Let it sit.         |
| Setup / Context   | 8–12 s    | Introduce the problem in plain language             |
| Part intro        | 3–4 s     | Part label + the question. Nothing else.            |
| Insight moment    | 6–8 s     | The "notice something" beat. Slower is better.      |
| Computation       | 7–12 s    | One equation per ~1.2 s, with a bridging sentence   |
| Answer            | 3–5 s     | Let the underline finish animating (~2 s)           |
| Summary           | 6–8 s     | One row per answer at ~0.7 s stagger                |

---

## 17. Checklist for a New Educational Video

1. Write solution in a `.md` file, noting every insight (not just steps)
2. Create `src/educational/TopicTutorial.tsx`
3. Define `SCENE_DURATIONS` + `getTotalDuration()`
4. Define palette `C` — confirm gold is only used on final answers
5. Load Lora font at file top
6. Write one component per scene; keep scenes ≤ 5 visible elements
7. Use `<Fade>` for prose, `<WriteIn>` for equations being built
8. Use `<PartLabel>` — never a colored badge
9. Use `<AnswerScene>` — centered, gold, underline animation
10. Wire scenes with `<Series>` + `premountFor={FPS}`
11. Export component + `getTotalDuration`, register in Root.tsx
12. Run `npx tsc --noEmit` to catch type errors before rendering
