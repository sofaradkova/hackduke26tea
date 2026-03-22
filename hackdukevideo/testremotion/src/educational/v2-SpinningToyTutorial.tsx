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
// LOAD FONT
// ═══════════════════════════════════════════════════
const {fontFamily: LORA} = loadFont('normal', {
  weights: ['400', '700'],
  subsets: ['latin'],
});

// ═══════════════════════════════════════════════════
// TIMING CONFIG
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
// COLOR PALETTE
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
// ANIMATION PRIMITIVES
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

// ═══════════════════════════════════════════════════
// 3D GEOMETRY GENERATORS
// ═══════════════════════════════════════════════════

// Generate points for the curve y = cx*sqrt(4-x^2)
const generateCurvePoints = (c: number = 1, segments: number = 100): THREE.Vector3[] => {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * 2;
    const y = c * x * Math.sqrt(Math.max(0, 4 - x * x));
    points.push(new THREE.Vector3(x, y, 0));
  }
  return points;
};

// Generate surface of revolution
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

// ═══════════════════════════════════════════════════
// 3D CURVE COMPONENT
// ═══════════════════════════════════════════════════

const Curve3D: React.FC<{c?: number; frame: number; showRegion?: boolean}> = ({c = 1, frame, showRegion = false}) => {
  const {fps} = useVideoConfig();
  
  const scale = spring({frame, fps, config: {damping: 100}});
  const rotation = interpolate(frame, [0, 300], [0, Math.PI / 4], {extrapolateRight: 'clamp'});
  
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
      
      <group scale={scale} rotation={[0, rotation, 0]}>
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
// 3D SOLID COMPONENT
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

  const diskX = interpolate(cutProgress, [0, 1], [0, 2]);
  const diskR = c * diskX * Math.sqrt(Math.max(0, 4 - diskX * diskX));

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
// 3D CANVAS WRAPPER
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
// LAYOUT COMPONENTS
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
// SCENE COMPONENTS
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
        2017 AP Calculus AB Free Response, Question 5
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
        The Spinning Toy Problem
      </div>

      <div
        style={{
          opacity: funcOpacity,
          fontFamily: 'Georgia, serif',
          fontSize: 54,
          color: C.gold,
          textAlign: 'center',
          letterSpacing: '0.02em',
        }}
      >
        y = cx sqrt(4 - x^2)
      </div>
    </AbsoluteFill>
  );
};

// SCENE 2: SETUP
const SetupScene: React.FC = () => {
  const leftContent = (
    <div>
      <Fade delay={0} duration={0.5} style={{fontFamily: LORA, fontSize: 28, color: C.text, marginBottom: 20, lineHeight: 1.6}}>
        A company designs spinning toys from a family of curves.
        The constant <span style={{color: C.gold}}>c</span> is like a dial - it controls the shape.
      </Fade>

      <Fade delay={1.2} duration={0.5} style={{fontFamily: 'Georgia, serif', fontSize: 42, color: C.eq, marginBottom: 28, textAlign: 'center'}}>
        y = cx sqrt(4 - x^2)
      </Fade>

      <Fade delay={2.2} duration={0.5} style={{fontFamily: LORA, fontSize: 26, color: C.fade, lineHeight: 1.6, marginBottom: 16}}>
        Region R is the area <em>under</em> this curve, in the first quadrant.
        The curve arches from x = 0 to x = 2, touching zero at both ends.
      </Fade>
    </div>
  );

  return <TwoColumnLayout leftContent={leftContent} mode="curve" />;
};

// SCENE 3: PART A QUESTION
const PartAQuestionScene: React.FC = () => {
  const leftContent = (
    <div>
      <PartLabel part="a" question="Find the area of region R in terms of c." />
      <Fade delay={0.8} duration={0.5}>
        <div style={{fontFamily: 'Georgia, serif', fontSize: 32, color: C.eq, lineHeight: 1.8}}>
          integral from 0 to 2 of cx sqrt(4 - x^2) dx
        </div>
      </Fade>
    </div>
  );

  return <TwoColumnLayout leftContent={leftContent} mode="curve" />;
};

