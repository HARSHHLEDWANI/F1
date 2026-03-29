"use client";

import { useEffect, useRef } from "react";

interface Streak {
  x: number;
  y: number;
  len: number;
  speed: number;
  alpha: number;
  width: number;
}

interface SpeedCanvasProps {
  /** 0–1 intensity of the effect */
  intensity?: number;
  className?: string;
}

/**
 * Vanilla-canvas speed-streak background — no external packages needed.
 * Renders light trails streaming left (cockpit POV) at 60fps via rAF.
 */
export default function SpeedCanvas({ intensity = 0.7, className = "" }: SpeedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const streaks: Streak[] = [];
    let raf = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Spawn pool
    const COUNT = Math.floor(80 * intensity);
    for (let i = 0; i < COUNT; i++) {
      streaks.push(spawn(canvas.width, canvas.height, true));
    }

    function spawn(w: number, h: number, randomX = false): Streak {
      return {
        x: randomX ? Math.random() * w : w + Math.random() * 200,
        y: Math.random() * h,
        len: 60 + Math.random() * 180,
        speed: 4 + Math.random() * 10,
        alpha: 0.04 + Math.random() * 0.18 * intensity,
        width: 0.3 + Math.random() * 1.2,
      };
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (const s of streaks) {
        // Gradient streak: bright head, fading tail
        const grad = ctx!.createLinearGradient(s.x, s.y, s.x + s.len, s.y);
        grad.addColorStop(0, `rgba(255,255,255,0)`);
        grad.addColorStop(0.7, `rgba(220,38,38,${s.alpha * 0.6})`);
        grad.addColorStop(1, `rgba(255,255,255,${s.alpha})`);

        ctx!.beginPath();
        ctx!.moveTo(s.x, s.y);
        ctx!.lineTo(s.x + s.len, s.y);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = s.width;
        ctx!.stroke();

        // Move left
        s.x -= s.speed;

        // Recycle when off-screen left
        if (s.x + s.len < 0) {
          Object.assign(s, spawn(canvas!.width, canvas!.height, false));
        }
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`speed-overlay ${className}`}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
