"use client";

import React, { useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────
// Sub-components built from Three.js primitives
// ─────────────────────────────────────────────────────────────

interface CarProps {
  teamColor: string;
  accentColor: string;
  hovered: boolean;
}

function CarBody({ teamColor, accentColor, hovered }: CarProps) {
  const bodyColor = new THREE.Color(teamColor);
  const accent = new THREE.Color(accentColor);

  return (
    <group>
      {/* ── Main chassis body ── */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.38, 0.12, 1.6]} />
        <meshStandardMaterial
          color={bodyColor}
          metalness={0.7}
          roughness={0.25}
          emissive={hovered ? bodyColor : new THREE.Color(0x000000)}
          emissiveIntensity={hovered ? 0.35 : 0}
        />
      </mesh>

      {/* ── Nose cone (tapered front) ── */}
      <mesh position={[0, 0.06, 1.02]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.1, 0.5, 8]} />
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* ── Cockpit surround ── */}
      <mesh position={[0, 0.2, 0.1]} castShadow>
        <boxGeometry args={[0.22, 0.14, 0.35]} />
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.2} />
      </mesh>

      {/* ── Cockpit opening (dark inside) ── */}
      <mesh position={[0, 0.26, 0.12]}>
        <boxGeometry args={[0.16, 0.05, 0.28]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>

      {/* ── Halo (safety arch) ── */}
      <mesh position={[0, 0.32, 0.05]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.13, 0.018, 12, 40, Math.PI]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ── Left sidepod ── */}
      <mesh position={[-0.24, 0.03, 0.1]} castShadow>
        <boxGeometry args={[0.12, 0.1, 0.7]} />
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* ── Right sidepod ── */}
      <mesh position={[0.24, 0.03, 0.1]} castShadow>
        <boxGeometry args={[0.12, 0.1, 0.7]} />
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* ── Sidepod air intakes (accent stripe) ── */}
      <mesh position={[-0.285, 0.06, 0.1]}>
        <boxGeometry args={[0.01, 0.06, 0.4]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0.285, 0.06, 0.1]}>
        <boxGeometry args={[0.01, 0.06, 0.4]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} />
      </mesh>

      {/* ── Engine cover / rear body ── */}
      <mesh position={[0, 0.15, -0.5]} castShadow>
        <boxGeometry args={[0.28, 0.16, 0.55]} />
        <meshStandardMaterial color={bodyColor} metalness={0.65} roughness={0.25} />
      </mesh>

      {/* ── Front wing main plane ── */}
      <mesh position={[0, -0.04, 1.26]} castShadow>
        <boxGeometry args={[0.82, 0.025, 0.18]} />
        <meshStandardMaterial color={bodyColor} metalness={0.5} roughness={0.3} />
      </mesh>

      {/* ── Front wing flap ── */}
      <mesh position={[0, 0.01, 1.2]}>
        <boxGeometry args={[0.72, 0.018, 0.12]} />
        <meshStandardMaterial color={accent} metalness={0.5} roughness={0.3} />
      </mesh>

      {/* ── Front wing endplates (left & right) ── */}
      <mesh position={[-0.42, 0.0, 1.22]} castShadow>
        <boxGeometry args={[0.015, 0.1, 0.2]} />
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[0.42, 0.0, 1.22]} castShadow>
        <boxGeometry args={[0.015, 0.1, 0.2]} />
        <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.2} />
      </mesh>

      {/* ── Rear wing main plane ── */}
      <mesh position={[0, 0.46, -0.85]} castShadow>
        <boxGeometry args={[0.68, 0.025, 0.14]} />
        <meshStandardMaterial color={bodyColor} metalness={0.5} roughness={0.3} />
      </mesh>

      {/* ── Rear wing upper flap ── */}
      <mesh position={[0, 0.51, -0.88]}>
        <boxGeometry args={[0.62, 0.018, 0.1]} />
        <meshStandardMaterial color={accent} metalness={0.5} roughness={0.3} />
      </mesh>

      {/* ── Rear wing endplates ── */}
      <mesh position={[-0.35, 0.44, -0.87]} castShadow>
        <boxGeometry args={[0.012, 0.22, 0.18]} />
        <meshStandardMaterial color={bodyColor} metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0.35, 0.44, -0.87]} castShadow>
        <boxGeometry args={[0.012, 0.22, 0.18]} />
        <meshStandardMaterial color={bodyColor} metalness={0.7} roughness={0.2} />
      </mesh>

      {/* ── DRS beam wing support ── */}
      <mesh position={[0, 0.3, -0.82]}>
        <boxGeometry args={[0.025, 0.18, 0.025]} />
        <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* ── Front-left wheel ── */}
      <mesh position={[-0.38, -0.07, 0.82]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.19, 20]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Wheel rim FL */}
      <mesh position={[-0.48, -0.07, 0.82]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 0.02, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ── Front-right wheel ── */}
      <mesh position={[0.38, -0.07, 0.82]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.19, 20]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Wheel rim FR */}
      <mesh position={[0.48, -0.07, 0.82]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 0.02, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ── Rear-left wheel ── */}
      <mesh position={[-0.42, -0.05, -0.62]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.24, 20]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Wheel rim RL */}
      <mesh position={[-0.55, -0.05, -0.62]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ── Rear-right wheel ── */}
      <mesh position={[0.42, -0.05, -0.62]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.24, 20]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Wheel rim RR */}
      <mesh position={[0.55, -0.05, -0.62]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ── Front suspension wishbones ── */}
      <mesh position={[-0.19, -0.04, 0.82]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.3, 0.012, 0.012]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.19, -0.04, 0.82]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.3, 0.012, 0.012]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* ── Exhaust pipe ── */}
      <mesh position={[0, 0.2, -0.82]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.028, 0.035, 0.08, 10]} />
        <meshStandardMaterial color="#555555" metalness={0.95} roughness={0.05} emissive="#ff4400" emissiveIntensity={hovered ? 0.6 : 0.2} />
      </mesh>

      {/* ── Floor / undertray ── */}
      <mesh position={[0, -0.065, 0]}>
        <boxGeometry args={[0.5, 0.018, 1.5]} />
        <meshStandardMaterial color="#111111" metalness={0.4} roughness={0.7} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// Main rotating car scene
