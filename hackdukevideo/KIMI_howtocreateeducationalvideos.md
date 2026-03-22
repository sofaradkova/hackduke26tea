# How to Create Educational Videos with 3D Visualizations

A guide for building math/STEM explainer videos in the style of 3Blue1Brown and Khan Academy, now with Three.js 3D visualizations powered by Remotion.

---

## 1. Project Setup

Project lives in `testremotion/`. Required packages:

```json
"dependencies": {
  "@react-three/fiber": "8.17.12",
  "@remotion/google-fonts": "4.0.423",
  "@remotion/three": "4.0.423",
  "@remotion/transitions": "^4.0.438",
  "@types/three": "0.183.1",
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "remotion": "^4.0.423",
  "three": "0.183.2"
}
```

Install the 3D packages if missing:

```bash
cd testremotion && npx remotion add @remotion/three
npm install @react-three/fiber@8.17.12 three @types/three
```

**Note**: React Three Fiber v9+ requires React 19. Pin to v8.17.12 for React 18 compatibility.

---

## 2. File Structure

```
testremotion/src/
  educational/
    kimi_TopicTutorial.tsx    ← all scenes, 3D visuals, and constants
    kimi_TopicScript.md       ← voiceover script with timestamps for ElevenLabs
  Root.tsx                   ← registers Composition with getTotalDuration()
```

---

## 3. Design Philosophy (3B1B + KA + 3D)

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
- **NEW**: 3D visualizations on the right side while math content stays on the left

---

## 4. The Two-Column Layout Pattern

The key innovation: **Left side = math content, Right side = 3D visualization**

```tsx
const TwoColumnLayout: React.FC<{
  leftContent: React.ReactNode;
  mode: 'curve' | 'solid' | 'cross-section';
  cutProgress?: number;
}> = ({leftContent, mode, cutProgress = 0}) => {
  const frame = useCurrentFrame();
  
  return (
    <AbsoluteFill style={{display: 'flex'}}>
      {/* Left side - Math content */}
      <div style={{
        width: '50%',
        height: '100%',
        padding: '60px 40px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        {leftContent}
      </div>
      
      {/* Right side - 3D visualization */}
      <Visualization3D mode={mode} frame={frame} c={1} cutProgress={cutProgress} />
    </AbsoluteFill>
  );
};
```

---

## 5. 3D Visualization Setup

### Prerequisites

```tsx
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { useVideoConfig } from 'remotion';
```

### The ThreeCanvas Wrapper

```tsx
const Visualization3D: React.FC<{
  mode: 'curve' | 'solid' | 'cross-section';
  frame: number;
  c?: number;
  cutProgress?: number;
}> = ({mode, frame, c = 1, cutProgress = 0}) => {
  const {width, height} = useVideoConfig();
  
  // 3D canvas takes up right half of screen
  const canvasWidth = width / 2;
  const canvasHeight = height;

  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 0,
      width: canvasWidth,
      height: canvasHeight,
    }}>
      <ThreeCanvas width={canvasWidth} height={canvasHeight}>
        <perspectiveCamera position={[3, 2, 5]} fov={60} />
        {mode === 'curve' && <Curve3D c={c} frame={frame} showRegion={true} />}
        {mode === 'solid' && <Solid3D c={c} frame={frame} />}
        {mode === 'cross-section' && <Solid3D c={c} frame={frame} showCrossSection={true} cutProgress={cutProgress} />}
      </ThreeCanvas>
    </div>
  );
};
```

**CRITICAL RULES** (from `@remotion/three`):
- MUST use `<ThreeCanvas>` with explicit `width` and `height` props
- MUST NOT use `useFrame()` from React Three Fiber
- MUST animate using `useCurrentFrame()` from Remotion
- MUST include proper lighting
- MUST use `layout="none"` on any `<Sequence>` inside `<ThreeCanvas>`

---

## 6. Generating 3D Mathematical Objects

### The Curve: y = cx√(4-x²)

```tsx
const generateCurvePoints = (c: number = 1, segments: number = 100): THREE.Vector3[] => {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * 2;
    const y = c * x * Math.sqrt(Math.max(0, 4 - x * x));
    points.push(new THREE.Vector3(x, y, 0));
  }
  return points;
};
```

### Surface of Revolution

