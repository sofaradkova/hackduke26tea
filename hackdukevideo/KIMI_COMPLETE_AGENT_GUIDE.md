# Complete Agent Guide: Creating 3D Educational Videos with Remotion

**One-shot guide for agents to create 3D educational math videos.**

---

## PREREQUISITES CHECKLIST

Before starting, verify:
- [ ] Node.js installed (v18+)
- [ ] Directory exists: `/Users/pierce/Documents/hackdukevideo/testremotion/`
- [ ] Project already has Remotion set up
- [ ] Problem solution markdown file exists (e.g., `1-1.md`)

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

**File to create:** `testremotion/src/educational/kimi_[TOPIC]Script.md`

**Template:**

```markdown
# kimi_[TOPIC]Script

## Scene Timing Reference
Use FPS = 30. Calculate frames as seconds × 30.

| Scene | Seconds | Frames | Cumulative |
|-------|---------|--------|------------|
| Title | 5 | 150 | 0-150 |
| Setup | 10 | 300 | 150-450 |
| Part A Question | 3 | 90 | 450-540 |
| [etc...] | | | |

Total duration: [SUM] frames

---

## Scene 1: Title (0:00 - 0:05)
**[0:00 - 0:02]** Pause — let the title breathe.
**[0:02 - 0:05]** "[Title] — [Source]"

---

## Scene 2: Setup (0:05 - 0:15)
**[0:05 - 0:08]** "[Context sentence]"
**[0:08 - 0:11]** "[Key variable explanation]"
**[0:11 - 0:15]** "[Region/domain description]"

**Visual Cue:** [0:11] 3D curve appears, slowly rotating.

[Continue for all scenes...]
```

**Rules for writing:**
1. Write spoken numbers as words: "x equals two" not "x = 2"
2. Use plain language: "square root of" not "√"
3. Mark intentional pauses: "[pause 1 second]"
4. Include Visual Cues at exact timestamps

---

## STEP 3: Calculate Scene Durations

**In your TSX file, define:**

```typescript
const FPS = 30;

export const SCENE_DURATIONS = {
  title:          5  * FPS,  // 150 frames
  setup:          10 * FPS,  // 300 frames
  partAQuestion:  3  * FPS,  // 90 frames
  partAIntegral:  5  * FPS,
  partAInsight:   7  * FPS,
  partAWork:      8  * FPS,
  partAAnswer:    4  * FPS,
  partBIntro:     8  * FPS,
  partBWork:      11 * FPS,
  partBAnswer:    4  * FPS,
  partCIntro:     4  * FPS,
  partCWork:      9  * FPS,
  partCAnswer:    4  * FPS,
  summary:        7  * FPS,
};

export const getTotalDuration = () =>
  Object.values(SCENE_DURATIONS).reduce((a, b) => a + b, 0);
// This returns 2670 for the example above
```

**VERIFY:** Sum of all durations matches your script's total time.

---

## STEP 4: Create the Complete TSX Component

**File to create:** `testremotion/src/educational/kimi-[TOPIC]Tutorial.tsx`

**COMPLETE TEMPLATE - Copy and modify:**

