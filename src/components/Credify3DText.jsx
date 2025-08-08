import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text3D, Float } from '@react-three/drei';

const PremiumMaterial = () => (
  <meshStandardMaterial
    color="#ffffff"
    emissive="#ffffff"
    emissiveIntensity={2.2}
    metalness={1}
    roughness={0.05}
  />
);

const Credify3DText = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 20], fov: 50 }}
      style={{
        background: 'transparent',
        width: '100%',
        height: '100%',
      }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={2.5} />
      <Suspense fallback={null}>
        <Float
          speed={1}
          rotationIntensity={0.25} // reduced movement so letters stay visible
          floatIntensity={0.2}      // smaller up/down sway
        >
          <Text3D
            font="/fonts/helvetiker_regular.typeface.json"
            size={2.2}
            height={0.6}
            curveSegments={32}
            bevelEnabled
            bevelThickness={0.1}
            bevelSize={0.05}
            bevelSegments={8}
            letterSpacing={0.35}
            scale={[2.2, 1.8, 1]}
            position={[-8, 0, 0]} // fully left in scene
          >
            C R E D I F Y
            <PremiumMaterial />
          </Text3D>
        </Float>
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
};

export default Credify3DText;
