import React, {PropsWithChildren} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {getFadeOpacity} from './animations';
import {cinematicBackground, grainOverlay} from './styles';

export const SceneShell: React.FC<PropsWithChildren> = ({children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const opacity = getFadeOpacity(frame, durationInFrames, 18);

  return (
    <AbsoluteFill style={{...cinematicBackground, opacity}}>
      <div style={grainOverlay} />
      {children}
    </AbsoluteFill>
  );
};