```tsx
const generateSolidPoints = (c: number = 1, xSegments: number = 50, thetaSegments: number = 60) => {
  const positions: number[] = [];
  const normals: number[] = [];
  
  for (let i = 0; i < xSegments; i++) {
    const x1 = (i / xSegments) * 2;
    const x2 = ((i + 1) / xSegments) * 2;
    const r1 = c * x1 * Math.sqrt(Math.max(0, 4 - x1 * x1));
    const r2 = c * x2 * Math.sqrt(Math.max(0, 4 - x2 * x2));
    
    for (let j = 0; j <= thetaSegments; j++) {
      const theta = (j / thetaSegments) * Math.PI * 2;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);
      
      positions.push(x1, r1 * cos, r1 * sin);
      normals.push(1, 0, 0);
      
      positions.push(x2, r2 * cos, r2 * sin);
      normals.push(1, 0, 0);
    }
  }
  
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals)
  };
};
```

---

## 7. 3D Curve Visualization

```tsx
const Curve3D: React.FC<{c?: number; frame: number; showRegion?: boolean}> = ({c = 1, frame, showRegion = false}) => {
  const {fps} = useVideoConfig();
  
  // Animate using useCurrentFrame() - NEVER use useFrame()
  const rotationY = interpolate(frame, [0, 150], [0, Math.PI * 0.5], {extrapolateRight: 'clamp'});
  const scale = spring({frame, fps, config: {damping: 100}});
  
  const curvePoints = useMemo(() => generateCurvePoints(c), [c]);
  
  const curveGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(curvePoints);
  }, [curvePoints]);

  return (
    <>
      {/* Lighting - REQUIRED */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[0, 5, 0]} intensity={0.5} />
      
      {/* Grid for context */}
      <gridHelper args={[6, 30, '#2a2a3e', '#2a2a3e']} position={[1, -0.1, 0]} />
      
      {/* Axes */}
      <axesHelper args={[3]} position={[0, 0, 0]} />
      
      {/* The curve - using primitive for Line */}
      <group scale={scale}>
        <primitive object={new THREE.Line(curveGeometry, new THREE.LineBasicMaterial({color: '#4ecdc4', linewidth: 3}))} />
        
        {/* Fill under curve (if showRegion) */}
        {showRegion && curvePoints.slice(0, -1).map((point, i) => {
          const nextPoint = curvePoints[i + 1];
          const midX = (point.x + nextPoint.x) / 2;
          const height = (point.y + nextPoint.y) / 2;
          const width = nextPoint.x - point.x;
          return (
            <mesh key={i} position={[midX, height / 2, 0]}>
              <boxGeometry args={[width, height, 0.05]} />
              <meshBasicMaterial color="#4ecdc4" transparent opacity={0.3} />
            </mesh>
          );
        })}
      </group>
    </>
  );
};
```

---

## 8. Solid of Revolution with Cross-Section Animation

```tsx
const Solid3D: React.FC<{
  c?: number;
  frame: number;
  showCrossSection?: boolean;
  cutProgress?: number;
}> = ({c = 1, frame, showCrossSection = false, cutProgress = 0}) => {
  const {fps} = useVideoConfig();
  
  const viewRotation = interpolate(frame, [0, 200], [0, Math.PI * 2], {extrapolateRight: 'clamp'});
  const scale = spring({frame, fps, config: {damping: 100}});
  
  const { positions, normals } = useMemo(() => generateSolidPoints(c), [c]);
  
  const solidGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    return geometry;
  }, [positions, normals]);

  // Cross-section disk animation
  const diskX = interpolate(cutProgress, [0, 1], [0, 2]);
  const diskR = c * diskX * Math.sqrt(Math.max(0, 4 - diskX * diskX));

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[0, 5, 0]} intensity={0.5} />
      <pointLight position={[3, -2, 3]} intensity={0.3} />
      
      {/* Grid */}
      <gridHelper args={[6, 30, '#2a2a3e', '#2a2a3e']} position={[1, -0.5, 0]} />
      
      <group scale={scale} rotation={[0, viewRotation * 0.3, 0]}>
        {/* The solid surface */}
        <mesh geometry={solidGeometry}>
          <meshStandardMaterial 
            color="#e8c060"
            transparent 
            opacity={0.7}
            side={THREE.DoubleSide}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
        
        {/* Cross-section disk */}
        {showCrossSection && cutProgress > 0 && (
          <mesh position={[diskX, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <circleGeometry args={[diskR, 64]} />
            <meshBasicMaterial color="#4ecdc4" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    </>
  );
};
```

---

## 9. Scene-Specific Visualizations

