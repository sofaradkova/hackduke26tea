# CLAUDE: Educational Math Video Guide (Remotion + Three.js)

Everything a fresh Claude instance needs to build a step-by-step math tutorial video
from scratch — 3B1B/Khan Academy style, 1920×1080, split-screen with live 3D on the right.

**Working example:** `testremotion/src/educational/SpinningToyTutorial.tsx`
**Rendered output:** `testremotion/out/spinning-toy-tutorial.mp4`

---

## 1. Install Dependencies

```bash
cd testremotion

# Already present in this project — only run if starting fresh:
npx remotion add @remotion/google-fonts
npm install --save-exact @remotion/three@4.0.423 @react-three/fiber three @types/three --legacy-peer-deps
```

`package.json` should include:
```json
{
  "@remotion/google-fonts": "4.0.423",
  "@remotion/three": "4.0.423",
  "@remotion/transitions": "^4.0.438",
  "@react-three/fiber": "^8.x",
  "three": "^0.x",
  "react": "18.3.1",
  "remotion": "^4.0.423"
}
```

---

## 2. File Layout

```
testremotion/src/
  educational/
    SpinningToyTutorial.tsx   ← one file: all scenes + 3D + helpers
    kimi-SpinningToyWith3D.tsx ← thin re-export (if Root.tsx needs an alias)
  APCalcFRQWalkthrough.tsx    ← re-export for another Composition ID
  Root.tsx                    ← registers Compositions
```

One topic = one file in `src/educational/`. Keep everything in that single file
unless it exceeds ~700 lines.

---

## 3. Register in Root.tsx

```tsx
import {SpinningToyTutorial, getTotalDuration} from './educational/SpinningToyTutorial';

<Composition
  id="SpinningToyTutorial"
  component={SpinningToyTutorial}
  durationInFrames={getTotalDuration()}   // always derived, never hardcoded
  fps={30}
  width={1920}
  height={1080}
/>
```

---

## 4. Render Commands

```bash
# Preview in browser
npm run dev

# Render WITHOUT 3D (fast, any concurrency)
npx remotion render src/index.ts SpinningToyTutorial out/out.mp4

# Render WITH ThreeCanvas — BOTH flags are required
npx remotion render src/index.ts SpinningToyTutorial out/out.mp4 \
  --gl=angle \
  --concurrency=1
```

**`--gl=angle`** — without this, headless Chrome fails to create a WebGL context
(`BindToCurrentSequence failed`). Required for any composition using ThreeCanvas.

**`--concurrency=1`** — multiple concurrent render tabs each try to claim the same
WebGL context and all fail. 3D renders must be single-threaded.

---

## 5. Complete File Template

Copy this as the starting skeleton for any new educational video.

