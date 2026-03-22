import React from 'react';
import {Sequence} from 'remotion';
import {PLOT_TWIST_CONFIG} from './config';
import {PlotTwistSceneView} from './PlotTwistSceneView';

export const PlotTwistTrailer: React.FC = () => {
  let cursor = 0;

  return (
    <>
      {PLOT_TWIST_CONFIG.scenes.map((scene) => {
        const from = cursor;
        cursor += scene.durationInFrames;

        return (
          <Sequence key={scene.id} from={from} durationInFrames={scene.durationInFrames}>
            <PlotTwistSceneView scene={scene} />
          </Sequence>
        );
      })}
    </>
  );
};
