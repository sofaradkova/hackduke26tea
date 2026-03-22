import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Series,
} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Lora';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';

// ─────────────────────────────────────────────
// FONTS
// ─────────────────────────────────────────────
const {fontFamily: LORA} = loadFont('normal', {weights: ['400', '700'], subsets: ['latin']});

// ─────────────────────────────────────────────
// TIMING
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// PALETTE
// ─────────────────────────────────────────────
const C = {
  bg:    '#0e0f1a',
  text:  '#e4e4f0',
  dim:   '#6a6b82',
  eq:    '#f4f4ff',
  gold:  '#e8c060',
  blue:  '#5b9cf6',
  teal:  '#4ecdc4',
  fade:  '#9999b5',
  panel: '#0a0b15',
};

// ─────────────────────────────────────────────
// MATH HELPERS
// ─────────────────────────────────────────────
const Frac: React.FC<{num: React.ReactNode; den: React.ReactNode}> = ({num, den}) => (
  <span style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                verticalAlign: 'middle', margin: '0 2px', lineHeight: 1.15, fontSize: '0.85em'}}>
    <span style={{borderBottom: `1.5px solid ${C.eq}`, padding: '0 3px'}}>{num}</span>
    <span style={{padding: '0 3px'}}>{den}</span>
  </span>
);

// ─────────────────────────────────────────────
// 2D ANIMATION PRIMITIVES
// ─────────────────────────────────────────────
const Fade: React.FC<{delay?: number; duration?: number; children: React.ReactNode; style?: React.CSSProperties}> =
  ({delay = 0, duration = 0.6, children, style}) => {
    const frame = useCurrentFrame();
    const {fps} = useVideoConfig();
    const opacity = interpolate(frame, [delay * fps, (delay + duration) * fps], [0, 1],
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <div style={{opacity, ...style}}>{children}</div>;
  };

const DrawLine: React.FC<{delay?: number; color?: string; width?: number}> = ({delay = 0, color = C.dim, width = 600}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = interpolate(frame, [delay * fps, (delay + 0.7) * fps], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <div style={{height: 1, width: width * progress, background: color, borderRadius: 1, margin: '16px 0'}} />;
};

const PartLabel: React.FC<{part: string; question: string}> = ({part, question}) => (
  <div style={{marginBottom: 32}}>
    <Fade delay={0} duration={0.4}>
      <div style={{fontFamily: LORA, fontSize: 20, color: C.dim, letterSpacing: '0.08em', marginBottom: 8}}>
        part ({part})
      </div>
    </Fade>
    <Fade delay={0.3} duration={0.5}>
      <div style={{fontFamily: LORA, fontSize: 32, color: C.text, lineHeight: 1.4}}>
        {question}
      </div>
    </Fade>
  </div>
);

// ─────────────────────────────────────────────
// CURVE MATH
// ─────────────────────────────────────────────
const curveFn = (xParam: number, c: number) =>
  c * xParam * Math.sqrt(Math.max(0, 4 - xParam * xParam));

// ─────────────────────────────────────────────
// THREE.JS SCENE COMPONENTS
// All animations driven by useCurrentFrame() as required by Remotion.
// useFrame() is FORBIDDEN.
// ─────────────────────────────────────────────

/** Positions the camera every frame based on useCurrentFrame(). Must be inside ThreeCanvas. */
const CameraRig: React.FC<{
  pos: [number, number, number];
  target: [number, number, number];
  rotateSpeed?: number;
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

/** X and Y axis lines with tick marks. */
const Axes: React.FC = () => {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [
      // x-axis
      new THREE.Vector3(-1.25, 0, 0), new THREE.Vector3(1.35, 0, 0),
      // y-axis
      new THREE.Vector3(-1, -0.1, 0), new THREE.Vector3(-1, 2.4, 0),
      // x ticks at 0, 1, 2
      new THREE.Vector3(-1, -0.06, 0), new THREE.Vector3(-1,  0.06, 0),
      new THREE.Vector3( 0, -0.06, 0), new THREE.Vector3( 0,  0.06, 0),
      new THREE.Vector3( 1, -0.06, 0), new THREE.Vector3( 1,  0.06, 0),
    ];
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  return (
    <primitive object={new THREE.LineSegments(geo, new THREE.LineBasicMaterial({color: '#6a6b82'}))} />
  );
};

/** The curve y = cx√(4−x²) as a line in 3D space. */
const CurveLine: React.FC<{c: number; color?: string}> = ({c, color = C.blue}) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const x = (i / 120) * 2;
      pts.push(new THREE.Vector3(x - 1, curveFn(x, c), 0));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [c]);

  return <primitive object={new THREE.Line(geo, new THREE.LineBasicMaterial({color, linewidth: 2}))} />;
};

/** Filled region R under the curve, optionally animated to fill left→right. */
const RegionFill: React.FC<{c: number; progress?: number; color?: string}> = ({c, progress = 1, color = C.blue}) => {
  const geo = useMemo(() => {
    const segs = 120;
    const active = Math.max(1, Math.floor(segs * progress));
    const shape = new THREE.Shape();
    shape.moveTo(-1, 0);
    for (let i = 0; i <= active; i++) {
      const x = (i / segs) * 2;
      shape.lineTo(x - 1, curveFn(x, c));
    }
    const xEnd = (active / segs) * 2;
    shape.lineTo(xEnd - 1, 0);
    shape.closePath();
    return new THREE.ShapeGeometry(shape);
  }, [c, progress]);

  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({color, transparent: true, opacity: 0.22, side: THREE.DoubleSide}),
    [color],
  );

  return <mesh geometry={geo} material={mat} position={[0, 0, -0.01]} />;
};

