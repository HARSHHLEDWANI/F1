"use client";

import { useRef, MouseEvent, ReactNode } from "react";
import { motion } from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees */
  maxTilt?: number;
  /** Scale on hover */
  scale?: number;
  glare?: boolean;
}

/**
 * CSS-3D tilt card — no R3F needed.
 * Uses CSS perspective + rotateX/Y driven by mouse position.
 */
export default function TiltCard({
  children,
  className = "",
  maxTilt = 12,
  scale = 1.03,
  glare = true,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const { left, top, width, height } = card.getBoundingClientRect();
    const mx = e.clientX - left;
    const my = e.clientY - top;

    const rotX = ((my / height) - 0.5) * -maxTilt * 2;
    const rotY = ((mx / width) - 0.5) * maxTilt * 2;

    card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${scale},${scale},${scale})`;

    if (shineRef.current) {
      const pctX = (mx / width) * 100;
      const pctY = (my / height) * 100;
      shineRef.current.style.setProperty("--mx", `${pctX}%`);
      shineRef.current.style.setProperty("--my", `${pctY}%`);
      shineRef.current.style.opacity = "1";
    }
  };

  const handleLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    if (shineRef.current) shineRef.current.style.opacity = "0";
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`tilt-card relative ${className}`}
      style={{ transition: "transform 0.15s ease-out, box-shadow 0.15s ease-out" }}
    >
      {children}
      {glare && (
        <div
          ref={shineRef}
          className="tilt-card-shine"
          style={{ opacity: 0, transition: "opacity 0.3s" }}
        />
      )}
    </div>
  );
}
