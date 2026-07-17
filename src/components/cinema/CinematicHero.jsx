// src/components/cinema/CinematicHero.jsx
// Decides which hero background to render:
//   - useFullCinema true  -> lazy-loaded R3F HeroScene (desktop, WebGL, motion OK)
//   - otherwise           -> lightweight 2D canvas ambient grid (mobile / reduced-motion / low-power)
// Registers with CanvasManager so the WebGL canvas only mounts while in view,
// and unmounts immediately when another chapter's scene takes priority.

import React, { Suspense, lazy, useRef } from 'react';
import { useDeviceCapability } from './useDeviceCapability';
import { useCanvasSlot } from './CanvasManager';
import { useInView } from './ScrollChapter';
import AmbientGridFallback from './AmbientGridFallback';

const HeroScene = lazy(() => import('./HeroScene'));

const CinematicHero = () => {
  const wrapperRef = useRef(null);
  const { useFullCinema, isMobile } = useDeviceCapability();
  const inView = useInView(wrapperRef, 0.1);
  const isActive = useCanvasSlot('hero-scene', { priority: 10, inView: inView && useFullCinema });

  // DPR cap: never render at full device pixel ratio on the hero —
  // 1.5 keeps it crisp without taxing the GPU, even on capable desktops.
  const dpr = isMobile ? [1, 1] : [1, 1.5];

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {useFullCinema ? (
        isActive && (
          <Suspense fallback={<AmbientGridFallback />}>
            <HeroScene dpr={dpr} />
          </Suspense>
        )
      ) : (
        <AmbientGridFallback />
      )}
    </div>
  );
};

export default CinematicHero;
