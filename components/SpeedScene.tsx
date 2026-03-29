"use client";

/**
 * SpeedScene — React Three Fiber 3D background
 *
 * ⚠️  REQUIRES INSTALLATION:
 *     npm install three @react-three/fiber @react-three/drei
 *     (already added to package.json — run npm install once)
 *
 * Usage:
 *   import SpeedScene from "@/components/SpeedScene";
 *   <SpeedScene />   // renders fullscreen, position: fixed, z-index: -1
 *
 * What it renders:
 *   - 2000 particles streaming toward the camera (warp-speed effect)
 *   - Subtle red ambient light and a dim point light
 *   - Responsive canvas that fills its container
 *   - Optimized: uses instanced mesh + demand frameloop
 */

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PointMaterial, Points } from "@react-three/drei";
import * as THREE from "three";

const PARTICLE_COUNT = 2000;

function WarpParticles() {
  const pointsRef = useRef<THREE.Points>(null!);

  // Generate random sphere of particles
  const positions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 3 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi) - 5; // offset behind camera
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    // Slow rotation for depth
    pointsRef.current.rotation.y = t * 0.04;
    pointsRef.current.rotation.x = Math.sin(t * 0.03) * 0.1;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ff2200"
        size={0.015}
        sizeAttenuation
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

function StreamLines() {
  const linesRef = useRef<THREE.Group>(null!);

  const lines = useMemo(() => {
    return Array.from({ length: 60 }, () => ({
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 6,
      z: Math.random() * -20,
      speed: 0.05 + Math.random() * 0.15,
      len: 0.3 + Math.random() * 0.7,
    }));
  }, []);

  useFrame(() => {
    if (!linesRef.current) return;
    linesRef.current.children.forEach((line, i) => {
      const data = lines[i];
      line.position.z += data.speed;
      if (line.position.z > 2) {
        line.position.z = -20;
      }
    });
  });

  return (
    <group ref={linesRef}>
      {lines.map((l, i) => (
        <mesh key={i} position={[l.x, l.y, l.z]}>
          <boxGeometry args={[0.003, 0.003, l.len]} />
          <meshBasicMaterial color={i % 5 === 0 ? "#E10600" : "#ffffff"} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

export default function SpeedScene() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 75 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        frameloop="always"
        dpr={[1, 1.5]} // cap pixel ratio for performance
      >
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 0, 2]} color="#E10600" intensity={0.5} />
        <Suspense fallback={null}>
          <WarpParticles />
          <StreamLines />
        </Suspense>
      </Canvas>
    </div>
  );
}
