"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUserTier } from "@/hooks/useUserTier";
import { apiFetch } from "@/lib/api";
import { 
  Menu, X, Zap, Users, Trophy, Map, 
  Cpu, User, LogOut, ChevronRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { tier, loading: tierLoading } = useUserTier();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await apiFetch("/profile");
        setUser(userData);
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
    setIsMenuOpen(false); // Close mobile menu on route change
  }, [pathname]);

  const handleLogout = async () => {
    // For JWT, just remove the token from localStorage
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/auth/signin";
  };

  const navLinks = [
    { name: "Teams", href: "/teams", icon: Users },
    { name: "Drivers", href: "/drivers", icon: Trophy },
    { name: "Tracks", href: "/tracks", icon: Map },
    { name: "Predictions", href: "/prediction", icon: Cpu },
  ];

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-[100]">
      <div className="glass-card rounded-2xl border border-white/10 px-4 md:px-8 py-3 transition-all duration-300">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-red-600 p-2 rounded-lg rotate-[-10deg] group-hover:rotate-0 transition-transform">
              <Zap size={20} fill="white" className="text-white" />
            </div>
            <span className="font-black italic tracking-tighter text-xl hidden sm:inline">
              F1 <span className="text-red-600">PREDICTOR</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive 
                      ? "text-white bg-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]" 
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={16} className={isActive ? "text-red-500" : ""} />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-xs font-bold text-white leading-none mb-1">
                    {user.name?.split(' ')[0] || "User"}
                  </span>
                  <span className={`text-[10px] uppercase font-black tracking-widest ${tier === 'pro' ? 'text-yellow-400' : 'text-neutral-500'}`}>
                    {tierLoading ? "..." : tier === 'pro' ? "Pro Member" : "Free Tier"}
                  </span>
                </div>
                
                <Link href="/profile" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <User size={18} className="text-neutral-400 hover:text-white" />
                </Link>

                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-500/10 rounded-full transition-colors text-neutral-400 hover:text-red-500"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="btn-tactile bg-red-600 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700"
              >
                Connect API
              </Link>
            )}

            {/* Mobile Toggle */}
            <button
              className="md:hidden p-2 text-neutral-400 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-2 glass-card rounded-2xl border border-white/10 p-4 space-y-2 overflow-hidden shadow-2xl"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-neutral-300 font-bold"
              >
                <div className="flex items-center gap-3">
                  <link.icon size={18} />
                  {link.name}
                </div>
                <ChevronRight size={14} className="text-neutral-600" />
              </Link>
            ))}
            
            {tier !== "pro" && user && (
              <Link
                href="/upgrade"
                className="flex items-center justify-center gap-2 p-3 mt-4 rounded-xl bg-yellow-400 text-black font-black text-xs uppercase"
              >
                Upgrade to Pro Access
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}