```tsx
import React, {useMemo} from 'react';
import {
  AbsoluteFill, interpolate, spring,
  useCurrentFrame, useVideoConfig, Series,
} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Lora';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';

// ── FONTS ─────────────────────────────────────
const {fontFamily: LORA} = loadFont('normal', {weights: ['400', '700'], subsets: ['latin']});

// ── TIMING ────────────────────────────────────
const FPS = 30;

export const SCENE_DURATIONS = {
  title:    5 * FPS,
  setup:   10 * FPS,
  // add one key per scene
};

export const getTotalDuration = () =>
  Object.values(SCENE_DURATIONS).reduce((a, b) => a + b, 0);

// ── PALETTE ───────────────────────────────────
const C = {
  bg:    '#0e0f1a',  // near-black background
  panel: '#0a0b15',  // 3D panel background (slightly darker)
  text:  '#e4e4f0',  // titles and questions
  dim:   '#6a6b82',  // part labels, footnotes, dividers
  eq:    '#f4f4ff',  // equations — near-white, most prominent
  gold:  '#e8c060',  // FINAL ANSWERS ONLY — warm, authoritative
  blue:  '#5b9cf6',  // variable highlights (use sparingly)
  teal:  '#4ecdc4',  // geometric/3D highlights (use sparingly)
  fade:  '#9999b5',  // secondary prose
};

// ── MATH HELPERS ──────────────────────────────
const Frac: React.FC<{num: React.ReactNode; den: React.ReactNode}> = ({num, den}) => (
  <span style={{display:'inline-flex', flexDirection:'column', alignItems:'center',
                verticalAlign:'middle', margin:'0 2px', lineHeight:1.15, fontSize:'0.85em'}}>
    <span style={{borderBottom:`1.5px solid ${C.eq}`, padding:'0 3px'}}>{num}</span>
    <span style={{padding:'0 3px'}}>{den}</span>
  </span>
);

// ── 2D ANIMATION PRIMITIVES ───────────────────

/** Simple fade-in. No slides, no bounce. delay and duration in seconds. */
const Fade: React.FC<{delay?:number; duration?:number; children:React.ReactNode; style?:React.CSSProperties}> =
  ({delay=0, duration=0.6, children, style}) => {
    const frame = useCurrentFrame();
    const {fps} = useVideoConfig();
    const opacity = interpolate(frame, [delay*fps, (delay+duration)*fps], [0,1],
      {extrapolateLeft:'clamp', extrapolateRight:'clamp'});
    return <div style={{opacity, ...style}}>{children}</div>;
  };

/** Thin horizontal rule that draws from left to right. */
const DrawLine: React.FC<{delay?:number; color?:string; width?:number}> =
  ({delay=0, color=C.dim, width=500}) => {
    const frame = useCurrentFrame();
    const {fps} = useVideoConfig();
    const p = interpolate(frame, [delay*fps, (delay+0.7)*fps], [0,1],
      {extrapolateLeft:'clamp', extrapolateRight:'clamp'});
    return <div style={{height:1, width:width*p, background:color, borderRadius:1, margin:'16px 0'}} />;
  };

/** Quiet part header: small dim "part (a)" + plain question text. No badges. */
const PartLabel: React.FC<{part:string; question:string}> = ({part, question}) => (
  <div style={{marginBottom:32}}>
    <Fade delay={0} duration={0.4}>
      <div style={{fontFamily:LORA, fontSize:20, color:C.dim, letterSpacing:'0.08em', marginBottom:8}}>
        part ({part})
      </div>
    </Fade>
    <Fade delay={0.3} duration={0.5}>
      <div style={{fontFamily:LORA, fontSize:32, color:C.text, lineHeight:1.4}}>{question}</div>
    </Fade>
  </div>
);

// ── 3D COMPONENTS ─────────────────────────────
// Rules:
//   • useFrame() from @react-three/fiber is FORBIDDEN
//   • All animation must use useCurrentFrame()
//   • useThree() IS allowed
//   • Build geometries with useMemo
//   • Use <primitive object={...}> for THREE.Line to avoid JSX naming conflicts

/** Positions + optionally orbits the camera every frame. Must live inside ThreeCanvas. */
const CameraRig: React.FC<{
  pos: [number,number,number];
  target: [number,number,number];
  rotateSpeed?: number;   // radians/frame; 0 = static
}> = ({pos, target, rotateSpeed=0}) => {
  const {camera} = useThree();
  const frame = useCurrentFrame();
  if (rotateSpeed > 0) {
    const angle = frame * rotateSpeed;
    const r = Math.hypot(pos[0], pos[2]);
    camera.position.set(Math.sin(angle)*r, pos[1], Math.cos(angle)*r);
  } else {
    camera.position.set(...pos);
  }
  camera.lookAt(...target);
  return null;
};

// ── SPLIT-SCREEN LAYOUT ───────────────────────

/** 960px text left, 960px ThreeCanvas right. Use as wrapper for every scene. */
const SplitScene: React.FC<{left:React.ReactNode; right:React.ReactNode}> = ({left, right}) => (
  <AbsoluteFill>
    <div style={{position:'absolute', left:0, top:0, width:960, height:1080,
                 display:'flex', flexDirection:'column', justifyContent:'center',
                 padding:'60px 64px 60px 100px'}}>
      {left}
    </div>
    <div style={{position:'absolute', right:0, top:0, width:960, height:1080, background:C.panel}}>
      <div style={{position:'absolute', left:0, top:80, bottom:80, width:1, background:'rgba(106,107,130,0.18)'}} />
      <ThreeCanvas width={960} height={1080}>
        {right}
      </ThreeCanvas>
    </div>
  </AbsoluteFill>
);

// ── ANSWER SCENE ──────────────────────────────

/** Full answer reveal: gold equation, underline draws in, optional note. */
const AnswerScene: React.FC<{
  part: string;
  equation: React.ReactNode;
  note?: string;
  right: React.ReactNode;   // 3D panel content
}> = ({part, equation, note, right}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = spring({frame:frame-10, fps, config:{damping:200}});
  const eqOp  = interpolate(frame, [10,30], [0,1], {extrapolateLeft:'clamp', extrapolateRight:'clamp'});
  const lineW = interpolate(frame, [35,72], [0,1], {extrapolateLeft:'clamp', extrapolateRight:'clamp'});

  return (
    <SplitScene
      left={
        <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start'}}>
          <div style={{fontFamily:LORA, fontSize:20, color:C.dim, letterSpacing:'0.08em', marginBottom:28}}>
            part ({part})
          </div>
          <div style={{opacity:eqOp, transform:`scale(${scale})`,
                       fontFamily:`'STIX Two Math', Georgia, serif`,
                       fontSize:66, color:C.gold, marginBottom:14}}>
            {equation}
          </div>
          <div style={{width:lineW*360, height:2, background:C.gold, opacity:0.55, borderRadius:1}} />
          {note && (
            <div style={{opacity:interpolate(frame,[45,75],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),
                         fontFamily:LORA, fontSize:22, color:C.dim, marginTop:20}}>
              {note}
            </div>
          )}
        </div>
      }
      right={right}
    />
  );
};

// ── BACKGROUND ────────────────────────────────
const Background: React.FC = () => <AbsoluteFill style={{background:C.bg}} />;

// ── SCENES ────────────────────────────────────
// Each scene uses <SplitScene left={...} right={<ThreeCanvas content>} />
// left  = Fade/DrawLine/PartLabel elements
// right = CameraRig + lights + 3D geometry components

const TitleScene: React.FC = () => (
  <SplitScene
    left={
      <>
        <Fade delay={0} style={{fontFamily:LORA, fontSize:20, color:C.dim, letterSpacing:'0.1em', marginBottom:20}}>
          Subject &nbsp;·&nbsp; Source
        </Fade>
        <Fade delay={0.3} style={{fontFamily:LORA, fontWeight:'700', fontSize:58, color:C.text, lineHeight:1.2, marginBottom:36}}>
          Title of the Problem
        </Fade>
        <Fade delay={1.2} style={{fontFamily:`'STIX Two Math',Georgia,serif`, fontSize:46, color:C.gold}}>
          f(x) = ...
        </Fade>
      </>
    }
    right={
      <>
        <CameraRig pos={[0.5,1.3,4.2]} target={[0,0.55,0]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[4,6,3]} intensity={0.95} />
        {/* your 3D geometry here */}
      </>
    }
  />
);

// ── ROOT COMPOSITION ──────────────────────────
export const MyTutorial: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Series>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.title} premountFor={FPS}>
        <TitleScene />
      </Series.Sequence>
      {/* one Series.Sequence per scene */}
    </Series>
  </AbsoluteFill>
);
```

