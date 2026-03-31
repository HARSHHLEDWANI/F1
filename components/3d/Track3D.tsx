"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function buildTrackGeometry(
  rawPath: [number, number][],
  width: number,
  height: number
): THREE.BufferGeometry {
  if (rawPath.length < 2) {
    return new THREE.BufferGeometry();
  }

  // Normalize path to fit a -4..4 / -3..3 bounding box
  const xs = rawPath.map((p) => p[0]);
  const ys = rawPath.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const scaleF = Math.min(width / rangeX, height / rangeY) * 0.9;

  const pts: THREE.Vector2[] = rawPath.map(
    ([x, y]) =>
      new THREE.Vector2(
        ((x - (minX + maxX) / 2) * scaleF),
        ((y - (minY + maxY) / 2) * scaleF)
      )
  );

  // Close the loop
  pts.push(pts[0].clone());

  const curve = new THREE.SplineCurve(pts);
  const points3d = curve.getPoints(300).map((p) => new THREE.Vector3(p.x, 0, p.y));

  const trackWidth = 0.28;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < points3d.length - 1; i++) {
    const cur = points3d[i];
    const nxt = points3d[i + 1];
    const dir = new THREE.Vector3().subVectors(nxt, cur).normalize();
    const right = new THREE.Vector3(-dir.z, 0, dir.x);

    const l = cur.clone().addScaledVector(right, -trackWidth / 2);
    const r = cur.clone().addScaledVector(right, trackWidth / 2);

    const base = i * 2;
    positions.push(l.x, l.y, l.z, r.x, r.y, r.z);
    normals.push(0, 1, 0, 0, 1, 0);
    uvs.push(0, i / (points3d.length - 1), 1, i / (points3d.length - 1));

    if (i < points3d.length - 2) {
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ─────────────────────────────────────────────────────────────
// Track ribbon mesh
// ─────────────────────────────────────────────────────────────

interface TrackRibbonProps {
  trackPath: [number, number][];
  trackColor: string;
}

function TrackRibbon({ trackPath, trackColor }: TrackRibbonProps) {
  const geo = useMemo(
    () => buildTrackGeometry(trackPath, 7, 5.5),
    [trackPath]
  );

  const color = new THREE.Color(trackColor);

  return (
    <group>
      {/* Base asphalt layer */}
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial color="#1a1a2e" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* Neon glow overlay (slightly elevated) */}
      <mesh geometry={geo} position={[0, 0.012, 0]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.4}
          transparent
          opacity={0.75}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// Car marker moving along the path
// ─────────────────────────────────────────────────────────────

interface CarMarkerProps {
  trackPath: [number, number][];
  trackColor: string;
}

function CarMarker({ trackPath, trackColor }: CarMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const tRef = useRef(0);

  const curve = useMemo(() => {
    if (trackPath.length < 2) return null;
    const xs = trackPath.map((p) => p[0]);
    const ys = trackPath.map((p) => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const scaleF = Math.min(7 / rangeX, 5.5 / rangeY) * 0.9;

    const pts = trackPath.map(
      ([x, y]) =>
        new THREE.Vector2(
          (x - (minX + maxX) / 2) * scaleF,
          (y - (minY + maxY) / 2) * scaleF
        )
    );
    pts.push(pts[0].clone());
    return new THREE.SplineCurve(pts);
  }, [trackPath]);

  useFrame((_state, delta) => {
    if (!meshRef.current || !curve) return;
    tRef.current = (tRef.current + delta * 0.08) % 1;
    const pt = curve.getPoint(tRef.current);
    const ptNext = curve.getPoint((tRef.current + 0.002) % 1);
    meshRef.current.position.set(pt.x, 0.07, pt.y);

    // Face direction of travel
    const angle = Math.atan2(ptNext.y - pt.y, ptNext.x - pt.x);
    meshRef.current.rotation.y = -angle;
  });

  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[0.1, 0.045, 0.22]} />
      <meshStandardMaterial
        color={trackColor}
        emissive={trackColor}
        emissiveIntensity={1.8}
        metalness={0.6}
        roughness={0.2}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────
// Ground plane
// ─────────────────────────────────────────────────────────────

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#0d0d1a" roughness={1} />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────
// Label floating above
// ─────────────────────────────────────────────────────────────

interface TrackSceneProps {
  trackPath: [number, number][];
  trackColor: string;
  name?: string;
}

function TrackScene({ trackPath, trackColor, name: _name }: TrackSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    // Very subtle drift to add life
    groupRef.current.rotation.y += delta * 0.04;
  });

  return (
    <group ref={groupRef}>
      <Ground />
      <TrackRibbon trackPath={trackPath} trackColor={trackColor} />
      <CarMarker trackPath={trackPath} trackColor={trackColor} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// Public component
// ─────────────────────────────────────────────────────────────

export interface Track3DProps {
  trackPath: [number, number][];
  trackColor?: string;
  name?: string;
}

function Fallback() {
  return (
    <div className="flex items-center justify-center w-full h-full text-zinc-500 text-sm">
      Track unavailable
    </div>
  );
}

export default function Track3D({
  trackPath,
  trackColor = "#00d2ff",
  name,
}: Track3DProps) {
  const safeTrack: [number, number][] =
    Array.isArray(trackPath) && trackPath.length >= 2
      ? trackPath
      : [
          [0, 0], [1, 2], [3, 3], [5, 2],
          [6, 0], [5, -2], [3, -3], [1, -2], [0, 0],
        ];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {name && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 12,
            zIndex: 2,
            color: trackColor,
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textShadow: `0 0 8px ${trackColor}`,
            pointerEvents: "none",
          }}
        >
          {name.toUpperCase()}
        </div>
      )}
      <Suspense fallback={<Fallback />}>
        <Canvas
          shadows
          camera={{ position: [0, 7, 5], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.3} />
          <directionalLight position={[4, 8, 4]} intensity={1} castShadow />
          <pointLight position={[0, 2, 0]} color={trackColor} intensity={1.5} distance={8} />

          <TrackScene trackPath={safeTrack} trackColor={trackColor} name={name} />
        </Canvas>
      </Suspense>
    </div>
  );
}
