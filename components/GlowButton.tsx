"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "red" | "white" | "outline";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}

export default function GlowButton({
  children,
  onClick,
  href,
  variant = "red",
  className = "",
  disabled = false,
  type = "button",
}: GlowButtonProps) {
  const base =
    "relative inline-flex items-center justify-center gap-2 font-black uppercase tracking-tighter text-sm px-7 py-3.5 rounded-2xl overflow-hidden transition-all duration-200 select-none";

  const variants = {
    red: "bg-[#E10600] text-white hover:bg-[#ff1a0e]",
    white: "bg-white text-black hover:bg-neutral-100",
    outline: "bg-transparent text-white border border-white/20 hover:border-white/50 hover:bg-white/5",
  };

  const glowColors = {
    red: "rgba(225,6,0,0.6)",
    white: "rgba(255,255,255,0.3)",
    outline: "rgba(255,255,255,0.15)",
  };

  const content = (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={`${base} ${variants[variant]} ${className}`}
      style={{
        boxShadow: `0 4px 20px ${glowColors[variant]}, inset 0 1px 0 rgba(255,255,255,0.15)`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          `0 6px 30px ${glowColors[variant]}, 0 0 60px ${glowColors[variant].replace("0.6","0.25")}, inset 0 1px 0 rgba(255,255,255,0.2)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          `0 4px 20px ${glowColors[variant]}, inset 0 1px 0 rgba(255,255,255,0.15)`;
      }}
    >
      {/* Sweep shine */}
      <motion.span
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ x: "-100%", opacity: 0 }}
        whileHover={{ x: "100%", opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }}
      />
      {children}
    </motion.button>
  );

  if (href) {
    return <a href={href} className="inline-block">{content}</a>;
  }
  return content;
}
