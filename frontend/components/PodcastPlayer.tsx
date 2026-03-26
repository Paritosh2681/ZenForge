'use client';

import { useState } from 'react';
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

  const speakSegment = (text: string, speaker: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      // Use different voices for different speakers
      if (speaker === 'Expert' && voices.length > 1) {
        utterance.voice = voices[1];
        utterance.pitch = 0.9;
      } else {
        utterance.voice = voices[0];
        utterance.pitch = 1.1;
      }
      utterance.rate = 0.9;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const playAll = async () => {
    if (!script) return;
    setPlaying(true);

    for (let i = 0; i < script.segments.length; i++) {
      if (!playing && i > 0) break;
      setCurrentSegment(i);

      const seg = script.segments[i];
      await new Promise<void>((resolve) => {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(seg.text);
          const voices = window.speechSynthesis.getVoices();
          if (seg.speaker === 'Expert' && voices.length > 1) {
            utterance.voice = voices[1];
            utterance.pitch = 0.9;
          } else {
            utterance.voice = voices[0];
            utterance.pitch = 1.1;
          }
          utterance.rate = 0.9;
          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();
          window.speechSynthesis.speak(utterance);
        } else {
          setTimeout(resolve, 2000);
        }
      });
    }

    setPlaying(false);
  };

  const stopPlayback = () => {
    setPlaying(false);
    setIsSpeaking(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Audio Learning</h2>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">Podcast Mode</span>
      </div>

      {/* Generation Form */}
      {!script && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <p className="text-muted-foreground">Generate a podcast-style conversation from your study materials. Two AI speakers will discuss the topics in an engaging format.</p>

          <input
            type="text"
            placeholder="Topic (leave empty for auto-detect from documents)"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm"
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground block mb-1">Duration</label>
              <select value={duration} onChange={e => setDuration(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm">
                <option value="short">Short (2-3 min)</option>
                <option value="medium">Medium (5 min)</option>
                <option value="long">Long (10 min)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground block mb-1">Style</label>
              <select value={style} onChange={e => setStyle(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm">
                <option value="educational">Educational</option>
                <option value="debate">Debate</option>
                <option value="interview">Interview</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateScript}
            disabled={generating}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 font-medium transition-colors"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                Generating Podcast Script...
              </span>
            ) : (
              'Generate Podcast'
            )}
          </button>

          {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</div>}
        </div>
      )}

      {/* Script Display + Player */}
      {script && (
        <>
          {/* Player Controls */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold">{script.title}</div>
                <div className="text-xs text-muted-foreground">{script.segment_count} segments - {script.duration_estimate} - {script.style}</div>
              </div>
              <div className="flex gap-2">
                {!playing ? (
                  <button onClick={playAll} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                    &#9654; Play All
                  </button>
                ) : (
                  <button onClick={stopPlayback} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                    &#9632; Stop
                  </button>
                )}
                <button onClick={() => { setScript(null); stopPlayback(); }} className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm transition-colors">
                  New
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="w-full bg-secondary rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${((currentSegment + 1) / script.segments.length) * 100}%` }}></div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Segment {currentSegment + 1} of {script.segments.length}</div>
          </div>

          {/* Transcript */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {script.segments.map((seg, idx) => (
              <div
                key={idx}
                onClick={() => { setCurrentSegment(idx); speakSegment(seg.text, seg.speaker); }}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  idx === currentSegment
                    ? 'bg-primary/20 border border-primary/30 ring-1 ring-primary/20'
                    : 'bg-card border border-border hover:bg-secondary/50'
                } ${idx < currentSegment ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    seg.speaker === 'Host'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {seg.speaker}
                  </span>
                  {idx === currentSegment && isSpeaking && (
                    <span className="flex gap-0.5">
                      <span className="w-1 h-3 bg-primary rounded-full animate-pulse"></span>
                      <span className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></span>
                      <span className="w-1 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                    </span>
                  )}
                </div>
                <p className="text-sm">{seg.text}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
