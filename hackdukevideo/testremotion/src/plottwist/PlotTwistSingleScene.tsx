import React from 'react';
import {PLOT_TWIST_CONFIG} from './config';
import {PlotTwistSceneView} from './PlotTwistSceneView';

type PlotTwistSingleSceneProps = {
  sceneId: string;
};

export const PlotTwistSingleScene: React.FC<PlotTwistSingleSceneProps> = ({sceneId}) => {
  const scene = PLOT_TWIST_CONFIG.scenes.find((item) => item.id === sceneId);

  if (!scene) {
    throw new Error(`Unknown PlotTwist scene id: ${sceneId}`);
  }

  return <PlotTwistSceneView scene={scene} />;
};
