// src/components/cinema/HeroScene.jsx
// R3F ambient hero scene: a slow-drifting node network representing
// payment events flowing through an approval/reconciliation mesh.
// Pure ambient loop — no flashing, no rapid motion, dpr capped.

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BRAND_BLUE   = '#3b61f5';
const BRAND_PURPLE = '#8b5cf6';
const BRAND_CYAN   = '#06b6d4';

// Generates a sphere-distributed point cloud + a subset of "edges" connecting
// nearby points, evoking a payment/approval network without being literal.
function useNetworkGeometry(count = 90, radius = 3.2) {
  return useMemo(() => {
    const points = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = radius * (0.7 + Math.random() * 0.3);
      points.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ));
    }

    // Connect each point to its 2 nearest neighbours to form a sparse mesh
    const edgePositions = [];
    points.forEach((p, i) => {
      const distances = points
        .map((q, j) => ({ j, d: i === j ? Infinity : p.distanceTo(q) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      distances.forEach(({ j }) => {
        edgePositions.push(p.x, p.y, p.z, points[j].x, points[j].y, points[j].z);
      });
    });

    return {
      pointPositions: new Float32Array(points.flatMap(p => [p.x, p.y, p.z])),
      edgePositions: new Float32Array(edgePositions),
    };
  }, [count, radius]);
}

const NetworkMesh = () => {
  const groupRef = useRef(null);
  const { pointPositions, edgePositions } = useNetworkGeometry();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // Slow ambient rotation — one full revolution roughly every 90s
    groupRef.current.rotation.y += delta * 0.07;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.15;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={pointPositions.length / 3}
            array={pointPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.045} color={BRAND_BLUE} transparent opacity={0.85} sizeAttenuation />
      </points>

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={edgePositions.length / 3}
            array={edgePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={BRAND_PURPLE} transparent opacity={0.12} />
      </lineSegments>
    </group>
  );
};

// A handful of slow-pulsing "event" spheres that drift along the mesh,
// representing live payment/webhook events without literal iconography.
const PulseNode = ({ position, color, speed = 1 }) => {
  const ref = useRef(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;
    const scale = 1 + Math.sin(t * 1.4) * 0.25;
    ref.current.scale.setScalar(scale);
    ref.current.material.opacity = 0.5 + Math.sin(t * 1.4) * 0.3;
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.06, 12, 12]} />
      <meshBasicMaterial color={color} transparent opacity={0.7} />
    </mesh>
  );
};

const Scene = () => (
  <>
    <ambientLight intensity={0.6} />
    <NetworkMesh />
    <PulseNode position={[1.6, 0.8, 0.4]}  color={BRAND_BLUE}   speed={0.8} />
    <PulseNode position={[-1.2, -0.6, 1.1]} color={BRAND_CYAN}   speed={1.1} />
    <PulseNode position={[0.3, 1.4, -1.0]}  color={BRAND_PURPLE} speed={0.65} />
  </>
);

// HeroScene: the exported Canvas. Caller is responsible for lazy-loading
// this component and only mounting it when in view (see CanvasManager).
const HeroScene = ({ dpr }) => (
  <Canvas
    camera={{ position: [0, 0, 7], fov: 45 }}
    dpr={dpr}
    gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
    style={{ width: '100%', height: '100%' }}
  >
    <Scene />
  </Canvas>
);

export default HeroScene;
