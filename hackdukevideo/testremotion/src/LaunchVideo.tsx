import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  Sequence,
  staticFile,
  Img,
} from 'remotion';

// ============================================
// ANIMATION UTILITIES
// ============================================

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

const useParticles = (count: number): Particle[] => {
  return useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      size: Math.random() * 4 + 1,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
      opacity: Math.random() * 0.5 + 0.2,
      color: ['#e85a17', '#ff6b35', '#ffa07a', '#ffd4c4'][Math.floor(Math.random() * 4)],
    }));
  }, [count]);
};

// ============================================
// TEXT ANIMATION COMPONENTS
// ============================================

const ScrambleText: React.FC<{
  text: string;
  startFrame: number;
  style?: React.CSSProperties;
}> = ({ text, startFrame, style }) => {
  const frame = useCurrentFrame();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  const progress = Math.max(0, frame - startFrame);
  const revealedChars = Math.floor((progress / 20) * text.length);
  
  const displayText = text.split('').map((char, i) => {
    if (i < revealedChars) return char;
    if (char === ' ') return ' ';
    return chars[Math.floor(Math.random() * chars.length)];
  }).join('');

  return (
    <span style={style}>
      {displayText}
    </span>
  );
};

const SplitTextReveal: React.FC<{
  text: string;
  startFrame: number;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ text, startFrame, delay = 3, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <span style={{ ...style, display: 'inline-flex', flexWrap: 'wrap' }}>
      {text.split('').map((char, i) => {
        const charProgress = Math.max(0, frame - startFrame - i * delay);
        const charY = spring({
          fps,
          frame: charProgress,
          config: { damping: 12, stiffness: 200 },
        });
        
        const charOpacity = interpolate(charProgress, [0, 10], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const charRotate = interpolate(charProgress, [0, 15], [90, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${40 - charY * 40}px) rotateX(${charRotate}deg)`,
              opacity: charOpacity,
              transformOrigin: 'center bottom',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </span>
  );
};

const TypewriterText: React.FC<{
  text: string;
  startFrame: number;
  speed?: number;
  cursor?: boolean;
  style?: React.CSSProperties;
}> = ({ text, startFrame, speed = 2, cursor = true, style }) => {
  const frame = useCurrentFrame();
  const progress = Math.max(0, frame - startFrame);
  const visibleChars = Math.floor(progress / speed);
  const displayText = text.slice(0, visibleChars);
  const showCursor = cursor && (frame % 30 < 15);

  return (
    <span style={style}>
      {displayText}
      {showCursor && <span style={{ opacity: 0.7 }}>|</span>}
    </span>
  );
};

const ScaleInWords: React.FC<{
  text: string;
  startFrame: number;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ text, startFrame, delay = 5, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = text.split(' ');

  return (
    <span style={{ ...style, display: 'inline-flex', flexWrap: 'wrap', gap: '0.3em' }}>
      {words.map((word, i) => {
        const wordProgress = Math.max(0, frame - startFrame - i * delay);
        const wordScale = spring({
          fps,
          frame: wordProgress,
          config: { damping: 10, stiffness: 150 },
        });
        
        const wordOpacity = interpolate(wordProgress, [0, 10], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `scale(${0.5 + wordScale * 0.5})`,
              opacity: wordOpacity,
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};

// ============================================
// VISUAL EFFECTS
// ============================================

const ParticleField: React.FC<{ count?: number; color?: string }> = ({ 
  count = 50, 
  color = '#e85a17' 
}) => {
  const frame = useCurrentFrame();
  const particles = useParticles(count);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map((p) => {
        const x = (p.x + frame * p.speedX + 1920) % 1920;
        const y = (p.y + frame * p.speedY + 1080) % 1080;
        const pulse = 1 + Math.sin(frame * 0.05 + p.id) * 0.3;

        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: p.size * pulse,
              height: p.size * pulse,
              borderRadius: '50%',
              backgroundColor: p.color,
              opacity: p.opacity * (0.5 + Math.sin(frame * 0.03 + p.id) * 0.5),
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        );
      })}
    </div>
  );
};

const GlowOrb: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  delay?: number;
}> = ({ x, y, size, color, delay = 0 }) => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin((frame + delay) * 0.03) * 0.2;
  const float = Math.sin((frame + delay) * 0.02) * 20;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + float,
        width: size * pulse,
        height: size * pulse,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
        filter: 'blur(40px)',
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
};

const GridLines: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 60], [0, 0.03], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(232, 90, 23, ${opacity}) 1px, transparent 1px),
          linear-gradient(90deg, rgba(232, 90, 23, ${opacity}) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        transform: `perspective(1000px) rotateX(60deg) translateY(${frame * 0.5}px)`,
        transformOrigin: 'center top',
      }}
    />
  );
};

// ============================================
// SCENE COMPONENTS
// ============================================

const Scene1_LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    fps,
    frame: frame - 10,
    config: { damping: 12, stiffness: 100 },
  });

  const glowIntensity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const exitProgress = Math.max(0, frame - 120);
  const exitScale = interpolate(exitProgress, [0, 30], [1, 0.8], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitOpacity = interpolate(exitProgress, [0, 30], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
      }}
    >
      <ParticleField count={30} color="#e85a17" />
      
      {/* Animated background glow */}
      <GlowOrb x={960} y={540} size={400} color="#e85a17" delay={0} />
      <GlowOrb x={700} y={400} size={200} color="#ff6b35" delay={20} />
      <GlowOrb x={1200} y={600} size={250} color="#ffa07a" delay={40} />

      {/* Logo container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 40,
          transform: `scale(${logoScale})`,
        }}
      >
        {/* Animated logo grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            padding: 20,
          }}
        >
          {Array.from({ length: 16 }).map((_, i) => {
            const cellProgress = Math.max(0, frame - 20 - i * 3);
            const cellScale = spring({
              fps,
              frame: cellProgress,
              config: { damping: 15, stiffness: 200 },
            });
            const cellRotate = interpolate(cellProgress, [0, 20], [180, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <div
                key={i}
                style={{
                  width: 24,
                  height: 24,
                  background: '#e85a17',
                  borderRadius: 4,
                  transform: `scale(${cellScale}) rotate(${cellRotate}deg)`,
                  opacity: interpolate(cellProgress, [0, 10], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  }),
                  boxShadow: `0 0 ${20 * glowIntensity}px #e85a17`,
                }}
              />
            );
          })}
        </div>

        {/* Logo text with scramble effect */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: 'white',
            letterSpacing: 8,
            textTransform: 'uppercase',
          }}
        >
          <ScrambleText text="CHASI" startFrame={80} />
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 24,
            color: '#888',
            letterSpacing: 4,
            textTransform: 'uppercase',
            opacity: interpolate(frame, [100, 130], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            transform: `translateY(${interpolate(frame, [100, 130], [20, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}px)`,
          }}
        >
          The Future of Work
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene2_ProblemStatement: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneProgress = Math.max(0, frame);

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%)',
        padding: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Floating particles */}
      <ParticleField count={20} color="#e85a17" />

      {/* Hero text with multiple animation techniques */}
      <div style={{ textAlign: 'center', maxWidth: 1000, marginTop: 100 }}>
        <h1
          style={{
            fontSize: 72,
            fontWeight: 500,
            lineHeight: 1.2,
            color: '#1a1a1a',
            marginBottom: 60,
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <SplitTextReveal
              text="Your "
              startFrame={20}
              delay={2}
              style={{ color: '#1a1a1a' }}
            />
            <span
              style={{
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                color: '#e85a17',
              }}
            >
              <SplitTextReveal text="best people" startFrame={50} delay={3} />
            </span>
          </div>
          <div>
            <ScaleInWords
              text="are drowning in the least valuable work"
              startFrame={90}
              delay={4}
            />
          </div>
        </h1>

        {/* Animated decorative line */}
        <div
          style={{
            width: interpolate(sceneProgress, [120, 180], [0, 200], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            height: 3,
            background: 'linear-gradient(90deg, transparent, #e85a17, transparent)',
            margin: '0 auto',
          }}
        />
      </div>

      {/* Stats cards with 3D hover effect */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 24,
          maxWidth: 1000,
          width: '100%',
          marginTop: 80,
          perspective: '1000px',
        }}
      >
        {[
          { icon: '⏱️', title: '2+ hours lost', desc: 'per rep per day on admin tasks', delay: 150 },
          { icon: '⚡', title: 'Speed kills deals', desc: 'both new & repeat business', delay: 170 },
          { icon: '📉', title: '10-20% of quotes', desc: 'quietly die without follow-up', delay: 190 },
          { icon: '👥', title: '40% of clients', desc: 'receive less than 1 touch', delay: 210 },
        ].map((stat, i) => {
          const cardProgress = Math.max(0, frame - stat.delay);
          const cardY = spring({
            fps,
            frame: cardProgress,
            config: { damping: 15, stiffness: 100 },
          });

          return (
            <div
              key={i}
              style={{
                background: 'white',
                borderRadius: 20,
                padding: 32,
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                transform: `
                  translateY(${60 - cardY * 60}px)
                  rotateX(${interpolate(cardProgress, [0, 30], [15, 0], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  })}deg)
                `,
                opacity: interpolate(cardProgress, [0, 20], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
                transformStyle: 'preserve-3d',
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>{stat.icon}</div>
              <h3
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: 8,
                }}
              >
                {stat.title}
              </h3>
              <p style={{ fontSize: 16, color: '#666', lineHeight: 1.6 }}>
                {stat.desc}
              </p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Scene3_Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Animated grid background */}
      <GridLines />

      {/* Floating orbs */}
      <GlowOrb x={200} y={200} size={300} color="#e85a17" delay={0} />
      <GlowOrb x={1700} y={800} size={400} color="#ff6b35" delay={50} />
      <GlowOrb x={960} y={1080} size={500} color="#ffa07a" delay={100} />

      <div style={{ textAlign: 'center', zIndex: 10 }}>
        {/* Intro text */}
        <div
          style={{
            fontSize: 24,
            color: '#e85a17',
            letterSpacing: 8,
            textTransform: 'uppercase',
            marginBottom: 40,
            opacity: interpolate(frame, [0, 30], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            transform: `translateY(${interpolate(frame, [0, 30], [30, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}px)`,
          }}
        >
          Introducing
        </div>

        {/* Main headline with 3D effect */}
        <h1
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: 'white',
            letterSpacing: -2,
            marginBottom: 30,
            transform: `
              perspective(1000px)
              rotateX(${interpolate(frame, [30, 80], [45, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })}deg)
              translateZ(${interpolate(frame, [30, 80], [-200, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })}px)
            `,
            opacity: interpolate(frame, [30, 80], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            textShadow: '0 0 80px rgba(232, 90, 23, 0.5)',
          }}
        >
          CHASI
        </h1>

        {/* Tagline with typewriter effect */}
        <div
          style={{
            fontSize: 32,
            color: '#aaa',
            marginBottom: 60,
            height: 40,
          }}
        >
          <TypewriterText
            text="AI-Powered Workflow Automation"
            startFrame={100}
            speed={2}
          />
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            gap: 20,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {['Automated Follow-ups', 'Smart Scheduling', 'Quote Tracking', 'Client Insights'].map(
            (feature, i) => {
              const featureProgress = Math.max(0, frame - 180 - i * 15);
              const featureScale = spring({
                fps,
                frame: featureProgress,
                config: { damping: 12, stiffness: 200 },
              });

              return (
                <div
                  key={feature}
                  style={{
                    background: 'rgba(232, 90, 23, 0.2)',
                    border: '1px solid rgba(232, 90, 23, 0.4)',
                    borderRadius: 50,
                    padding: '12px 28px',
                    color: '#e85a17',
                    fontSize: 16,
                    fontWeight: 500,
                    transform: `scale(${featureScale})`,
                    opacity: interpolate(featureProgress, [0, 15], [0, 1], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    }),
                  }}
                >
                  {feature}
                </div>
              );
            }
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene4_CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulseScale = 1 + Math.sin(frame * 0.1) * 0.05;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #e85a17 0%, #ff6b35 50%, #ffa07a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
        }}
      />

      <div style={{ textAlign: 'center', zIndex: 10 }}>
        {/* Main CTA text */}
        <h1
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: 'white',
            marginBottom: 30,
            opacity: interpolate(frame, [0, 40], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            transform: `translateY(${interpolate(frame, [0, 40], [50, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}px)`,
          }}
        >
          Ready to Transform?
        </h1>

        <p
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.9)',
            marginBottom: 60,
            opacity: interpolate(frame, [30, 60], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          Join 1000+ teams already saving 10+ hours per week
        </p>

        {/* CTA Button with pulse */}
        <div
          style={{
            display: 'inline-block',
            background: 'white',
            color: '#e85a17',
            padding: '24px 60px',
            borderRadius: 60,
            fontSize: 24,
            fontWeight: 600,
            cursor: 'pointer',
            transform: `scale(${interpolate(frame, [60, 90], [0.8, pulseScale], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })})`,
            opacity: interpolate(frame, [60, 90], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            boxShadow: `0 20px 60px rgba(0,0,0,0.3), 0 0 0 ${20 + Math.sin(frame * 0.1) * 10}px rgba(255,255,255,0.1)`,
          }}
        >
          Get Started Free →
        </div>

        {/* Trust badges */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            marginTop: 80,
            opacity: interpolate(frame, [100, 140], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {['★★★★★ 4.9/5 Rating', 'SOC 2 Compliant', 'GDPR Ready'].map((badge) => (
            <div
              key={badge}
              style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              {badge}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================
// MAIN COMPOSITION
// ============================================

export const LaunchVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Scene 1: Logo Reveal (0-150 frames) */}
      <Sequence from={0} durationInFrames={150}>
        <Scene1_LogoReveal />
      </Sequence>

      {/* Scene 2: Problem Statement (120-360 frames) */}
      <Sequence from={120} durationInFrames={240}>
        <Scene2_ProblemStatement />
      </Sequence>

      {/* Scene 3: Solution (330-570 frames) */}
      <Sequence from={330} durationInFrames={240}>
        <Scene3_Solution />
      </Sequence>

      {/* Scene 4: CTA (540-720 frames) */}
      <Sequence from={540} durationInFrames={180}>
        <Scene4_CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