/** Thin disk at xPos showing the disk-method cross-section. */
const DiskSlice: React.FC<{c: number; xPos: number; color?: string; opacity?: number}> = ({
  c, xPos, color = C.gold, opacity = 0.65,
}) => {
  const r = curveFn(xPos, c);
  const geo = useMemo(() => new THREE.CylinderGeometry(r, r, 0.035, 48, 1, false), [r]);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({color, transparent: true, opacity, side: THREE.DoubleSide}),
    [color, opacity],
  );
  // Cylinder axis is Y; rotate to align with X axis
  return <mesh geometry={geo} material={mat} position={[xPos - 1, 0, 0]} rotation={[0, 0, Math.PI / 2]} />;
};

/** Full solid of revolution around the x-axis, built via custom BufferGeometry. */
const SolidMesh: React.FC<{c: number; progress?: number}> = ({c, progress = 1}) => {
  const {geometry, edgeGeo} = useMemo(() => {
    const curveSegs = 80;
    const radialSegs = 56;
    const activeCurveSegs = Math.max(1, Math.floor(curveSegs * progress));

    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= activeCurveSegs; i++) {
      const t = i / curveSegs;
      const xParam = t * 2;
      const r = curveFn(xParam, c);
      const px = xParam - 1;

      for (let j = 0; j <= radialSegs; j++) {
        const angle = (j / radialSegs) * Math.PI * 2;
        const cy = Math.cos(angle);
        const cz = Math.sin(angle);
        positions.push(px, r * cy, r * cz);
        normals.push(0, cy, cz);
      }
    }

    for (let i = 0; i < activeCurveSegs; i++) {
      for (let j = 0; j < radialSegs; j++) {
        const a = i * (radialSegs + 1) + j;
        const b = a + (radialSegs + 1);
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setIndex(indices);

    // Edge ring at the widest point (x = √2, xParam = √2)
    const edgePts: THREE.Vector3[] = [];
    const xPeak = Math.sqrt(2);
    const rPeak = curveFn(xPeak, c);
    for (let j = 0; j <= 64; j++) {
      const a = (j / 64) * Math.PI * 2;
      edgePts.push(new THREE.Vector3(xPeak - 1, rPeak * Math.cos(a), rPeak * Math.sin(a)));
    }
    const edgeGeo = new THREE.BufferGeometry().setFromPoints(edgePts);

    return {geometry, edgeGeo};
  }, [c, progress]);

  const surfaceMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: C.teal, metalness: 0.05, roughness: 0.55,
      side: THREE.DoubleSide, transparent: true, opacity: 0.88,
    }), [],
  );

  const edgeMat = useMemo(
    () => new THREE.LineBasicMaterial({color: C.teal, transparent: true, opacity: 0.5}), [],
  );

  return (
    <group>
      <mesh geometry={geometry} material={surfaceMat} />
      {progress > 0.95 && <primitive object={new THREE.Line(edgeGeo, edgeMat)} />}
    </group>
  );
};

