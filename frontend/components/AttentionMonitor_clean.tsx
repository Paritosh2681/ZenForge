'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader2, Camera } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface AttentionMetrics {
  face_detected: boolean;
  blink_rate: number;
  is_fatigued: boolean;
  looking_at_screen: boolean;
  attention_level: 'high' | 'medium' | 'low';
  intervention_needed: boolean;
  intervention_message?: string;
  fallback?: boolean;
}

export default function AttentionMonitor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAnalyzingRef = useRef(false);
  const [isActive, setIsActive] = useState(false);
  const [metrics, setMetrics] = useState<AttentionMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBackendReachable, setIsBackendReachable] = useState<boolean | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);

  // Check if backend is running
  const checkBackend = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      setIsBackendReachable(response.ok);
      return response.ok;
    } catch (err) {
      console.error('Backend health check failed:', err);
      setIsBackendReachable(false);
      return false;
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    isAnalyzingRef.current = false;
    setMetrics(null);
  }, []);

  const analyzeFrame = useCallback(async () => {
    // Prevent overlapping analysis calls
    if (isAnalyzingRef.current || !videoRef.current || !canvasRef.current) {
      return;
    }

    isAnalyzingRef.current = true;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
        isAnalyzingRef.current = false;
        return;
      }

      // Draw video frame to canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Convert canvas to base64 with optimized quality
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.6);

      // Send to backend for analysis with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_BASE_URL}/multimodal/analyze-attention`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: imageBase64 }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Backend error (${response.status})`);
      }

      const data = await response.json();
      
      // Successfully got data from backend
      setMetrics(data);
      setError(null);
      setIsBackendReachable(true);

    } catch (err) {
      console.error('Attention analysis failed:', err);
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Analysis timeout. Backend may be slow. Retrying...');
        } else if (err.message.includes('fetch')) {
          setError('Cannot connect to backend. Please ensure the backend server is running on ' + API_BASE_URL);
          setIsBackendReachable(false);
        } else {
          setError(err.message || 'Analysis failed');
        }
      }
      // Don't set metrics to null on error - keep showing last known state
    } finally {
      isAnalyzingRef.current = false;
    }
  }, []);

  const startWebcam = useCallback(async () => {
    try {
      // First check if backend is reachable
      const backendOk = await checkBackend();
      if (!backendOk) {
        setError(`Backend server is not running. Please start it at ${API_BASE_URL}`);
        setIsActive(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraPermission(true);

      // Start analyzing frames every 3 seconds
      intervalRef.current = setInterval(analyzeFrame, 3000);
      
      // Do first analysis immediately
      setTimeout(analyzeFrame, 500);
      
      setError(null);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraPermission(false);
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions in your browser settings.');
      } else if (err instanceof Error && err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera device.');
      } else {
        setError('Failed to access camera: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
      setIsActive(false);
    }
  }, [analyzeFrame, checkBackend]);

  useEffect(() => {
    if (isActive) {
      startWebcam();
    } else {
      stopWebcam();
    }

    return stopWebcam;
  }, [isActive, startWebcam, stopWebcam]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  // Initial backend check on mount
  useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  const getAttentionColor = () => {
    if (!metrics || !metrics.face_detected) return 'bg-gray-400 dark:bg-gray-600';
    if (metrics.attention_level === 'high') return 'bg-emerald-500';
    if (metrics.attention_level === 'medium') return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getAttentionEmoji = () => {
    if (!metrics || !metrics.face_detected) return '👤';
    if (metrics.attention_level === 'high') return '😊';
    if (metrics.attention_level === 'medium') return '😐';
    return '😴';
  };

  const getStatusMessage = () => {
    if (!isActive) return 'Click "Start Monitoring" to begin';
    if (error) return error;
    if (!metrics) return 'Initializing camera...';
    if (!metrics.face_detected) return 'No face detected. Please position yourself in front of the camera.';
    if (metrics.fallback) return 'Using simulated data (OpenCV not available on backend)';
    return 'Monitoring active';
  };

  return (
    <div className="h-full overflow-y-auto bg-[rgb(var(--bg-base))]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[rgb(var(--bg-elevated))] to-[rgb(var(--bg-surface))] border-b border-cyan-500/20 text-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2 text-white">Focus & Attention Monitor</h1>
          <p className="text-cyan-400 text-sm sm:text-base font-mono">Real-time attention tracking using AI-powered face analysis</p>
          
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <button
              onClick={() => setIsActive(!isActive)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-[0_0_15px_rgba(0,212,255,0.3)]'
              }`}
            >
              {isActive ? (
                <>
                  <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  Start Monitoring
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Error Display */}
        {error && (
          <div className="gc-card p-4 border-l-4 border-red-500">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
              <p className="text-red-400 font-mono text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Status Message */}
        {!error && (
          <div className="gc-card p-4 border-l-4 border-cyan-500">
            <div className="flex items-center gap-3">
              {!isActive ? (
                <Eye className="w-5 h-5 text-cyan-400" />
              ) : !metrics ? (
                <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5 text-cyan-400" />
              )}
              <span className="text-white font-mono text-sm">{getStatusMessage()}</span>
            </div>
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Camera Status */}
          <div className="gc-card p-4 flex items-center gap-3">
            <Camera className={`w-6 h-6 ${cameraPermission ? 'text-cyan-400' : 'text-red-400'}`} />
            <div>
              <div className="text-sm font-medium text-white">Camera</div>
              <div className={`text-xs font-mono ${
                cameraPermission === null ? 'text-amber-400' : 
                cameraPermission ? 'text-cyan-400' : 'text-red-400'
              }`}>
                {cameraPermission === null ? 'Not started' : 
                 cameraPermission ? 'Connected' : 'Permission denied'}
              </div>
            </div>
          </div>

          {/* Backend Status */}
          <div className="gc-card p-4 flex items-center gap-3">
            {isBackendReachable === true ? (
              <CheckCircle className="w-6 h-6 text-cyan-400" />
            ) : isBackendReachable === false ? (
              <AlertCircle className="w-6 h-6 text-red-400" />
            ) : (
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
            )}
            <div>
              <div className="text-sm font-medium text-white">Backend</div>
              <div className={`text-xs font-mono ${
                isBackendReachable === null ? 'text-amber-400' : 
                isBackendReachable ? 'text-cyan-400' : 'text-red-400'
              }`}>
                {isBackendReachable === null ? 'Checking...' : 
                 isBackendReachable ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </div>

          {/* Face Detection Status */}
          <div className="gc-card p-4 flex items-center gap-3">
            <Eye className={`w-6 h-6 ${
              !metrics || !metrics.face_detected ? 'text-gray-400' : 'text-cyan-400'
            }`} />
            <div>
              <div className="text-sm font-medium text-white">Face Detection</div>
              <div className={`text-xs font-mono ${
                !metrics || !metrics.face_detected ? 'text-gray-400' : 'text-cyan-400'
              }`}>
                {!metrics || !metrics.face_detected ? 'Inactive' : 'Active'}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Feed */}
          <div className="gc-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              Camera Feed
            </h3>
            <div className="relative bg-[rgb(var(--bg-surface))] rounded-lg overflow-hidden aspect-video">
              {!isActive ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <Camera className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <div className="text-white font-semibold">Camera Inactive</div>
                    <div className="text-slate-400 font-mono text-sm mt-1">Start monitoring to begin</div>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Overlay Indicator */}
                  <div className="absolute top-4 right-4">
                    <div className={`px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 ${
                      metrics?.face_detected 
                        ? 'bg-cyan-500/80' 
                        : 'bg-slate-800/80'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        isAnalyzingRef.current ? 'bg-white animate-pulse' : 'bg-white/60'
                      }`} />
                      <span className="text-white text-xs font-medium font-mono">
                        {isAnalyzingRef.current ? 'Analyzing...' : 'Live'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Metrics Panel */}
          <div className="space-y-4">
            {/* Attention Level */}
            <div className="gc-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-400" />
                Attention Level
              </h3>
              {metrics && metrics.face_detected ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{getAttentionEmoji()}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold font-mono ${
                      metrics.attention_level === 'high' ? 'bg-green-500/20 text-green-400' :
                      metrics.attention_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {metrics.attention_level.toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{metrics.blink_rate.toFixed(1)}</div>
                      <div className="text-xs text-slate-400 font-mono">Blink Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {metrics.looking_at_screen ? '✓' : '✗'}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">Looking at Screen</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-slate-500 text-4xl mb-3">👤</div>
                  <div className="text-slate-400 font-mono text-sm">No face detected</div>
                </div>
              )}
            </div>

            {/* Intervention Panel */}
            {metrics?.intervention_needed && (
              <div className="gc-card p-6 border-l-4 border-amber-500 bg-amber-500/5">
                <h3 className="text-lg font-semibold text-amber-400 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Attention Alert
                </h3>
                <p className="text-slate-300 font-mono text-sm">
                  {metrics.intervention_message || 'Consider taking a short break to maintain focus.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions Panel */}
        <div className="lg:col-span-2 gc-card p-6 bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/30">
          <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            How it works:
          </h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span className="font-mono text-sm">AI analyzes your facial expressions and eye movements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span className="font-mono text-sm">Tracks blink rate to detect fatigue</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span className="font-mono text-sm">Monitors gaze direction for attention levels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span className="font-mono text-sm">Provides real-time feedback and suggestions</span>
            </li>
          </ul>
        </div>

        {/* Backend Status Warning */}
        {!isBackendReachable && (
          <div className="lg:col-span-2 gc-card p-6 border-l-4 border-red-500 bg-red-500/5">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-lg font-semibold text-red-400">Backend Server Required</h3>
                <p className="text-slate-300 font-mono text-sm mt-1">
                  Cannot connect to backend server. Please ensure the backend is running on http://localhost:8000
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}