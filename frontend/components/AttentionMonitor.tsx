'use client';

import { useRef, useEffect, useState } from 'react';

interface AttentionMetrics {
  face_detected: boolean;
  blink_rate: number;
  is_fatigued: boolean;
  looking_at_screen: boolean;
  attention_level: 'high' | 'medium' | 'low';
  intervention_needed: boolean;
  intervention_message?: string;
}

export default function AttentionMonitor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [metrics, setMetrics] = useState<AttentionMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) startWebcam();
    else stopWebcam();
    return () => stopWebcam();
  }, [isActive]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      intervalRef.current = setInterval(analyzeFrame, 2000);
      setError(null);
    } catch {
      setError('Camera access denied. Please enable camera permissions.');
      setIsActive(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setMetrics(null);
  };

  const analyzeFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
    try {
      const response = await fetch('http://localhost:8000/multimodal/analyze-attention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: imageBase64 })
      });
      setMetrics(await response.json());
    } catch { /* silent */ }
  };

  const attentionColor = () => {
    if (!metrics?.face_detected) return 'hsl(220 10% 40%)';
    if (metrics.attention_level === 'high') return '#4ade80';
    if (metrics.attention_level === 'medium') return '#facc15';
    return '#f87171';
  };

  return (
    <div
      style={{
        background: 'rgba(8,9,18,0.65)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: '1.25rem',
        fontFamily: "var(--font-outfit), system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'hsl(220 10% 38%)', fontFamily: "'JetBrains Mono', monospace" }}>
            Biometric
          </span>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'hsl(220 15% 88%)', letterSpacing: '-0.015em' }}>
            Attention Monitor
          </div>
        </div>
        <button
          onClick={() => setIsActive(!isActive)}
          style={{
            padding: '0.4rem 1.1rem',
            background: isActive ? 'rgba(255,80,80,0.15)' : 'rgba(80,120,255,0.15)',
            border: `1px solid ${isActive ? 'rgba(255,80,80,0.3)' : 'rgba(80,120,255,0.3)'}`,
            color: isActive ? '#f87171' : 'hsl(220 80% 72%)',
            fontSize: '0.82rem',
            fontWeight: 600,
            fontFamily: "var(--font-outfit), sans-serif",
            cursor: 'pointer',
            borderRadius: '9999px',
            transition: 'all 0.15s ease',
          }}
        >
          {isActive ? 'Stop' : 'Start'} Monitoring
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.15)', color: 'hsl(0 60% 65%)', fontSize: '0.82rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Idle state */}
      {!isActive && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👁</div>
          <div style={{ color: 'hsl(220 15% 72%)', fontSize: '0.88rem', fontWeight: 500 }}>Click Start to monitor your attention</div>
          <div style={{ color: 'hsl(220 10% 42%)', fontSize: '0.78rem', marginTop: '0.3rem' }}>Uses your webcam to detect fatigue and focus levels</div>
        </div>
      )}

      {/* Active state */}
      {isActive && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Video */}
          <div style={{ position: 'relative', background: '#000', overflow: 'hidden' }}>
            <video ref={videoRef} style={{ width: '100%', height: 'auto', display: 'block' }} autoPlay playsInline muted />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {metrics && (
              <div style={{
                position: 'absolute', top: 8, right: 8,
                width: 12, height: 12, borderRadius: '50%',
                background: attentionColor(),
                boxShadow: `0 0 8px ${attentionColor()}`,
              }} />
            )}
          </div>

          {/* Metrics grid */}
          {metrics?.face_detected && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {[
                { label: 'Blink Rate', value: `${metrics.blink_rate}/min`, sub: metrics.is_fatigued ? 'Fatigue detected' : null, subColor: '#f87171' },
                { label: 'Attention', value: metrics.attention_level, sub: !metrics.looking_at_screen ? 'Look at screen' : null, subColor: '#facc15' },
              ].map(({ label, value, sub, subColor }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'hsl(220 10% 40%)', fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'hsl(220 15% 85%)', marginTop: '0.25rem', textTransform: 'capitalize' }}>{value}</div>
                  {sub && <div style={{ fontSize: '0.7rem', color: subColor, marginTop: '0.2rem' }}>{sub}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Intervention alert */}
          {metrics?.intervention_needed && metrics.intervention_message && (
            <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(250,200,80,0.08)', border: '1px solid rgba(250,200,80,0.18)', fontSize: '0.82rem' }}>
              <div style={{ color: '#facc15', fontWeight: 600, marginBottom: '0.2rem' }}>Suggestion</div>
              <div style={{ color: 'hsl(220 10% 60%)' }}>{metrics.intervention_message}</div>
            </div>
          )}

          {/* Analyzing */}
          {!metrics?.face_detected && (
            <div style={{ textAlign: 'center', color: 'hsl(220 10% 45%)', fontSize: '0.82rem', padding: '1rem', fontFamily: "'JetBrains Mono', monospace" }}>
              Analyzing... Please face the camera
            </div>
          )}
        </div>
      )}
    </div>
  );
}