// ─────────────────────────────────────────────
// 3D PANEL MODES
// ─────────────────────────────────────────────
type PanelMode = 'curve' | 'region-fill' | 'disks' | 'solid-build' | 'solid' | 'solid-c';

const DISK_POSITIONS = [0.25, 0.55, 0.85, 1.15, 1.45, 1.75];

const Panel3DContent: React.FC<{mode: PanelMode}> = ({mode}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // c value: use c=1 for all except solid-c which uses the solved value
  const c = mode === 'solid-c' ? Math.sqrt(30) / 8 : 1;

  // Solid reveal: builds from left to right over 2 seconds
  const solidProgress = mode === 'solid-build'
    ? interpolate(frame, [0, 2 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 1;

  // Region fill: animates in over 1.5s
  const regionProgress = mode === 'region-fill'
    ? interpolate(frame, [0.3 * fps, 1.8 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 1;

  // Slow spin for solid views
  const isSolid = mode === 'solid-build' || mode === 'solid' || mode === 'solid-c';
  const rotY = isSolid ? frame * 0.012 : 0;

  // Camera config
  const camPos: [number, number, number] = isSolid || mode === 'disks'
    ? [3.2, 1.6, 3.5]
    : [0.5, 1.3, 4.2];
  const camTarget: [number, number, number] = [0, 0.55, 0];

  return (
    <>
      <CameraRig pos={camPos} target={camTarget} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={0.95} />
      <directionalLight position={[-3, 2, -4]} intensity={0.2} color="#4070ff" />

      <group rotation={[0, rotY, 0]}>
        <Axes />
        <CurveLine c={c} color={mode === 'region-fill' ? C.blue : isSolid ? '#ffffff' : C.blue} />

        {mode === 'region-fill' && <RegionFill c={c} progress={regionProgress} />}

        {mode === 'disks' && (
          <>
            <RegionFill c={c} progress={1} />
            {DISK_POSITIONS.map((xp) => {
              const delay = DISK_POSITIONS.indexOf(xp) * 0.18 * fps;
              const diskOpacity = interpolate(frame, [delay, delay + 0.3 * fps], [0, 0.65],
                {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
              return <DiskSlice key={xp} c={c} xPos={xp} opacity={diskOpacity} />;
            })}
          </>
        )}

        {(mode === 'solid-build' || mode === 'solid' || mode === 'solid-c') && (
          <SolidMesh c={c} progress={solidProgress} />
        )}
      </group>
    </>
  );
};

const Panel3D: React.FC<{mode: PanelMode}> = ({mode}) => (
  <div style={{position: 'absolute', right: 0, top: 0, width: 960, height: 1080, background: C.panel}}>
    {/* Subtle separator */}
    <div style={{position: 'absolute', left: 0, top: 80, bottom: 80, width: 1, background: 'rgba(106,107,130,0.18)'}} />
    <ThreeCanvas width={960} height={1080}>
      <Panel3DContent mode={mode} />
    </ThreeCanvas>
  </div>
);

// ─────────────────────────────────────────────
// SPLIT SCENE WRAPPER
// left = text content; mode = which 3D panel to render
// ─────────────────────────────────────────────
const SplitScene: React.FC<{left: React.ReactNode; mode: PanelMode}> = ({left, mode}) => (
  <AbsoluteFill>
    <div style={{
      position: 'absolute', left: 0, top: 0, width: 960, height: 1080,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '60px 64px 60px 100px',
    }}>
      {left}
    </div>
    <Panel3D mode={mode} />
  </AbsoluteFill>
);

// ─────────────────────────────────────────────
// BACKGROUND
// ─────────────────────────────────────────────
const Background: React.FC = () => <AbsoluteFill style={{background: C.bg}} />;

// ─────────────────────────────────────────────
// ANSWER SCENE (full-width, centered)
// ─────────────────────────────────────────────
const AnswerScene: React.FC<{part: string; equation: React.ReactNode; note?: string; mode: PanelMode}> = (
  {part, equation, note, mode},
) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const eqScale = spring({frame: frame - 10, fps, config: {damping: 200}});
  const eqOpacity = interpolate(frame, [10, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const lineW = interpolate(frame, [35, 72], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <SplitScene
      mode={mode}
      left={
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
          <div style={{fontFamily: LORA, fontSize: 20, color: C.dim, letterSpacing: '0.08em', marginBottom: 28}}>
            part ({part})
          </div>
          <div style={{
            opacity: eqOpacity, transform: `scale(${eqScale})`,
            fontFamily: `'STIX Two Math', Georgia, serif`,
            fontSize: 66, color: C.gold, marginBottom: 14,
          }}>
            {equation}
          </div>
          <div style={{width: lineW * 360, height: 2, background: C.gold, opacity: 0.55, borderRadius: 1}} />
          {note && (
            <div style={{
              opacity: interpolate(frame, [45, 75], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
              fontFamily: LORA, fontSize: 22, color: C.dim, marginTop: 20,
            }}>
              {note}
            </div>
          )}
        </div>
      }
    />
  );
};

// ─────────────────────────────────────────────
// SCENES
// ─────────────────────────────────────────────

const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SplitScene
      mode="curve"
      left={
        <>
          <Fade delay={0} duration={0.5} style={{fontFamily: LORA, fontSize: 20, color: C.dim, letterSpacing: '0.1em', marginBottom: 20}}>
            2017 AP Calculus AB &nbsp;·&nbsp; Free Response, Question 5
          </Fade>
          <Fade delay={0.3} duration={0.6} style={{fontFamily: LORA, fontWeight: '700', fontSize: 58, color: C.text, lineHeight: 1.2, marginBottom: 36}}>
            The Spinning Toy Problem
          </Fade>
          <Fade delay={1.2} duration={0.5} style={{fontFamily: `'STIX Two Math', Georgia, serif`, fontSize: 46, color: C.gold}}>
            y = cx√(4 − x²)
          </Fade>
        </>
      }
    />
  );
};

const SetupScene: React.FC = () => (
  <SplitScene
    mode="region-fill"
    left={
      <>
        <Fade delay={0} duration={0.5} style={{fontFamily: LORA, fontSize: 27, color: C.text, marginBottom: 18, lineHeight: 1.6}}>
          A company designs spinning toys from a family of curves.
          The constant <span style={{color: C.gold}}>c</span> controls the shape.
        </Fade>
        <Fade delay={1.2} duration={0.5} style={{fontFamily: `Georgia, serif`, fontSize: 40, color: C.eq, marginBottom: 24, textAlign: 'center'}}>
          y = cx√(4 − x²)
        </Fade>
        <Fade delay={2.2} duration={0.5} style={{fontFamily: LORA, fontSize: 25, color: C.fade, lineHeight: 1.6, marginBottom: 14}}>
          Region R is the area under this curve in the first quadrant —
          the curve makes a perfect arch from x = 0 to x = 2.
        </Fade>
        <Fade delay={3.5} duration={0.5} style={{fontFamily: LORA, fontSize: 25, color: C.fade, lineHeight: 1.6}}>
          The toy is what you get when you spin that region around the x-axis.
        </Fade>
        <Fade delay={5} duration={0.4} style={{fontFamily: LORA, fontSize: 21, color: C.dim, marginTop: 20}}>
          Three things to find: area, volume, and the exact value of c.
        </Fade>
      </>
    }
  />
);

const PartAQuestionScene: React.FC = () => (
  <SplitScene
    mode="region-fill"
    left={<PartLabel part="a" question="What's the area of region R, in terms of c?" />}
  />
);

const PartAIntegralScene: React.FC = () => (
  <SplitScene
    mode="region-fill"
    left={
      <>
        <Fade delay={0} duration={0.5} style={{fontFamily: LORA, fontSize: 26, color: C.fade, marginBottom: 24, lineHeight: 1.6}}>
          Area under a curve — that's just an integral.
        </Fade>
        <Fade delay={0.8} duration={0.4}>
          <div style={{fontFamily: `Georgia, serif`, fontSize: 48, color: C.eq, marginBottom: 28, textAlign: 'center'}}>
            A = ∫₀² cx√(4 − x²) dx
          </div>
        </Fade>
        <Fade delay={2} duration={0.5} style={{fontFamily: LORA, fontSize: 26, color: C.fade, lineHeight: 1.6}}>
          Now pause. There's something in there practically asking to be substituted.
        </Fade>
      </>
    }
  />
);

const PartAInsightScene: React.FC = () => (
  <SplitScene
    mode="region-fill"
    left={
      <>
        <Fade delay={0} duration={0.5} style={{fontFamily: LORA, fontSize: 26, color: C.fade, marginBottom: 18, lineHeight: 1.6}}>
          We have <span style={{color: C.eq}}>√(4 − x²)</span> under the root,
          and right next to it: <span style={{color: C.blue}}>x dx</span>.
        </Fade>
        <Fade delay={1.2} duration={0.4} style={{fontFamily: LORA, fontSize: 26, color: C.fade, marginBottom: 24, lineHeight: 1.6}}>
          That's a hint. Try <span style={{color: C.gold}}>u = 4 − x²</span>. Differentiate:
        </Fade>
        <Fade delay={2.2} duration={0.4}>
          <div style={{fontFamily: `Georgia, serif`, fontSize: 40, color: C.eq, marginBottom: 10}}>
            du = −2x dx
          </div>
        </Fade>
        <Fade delay={3} duration={0.4}>
          <div style={{fontFamily: `Georgia, serif`, fontSize: 40, color: C.eq, marginBottom: 24}}>
            ⟹ &nbsp; x dx = −<Frac num="1" den="2" /> du
          </div>
        </Fade>
        <Fade delay={4} duration={0.5} style={{fontFamily: LORA, fontSize: 24, color: C.fade, lineHeight: 1.6}}>
          The <span style={{color: C.blue}}>x dx</span> in the integral
          becomes <span style={{color: C.gold}}>−½ du</span>. It was waiting there.
        </Fade>
      </>
    }
  />
);

const PartAWorkScene: React.FC = () => (
  <SplitScene
    mode="region-fill"
    left={
      <>
        <Fade delay={0} duration={0.4} style={{fontFamily: LORA, fontSize: 22, color: C.dim, marginBottom: 12}}>
          New limits: x = 0 → u = 4, &nbsp; x = 2 → u = 0
        </Fade>
        <DrawLine delay={0.4} color={C.dim} width={420} />
        <Fade delay={1} duration={0.4}>
          <div style={{fontFamily: `Georgia, serif`, fontSize: 38, color: C.eq, marginBottom: 10}}>
            A = <Frac num="c" den="2" /> ∫₀⁴ u^(1∕2) du
          </div>
        </Fade>
        <Fade delay={2.2} duration={0.4}>
          <div style={{fontFamily: `Georgia, serif`, fontSize: 38, color: C.eq, marginBottom: 10}}>
            = <Frac num="c" den="2" /> · <Frac num="2" den="3" /> · u^(3∕2)&nbsp;
            <span style={{fontSize: '0.7em', color: C.dim}}>from 0 to 4</span>
          </div>
        </Fade>
        <Fade delay={3.5} duration={0.4}>
          <div style={{fontFamily: `Georgia, serif`, fontSize: 38, color: C.eq}}>
            = <Frac num="c" den="3" /> · 8
          </div>
        </Fade>
      </>
    }
  />
);

const PartBIntroScene: React.FC = () => (
  <SplitScene
    mode="disks"
    left={
      <>
        <PartLabel part="b" question="Now we spin the region. What's the volume?" />
        <Fade delay={1} duration={0.5} style={{fontFamily: LORA, fontSize: 26, color: C.fade, marginBottom: 18, lineHeight: 1.6}}>
          Slice the solid at position x. The cross-section is a
          disk with radius <span style={{color: C.gold}}>f(x)</span>.
        </Fade>
        <Fade delay={2.4} duration={0.4} style={{fontFamily: LORA, fontSize: 26, color: C.fade, marginBottom: 22, lineHeight: 1.6}}>
          Stack those disks from 0 to 2:
        </Fade>
        <Fade delay={3.4} duration={0.4}>
          <div style={{fontFamily: `Georgia, serif`, fontSize: 42, color: C.eq}}>
            V = π ∫₀² [f(x)]² dx
          </div>
        </Fade>
      </>
    }
  />
);

const PartBWorkScene: React.FC = () => (
  <SplitScene
    mode="solid-build"
    left={
      <>
        <Fade delay={0} duration={0.4} style={{fontFamily: LORA, fontSize: 23, color: C.dim, marginBottom: 12}}>
          Plug in f(x) = cx√(4 − x²):
        </Fade>
        <Fade delay={0.6} duration={0.4}>
          <div style={{fontFamily: `Georgia, serif`, fontSize: 34, color: C.eq, marginBottom: 10}}>
            V = πc² ∫₀² x²(4 − x²) dx
          </div>
        </Fade>
        <Fade delay={1.8} duration={0.4} style={{fontFamily: LORA, fontSize: 23, color: C.dim, marginBottom: 10}}>
          Expand, then integrate:
        </Fade>
        <Fade delay={2.5} duration={0.4}>
          <div style={{fontFamily: `Georgia, serif`, fontSize: 32, color: C.eq, marginBottom: 10}}>
            = πc² &nbsp;
            <span style={{fontSize: '0.85em', color: C.fade}}>
              [<Frac num="4x³" den="3" /> − <Frac num="x⁵" den="5" />]₀²
            </span>
          </div>
        </Fade>
        <Fade delay={3.8} duration={0.4} style={{fontFamily: LORA, fontSize: 22, color: C.dim, marginBottom: 10}}>
          At x = 2: &nbsp;<span style={{color: C.eq}}>32/3 − 32/5 = 64/15</span>
        </Fade>
        <Fade delay={5.2} duration={0.4}>
          <div style={{fontFamily: `Georgia, serif`, fontSize: 34, color: C.eq}}>
            V = πc² · <Frac num="64" den="15" />
          </div>
        </Fade>
      </>
    }
  />
);

const PartCIntroScene: React.FC = () => (
  <SplitScene
    mode="solid"
    left={
      <>
        <PartLabel part="c" question="If V = 2π, what is c?" />
        <Fade delay={1} duration={0.4} style={{fontFamily: LORA, fontSize: 26, color: C.fade, lineHeight: 1.6}}>
          We already know V in terms of c. Set them equal and solve.
        </Fade>
      </>
    }
  />
);

const PartCWorkScene: React.FC = () => (
  <SplitScene
    mode="solid"
    left={
      <>
        <Fade delay={0} duration={0.4}>
          <div style={{fontFamily: `Georgia, serif`, fontSize: 40, color: C.eq, marginBottom: 12}}>
            <Frac num="64πc²" den="15" /> = 2π
          </div>
        </Fade>
        <Fade delay={1.2} duration={0.4} style={{fontFamily: LORA, fontSize: 22, color: C.dim, marginBottom: 10}}>
          Divide both sides by π:
        </Fade>
        <Fade delay={2} duration={0.4}>
          <div style={{fontFamily: `Georgia, serif`, fontSize: 40, color: C.eq, marginBottom: 10}}>
            <Frac num="64c²" den="15" /> = 2 &nbsp;⟹&nbsp; c² = <Frac num="15" den="32" />
          </div>
        </Fade>
        <Fade delay={3.4} duration={0.4} style={{fontFamily: LORA, fontSize: 22, color: C.dim, marginBottom: 10}}>
          c is positive — take the positive root:
        </Fade>
        <Fade delay={4.2} duration={0.4}>
          <div style={{fontFamily: `Georgia, serif`, fontSize: 40, color: C.eq}}>
            c = <Frac num="√30" den="8" />
          </div>
        </Fade>
      </>
    }
  />
);

const SummaryScene: React.FC = () => {
  const rows = [
    {part: 'a', label: 'Area of R',      answer: 'A = 8c/3',      unit: 'in²'},
    {part: 'b', label: 'Volume of solid', answer: 'V = 64πc²/15', unit: 'in³'},
    {part: 'c', label: 'Value of c',     answer: 'c = √30/8',      unit: '≈ 0.684'},
  ];

  return (
    <SplitScene
      mode="solid-c"
      left={
        <>
          <Fade delay={0} duration={0.5} style={{fontFamily: LORA, fontSize: 30, color: C.text, marginBottom: 32}}>
            Here's where we ended up.
          </Fade>
          {rows.map(({part, label, answer, unit}, i) => (
            <Fade key={part} delay={0.5 + i * 0.7} duration={0.5}>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 20, marginBottom: 24}}>
                <span style={{fontFamily: LORA, fontSize: 18, color: C.dim, width: 60}}>({part})</span>
                <span style={{fontFamily: LORA, fontSize: 20, color: C.fade, width: 190}}>{label}</span>
                <span style={{fontFamily: `'STIX Two Math', Georgia, serif`, fontSize: 32, color: C.gold}}>{answer}</span>
                <span style={{fontFamily: LORA, fontSize: 18, color: C.dim}}>{unit}</span>
              </div>
            </Fade>
          ))}
          <Fade delay={3} duration={0.5}>
            <DrawLine delay={3} color={C.dim} width={420} />
          </Fade>
          <Fade delay={3.5} duration={0.5} style={{fontFamily: LORA, fontSize: 19, color: C.dim}}>
            u-substitution &nbsp;·&nbsp; disk method &nbsp;·&nbsp; solving quadratics
          </Fade>
        </>
      }
    />
  );
};

// ─────────────────────────────────────────────
// ROOT COMPOSITION
// ─────────────────────────────────────────────
export const SpinningToyTutorial: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Series>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.title} premountFor={FPS}>
        <TitleScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.setup} premountFor={FPS}>
        <SetupScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.partAQuestion} premountFor={FPS}>
        <PartAQuestionScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.partAIntegral} premountFor={FPS}>
        <PartAIntegralScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.partAInsight} premountFor={FPS}>
        <PartAInsightScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.partAWork} premountFor={FPS}>
        <PartAWorkScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.partAAnswer} premountFor={FPS}>
        <AnswerScene part="a" equation="A = 8c/3" note="square inches" mode="region-fill" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.partBIntro} premountFor={FPS}>
        <PartBIntroScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.partBWork} premountFor={FPS}>
        <PartBWorkScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.partBAnswer} premountFor={FPS}>
        <AnswerScene part="b" equation="V = 64πc²/15" note="cubic inches" mode="solid" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.partCIntro} premountFor={FPS}>
        <PartCIntroScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.partCWork} premountFor={FPS}>
        <PartCWorkScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.partCAnswer} premountFor={FPS}>
        <AnswerScene part="c" equation="c = √30/8 ≈ 0.684" mode="solid-c" />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.summary} premountFor={FPS}>
        <SummaryScene />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);
