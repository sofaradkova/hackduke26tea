import React, { useMemo } from 'react';
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
// ADVANCED ANIMATION COMPONENTS
// ============================================

const AnimatedCounter: React.FC<{
  value: number;
  suffix?: string;
  prefix?: string;
  startFrame: number;
  duration?: number;
  style?: React.CSSProperties;
}> = ({ value, suffix = '', prefix = '', startFrame, duration = 60, style }) => {
  const frame = useCurrentFrame();
  const progress = Math.max(0, Math.min(1, (frame - startFrame) / duration));
  const easedProgress = Easing.out(Easing.cubic)(progress);
  const currentValue = Math.floor(easedProgress * value);

  return (
    <span style={style}>
      {prefix}{currentValue.toLocaleString()}{suffix}
    </span>
  );
};

const MorphingBlob: React.FC<{
  color: string;
  size: number;
  x: number;
  y: number;
  delay?: number;
}> = ({ color, size, x, y, delay = 0 }) => {
  const frame = useCurrentFrame();
  const t = (frame + delay) * 0.02;

  // Generate blob path using superformula
  const points = 8;
  const path = Array.from({ length: points + 1 }, (_, i) => {
    const angle = (i / points) * Math.PI * 2;
    const r = size * (0.8 + 0.2 * Math.sin(angle * 3 + t) * Math.cos(angle * 2 - t));
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    return `${i === 0 ? 'M' : 'L'} ${px} ${py}`;
  }).join(' ') + ' Z';

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <path
        d={path}
        fill={color}
        opacity={0.3}
        style={{
          filter: 'blur(60px)',
          transform: `rotate(${t * 10}deg)`,
          transformOrigin: `${x}px ${y}px`,
        }}
      />
    </svg>
  );
};

