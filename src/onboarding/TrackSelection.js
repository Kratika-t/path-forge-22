import React from 'react';

export default function TrackSelection({ onNext, onBack, experienceLevel }) {
  const tracks = [
    {
      id: 'frontend',
      icon: '🎨',
      title: 'Frontend Dev',
      description: 'Build websites people see and use. Think Google, Instagram, your fav app\'s screen',
      color: '#FF6B35'
    },
    {
      id: 'backend',
      icon: '⚙️',
      title: 'Backend Dev',
      description: 'Power the logic behind apps. Think login systems, databases, APIs',
      color: '#3498DB'
    },
    {
      id: 'ai',
      icon: '🤖',
      title: 'AI & ML',
      description: 'Teach machines to think. Think ChatGPT, recommendation engines',
      color: '#9B59B6'
    },
    {
      id: 'mobile',
      icon: '📱',
      title: 'Mobile Dev',
      description: 'Build iOS and Android apps. Think apps on your phone\'s app store',
      color: '#2ECC71'
    },
    {
      id: 'game',
      icon: '🎮',
      title: 'Game Dev',
      description: 'Create games people play. Think Unity games, 2D/3D worlds',
      color: '#E67E22'
    },
    {
      id: 'cybersecurity',
      icon: '🔐',
      title: 'Cybersecurity',
      description: 'Protect digital systems. Think ethical hacking, network safety',
      color: '#E74C3C'
    }
  ];

  const cardStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '30px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left',
    backdropFilter: 'blur(10px)',
    position: 'relative',
    overflow: 'hidden'
  };

  const cardHoverStyle = {
    transform: 'translateY(-5px)',
    background: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.15)'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      color: 'white',
      fontFamily: 'var(--font-main)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Header */}
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <button 
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '10px 20px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '30px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}
        >
          ← Back
        </button>
        
        <h1 style={{
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: '900',
          marginBottom: '16px',
          letterSpacing: '-0.5px',
          lineHeight: '1.2'
        }}>
          Choose Your <span style={{ color: '#FF6B35' }}>Track</span>
        </h1>
        
        <p style={{
          fontSize: '18px',
          color: 'rgba(255,255,255,0.6)',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Which path excites you the most? We'll customize your journey based on your choice.
        </p>
      </div>

      {/* Tracks Grid */}
      <div style={{
        flex: 1,
        padding: '0 20px 60px',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {tracks.map(track => (
            <div
              key={track.id}
              style={cardStyle}
              onClick={() => onNext(track.id)}
              onMouseEnter={e => {
                Object.assign(e.currentTarget.style, cardHoverStyle);
                e.currentTarget.style.borderColor = track.color + '40';
              }}
              onMouseLeave={e => {
                Object.assign(e.currentTarget.style, cardStyle);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                <div style={{
                  fontSize: '40px',
                  flexShrink: 0,
                  lineHeight: 1
                }}>
                  {track.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    marginBottom: '8px',
                    color: track.color,
                    margin: '0 0 8px 0'
                  }}>
                    {track.title}
                  </h3>
                  <p style={{
                    fontSize: '15px',
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: '1.5',
                    margin: 0
                  }}>
                    {track.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