---

## 6. Design Rules (never break these)

| Rule | Rationale |
|------|-----------|
| `C.gold` on one thing per scene — the answer | Every other gold dilutes the reveal moment |
| Lora for prose, `STIX Two Math, Georgia, serif` for equations | system-ui looks AI-generated |
| `<Fade>` not slide-up for text | Slides feel like a slide deck; fades feel like ideas arriving |
| `useFrame()` from R3F is **FORBIDDEN** | Causes flickering in Remotion's frame-by-frame renderer |
| All 3D animation via `useCurrentFrame()` | Same reason |
| `useMemo` on every THREE geometry | Geometries are expensive; don't rebuild them every render call |
| `<primitive object={new THREE.Line(...)}>` not `<line>` | Avoids JSX conflict with HTML `<line>` element |
| `--gl=angle --concurrency=1` when rendering 3D | Without these the render crashes (WebGL context failure) |
| `getTotalDuration()` in Root.tsx, never hardcoded | Hardcoded durations go stale silently |
| `premountFor={FPS}` on every `Series.Sequence` | Pre-loads the next scene 1 second early |

---

## 7. Teaching Voice Rules (KA / 3B1B style)

**Avoid (lecture mode):**
- "Step 1 — Set up the integral"
- Bold colored section headers
- Numbered steps as titles
- Dumping all steps at once

**Use instead (reasoning-together mode):**
- "Area under a curve is just an integral. So we write:"
- "Pause here. There's something in there practically asking to be substituted."
- "That's a hint." — Socratic nudge before a technique
- "It was waiting there all along." — confirm an insight after it lands
- "That's just algebra." — low-pressure framing before mechanical work
- Small `part (a)` in dim text, then the question itself as the visual header