// ─────────────────────────────────────────────────────────────

interface F1CarSceneProps {
  teamColor: string;
  accentColor: string;
  interactive: boolean;
  size: number;
}

function F1CarScene({ teamColor, accentColor, interactive, size }: F1CarSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    const speed = hovered ? 2.2 : 0.55;
    groupRef.current.rotation.y += delta * speed;
  });

  return (
    <group
      ref={groupRef}
      scale={[size, size, size]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <CarBody teamColor={teamColor} accentColor={accentColor} hovered={hovered} />
      {hovered && (
        <pointLight color={teamColor} intensity={2.5} distance={3} position={[0, 0.5, 0]} />
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// Lights shared across both interactive / non-interactive modes
// ─────────────────────────────────────────────────────────────
function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 3]} intensity={1.4} castShadow />
      <directionalLight position={[-3, 2, -3]} intensity={0.5} color="#6699ff" />
      <pointLight position={[0, -1, 0]} intensity={0.3} color="#ff2200" distance={4} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Public component
// ─────────────────────────────────────────────────────────────

export interface F1Car3DProps {
  teamColor: string;
  accentColor?: string;
  interactive?: boolean;
  size?: number;
}

function Fallback() {
  return (
    <div className="flex items-center justify-center w-full h-full text-zinc-500 text-sm">
      3D unavailable
    </div>
  );
}

export default function F1Car3D({
  teamColor,
  accentColor = "#ffffff",
  interactive = false,
  size = 1,
}: F1Car3DProps) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Suspense fallback={<Fallback />}>
        <Canvas
          shadows
          camera={{ position: [0, 0.6, 3.2], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <SceneLights />
          <F1CarScene
            teamColor={teamColor}
            accentColor={accentColor}
            interactive={interactive}
            size={size}
          />
          {interactive && (
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              minDistance={1.5}
              maxDistance={6}
            />
          )}
        </Canvas>
      </Suspense>
    </div>
  );
}