### Setup Scene (Curve)
```tsx
<TwoColumnLayout 
  leftContent={setupText} 
  mode="curve" 
/>
```

### Part A (Area Under Curve)
```tsx
<TwoColumnLayout 
  leftContent={areaCalculation} 
  mode="curve" 
/>
```

### Part B (Solid of Revolution)
```tsx
<TwoColumnLayout 
  leftContent={volumeExplanation} 
  mode="solid" 
/>
```

### Part B Work (Cross-Section Animation)
```tsx
const cutProgress = interpolate(frame, [0, 8 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

<TwoColumnLayout 
  leftContent={diskMethodCalculation}
  mode="cross-section"
  cutProgress={cutProgress}
/>
```

---

## 10. Color Palette for 3D

```tsx
const C = {
  bg:    '#0e0f1a',    // near-black background
  text:  '#e4e4f0',    // primary text
  dim:   '#6a6b82',    // part labels, footnotes
  eq:    '#f4f4ff',    // equations
  gold:  '#e8c060',    // answers only
  blue:  '#5b9cf6',    // substitution variables
  teal:  '#4ecdc4',    // geometric ideas
  fade:  '#9999b5',    // mid-dim prose
  
  // 3D specific
  curve: '#4ecdc4',    // curve color (teal)
  surface: '#e8c060',  // solid surface (gold)
  grid: '#2a2a3e',     // grid lines
  axis: '#6a6b82',     // axis lines
};
```

---

## 11. Rendering with WebGL

**IMPORTANT**: When rendering 3D content, you must specify a WebGL backend:

```bash
# For Apple Silicon Macs
npx remotion render src/index.ts CompositionID out/video.mp4 --gl=angle

# Other options: --gl=swiftshader, --gl=egl
```

Add to package.json scripts:
```json
"render:kimi-3d": "remotion render src/index.ts kimi-SpinningToy3D out/kimi-SpinningToy3D.mp4 --gl=angle"
```

---

## 12. Animation Primitives (3D-Aware)

All 3D animations must use `useCurrentFrame()` from Remotion, NOT `useFrame()` from React Three Fiber:

```tsx
// ✅ CORRECT
const frame = useCurrentFrame();
const rotationY = interpolate(frame, [0, 150], [0, Math.PI * 0.5], {extrapolateRight: 'clamp'});

// ❌ WRONG - causes flickering during render
import { useFrame } from '@react-three/fiber';
useFrame(() => { /* animation */ });
```

---

## 13. Scene Duration Sizing Guide

| Scene Type        | Duration  | 3D Content                                      |
|-------------------|-----------|--------------------------------------------------|
| Title             | 4–6 s     | None (centered text only)                       |
| Setup / Context   | 8–12 s    | 3D curve rotating slowly                         |
| Part intro        | 3–4 s     | Static 3D view                                   |
| Insight moment    | 6–8 s     | Highlight key geometric feature                  |
| Computation       | 7–12 s    | 3D solid with subtle rotation                    |
| Cross-section     | 8–12 s    | Animated disk slicing through solid             |
| Answer            | 3–5 s     | Solid rotates to show result                     |
| Summary           | 6–8 s     | All three answers in text only                   |

---

## 14. Teaching Language Patterns with 3D

| Scene Type | Verbal Cue | 3D Action |
|------------|------------|-----------|
| Setup | "The curve arches from x=0 to x=2" | Camera pans along curve |
| Area | "Region R is the area under this curve" | Region fills with color |
| Disk Method | "Imagine slicing the solid" | Disk appears and moves |
| Volume | "Stack those infinitely thin disks" | Multiple disks stack |
| Cross-section | "At position x, the radius is..." | Disk at specific x-position |

---

## 15. Checklist for a New 3D Educational Video

1. Write solution in a `.md` file, noting every insight and 3D visualization opportunity
2. Create `src/educational/kimi_TopicTutorial.tsx`
3. Define `SCENE_DURATIONS` + `getTotalDuration()`
4. Define palette `C` — confirm gold is only used on final answers
5. Load Lora font at file top
6. **NEW**: Create 3D geometry generation functions
7. **NEW**: Build `Curve3D`, `Solid3D`, and other 3D components
8. **NEW**: Create `Visualization3D` wrapper with `ThreeCanvas`
9. **NEW**: Create `TwoColumnLayout` for side-by-side math + 3D
10. Write one scene component per scene; keep scenes ≤ 5 visible elements
11. Use `<Fade>` for prose, `<WriteIn>` for equations
12. Use `mode` prop to switch between 'curve' | 'solid' | 'cross-section'
13. Wire scenes with `<Series>` + `premountFor={FPS}`
14. Export component + `getTotalDuration`, register in Root.tsx
15. **NEW**: Add `--gl=angle` to render command
16. Run `npx tsc --noEmit` to catch type errors before rendering

