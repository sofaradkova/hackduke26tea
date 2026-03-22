import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

type EvenG1GlassesProps = {
  className?: string;
  size?: number;
};

export const EvenG1Glasses: React.FC<EvenG1GlassesProps> = ({className, size = 1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const popIn = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 120,
      mass: 0.8,
    },
  });

  const spin = frame * 1.6;
  const driftY = Math.sin(frame / 24) * 10;

  const overlayPulse = interpolate(Math.sin(frame / 10), [-1, 1], [0.2, 0.65]);

  return (
    <div
      className={className}
      style={{
        width: 680 * size,
        height: 240 * size,
        transform: `translateY(${driftY}px) rotateY(${spin}deg) scale(${0.8 + popIn * 0.2})`,
        transformStyle: 'preserve-3d',
        filter: `drop-shadow(0 22px 36px rgba(0,0,0,0.28)) drop-shadow(0 0 36px rgba(71, 214, 160, ${overlayPulse}))`,
        pointerEvents: 'none',
      }}
    >
        <svg width="680" height="240" viewBox="0 0 680 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="frameGrad" x1="0" y1="0" x2="680" y2="240" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0E1116" />
              <stop offset="0.5" stopColor="#1D232F" />
              <stop offset="1" stopColor="#0B0E14" />
            </linearGradient>
            <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="rgba(140,255,228,0.24)" />
              <stop offset="1" stopColor="rgba(80,160,255,0.08)" />
            </linearGradient>
          </defs>

          <rect x="80" y="56" width="220" height="130" rx="46" fill="url(#glassGrad)" stroke="url(#frameGrad)" strokeWidth="14" />
          <rect x="380" y="56" width="220" height="130" rx="46" fill="url(#glassGrad)" stroke="url(#frameGrad)" strokeWidth="14" />

          <rect x="300" y="106" width="80" height="26" rx="13" fill="url(#frameGrad)" />

          <rect x="54" y="102" width="36" height="12" rx="6" fill="#0F141D" />
          <rect x="590" y="102" width="36" height="12" rx="6" fill="#0F141D" />

          <rect x="120" y="76" width="160" height="92" rx="26" fill={`rgba(80, 255, 210, ${overlayPulse})`} />
          <rect x="400" y="76" width="160" height="92" rx="26" fill={`rgba(88, 184, 255, ${overlayPulse * 0.9})`} />

          <line x1="128" y1="94" x2="238" y2="94" stroke="rgba(255,255,255,0.7)" strokeWidth="4" strokeLinecap="round" />
          <line x1="128" y1="112" x2="210" y2="112" stroke="rgba(255,255,255,0.56)" strokeWidth="4" strokeLinecap="round" />

          <circle cx="510" cy="122" r="22" stroke="rgba(255,255,255,0.76)" strokeWidth="4" fill="none" />
          <line x1="510" y1="100" x2="510" y2="144" stroke="rgba(255,255,255,0.76)" strokeWidth="4" strokeLinecap="round" />
          <line x1="488" y1="122" x2="532" y2="122" stroke="rgba(255,255,255,0.76)" strokeWidth="4" strokeLinecap="round" />
        </svg>
    </div>
  );
};