```tsx
import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Series,
} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Lora';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';

// ═══════════════════════════════════════════════════
// STEP 4A: LOAD FONT
// ═══════════════════════════════════════════════════
const {fontFamily: LORA} = loadFont('normal', {
  weights: ['400', '700'],
  subsets: ['latin'],
});

// ═══════════════════════════════════════════════════
// STEP 4B: TIMING CONFIG
// ═══════════════════════════════════════════════════
const FPS = 30;

export const SCENE_DURATIONS = {
  title:          5  * FPS,
  setup:          10 * FPS,
  partAQuestion:  3  * FPS,
  partAIntegral:  5  * FPS,
  partAInsight:   7  * FPS,
  partAWork:      8  * FPS,
  partAAnswer:    4  * FPS,
  partBIntro:     8  * FPS,
  partBWork:      11 * FPS,
  partBAnswer:    4  * FPS,
  partCIntro:     4  * FPS,
  partCWork:      9  * FPS,
  partCAnswer:    4  * FPS,
  summary:        7  * FPS,
};

export const getTotalDuration = () =>
  Object.values(SCENE_DURATIONS).reduce((a, b) => a + b, 0);

// ═══════════════════════════════════════════════════
// STEP 4C: COLOR PALETTE
// ═══════════════════════════════════════════════════
const C = {
  bg:    '#0e0f1a',
  text:  '#e4e4f0',
  dim:   '#6a6b82',
  eq:    '#f4f4ff',
  gold:  '#e8c060',
  blue:  '#5b9cf6',
  teal:  '#4ecdc4',
  fade:  '#9999b5',
  curve: '#4ecdc4',
  surface: '#e8c060',
  grid: '#2a2a3e',
  axis: '#6a6b82',
};

// ═══════════════════════════════════════════════════
// STEP 4D: MATH HELPER
// ═══════════════════════════════════════════════════
const MATH: React.CSSProperties = {
  fontFamily: `'STIX Two Math', Georgia, serif`,
};

const Frac: React.FC<{num: React.ReactNode; den: React.ReactNode}> = ({num, den}) => (
  <span
    style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      verticalAlign: 'middle',
      margin: '0 2px',
      lineHeight: 1.15,
      fontSize: '0.85em',
    }}
  >
    <span style={{borderBottom: `1.5px solid ${C.eq}`, paddingBottom: 1, padding: '0 3px'}}>{num}</span>
    <span style={{paddingTop: 1, padding: '0 3px'}}>{den}</span>
  </span>
);

// ═══════════════════════════════════════════════════
// STEP 4E: ANIMATION PRIMITIVES
// ═══════════════════════════════════════════════════

const Fade: React.FC<{
  delay?: number;
  duration?: number;
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

const WriteIn: React.FC<{
  text: string;
  delay?: number;
  charsPerSec?: number;
  style?: React.CSSProperties;
}> = ({text, delay = 0, charsPerSec = 28, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const startFrame = delay * fps;
  if (frame < startFrame) return null;

  const elapsed = frame - startFrame;
  const chars = Math.min(text.length, Math.floor((elapsed / fps) * charsPerSec));
  const visible = text.slice(0, chars);
  const hidden = text.slice(chars);

  return (
    <span style={style}>
      {visible}
      <span style={{opacity: 0}}>{hidden}</span>
    </span>
  );
};

const DrawLine: React.FC<{delay?: number; color?: string; width?: number}> = ({
  delay = 0,
  color = C.dim,
  width = 600,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const progress = interpolate(
    frame,
    [delay * fps, (delay + 0.7) * fps],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return (
    <div
      style={{
        height: 1,
        width: width * progress,
        background: color,
        borderRadius: 1,
        margin: '18px 0',
      }}
    />
  );
};

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

// ═══════════════════════════════════════════════════
// STEP 4F: 3D GEOMETRY GENERATORS
// ═══════════════════════════════════════════════════

// MODIFY THIS: Generate points for YOUR curve
const generateCurvePoints = (c: number = 1, segments: number = 100): THREE.Vector3[] => {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * 2; // MODIFY: domain max
    // MODIFY: Your function here
    const y = c * x * Math.sqrt(Math.max(0, 4 - x * x));
    points.push(new THREE.Vector3(x, y, 0));
  }
  return points;
};

// MODIFY THIS: Generate surface of revolution
const generateSolidPoints = (c: number = 1, xSegments: number = 50, thetaSegments: number = 60) => {
  const positions: number[] = [];
  const normals: number[] = [];
  
  for (let i = 0; i < xSegments; i++) {
    const x1 = (i / xSegments) * 2; // MODIFY: domain
    const x2 = ((i + 1) / xSegments) * 2;
    // MODIFY: Your radius function
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

// ═══════════════════════════════════════════════════
// STEP 4G: 3D CURVE COMPONENT
// ═══════════════════════════════════════════════════

const Curve3D: React.FC<{c?: number; frame: number; showRegion?: boolean}> = ({c = 1, frame, showRegion = false}) => {
  const {fps} = useVideoConfig();
  
  const scale = spring({frame, fps, config: {damping: 100}});
  
  const curvePoints = useMemo(() => generateCurvePoints(c), [c]);
  
  const curveGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(curvePoints);
  }, [curvePoints]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[0, 5, 0]} intensity={0.5} />
      
      <gridHelper args={[6, 30, C.grid, C.grid]} position={[1, -0.1, 0]} />
      <axesHelper args={[3]} position={[0, 0, 0]} />
      
      <group scale={scale}>
        <primitive object={new THREE.Line(curveGeometry, new THREE.LineBasicMaterial({color: C.curve, linewidth: 3}))} />
        
        {showRegion && curvePoints.slice(0, -1).map((point, i) => {
          const nextPoint = curvePoints[i + 1];
          const midX = (point.x + nextPoint.x) / 2;
          const height = (point.y + nextPoint.y) / 2;
          const width = nextPoint.x - point.x;
          return (
            <mesh key={i} position={[midX, height / 2, 0]}>
              <boxGeometry args={[width, height, 0.05]} />
              <meshBasicMaterial color={C.teal} transparent opacity={0.3} />
            </mesh>
          );
        })}
      </group>
    </>
  );
};

// ═══════════════════════════════════════════════════
// STEP 4H: 3D SOLID COMPONENT
// ═══════════════════════════════════════════════════

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

  const diskX = interpolate(cutProgress, [0, 1], [0, 2]); // MODIFY: domain
  const diskR = c * diskX * Math.sqrt(Math.max(0, 4 - diskX * diskX)); // MODIFY: radius function

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[0, 5, 0]} intensity={0.5} />
      <pointLight position={[3, -2, 3]} intensity={0.3} />
      
      <gridHelper args={[6, 30, C.grid, C.grid]} position={[1, -0.5, 0]} />
      
      <group scale={scale} rotation={[0, viewRotation * 0.3, 0]}>
        <mesh geometry={solidGeometry}>
          <meshStandardMaterial 
            color={C.surface}
            transparent 
            opacity={0.7}
            side={THREE.DoubleSide}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
        
        {showCrossSection && cutProgress > 0 && (
          <mesh position={[diskX, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <circleGeometry args={[diskR, 64]} />
            <meshBasicMaterial color={C.teal} transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    </>
  );
};

// ═══════════════════════════════════════════════════
// STEP 4I: 3D CANVAS WRAPPER
// ═══════════════════════════════════════════════════

const Visualization3D: React.FC<{
  mode: 'curve' | 'solid' | 'cross-section';
  frame: number;
  c?: number;
  cutProgress?: number;
}> = ({mode, frame, c = 1, cutProgress = 0}) => {
  const {width, height} = useVideoConfig();
  
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

// ═══════════════════════════════════════════════════
// STEP 4J: LAYOUT COMPONENTS
// ═══════════════════════════════════════════════════

const Background: React.FC = () => (
  <AbsoluteFill style={{background: C.bg}} />
);

const TwoColumnLayout: React.FC<{
  leftContent: React.ReactNode;
  mode: 'curve' | 'solid' | 'cross-section';
  cutProgress?: number;
}> = ({leftContent, mode, cutProgress = 0}) => {
  const frame = useCurrentFrame();
  
  return (
    <AbsoluteFill style={{display: 'flex'}}>
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
      
      <Visualization3D mode={mode} frame={frame} c={1} cutProgress={cutProgress} />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════
// STEP 4K: SCENE COMPONENTS (MODIFY FOR YOUR PROBLEM)
// ═══════════════════════════════════════════════════

// SCENE 1: TITLE
const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 25], [0, 1], {extrapolateRight: 'clamp'});
  const subtitleOpacity = interpolate(frame, [20, 45], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const funcOpacity = interpolate(frame, [50, 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 120px',
      }}
    >
      <div style={{opacity: subtitleOpacity, fontFamily: LORA, fontSize: 22, color: C.dim, letterSpacing: '0.1em', marginBottom: 24}}>
        {/* MODIFY: Your source */}
        2017 AP Calculus AB · Free Response, Question 5
      </div>

      <div
        style={{
          opacity: titleOpacity,
          fontFamily: LORA,
          fontWeight: '700',
          fontSize: 80,
          color: C.text,
          textAlign: 'center',
          marginBottom: 48,
          lineHeight: 1.15,
        }}
      >
        {/* MODIFY: Your title */}
        The Spinning Toy Problem
      </div>

      <div
        style={{
          opacity: funcOpacity,
          fontFamily: `'STIX Two Math', Georgia, serif`,
          fontSize: 54,
          color: C.gold,
          textAlign: 'center',
          letterSpacing: '0.02em',
        }}
      >
        {/* MODIFY: Your function */}
        y = cx√(4 − x²)
      </div>
    </AbsoluteFill>
  );
};

// SCENE 2: SETUP (with 3D curve)
const SetupScene: React.FC = () => {
  const leftContent = (
    <>
      <Fade delay={0} duration={0.5} style={{fontFamily: LORA, fontSize: 28, color: C.text, marginBottom: 20, lineHeight: 1.6}}>
        {/* MODIFY: Your setup text */}
        A company designs spinning toys from a family of curves.
        The constant <span style={{color: C.gold}}>c</span> is like a dial — it controls the shape.
      </Fade>

      <Fade delay={1.2} duration={0.5} style={{fontFamily: `Georgia, serif`, fontSize: 42, color: C.eq, marginBottom: 28, textAlign: 'center', ...MATH}}>
        {/* MODIFY: Your function */}
        y = cx√(4 − x²)
      </Fade>

      <Fade delay={2.2} duration={0.5} style={{fontFamily: LORA, fontSize: 26, color: C.fade, lineHeight: 1.6, marginBottom: 16}}>
        {/* MODIFY: Your region description */}
        Region R is the area <em>under</em> this curve, in the first quadrant.
        The curve arches from x = 0 to x = 2, touching zero at both ends.
      </Fade>
    </>
  );

  return <TwoColumnLayout leftContent={leftContent} mode="curve" />;
};

// ADD MORE SCENES HERE...
// Follow the pattern:
// 1. Create leftContent with Fade components
// 2. Return <TwoColumnLayout leftContent={leftContent} mode="..." />
// Mode options: 'curve', 'solid', 'cross-section'

// ═══════════════════════════════════════════════════
// STEP 4L: ROOT COMPOSITION
// ═══════════════════════════════════════════════════

export const kimi_[TOPIC]Tutorial: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Series>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.title} premountFor={FPS}>
        <TitleScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={SCENE_DURATIONS.setup} premountFor={FPS}>
        <SetupScene />
      </Series.Sequence>

      {/* ADD MORE SCENES HERE */}
      
    </Series>
  </AbsoluteFill>
);
```

