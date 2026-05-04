import React, { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const ring = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const rafId = useRef(null);
  const [clicked, setClicked] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    const onClick = () => {
      setClicked(true);
      setTimeout(() => setClicked(false), 600);
    };

    const onMouseEnterDoc = () => setHidden(false);
    const onMouseLeaveDoc = () => setHidden(true);

    // Magnetic hover detection
    const onHoverStart = () => setHovering(true);
    const onHoverEnd = () => setHovering(false);

    const interactiveEls = document.querySelectorAll('button, a, [role="button"], input, textarea, select, label');
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', onHoverStart);
      el.addEventListener('mouseleave', onHoverEnd);
    });

    document.addEventListener('mousemove', onMove);
    document.addEventListener('click', onClick);
    document.addEventListener('mouseenter', onMouseEnterDoc);
    document.addEventListener('mouseleave', onMouseLeaveDoc);

    // Smooth trailing ring animation
    const animateRing = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px)`;
      }
      rafId.current = requestAnimationFrame(animateRing);
    };
    rafId.current = requestAnimationFrame(animateRing);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('click', onClick);
      document.removeEventListener('mouseenter', onMouseEnterDoc);
      document.removeEventListener('mouseleave', onMouseLeaveDoc);
      interactiveEls.forEach(el => {
        el.removeEventListener('mouseenter', onHoverStart);
        el.removeEventListener('mouseleave', onHoverEnd);
      });
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Re-attach hover listeners when DOM updates
  useEffect(() => {
    const onHoverStart = () => setHovering(true);
    const onHoverEnd = () => setHovering(false);
    const timer = setInterval(() => {
      const els = document.querySelectorAll('button, a, [role="button"], input, textarea, select');
      els.forEach(el => {
        el.addEventListener('mouseenter', onHoverStart);
        el.addEventListener('mouseleave', onHoverEnd);
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const dotStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: hovering ? '10px' : '8px',
    height: hovering ? '10px' : '8px',
    borderRadius: '50%',
    background: hovering ? '#FF9A6C' : '#FF6B35',
    boxShadow: `0 0 ${hovering ? '16px' : '10px'} ${hovering ? '#FF9A6C' : '#FF6B35'}`,
    pointerEvents: 'none',
    zIndex: 99999,
    marginLeft: hovering ? '-5px' : '-4px',
    marginTop: hovering ? '-5px' : '-4px',
    transition: 'width 0.2s, height 0.2s, background 0.2s, box-shadow 0.2s, opacity 0.3s',
    opacity: hidden ? 0 : 1,
    willChange: 'transform',
  };

  const ringStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: hovering ? '50px' : clicked ? '60px' : '36px',
    height: hovering ? '50px' : clicked ? '60px' : '36px',
    borderRadius: '50%',
    border: hovering
      ? '2px solid rgba(255, 154, 108, 0.9)'
      : clicked
        ? '2px solid rgba(255, 107, 53, 0.5)'
        : '2px solid rgba(255, 107, 53, 0.75)',
    background: hovering ? 'rgba(255, 107, 53, 0.08)' : 'transparent',
    backdropFilter: hovering ? 'blur(4px)' : 'none',
    boxShadow: hovering
      ? '0 0 20px rgba(255, 107, 53, 0.3), inset 0 0 10px rgba(255, 107, 53, 0.1)'
      : clicked
        ? '0 0 30px rgba(255, 107, 53, 0.6)'
        : '0 0 10px rgba(255, 107, 53, 0.2)',
    pointerEvents: 'none',
    zIndex: 99998,
    marginLeft: hovering ? '-25px' : clicked ? '-30px' : '-18px',
    marginTop: hovering ? '-25px' : clicked ? '-30px' : '-18px',
    transition: 'width 0.3s cubic-bezier(0.34,1.56,0.64,1), height 0.3s cubic-bezier(0.34,1.56,0.64,1), border 0.3s, background 0.3s, box-shadow 0.3s, opacity 0.3s, margin 0.3s',
    opacity: hidden ? 0 : 1,
    willChange: 'transform',
  };

  // Click burst ripple
  const burstStyle = clicked ? {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: '1px solid rgba(255, 107, 53, 0.5)',
    pointerEvents: 'none',
    zIndex: 99997,
    marginLeft: '-40px',
    marginTop: '-40px',
    animation: 'cursorBurst 0.6s ease-out forwards',
    transform: `translate(${pos.current.x}px, ${pos.current.y}px)`,
  } : null;

  return (
    <>
      <style>{`
        * { cursor: none !important; }
        @keyframes cursorBurst {
          0%   { transform: translate(${pos.current.x}px, ${pos.current.y}px) scale(0.3); opacity: 0.8; }
          100% { transform: translate(${pos.current.x}px, ${pos.current.y}px) scale(1.5); opacity: 0; }
        }
      `}</style>
      <div ref={dotRef} style={dotStyle} />
      <div ref={ringRef} style={ringStyle} />
      {burstStyle && <div style={burstStyle} />}
    </>
  );
};

export default CustomCursor;
