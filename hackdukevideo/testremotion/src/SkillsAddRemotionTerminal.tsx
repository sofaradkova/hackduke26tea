import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const WINDOW_WIDTH = 920;
const WINDOW_HEIGHT = 620;
const COMMAND = 'npx skills add remotion-dev/remotion';
const TYPING_START = 18;
const TYPING_SPEED = 2;
const ENTER_FRAME = TYPING_START + COMMAND.length * TYPING_SPEED + 12;
const OUTPUT_START = ENTER_FRAME + 12;
const OUTPUT_STAGGER = 18;

const OUTPUT_LINES = [
  {
    text: '⠋ Resolving skill package metadata...',
    color: '#334155',
  },
  {
    text: '⠙ Downloading remotion-dev/remotion',
    color: '#334155',
  },
  {
    text: '⠹ Extracting templates and docs',
    color: '#334155',
  },
  {
    text: '✔ Added skill: remotion-dev/remotion',
    color: '#15803d',
  },
  {
    text: '✔ Ready to use in this project',
    color: '#15803d',
  },
];

const monoFont =
  'SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace';
const uiFont = '-apple-system, BlinkMacSystemFont, SF Pro Display, Inter, sans-serif';

const TerminalTrafficLights: React.FC = () => {
  const dots = ['#ff5f57', '#febc2e', '#28c840'];

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
      }}
    >
      {dots.map((color) => (
        <div
          key={color}
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            backgroundColor: color,
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.45)',
          }}
        />
      ))}
    </div>
  );
};

const PromptPrefix: React.FC = () => {
  return (
    <>
      <span style={{color: '#2563eb', fontWeight: 600}}>pierce@macbook</span>
      <span style={{color: '#6b7280'}}>~</span>
      <span style={{color: '#111827'}}>$</span>
    </>
  );
};

const TerminalLine: React.FC<{
  children: React.ReactNode;
  opacity?: number;
  translateY?: number;
}> = ({children, opacity = 1, translateY = 0}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        minHeight: 42,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {children}
    </div>
  );
};

const CommandLine: React.FC<{
  frame: number;
}> = ({frame}) => {
  const typedLength = Math.max(
    0,
    Math.min(COMMAND.length, Math.floor((frame - TYPING_START) / TYPING_SPEED)),
  );
  const typedText = COMMAND.slice(0, typedLength);
  const commandFinished = typedLength >= COMMAND.length;
  const enterPulse = interpolate(frame, [ENTER_FRAME - 2, ENTER_FRAME + 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const blinkOn = Math.floor(frame / 12) % 2 === 0;
  const showCursor = frame < ENTER_FRAME + 4 ? blinkOn || !commandFinished : false;

  return (
    <TerminalLine>
      <PromptPrefix />
      <span style={{color: '#111827'}}>{typedText}</span>
      <span
        style={{
          width: 18,
          height: 34,
          borderRadius: 3,
          backgroundColor: '#111827',
          opacity: showCursor ? 1 : 0,
          transform: `scaleY(${1 - enterPulse * 0.3}) translateY(${enterPulse * 4}px)`,
          transformOrigin: 'center bottom',
        }}
      />
    </TerminalLine>
  );
};

const SubmittedCommandLine: React.FC<{frame: number}> = ({frame}) => {
  const opacity = interpolate(frame, [ENTER_FRAME, ENTER_FRAME + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <TerminalLine opacity={opacity}>
      <PromptPrefix />
      <span style={{color: '#111827'}}>{COMMAND}</span>
    </TerminalLine>
  );
};

const OutputLine: React.FC<{
  text: string;
  color: string;
  index: number;
  frame: number;
  fps: number;
}> = ({text, color, index, frame, fps}) => {
  const lineStart = OUTPUT_START + index * OUTPUT_STAGGER;
  const lineProgress = spring({
    frame: frame - lineStart,
    fps,
    config: {
      damping: 18,
      stiffness: 170,
    },
  });

  const opacity = interpolate(lineProgress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const translateY = interpolate(lineProgress, [0, 1], [12, 0]);

  return (
    <TerminalLine opacity={opacity} translateY={translateY}>
      <span style={{color}}>{text}</span>
    </TerminalLine>
  );
};

export const SkillsAddRemotionTerminal: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 16,
      stiffness: 120,
      mass: 0.95,
    },
  });

  const cameraDrift = interpolate(frame, [0, 90, 170, 250], [0, 1, 0.45, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });

  const settle = interpolate(frame, [ENTER_FRAME - 6, ENTER_FRAME + 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.exp),
  });

  const opacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scaleIn = interpolate(entrance, [0, 1], [0.9, 1]);
  const cameraScale = interpolate(cameraDrift, [0, 1], [1.02, 1.11]);
  const scale = scaleIn * cameraScale;
  const floatY = Math.sin(frame / 24) * 8;
  const translateX = interpolate(cameraDrift, [0, 1], [-34, 28]);
  const translateY = floatY + interpolate(cameraDrift, [0, 1], [22, -14]);
  const rotateX = interpolate(entrance, [0, 1], [30, 20]) - settle * 2;
  const rotateY = interpolate(cameraDrift, [0, 1], [-28, -14]);
  const rotateZ = interpolate(cameraDrift, [0, 1], [-3.5, 2.5]);

  const bodyReveal = interpolate(frame, [OUTPUT_START - 12, OUTPUT_START + 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(circle at top, #f8fafc 0%, #eef2f7 45%, #e2e8f0 100%)',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 2200,
      }}
    >
      <div
        style={{
          width: WINDOW_WIDTH,
          height: WINDOW_HEIGHT,
          borderRadius: 28,
          backgroundColor: '#fdfdfd',
          border: '1px solid rgba(148, 163, 184, 0.28)',
          boxShadow:
            '0 38px 110px rgba(15, 23, 42, 0.2), 0 12px 36px rgba(15, 23, 42, 0.12)',
          overflow: 'hidden',
          transform: `translate3d(${translateX}px, ${translateY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
          transformStyle: 'preserve-3d',
          opacity,
        }}
      >
        <div
          style={{
            height: 54,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(244,247,250,0.98) 100%)',
            borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
          }}
        >
          <TerminalTrafficLights />
          <div
            style={{
              fontFamily: uiFont,
              fontSize: 18,
              fontWeight: 600,
              color: '#475569',
              letterSpacing: -0.2,
            }}
          >
            terminal
          </div>
          <div style={{width: 66}} />
        </div>

        <div
          style={{
            height: WINDOW_HEIGHT - 54,
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.96) 100%)',
            padding: '42px 44px',
            fontFamily: monoFont,
            fontSize: 30,
            lineHeight: 1,
            color: '#111827',
          }}
        >
          {frame < ENTER_FRAME + 6 ? (
            <CommandLine frame={frame} />
          ) : (
            <SubmittedCommandLine frame={frame} />
          )}

          <div
            style={{
              marginTop: 18,
              opacity: bodyReveal,
            }}
          >
            {OUTPUT_LINES.map((line, index) => (
              <OutputLine
                key={line.text}
                text={line.text}
                color={line.color}
                index={index}
                frame={frame}
                fps={fps}
              />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
