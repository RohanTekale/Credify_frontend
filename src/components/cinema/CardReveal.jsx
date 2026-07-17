// src/components/cinema/CardReveal.jsx
import React, { Suspense, lazy, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useDeviceCapability } from './useDeviceCapability';
import { useInView } from './ScrollChapter';

const CardRevealScene = lazy(() => import('./CardRevealScene'));

const StaticFallback = () => (
  <div style={{
    width: '100%', height: '100%', borderRadius: 24,
    background: 'linear-gradient(135deg,#1428a0 0%,#1232d4 50%,#2545e8 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 30px 80px rgba(37,69,232,0.35)',
  }}>
    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'Sora,sans-serif' }}>
      Credify
    </span>
  </div>
);

const CardReveal = ({ width = 440, height = 320, style = {} }) => {
  const wrapperRef = useRef(null);
  const { useFullCinema, isMobile } = useDeviceCapability();
  const inView = useInView(wrapperRef, 0.15);
  const dpr = isMobile ? [1, 1] : [1, 1.6];

  return (
    <div ref={wrapperRef} style={{ textAlign: 'center', ...style }}>
      <div style={{
        width: `min(${width}px, 88vw)`,
        height: `min(${height}px, 60vw)`,
        margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {useFullCinema ? (
          inView && (
            <Suspense fallback={<StaticFallback />}>
              <Canvas
                dpr={dpr}
                camera={{ position: [0, 0, 3.8], fov: 26 }}
                gl={{ antialias: true, alpha: true }}
                style={{ width: '100%', height: '100%', display: 'block' }}
              >
                <CardRevealScene />
              </Canvas>
            </Suspense>
          )
        ) : (
          <StaticFallback />
        )}
      </div>

      {/* Subtle drag hint — fades after 4 seconds via CSS animation */}
      {useFullCinema && (
        <p style={{
          marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.28)',
          fontFamily: 'Sora, sans-serif', letterSpacing: '0.08em',
          animation: 'fadeHint 4s ease forwards',
          userSelect: 'none',
        }}>
          ↺ drag to rotate
        </p>
      )}

      <style>{`
        @keyframes fadeHint {
          0%   { opacity: 1; }
          60%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default CardReveal;
