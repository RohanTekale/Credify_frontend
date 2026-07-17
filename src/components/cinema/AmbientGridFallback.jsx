// src/components/cinema/AmbientGridFallback.jsx
// Lightweight 2D canvas ambient mesh — the fallback for mobile,
// reduced-motion, low-power devices, or while the R3F scene lazy-loads.
// Same visual language (brand-blue mesh) as the WebGL hero, just cheaper.

import React, { useEffect, useRef } from 'react';
import useThemeStore from '../../store/themeStore';

const AmbientGridFallback = () => {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const { theme } = useThemeStore();
  const isDark    = theme === 'dark';

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width  = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    let t = 0;

    const onResize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', onResize, { passive: true });

    const draw = () => {
      t += 0.004;
      ctx.clearRect(0, 0, W, H);
      const cols = 12, rows = 8;
      const cw = W / cols, ch = H / rows;
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const waveX = Math.sin(t + r * 0.5 + c * 0.3) * 4;
          const waveY = Math.cos(t * 0.7 + c * 0.4 + r * 0.2) * 4;
          const px = c * cw + waveX, py = r * ch + waveY;
          const alpha = isDark ? 0.055 : 0.03;
          if (c < cols) {
            const nx = (c + 1) * cw + Math.sin(t + r * 0.5 + (c + 1) * 0.3) * 4;
            const ny = r * ch + Math.cos(t * 0.7 + (c + 1) * 0.4 + r * 0.2) * 4;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(nx, ny);
            ctx.strokeStyle = `rgba(59,97,245,${alpha})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
          if (r < rows) {
            const nx2 = c * cw + Math.sin(t + (r + 1) * 0.5 + c * 0.3) * 4;
            const ny2 = (r + 1) * ch + Math.cos(t * 0.7 + c * 0.4 + (r + 1) * 0.2) * 4;
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(nx2, ny2);
            ctx.strokeStyle = `rgba(59,97,245,${alpha})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
          const dotAlpha = (Math.sin(t * 1.2 + r * 0.8 + c * 0.6) + 1) / 2 * (isDark ? 0.18 : 0.1);
          ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(59,97,245,${dotAlpha})`; ctx.fill();
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [isDark]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
};

export default AmbientGridFallback;
