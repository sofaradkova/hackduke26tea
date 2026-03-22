import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {EvenG1Glasses} from './components/EvenG1Glasses';

const bgColor = '#F2F4F1';
const accent = '#94C83D';

type KandiIntroProps = {
  logoSrc?: string;
};

export const KandiIntro: React.FC<KandiIntroProps> = ({logoSrc = 'kandiNOTEXT.png'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const logoReveal = spring({
    frame,
    fps,
    config: {damping: 16, stiffness: 130, mass: 0.8},
  });

  const titleReveal = spring({
    frame: frame - 18,
    fps,
    config: {damping: 14, stiffness: 120},
  });

  const subtitleReveal = spring({
    frame: frame - 30,
    fps,
    config: {damping: 15, stiffness: 115},
  });

  const orbitSpin = frame * 1.2;
  const orbitRadius = 340;

  const glassesOpacity = interpolate(frame, [8, 30, 230, 260], [0, 1, 1, 0]);
  const sceneFade = interpolate(frame, [0, 10, 250, 270], [0, 1, 1, 0]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 40% 20%, #ffffff 0%, ${bgColor} 60%, #E4E9E2 100%)`,
        opacity: sceneFade,
        fontFamily: 'Inter, sans-serif',
        color: '#121418',
      }}
    >
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${0.92 + logoReveal * 0.08})`,
        }}
      >
        <Img
          src={staticFile(logoSrc)}
          style={{
            width: 440,
            objectFit: 'contain',
            filter: 'drop-shadow(0 16px 25px rgba(0,0,0,0.14))',
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          transform: `translateY(215px)`,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 82,
            textTransform: 'uppercase',
            letterSpacing: 2,
            fontWeight: 700,
            transform: `translateY(${interpolate(titleReveal, [0, 1], [30, 0])}px)`,
            opacity: titleReveal,
          }}
        >
          Kandi
        </h1>

        <p
          style={{
            marginTop: 20,
            maxWidth: 1250,
            textAlign: 'center',
            fontSize: 42,
            lineHeight: 1.25,
            fontWeight: 500,
            color: '#21262D',
            opacity: subtitleReveal,
            transform: `translateY(${interpolate(subtitleReveal, [0, 1], [25, 0])}px)`,
          }}
        >
          Concert chaos, controlled
        </p>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          opacity: glassesOpacity,
          transform: `rotate(${orbitSpin}deg)`,
        }}
      >
        <div
          style={{
            transform: `translateX(${orbitRadius}px) rotate(${-orbitSpin}deg)`,
          }}
        >
          <EvenG1Glasses size={0.62} />
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          opacity: glassesOpacity * 0.85,
          transform: `rotate(${-orbitSpin * 0.8}deg)`,
        }}
      >
        <div
          style={{
            transform: `translateX(${-orbitRadius + 20}px) rotate(${orbitSpin * 0.8}deg)`,
          }}
        >
          <EvenG1Glasses size={0.52} />
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 22%, rgba(255,255,255,0) 78%, rgba(0,0,0,0.06) 100%)',
        }}
      />

      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 34,
          opacity: interpolate(frame, [80, 120], [0.25, 0.75]),
          color: accent,
          fontSize: 20,
          letterSpacing: 3,
          fontWeight: 700,
          textTransform: 'uppercase',
        }}
      >
        real-time overlays • sound • safety • connection
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