// SCENE 4: PART A INTEGRAL SETUP
const PartAIntegralScene: React.FC = () => {
  const leftContent = (
    <div>
      <Fade delay={0} duration={0.5} style={{fontFamily: LORA, fontSize: 28, color: C.text, marginBottom: 20}}>
        The area is the integral of the function from 0 to 2.
      </Fade>

      <Fade delay={1} duration={0.5} style={{fontFamily: LORA, fontSize: 24, color: C.fade}}>
        But this integral looks tricky...
      </Fade>

      <Fade delay={1.8} duration={0.5} style={{marginTop: 24, fontFamily: 'Georgia, serif', fontSize: 36, color: C.eq}}>
        A = integral from 0 to 2 of cx sqrt(4 - x^2) dx
      </Fade>
    </div>
  );

  return <TwoColumnLayout leftContent={leftContent} mode="curve" />;
};

// SCENE 5: PART A INSIGHT
const PartAInsightScene: React.FC = () => {
  const leftContent = (
    <div>
      <Fade delay={0} duration={0.5} style={{fontFamily: LORA, fontSize: 28, color: C.text, marginBottom: 24}}>
        Here is the key insight:
      </Fade>

      <Fade delay={0.8} duration={0.5} style={{fontFamily: 'Georgia, serif', fontSize: 42, color: C.gold, marginBottom: 20}}>
        Let u = 4 - x^2
      </Fade>

      <Fade delay={2} duration={0.5} style={{fontFamily: 'Georgia, serif', fontSize: 32, color: C.eq, marginBottom: 16}}>
        du = -2x dx
      </Fade>

      <Fade delay={3.2} duration={0.5} style={{fontFamily: 'Georgia, serif', fontSize: 32, color: C.eq}}>
        x dx = -1/2 du
      </Fade>
    </div>
  );

  return <TwoColumnLayout leftContent={leftContent} mode="curve" />;
};

// SCENE 6: PART A WORK
const PartAWorkScene: React.FC = () => {
  const leftContent = (
    <div>
      <Fade delay={0} duration={0.5} style={{fontFamily: LORA, fontSize: 24, color: C.fade, marginBottom: 16}}>
        Change the limits:
      </Fade>

      <Fade delay={0.8} duration={0.5} style={{fontFamily: 'Georgia, serif', fontSize: 28, color: C.eq, marginBottom: 20}}>
        x = 0 -- u = 4 | x = 2 -- u = 0
      </Fade>

      <Fade delay={2} duration={0.5} style={{fontFamily: 'Georgia, serif', fontSize: 28, color: C.eq, lineHeight: 1.8}}>
        A = (c/2) * integral from 0 to 4 of sqrt(u) du
      </Fade>

      <Fade delay={3.5} duration={0.5} style={{marginTop: 20, fontFamily: 'Georgia, serif', fontSize: 28, color: C.eq}}>
        = (c/2) * (2/3) * [u^(3/2)] from 0 to 4
      </Fade>
    </div>
  );

  return <TwoColumnLayout leftContent={leftContent} mode="curve" />;
};

// SCENE 7: PART A ANSWER
const PartAAnswerScene: React.FC = () => {
  const leftContent = (
    <div>
      <Fade delay={0} duration={0.5} style={{fontFamily: LORA, fontSize: 26, color: C.text, marginBottom: 20}}>
        4^(3/2) = 8, so:
      </Fade>

      <Fade delay={1} duration={0.6} style={{fontFamily: 'Georgia, serif', fontSize: 56, color: C.teal}}>
        A = 8c/3
      </Fade>

      <Fade delay={2} duration={0.5} style={{marginTop: 24, fontFamily: LORA, fontSize: 24, color: C.fade}}>
        square inches
      </Fade>
    </div>
  );

  return <TwoColumnLayout leftContent={leftContent} mode="curve" />;
};

