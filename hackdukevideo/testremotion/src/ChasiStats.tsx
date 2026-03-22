import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  Sequence,
} from 'remotion';
import React from 'react';

// Icon components for each stat card
const ClockIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg viewBox="0 0 24 24" fill="none" style={style}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="18" cy="6" r="2" fill="currentColor" />
  </svg>
);

const SpeedIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg viewBox="0 0 24 24" fill="none" style={style}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="2" />
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const QuoteIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg viewBox="0 0 24 24" fill="none" style={style}>
    <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M7 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="17" cy="17" r="3" fill="currentColor" />
  </svg>
);

const ClientIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg viewBox="0 0 24 24" fill="none" style={style}>
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 4L6 2M16 4l2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

interface StatCardProps {
  Icon: React.FC<{ style?: React.CSSProperties }>;
  title: string;
  description: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ Icon, title, description, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardProgress = Math.max(0, frame - delay);
  
  const cardY = spring({
    fps,
    frame: cardProgress,
    config: { damping: 15, stiffness: 100 },
  });

  const cardOpacity = interpolate(cardProgress, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cardScale = interpolate(cardProgress, [0, 20], [0.9, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const iconRotation = interpolate(cardProgress, [0, 25], [-10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const iconScale = spring({
    fps,
    frame: cardProgress - 10,
    config: { damping: 12, stiffness: 200 },
  });

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 32,
        display: 'flex',
        gap: 20,
        alignItems: 'flex-start',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #f0f0f0',
        transform: `translateY(${40 - cardY * 40}px) scale(${cardScale})`,
        opacity: cardOpacity,
        width: '100%',
        minHeight: 160,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          backgroundColor: '#e85a17',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transform: `rotate(${iconRotation}deg) scale(${0.5 + iconScale * 0.5})`,
        }}
      >
        <Icon style={{ width: 32, height: 32, color: 'white' }} />
      </div>
      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: '#1a1a1a',
            margin: '0 0 12px 0',
            lineHeight: 1.3,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 16,
            color: '#666',
            margin: 0,
            lineHeight: 1.6,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

// Logo component
const Logo: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <div
      style={{
        width: 32,
        height: 32,
        backgroundColor: '#1a1a1a',
        borderRadius: 4,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 3,
        padding: 4,
      }}
    >
      <div style={{ backgroundColor: 'white', borderRadius: 1 }} />
      <div style={{ backgroundColor: 'white', borderRadius: 1 }} />
      <div style={{ backgroundColor: 'white', borderRadius: 1 }} />
      <div style={{ backgroundColor: 'white', borderRadius: 1 }} />
    </div>
    <span
      style={{
        fontSize: 28,
        fontWeight: 600,
        color: '#1a1a1a',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      Chasi
    </span>
  </div>
);

export const ChasiStats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Navigation animation
  const navOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const navY = interpolate(frame, [0, 20], [-20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Hero text animation
  const words = [
    { text: 'Your', italic: false },
    { text: 'best people', italic: true },
    { text: 'are drowning', italic: false },
  ];

  const secondLineWords = [
    { text: 'in the least valuable work', italic: false },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '60px 80px',
      }}
    >
      {/* Navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: 1200,
          marginBottom: 80,
          opacity: navOpacity,
          transform: `translateY(${navY}px)`,
        }}
      >
        <Logo />
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {['Home', 'Solutions ▾', 'About Us', 'Careers'].map((item, i) => (
            <span
              key={item}
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: '#4a4a4a',
                fontFamily: 'Inter, system-ui, sans-serif',
                cursor: 'pointer',
                opacity: interpolate(frame, [i * 5, i * 5 + 15], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: 900,
          marginBottom: 80,
        }}
      >
        {/* First Line */}
        <div style={{ marginBottom: 8 }}>
          {words.map((word, i) => {
            const wordDelay = 30 + i * 8;
            const wordProgress = Math.max(0, frame - wordDelay);
            
            const wordY = spring({
              fps,
              frame: wordProgress,
              config: { damping: 12, stiffness: 100 },
            });

            const wordOpacity = interpolate(wordProgress, [0, 15], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <span
                key={i}
                style={{
                  fontSize: 64,
                  fontWeight: word.italic ? 400 : 500,
                  color: word.italic ? '#e85a17' : '#1a1a1a',
                  fontFamily: word.italic
                    ? 'Georgia, "Times New Roman", serif'
                    : 'Inter, system-ui, sans-serif',
                  fontStyle: word.italic ? 'italic' : 'normal',
                  marginRight: 16,
                  display: 'inline-block',
                  transform: `translateY(${30 - wordY * 30}px)`,
                  opacity: wordOpacity,
                }}
              >
                {word.text}
              </span>
            );
          })}
        </div>

        {/* Second Line */}
        <div>
          {secondLineWords.map((word, i) => {
            const wordDelay = 60 + i * 8;
            const wordProgress = Math.max(0, frame - wordDelay);
            
            const wordY = spring({
              fps,
              frame: wordProgress,
              config: { damping: 12, stiffness: 100 },
            });

            const wordOpacity = interpolate(wordProgress, [0, 15], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <span
                key={i}
                style={{
                  fontSize: 64,
                  fontWeight: word.italic ? 400 : 500,
                  color: word.italic ? '#e85a17' : '#1a1a1a',
                  fontFamily: word.italic
                    ? 'Georgia, "Times New Roman", serif'
                    : 'Inter, system-ui, sans-serif',
                  fontStyle: word.italic ? 'italic' : 'normal',
                  marginRight: 16,
                  display: 'inline-block',
                  transform: `translateY(${30 - wordY * 30}px)`,
                  opacity: wordOpacity,
                }}
              >
                {word.text}
              </span>
            );
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 24,
          maxWidth: 1000,
          width: '100%',
        }}
      >
        <StatCard
          Icon={ClockIcon}
          title="2+ hours lost per rep per day"
          description="on chasing emails, voicemails, spreadsheets & data entry"
          delay={90}
        />
        <StatCard
          Icon={SpeedIcon}
          title="Speed kills deals, both new & repeat"
          description="Inquiries wait 4-24 hours, costing you leads and loyalty"
          delay={105}
        />
        <StatCard
          Icon={QuoteIcon}
          title="10-20% of quotes quietly die"
          description="without proper follow-up or tracking in your system"
          delay={120}
        />
        <StatCard
          Icon={ClientIcon}
          title="40% of clients receive < 1 touch"
          description="leading to poor customer experience and churn"
          delay={135}
        />
      </div>

      {/* Floating accent shapes */}
      <div
        style={{
          position: 'absolute',
          top: 100,
          right: 100,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232, 90, 23, 0.05) 0%, transparent 70%)',
          transform: `scale(${1 + Math.sin(frame * 0.02) * 0.1})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 150,
          left: 80,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232, 90, 23, 0.03) 0%, transparent 70%)',
          transform: `scale(${1 + Math.cos(frame * 0.025) * 0.15})`,
        }}
      />
    </AbsoluteFill>
  );
};