---

## 16. Common 3D Pitfalls

### ❌ Using underscore in Composition ID
```tsx
// WRONG
id="kimi_SpinningToy3D"

// CORRECT
id="kimi-SpinningToy3D"
```

### ❌ Using useFrame()
```tsx
// WRONG - causes render flickering
import { useFrame } from '@react-three/fiber';
useFrame((state) => {
  mesh.rotation.y = state.clock.elapsedTime;
});

// CORRECT
const frame = useCurrentFrame();
const rotationY = frame * 0.02;
```

### ❌ Forgetting to use primitive for Lines
```tsx
// WRONG
<line geometry={curveGeometry}>
  <lineBasicMaterial color="#4ecdc4" />
</line>

// CORRECT
<primitive object={new THREE.Line(curveGeometry, new THREE.LineBasicMaterial({color: '#4ecdc4'}))} />
```

### ❌ Not specifying width/height on ThreeCanvas
```tsx
// WRONG
<ThreeCanvas>

// CORRECT
<ThreeCanvas width={960} height={1080}>
```

### ❌ Rendering without --gl flag
```bash
# WRONG - will fail on headless rendering
npx remotion render src/index.ts Comp out.mp4

# CORRECT
npx remotion render src/index.ts Comp out.mp4 --gl=angle
```

---

## 17. Example: Complete Scene with 3D

```tsx
const PartBIntroScene: React.FC = () => {
  const leftContent = (
    <>
      <PartLabel part="b" question="Now we spin the region. What's the volume?" />

      <Fade delay={1} duration={0.5} style={{fontFamily: LORA, fontSize: 26, color: C.fade, marginBottom: 20, lineHeight: 1.6}}>
        Imagine slicing the solid at some position x.
        The cross-section is a disk with radius <span style={{color: C.teal}}>f(x)</span>.
      </Fade>

      <Fade delay={2.4} duration={0.4} style={{fontFamily: LORA, fontSize: 26, color: C.fade, marginBottom: 24, lineHeight: 1.6}}>
        Area of that disk: π · r² = π [f(x)]². Stack those infinitely thin disks from 0 to 2:
      </Fade>

      <Fade delay={3.6} duration={0.4}>
        <div style={{fontFamily: `Georgia, serif`, fontSize: 42, color: C.eq, textAlign: 'center', ...MATH}}>
          V = π ∫₀² [f(x)]² dx
        </div>
      </Fade>
    </>
  );

  return <TwoColumnLayout leftContent={leftContent} mode="solid" />;
};
```

---

## 18. Generating Voiceover Scripts with Timestamps for ElevenLabs

For a polished educational video, you need a synchronized voiceover. Here's how to create a script with timestamps that ElevenLabs can follow.

### Script Format

Create a `kimi_TopicScript.md` file alongside your component:

