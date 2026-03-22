import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  Sequence,
} from 'remotion';

// ============================================
// LANCE DESIGN SYSTEM
// Based on ultimate-website-design-guide-v5.md
// ============================================

const COLORS = {
  bgPrimary: '#0A1A1A',
  bgSecondary: '#1A2A2A',
  bgTertiary: '#0F2020',
  accent: '#00D4AA',
  accentGlow: 'rgba(0, 212, 170, 0.3)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  border: 'rgba(255, 255, 255, 0.1)',
  white: '#FFFFFF',
};

// ============================================
// ANIMATION COMPONENTS
// ============================================

const AuroraBackground: React.FC = () => {
  const frame = useCurrentFrame();
  
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Primary aurora glow */}
      <div
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.accentGlow} 0%, transparent 60%)`,
          left: '60%',
          top: '20%',
          transform: `translate(-50%, -50%) translate(${Math.sin(frame * 0.01) * 50}px, ${Math.cos(frame * 0.015) * 30}px)`,
          filter: 'blur(80px)',
        }}
      />
      {/* Secondary purple glow */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 77, 255, 0.15) 0%, transparent 60%)',
          left: '30%',
          top: '60%',
          transform: `translate(-50%, -50%) translate(${Math.cos(frame * 0.012) * 40}px, ${Math.sin(frame * 0.018) * 50}px)`,
          filter: 'blur(60px)',
        }}
      />
      {/* Stars/particles */}
      {Array.from({ length: 30 }).map((_, i) => {
        const x = (i * 137.5) % 1920;
        const y = (i * 89) % 1080;
        const twinkle = 0.3 + Math.sin(frame * 0.05 + i) * 0.2;
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 2,
              height: 2,
              borderRadius: '50%',
              background: COLORS.white,
              opacity: twinkle,
            }}
          />
        );
      })}
    </div>
  );
};

const SplitTextReveal: React.FC<{
  text: string;
  startFrame: number;
  className?: string;
  highlightWord?: string;
  highlightColor?: string;
  style?: React.CSSProperties;
}> = ({ text, startFrame, highlightWord, highlightColor = COLORS.accent, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');

  return (
    <span style={{ ...style, display: 'inline-flex', flexWrap: 'wrap', gap: '0.25em' }}>
      {words.map((word, i) => {
        const isHighlight = word === highlightWord || word.includes(highlightWord || '');
        const wordProgress = Math.max(0, frame - startFrame - i * 4);
        const wordY = spring({
          fps,
          frame: wordProgress,
          config: { damping: 15, stiffness: 150 },
        });
        
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${40 - wordY * 40}px)`,
              opacity: interpolate(wordProgress, [0, 15], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
              color: isHighlight ? highlightColor : 'inherit',
              fontFamily: isHighlight ? 'Georgia, serif' : 'inherit',
              fontStyle: isHighlight ? 'italic' : 'normal',
              fontWeight: isHighlight ? 400 : 'inherit',
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};