---

## STEP 5: Update Root.tsx

**File to modify:** `testremotion/src/Root.tsx`

**Add this import at the top:**
```tsx
import {kimi_[TOPIC]Tutorial, getTotalDuration} from './educational/kimi-[TOPIC]Tutorial';
```

**Add this Composition inside the Root component (before the closing `</>`):**
```tsx
<Composition
  id="kimi-[TOPIC]Tutorial"
  component={kimi_[TOPIC]Tutorial}
  durationInFrames={getTotalDuration()}
  fps={30}
  width={1920}
  height={1080}
/>
```

**CRITICAL:** Composition ID can only contain: a-z, A-Z, 0-9, and hyphens (-). NO underscores!

---

## STEP 6: Verify TypeScript

**Command:**
```bash
cd /Users/pierce/Documents/hackdukevideo/testremotion && npx tsc --noEmit
```

**Expected result:** No errors (or only errors in unrelated files).

**Common errors and fixes:**

| Error | Fix |
|-------|-----|
| `Property 'controls' does not exist` | Unrelated to your file, ignore |
| `Cannot find module` | Run `npm install` |
| `useFrame is not defined` | Remove `useFrame` import from @react-three/fiber |
| `lineBasicMaterial` lowercase | Use `<primitive object={new THREE.Line(...)} />` |

