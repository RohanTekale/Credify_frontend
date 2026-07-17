// src/components/cinema/useDeviceCapability.js
// Decides whether the client gets the full WebGL cinematic experience
// or the lightweight canvas/SVG fallback. Checked once on mount.

import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

function detect() {
  if (typeof window === 'undefined') {
    return { isMobile: false, reducedMotion: false, lowPower: false, canUseWebGL: true };
  }

  const isMobile = window.innerWidth < MOBILE_BREAKPOINT
    || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;

  // Rough heuristic for low-power devices: few logical cores or low device memory
  const lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
    || (navigator.deviceMemory && navigator.deviceMemory <= 4);

  let canUseWebGL = true;
  try {
    const canvas = document.createElement('canvas');
    canUseWebGL = !!(window.WebGLRenderingContext
      && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    canUseWebGL = false;
  }

  return { isMobile, reducedMotion, lowPower, canUseWebGL };
}

// useFullCinema: true only when the device should get the R3F hero scene
// and GSAP scroll-pin/scrub. Everyone else gets the 2D canvas fallback.
export const useDeviceCapability = () => {
  const [caps, setCaps] = useState(detect);

  useEffect(() => {
    const onResize = () => setCaps(detect());
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const useFullCinema = caps.canUseWebGL && !caps.reducedMotion && !caps.isMobile && !caps.lowPower;

  return { ...caps, useFullCinema };
};

export default useDeviceCapability;
