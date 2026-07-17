// src/components/cinema/TouchFX.jsx
// Lightweight, dependency-free "things popping out of the screen" toolkit.
// Built on raw mouse math + CSS transforms (no extra deps), so it's cheap
// enough to run everywhere — landing, auth, dashboard.
//
// Exports:
//   <CursorSpotlight />   – one global instance in App.jsx. A soft light that
//                           follows the cursor + a trailing particle-burst on click.
//   <Tilt3D>...</Tilt3D>  – wraps any card. Tracks mouse, rotates in 3D space,
//                           lifts the card toward the viewer (translateZ), and
//                           paints a glare highlight that tracks the light.
//   <Magnetic>...</Magnetic> – wraps a button/icon. Gently pulls it toward the
//                           cursor within a radius, like it wants to be touched.

import React, { useRef, useCallback, useEffect, useState } from 'react';

/* ── Tilt3D ──────────────────────────────────────────────────────────────
   Pure-CSS 3D tilt + "pop out of the screen" depth. Apply to any card.
   Props:
     strength  – max rotation in degrees (default 10)
     pop       – how far it lifts toward the viewer in px (default 26)
     glare     – show a tracking glare sheen (default true)
*/
export const Tilt3D = ({ children, strength = 10, pop = 26, glare = true, style = {}, className = '', ...rest }) => {
  const ref = useRef(null);
  const raf = useRef(null);
  const [hover, setHover] = useState(false);
  const glareRef = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;   // 0 → 1
      const py = (e.clientY - r.top) / r.height;    // 0 → 1
      const rx = (0.5 - py) * strength * 2;         // tilt up/down
      const ry = (px - 0.5) * strength * 2;         // tilt left/right
      el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${pop}px) scale(1.015)`;
      if (glare && glareRef.current) {
        glareRef.current.style.background =
          `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.22), transparent 55%)`;
        glareRef.current.style.opacity = '1';
      }
      const sx = ((px - 0.5) * strength * -1.4).toFixed(2);
      const sy = ((py - 0.5) * strength * -1.4).toFixed(2);
      el.style.setProperty('--shadow-x', `${sx}px`);
      el.style.setProperty('--shadow-y', `${(parseFloat(sy) + 14)}px`);
    });
  }, [strength, pop, glare]);

  const onLeave = useCallback(() => {
    setHover(false);
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)';
    el.style.setProperty('--shadow-x', '0px');
    el.style.setProperty('--shadow-y', '14px');
    if (glareRef.current) glareRef.current.style.opacity = '0';
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={onLeave}
      className={className}
      style={{
        position: 'relative',
        transformStyle: 'preserve-3d',
        transition: hover ? 'box-shadow 0.2s ease' : 'transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease',
        boxShadow: hover
          ? 'var(--shadow-x,0px) var(--shadow-y,14px) 38px -8px rgba(20,30,80,0.35)'
          : '0 8px 24px -6px rgba(20,30,80,0.12)',
        willChange: 'transform',
        ...style,
      }}
      {...rest}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit',
            pointerEvents: 'none', opacity: 0, transition: 'opacity 0.25s ease', zIndex: 5,
          }}
        />
      )}
    </div>
  );
};

/* ── Magnetic ────────────────────────────────────────────────────────────
   Wraps a button/icon. Pulls it toward the cursor inside a capture radius,
   snaps back with spring-ish ease on leave.
*/
export const Magnetic = ({ children, radius = 70, pull = 0.35, style = {}, ...rest }) => {
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < radius) {
      el.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
    } else {
      el.style.transform = 'translate(0,0)';
    }
  }, [radius, pull]);

  const reset = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'translate(0,0)';
  }, []);

  return (
    <span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ display: 'inline-block', transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1)', ...style }}
      {...rest}
    >
      {children}
    </span>
  );
};

/* ── CursorSpotlight ─────────────────────────────────────────────────────
   One global instance (mount once in App.jsx, outside route-specific
   layouts that suppress chrome if you want it everywhere). A soft light
   that drifts toward the pointer, plus a tiny particle burst on click —
   the "I just touched the screen" feedback.
*/
export const CursorSpotlight = ({ color = '96,137,255' }) => {
  const dotRef = useRef(null);
  const pos = useRef({ x: -200, y: -200 });
  const target = useRef({ x: -200, y: -200 });
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    const move = (e) => { target.current = { x: e.clientX, y: e.clientY }; };
    const click = (e) => {
      const id = Date.now() + Math.random();
      setBursts((b) => [...b, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setBursts((b) => b.filter((p) => p.id !== id)), 650);
    };
    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('click', click);

    let raf;
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.12;
      pos.current.y += (target.current.y - pos.current.y) * 0.12;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('click', click);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      <div
        ref={dotRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: 420, height: 420, marginLeft: -210, marginTop: -210,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(${color},0.10) 0%, rgba(${color},0.04) 35%, transparent 70%)`,
          willChange: 'transform',
        }}
      />
      {bursts.map((b) => (
        <span
          key={b.id}
          style={{
            position: 'absolute', left: b.x, top: b.y,
            width: 10, height: 10, marginLeft: -5, marginTop: -5,
            borderRadius: '50%',
            border: `2px solid rgba(${color},0.55)`,
            animation: 'fxBurst 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
          }}
        />
      ))}
      <style>{`
        @keyframes fxBurst {
          0%   { transform: scale(0.4); opacity: 1; }
          100% { transform: scale(7);   opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default { Tilt3D, Magnetic, CursorSpotlight };
