import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  getCameraPushInScale,
  getFadeInOut,
  getGlitchJitter,
  getOrbitAngle,
  getPopInScale,
} from './animations';
import {
  finalBg,
  glitchBg,
  headline,
  holoBg,
  neonSpaceBg,
  noirBg,
  panel,
  sceneNoise,
  stage,
  subline,
} from './styles';
import {
  PlotTwistSceneConfig,
  SceneFinalCardData,
  SceneGlitchCrowdData,
  SceneNeonWordBurstData,
  SceneNoirDeskData,
  SceneScriptAssemblyData,
} from './types';

const SceneFrame: React.FC<React.PropsWithChildren<{backgroundStyle: React.CSSProperties}>> = ({
  backgroundStyle,
  children,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const opacity = getFadeInOut(frame, durationInFrames, 6);
  const scale = getCameraPushInScale(frame, durationInFrames);

  return (
    <AbsoluteFill style={{...stage, ...backgroundStyle, opacity, transform: `scale(${scale})`}}>
      <div style={sceneNoise} />
      {children}
    </AbsoluteFill>
  );
};

const NoirDeskScene: React.FC<{data: SceneNoirDeskData}> = ({data}) => {
  const frame = useCurrentFrame();
  const wingSlam = interpolate(frame, [0, 12, 22], [-20, 30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <SceneFrame backgroundStyle={noirBg}>
      <div style={panel}>
        <h1 style={{...headline, fontSize: 94}}>{data.title}</h1>
        <p style={{...subline, fontSize: 36}}>{data.descriptor}</p>
        <div
          style={{
            marginTop: 14,
            fontSize: 46,
            fontWeight: 800,
            textAlign: 'center',
            transform: `translateY(${wingSlam}px) rotate(${interpolate(frame, [0, 20], [-2, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}deg)`,
            textShadow: '0 0 22px rgba(240, 248, 255, 0.4)',
          }}
        >
          🐦🕵️ {data.character}
        </div>
      </div>
    </SceneFrame>
  );
};

const NeonWordBurstScene: React.FC<{data: SceneNeonWordBurstData}> = ({data}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <SceneFrame backgroundStyle={neonSpaceBg}>
      <div style={panel}>
        <h2 style={{...headline, fontSize: 58, maxWidth: 1250}}>{data.headline}</h2>
        {data.words.map((word, index) => {
          const angle = getOrbitAngle(frame + index * 10, 1.1 + index * 0.08);
          const radius = 180 + index * 55;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * (radius * 0.45);
          const pop = getPopInScale(frame, fps, index * 6);

          return (
            <div
              key={word}
              style={{
                position: 'absolute',
                left: '50%',
                top: '55%',
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${pop}) rotate(${angle * 0.6}deg)`,
                padding: '12px 20px',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.32)',
                background: 'rgba(10, 10, 20, 0.46)',
                fontSize: 42,
                fontWeight: 900,
                letterSpacing: 1,
                color: '#f6fbff',
                textShadow: '0 0 18px rgba(132, 255, 252, 0.6)',
                boxShadow: '0 0 32px rgba(255, 68, 221, 0.26)',
              }}
            >
              {word}
            </div>
          );
        })}
      </div>
    </SceneFrame>
  );
};

const ScriptAssemblyScene: React.FC<{data: SceneScriptAssemblyData}> = ({data}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <SceneFrame backgroundStyle={holoBg}>
      <div style={panel}>
        <h2 style={{...headline, fontSize: 56, maxWidth: 1400}}>{data.headline}</h2>
        <div
          style={{
            width: '78%',
            minHeight: 450,
            borderRadius: 18,
            border: '1px solid rgba(131, 226, 255, 0.58)',
            background: 'linear-gradient(180deg, rgba(8,24,45,0.74), rgba(9,10,19,0.82))',
            boxShadow: '0 0 45px rgba(85, 207, 255, 0.35)',
            padding: '34px 38px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {data.fragments.map((fragment, index) => {
            const delay = index * 10;
            const reveal = getPopInScale(frame, fps, delay);
            const settleY = interpolate(frame, [delay, delay + 16], [30, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <p
                key={fragment}
                style={{
                  margin: 0,
                  fontSize: 34,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  color: '#dff6ff',
                  opacity: reveal,
                  transform: `translateY(${settleY}px) scale(${0.95 + reveal * 0.05})`,
                  textShadow: '0 0 18px rgba(151, 237, 255, 0.4)',
                }}
              >
                {fragment}
              </p>
            );
          })}
        </div>
      </div>
    </SceneFrame>
  );
};

const GlitchCrowdScene: React.FC<{data: SceneGlitchCrowdData}> = ({data}) => {
  const frame = useCurrentFrame();

  return (
    <SceneFrame backgroundStyle={glitchBg}>
      <div style={panel}>
        <h2 style={{...headline, fontSize: 56, maxWidth: 1400}}>{data.headline}</h2>
        <div style={{display: 'flex', gap: 24, marginTop: 8}}>
          {data.chants.map((chant, index) => {
            const jitter = getGlitchJitter(frame + index * 4, 9 + index * 2);

            return (
              <div
                key={chant}
                style={{
                  width: 430,
                  minHeight: 240,
                  borderRadius: 22,
                  background: 'rgba(9, 16, 29, 0.68)',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  padding: '26px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  transform: `translate(${jitter.x}px, ${jitter.y}px)`,
                  filter: `hue-rotate(${jitter.hue}deg)`,
                  boxShadow: '0 0 30px rgba(255, 108, 213, 0.25)',
                }}
              >
                <div style={{fontSize: 76, marginBottom: 8}}>🤖📱</div>
                <p style={{margin: 0, fontSize: 34, fontWeight: 900}}>{chant}</p>
              </div>
            );
          })}
        </div>
      </div>
    </SceneFrame>
  );
};

const FinalCardScene: React.FC<{data: SceneFinalCardData}> = ({data}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const slam = getPopInScale(frame, fps, 4);
  const burstOpacity = interpolate(frame, [6, 20, 45], [0, 1, 0.45], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <SceneFrame backgroundStyle={finalBg}>
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,230,159,0.55) 0%, rgba(255,190,84,0.22) 35%, rgba(255,255,255,0) 72%)',
          opacity: burstOpacity,
        }}
      />
      <div style={panel}>
        <h1
          style={{
            ...headline,
            fontSize: 176,
            transform: `scale(${slam})`,
            textShadow: '0 0 42px rgba(255, 214, 127, 0.7)',
          }}
        >
          {data.title}
        </h1>
        <p style={{...subline, fontSize: 42}}>{data.subtitle}</p>
      </div>
    </SceneFrame>
  );
};

export const PlotTwistSceneView: React.FC<{scene: PlotTwistSceneConfig}> = ({scene}) => {
  switch (scene.type) {
    case 'noirDesk':
      return <NoirDeskScene data={scene.data} />;
    case 'neonWordBurst':
      return <NeonWordBurstScene data={scene.data} />;
    case 'scriptAssembly':
      return <ScriptAssemblyScene data={scene.data} />;
    case 'glitchCrowd':
      return <GlitchCrowdScene data={scene.data} />;
    case 'finalCard':
      return <FinalCardScene data={scene.data} />;
    default:
      return null;
  }
};
