'use client';

import { useEffect, useRef, useState } from 'react';

export default function GlobalFocusTracker() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const focusFailCountRef = useRef(0);
  const MAX_FAIL_COUNT = 5; // Need 5 consecutive frames of focus loss (5 seconds) to trigger

  useEffect(() => {
    console.log('[GlobalFocusTracker] Component mounted, initializing...');
    startWebcam();
    return () => stopWebcam();
  }, []);

  const startWebcam = async () => {
    try {
      console.log('[GlobalFocusTracker] Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        console.log('[GlobalFocusTracker] Camera started successfully');
        setDebugInfo('Camera active, analyzing...');
      }
      intervalRef.current = setInterval(analyzeFrame, 1000); // Analyze every 1 second instead of 2
    } catch (error) {
      console.warn('[GlobalFocusTracker] Camera access denied:', error);
      setDebugInfo('Camera access denied');
    }
  };

  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const analyzeFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.5); // lower quality for faster tracking
    
    try {
      console.log('[GlobalFocusTracker] Sending frame to backend...');
      const response = await fetch('http://localhost:8000/multimodal/analyze-attention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: imageBase64 })
      });

      if (!response.ok) {
        console.error('[GlobalFocusTracker] Backend error:', response.status, response.statusText);
        setDebugInfo(`Backend error: ${response.status}`);
        return;
      }

      const metrics = await response.json();
      console.log('[GlobalFocusTracker] Received metrics:', metrics);

      // Detection logic:
      // - If face is detected AND looking at screen → focused (reset counter)
      // - If face NOT detected OR looking_at_screen is false → focus loss (increment counter)
      const faceDetected = metrics?.face_detected === true;
      const lookingAtScreen = metrics?.looking_at_screen === true;
      const hasGoodAttention = metrics?.attention_level === 'high' || metrics?.attention_level === 'medium';
      
      // Focused: face present + looking at screen + good attention
      const isFocused = faceDetected && lookingAtScreen && hasGoodAttention;
      
      // Focus loss: either face not detected (blocked/turned) OR not looking at screen
      // Even if face_detected:false with looking_at_screen:false, should count as focus loss
      const focusLoss = !lookingAtScreen;
      
      if (focusLoss) {
        focusFailCountRef.current++;
        console.log(`[GlobalFocusTracker] Focus loss (${focusFailCountRef.current}/${MAX_FAIL_COUNT})`);
      } else if (isFocused) {
        // Reset counter if they're focused
        focusFailCountRef.current = 0;
        console.log('[GlobalFocusTracker] Focus restored - counter reset');
      }
      // If neither (shouldn't happen), counter stays same

      // Only show popup after sustained focus loss
      // Popup shows if counter reached max, regardless of whether face is detected
      if (focusFailCountRef.current >= MAX_FAIL_COUNT) {
        setShowPopup(true);
        setDebugInfo('⚠️ Keep Focus!');
      } else {
        setShowPopup(false);
        if (isFocused) {
          setDebugInfo(`✓ Focused - ${metrics?.attention_level}`);
        } else if (focusLoss) {
          setDebugInfo(`Looking away (${focusFailCountRef.current}/${MAX_FAIL_COUNT})`);
        } else if (faceDetected) {
          setDebugInfo('Analyzing...');
        } else {
          setDebugInfo('Detecting face...');
        }
      }
    } catch (error) {
      console.error('[GlobalFocusTracker] Error analyzing frame:', error);
      setDebugInfo(`Error: ${error instanceof Error ? error.message : 'unknown'}`);
    }
  };

  return (
    <>
      {/* Hidden elements for tracking */}
      <video ref={videoRef} style={{ display: 'none' }} autoPlay playsInline muted />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Keep Focus Pop-up */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <div style={{
            fontSize: '5rem',
            marginBottom: '1rem',
            animation: 'pulse 1s infinite'
          }}>👁️</div>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            letterSpacing: '0.1em',
            color: '#f87171',
            textShadow: '0 0 20px rgba(248, 113, 113, 0.5)',
            textTransform: 'uppercase'
          }}>
            Keep Focus
          </h1>
          <p style={{
            marginTop: '1rem',
            fontSize: '1.2rem',
            color: '#94a3b8'
          }}>
            Please look at the screen to continue
          </p>

          <style>{`
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.8; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* Debug info - small indicator in top right corner */}
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 5000,
        padding: '0.5rem 1rem',
        background: 'rgba(0,0,0,0.7)',
        color: '#94a3b8',
        fontSize: '0.75rem',
        borderRadius: '4px',
        fontFamily: "'JetBrains Mono', monospace",
        maxWidth: '200px',
        textAlign: 'right'
      }}>
        👁️ Focus Tracker: {debugInfo || 'initializing...'}
      </div>
    </>
  );
}