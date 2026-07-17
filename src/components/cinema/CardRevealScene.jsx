// src/components/cinema/CardRevealScene.jsx
// Clean 3D card: no cloth, no white overlays.
// - Smooth entrance rise animation on mount
// - Full 360° drag rotation (mouse & touch) in X and Y
// - Idle float when user isn't dragging
// - Cursor light parallax on hover (non-drag)

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

const MODEL_URL = '/models/credify-card.glb';

const Card = () => {
  const group        = useRef();
  const { scene }    = useGLTF(MODEL_URL);
  const { gl }       = useThree();

  // Accumulated rotation (survives between frames)
  const rot          = useRef({ x: -0.05, y: -0.18 });
  // Velocity for momentum after release
  const vel          = useRef({ x: 0, y: 0 });
  // Drag state
  const drag         = useRef({ active: false, lastX: 0, lastY: 0 });
  // Whether entrance animation is still playing
  const entering     = useRef(true);

  const cardScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    cardScene.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        obj.material.envMapIntensity = 1.6;
      }
    });
  }, [cardScene]);

  // Entrance: rise from below with a slow spin-in
  useEffect(() => {
    if (!group.current) return;
    gsap.set(group.current.position, { y: -1.2, z: -0.3 });
    gsap.set(group.current.rotation, { x: 0.4, y: -1.2, z: 0.1 });
    gsap.to(group.current.position, {
      y: 0, z: 0, duration: 1.8, delay: 0.2,
      ease: 'power3.out',
    });
    gsap.to(group.current.rotation, {
      x: rot.current.x, y: rot.current.y, z: 0, duration: 2.0,
      delay: 0.2, ease: 'power3.out',
      onComplete: () => { entering.current = false; },
    });
  }, []);

  // Pointer events on the WebGL canvas for drag rotation
  useEffect(() => {
    const canvas = gl.domElement;

    const onDown = (e) => {
      drag.current.active = true;
      drag.current.lastX  = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      drag.current.lastY  = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      vel.current = { x: 0, y: 0 };
      canvas.style.cursor = 'grabbing';
    };

    const onMove = (e) => {
      if (!drag.current.active) return;
      const cx = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const cy = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      const dx = cx - drag.current.lastX;
      const dy = cy - drag.current.lastY;
      drag.current.lastX = cx;
      drag.current.lastY = cy;

      const speed = 0.007;
      rot.current.y += dx * speed;   // horizontal drag → Y axis spin (full 360)
      rot.current.x += dy * speed;   // vertical drag   → X axis flip (full 360)

      // Store velocity for momentum
      vel.current.x = dy * speed;
      vel.current.y = dx * speed;
    };

    const onUp = () => {
      drag.current.active = false;
      canvas.style.cursor = 'grab';
    };

    canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown',  onDown);
    canvas.addEventListener('pointermove',  onMove);
    canvas.addEventListener('pointerup',    onUp);
    canvas.addEventListener('pointerleave', onUp);
    // Touch support
    canvas.addEventListener('touchstart',   onDown, { passive: true });
    canvas.addEventListener('touchmove',    onMove, { passive: true });
    canvas.addEventListener('touchend',     onUp);

    return () => {
      canvas.removeEventListener('pointerdown',  onDown);
      canvas.removeEventListener('pointermove',  onMove);
      canvas.removeEventListener('pointerup',    onUp);
      canvas.removeEventListener('pointerleave', onUp);
      canvas.removeEventListener('touchstart',   onDown);
      canvas.removeEventListener('touchmove',    onMove);
      canvas.removeEventListener('touchend',     onUp);
    };
  }, [gl]);

  useFrame((state) => {
    if (!group.current || entering.current) return;

    if (drag.current.active) {
      // During drag: apply accumulated rotation directly
      group.current.rotation.x = rot.current.x;
      group.current.rotation.y = rot.current.y;
    } else {
      // After release: momentum coast + gentle idle float
      vel.current.x *= 0.94;
      vel.current.y *= 0.94;
      rot.current.x += vel.current.x;
      rot.current.y += vel.current.y;

      // Idle bob (only when velocity is small — no jitter during spin-down)
      const velMag = Math.abs(vel.current.x) + Math.abs(vel.current.y);
      if (velMag < 0.002) {
        rot.current.x += Math.sin(state.clock.elapsedTime * 0.7) * 0.0003;
        group.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.04;
      }

      group.current.rotation.x = rot.current.x;
      group.current.rotation.y = rot.current.y;
    }
  });

  return (
    <group ref={group} scale={1.75}>
      <primitive object={cardScene} />
    </group>
  );
};

const CardRevealScene = () => (
  <>
    <ambientLight intensity={0.6} />
    <directionalLight position={[3, 4, 3]}  intensity={1.5} />
    <directionalLight position={[-3, -2, 2]} intensity={0.5} color="#6089ff" />
    <pointLight position={[0, 0, 3]} intensity={0.4} color="#ffffff" />
    <Environment preset="city" />
    <Card />
    <ContactShadows
      position={[0, -0.9, 0]}
      opacity={0.35}
      scale={3}
      blur={2.8}
      far={1.5}
    />
  </>
);

useGLTF.preload(MODEL_URL);

export default CardRevealScene;
