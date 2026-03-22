export type SceneNoirDeskData = {
  title: string;
  descriptor: string;
  character: string;
};

export type SceneNeonWordBurstData = {
  headline: string;
  words: [string, string, string, string];
};

export type SceneScriptAssemblyData = {
  headline: string;
  fragments: string[];
};

export type SceneGlitchCrowdData = {
  headline: string;
  chants: [string, string, string];
};

export type SceneFinalCardData = {
  title: string;
  subtitle: string;
};

type BaseScene = {
  id: string;
  durationInFrames: number;
};

export type PlotTwistSceneConfig =
  | (BaseScene & {
      type: 'noirDesk';
      data: SceneNoirDeskData;
    })
  | (BaseScene & {
      type: 'neonWordBurst';
      data: SceneNeonWordBurstData;
    })
  | (BaseScene & {
      type: 'scriptAssembly';
      data: SceneScriptAssemblyData;
    })
  | (BaseScene & {
      type: 'glitchCrowd';
      data: SceneGlitchCrowdData;
    })
  | (BaseScene & {
      type: 'finalCard';
      data: SceneFinalCardData;
    });

export type PlotTwistVideoConfig = {
  id: string;
  title: string;
  fps: number;
  width: number;
  height: number;
  scenes: PlotTwistSceneConfig[];
};
