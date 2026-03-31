"use client";

import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────
// Steering wheel built from Three.js primitives
// ─────────────────────────────────────────────────────────────

function SteeringWheelMesh() {
  const groupRef = useRef<THREE.Group>(null);
  const rimRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    // Slow gentle rotation with slight wobble
    groupRef.current.rotation.z = Math.sin(t * 0.3) * 0.12;
    groupRef.current.rotation.y = Math.sin(t * 0.18) * 0.06;
  });

  // Carbon-fibre-look dark material
  const carbonMat = {
    color: new THREE.Color("#111418"),
    metalness: 0.55,
    roughness: 0.38,
  };
  // Metallic trim
  const metalMat = {
    color: new THREE.Color("#6a7280"),
    metalness: 0.95,
    roughness: 0.08,
  };
  // Button panel (center LCD-ish)
  const panelMat = {
    color: new THREE.Color("#0a0d14"),
    metalness: 0.3,
    roughness: 0.7,
  };
  // Grip wrapping
  const gripMat = {
    color: new THREE.Color("#1a1d24"),
    metalness: 0.1,
    roughness: 0.85,
  };

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* ── Outer rim (torus) ── */}
      <group ref={rimRef}>
        <mesh castShadow>
          <torusGeometry args={[1.0, 0.07, 20, 100]} />
          <meshStandardMaterial {...carbonMat} />
        </mesh>

        {/* Metallic rim highlight ring */}
        <mesh>
          <torusGeometry args={[1.0, 0.075, 8, 100]} />
          <meshStandardMaterial
            color="#8a9aac"
            metalness={0.98}
            roughness={0.04}
            transparent
            opacity={0.25}
          />
        </mesh>

        {/* ── Grip sections (left and right arcs, thicker tube) ── */}
        <mesh rotation={[0, 0, 0]} castShadow>
          <torusGeometry args={[1.0, 0.095, 14, 60, Math.PI * 0.72]} />
          <meshStandardMaterial {...gripMat} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI]} castShadow>
          <torusGeometry args={[1.0, 0.095, 14, 60, Math.PI * 0.72]} />
          <meshStandardMaterial {...gripMat} />
        </mesh>
      </group>

      {/* ── Spokes ── */}
      {/* Top spoke */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.055, 0.72, 0.045]} />
        <meshStandardMaterial {...carbonMat} />
      </mesh>

      {/* Bottom-left spoke */}
      <mesh position={[-0.42, -0.34, 0]} rotation={[0, 0, -Math.PI / 3.5]} castShadow>
        <boxGeometry args={[0.055, 0.72, 0.045]} />
        <meshStandardMaterial {...carbonMat} />
      </mesh>

      {/* Bottom-right spoke */}
      <mesh position={[0.42, -0.34, 0]} rotation={[0, 0, Math.PI / 3.5]} castShadow>
        <boxGeometry args={[0.055, 0.72, 0.045]} />
        <meshStandardMaterial {...carbonMat} />
      </mesh>

      {/* ── Spoke metallic trim stripes ── */}
      <mesh position={[0, 0.5, 0.024]}>
        <boxGeometry args={[0.018, 0.68, 0.005]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>
      <mesh position={[-0.42, -0.34, 0.024]} rotation={[0, 0, -Math.PI / 3.5]}>
        <boxGeometry args={[0.018, 0.68, 0.005]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>
      <mesh position={[0.42, -0.34, 0.024]} rotation={[0, 0, Math.PI / 3.5]}>
        <boxGeometry args={[0.018, 0.68, 0.005]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>

      {/* ── Center hub (hexagonal-ish box cluster) ── */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.44, 0.3, 0.07]} />
        <meshStandardMaterial {...panelMat} />
      </mesh>

      {/* Hub depth layer */}
      <mesh position={[0, 0, -0.025]}>
        <boxGeometry args={[0.48, 0.34, 0.03]} />
        <meshStandardMaterial {...carbonMat} />
      </mesh>

      {/* Hub border trim */}
      <mesh position={[0, 0, 0.038]}>
        <boxGeometry args={[0.46, 0.32, 0.005]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>

      {/* ── Button rows on center hub ── */}
      {/* Row 1 */}
      {[-0.14, -0.04, 0.06, 0.16].map((bx, i) => (
        <mesh key={`btn-top-${i}`} position={[bx, 0.07, 0.042]}>
          <boxGeometry args={[0.07, 0.04, 0.012]} />
          <meshStandardMaterial
            color={i === 1 ? "#e10600" : i === 2 ? "#00d2ff" : "#2a2e38"}
            emissive={i === 1 ? "#e10600" : i === 2 ? "#00d2ff" : "#000000"}
            emissiveIntensity={i < 3 ? 0.6 : 0}
            metalness={0.4}
            roughness={0.5}
          />
        </mesh>
      ))}
      {/* Row 2 */}
      {[-0.14, -0.04, 0.06, 0.16].map((bx, i) => (
        <mesh key={`btn-bot-${i}`} position={[bx, -0.07, 0.042]}>
          <boxGeometry args={[0.07, 0.04, 0.012]} />
          <meshStandardMaterial
            color={i === 0 ? "#ffcc00" : "#2a2e38"}
            emissive={i === 0 ? "#ffcc00" : "#000000"}
            emissiveIntensity={i === 0 ? 0.5 : 0}
            metalness={0.4}
            roughness={0.5}
          />
        </mesh>
      ))}

      {/* ── Rotary dial (left of center) ── */}
      <mesh position={[-0.19, 0, 0.04]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.022, 12]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>
      {/* Rotary dial (right) */}
      <mesh position={[0.19, 0, 0.04]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.022, 12]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>

      {/* ── Paddle shifters (behind rim plane) ── */}
      <mesh position={[-0.7, -0.1, -0.05]} rotation={[0, -0.2, 0.25]} castShadow>
        <boxGeometry args={[0.22, 0.07, 0.03]} />
        <meshStandardMaterial {...carbonMat} />
      </mesh>
      <mesh position={[0.7, -0.1, -0.05]} rotation={[0, 0.2, -0.25]} castShadow>
        <boxGeometry args={[0.22, 0.07, 0.03]} />
        <meshStandardMaterial {...carbonMat} />
      </mesh>

      {/* ── Column stem ── */}
      <mesh position={[0, 0, -0.5]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.85, 14]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// Public component — fills parent container, no props
// ─────────────────────────────────────────────────────────────

function Fallback() {
  return (
    <div className="flex items-center justify-center w-full h-full text-zinc-500 text-sm">
      Loading…
    </div>
  );
}

export default function SteeringWheel3D() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Suspense fallback={<Fallback />}>
        <Canvas
          shadows
          camera={{ position: [0, 0, 3.2], fov: 46 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          {/* Ambient base */}
          <ambientLight intensity={0.25} />

          {/* Key light — cold blue-white from top-left */}
          <directionalLight
            position={[-3, 4, 3]}
            intensity={1.6}
            castShadow
            color="#c8d8f8"
          />

          {/* Fill light — warm subtle from right */}
          <directionalLight position={[3, 1, 2]} intensity={0.5} color="#f0e8d8" />

          {/* Rim light — from behind, defines the rim edges */}
          <pointLight position={[0, 0, -2.5]} intensity={0.8} color="#4466aa" distance={6} />

          {/* Very subtle red glow from below */}
          <pointLight position={[0, -2, 1]} intensity={0.35} color="#e10600" distance={4} />

          <SteeringWheelMesh />
        </Canvas>
      </Suspense>
    </div>
  );
}
