"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Brain,
  Zap,
  MessageSquare,
  FileText,
  BarChart3,
  ArrowRight,
  Github,
  Shield,
  Cpu,
} from "lucide-react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    // Loop the typing animation every 8 seconds
    const interval = setInterval(() => {
      setAnimationKey((prev) => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen text-foreground overflow-hidden relative">

      {/* Subtle ambient blobs behind glass */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          style={{
            position: "absolute",
            top: "-15%",
            left: "-8%",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(60,80,200,0.12) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-15%",
            right: "-8%",
            width: "550px",
            height: "550px",
            background: "radial-gradient(circle, rgba(30,60,160,0.10) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass" style={{ borderBottom: "1px solid rgba(255,255,255,0.055)" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span
              style={{
                fontFamily: "var(--font-outfit), sans-serif",
                fontWeight: 700,
                fontSize: "1.05rem",
                letterSpacing: "-0.02em",
                color: "hsl(220 15% 92%)",
              }}
            >
              GuruCortex
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Demo", "Docs"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                style={{
                  fontFamily: "var(--font-outfit), sans-serif",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: "hsl(220 10% 52%)",
                  textDecoration: "none",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(220 80% 72%)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(220 10% 52%)")}
              >
                {link}
              </a>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-pill-primary"
            style={{ padding: "0.45rem 1.4rem", fontSize: "0.85rem" }}
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-36 pb-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >

            <h1
              style={{
                fontFamily: "var(--font-outfit), sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                color: "hsl(220 15% 92%)",
                marginBottom: "1.5rem",
              }}
            >
              Your Personal
              <br />
              <span style={{ color: "hsl(220 80% 72%)" }}>
                Knowledge OS
              </span>
            </h1>

            <p
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.75,
                color: "hsl(220 10% 55%)",
                maxWidth: "480px",
                marginBottom: "2.25rem",
              }}
            >
              100% local. Privacy-first. Designed to augment your thinking —
              no cloud dependency, no data leaving your machine.
            </p>

            <div style={{ display: "flex", gap: "0.9rem", flexWrap: "wrap" }}>
              <button
                onClick={() => router.push("/dashboard")}
                className="btn-pill-primary"
                style={{
                  height: "48px",
                  padding: "0 2rem",
                  fontSize: "0.95rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                Launch Dashboard
                <ArrowRight size={16} />
              </button>
              <button
                className="btn-pill-ghost"
                style={{
                  height: "48px",
                  padding: "0 1.75rem",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                }}
              >
                View Docs
              </button>
            </div>

            {/* Tags */}
            <div
              style={{
                marginTop: "2.5rem",
                display: "flex",
                gap: "1.5rem",
                flexWrap: "wrap",
              }}
            >
              {[
                { icon: <Github size={14} />, label: "Open Source" },
                { icon: <Zap size={14} />, label: "Local RAG" },
                { icon: <Shield size={14} />, label: "Privacy First" },
                { icon: <Cpu size={14} />, label: "Multimodal" },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: "hsl(220 10% 48%)",
                    fontSize: "0.8rem",
                    fontFamily: "var(--font-outfit), sans-serif",
                  }}
                >
                  {icon}
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Terminal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.15, ease: "easeOut" }}
            className="relative"
          >
            <div
              className="glass-card relative overflow-hidden"
              style={{ padding: "0" }}
            >
              {/* Terminal header */}
              <div
                style={{
                  padding: "0.75rem 1.25rem",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,100,100,0.5)" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,200,80,0.5)" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(80,200,100,0.5)" }} />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "hsl(220 10% 40%)" }}>
                  cortex — zsh
                </span>
              </div>

              {/* Terminal body */}
              <div key={animationKey} style={{ padding: "1.5rem 1.25rem", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem", lineHeight: "1.9" }}>
                <div style={{ display: "flex", gap: "0.6rem" }}>
                  <span style={{ color: "hsl(220 80% 72%)" }}>❯</span>
                  <span style={{ color: "hsl(220 15% 85%)" }}>
                    {"gurucortex init --mode=autonomous".split("").map((char, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.05, delay: index * 0.04 }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </span>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 1.6 }}
                  style={{ color: "hsl(220 10% 48%)", paddingLeft: "1.2rem" }}
                >
                  Initializing cognitive layer...
                </motion.div>

                <div style={{ paddingLeft: "1.2rem", borderLeft: "2px solid rgba(80,120,255,0.2)", margin: "0.6rem 0 0.6rem 0.6rem", paddingTop: "0.3rem", paddingBottom: "0.3rem" }}>
                  {[
                    "Loading LLM (Mistral-7B)",
                    "Connecting Vector Store",
                    "Mounting Local Filesystem",
                    "Starting RAG Pipeline",
                  ].map((line, i) => (
                    <motion.div 
                      key={line} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 2.2 + (i * 0.5) }}
                      style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "hsl(220 12% 72%)" }}
                    >
                      <span style={{ color: "#4ade80", fontSize: "0.75rem" }}>✔</span>
                      <span>{line}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.1, delay: 4.4 }}
                  style={{ display: "flex", gap: "0.6rem", paddingTop: "0.3rem" }}
                >
                  <span style={{ color: "hsl(220 80% 72%)" }}>❯</span>
                  <span
                    style={{ color: "hsl(220 15% 85%)", animation: "pulse 1.2s infinite" }}
                  >
                    _
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="glass-card"
              style={{
                position: "absolute",
                right: "-1.5rem",
                bottom: "-1.5rem",
                padding: "0.75rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(80,210,140,0.12)",
                  border: "1px solid rgba(80,210,140,0.2)",
                  borderRadius: "0",
                }}
              >
                <Brain size={16} style={{ color: "#4ade80" }} />
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", color: "hsl(220 10% 45%)", fontFamily: "'JetBrains Mono', monospace" }}>
                  Memory
                </div>
                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "hsl(220 15% 88%)", fontFamily: "var(--font-outfit), sans-serif" }}>
                  Optimized
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-28 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section label */}
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span className="section-label">Capabilities</span>
            <h2
              style={{
                fontFamily: "var(--font-outfit), sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                letterSpacing: "-0.025em",
                color: "hsl(220 15% 92%)",
                marginTop: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              Architecture of Intelligence
            </h2>
            <p style={{ color: "hsl(220 10% 50%)", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
              Built on local-first principles — the power of cloud AI with the privacy of an air-gapped machine.
            </p>
          </div>

          <div className="grid md:grid-cols-3" style={{ gap: "1.25rem" }}>
            <FeatureCard
              icon={<MessageSquare size={20} style={{ color: "hsl(220 80% 72%)" }} />}
              title="Natural RAG"
              description="Chat with your documents using advanced Retrieval-Augmented Generation. No hallucinations."
              index={0}
            />
            <FeatureCard
              icon={<FileText size={20} style={{ color: "hsl(220 80% 72%)" }} />}
              title="Document Insights"
              description="Extract summaries, key topics, and actionable insights from PDFs, Docs, and more."
              index={1}
            />
            <FeatureCard
              icon={<BarChart3 size={20} style={{ color: "hsl(220 80% 72%)" }} />}
              title="Cognitive Analytics"
              description="Track your learning progress and knowledge retention with deep session analytics."
              index={2}
            />
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="divider mx-6" />

      {/* Footer */}
      <footer style={{ padding: "2.5rem 1.5rem", position: "relative", zIndex: 10 }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span style={{ fontSize: "0.78rem", color: "hsl(220 10% 38%)", fontFamily: "var(--font-outfit), sans-serif" }}>
            © 2026 gurucortex. Built for the local-first era.
          </span>
          <div style={{ display: "flex", gap: "1.25rem" }}>
            <a
              href="#"
              style={{ color: "hsl(220 10% 40%)", transition: "color 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(220 80% 72%)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(220 10% 40%)")}
            >
              <Github size={18} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.1 }}
      style={{
        background: "rgba(10, 11, 22, 0.70)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        cursor: "default",
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
      whileHover={{ backgroundColor: "rgba(16, 18, 34, 0.88)" }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(80,120,255,0.1)",
          border: "1px solid rgba(80,120,255,0.18)",
          borderRadius: "0",
        }}
      >
        {icon}
      </div>
      <div>
        <h3
          style={{
            fontFamily: "var(--font-outfit), sans-serif",
            fontWeight: 600,
            fontSize: "1rem",
            color: "hsl(220 15% 90%)",
            marginBottom: "0.4rem",
            letterSpacing: "-0.015em",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: "0.85rem",
            color: "hsl(220 10% 52%)",
            lineHeight: 1.7,
            fontFamily: "var(--font-outfit), sans-serif",
          }}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
}

