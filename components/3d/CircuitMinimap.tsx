"use client";

import React, { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface CircuitMinimapProps {
  /** SVG path `d` attribute string describing the circuit outline */
  path: string;
  /** Array of [startFraction, endFraction] pairs (0–1) for DRS zones */
  drsZones?: [number, number][];
  /** Main circuit stroke color */
  color?: string;
  width?: number;
  height?: number;
}

// ─────────────────────────────────────────────────────────────
// Sector color palette
// ─────────────────────────────────────────────────────────────

const SECTOR_COLORS = ["#e10600", "#ffcc00", "#00d2ff"] as const;

// ─────────────────────────────────────────────────────────────
// Hook: get total path length from an SVGPathElement ref
// ─────────────────────────────────────────────────────────────

function usePathLength(ref: React.RefObject<SVGPathElement | null>): number {
  const [length, setLength] = useState(1000);

  useEffect(() => {
    if (ref.current) {
      try {
        const l = ref.current.getTotalLength();
        if (l > 0) setLength(l);
      } catch {
        // getTotalLength not available (SSR guard)
      }
    }
  }, [ref]);

  return length;
}

// ─────────────────────────────────────────────────────────────
// Animated dot position along a path
// ─────────────────────────────────────────────────────────────

function useAnimatedDot(
  pathRef: React.RefObject<SVGPathElement | null>,
  pathLength: number,
  speed = 0.00012
): { x: number; y: number } {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const tRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let lastTime: number | null = null;

    const tick = (now: number) => {
      if (lastTime !== null) {
        const dt = now - lastTime;
        tRef.current = (tRef.current + dt * speed) % 1;
      }
      lastTime = now;

      if (pathRef.current && pathLength > 0) {
        try {
          const pt = pathRef.current.getPointAtLength(tRef.current * pathLength);
          setPos({ x: pt.x, y: pt.y });
        } catch {
          // no-op
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [pathRef, pathLength, speed]);

  return pos;
}

// ─────────────────────────────────────────────────────────────
// DRS zone overlay (re-uses the same path with dasharray trick)
// ─────────────────────────────────────────────────────────────

interface DrsOverlayProps {
  d: string;
  totalLength: number;
  zones: [number, number][];
  strokeWidth: number;
}

function DrsOverlay({ d, totalLength, zones, strokeWidth }: DrsOverlayProps) {
  return (
    <>
      {zones.map(([start, end], i) => {
        const zoneLen = Math.abs(end - start) * totalLength;
        const offset = start * totalLength;
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#00d2ff"
            strokeWidth={strokeWidth * 1.4}
            strokeLinecap="round"
            strokeDasharray={`${zoneLen} ${totalLength}`}
            strokeDashoffset={-offset}
            opacity={0.72}
          />
        );
      })}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Sector boundary arcs (divide circuit into 3 sectors)
// ─────────────────────────────────────────────────────────────

interface SectorBoundariesProps {
  pathRef: React.RefObject<SVGPathElement | null>;
  totalLength: number;
  dotRadius: number;
}

function SectorBoundaries({ pathRef, totalLength, dotRadius }: SectorBoundariesProps) {
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    if (!pathRef.current || totalLength <= 0) return;
    try {
      const pts = [1 / 3, 2 / 3].map((f) =>
        pathRef.current!.getPointAtLength(f * totalLength)
      );
      setPoints(pts.map((p) => ({ x: p.x, y: p.y })));
    } catch {
      // no-op
    }
  }, [pathRef, totalLength]);

  return (
    <>
      {points.map((pt, i) => (
        <g key={i}>
          <circle cx={pt.x} cy={pt.y} r={dotRadius * 1.6} fill={SECTOR_COLORS[i + 1]} opacity={0.9} />
          <circle cx={pt.x} cy={pt.y} r={dotRadius * 0.8} fill="#ffffff" />
          <text
            x={pt.x + dotRadius * 2.2}
            y={pt.y + dotRadius * 0.5}
            fontSize={dotRadius * 2.4}
            fill={SECTOR_COLORS[i + 1]}
            fontWeight="700"
            fontFamily="monospace"
          >
            S{i + 2}
          </text>
        </g>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export default function CircuitMinimap({
  path,
  drsZones = [],
  color = "#e10600",
  width = 320,
  height = 220,
}: CircuitMinimapProps) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const pathLength = usePathLength(pathRef);
  const dotPos = useAnimatedDot(pathRef, pathLength);

  const strokeWidth = Math.max(4, Math.min(width, height) * 0.024);
  const dotRadius = strokeWidth * 1.55;

  // Sector color stripe (behind main track)
  const sectorDash = pathLength / 3;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", overflow: "visible" }}
      aria-label="Circuit minimap"
    >
      {/* ── Glow filter ── */}
      <defs>
        <filter id="cm-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={strokeWidth * 0.9} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="cm-dot-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={dotRadius * 0.8} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Background ── */}
      <rect width={width} height={height} rx={8} fill="#0d0d1a" />

      {/* ── Sector 1 underlay (red) ── */}
      <path
        d={path}
        fill="none"
        stroke={SECTOR_COLORS[0]}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
        strokeDasharray={`${sectorDash} ${pathLength}`}
        strokeDashoffset={0}
        opacity={0.22}
      />
      {/* ── Sector 2 underlay (yellow) ── */}
      <path
        d={path}
        fill="none"
        stroke={SECTOR_COLORS[1]}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
        strokeDasharray={`${sectorDash} ${pathLength}`}
        strokeDashoffset={-sectorDash}
        opacity={0.22}
      />
      {/* ── Sector 3 underlay (cyan) ── */}
      <path
        d={path}
        fill="none"
        stroke={SECTOR_COLORS[2]}
        strokeWidth={strokeWidth * 0.7}
        strokeLinecap="round"
        strokeDasharray={`${sectorDash} ${pathLength}`}
        strokeDashoffset={-sectorDash * 2}
        opacity={0.22}
      />

      {/* ── Main circuit shadow / outline ── */}
      <path
        d={path}
        fill="none"
        stroke="#000000"
        strokeWidth={strokeWidth + 3}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.6}
      />

      {/* ── Main circuit track ── */}
      <path
        ref={pathRef}
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#cm-glow)"
      />

      {/* ── DRS zones ── */}
      {drsZones.length > 0 && (
        <DrsOverlay
          d={path}
          totalLength={pathLength}
          zones={drsZones}
          strokeWidth={strokeWidth}
        />
      )}

      {/* ── Sector boundaries ── */}
      <SectorBoundaries
        pathRef={pathRef}
        totalLength={pathLength}
        dotRadius={dotRadius}
      />

      {/* ── Animated car dot ── */}
      <g filter="url(#cm-dot-glow)">
        {/* Outer glow ring */}
        <circle cx={dotPos.x} cy={dotPos.y} r={dotRadius * 1.6} fill={color} opacity={0.35} />
        {/* Main dot */}
        <circle cx={dotPos.x} cy={dotPos.y} r={dotRadius} fill={color} />
        {/* Inner highlight */}
        <circle cx={dotPos.x} cy={dotPos.y} r={dotRadius * 0.45} fill="#ffffff" opacity={0.8} />
      </g>

      {/* ── Start/Finish line ── */}
      <line
        x1={dotPos.x - strokeWidth * 2}
        y1={dotPos.y}
        x2={dotPos.x + strokeWidth * 2}
        y2={dotPos.y}
        stroke="#ffffff"
        strokeWidth={1.5}
        opacity={0.0}
      />
    </svg>
  );
}
