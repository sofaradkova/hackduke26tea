import React from 'react';
import {
  AbsoluteFill,
  Html5Video,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const VIDEO_FILE = 'CleanShot 2026-02-16 at 22.39.04.mp4';

export const CleanShotPreviewPage: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const cardScale = spring({
    fps,
    frame,
    config: {damping: 16, stiffness: 120},
  });

  const cardOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #111827 100%)',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          width: 1600,
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
          transform: `scale(${0.92 + cardScale * 0.08})`,
          opacity: cardOpacity,
          backgroundColor: '#0b1220',
        }}
      >
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 20px',
            background: 'linear-gradient(180deg, #1f2937, #111827)',
            color: '#d1d5db',
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          <span style={{width: 12, height: 12, borderRadius: 999, background: '#ef4444'}} />
          <span style={{width: 12, height: 12, borderRadius: 999, background: '#f59e0b'}} />
          <span style={{width: 12, height: 12, borderRadius: 999, background: '#22c55e'}} />
          <span style={{marginLeft: 12}}>CleanShot Preview</span>
        </div>

        <div style={{position: 'relative', width: '100%', aspectRatio: '16 / 9', background: '#000'}}>
          <Html5Video
            src={staticFile(VIDEO_FILE)}
            style={{width: '100%', height: '100%', objectFit: 'contain'}}
            controls={false}
            muted
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
