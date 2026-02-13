'use client';

import { useRef, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

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
    if (isActive) {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => stopWebcam();
  }, [isActive]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Start analyzing frames every 2 seconds
      intervalRef.current = setInterval(analyzeFrame, 2000);
      setError(null);
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions.');
      setIsActive(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current &&  videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setMetrics(null);
  };

  const analyzeFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Draw video frame to canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Convert canvas to base64
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);

    try {
      // Send to backend for analysis
      const response = await fetch('http://localhost:8000/multimodal/analyze-attention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: imageBase64 })
      });

      const data = await response.json();
      setMetrics(data);

    } catch (err) {
      console.error('Attention analysis failed:', err);
    }
  };

  const getAttentionColor = () => {
    if (!metrics || !metrics.face_detected) return 'bg-gray-400';
    if (metrics.attention_level === 'high') return 'bg-green-500';
    if (metrics.attention_level === 'medium') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Attention Monitor</h3>
        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isActive
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
        >
          {isActive ? 'Stop' : 'Start'} Monitoring
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isActive && (
        <div className="space-y-4">
          {/* Video Preview */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-auto"
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Status Indicator */}
            {metrics && (
              <div className={`absolute top-2 right-2 w-4 h-4 rounded-full ${getAttentionColor()}`} />
            )}
          </div>

          {/* Metrics Display */}
          {metrics && metrics.face_detected && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-600">Blink Rate</div>
                <div className="text-lg font-semibold">
                  {metrics.blink_rate} /min
                </div>
                {metrics.is_fatigued && (
                  <div className="text-xs text-red-600 mt-1">Fatigue detected</div>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-600">Attention</div>
                <div className="text-lg font-semibold capitalize">
                  {metrics.attention_level}
                </div>
                {!metrics.looking_at_screen && (
                  <div className="text-xs text-yellow-600 mt-1">Look at screen</div>
                )}
              </div>
            </div>
          )}

          {/* Intervention Alert */}
          {metrics && metrics.intervention_needed && metrics.intervention_message && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <div className="font-medium">Suggestion:</div>
              <div className="text-sm mt-1">{metrics.intervention_message}</div>
            </div>
          )}

          {!metrics?.face_detected && isActive && (
            <div className="text-center text-gray-500 py-8">
              Analyzing... Please face the camera
            </div>
          )}
        </div>
      )}

      {!isActive && (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">👁️</div>
          <div>Click Start to monitor your attention levels</div>
          <div className="text-sm mt-2">Uses your webcam to detect fatigue and focus</div>
        </div>
      )}
    </div>
  );
}
