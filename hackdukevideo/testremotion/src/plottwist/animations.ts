import {Easing, interpolate, spring} from 'remotion';

export const getFadeInOut = (
  frame: number,
  durationInFrames: number,
  fadeFrames = 8,
): number => {
  const clampedFade = Math.max(1, Math.min(fadeFrames, Math.floor(durationInFrames / 2)));

  return interpolate(
    frame,
    [0, clampedFade, durationInFrames - clampedFade, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.2, 0.9, 0.2, 1),
    },
  );
};

export const getCameraPushInScale = (frame: number, durationInFrames: number): number => {
  return interpolate(frame, [0, durationInFrames], [1, 1.12], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.12, 0.76, 0.28, 1),
  });
};

export const getPopInScale = (frame: number, fps: number, delayFrames = 0): number => {
  return spring({
    frame: Math.max(0, frame - delayFrames),
    fps,
    config: {
      damping: 14,
      stiffness: 180,
      mass: 0.8,
    },
    from: 0.7,
    to: 1,
  });
};

export const getOrbitAngle = (frame: number, speed = 1): number => {
  return frame * speed * 3.2;
};

export const getGlitchJitter = (frame: number, strength = 10): {x: number; y: number; hue: number} => {
  const pulse = frame % 6 === 0 ? 1 : 0.35;
  const x = Math.sin(frame * 1.9) * strength * pulse;
  const y = Math.cos(frame * 1.3) * (strength * 0.6) * pulse;
  const hue = Math.sin(frame * 0.4) * 18;

  return {x, y, hue};
};
