'use client';

import { useState, useRef } from 'react';
import api from '@/lib/api-client';

interface Segment {
  speaker: string;
  text: string;
}

interface PodcastScript {
  title: string;
  speakers: string[];
  segments: Segment[];
  duration_estimate: string;
  style: string;
  segment_count: number;
}

export default function PodcastPlayer() {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('short');
  const [style, setStyle] = useState('educational');
  const [script, setScript] = useState<PodcastScript | null>(null);
  const [generating, setGenerating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const playingRef = useRef(false);

  const generateScript = async () => {
    setGenerating(true);
    setError(null);
    setScript(null);
    try {
      const result = await api.generatePodcastScript(
        topic || undefined,
        duration,
        style
      );
      setScript(result);
      setCurrentSegment(0);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate podcast script');
    } finally {
      setGenerating(false);
    }
  };

  const speak = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        console.warn('⚠️ Speech synthesis not supported');
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;  // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;  // Ensure full volume
      
      utterance.onstart = () => {
        console.log('🎵 Audio segment started');
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        console.log('✅ Audio segment completed');
        setIsSpeaking(false);
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error('❌ Speech synthesis error:', event.error);
        setIsSpeaking(false);
        resolve(); // Continue with next segment even if one fails
      };
      
      // Clear any existing speech before starting new
      window.speechSynthesis.cancel();
      
      // Small delay to ensure cancel completed
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    });
  };

  const playAll = async () => {
    if (!script || playing) return;
    
    // Check if audio is supported
    if (!window.speechSynthesis) {
      alert('❌ Audio playback not supported in this browser. Please try Chrome, Firefox, or Safari.');
      return;
    }
    
    setPlaying(true);
    playingRef.current = true;
    console.log('🎵 Starting podcast playback with', script.segments.length, 'segments');
    
    try {
      for (let i = 0; i < script.segments.length && playingRef.current; i++) {
        console.log(`📻 Playing segment ${i + 1}/${script.segments.length}`);
        setCurrentSegment(i);
        await speak(script.segments[i].text);
        
        // Small pause between segments for better listening experience
        if (playingRef.current && i < script.segments.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
      
      if (playingRef.current) {
        console.log('✅ Podcast playback completed successfully');
      } else {
        console.log('🛑 Podcast playback stopped by user');
      }
    } catch (error) {
      console.error('❌ Podcast playback error:', error);
      alert('Audio playback failed. Please try again.');
    }

    setPlaying(false);
    playingRef.current = false;
    setCurrentSegment(-1);
  };

  const stopPlayback = () => {
    console.log('🛑 Stopping podcast playback...');
    playingRef.current = false;
    setPlaying(false);
    setCurrentSegment(-1);
    setIsSpeaking(false);
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">Audio Learning</h2>
          <p className="text-sm leading-relaxed text-[#A1A1AA] font-normal">AI-generated podcast conversations</p>
        </div>
        <span className="px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/30">
          PODCAST MODE
        </span>
      </div>

      {/* Generation Form */}
      {!script && (
        <div className="gc-card p-8 space-y-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center text-4xl">
              🎙️
            </div>
            <p className="text-slate-300 font-body text-base max-w-xl mx-auto leading-relaxed">
              Generate a podcast-style conversation from your study materials. Two AI speakers will discuss the topics in an engaging format.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-mono font-semibold text-slate-300">
              Topic (leave empty for auto-detect from documents)
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g., Quantum Computing, Machine Learning..."
              className="w-full px-4 py-3 bg-[rgb(var(--bg-elevated))] border border-white/10 rounded-lg text-white placeholder-slate-500 font-body text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-mono font-semibold text-slate-300">Duration</label>
              <select
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full px-4 py-3 bg-[rgb(var(--bg-elevated))] border border-white/10 rounded-lg text-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
              >
                <option value="short">Short (2-3 min)</option>
                <option value="medium">Medium (5 min)</option>
                <option value="long">Long (10 min)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-mono font-semibold text-slate-300">Style</label>
              <select
                value={style}
                onChange={e => setStyle(e.target.value)}
                className="w-full px-4 py-3 bg-[rgb(var(--bg-elevated))] border border-white/10 rounded-lg text-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
              >
                <option value="educational">Educational</option>
                <option value="debate">Debate</option>
                <option value="casual">Casual Chat</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateScript}
            disabled={generating}
            className="gc-btn-primary w-full py-4 text-base font-semibold flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Podcast...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3-3z" />
                </svg>
                Generate Podcast
              </>
            )}
          </button>

          {error && (
            <div className="gc-card p-4 border-l-4 border-l-red-500 bg-red-500/10">
              <p className="text-sm text-red-400 font-body">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Player */}
      {script && (
        <>
          <div className="gc-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-display font-semibold tracking-tight text-white">{script.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  {script.speakers.join(' & ')} · {script.duration_estimate} · {script.style}
                </p>
              </div>
              <div className="flex gap-2">
                {!playing ? (
                  <button
                    onClick={playAll}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    Play All
                  </button>
                ) : (
                  <button
                    onClick={stopPlayback}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                    Stop
                  </button>
                )}
                <button
                  onClick={() => { setScript(null); stopPlayback(); }}
                  className="gc-btn-secondary px-4"
                >
                  New
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[rgb(var(--bg-elevated))] rounded-full h-2 mb-6">
              <div
                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentSegment + 1) / script.segments.length) * 100}%` }}
              />
            </div>

            {/* Transcript */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {script.segments.map((seg, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border transition-all ${
                    idx === currentSegment && playing
                      ? 'bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30 scale-[1.02]'
                      : 'bg-[rgb(var(--bg-elevated))] border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">{seg.speaker}</span>
                    {idx === currentSegment && isSpeaking && (
                      <span className="flex gap-0.5">
                        <span className="w-1 h-3 bg-cyan-500 rounded-full animate-pulse"></span>
                        <span className="w-1 h-4 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-1 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 font-body leading-relaxed">{seg.text}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
