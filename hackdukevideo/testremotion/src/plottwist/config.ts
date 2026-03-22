import rawConfig from './config.json';
import {PlotTwistVideoConfig} from './types';

const assertValidConfig = (config: PlotTwistVideoConfig): PlotTwistVideoConfig => {
  if (config.scenes.length === 0) {
    throw new Error('PlotTwist config must define at least one scene.');
  }

  return config;
};

export const PLOT_TWIST_CONFIG = assertValidConfig(rawConfig as PlotTwistVideoConfig);

export const PLOT_TWIST_TOTAL_DURATION = PLOT_TWIST_CONFIG.scenes.reduce(
  (total, scene) => total + scene.durationInFrames,
  0,
);