// SCENE 8: PART B INTRO
const PartBIntroScene: React.FC = () => {
  const leftContent = (
    <div>
      <PartLabel part="b" question="Find the volume when region R spins around the x-axis." />
      
      <Fade delay={0.8} duration={0.5} style={{fontFamily: LORA, fontSize: 26, color: C.text, marginTop: 20}}>
        We use the <strong>disk method</strong>.
      </Fade>

      <Fade delay={2} duration={0.5} style={{fontFamily: LORA, fontSize: 24, color: C.fade, marginTop: 16}}>
        Each slice becomes a disk with radius y.
      </Fade>
    </div>
  );

  return <TwoColumnLayout leftContent={leftContent} mode="solid" />;
};

// SCENE 9: PART B WORK
const PartBWorkScene: React.FC = () => {
  const leftContent = (
    <div>
      <Fade delay={0} duration={0.5} style={{fontFamily: 'Georgia, serif', fontSize: 24, color: C.eq, lineHeight: 1.6, marginBottom: 16}}>
        V = pi * integral from 0 to 2 of c^2 * x^2 * (4 - x^2) dx
      </Fade>

      <Fade delay={2} duration={0.5} style={{fontFamily: 'Georgia, serif', fontSize: 24, color: C.eq, lineHeight: 1.6, marginBottom: 16}}>
        = pi * c^2 * integral from 0 to 2 of (4x^2 - x^4) dx
      </Fade>

      <Fade delay={4} duration={0.5} style={{fontFamily: 'Georgia, serif', fontSize: 24, color: C.eq, lineHeight: 1.6}}>
        = pi * c^2 * [4x^3/3 - x^5/5] from 0 to 2
      </Fade>
    </div>
  );

  return <TwoColumnLayout leftContent={leftContent} mode="solid" />;
};

// SCENE 10: PART B ANSWER
const PartBAnswerScene: React.FC = () => {
  const leftContent = (
    <div>
      <Fade delay={0} duration={0.5} style={{fontFamily: LORA, fontSize: 26, color: C.text, marginBottom: 20}}>
        At x = 2: 32/3 - 32/5 = 64/15
      </Fade>

      <Fade delay={1.2} duration={0.6} style={{fontFamily: 'Georgia, serif', fontSize: 48, color: C.teal}}>
        V = 64 * pi * c^2 / 15
      </Fade>

      <Fade delay={2.2} duration={0.5} style={{marginTop: 20, fontFamily: LORA, fontSize: 24, color: C.fade}}>
        cubic inches
      </Fade>
    </div>
  );

  return <TwoColumnLayout leftContent={leftContent} mode="solid" />;
};

// SCENE 11: PART C INTRO
const PartCIntroScene: React.FC = () => {
  const leftContent = (
    <div>
      <PartLabel part="c" question="Find c when the volume equals 2pi." />

      <Fade delay={0.8} duration={0.5} style={{fontFamily: LORA, fontSize: 26, color: C.text, marginTop: 20}}>
        Set the volume formula equal to 2pi and solve.
      </Fade>
    </div>
  );

  return <TwoColumnLayout leftContent={leftContent} mode="solid" />;
};

// SCENE 12: PART C WORK
const PartCWorkScene: React.FC = () => {
  const leftContent = (
    <div>
      <Fade delay={0} duration={0.5} style={{fontFamily: 'Georgia, serif', fontSize: 26, color: C.eq, marginBottom: 16}}>
        64 * pi * c^2 / 15 = 2 * pi
      </Fade>

      <Fade delay={1.5} duration={0.5} style={{fontFamily: 'Georgia, serif', fontSize: 24, color: C.eq, marginBottom: 16}}>
        Divide by pi: 64c^2 / 15 = 2
      </Fade>

      <Fade delay={3} duration={0.5} style={{fontFamily: 'Georgia, serif', fontSize: 24, color: C.eq, marginBottom: 16}}>
        c^2 = 30/64 = 15/32
      </Fade>

      <Fade delay={4.5} duration={0.5} style={{fontFamily: 'Georgia, serif', fontSize: 24, color: C.eq}}>
        c = sqrt(15/32) = sqrt(30)/8
      </Fade>
    </div>
  );

  return <TwoColumnLayout leftContent={leftContent} mode="solid" />;
};