const PillButton: React.FC<{
  children: React.ReactNode;
  startFrame: number;
  delay?: number;
  variant?: 'primary' | 'outline';
}> = ({ children, startFrame, delay = 0, variant = 'primary' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = Math.max(0, frame - startFrame - delay);
  
  const scale = spring({
    fps,
    frame: progress,
    config: { damping: 12, stiffness: 200 },
  });

  const isPrimary = variant === 'primary';

  return (
    <div
      style={{
        display: 'inline-flex',
        padding: '14px 28px',
        borderRadius: 100,
        fontSize: 16,
        fontWeight: 500,
        cursor: 'pointer',
        background: isPrimary ? COLORS.white : 'transparent',
        color: isPrimary ? '#121212' : COLORS.white,
        border: isPrimary ? 'none' : `1px solid ${COLORS.border}`,
        transform: `scale(${scale})`,
        opacity: interpolate(progress, [0, 15], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
      }}
    >
      {children}
    </div>
  );
};

const TrustBadge: React.FC<{
  text: string;
  startFrame: number;
}> = ({ text, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = Math.max(0, frame - startFrame);
  
  const scale = spring({
    fps,
    frame: progress,
    config: { damping: 15, stiffness: 200 },
  });

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 100,
        fontSize: 14,
        color: COLORS.textSecondary,
        transform: `scale(${scale})`,
        opacity: interpolate(progress, [0, 15], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
      }}
    >
      <span style={{ fontSize: 16 }}>✦</span>
      {text}
    </div>
  );
};

const SectionNumber: React.FC<{
  number: string;
  label: string;
  startFrame: number;
  isActive?: boolean;
}> = ({ number, label, startFrame, isActive = false }) => {
  const frame = useCurrentFrame();
  const progress = Math.max(0, frame - startFrame);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        opacity: interpolate(progress, [0, 20], [0, isActive ? 1 : 0.4], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        transform: `translateX(${interpolate(progress, [0, 20], [-20, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })}px)`,
      }}
    >
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: isActive ? COLORS.accent : COLORS.textMuted,
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        {number}
      </span>
      <span
        style={{
          fontSize: 14,
          color: isActive ? COLORS.textPrimary : COLORS.textMuted,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      {isActive && (
        <div
          style={{
            width: 40,
            height: 1,
            background: COLORS.white,
            marginLeft: 8,
          }}
        />
      )}
    </div>
  );
};

// ============================================
// SCENE COMPONENTS
// ============================================

const Scene1_Hero: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bgPrimary,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
      }}
    >
      <AuroraBackground />

      {/* Side navigation numbers */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <SectionNumber number="01" label="Meet Lance" startFrame={10} isActive />
        <SectionNumber number="02" label="How It Works" startFrame={20} />
        <SectionNumber number="03" label="Technology" startFrame={30} />
        <SectionNumber number="04" label="Results" startFrame={40} />
      </div>

      {/* Main content */}
      <div style={{ textAlign: 'center', maxWidth: 900, zIndex: 10 }}>
        {/* Trust badge */}
        <div style={{ marginBottom: 40 }}>
          <TrustBadge text="Backed by Y Combinator" startFrame={20} />
        </div>

        {/* Main headline */}
        <h1
          style={{
            fontSize: 80,
            fontWeight: 500,
            lineHeight: 1.1,
            color: COLORS.textPrimary,
            letterSpacing: '-0.02em',
            marginBottom: 24,
          }}
        >
          <SplitTextReveal
            text="The Future of Hotels Is Run by"
            startFrame={60}
          />
          <br />
          <span
            style={{
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              color: COLORS.accent,
            }}
          >
            <SplitTextReveal
              text="Lance"
              startFrame={100}
              style={{ fontSize: 100 }}
            />
          </span>
        </h1>

        {/* Subheadline */}
        <p
          style={{
            fontSize: 22,
            lineHeight: 1.6,
            color: COLORS.textSecondary,
            maxWidth: 600,
            margin: '0 auto 48px',
            opacity: interpolate(frame, [120, 160], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            transform: `translateY(${interpolate(frame, [120, 160], [30, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}px)`,
          }}
        >
          AI voice agent that handles guest communication and orchestrates hotel operations — 24/7, in any language.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <PillButton startFrame={180} delay={0}>
            Request a Demo →
          </PillButton>
          <PillButton startFrame={180} delay={15} variant="outline">
            Talk to AI
          </PillButton>
        </div>
      </div>

      {/* Floating scroll indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          opacity: interpolate(frame, [220, 260], [0, 0.5], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <span style={{ fontSize: 12, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Scroll
        </span>
        <div
          style={{
            width: 1,
            height: 40,
            background: `linear-gradient(to bottom, ${COLORS.accent}, transparent)`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const Scene2_Features: React.FC = () => {
  const frame = useCurrentFrame();

  const features = [
    {
      number: '01',
      title: 'Handles Every Call',
      desc: 'From reservations to room service, Lance manages guest requests with natural conversation.',
    },
    {
      number: '02',
      title: 'Speaks Every Language',
      desc: 'Multilingual support for international guests. No translation delays, no misunderstandings.',
    },
    {
      number: '03',
      title: 'Works 24/7',
      desc: 'Never miss a booking or guest request. Lance is always on, always professional.',
    },
    {
      number: '04',
      title: 'Integrates Seamlessly',
      desc: 'Connects with your existing PMS, booking engines, and operational tools.',
    },
  ];

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bgSecondary,
        display: 'flex',
        flexDirection: 'column',
        padding: '100px 120px',
      }}
    >
      {/* Subtle grid pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: 0.5,
        }}
      />

      {/* Section header */}
      <div style={{ marginBottom: 80, zIndex: 10 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.accent,
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: 16,
            opacity: interpolate(frame, [0, 30], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          02 / HOW IT WORKS
        </div>
        <h2
          style={{
            fontSize: 56,
            fontWeight: 500,
            color: COLORS.textPrimary,
            letterSpacing: '-0.02em',
            opacity: interpolate(frame, [20, 60], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            transform: `translateY(${interpolate(frame, [20, 60], [40, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}px)`,
          }}
        >
          Lance Owns the <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: COLORS.accent }}>Outcome</span>
        </h2>
      </div>

      {/* Features grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 32,
          flex: 1,
          zIndex: 10,
        }}
      >
        {features.map((feature, i) => {
          const featureProgress = Math.max(0, frame - 80 - i * 20);

          return (
            <div
              key={feature.number}
              style={{
                padding: 40,
                background: 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                opacity: interpolate(featureProgress, [0, 30], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
                transform: `translateY(${interpolate(featureProgress, [0, 30], [40, 0], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                })}px)`,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: COLORS.accent,
                  fontFamily: 'JetBrains Mono, monospace',
                  marginBottom: 16,
                }}
              >
                {feature.number}
              </div>
              <h3
                style={{
                  fontSize: 28,
                  fontWeight: 500,
                  color: COLORS.textPrimary,
                  marginBottom: 12,
                  letterSpacing: '-0.01em',
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: COLORS.textSecondary,
                }}
              >
                {feature.desc}
              </p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Scene3_Technology: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bgPrimary,
        display: 'flex',
        alignItems: 'center',
        padding: '0 120px',
      }}
    >
      <AuroraBackground />

      <div style={{ display: 'flex', gap: 80, alignItems: 'center', zIndex: 10 }}>
        {/* Left content */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.accent,
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: 16,
              opacity: interpolate(frame, [0, 30], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            03 / TECHNOLOGY
          </div>
          
          <h2
            style={{
              fontSize: 56,
              fontWeight: 500,
              color: COLORS.textPrimary,
              letterSpacing: '-0.02em',
              marginBottom: 24,
              lineHeight: 1.15,
              opacity: interpolate(frame, [20, 60], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
              transform: `translateY(${interpolate(frame, [20, 60], [40, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })}px)`,
            }}
          >
            Built on <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: COLORS.accent }}>Cutting-Edge</span> AI
          </h2>

          <p
            style={{
              fontSize: 20,
              lineHeight: 1.6,
              color: COLORS.textSecondary,
              marginBottom: 40,
              opacity: interpolate(frame, [60, 100], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            Powered by the latest language models, Lance understands context, emotion, and nuance — delivering conversations that feel genuinely human.
          </p>

          {/* Tech stats */}
          <div style={{ display: 'flex', gap: 48 }}>
            {[
              { value: '99.8%', label: 'Accuracy' },
              { value: '<1s', label: 'Response Time' },
              { value: '50+', label: 'Languages' },
            ].map((stat, i) => {
              const statProgress = Math.max(0, frame - 120 - i * 15);
              const scale = spring({
                fps,
                frame: statProgress,
                config: { damping: 12, stiffness: 200 },
              });

              return (
                <div
                  key={stat.label}
                  style={{
                    transform: `scale(${scale})`,
                    opacity: interpolate(statProgress, [0, 20], [0, 1], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    }),
                  }}
                >
                  <div
                    style={{
                      fontSize: 40,
                      fontWeight: 600,
                      color: COLORS.accent,
                      fontFamily: 'JetBrains Mono, monospace',
                      marginBottom: 4,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 14, color: COLORS.textMuted }}>
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right visual - abstract tech illustration */}
        <div
          style={{
            width: 500,
            height: 500,
            position: 'relative',
            opacity: interpolate(frame, [80, 140], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {/* Animated rings */}
          {[0, 1, 2, 3].map((i) => {
            const ringProgress = (frame * 0.02 + i * 0.5) % (Math.PI * 2);
            const scale = 0.5 + i * 0.15 + Math.sin(ringProgress) * 0.05;
            
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  inset: 0,
                  border: `1px solid ${COLORS.accent}`,
                  borderRadius: '50%',
                  transform: `scale(${scale})`,
                  opacity: 0.3 - i * 0.05,
                }}
              />
            );
          })}

          {/* Center glow */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${COLORS.accentGlow} 0%, transparent 70%)`,
              filter: 'blur(20px)',
            }}
          />

          {/* Orbiting dots */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (frame * 0.01 + (i / 6) * Math.PI * 2);
            const x = 250 + Math.cos(angle) * 180;
            const y = 250 + Math.sin(angle) * 180;

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x - 4,
                  top: y - 4,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: COLORS.accent,
                  boxShadow: `0 0 20px ${COLORS.accent}`,
                }}
              />
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene4_Results: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const metrics = [
    { value: 40, suffix: '%', label: 'Reduction in Staff Workload' },
    { value: 3, suffix: 'x', label: 'More Bookings Captured' },
    { value: 95, suffix: '%', label: 'Guest Satisfaction' },
  ];

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bgSecondary,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px',
      }}
    >
      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: 80 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.accent,
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: 16,
            opacity: interpolate(frame, [0, 30], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          04 / RESULTS
        </div>
        <h2
          style={{
            fontSize: 56,
            fontWeight: 500,
            color: COLORS.textPrimary,
            letterSpacing: '-0.02em',
            opacity: interpolate(frame, [20, 60], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            transform: `translateY(${interpolate(frame, [20, 60], [40, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}px)`,
          }}
        >
          Real Hotels, <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: COLORS.accent }}>Real Results</span>
        </h2>
      </div>

      {/* Metrics */}
      <div style={{ display: 'flex', gap: 80, marginBottom: 100 }}>
        {metrics.map((metric, i) => {
          const metricProgress = Math.max(0, frame - 80 - i * 20);
          const scale = spring({
            fps,
            frame: metricProgress,
            config: { damping: 12, stiffness: 150 },
          });

          // Animate the number counting up
          const numberProgress = Math.min(1, metricProgress / 40);
          const currentValue = Math.floor(metric.value * numberProgress);

          return (
            <div
              key={metric.label}
              style={{
                textAlign: 'center',
                transform: `scale(${scale})`,
                opacity: interpolate(metricProgress, [0, 30], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              <div
                style={{
                  fontSize: 80,
                  fontWeight: 600,
                  color: COLORS.accent,
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '-0.02em',
                }}
              >
                {currentValue}{metric.suffix}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: COLORS.textSecondary,
                  marginTop: 8,
                }}
              >
                {metric.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Testimonial */}
      <div
        style={{
          maxWidth: 800,
          padding: 48,
          background: 'rgba(255, 255, 255, 0.03)',
          border: `1px solid ${COLORS.border}`,
          borderRadius: 16,
          borderLeft: `3px solid ${COLORS.accent}`,
          opacity: interpolate(frame, [180, 220], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          transform: `translateY(${interpolate(frame, [180, 220], [30, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })}px)`,
        }}
      >
        <p
          style={{
            fontSize: 24,
            lineHeight: 1.6,
            color: COLORS.textPrimary,
            fontStyle: 'italic',
            marginBottom: 24,
          }}
        >
          "Lance has completely transformed how we handle guest communication. Our team can finally focus on creating exceptional experiences instead of answering the phone."
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${COLORS.accent}, #7C4DFF)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              color: COLORS.white,
            }}
          >
            MK
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.textPrimary }}>
              Michael Kovacs
            </div>
            <div style={{ fontSize: 14, color: COLORS.textMuted }}>
              General Manager, Grand Hotel Budapest
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene5_CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulseScale = 1 + Math.sin(frame * 0.08) * 0.05;

  return (
    <AbsoluteFill
      style={{
        background: COLORS.accent,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(0,0,0,0.1) 0%, transparent 50%)
          `,
        }}
      />

      <div style={{ zIndex: 10 }}>
        <h2
          style={{
            fontSize: 72,
            fontWeight: 600,
            color: '#121212',
            letterSpacing: '-0.02em',
            marginBottom: 24,
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
          Ready to Meet Lance?
        </h2>

        <p
          style={{
            fontSize: 24,
            color: 'rgba(18, 18, 18, 0.7)',
            marginBottom: 48,
            opacity: interpolate(frame, [30, 70], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          Join leading hotels already transforming their guest experience
        </p>

        <div
          style={{
            display: 'inline-flex',
            padding: '20px 48px',
            background: '#121212',
            color: COLORS.white,
            borderRadius: 100,
            fontSize: 20,
            fontWeight: 600,
            transform: `scale(${interpolate(frame, [60, 100], [0.9, pulseScale], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })})`,
            opacity: interpolate(frame, [60, 100], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            boxShadow: `0 20px 60px rgba(0,0,0,0.3), 0 0 0 ${20 + Math.sin(frame * 0.08) * 10}px rgba(0,0,0,0.1)`,
          }}
        >
          Request a Demo →
        </div>

        <div
          style={{
            display: 'flex',
            gap: 48,
            marginTop: 80,
            opacity: interpolate(frame, [120, 160], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {[
            { value: '500+', label: 'Hotels' },
            { value: '$2M+', label: 'Booking Value' },
            { value: '24/7', label: 'Support' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#121212' }}>{stat.value}</div>
              <div style={{ fontSize: 14, color: 'rgba(18, 18, 18, 0.6)' }}>{stat.label}</div>
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

export const LanceStyleVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Scene 1: Hero (0-210) */}
      <Sequence from={0} durationInFrames={210}>
        <Scene1_Hero />
      </Sequence>

      {/* Scene 2: Features (180-390) */}
      <Sequence from={180} durationInFrames={210}>
        <Scene2_Features />
      </Sequence>

      {/* Scene 3: Technology (360-570) */}
      <Sequence from={360} durationInFrames={210}>
        <Scene3_Technology />
      </Sequence>

      {/* Scene 4: Results (540-750) */}
      <Sequence from={540} durationInFrames={210}>
        <Scene4_Results />
      </Sequence>

      {/* Scene 5: CTA (720-900) */}
      <Sequence from={720} durationInFrames={180}>
        <Scene5_CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
