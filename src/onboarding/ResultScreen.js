import React from 'react';

export default function ResultScreen({ onComplete, onBack, onTryDifferentTrack, result }) {
  const {
    experienceLevel,
    trackId,
    level,
    verifiedSkills = [],
    failedSkills = []
  } = result;

  const trackInfo = {
    frontend: {
      title: 'Frontend Development',
      icon: '🎨',
      color: '#FF6B35'
    },
    backend: {
      title: 'Backend Development', 
      icon: '⚙️',
      color: '#3498DB'
    },
    ai: {
      title: 'AI & Machine Learning',
      icon: '🤖',
      color: '#9B59B6'
    },
    mobile: {
      title: 'Mobile Development',
      icon: '📱',
      color: '#2ECC71'
    },
    game: {
      title: 'Game Development',
      icon: '🎮',
      color: '#E67E22'
    },
    cybersecurity: {
      title: 'Cybersecurity',
      icon: '🔐',
      color: '#E74C3C'
    }
  };

  const levelInfo = {
    beginner: {
      title: 'Beginner',
      duration: '16 weeks',
      description: 'Perfect for those just starting their journey',
      weeks: ['Week 1-4: Fundamentals', 'Week 5-8: Core Concepts', 'Week 9-12: Practical Skills', 'Week 13-16: Portfolio Projects']
    },
    intermediate: {
      title: 'Intermediate', 
      duration: '10 weeks',
      description: 'Build on your existing knowledge',
      weeks: ['Week 1-3: Advanced Concepts', 'Week 4-6: Specialization', 'Week 7-8: Real Projects', 'Week 9-10: Portfolio & Interview Prep']
    },
    advanced: {
      title: 'Advanced',
      duration: '6 weeks', 
      description: 'Fast-track to job readiness',
      weeks: ['Week 1-2: Expert Topics', 'Week 3-4: Production Projects', 'Week 5-6: Job Preparation']
    }
  };

  const currentTrack = trackInfo[trackId];
  const currentLevel = levelInfo[level];

  const roadmapPreview = currentLevel.weeks.map((week, index) => ({
    week: index + 1,
    title: week,
    status: 'upcoming'
  }));

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
        >
          ← Back
        </button>
        
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>
          {currentTrack?.icon}
        </div>
        
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: '900',
          marginBottom: '16px',
          letterSpacing: '-0.5px'
        }}>
          Your Personalized <span style={{ color: currentTrack?.color }}>Path</span>
        </h1>
        
        <p style={{
          fontSize: '20px',
          color: 'rgba(255,255,255,0.8)',
          maxWidth: '600px',
          margin: '0 auto 40px',
          lineHeight: '1.6'
        }}>
          {currentTrack?.title} • {currentLevel?.title} Level
        </p>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '0 20px 60px',
        overflowY: 'auto'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px'
        }}>
          
          {/* Left Column - Results Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Level Card */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              padding: '30px',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '800',
                marginBottom: '16px',
                color: currentTrack?.color
              }}>
                {currentLevel?.title} Roadmap
              </h3>
              
              <p style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.7)',
                lineHeight: '1.6',
                marginBottom: '20px'
              }}>
                {currentLevel?.description}
              </p>
              
              <div style={{
                background: 'rgba(255,107,53,0.1)',
                border: '1px solid rgba(255,107,53,0.3)',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#FF6B35' }}>
                  {currentLevel?.duration}
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                  Estimated duration
                </div>
              </div>
            </div>

            {/* Skills Assessment (for experienced users) */}
            {experienceLevel === 'experienced' && (verifiedSkills.length > 0 || failedSkills.length > 0) && (
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px',
                padding: '30px',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  marginBottom: '20px'
                }}>
                  Skills Assessment
                </h3>
                
                {verifiedSkills.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#2ECC71',
                      marginBottom: '12px'
                    }}>
                      Verified Skills ✅
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {verifiedSkills.map(skillId => (
                        <span key={skillId} style={{
                          background: 'rgba(46,204,113,0.1)',
                          color: '#2ECC71',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}>
                          {skillId.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {failedSkills.length > 0 && (
                  <div>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#E74C3C',
                      marginBottom: '12px'
                    }}>
                      Skills to Work On ❌
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {failedSkills.map(skillId => (
                        <span key={skillId} style={{
                          background: 'rgba(231,76,60,0.1)',
                          color: '#E74C3C',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}>
                          {skillId.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Roadmap Preview */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '30px',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '800',
              marginBottom: '20px'
            }}>
              Week-by-Week Preview
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {roadmapPreview.map((week, index) => (
                <div key={index} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(255,107,53,0.1)',
                    color: '#FF6B35',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '14px'
                  }}>
                    {week.week}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: 'white' }}>
                      {week.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                      {week.status === 'upcoming' ? 'Coming up' : 'Completed'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <p style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.5)',
                margin: 0,
                textAlign: 'center',
                fontStyle: 'italic'
              }}>
                "Roughly {currentLevel?.duration}, adjusts as you go"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        padding: '30px 20px',
        background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => onComplete(result)}
          style={{
            background: '#FF6B35',
            color: 'white',
            border: 'none',
            padding: '16px 40px',
            borderRadius: '30px',
            fontSize: '16px',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(255,107,53,0.3)'
          }}
        >
          Start Your Journey →
        </button>
        
        <button
          onClick={onTryDifferentTrack}
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '16px 32px',
            borderRadius: '30px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Try Different Track
        </button>
      </div>
    </div>
  );
}
