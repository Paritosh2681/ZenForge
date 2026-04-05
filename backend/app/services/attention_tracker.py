"""
Affective Computing Service - Attention & Fatigue Detection
Uses MediaPipe for real-time analysis of student engagement (with fallback)
"""

import logging
from typing import Dict, Optional, List
from datetime import datetime, timedelta
import time

logger = logging.getLogger(__name__)

try:
    import cv2
    import mediapipe as mp
    import numpy as np
    ATTENTION_AVAILABLE = True
    
    # Load Haar Cascade for face detection (for head pose estimation in fallback)
    try:
        face_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        FACE_CASCADE = cv2.CascadeClassifier(face_cascade_path)
        FACE_CASCADE_AVAILABLE = FACE_CASCADE.empty() == False
    except:
        FACE_CASCADE = None
        FACE_CASCADE_AVAILABLE = False
    
    try:
        # Try to use mediapipe.solutions
        from mediapipe.solutions import face_mesh as mp_face_mesh
        MEDIAPIPE_AVAILABLE = True
    except (ImportError, AttributeError) as e:
        logger.warning(f"MediaPipe solutions not available: {e} - using fallback detector")
        MEDIAPIPE_AVAILABLE = False
except ImportError as e:
    ATTENTION_AVAILABLE = False
    MEDIAPIPE_AVAILABLE = False
    FACE_CASCADE_AVAILABLE = False
    logger.warning(f"Attention tracking dependencies not available: {e}")

