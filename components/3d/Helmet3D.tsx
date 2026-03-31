"use client";

import React, { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────
// Helmet geometry built from primitives
// ─────────────────────────────────────────────────────────────

interface HelmetMeshProps {
  teamColor: string;
  hovered: boolean;
}

function HelmetMesh({ teamColor, hovered }: HelmetMeshProps) {
  const color = new THREE.Color(teamColor);

  return (
    <group>
      {/* ── Main dome (upper helmet shell) ── */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <sphereGeometry args={[0.52, 36, 36, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        <meshStandardMaterial
          color={color}
          metalness={0.55}
          roughness={0.2}
          emissive={hovered ? color : new THREE.Color(0x000000)}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* ── Lower chin / jaw section ── */}
      <mesh position={[0, -0.14, 0.06]} castShadow>
        <cylinderGeometry args={[0.44, 0.38, 0.3, 28, 1, true, -Math.PI * 0.1, Math.PI * 1.2]} />
        <meshStandardMaterial
          color={color}
          metalness={0.55}
          roughness={0.25}
          emissive={hovered ? color : new THREE.Color(0x000000)}
          emissiveIntensity={hovered ? 0.3 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Visor (curved dark reflective strip) ── */}
      <mesh position={[0, 0.04, 0.44]} rotation={[0.22, 0, 0]} castShadow>
        <sphereGeometry args={[0.53, 32, 16, 0, Math.PI * 2, 0.78, 0.46]} />
        <meshStandardMaterial
          color="#050a14"
          metalness={0.95}
          roughness={0.05}
          envMapIntensity={2}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* ── Visor frame / border ── */}
      <mesh position={[0, 0.05, 0.43]} rotation={[0.22, 0, 0]}>
        <sphereGeometry args={[0.535, 28, 12, 0, Math.PI * 2, 0.73, 0.5]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.8}
          roughness={0.2}
          side={THREE.BackSide}
        />
      </mesh>

      {/* ── Air duct / forehead vent ── */}
      <mesh position={[0, 0.32, 0.38]}>
        <boxGeometry args={[0.12, 0.06, 0.04]} />
        <meshStandardMaterial color="#111111" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* ── Chin guard ── */}
      <mesh position={[0, -0.22, 0.33]} rotation={[-0.35, 0, 0]} castShadow>
        <boxGeometry args={[0.32, 0.08, 0.14]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>

      {/* ── Left accent stripe ── */}
      <mesh position={[-0.3, 0.1, 0.36]} rotation={[0, 0.7, 0]}>
        <boxGeometry args={[0.06, 0.38, 0.012]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.15}
          roughness={0.3}
        />
      </mesh>

      {/* ── Right accent stripe ── */}
      <mesh position={[0.3, 0.1, 0.36]} rotation={[0, -0.7, 0]}>
        <boxGeometry args={[0.06, 0.38, 0.012]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.15}
          roughness={0.3}
        />
      </mesh>

      {/* ── Halo light (HANS device area at back) ── */}
      <mesh position={[0, -0.08, -0.46]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.28, 0.06, 0.05]} />
        <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ── Glow point light when hovered ── */}
      {hovered && (
        <pointLight color={teamColor} intensity={3} distance={2.5} position={[0, 0.3, 0.6]} />
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// Scene with rotation + scale animation on hover
// ─────────────────────────────────────────────────────────────

interface HelmetSceneProps {
  teamColor: string;
  size: number;
  interactive: boolean;
}

function HelmetScene({ teamColor, size, interactive }: HelmetSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const targetScale = useRef(size);
  const currentScale = useRef(size);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    // Rotation
    const rotSpeed = hovered ? 1.8 : 0.5;
    groupRef.current.rotation.y += delta * rotSpeed;

    // Zoom (scale lerp)
    targetScale.current = hovered ? size * 1.12 : size;
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale.current, delta * 6);
    groupRef.current.scale.setScalar(currentScale.current);
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <HelmetMesh teamColor={teamColor} hovered={hovered} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// Public component
// ─────────────────────────────────────────────────────────────

export interface Helmet3DProps {
  teamColor: string;
  size?: number;
  interactive?: boolean;
}

function Fallback() {
  return (
    <div className="flex items-center justify-center w-full h-full text-zinc-500 text-sm">
      3D unavailable
    </div>
  );
}

export default function Helmet3D({ teamColor, size = 1, interactive = false }: Helmet3DProps) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Suspense fallback={<Fallback />}>
        <Canvas
          shadows
          camera={{ position: [0, 0.1, 2.4], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 4, 3]} intensity={1.5} castShadow />
          <directionalLight position={[-2, 1, -2]} intensity={0.4} color="#4488ff" />
          <pointLight position={[0, -1.5, 1]} intensity={0.4} color="#ff3300" distance={3} />

          <HelmetScene teamColor={teamColor} size={size} interactive={interactive} />

          {interactive && (
            <OrbitControls enableZoom enablePan={false} minDistance={1} maxDistance={5} />
          )}
        </Canvas>
      </Suspense>
    </div>
  );
}
