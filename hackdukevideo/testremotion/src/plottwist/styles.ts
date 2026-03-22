import {CSSProperties} from 'react';

export const fill: CSSProperties = {
  width: '100%',
  height: '100%',
};

export const stage: CSSProperties = {
  ...fill,
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Inter, Avenir, Helvetica, Arial, sans-serif',
  color: '#f8fbff',
};

export const sceneNoise: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background:
    'repeating-radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 2px, transparent 6px)',
  mixBlendMode: 'soft-light',
  pointerEvents: 'none',
};

export const headline: CSSProperties = {
  margin: 0,
  textTransform: 'uppercase',
  letterSpacing: 2,
  fontWeight: 900,
  textAlign: 'center',
  textShadow: '0 0 28px rgba(168, 215, 255, 0.44)',
};

export const subline: CSSProperties = {
  margin: 0,
  fontWeight: 600,
  opacity: 0.95,
  textAlign: 'center',
};

export const panel: CSSProperties = {
  position: 'relative',
  zIndex: 3,
  width: '84%',
  maxWidth: 1500,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 22,
};

export const noirBg: CSSProperties = {
  background:
    'radial-gradient(1200px 600px at 10% 85%, rgba(88, 112, 152, 0.4) 0%, rgba(21, 30, 45, 0.2) 45%, rgba(6, 8, 14, 1) 100%), linear-gradient(160deg, #161f33 0%, #0b0f1d 45%, #05070d 100%)',
};

export const neonSpaceBg: CSSProperties = {
  background:
    'radial-gradient(circle at 75% 18%, rgba(255, 84, 196, 0.6) 0%, rgba(103, 55, 255, 0.25) 28%, rgba(9, 12, 24, 0) 48%), radial-gradient(circle at 16% 80%, rgba(30, 246, 221, 0.55) 0%, rgba(12, 30, 63, 0.2) 35%, rgba(4, 6, 16, 1) 72%), linear-gradient(145deg, #180b2f 0%, #0f1739 52%, #090d19 100%)',
};

export const holoBg: CSSProperties = {
  background:
    'radial-gradient(1000px 520px at 50% 14%, rgba(97, 202, 255, 0.24), rgba(3, 6, 14, 0.1) 45%, rgba(5, 8, 18, 1) 100%), linear-gradient(170deg, #0a1129 0%, #090d1a 40%, #06070f 100%)',
};

export const glitchBg: CSSProperties = {
  background:
    'linear-gradient(135deg, #2d0b2c 0%, #0f1f3a 34%, #15261c 64%, #180c2d 100%)',
};

export const finalBg: CSSProperties = {
  background:
    'radial-gradient(circle at 50% 48%, rgba(255, 237, 184, 0.23) 0%, rgba(247, 169, 52, 0.2) 25%, rgba(19, 23, 37, 0.9) 60%, #070910 100%), linear-gradient(180deg, #161922 0%, #0c0f1b 100%)',
};