class AttentionTracker:
    """Track student attention and fatigue using webcam"""

    def __init__(self):
        if not ATTENTION_AVAILABLE:
            logger.warning("AttentionTracker initialized without mediapipe/cv2 - features disabled")
            self.face_mesh = None
            self.blink_count = 0
            self.last_blink_time = None
            self.blink_timestamps = []
            self.gaze_away_count = 0
            return

        # Try to initialize MediaPipe Face Mesh if available
        if MEDIAPIPE_AVAILABLE:
            try:
                self.mp_face_mesh = mp_face_mesh.FaceMesh(
                    max_num_faces=1,
                    refine_landmarks=True,
                    min_detection_confidence=0.5,
                    min_tracking_confidence=0.5
                )
                self.face_mesh = self.mp_face_mesh
            except Exception as e:
                logger.warning(f"Failed to initialize MediaPipe FaceMesh: {e} - using fallback")
                self.face_mesh = None
        else:
            self.face_mesh = None

        # Tracking state
        self.blink_count = 0
        self.last_blink_time = None
        self.blink_timestamps = []
        self.gaze_away_count = 0
        self.start_time = datetime.now()
        self.last_motion_frames = []  # For simple motion detection
        
        # Hysteresis state for stable detection (prevents flutter)
        self.last_looking_state = True  # Last confirmed state
        self.last_metrics = {}  # Cache of metrics for smoothing

        # Thresholds
        self.EYE_AR_THRESH = 0.21  # Eye aspect ratio for blink detection
        self.BLINK_WINDOW = 60  # seconds for blink rate calculation
        self.FATIGUE_BLINK_RATE = 20  # blinks per minute indicates fatigue
        self.ATTENTION_THRESHOLD = 0.5  # Gaze alignment threshold (lowered for better detection)
        
        # Hysteresis thresholds to prevent fluttering
        # When looking, need MORE convincing evidence to switch to "looking away"
        # When looking away, need LESS convincing evidence to switch back to "looking"
        self.LOOKING_BRIGHTNESS_MIN = 35  # More lenient when already looking
        self.LOOKING_BRIGHTNESS_MAX = 225
        self.LOOKING_VARIANCE_MIN = 70  # More lenient variance when already looking
        self.LOOKING_LAPLACIAN_MIN = 90
        
        self.LOOKINGAWAY_BRIGHTNESS_MIN = 40  # Stricter when determining "looking away"
        self.LOOKINGAWAY_BRIGHTNESS_MAX = 220
        self.LOOKINGAWAY_VARIANCE_MIN = 85  # Need more variance to confirm "looking away"
        self.LOOKINGAWAY_LAPLACIAN_MIN = 110

    def calculate_eye_aspect_ratio(self, eye_landmarks: List) -> float:
        """Calculate Eye Aspect Ratio (EAR) for blink detection"""
        # Vertical eye distances
        vertical1 = np.linalg.norm(np.array(eye_landmarks[1]) - np.array(eye_landmarks[5]))
        vertical2 = np.linalg.norm(np.array(eye_landmarks[2]) - np.array(eye_landmarks[4]))

        # Horizontal eye distance
        horizontal = np.linalg.norm(np.array(eye_landmarks[0]) - np.array(eye_landmarks[3]))

        # EAR calculation
        ear = (vertical1 + vertical2) / (2.0 * horizontal)
        return ear

    def detect_blink(self, left_ear: float, right_ear: float) -> bool:
        """Detect if a blink occurred"""
        avg_ear = (left_ear + right_ear) / 2.0

        if avg_ear < self.EYE_AR_THRESH:
            current_time = time.time()
            if self.last_blink_time is None or (current_time - self.last_blink_time) > 0.3:
                self.blink_count += 1
                self.blink_timestamps.append(current_time)
                self.last_blink_time = current_time

                # Clean old timestamps
                cutoff = current_time - self.BLINK_WINDOW
                self.blink_timestamps = [t for t in self.blink_timestamps if t > cutoff]

                return True

        return False

    def calculate_blink_rate(self) -> float:
        """Calculate blinks per minute"""
        if not self.blink_timestamps:
            return 0.0

        time_window = min(self.BLINK_WINDOW, time.time() - self.blink_timestamps[0])
        if time_window == 0:
            return 0.0

        return (len(self.blink_timestamps) / time_window) * 60

    def detect_gaze_direction(self, face_landmarks) -> Dict[str, float]:
        """Detect if student is looking at screen"""
        # Get nose tip and forehead landmarks for head pose
        nose_tip = face_landmarks.landmark[1]
        forehead = face_landmarks.landmark[10]
        chin = face_landmarks.landmark[152]  # chin landmark for better face pose

        # Calculate head pose (simplified)
        # If nose is roughly in center (x: 0.3-0.7, y: 0.2-0.6), they're looking at screen
        gaze_x = nose_tip.x - 0.5  # Center is 0.5
        gaze_y = nose_tip.y - 0.5

        # More lenient gaze detection
        # Use max distance in any direction
        max_deviation = max(abs(gaze_x), abs(gaze_y))
        
        # If they're within ±0.35 in either direction, they're looking at screen
        looking_at_screen = max_deviation < 0.35

        alignment_score = 1.0 - min(max_deviation, 1.0)  # Clamp to 0-1

        return {
            "gaze_x": gaze_x,
            "gaze_y": gaze_y,
            "alignment_score": max(0, alignment_score),
            "looking_at_screen": looking_at_screen
        }

    def analyze_frame(self, frame: np.ndarray) -> Optional[Dict]:
        """Analyze single frame for attention metrics"""
        if not ATTENTION_AVAILABLE or self.face_mesh is None:
            # Fallback: use simple analysis
            return self._analyze_frame_fallback(frame)

        try:
            # Convert BGR to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # Process with MediaPipe
            results = self.face_mesh.process(rgb_frame)

            if not results.multi_face_landmarks:
                return None

            face_landmarks = results.multi_face_landmarks[0]

            # Extract eye landmarks (MediaPipe Face Mesh indices)
            landmarks = face_landmarks.landmark
            left_eye = [
                [landmarks[33].x, landmarks[33].y],
                [landmarks[160].x, landmarks[160].y],
                [landmarks[158].x, landmarks[158].y],
                [landmarks[133].x, landmarks[133].y],
                [landmarks[153].x, landmarks[153].y],
                [landmarks[144].x, landmarks[144].y],
            ]

            right_eye = [
                [landmarks[362].x, landmarks[362].y],
                [landmarks[385].x, landmarks[385].y],
                [landmarks[387].x, landmarks[387].y],
                [landmarks[263].x, landmarks[263].y],
                [landmarks[373].x, landmarks[373].y],
                [landmarks[380].x, landmarks[380].y],
            ]

            # Calculate EAR for both eyes
            left_ear = self.calculate_eye_aspect_ratio(left_eye)
            right_ear = self.calculate_eye_aspect_ratio(right_eye)

            # Detect blink
            blinked = self.detect_blink(left_ear, right_ear)

            # Calculate blink rate
            blink_rate = self.calculate_blink_rate()

            # Detect gaze
            gaze_info = self.detect_gaze_direction(face_landmarks)

            # Determine fatigue and attention levels
            is_fatigued = blink_rate > self.FATIGUE_BLINK_RATE
            is_attentive = gaze_info["looking_at_screen"]

            return {
                "timestamp": datetime.now().isoformat(),
                "face_detected": bool(True),
                "blink_detected": bool(blinked),
                "blink_count": int(self.blink_count),
                "blink_rate": float(round(blink_rate, 2)),
                "is_fatigued": bool(is_fatigued),
                "gaze_alignment": float(round(gaze_info["alignment_score"], 2)),
                "looking_at_screen": bool(is_attentive),
                "attention_level": "high" if is_attentive and not is_fatigued else "medium" if is_attentive else "low"
            }
        except Exception as e:
            logger.error(f"Error in MediaPipe analysis: {e}", exc_info=True)
            return self._analyze_frame_fallback(frame)

    def detect_head_pose(self, frame: np.ndarray) -> Dict:
        """Detect head pose using face detection - returns if face is centered (looking at screen)"""
        if not FACE_CASCADE_AVAILABLE or FACE_CASCADE is None:
            return {"face_centered": True, "face_detected": False}  # Can't determine, assume looking
        
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = FACE_CASCADE.detectMultiScale(gray, 1.3, 5)
            
            if len(faces) == 0:
                # No face detected
                return {"face_centered": False, "face_detected": False}
            
            # Get largest face (presumably closest/most prominent)
            face = max(faces, key=lambda f: f[2] * f[3])
            x, y, w, h = face
            
            # Calculate face center position relative to frame
            frame_height, frame_width = frame.shape[:2]
            face_center_x = (x + w/2) / frame_width
            face_center_y = (y + h/2) / frame_height
            
            # If face is roughly centered (x: 0.3-0.7, y: 0.2-0.8), person is looking at screen
            # If face is at edge horizontally, they're looking away
            face_centered = (0.25 < face_center_x < 0.75) and (0.15 < face_center_y < 0.85)
            
            return {
                "face_centered": face_centered,
                "face_detected": True,
                "face_center_x": face_center_x,
                "face_center_y": face_center_y
            }
        except Exception as e:
            logger.warning(f"Error in head pose detection: {e}")
            return {"face_centered": True, "face_detected": False}  # Can't determine, assume looking

    def _analyze_frame_fallback(self, frame: np.ndarray) -> Dict:
        """Stable fallback analysis without MediaPipe - uses brightness/motion detection with hysteresis and head pose"""
        if frame is None or not hasattr(frame, 'shape') or frame.size == 0:
            return {
                "face_detected": False,
                "looking_at_screen": False,
                "attention_level": "low",
                "blink_rate": 15,
                "is_fatigued": False,
                "message": "Invalid frame"
            }

        try:
            # First, check head pose to see if face is centered
            head_pose = self.detect_head_pose(frame)
            face_detected = head_pose.get("face_detected", False)
            face_centered = head_pose.get("face_centered", True)
            
            # If face is detected but not centered, they're definitely looking away
            if face_detected and not face_centered:
                looking_at_screen = False
                self.last_looking_state = False
                return {
                    "face_detected": True,
                    "looking_at_screen": False,
                    "attention_level": "low",
                    "blink_rate": 15,
                    "is_fatigued": False,
                    "debug": f"Face detected but not centered - head turned away (x={head_pose.get('face_center_x', 0):.2f}, y={head_pose.get('face_center_y', 0):.2f})"
                }
            
            # Convert to grayscale for brightness/detail analysis
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Get image statistics
            mean_brightness = float(gray.mean())
            variance = float(gray.var())
            laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
            
            # Hysteresis logic: Use different thresholds based on current state
            # This prevents rapid fluttering between "looking" and "looking away"
            if self.last_looking_state:
                # We think they're looking - use LENIENT thresholds to maintain "looking" state
                # (require MORE evidence to switch to "looking away")
                brightness_ok = self.LOOKING_BRIGHTNESS_MIN < mean_brightness < self.LOOKING_BRIGHTNESS_MAX
                has_detail = variance > self.LOOKING_VARIANCE_MIN and laplacian_var > self.LOOKING_LAPLACIAN_MIN
            else:
                # We think they're looking away - use STRICT thresholds to confirm "looking away"
                # (require LESS evidence to stay "looking away", but can switch back easily with good evidence)
                brightness_ok = self.LOOKINGAWAY_BRIGHTNESS_MIN < mean_brightness < self.LOOKINGAWAY_BRIGHTNESS_MAX
                has_detail = variance > self.LOOKINGAWAY_VARIANCE_MIN and laplacian_var > self.LOOKINGAWAY_LAPLACIAN_MIN
            
            # If face cascade is enabled but didn't detect face, they're likely looking away (head turned)
            # Only use brightness/detail if face cascade is NOT available (can't detect head pose)
            if FACE_CASCADE_AVAILABLE:
                # When face detection is available but returned no face, treat as looking away
                # UNLESS we're already in "looking away" state (hysteresis)
                if not face_detected:
                    # Face was not detected by cascade - likely turned away or blocked
                    looking_at_screen = False
                else:
                    # Face was detected and is centered (we checked above), apply brightness checks
                    looking_at_screen = bool(brightness_ok and has_detail)
            else:
                # No face cascade available - rely only on brightness/detail
                looking_at_screen = bool(brightness_ok and has_detail)
            
            # Update state with hysteresis
            self.last_looking_state = looking_at_screen
            
            # Estimate attention level based on these factors
            if looking_at_screen:
                attention_level = "high"  # If they're looking, assume high attention
            else:
                attention_level = "low"   # If looking away, low attention
            
            self.last_motion_frames.append(looking_at_screen)
            if len(self.last_motion_frames) > 5:
                self.last_motion_frames.pop(0)
            
            return {
                "face_detected": face_detected,
                "looking_at_screen": looking_at_screen,
                "attention_level": attention_level,
                "blink_rate": 15,  # Normal blink rate
                "is_fatigued": False,
                "debug": f"brightness={mean_brightness:.1f}, var={variance:.1f}, laplacian={laplacian_var:.1f}, face_centered={face_centered}, cascade_available={FACE_CASCADE_AVAILABLE}, hysteresis_state={self.last_looking_state}"
            }
        except Exception as e:
            logger.error(f"Error in fallback analysis: {e}")
            # Default to assuming they're looking (safer than false positives)
            return {
                "face_detected": True,
                "looking_at_screen": True,
                "attention_level": "high",
                "blink_rate": 15,
                "is_fatigued": False
            }

    def get_intervention_recommendation(self, metrics: Dict) -> Optional[str]:
        """Recommend LLM intervention based on attention metrics"""
        if metrics["is_fatigued"]:
            return "fatigue_detected"

        if not metrics["looking_at_screen"]:
            return "attention_drift"

        if metrics["attention_level"] == "low":
            return "low_engagement"

        return None

    def reset(self):
        """Reset tracking state"""
        self.blink_count = 0
        self.last_blink_time = None
        self.blink_timestamps = []
        self.gaze_away_count = 0
        self.start_time = datetime.now()