**Pacing:**
- One equation gets ~1.2–1.5 s of screen time before the next appears
- Insight moments (u-sub, disk method concept) get 6–8 s — don't rush them
- Answer scenes stay on screen for at least 4 s so the underline animation completes

---

## 8. All Animation Primitives

### Fade

```tsx
const Fade: React.FC<{delay?:number; duration?:number; children:React.ReactNode; style?:React.CSSProperties}> =
  ({delay=0, duration=0.6, children, style}) => {
    const frame = useCurrentFrame();
    const {fps} = useVideoConfig();
    const opacity = interpolate(frame, [delay*fps, (delay+duration)*fps], [0,1],
      {extrapolateLeft:'clamp', extrapolateRight:'clamp'});
    return <div style={{opacity, ...style}}>{children}</div>;
  };
```

### WriteIn (typewriter for short equations)

```tsx
// Always use string slicing — NEVER per-character opacity (Remotion rule)
const WriteIn: React.FC<{text:string; delay?:number; charsPerSec?:number; style?:React.CSSProperties}> =
  ({text, delay=0, charsPerSec=28, style}) => {
    const frame = useCurrentFrame();
    const {fps} = useVideoConfig();
    const start = delay * fps;
    if (frame < start) return null;
    const chars = Math.min(text.length, Math.floor(((frame-start)/fps)*charsPerSec));
    return (
      <span style={style}>
        {text.slice(0, chars)}
        <span style={{opacity:0}}>{text.slice(chars)}</span>  {/* layout placeholder */}
      </span>
    );
  };
```

### DrawLine

```tsx
const DrawLine: React.FC<{delay?:number; color?:string; width?:number}> =
  ({delay=0, color=C.dim, width=500}) => {
    const frame = useCurrentFrame();
    const {fps} = useVideoConfig();
    const p = interpolate(frame, [delay*fps, (delay+0.7)*fps], [0,1],
      {extrapolateLeft:'clamp', extrapolateRight:'clamp'});
    return <div style={{height:1, width:width*p, background:color, borderRadius:1, margin:'16px 0'}} />;
  };
```

### Spring (for answer scale-in only)

```tsx
// Use damping:200 for smooth entry with no bounce
const scale = spring({frame: frame - delayFrames, fps, config: {damping: 200}});
```

---

## 9. 3D Component Library

### CameraRig

```tsx
const CameraRig: React.FC<{pos:[n,n,n]; target:[n,n,n]; rotateSpeed?:number}> =
  ({pos, target, rotateSpeed=0}) => {
    const {camera} = useThree();          // useThree() IS allowed in Remotion
    const frame = useCurrentFrame();
    if (rotateSpeed > 0) {
      const angle = frame * rotateSpeed;
      const r = Math.hypot(pos[0], pos[2]);
      camera.position.set(Math.sin(angle)*r, pos[1], Math.cos(angle)*r);
    } else {
      camera.position.set(...pos);
    }
    camera.lookAt(...target);
    return null;
  };
```

Camera angles that work for this coordinate system (x: −1→1, y: 0→2):

| View | pos | target |
|------|-----|--------|
| 2D curve/region (near-ortho) | `[0.5, 1.3, 4.2]` | `[0, 0.55, 0]` |
| 3D solid (45° angle) | `[3.2, 1.6, 3.5]` | `[0, 0.55, 0]` |

Slow orbit: `rotateSpeed={0.012}` ≈ one full revolution per 17 s.

### Axes

```tsx
const Axes: React.FC = () => {
  const geo = useMemo(() => {
    const pts = [
      new THREE.Vector3(-1.25, 0, 0), new THREE.Vector3(1.35, 0, 0),  // x-axis
      new THREE.Vector3(-1, -0.1, 0), new THREE.Vector3(-1, 2.4, 0),  // y-axis
      // x ticks at x=0,1,2
      new THREE.Vector3(-1,-0.06,0), new THREE.Vector3(-1,0.06,0),
      new THREE.Vector3( 0,-0.06,0), new THREE.Vector3( 0,0.06,0),
      new THREE.Vector3( 1,-0.06,0), new THREE.Vector3( 1,0.06,0),
    ];
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);
  return <primitive object={new THREE.LineSegments(geo, new THREE.LineBasicMaterial({color:'#6a6b82'}))} />;
};
```