---

## STEP 7: Render the Video

**Command:**
```bash
cd /Users/pierce/Documents/hackdukevideo/testremotion && npx remotion render src/index.ts kimi-[TOPIC]Tutorial out/kimi-[TOPIC]Tutorial.mp4 --gl=angle
```

**The `--gl=angle` flag is REQUIRED for 3D rendering.**

**On Apple Silicon Macs, use:** `--gl=angle`
**On other systems, try:** `--gl=swiftshader` or `--gl=egl`

**Expected output:**
```
Rendered 2670/2670
Encoded 2670/2670
+ out/kimi-[TOPIC]Tutorial.mp4 28 MB
```

---

## STEP 8: Verify Output

**Check the file exists:**
```bash
ls -lh /Users/pierce/Documents/hackdukevideo/testremotion/out/kimi-[TOPIC]Tutorial.mp4
```

**Expected:** File size should be 10-50MB depending on duration and complexity.

---

## COMPLETE CHECKLIST

Before declaring success:

- [ ] Script markdown file created with timestamps
- [ ] Scene durations calculated (seconds × 30)
- [ ] getTotalDuration() returns correct total
- [ ] TSX file created in `src/educational/`
- [ ] All MODIFY sections customized for your problem
- [ ] Root.tsx updated with import and Composition
- [ ] TypeScript compiles without errors in your file
- [ ] Video renders successfully with --gl=angle
- [ ] Output file exists and is > 10MB
- [ ] All files have `kimi` prefix as requested

