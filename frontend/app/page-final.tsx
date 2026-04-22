"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Brain,
  BookOpen,
  Users,
  Award,
  Target,
  Lightbulb,
  ArrowRight,
  Github,
  Twitter,
  Play,
  Code,
  Menu,
  X,
  ExternalLink,
  FileText,
  BarChart3,
  MessageCircle,
  Zap,
  Eye,
  Headphones,
  CheckCircle,
  Star,
  TrendingUp
} from "lucide-react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  if (!mounted) return null;

  const educationalFeatures = [
    {
      icon: <Brain className="text-blue-400" size={32} />,
      title: "AI-Powered Learning",
      description: "Personalized study paths that adapt to your learning style and pace with real-time feedback.",
      color: "from-blue-500/10 to-blue-600/5"
    },
    {
      icon: <Eye className="text-green-400" size={32} />,
      title: "Focus Monitoring",
      description: "Real-time attention tracking to optimize study sessions and prevent fatigue.",
      color: "from-green-500/10 to-green-600/5"
    },
    {
      icon: <FileText className="text-purple-400" size={32} />,
      title: "Document Intelligence",
      description: "Upload PDFs, docs, and materials. AI extracts key concepts and creates interactive content.",
      color: "from-purple-500/10 to-purple-600/5"
    },
    {
      icon: <Award className="text-amber-400" size={32} />,
      title: "Adaptive Quizzes",
      description: "Smart quizzes that adapt difficulty based on your understanding and retention.",
      color: "from-amber-500/10 to-amber-600/5"
    },
    {
      icon: <Headphones className="text-teal-400" size={32} />,
      title: "Audio Learning",
      description: "Convert documents to podcasts and audio summaries for multi-modal learning.",
      color: "from-teal-500/10 to-teal-600/5"
    },
    {
      icon: <TrendingUp className="text-rose-400" size={32} />,
      title: "Progress Analytics",
      description: "Detailed learning analytics and progress tracking to optimize your education journey.",
      color: "from-rose-500/10 to-rose-600/5"
    }
  ];

  const stats = [
    { value: "100%", label: "Local & Private", icon: <Target className="text-blue-400" /> },
    { value: "AI-Powered", label: "Personalized Learning", icon: <Brain className="text-green-400" /> },
    { value: "Real-time", label: "Focus Monitoring", icon: <Eye className="text-purple-400" /> },
    { value: "Multi-modal", label: "Learning Experience", icon: <Lightbulb className="text-amber-400" /> }
  ];

  return (
    <div className="min-h-screen edu-gradient-bg text-white overflow-hidden selection:bg-blue-500/20">

      {/* Educational Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Academic Grid Pattern */}
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59,130,246,0.1) 1px, transparent 0)`,
               backgroundSize: '60px 60px'
             }}>
        </div>
        
        {/* Floating Academic Elements */}
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 opacity-5"
        >
          <GraduationCap size={120} className="text-blue-400" />
        </motion.div>
        
        <motion.div 
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, -3, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-40 right-32 opacity-5"
        >
          <Brain size={80} className="text-purple-400" />
        </motion.div>
        
        <motion.div 
          animate={{ 
            y: [0, -25, 0],
            rotate: [0, 8, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute bottom-40 left-32 opacity-5"
        >
          <BookOpen size={100} className="text-green-400" />
        </motion.div>
      </div>

      {/* Educational Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-700/30 bg-slate-900/90 backdrop-blur-xl"> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl edu-gradient-accent flex items-center justify-center text-white shadow-lg">
              <GraduationCap size={24} strokeWidth={2.5} className="sm:w-[28px] sm:h-[28px]" />
            </div>
            <span className="font-bold text-xl sm:text-2xl tracking-tight text-high-contrast">
              GuruCortex
              <span className="text-sm font-normal text-blue-400 block leading-none">Learning OS</span>
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="edu-nav-item">Features</a>
            <a href="#demo" className="edu-nav-item">Live Demo</a>
            <a href="#docs" className="edu-nav-item">Documentation</a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white transition-colors bg-slate-800/50 rounded-lg edu-focus"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Desktop Launch Button */}
          <button 
            onClick={() => router.push('/dashboard')} 
            className="hidden md:flex edu-button-primary"
          >
            Start Learning
            <ExternalLink size={16} className="ml-2" />
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/30 px-4 py-6"
          >
            <div className="flex flex-col gap-6">
              <a 
                href="#features" 
                className="text-slate-300 hover:text-white transition-colors py-2 text-lg font-medium" 
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#demo" 
                className="text-slate-300 hover:text-white transition-colors py-2 text-lg font-medium" 
                onClick={() => setIsMenuOpen(false)}
              >
                Live Demo
              </a>
              <a 
                href="#docs" 
                className="text-slate-300 hover:text-white transition-colors py-2 text-lg font-medium" 
                onClick={() => setIsMenuOpen(false)}
              >
                Documentation
              </a>
              <button 
                onClick={() => {
                  router.push('/dashboard');
                  setIsMenuOpen(false);
                }}
                className="edu-button-primary mt-4"
              >
                Start Learning
                <ExternalLink size={18} className="ml-2" />
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section - Educational Theme */}
      <main className="relative z-10 pt-24 sm:pt-32 lg:pt-40 pb-16 sm:pb-24 lg:pb-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-6 sm:space-y-8 lg:space-y-12"
          >
            {/* Education Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium backdrop-blur-sm">
              <GraduationCap size={16} />
              <span className="font-semibold">Next-Generation Learning Platform</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-high-contrast leading-[1.1]">
              Master Learning with 
              <span className="block edu-text-accent mt-2">
                AI-Powered Education
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-200 max-w-4xl mx-auto leading-relaxed">
              Transform your study experience with personalized AI tutoring, real-time focus monitoring, 
              and adaptive learning paths. <span className="text-white font-semibold">100% local and private.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <button 
                onClick={() => router.push('/dashboard')} 
                className="edu-button-primary text-lg px-8 py-4"
              >
                <GraduationCap size={20} className="mr-2" />
                Start Learning Now
              </button>
              <a 
                href="#demo"
                className="edu-button-secondary text-lg px-8 py-4 inline-flex items-center justify-center"
              >
                <Play size={18} className="mr-2" />
                Watch Demo
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 pt-12 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Educational Features Section */}
      <section id="features" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-medium mb-6 border border-green-500/20">
                <Lightbulb size={14} />
                Intelligent Features
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Revolutionary Learning Experience
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Cutting-edge AI technology meets educational excellence to create your personalized learning companion.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {educationalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`edu-card p-6 lg:p-8 bg-gradient-to-br ${feature.color}`}
              >
                <div className="mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Section - Enhanced for Education */}
      <section id="demo" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 relative z-10 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium mb-6 border border-purple-500/20">
              <Play size={14} />
              See It In Action
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Experience GuruCortex Live
            </h2>
            <p className="text-xl text-slate-300">
              Watch how our AI learning companion transforms traditional studying into an engaging, 
              personalized educational experience.
            </p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto max-w-6xl"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden edu-card bg-slate-900/50">
              <video 
                ref={videoRef}
                muted
                loop
                playsInline
                controls
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover z-10 transition-all duration-500 edu-focus"
                src="/0405.mp4"
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
              >
                <source src="/0405.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {!isVideoPlaying && (
                <div 
                  onClick={handleVideoPlay}
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 bg-slate-900/60 hover:bg-slate-900/40"
                >
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-blue-600/30 backdrop-blur-md rounded-full flex items-center justify-center relative shadow-2xl border border-blue-400/30 hover:scale-110 transition-transform duration-300">
                    <Play size={40} className="fill-white text-white ml-2 relative z-10" />
                  </div>
                  <span className="mt-6 text-white font-semibold text-lg bg-slate-900/70 px-6 py-3 rounded-xl backdrop-blur-md border border-slate-700/50">
                    Watch Learning Demo
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Educational Theme */}
      <footer className="border-t border-slate-700/30 py-12 px-4 sm:px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <GraduationCap size={24} className="text-blue-400" />
              <span className="text-lg font-semibold text-white">
                GuruCortex Learning OS
              </span>
            </div>
            <div className="text-sm text-slate-400 text-center sm:text-left">
              © 2026 GuruCortex Team. Empowering learners worldwide.
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="text-slate-400 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-slate-800/50" 
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a 
                href="#" 
                className="text-slate-400 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-slate-800/50"
                aria-label="Twitter" 
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}