### CurveLine

```tsx
// Coordinate convention: xParam ∈ [0,2] → px = xParam−1 (centered on origin)
const CurveLine: React.FC<{c:number; color?:string}> = ({c, color=C.blue}) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const x = (i/120)*2;
      pts.push(new THREE.Vector3(x-1, c*x*Math.sqrt(Math.max(0, 4-x*x)), 0));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [c]);
  return <primitive object={new THREE.Line(geo, new THREE.LineBasicMaterial({color}))} />;
};
```

### RegionFill (area under curve, animated left→right)

```tsx
const RegionFill: React.FC<{c:number; progress?:number}> = ({c, progress=1}) => {
  const geo = useMemo(() => {
    const segs = 120, active = Math.max(1, Math.floor(segs*progress));
    const shape = new THREE.Shape();
    shape.moveTo(-1, 0);
    for (let i = 0; i <= active; i++) {
      const x = (i/segs)*2;
      shape.lineTo(x-1, c*x*Math.sqrt(Math.max(0, 4-x*x)));
    }
    shape.lineTo((active/segs)*2-1, 0);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, [c, progress]);
  return (
    <mesh geometry={geo} position={[0,0,-0.01]}>
      <meshBasicMaterial color={C.blue} transparent opacity={0.22} side={THREE.DoubleSide} />
    </mesh>
  );
};
```

### DiskSlice (disk method cross-section)

```tsx
// CylinderGeometry axis = Y; rotate 90° to align with x-axis
const DiskSlice: React.FC<{c:number; xPos:number; opacity?:number}> = ({c, xPos, opacity=0.65}) => {
  const r = c * xPos * Math.sqrt(Math.max(0, 4-xPos*xPos));
  return (
    <mesh position={[xPos-1, 0, 0]} rotation={[0, 0, Math.PI/2]}>
      <cylinderGeometry args={[r, r, 0.035, 48]} />
      <meshStandardMaterial color={C.gold} transparent opacity={opacity} side={THREE.DoubleSide} />
    </mesh>
  );
};
```

### SolidMesh (solid of revolution around x-axis)

```tsx
// Custom BufferGeometry — revolves y=cx√(4−x²) around the x-axis.
// Both endpoints have r=0 so no end caps needed; solid tapers to points.
// progress 0→1 reveals the solid from left to right.
const SolidMesh: React.FC<{c:number; progress?:number}> = ({c, progress=1}) => {
  const geometry = useMemo(() => {
    const crvSegs=80, radSegs=56, active=Math.max(1, Math.floor(crvSegs*progress));
    const pos:number[]=[], nrm:number[]=[], idx:number[]=[];

    for (let i=0; i<=active; i++) {
      const xp = (i/crvSegs)*2;
      const r  = c*xp*Math.sqrt(Math.max(0, 4-xp*xp));
      const px = xp-1;
      for (let j=0; j<=radSegs; j++) {
        const a = (j/radSegs)*Math.PI*2;
        pos.push(px, r*Math.cos(a), r*Math.sin(a));
        nrm.push(0, Math.cos(a), Math.sin(a));   // outward from x-axis
      }
    }
    for (let i=0; i<active; i++)
      for (let j=0; j<radSegs; j++) {
        const a=i*(radSegs+1)+j, b=a+radSegs+1;
        idx.push(a,b,a+1, b,b+1,a+1);
      }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
    g.setAttribute('normal',   new THREE.Float32BufferAttribute(nrm,3));
    g.setIndex(idx);
    return g;
  }, [c, progress]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={C.teal} metalness={0.05} roughness={0.55}
                            side={THREE.DoubleSide} transparent opacity={0.88} />
    </mesh>
  );
};
```

Animate the build-up:
```tsx
const progress = interpolate(frame, [0, 2*fps], [0,1], {extrapolateLeft:'clamp', extrapolateRight:'clamp'});
<SolidMesh c={1} progress={progress} />
```

---

## 10. Panel Mode Pattern

Rather than writing a separate ThreeCanvas block for every scene, define a
`PanelMode` type and a single `Panel3DContent` dispatcher:

```tsx
type PanelMode = 'curve' | 'region-fill' | 'disks' | 'solid-build' | 'solid' | 'solid-c';

const Panel3DContent: React.FC<{mode:PanelMode}> = ({mode}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const isSolid = mode==='solid-build'||mode==='solid'||mode==='solid-c';
  const c = mode==='solid-c' ? Math.sqrt(30)/8 : 1;

  const solidProgress = mode==='solid-build'
    ? interpolate(frame,[0,2*fps],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})
    : 1;

  const regionProgress = mode==='region-fill'
    ? interpolate(frame,[0.3*fps,1.8*fps],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})
    : 1;

  return (
    <>
      <CameraRig pos={isSolid||mode==='disks' ? [3.2,1.6,3.5] : [0.5,1.3,4.2]} target={[0,0.55,0]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4,6,3]} intensity={0.95} />
      <directionalLight position={[-3,2,-4]} intensity={0.2} color="#4070ff" />

      <group rotation={[0, isSolid ? frame*0.012 : 0, 0]}>
        <Axes />
        <CurveLine c={c} color={isSolid ? '#ffffff' : C.blue} />
        {mode==='region-fill' && <RegionFill c={c} progress={regionProgress} />}
        {mode==='disks' && (
          <>
            <RegionFill c={c} />
            {[0.25,0.55,0.85,1.15,1.45,1.75].map((xp,i) => {
              const op = interpolate(frame, [i*0.18*fps, (i*0.18+0.3)*fps], [0,0.65],
                {extrapolateLeft:'clamp',extrapolateRight:'clamp'});
              return <DiskSlice key={xp} c={c} xPos={xp} opacity={op} />;
            })}
          </>
        )}
        {isSolid && <SolidMesh c={c} progress={solidProgress} />}
      </group>
    </>
  );
};

// Convenience wrapper — use this inside SplitScene's right prop:
const Panel3D: React.FC<{mode:PanelMode}> = ({mode}) => (
  <Panel3DContent mode={mode} />
);
```

Usage in a scene:
```tsx
<SplitScene
  left={<>...</>}
  right={<Panel3D mode="solid-build" />}
/>
```

---

## 11. Scene-to-Mode Mapping (for this problem)

| Scene | 3D mode | What the viewer sees |
|-------|---------|----------------------|
| Title | `curve` | Curve + axes, static |
| Setup | `region-fill` | Region R fills in as context is read |
| Part A (all) | `region-fill` | Region stays filled, reinforces what we're computing |
| Part B intro | `disks` | Region + gold disks appear one by one |
| Part B work | `solid-build` | Solid builds left→right over 2 s, then slowly rotates |
| Part B answer | `solid` | Full solid rotating |
| Part C work/answer | `solid` or `solid-c` | `solid-c` uses the solved c=√30/8, thinner solid |
| Summary | `solid-c` | Final solved solid rotating |

---

## 12. Scene Duration Sizing

| Scene type | Duration | Notes |
|------------|----------|-------|
| Title | 4–6 s | Function and name. Let it sit. |
| Setup/context | 8–12 s | One idea per ~2 s |
| Part intro (question only) | 3–4 s | PartLabel + nothing else |
| Insight moment | 6–8 s | "Notice…" beats. Slower is better. |
| Computation | 7–12 s | One equation per ~1.2 s + a bridging sentence |
| Answer reveal | 3–5 s | Underline finishes animating at ~2.3 s; stay longer |
| Summary | 6–8 s | One row per answer at 0.55–0.7 s stagger |

---

## 13. Checklist for a New Educational Video

**Setup:**
- [ ] Write a `.md` solution file — note every insight, not just the algebra
- [ ] Create `src/educational/TopicTutorial.tsx` from the template in §5
- [ ] Add Composition to Root.tsx using `getTotalDuration()`

**Per-scene authoring:**
- [ ] Each scene is one `Series.Sequence` with `premountFor={FPS}`
- [ ] `useCurrentFrame()` inside a Sequence returns 0 at scene start — all delays are relative
- [ ] Use `<Fade>` for prose (no translate, no spring-bounce)
- [ ] Use `<PartLabel>` — never a colored badge component
- [ ] `C.gold` appears on exactly one element per scene: the answer
- [ ] 3D panel mode matches what's being explained textually

**Before rendering:**
- [ ] `npx tsc --noEmit` — fix all type errors first
- [ ] Use `--gl=angle --concurrency=1` if ThreeCanvas is used
- [ ] Preview in `npm run dev` before doing a full render
