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
      setTimeout(() => setClicked(false), 400);
    };

    const onMouseEnterDoc = () => setHidden(false);
    const onMouseLeaveDoc = () => setHidden(true);

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

    // Smooth trailing ring animation (approx 200ms lerp lag -> 0.15lerp)
    const animateRing = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.15;
      ring.current.y += (pos.current.y - ring.current.y) * 0.15;
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
    background: 'var(--brand-yellow)',
    boxShadow: `0 0 10px var(--brand-yellow)`,
    pointerEvents: 'none',
    zIndex: 99999,
    marginLeft: hovering ? '-5px' : '-4px',
    marginTop: hovering ? '-5px' : '-4px',
    transition: 'width 0.2s, height 0.2s, background 0.2s, margin 0.2s, opacity 0.3s',
    opacity: hidden ? 0 : 1,
    willChange: 'transform',
  };

  const cursorSize = hovering ? 56 : clicked ? 32 : 40;
  
  const ringStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: `${cursorSize}px`,
    height: `${cursorSize}px`,
    borderRadius: '50%',
    border: '1px solid rgba(255, 255, 255, 0.75)',
    background: 'linear-gradient(135deg, rgba(245, 166, 35, 0.3), rgba(255, 107, 107, 0.3))',
    backdropFilter: 'blur(4px)',
    boxShadow: hovering
      ? '0 8px 32px rgba(0, 0, 0, 0.12)'
      : '0 4px 16px rgba(0, 0, 0, 0.08)',
    pointerEvents: 'none',
    zIndex: 99998,
    marginLeft: `-${cursorSize / 2}px`,
    marginTop: `-${cursorSize / 2}px`,
    transition: 'width 0.25s cubic-bezier(0.34,1.56,0.64,1), height 0.25s cubic-bezier(0.34,1.56,0.64,1), margin 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s',
    opacity: hidden ? 0 : 1,
    willChange: 'transform',
  };

  return (
    <>
      <style>{`
        * { cursor: none !important; }
      `}</style>
      <div ref={dotRef} style={dotStyle} />
      <div ref={ringRef} style={ringStyle} />
    </>
  );
};

export default CustomCursor;
