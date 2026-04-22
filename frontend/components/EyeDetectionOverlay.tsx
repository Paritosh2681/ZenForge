'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Eye, AlertTriangle } from 'lucide-react';

// ─── Head-turn detector using MediaPipe FaceLandmarker ───
// Uses 478 3D facial landmarks to compute head yaw accurately.
// When the user turns their head left or right → "Focus, focus!"

interface FocusWarning {
  id: number;
  direction: 'left' | 'right';
  timestamp: number;
}

export default function EyeDetectionOverlay() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const faceLandmarkerRef = useRef<any>(null);
  const consecutiveDistractedRef = useRef(0);

  const isRunningRef = useRef(false);


  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const [currentDirection, setCurrentDirection] = useState<'center' | 'left' | 'right'>('center');
  const [showPopup, setShowPopup] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);


  // Thresholds — tuned for real-world usage
  const YAW_THRESHOLD = 18; // degrees of head turn before triggering
  const CONSECUTIVE_FRAMES_THRESHOLD = 12; // ~1.2 seconds of sustained distraction at 10fps


  // ─── Initialize MediaPipe FaceLandmarker ───
  const initFaceLandmarker = useCallback(async () => {
    setIsModelLoading(true);
    try {
      const vision = await import('@mediapipe/tasks-vision');
      const { FaceLandmarker, FilesetResolver } = vision;

      // Load the WASM runtime
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      // Create FaceLandmarker with the face mesh model
      const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: true, // gives us the rotation matrix!
      });

      faceLandmarkerRef.current = landmarker;
      console.log('[EyeDetection] MediaPipe FaceLandmarker initialized');
      setIsModelLoading(false);
      return true;
    } catch (err) {
      console.error('[EyeDetection] Failed to init FaceLandmarker:', err);
      // Try again with CPU delegate
      try {
        const vision = await import('@mediapipe/tasks-vision');
        const { FaceLandmarker, FilesetResolver } = vision;

        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: true,
        });

        faceLandmarkerRef.current = landmarker;
        console.log('[EyeDetection] FaceLandmarker initialized (CPU fallback)');
        setIsModelLoading(false);
        return true;
      } catch (err2) {
        console.error('[EyeDetection] CPU fallback also failed:', err2);
        setCameraError('Failed to load face detection model');
        setIsModelLoading(false);
        return false;
      }
    }
  }, []);

  // ─── Start webcam ───
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
      }
      return true;
    } catch (err: any) {
      console.error('[EyeDetection] Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera access denied');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found');
      } else {
        setCameraError('Camera error');
      }

      return false;
    }
  }, []);

  // ─── Stop webcam ───
  const stopCamera = useCallback(() => {
    isRunningRef.current = false;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }

    setIsCameraReady(false);
    setCurrentDirection('center');
    consecutiveDistractedRef.current = 0;
  }, []);

  // ─── Calculate yaw from facial landmarks ───
  const calculateYawFromLandmarks = useCallback(
    (landmarks: any[]): number => {
      // Key landmark indices from MediaPipe Face Mesh (478 landmarks):
      //  1   = nose tip
      // 33   = left eye outer corner
      // 263  = right eye outer corner
      // 234  = left ear tragion (side of face)
      // 454  = right ear tragion (side of face)
      // 168  = nose bridge (between eyes)
      // 10   = forehead center
      // 152  = chin

      const noseTip = landmarks[1];
      const leftEyeOuter = landmarks[33];
      const rightEyeOuter = landmarks[263];
      const noseBridge = landmarks[168];

      // Method: Compute the asymmetry of nose position relative to eye midpoint
      // When head is centered, nose tip X ≈ midpoint of left and right eye X
      // When head turns right (in real world), nose moves toward right eye
      // When head turns left, nose moves toward left eye

      // Eye midpoint
      const eyeMidX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
      const eyeSpan = Math.abs(rightEyeOuter.x - leftEyeOuter.x);

      if (eyeSpan < 0.01) return 0; // eyes too close / not detected properly

      // How far the nose deviates from center, normalized by eye span
      // Positive = nose is to the right of center, Negative = nose to the left
      const noseDeviation = (noseTip.x - eyeMidX) / eyeSpan;

      // Also use the nose bridge for a secondary check
      const bridgeDeviation = (noseBridge.x - eyeMidX) / eyeSpan;

      // Average both for stability
      const avgDeviation = (noseDeviation * 0.7 + bridgeDeviation * 0.3);

      // Convert to approximate degrees (empirically calibrated)
      // A deviation of ~0.5 eye-spans ≈ 30° turn
      const yawDegrees = avgDeviation * 60;

      // IMPORTANT: Webcam is mirrored! So we need to flip the sign.
      // When user turns their head to THEIR right, in the mirrored webcam
      // the nose appears to move left. So we negate.
      return -yawDegrees;
    },
    []
  );

  // ─── Calculate yaw from transformation matrix ───
  const calculateYawFromMatrix = useCallback((matrix: any): number => {
    // The facial transformation matrix is a 4x4 column-major matrix
    // We can extract yaw (rotation around Y axis) from the rotation part
    // Matrix layout (column-major):
    //  [0]  [4]  [8]  [12]
    //  [1]  [5]  [9]  [13]
    //  [2]  [6]  [10] [14]
    //  [3]  [7]  [11] [15]

    const data = matrix.data;
    if (!data || data.length < 16) return 0;

    // Yaw = atan2(m[8], m[0]) for column-major, or atan2(m[2][0], m[0][0]) for row-major
    // For MediaPipe's column-major: yaw ≈ atan2(data[8], data[0])
    const yaw = Math.atan2(data[8], data[0]);
    const yawDegrees = (yaw * 180) / Math.PI;

    return yawDegrees;
  }, []);

  // ─── Main detection loop ───
  const runDetectionLoop = useCallback(() => {
    isRunningRef.current = true;
    let lastTimestamp = -1;

    const loop = () => {
      if (!isRunningRef.current) return;

      const video = videoRef.current;
      const landmarker = faceLandmarkerRef.current;

      if (!video || !landmarker || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      // MediaPipe requires strictly increasing timestamps
      const now = performance.now();
      if (now <= lastTimestamp) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }
      lastTimestamp = now;

      try {
        const results = landmarker.detectForVideo(video, now);

        if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          let yawDegrees = 0;

          // Prefer transformation matrix if available (more accurate)
          if (
            results.facialTransformationMatrixes &&
            results.facialTransformationMatrixes.length > 0
          ) {
            yawDegrees = calculateYawFromMatrix(results.facialTransformationMatrixes[0]);
          } else {
            // Fallback to landmark-based calculation
            yawDegrees = calculateYawFromLandmarks(landmarks);
          }



          // Determine direction
          let direction: 'left' | 'right' | 'center' = 'center';
          if (yawDegrees > YAW_THRESHOLD) {
            direction = 'right';
          } else if (yawDegrees < -YAW_THRESHOLD) {
            direction = 'left';
          }

          if (direction !== 'center') {
            consecutiveDistractedRef.current++;
            setCurrentDirection(direction);

            if (consecutiveDistractedRef.current >= CONSECUTIVE_FRAMES_THRESHOLD) {
              // Show popup and keep it visible until focus returns
              setShowPopup(true);
            }
          } else {
            consecutiveDistractedRef.current = 0;
            setCurrentDirection('center');
            // Focus returned — dismiss the popup
            setShowPopup(false);
          }
        } else {
          // No face detected (camera blocked, hand over eyes, etc.)
          // Treat as distracted — show popup until face is visible again
          consecutiveDistractedRef.current++;
          setCurrentDirection('center');

          if (consecutiveDistractedRef.current >= CONSECUTIVE_FRAMES_THRESHOLD) {
            setShowPopup(true);
          }
        }
      } catch (err) {
        // Silent catch — don't break the loop on occasional detection errors
        console.warn('[EyeDetection] Detection frame error:', err);
      }

      // Run at ~10 FPS to save CPU
      setTimeout(() => {
        if (isRunningRef.current) {
          animFrameRef.current = requestAnimationFrame(loop);
        }
      }, 100);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  }, [
    calculateYawFromLandmarks,
    calculateYawFromMatrix,
    YAW_THRESHOLD,
    CONSECUTIVE_FRAMES_THRESHOLD,
  ]);

  // ─── Auto-start on mount (dashboard), auto-stop on unmount ───
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Init model first
      if (!faceLandmarkerRef.current) {
        const ok = await initFaceLandmarker();
        if (!ok || cancelled) return;
      }
      // Then start camera
      const cameraOk = await startCamera();
      if (!cameraOk || cancelled) return;
      // Then start detection loop
      setTimeout(() => {
        if (!cancelled) runDetectionLoop();
      }, 300);
    })();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [initFaceLandmarker, startCamera, stopCamera, runDetectionLoop]);



  return (
    <>
      {/* Hidden video for detection */}
      <video
        ref={videoRef}
        className="hidden"
        autoPlay
        playsInline
        muted
        width={640}
        height={480}
      />

      {/* ─── Status indicator (top-right, below header) ─── */}
      <div className="fixed top-16 right-6 z-[9998] flex flex-col items-end gap-3">
        {/* Camera / model error tooltip */}
        {cameraError && (
          <div className="bg-red-500/90 backdrop-blur-md text-white text-xs font-mono px-3 py-2 rounded-lg shadow-lg">
            {cameraError}
          </div>
        )}

        {/* Model loading indicator */}
        {isModelLoading && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-blue-500/15 border border-blue-500/30 text-blue-400 backdrop-blur-xl shadow-lg">
            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            Loading focus tracker...
          </div>
        )}

        {/* Status indicator when active */}
        {isCameraReady && !isModelLoading && (
          <div
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium
              backdrop-blur-xl shadow-lg border transition-all duration-500
              ${
                currentDirection === 'center'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-400 animate-pulse'
              }
            `}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                currentDirection === 'center' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            {currentDirection === 'center'
              ? 'Focused'
              : 'Not Focused'}
          </div>
        )}
      </div>

      {/* ─── FOCUS POPUP ─── */}
      {showPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          {/* Backdrop blur */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            style={{ animation: 'fade-in 0.3s ease-out forwards' }}
          />

          {/* Popup card */}
          <div
            className="relative max-w-sm w-full mx-4"
            style={{ animation: 'zoom-in-bounce 0.5s ease-out forwards' }}
          >
            <div
              className="
                relative overflow-hidden rounded-2xl
                bg-gradient-to-br from-red-500/20 via-orange-500/10 to-amber-500/20
                border border-red-500/40
                backdrop-blur-xl shadow-2xl shadow-red-500/20
                p-8 text-center
              "
              style={{ animation: 'shake-subtle 0.5s ease-out 0.3s' }}
            >
              {/* Animated glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/15 rounded-full blur-3xl animate-pulse" />

              {/* Icon */}
              <div className="relative mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>

              {/* Message */}
              <h2
                className="
                  text-3xl font-extrabold tracking-tight mb-2
                  bg-gradient-to-r from-red-300 via-orange-200 to-amber-300 bg-clip-text text-transparent
                "
              >
                Focus, Focus!
              </h2>
              <p className="text-sm text-slate-300 font-mono leading-relaxed">
                You seem distracted. Look back at your screen to stay productive!
              </p>

              {/* Hint */}
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400/70 font-mono">
                <Eye size={14} className="animate-pulse" />
                <span>Look at the screen to dismiss</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
