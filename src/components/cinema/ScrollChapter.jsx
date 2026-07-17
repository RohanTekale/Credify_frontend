// src/components/cinema/ScrollChapter.jsx
// Wraps a Home.jsx chapter <section> with GSAP ScrollTrigger.
//
// Two modes:
//   - 'reveal' (default): lightweight entrance animation as the section
//     scrolls into view. No pinning, no scroll hijacking. Used for chapters
//     that are read-once-and-scroll-past (hero, problems, solutions, etc).
//   - 'pin': section pins to the viewport for `pinDuration` of scroll distance.
//     Scroll position within that pinned range is exposed as a normalized
//     0→1 `progress` value via the `onProgress` callback, so the parent can
//     drive real state changes (e.g. switching tabs) off scroll position —
//     not just fade content in once and hold it static.
//
// Falls back to plain (unpinned, unanimated) rendering when
// prefers-reduced-motion is set — pinning scroll for someone who has asked
// for reduced motion is a genuine accessibility violation, not just a nicety.

import React, { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useDeviceCapability } from './useDeviceCapability';

gsap.registerPlugin(ScrollTrigger);

// useInView: lightweight IntersectionObserver, used to tell the CanvasManager
// when this chapter (and therefore its embedded 3D scene) is on screen.
export const useInView = (ref, threshold = 0.25) => {
  const [inView, setInView] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
    ob.observe(el);
    return () => ob.disconnect();
  }, [ref, threshold]);
  return inView;
};

const ScrollChapter = ({
  children,
  id,
  mode = 'reveal',        // 'reveal' | 'pin'
  pinDuration = '+=120%', // how much scroll distance the pin holds for
  onProgress,             // (progress: 0→1, isPinned: boolean) => void — only fires in 'pin' mode
  className = '',
  style = {},
}) => {
  const sectionRef = useRef(null);
  const innerRef   = useRef(null);
  const { reducedMotion } = useDeviceCapability();
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress; // always call the latest closure without re-running the effect

  useLayoutEffect(() => {
    if (reducedMotion) return; // respect prefers-reduced-motion entirely — no pin, no scrub
    const section = sectionRef.current;
    const inner   = innerRef.current;
    if (!section || !inner) return;

    const ctx = gsap.context(() => {
      if (mode === 'pin') {
        // Entrance: fade/slide the pinned content in as it approaches the pin point
        gsap.fromTo(
          inner,
          { autoAlpha: 0, y: 32 },
          {
            autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out',
            scrollTrigger: { trigger: section, start: 'top 85%', toggleActions: 'play none none reverse' },
          },
        );

        // The actual pin + scrub: holds the section in the viewport for
        // `pinDuration` of scroll, reporting normalized progress every frame.
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: pinDuration,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          onUpdate: (self) => onProgressRef.current?.(self.progress, true),
          onLeave:  () => onProgressRef.current?.(1, false),
          onEnterBack: () => onProgressRef.current?.(1, true),
        });
      } else {
        gsap.fromTo(
          inner,
          { autoAlpha: 0, y: 32 },
          {
            autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      }
    }, section);

    return () => ctx.revert();
  }, [mode, pinDuration, reducedMotion]);

  return (
    <section ref={sectionRef} id={id} className={className} style={{ position: 'relative', ...style }}>
      <div ref={innerRef} style={reducedMotion ? {} : { willChange: 'transform, opacity' }}>
        {children}
      </div>
    </section>
  );
};

export default ScrollChapter;
