import React from 'react';

export default function ChooseYourPath({ onNext, onBack }) {
  const cardStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    padding: '40px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
    position: 'relative',
    overflow: 'hidden'
  };

  const cardHoverStyle = {
    transform: 'translateY(-8px)',
    background: 'rgba(255,107,53,0.1)',
    borderColor: 'rgba(255,107,53,0.3)'
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
        {onBack && (
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
        )}
        
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: '900',
          marginBottom: '16px',
          letterSpacing: '-0.5px',
          lineHeight: '1.2'
        }}>
          Choose Your <span style={{ color: '#FF6B35' }}>Path</span>
        </h1>
        
        <p style={{
          fontSize: '18px',
          color: 'rgba(255,255,255,0.6)',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Tell us about your experience level so we can create the perfect learning journey for you.
        </p>
      </div>

      {/* Cards Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px 60px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          maxWidth: '800px',
          width: '100%'
        }}>
          {/* Beginner Card */}
          <div
            style={cardStyle}
            onClick={() => onNext('beginner')}
            onMouseEnter={e => {
              Object.assign(e.currentTarget.style, cardHoverStyle);
            }}
            onMouseLeave={e => {
              Object.assign(e.currentTarget.style, cardStyle);
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🌱</div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '800',
              marginBottom: '12px',
              color: '#FF6B35'
            }}>
              I am a Beginner
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: '1.5',
              margin: 0
            }}>
              Never coded before or just starting out
            </p>
          </div>

          {/* Experienced Card */}
          <div
            style={cardStyle}
            onClick={() => onNext('experienced')}
            onMouseEnter={e => {
              Object.assign(e.currentTarget.style, cardHoverStyle);
            }}
            onMouseLeave={e => {
              Object.assign(e.currentTarget.style, cardStyle);
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚡</div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '800',
              marginBottom: '12px',
              color: '#9B59B6'
            }}>
              I Know Something
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: '1.5',
              margin: 0
            }}>
              Already have some skills and experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