// SCENE 13: PART C ANSWER
const PartCAnswerScene: React.FC = () => {
  const leftContent = (
    <div>
      <Fade delay={0} duration={0.5} style={{fontFamily: LORA, fontSize: 26, color: C.text, marginBottom: 20}}>
        Rationalizing:
      </Fade>

      <Fade delay={0.8} duration={0.6} style={{fontFamily: 'Georgia, serif', fontSize: 52, color: C.teal}}>
        c = sqrt(30)/8
      </Fade>

      <Fade delay={2} duration={0.5} style={{marginTop: 20, fontFamily: LORA, fontSize: 28, color: C.fade}}>
        approximately 0.684
      </Fade>
    </div>
  );

  return <TwoColumnLayout leftContent={leftContent} mode="solid" />;
};

// SCENE 14: SUMMARY
const SummaryScene: React.FC = () => {
  const leftContent = (
    <div>
      <Fade delay={0} duration={0.5} style={{fontFamily: LORA, fontSize: 36, color: C.text, marginBottom: 32, fontWeight: '700'}}>
        Summary
      </Fade>

      <Fade delay={0.8} duration={0.5} style={{marginBottom: 20}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
          <span style={{fontFamily: LORA, fontSize: 24, color: C.dim, width: 80}}>Part (a)</span>
          <span style={{fontFamily: 'Georgia, serif', fontSize: 28, color: C.eq}}>
            Area = 8c/3
          </span>
        </div>
      </Fade>

      <Fade delay={1.6} duration={0.5} style={{marginBottom: 20}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
          <span style={{fontFamily: LORA, fontSize: 24, color: C.dim, width: 80}}>Part (b)</span>
          <span style={{fontFamily: 'Georgia, serif', fontSize: 28, color: C.eq}}>
            Volume = 64 * pi * c^2 / 15
          </span>
        </div>
      </Fade>

      <Fade delay={2.4} duration={0.5}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
          <span style={{fontFamily: LORA, fontSize: 24, color: C.dim, width: 80}}>Part (c)</span>
          <span style={{fontFamily: 'Georgia, serif', fontSize: 28, color: C.teal}}>
            c = sqrt(30)/8 approx 0.684
          </span>
        </div>
      </Fade>

      <DrawLine delay={4} width={400} />

      <Fade delay={4.5} duration={0.5} style={{fontFamily: LORA, fontSize: 22, color: C.fade, marginTop: 16}}>
        Key concepts: u-substitution, disk method, solving for parameters
      </Fade>
    </div>
  );

  return <TwoColumnLayout leftContent={leftContent} mode="solid" />;
};

// ═══════════════════════════════════════════════════
// ROOT COMPOSITION
// ═══════════════════════════════════════════════════

export const v2SpinningToyTutorial: React.FC = () => (
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
        <PartAAnswerScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={SCENE_DURATIONS.partBIntro} premountFor={FPS}>
        <PartBIntroScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={SCENE_DURATIONS.partBWork} premountFor={FPS}>
        <PartBWorkScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={SCENE_DURATIONS.partBAnswer} premountFor={FPS}>
        <PartBAnswerScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={SCENE_DURATIONS.partCIntro} premountFor={FPS}>
        <PartCIntroScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={SCENE_DURATIONS.partCWork} premountFor={FPS}>
        <PartCWorkScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={SCENE_DURATIONS.partCAnswer} premountFor={FPS}>
        <PartCAnswerScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={SCENE_DURATIONS.summary} premountFor={FPS}>
        <SummaryScene />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);
