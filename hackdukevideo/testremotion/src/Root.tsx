import {Composition} from 'remotion';
import {TestComposition} from './TestComposition';
import {ChasiStats} from './ChasiStats';
import {LaunchVideo} from './LaunchVideo';
import {AdvancedLaunch} from './AdvancedLaunch';
import {LanceStyleVideo} from './LanceStyleVideo';
import {CleanShotPreviewPage} from './CleanShotPreviewPage';
import {AsciiHandAnimation} from './AsciiHandAnimation';
import {KandiIntro} from './KandiIntro';
import {SkillsAddRemotionTerminal} from './SkillsAddRemotionTerminal';
import {APCalcFRQWalkthrough} from './APCalcFRQWalkthrough';
import {getTotalDuration as getAPCalcDuration} from './educational/SpinningToyTutorial';
import {PlotTwistTrailer} from './plottwist/PlotTwistTrailer';
import {PlotTwistSingleScene} from './plottwist/PlotTwistSingleScene';
import {PLOT_TWIST_CONFIG, PLOT_TWIST_TOTAL_DURATION} from './plottwist/config';
import {SpinningToyTutorial, getTotalDuration as getSpinningToyDuration} from './educational/SpinningToyTutorial';
import {kimi_SpinningToyWith3D} from './educational/kimi-SpinningToyWith3D';
import {getTotalDuration as getKimiDuration} from './educational/SpinningToyTutorial';
import {v2SpinningToyTutorial, getTotalDuration as getV2Duration} from './educational/v2-SpinningToyTutorial';


export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="TestComposition"
        component={TestComposition}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ChasiStats"
        component={ChasiStats}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LaunchVideo"
        component={LaunchVideo}
        durationInFrames={720}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AdvancedLaunch"
        component={AdvancedLaunch}
        durationInFrames={930}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LanceStyleVideo"
        component={LanceStyleVideo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CleanShotPreviewPage"
        component={CleanShotPreviewPage}
        durationInFrames={155}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AsciiHandAnimation"
        component={AsciiHandAnimation}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="KandiIntro"
        component={KandiIntro}
        durationInFrames={270}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          logoSrc: 'kandiNOTEXT.png',
        }}
      />
      <Composition
        id="SkillsAddRemotionTerminal"
        component={SkillsAddRemotionTerminal}
        durationInFrames={300}
        fps={30}
        width={1280}
        height={1000}
      />
      <Composition
        id="APCalcFRQWalkthrough"
        component={APCalcFRQWalkthrough}
        durationInFrames={getAPCalcDuration()}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id={PLOT_TWIST_CONFIG.id}
        component={PlotTwistTrailer}
        durationInFrames={PLOT_TWIST_TOTAL_DURATION}
        fps={PLOT_TWIST_CONFIG.fps}
        width={PLOT_TWIST_CONFIG.width}
        height={PLOT_TWIST_CONFIG.height}
      />
      {PLOT_TWIST_CONFIG.scenes.map((scene) => (
        <Composition
          key={scene.id}
          id={scene.id}
          component={PlotTwistSingleScene}
          durationInFrames={scene.durationInFrames}
          fps={PLOT_TWIST_CONFIG.fps}
          width={PLOT_TWIST_CONFIG.width}
          height={PLOT_TWIST_CONFIG.height}
          defaultProps={{sceneId: scene.id}}
        />
      ))}
      <Composition
        id="SpinningToyTutorial"
        component={SpinningToyTutorial}
        durationInFrames={getSpinningToyDuration()}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="v2-SpinningToyTutorial"
        component={v2SpinningToyTutorial}
        durationInFrames={getV2Duration()}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="kimi-SpinningToy3D"
        component={kimi_SpinningToyWith3D}
        durationInFrames={getKimiDuration()}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};