---

## TROUBLESHOOTING

### "Error creating WebGL context"
**Solution:** Add `--gl=angle` to render command

### "Composition id can only contain a-z, A-Z, 0-9, and -"
**Solution:** Change underscores to hyphens in id prop

### "Cannot redeclare exported variable"
**Solution:** Remove duplicate export statement

### Video is black or empty
**Solution:** Check that ThreeCanvas has explicit width/height props

### 3D objects not appearing
**Solution:** Verify lighting is included (ambientLight + directionalLight)

### Animations flicker during render
**Solution:** Ensure using `useCurrentFrame()` NOT `useFrame()` from @react-three/fiber

---

## EXAMPLE: COMPLETE FILE STRUCTURE AFTER SUCCESS

```
testremotion/
├── src/
│   ├── Root.tsx                    (modified with your Composition)
│   └── educational/
│       ├── kimi-[TOPIC]Tutorial.tsx (your new component)
│       └── kimi-[TOPIC]Script.md    (your voiceover script)
├── out/
│   └── kimi-[TOPIC]Tutorial.mp4    (final video output)
└── package.json                     (with render script added)
```

---

## AGENT EXECUTION PROTOCOL

When given this guide + a problem/solution markdown file:

1. **READ** the problem markdown file first
2. **EXTRACT**: function, domain, parts, key insights, answers
3. **CALCULATE** scene durations based on script content
4. **COPY** the complete TSX template
5. **MODIFY** all sections marked with "MODIFY"
6. **UPDATE** Root.tsx with exact code provided
7. **RUN** TypeScript check
8. **FIX** any errors
9. **RENDER** with --gl=angle
10. **VERIFY** output file exists

**Do NOT skip steps. Do NOT assume. Follow exactly.**

---

**Follow these steps exactly and the video will work.** 🎯
