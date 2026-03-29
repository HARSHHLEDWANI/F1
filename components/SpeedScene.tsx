"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ─────────────────────────────────────────────
// 🚀 PURE THREE.JS SPEED LINES
// ─────────────────────────────────────────────
function StreamLines() {
  const { scene } = useThree();
  const linesRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    const meshes: THREE.Mesh[] = [];

    for (let i = 0; i < 60; i++) {
      const geometry = new THREE.BoxGeometry(
        0.003,
        0.003,
        0.3 + Math.random() * 0.7
      );

      const material = new THREE.MeshBasicMaterial({
        color: i % 5 === 0 ? "#E10600" : "#ffffff",
        transparent: true,
        opacity: 0.4,
      });

      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        Math.random() * -20
      );

      scene.add(mesh);
      meshes.push(mesh);
    }

    linesRef.current = meshes;

    // cleanup (VERY IMPORTANT)
    return () => {
      meshes.forEach((mesh) => {
        scene.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
    };
  }, [scene]);

  useFrame(() => {
    linesRef.current.forEach((mesh) => {
      mesh.position.z += 0.1;

      if (mesh.position.z > 2) {
        mesh.position.z = -20;
      }
    });
  });

  return null; // ⚠️ nothing rendered via JSX
}

// ─────────────────────────────────────────────
// 🌌 PARTICLES (keep simple)
// ─────────────────────────────────────────────
function WarpParticles() {
  const { scene } = useThree();
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(2000 * 3);

    for (let i = 0; i < 2000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = Math.random() * -10;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: "#ff2200",
      size: 0.02,
      transparent: true,
      opacity: 0.6,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    particlesRef.current = points;

    return () => {
      scene.remove(points);
      geometry.dispose();
      material.dispose();
    };
  }, [scene]);

  useFrame(({ clock }) => {
    if (!particlesRef.current) return;

    const t = clock.getElapsedTime();
    particlesRef.current.rotation.y = t * 0.04;
  });

  return null;
}
function SceneLights() {
  const { scene } = useThree();

  useEffect(() => {
    const ambient = new THREE.AmbientLight(0xffffff, 0.1);
    const point = new THREE.PointLight("#E10600", 0.5);

    point.position.set(0, 0, 2);

    scene.add(ambient);
    scene.add(point);

    return () => {
      scene.remove(ambient);
      scene.remove(point);
    };
  }, [scene]);

  return null;
}
// ─────────────────────────────────────────────
// 🏎️ MAIN COMPONENT
// ─────────────────────────────────────────────
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
        gl={{ alpha: true }}
      >
  

        <WarpParticles />
        <StreamLines />
      </Canvas>
    </div>
  );
}