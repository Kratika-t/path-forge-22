import React, { useMemo } from 'react';

const ParticleBackground = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      size: Math.random() * 220 + 60,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 18 + 12,
      delay: Math.random() * -20,
      opacity: Math.random() * 0.13 + 0.04,
      color: i % 3 === 0
        ? 'rgba(255, 107, 53,'
        : i % 3 === 1
          ? 'rgba(155, 89, 182,'
          : 'rgba(52, 152, 219,',
      drift: (Math.random() - 0.5) * 60,
      driftY: (Math.random() - 0.5) * 40,
    }));
  }, []);

  return (
    <>
      <style>{`
        @keyframes floatOrb {
          0%   { transform: translate(0px, 0px) scale(1); }
          25%  { transform: translate(var(--dx), calc(var(--dy) * -1)) scale(1.05); }
          50%  { transform: translate(calc(var(--dx) * -0.6), var(--dy)) scale(0.97); }
          75%  { transform: translate(calc(var(--dx) * 0.8), calc(var(--dy) * 0.4)) scale(1.03); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .pf-particle {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          animation: floatOrb var(--dur) ease-in-out var(--delay) infinite;
          will-change: transform;
        }
      `}</style>
      <div style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        {particles.map(p => (
          <div
            key={p.id}
            className="pf-particle"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: `radial-gradient(circle, ${p.color}${p.opacity + 0.05}) 0%, ${p.color}0) 70%)`,
              '--dur': `${p.duration}s`,
              '--delay': `${p.delay}s`,
              '--dx': `${p.drift}px`,
              '--dy': `${p.driftY}px`,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default ParticleBackground;