```markdown
# kimi_SpinningToyScript

## Scene Timing Reference
- Title: 0:00 - 0:05
- Setup: 0:05 - 0:15
- Part A Question: 0:15 - 0:18
- Part A Integral: 0:18 - 0:23
- Part A Insight: 0:23 - 0:30
- Part A Work: 0:30 - 0:38
- Part A Answer: 0:38 - 0:42
- Part B Intro: 0:42 - 0:50
- Part B Work: 0:50 - 1:01
- Part B Answer: 1:01 - 1:05
- Part C Intro: 1:05 - 1:09
- Part C Work: 1:09 - 1:18
- Part C Answer: 1:18 - 1:22
- Summary: 1:22 - 1:29

---

## Scene 1: Title (0:00 - 0:05)
**[0:00 - 0:02]** Pause — let the title breathe.
**[0:02 - 0:05]** "The Spinning Toy Problem — 2017 AP Calculus AB, Free Response Question 5."

---

## Scene 2: Setup (0:05 - 0:15)
**[0:05 - 0:08]** "A company designs spinning toys from a family of curves."
**[0:08 - 0:11]** "The constant c is like a dial — it controls the shape."
**[0:11 - 0:15]** "Region R is the area under this curve in the first quadrant, arching from x equals zero to x equals two."

**Visual Cue:** [0:11] 3D curve appears, slowly rotating.

---

## Scene 3: Part A — The Area (0:15 - 0:42)

### Question (0:15 - 0:18)
**[0:15 - 0:18]** "Part a: What's the area of region R, in terms of c?"

### Setting Up (0:18 - 0:23)
**[0:18 - 0:23]** "Area under a curve — that's just an integral. So we write: A equals the integral from zero to two of c x root four minus x squared dx."

**Visual Cue:** [0:20] Equation writes in. 3D curve shows shaded region.

### The Insight (0:23 - 0:30)
**[0:23 - 0:27]** "Now pause and look at this carefully. We have root four minus x squared under the root..."
**[0:27 - 0:30]** "...and sitting right next to it: x dx. That's a hint."

**Visual Cue:** [0:25] Highlight the x dx term in blue.

### The Substitution (0:30 - 0:38)
**[0:30 - 0:34]** "Try u equals four minus x squared. Differentiate both sides and you get: du equals negative two x dx..."
**[0:34 - 0:38]** "...which means x dx equals negative one half du. It was waiting there all along."

**Visual Cue:** [0:35] Show the substitution algebra.

### Answer (0:38 - 0:42)
**[0:38 - 0:42]** "The area is eight c over three square inches."

---

## Scene 4: Part B — The Volume (0:42 - 1:05)

### Intro (0:42 - 0:50)
**[0:42 - 0:45]** "Part b: Now we spin the region. What's the volume?"
**[0:45 - 0:50]** "Imagine slicing the solid at some position x. The cross-section is a disk with radius f of x."

**Visual Cue:** [0:46] 3D solid appears, rotating. [0:48] Disk slice animates through.

### The Computation (0:50 - 1:01)
**[0:50 - 0:55]** "Area of that disk: pi r squared equals pi times f of x squared. Stack those infinitely thin disks from zero to two."
**[0:55 - 1:01]** "Plug in f of x, expand, then integrate term by term. At x equals two, that's thirty-two thirds minus thirty-two fifths, which is sixty-four fifteenths."

**Visual Cue:** [0:57] Show the integral equation. [1:00] Cross-section disk animates through the solid.

### Answer (1:01 - 1:05)
**[1:01 - 1:05]** "The volume is sixty-four pi c squared over fifteen cubic inches."

---

## Scene 5: Part C — Solving for c (1:05 - 1:22)

### Question (1:05 - 1:09)
**[1:05 - 1:09]** "Part c: If the volume equals exactly two pi, what is c?"

### The Work (1:09 - 1:18)
**[1:09 - 1:13]** "We already know the volume in terms of c. So this is just algebra — set them equal and solve."
**[1:13 - 1:18]** "Divide both sides by pi, solve for c squared, and since c is positive, take the positive root and simplify."

### Answer (1:18 - 1:22)
**[1:18 - 1:22]** "c equals root thirty over eight, approximately zero point six eight four."

---

## Scene 6: Summary (1:22 - 1:29)
**[1:22 - 1:25]** "Here's where we ended up. The area: eight c over three."
**[1:25 - 1:27]** "The volume: sixty-four pi c squared over fifteen."
**[1:27 - 1:29]** "And c: root thirty over eight."

**Visual Cue:** [1:23] All three answers appear in a clean list.

---

## ElevenLabs Voice Settings

- **Voice**: Choose a calm, patient voice (e.g., "Adam" or "Bella")
- **Stability**: 0.5 — slight variation keeps it natural
- **Clarity + Similarity Enhancement**: 0.75 — clear pronunciation of math terms
- **Style**: 0.3 — minimal exclamation, more contemplative

## Recording Tips

1. **Record each scene separately** — easier to re-do one section
2. **Leave natural pauses** — math needs time to sink in
3. **Speak equations slowly** — "x dx" not "ex-dee-ex"
4. **Match the energy to the visual** — excitement for answers, calm for setup

## Sync Check

After generating audio in ElevenLabs:
```bash
# Get audio duration
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 audio.mp3

# If audio is longer than scene, either:
# 1. Trim the audio
# 2. Extend the scene duration in SCENE_DURATIONS
```

---

**Remember**: The goal is to make the math feel tangible. The 3D visualization should illuminate, not distract. Keep it simple, keep it purposeful, and always drive animations with `useCurrentFrame()`. 🎯