const GlitchText: React.FC<{
  text: string;
  startFrame: number;
  style?: React.CSSProperties;
}> = ({ text, startFrame, style }) => {
  const frame = useCurrentFrame();
  const progress = Math.max(0, frame - startFrame);

  const glitchIntensity = interpolate(progress, [0, 30, 60], [20, 5, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const offsetX = Math.sin(progress * 0.5) * glitchIntensity;
  const offsetY = Math.cos(progress * 0.3) * glitchIntensity;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <span
        style={{
          ...style,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {text}
      </span>
      {progress < 60 && (
        <>
          <span
            style={{
              ...style,
              position: 'absolute',
              left: offsetX,
              top: offsetY,
              color: '#e85a17',
              opacity: 0.7,
              clipPath: 'inset(10% 0 60% 0)',
              zIndex: 1,
            }}
          >
            {text}
          </span>
          <span
            style={{
              ...style,
              position: 'absolute',
              left: -offsetX,
              top: -offsetY,
              color: '#00ffff',
              opacity: 0.7,
              clipPath: 'inset(50% 0 10% 0)',
              zIndex: 1,
            }}
          >
            {text}
          </span>
        </>
      )}
    </div>
  );
};

const CircularProgress: React.FC<{
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
  startFrame: number;
  duration?: number;
  label?: string;
}> = ({ percentage, size, strokeWidth, color, startFrame, duration = 60, label }) => {
  const frame = useCurrentFrame();
  const progress = Math.max(0, Math.min(1, (frame - startFrame) / duration));
  const easedProgress = Easing.out(Easing.cubic)(progress);
  const circumference = 2 * Math.PI * (size / 2 - strokeWidth);
  const strokeDashoffset = circumference * (1 - easedProgress * (percentage / 100));

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - strokeWidth}
          fill="none"
          stroke="#333"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - strokeWidth}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'none' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: size * 0.25, fontWeight: 700, color }}>
          <AnimatedCounter value={percentage} suffix="%" startFrame={startFrame} duration={duration} />
        </span>
        {label && (
          <span style={{ fontSize: size * 0.1, color: '#888', marginTop: 4 }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

const BarChart: React.FC<{
  data: { label: string; value: number; color: string }[];
  startFrame: number;
  maxValue?: number;
}> = ({ data, startFrame, maxValue = 100 }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ display: 'flex', gap: 40, alignItems: 'flex-end', height: 300 }}>
      {data.map((item, i) => {
        const barProgress = Math.max(0, frame - startFrame - i * 10);
        const height = interpolate(barProgress, [0, 40], [0, (item.value / maxValue) * 250], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const opacity = interpolate(barProgress, [0, 20], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: 60,
                height,
                background: item.color,
                borderRadius: '8px 8px 0 0',
                opacity,
                position: 'relative',
                transition: 'none',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -30,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'white',
                  opacity: interpolate(barProgress, [20, 40], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  }),
                }}
              >
                {item.value}%
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 14, color: '#888', textAlign: 'center' }}>
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Spotlight: React.FC<{ x: number; y: number; size: number; delay?: number }> = ({
  x,
  y,
  size,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const t = (frame + delay) * 0.02;

  return (
    <div
      style={{
        position: 'absolute',
        left: x + Math.sin(t) * 100,
        top: y + Math.cos(t * 0.7) * 50,
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }}
    />
  );
};

// ============================================
// DEVICE MOCKUP COMPONENT
// ============================================

const DeviceMockup: React.FC<{
  type: 'laptop' | 'phone';
  children: React.ReactNode;
  startFrame: number;
  style?: React.CSSProperties;
}> = ({ type, children, startFrame, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = Math.max(0, frame - startFrame);
  const scale = spring({
    fps,
    frame: progress,
    config: { damping: 15, stiffness: 100 },
  });

  const rotateY = interpolate(progress, [0, 40], [45, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const opacity = interpolate(progress, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (type === 'laptop') {
    return (
      <div
        style={{
          ...style,
          perspective: '1000px',
          opacity,
        }}
      >
        <div
          style={{
            transform: `scale(${scale}) rotateY(${rotateY}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Laptop body */}
          <div
            style={{
              width: 800,
              height: 500,
              background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)',
              borderRadius: 20,
              padding: 20,
              boxShadow: '0 50px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            {/* Screen */}
            <div
              style={{
                width: '100%',
                height: '100%',
                background: '#0a0a0a',
                borderRadius: 8,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {children}
            </div>
          </div>
          {/* Laptop base */}
          <div
            style={{
              width: 900,
              height: 30,
              background: 'linear-gradient(145deg, #3a3a3a 0%, #2a2a2a 100%)',
              borderRadius: '0 0 15px 15px',
              marginLeft: -50,
              marginTop: -5,
              transform: 'perspective(800px) rotateX(60deg)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...style,
        perspective: '1000px',
        opacity,
      }}
    >
      <div
        style={{
          transform: `scale(${scale}) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Phone body */}
        <div
          style={{
            width: 280,
            height: 560,
            background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)',
            borderRadius: 40,
            padding: 12,
            boxShadow: '0 30px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Screen */}
          <div
            style={{
              width: '100%',
              height: '100%',
              background: '#0a0a0a',
              borderRadius: 30,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Notch */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 120,
                height: 28,
                background: '#1a1a1a',
                borderRadius: '0 0 20px 20px',
                zIndex: 10,
              }}
            />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// SCENES
// ============================================

const Scene1_EpicIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Multiple morphing blobs */}
      <MorphingBlob color="#e85a17" size={300} x={960} y={540} delay={0} />
      <MorphingBlob color="#ff6b35" size={200} x={600} y={300} delay={20} />
      <MorphingBlob color="#ffa07a" size={250} x={1300} y={700} delay={40} />

      {/* Particle field */}
      {Array.from({ length: 50 }).map((_, i) => {
        const t = frame * 0.01 + i;
        const x = 960 + Math.cos(t + i) * (300 + i * 10);
        const y = 540 + Math.sin(t * 0.7 + i) * (200 + i * 5);
        const size = 2 + Math.sin(t * 2) * 1;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: i % 3 === 0 ? '#e85a17' : i % 3 === 1 ? '#ff6b35' : '#ffa07a',
              opacity: 0.6,
              boxShadow: `0 0 ${size * 2}px currentColor`,
            }}
          />
        );
      })}

      {/* Main content */}
      <div style={{ textAlign: 'center', zIndex: 10 }}>
        <div
          style={{
            fontSize: 20,
            color: '#e85a17',
            letterSpacing: 12,
            marginBottom: 40,
            opacity: interpolate(frame, [30, 60], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          WELCOME TO THE FUTURE
        </div>

        <GlitchText
          text="CHASI"
          startFrame={60}
          style={{
            fontSize: 140,
            fontWeight: 900,
            color: 'white',
            letterSpacing: 20,
          }}
        />

        <div
          style={{
            marginTop: 60,
            fontSize: 28,
            color: '#888',
            opacity: interpolate(frame, [120, 150], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            transform: `translateY(${interpolate(frame, [120, 150], [30, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}px)`,
          }}
        >
          AI-Powered Workflow Revolution
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene2_DataViz: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '80px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Spotlights */}
      <Spotlight x={200} y={200} size={400} delay={0} />
      <Spotlight x={1700} y={600} size={500} delay={30} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <h2
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: 'white',
            marginBottom: 16,
            opacity: interpolate(frame, [0, 30], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          The Numbers Don't Lie
        </h2>
        <p
          style={{
            fontSize: 20,
            color: '#64748b',
            opacity: interpolate(frame, [20, 50], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          Real results from real teams
        </p>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 40,
          flex: 1,
          alignItems: 'center',
          justifyItems: 'center',
        }}
      >
        <CircularProgress
          percentage={94}
          size={200}
          strokeWidth={12}
          color="#e85a17"
          startFrame={40}
          label="Time Saved"
        />
        <CircularProgress
          percentage={67}
          size={200}
          strokeWidth={12}
          color="#22c55e"
          startFrame={60}
          label="More Deals"
        />
        <CircularProgress
          percentage={89}
          size={200}
          strokeWidth={12}
          color="#3b82f6"
          startFrame={80}
          label="Happier Teams"
        />
      </div>

      {/* Bar chart */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 60,
          opacity: interpolate(frame, [100, 140], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <BarChart
          data={[
            { label: 'Before', value: 35, color: '#64748b' },
            { label: 'After 1 Month', value: 58, color: '#e85a17' },
            { label: 'After 3 Months', value: 89, color: '#22c55e' },
          ]}
          startFrame={120}
        />
      </div>
    </AbsoluteFill>
  );
};

const Scene3_ProductShowcase: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #fafafa 0%, #e5e5e5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 100,
      }}
    >
      {/* Feature list */}
      <div style={{ maxWidth: 400 }}>
        <h2
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: '#1a1a1a',
            marginBottom: 40,
            opacity: interpolate(frame, [0, 40], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          Powerful Features
        </h2>

        {[
          { icon: '🤖', title: 'AI Automation', desc: 'Smart workflows that learn' },
          { icon: '📊', title: 'Real-time Analytics', desc: 'Insights at a glance' },
          { icon: '🔗', title: 'Seamless Integrations', desc: 'Works with your stack' },
          { icon: '🚀', title: '10x Faster', desc: 'Turbocharge your team' },
        ].map((feature, i) => {
          const progress = Math.max(0, frame - 40 - i * 15);

          return (
            <div
              key={feature.title}
              style={{
                display: 'flex',
                gap: 20,
                marginBottom: 30,
                opacity: interpolate(progress, [0, 30], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
                transform: `translateX(${interpolate(progress, [0, 30], [-50, 0], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                })}px)`,
              }}
            >
              <div style={{ fontSize: 32 }}>{feature.icon}</div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: 16, color: '#666' }}>{feature.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Device mockups */}
      <div style={{ position: 'relative' }}>
        <DeviceMockup type="laptop" startFrame={100}>
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              padding: 40,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Mock UI */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: '#e85a17' }} />
              <div style={{ flex: 1, height: 40, borderRadius: 8, background: '#2a2a4a' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, flex: 1 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: '#2a2a4a',
                    borderRadius: 12,
                    opacity: interpolate(frame, [150 + i * 5, 170 + i * 5], [0, 1], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    }),
                  }}
                />
              ))}
            </div>
          </div>
        </DeviceMockup>

        <DeviceMockup
          type="phone"
          startFrame={180}
          style={{ position: 'absolute', right: -100, bottom: -50 }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: '#1a1a2e',
              padding: '40px 20px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 60,
                    background: '#2a2a4a',
                    borderRadius: 12,
                    opacity: interpolate(frame, [220 + i * 5, 240 + i * 5], [0, 1], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    }),
                  }}
                />
              ))}
            </div>
          </div>
        </DeviceMockup>
      </div>
    </AbsoluteFill>
  );
};

const Scene4_Testimonials: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const testimonials = [
    {
      quote: 'Chasi transformed our workflow completely. We save 15+ hours every week!',
      author: 'Sarah Chen',
      role: 'VP of Sales, TechCorp',
      avatar: 'SC',
    },
    {
      quote: "The AI automation is mind-blowing. It's like having an extra team member.",
      author: 'Marcus Johnson',
      role: 'CEO, StartupXYZ',
      avatar: 'MJ',
    },
    {
      quote: 'Best investment we made this year. Our team productivity doubled.',
      author: 'Emily Davis',
      role: 'Operations Director, ScaleInc',
      avatar: 'ED',
    },
  ];

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px',
      }}
    >
      {/* Background effects */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(232, 90, 23, 0.1) 0%, transparent 50%)`,
        }}
      />

      <h2
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: 'white',
          marginBottom: 60,
          opacity: interpolate(frame, [0, 30], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Loved by Teams Everywhere
      </h2>

      <div
        style={{
          display: 'flex',
          gap: 30,
          maxWidth: 1400,
          perspective: '1000px',
        }}
      >
        {testimonials.map((t, i) => {
          const progress = Math.max(0, frame - 30 - i * 20);
          const rotateY = interpolate(progress, [0, 40], [45, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const scale = spring({
            fps,
            frame: progress,
            config: { damping: 15, stiffness: 100 },
          });

          return (
            <div
              key={t.author}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: 20,
                padding: 40,
                border: '1px solid rgba(255,255,255,0.1)',
                transform: `rotateY(${rotateY}deg) scale(${scale})`,
                opacity: interpolate(progress, [0, 30], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              <div style={{ fontSize: 60, color: '#e85a17', marginBottom: 20 }}>"</div>
              <p
                style={{
                  fontSize: 20,
                  color: '#e2e8f0',
                  lineHeight: 1.6,
                  marginBottom: 30,
                  fontStyle: 'italic',
                }}
              >
                {t.quote}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #e85a17 0%, #ff6b35 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'white',
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>{t.author}</div>
                  <div style={{ fontSize: 14, color: '#64748b' }}>{t.role}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Logos */}
      <div
        style={{
          display: 'flex',
          gap: 60,
          marginTop: 80,
          opacity: interpolate(frame, [150, 190], [0, 0.4], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        {['TechCorp', 'StartupXYZ', 'ScaleInc', 'EnterpriseCo', 'GlobalBiz'].map((company, i) => (
          <div key={company} style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>
            {company}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Scene5_FinalCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulseScale = 1 + Math.sin(frame * 0.08) * 0.08;

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
      {/* Animated background pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at ${30 + Math.sin(frame * 0.01) * 10}% ${30 + Math.cos(frame * 0.01) * 10}%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at ${70 + Math.cos(frame * 0.015) * 10}% ${70 + Math.sin(frame * 0.015) * 10}%, rgba(255,255,255,0.1) 0%, transparent 50%)
          `,
        }}
      />

      <div style={{ textAlign: 'center', zIndex: 10 }}>
        <div
          style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.8)',
            letterSpacing: 8,
            marginBottom: 30,
            opacity: interpolate(frame, [0, 30], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          READY TO GET STARTED?
        </div>

        <h1
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: 'white',
            marginBottom: 30,
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
          Start Your Free Trial
        </h1>

        <p
          style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.9)',
            marginBottom: 50,
            opacity: interpolate(frame, [40, 80], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          No credit card required • 14-day free trial
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
          <div
            style={{
              background: 'white',
              color: '#e85a17',
              padding: '24px 60px',
              borderRadius: 60,
              fontSize: 24,
              fontWeight: 700,
              cursor: 'pointer',
              transform: `scale(${interpolate(frame, [80, 120], [0.8, pulseScale], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })})`,
              opacity: interpolate(frame, [80, 120], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
              boxShadow: `0 20px 60px rgba(0,0,0,0.3), 0 0 0 ${20 + Math.sin(frame * 0.08) * 10}px rgba(255,255,255,0.15)`,
            }}
          >
            Get Started Free →
          </div>
        </div>

        {/* Trust indicators */}
        <div
          style={{
            display: 'flex',
            gap: 50,
            marginTop: 80,
            opacity: interpolate(frame, [140, 180], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {[
            { value: '10k+', label: 'Active Users' },
            { value: '99.9%', label: 'Uptime' },
            { value: '4.9/5', label: 'Rating' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'white' }}>{stat.value}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{stat.label}</div>
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

export const AdvancedLaunch: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Scene 1: Epic Intro with Glitch (0-150) */}
      <Sequence from={0} durationInFrames={150}>
        <Scene1_EpicIntro />
      </Sequence>

      {/* Scene 2: Data Visualization (120-360) */}
      <Sequence from={120} durationInFrames={240}>
        <Scene2_DataViz />
      </Sequence>

      {/* Scene 3: Product Showcase (330-570) */}
      <Sequence from={330} durationInFrames={240}>
        <Scene3_ProductShowcase />
      </Sequence>

      {/* Scene 4: Testimonials (540-780) */}
      <Sequence from={540} durationInFrames={240}>
        <Scene4_Testimonials />
      </Sequence>

      {/* Scene 5: Final CTA (750-930) */}
      <Sequence from={750} durationInFrames={180}>
        <Scene5_FinalCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
