import React, { useEffect, useState } from 'react';

const ParticleBackground = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <style>{`
        @keyframes auroraMove1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(8vw, 12vh) scale(1.15); }
        }
        @keyframes auroraMove2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-10vw, -10vh) scale(1.1); }
        }
        @keyframes auroraMove3 {
          0%, 100% { transform: translate(0, 0) scale(1.1); }
          50%      { transform: translate(5vw, -8vh) scale(0.95); }
        }
        .pf-aurora-wrapper {
          position: fixed;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
          background: var(--bg-base);
        }
        .pf-aurora-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.12;
          pointer-events: none;
          will-change: transform;
          mix-blend-mode: multiply;
        }
        @media (max-width: 768px) {
          .pf-aurora-blob {
            filter: blur(90px);
            opacity: 0.15;
          }
        }
      `}</style>
      <div className="pf-aurora-wrapper">
        {/* Golden Yellow Blob */}
        <div
          className="pf-aurora-blob"
          style={{
            width: isMobile ? '80vw' : '55vw',
            height: isMobile ? '80vw' : '55vw',
            left: '-10vw',
            top: '-10vh',
            background: 'var(--brand-yellow)',
            animation: 'auroraMove1 60s ease-in-out infinite',
          }}
        />
        
        {/* Coral Blob */}
        <div
          className="pf-aurora-blob"
          style={{
            width: isMobile ? '90vw' : '50vw',
            height: isMobile ? '90vw' : '50vw',
            right: '-10vw',
            bottom: '-10vh',
            background: 'var(--brand-coral)',
            animation: 'auroraMove2 55s ease-in-out infinite alternate',
          }}
        />
        
        {/* Mint Teal Blob - Desktop Only */}
        {!isMobile && (
          <div
            className="pf-aurora-blob"
            style={{
              width: '45vw',
              height: '45vw',
              right: '15vw',
              top: '25vh',
              background: 'var(--brand-teal)',
              animation: 'auroraMove3 70s ease-in-out infinite',
            }}
          />
        )}
      </div>
    </>
  );
};

export default ParticleBackground;

