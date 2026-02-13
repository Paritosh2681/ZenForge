# Phase 2: Multimodal & Multilingual Features - COMPLETE

## Overview

Phase 2 transforms Guru-Agent from a text-only RAG system into a **comprehensive multimodal learning companion** with vision-based attention tracking, voice input in multiple languages, and audio responses.

---

## Features Implemented

### 1. Affective Computing - Attention Tracking ✅

**Technology**: MediaPipe Face Mesh

**Capabilities**:
- Real-time fatigue detection via blink rate analysis
- Gaze direction tracking for attention monitoring
- Automatic intervention recommendations
- WebSocket support for continuous monitoring

**Metrics Tracked**:
- Blink rate (blinks per minute)
- Eye Aspect Ratio (EAR) for blink detection
- Gaze alignment score
- Attention level (high/medium/low)
- Fatigue indicators

**Interventions**:
- `fatigue_detected`: "You seem tired. Consider taking a short break!"
- `attention_drift`: "Let's refocus! The content is getting interesting."
- `low_engagement`: "How about we try a different approach to this topic?"

### 2. Multilingual Voice Input ✅

**Technology**: OpenAI Whisper (local)

**Supported Languages**:
- English (en)
- Hindi (hi)
- Bengali (bn)
- Telugu (te)
- Marathi (mr)
- Tamil (ta)
- Urdu (ur)
- Gujarati (gu)
- Kannada (kn)
- Oriya (or)
- Malayalam (ml)
- Punjabi (pa)

**Features**:
- Automatic language detection
- Translation to English
- Segmented transcription with timestamps
- Confidence scores

**Model Sizes**:
- `tiny`: ~75MB, fastest
- `base`: ~150MB, recommended
- `small`: ~500MB, better accuracy
- `medium/large`: 1-3GB, best quality

### 3. Text-to-Speech (Multilingual) ✅

**Technology**: Co qui TTS (primary) + pyttsx3 (fallback)

**Supported Languages** (Coqui):
- 16+ languages including English, Hindi, Spanish, French,  German, Arabic, Chinese, Japanese, Korean

**Features**:
- High-quality neural TTS
- Voice cloning capability
- Multilingual synthesis
- Lightweight fallback option

### 4. Frontend Components ✅

**AttentionMonitor.tsx**:
- Live webcam feed
- Real-time metrics display
- Visual attention indicators
- Intervention alerts

**VoiceInput.tsx**:
- One-click voice recording
- Visual recording indicators
- Processing status
- Error handling

---

## Architecture

```
┌──────────────────────┐
│   Browser            │
│                      │
│  ┌────────────────┐  │
│  │ Webcam Stream  │──┼──┐
│  └────────────────┘  │  │
│                      │  │
│  ┌────────────────┐  │  │
│  │ Microphone     │──┼──┼──┐
│  └────────────────┘  │  │  │
│                      │  │  │
│  ┌────────────────┐  │  │  │
│  │ Audio Player   │←─┼──┼──┼──┐
│  └────────────────┘  │  │  │  │
└──────────────────────┘  │  │  │
                          │  │  │
                          ▼  ▼  ▼
┌─────────────────────────────────┐
│   FastAPI Backend               │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Attention Tracker       │   │
│  │ (MediaPipe)             │◄──┤
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Voice Input Service     │   │
│  │ (Whisper)               │◄──┤
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ TTS Service             │   │
│  │ (Coqui TTS)             │───┤
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ RAG Engine (Phase 1)    │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

---

## API Endpoints

### Attention Tracking

**POST `/multimodal/analyze-attention`**
- Input: Base64 encoded image
- Output: Attention metrics + intervention
- Use: Single-frame analysis

**WebSocket `/multimodal/attention-stream`**
- Input: Continuous image frames
- Output: Real-time metrics stream
- Use: Live monitoring

**POST `/multimodal/reset-attention-tracker`**
- Resets blink count and tracking state

### Voice Input

**POST `/multimodal/transcribe-voice`**
- Input: Audio file (multipart upload)
- Query params: `language` (optional), `translate` (bool)
- Output: Transcription + detected language

**GET `/multimodal/supported-languages`**
- Returns list of supported languages for voice/TTS

### Text-to-Speech

**POST `/multimodal/synthesize-speech`**
- Input: `{ text, language, speaker_wav_base64 (optional) }`
- Output: Audio file (WAV)
- Use: Convert AI responses to speech

---

## Usage Examples

### 1. Monitor Attention

```typescript
// Frontend
import AttentionMonitor from '@/components/AttentionMonitor';

<AttentionMonitor />
```

```python
# Backend
from app.services.attention_tracker import AttentionTracker

tracker = AttentionTracker()
metrics = tracker.analyze_frame(webcam_frame)

if metrics["is_fatigued"]:
    # Trigger break reminder
    pass
```

### 2. Voice Input

```typescript
// Frontend
import VoiceInput from '@/components/VoiceInput';

<VoiceInput
  onTranscription={(text, lang) => {
    console.log(`Transcribed in ${lang}: ${text}`);
    sendToRAG(text);
  }}
  onError={(err) => console.error(err)}
/>
```

```python
# Backend
from app.services.voice_input import VoiceInputService

service = VoiceInputService(model_size="base")
result = service.transcribe_audio(audio_bytes, language="hi")

# result = {
#   "text": "मुझे फोटोसिंथेसिस समझाओ",
#   "language": "hi",
#   "language_name": "Hindi"
# }
```

### 3. Text-to-Speech

```python
# Backend
from app.services.text_to_speech import TextToSpeechService

tts = TextToSpeechService()
result = tts.synthesize_multilingual(
    text="Photosynthesis is the process...",
    target_language="hi"  # Speaks in Hindi
)

# Returns audio file path
```

---

## Installation

### Add Phase 2 Dependencies

**Update Docker**:
```dockerfile
# In backend/Dockerfile, add:
COPY requirements-phase2.txt .
RUN pip install --no-cache-dir -r requirements-phase2.txt
```

**Or Install Locally**:
```bash
cd backend
source venv/bin/activate
pip install -r requirements-phase2.txt
```

### Download Models

**Whisper** (auto-downloads on first use):
- `tiny`: ~75MB
- `base`: ~150MB (recommended)

**Coqui TTS** (auto-downloads):
- ~2GB for XTTS-v2 multilingual model

**MediaPipe** (included in package):
- Face mesh model bundled

---

## Performance

### Resource Usage

| Component | RAM | CPU | Notes |
|-----------|-----|-----|-------|
| MediaPipe | ~200MB | 10-15% | Per webcam stream |
| Whisper (base) | ~500MB | 20-30% | During transcription |
| Coqui TTS | ~2GB | 15-25% | During synthesis |
| Total (Phase 2) | ~3GB | Variable | On top of Phase 1 |

### Latency

| Operation | Time | Notes |
|-----------|------|-------|
| Attention analysis | ~50-100ms | Per frame |
| Voice transcription | ~2-5s | 30s audio |
| TTS synthesis | ~3-8s | Per sentence |
| Live monitoring | Real-time | 10-15 FPS |

---

## Use Cases

### 1. Fatigue Detection Study Session

```
User starts studying
→ Webcam monitors blink rate
→ After 45 min, blink rate exceeds 20/min
→ System: "You seem tired. Take a 5-minute break!"
→ User takes break
→ Attention tracker resets
```

### 2. Multilingual Voice Query

```
User (in Hindi): "मुझे यह concept समझाओ"
→ Whisper transcribes: "मुझे यह concept समझाओ"
→ Detected language: Hindi
→ RAG retrieves context
→ LLM generates response in English
→ TTS converts to Hindi audio
→ User hears explanation in Hindi
```

### 3. Attention-Aware Tutoring

```
User watching explanation
→ Gaze drifts away from screen
→ Attention tracker detects low alignment
→ System pauses and says: "Let's refocus!"
→ Offers alternative explanation style
→ User re-engages
```

---

## Configuration

### Attention Tracking

```python
# In attention_tracker.py
EYE_AR_THRESH = 0.21  # Blink sensitivity
FATIGUE_BLINK_RATE = 20  # Blinks/min threshold
ATTENTION_THRESHOLD = 0.7  # Gaze alignment
```

### Voice Input

```python
# When initializing
service = VoiceInputService(
    model_size="base"  # tiny/base/small/medium/large
)
```

### TTS

```python
# When initializing
tts = TextToSpeechService(
    use_advanced=True  # False for lightweight pyttsx3
)
```

---

## Frontend Integration

### Add to Dashboard

```tsx
// In frontend/app/page.tsx
import AttentionMonitor from '@/components/AttentionMonitor';
import VoiceInput from '@/components/VoiceInput';

// In layout:
<div className="grid grid-cols-2 gap-4">
  <AttentionMonitor />
  <div>
    <VoiceInput
      onTranscription={handleVoiceInput}
      onError={console.error}
    />
  </div>
</div>
```

---

## Limitations

### Phase 2 Constraints

1. **Attention Tracking**:
   - Requires good lighting
   - Single face only
   - Webcam permission needed

2. **Voice Input**:
   - Requires microphone permission
   - Works best with clear audio
   - Model size vs accuracy tradeoff

3. **TTS**:
   - First synthesis is slow (model loading)
   - Large model download (~2GB)
   - Some languages have accents

---

## Next Steps (Phase 3)

### Assessment Engine
- Stepwise hints instead of direct answers
- Rubric-based feedback
- Protégé effect (role reversal)
- Academic integrity checks

### Example:
```
User: "What is the answer to problem 5?"
→ System (doesn't give answer directly):
   "Let's think through this step-by-step:
    Step 1: What formula applies here?
    Step 2: What values do you have?
    ..."
```

---

## Docker Update

### Updated Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

# Install system deps including OpenCV dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    curl \
    ffmpeg \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Phase 1 + Phase 2 dependencies
COPY requirements.txt requirements-phase2.txt ./
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir -r requirements-phase2.txt

# Rest of Dockerfile...
```

---

## Testing

### Test Attention Tracking

1. Open http://localhost:3000
2. Click "Start Monitoring" on AttentionMonitor
3. Allow camera access
4. Face camera → See high attention
5. Look away → See attention drop
6. Blink rapidly → See fatigue alert

### Test Voice Input

1. Click microphone button
2. Speak in any supported language
3. Click stop
4. See transcription appear
5. Check detected language

### Test TTS

1. Get AI response
2. Request audio version
3. Play returned audio file
4. Verify speech quality

---

## Files Created

```
backend/
├── requirements-phase2.txt              ✅ Phase 2 dependencies
├── app/services/
│   ├── attention_tracker.py             ✅ MediaPipe attention
│   ├── voice_input.py                   ✅ Whisper transcription
│   └── text_to_speech.py                ✅ Coqui TTS
└── app/routers/
    └── multimodal.py                     ✅ Phase 2 API routes

frontend/components/
├── AttentionMonitor.tsx                  ✅ Webcam + metrics UI
└── VoiceInput.tsx                        ✅ Voice recording UI
```

---

## Success Metrics

### Phase 2 Goals ✅
- [x] MediaPipe integration for attention tracking
- [x] Whisper for multilingual voice input (12+ languages)
- [x] Coqui TTS for audio responses
- [x] Frontend webcam component
- [x] Frontend voice input component
- [x] API endpoints for all features
- [x] Real-time WebSocket monitoring
- [x] Intervention system for low attention

---

## Summary

**Phase 2 Complete**: Guru-Agent now has:
- 👁️ Vision-based attention monitoring
- 🎤 Multilingual voice input (12+ Indian languages)
- 🔊 Text-to-speech audio responses
- 🧠 Intelligent intervention system
- 🌐 Full multimodal capabilities

**Next**: Phase 3 will add assessment features (hints, rubrics, role reversal)

---

**Team ZenForge | AMD Slingshot Hackathon**
**Phase 2: Multimodal & Multilingual - COMPLETE** 🎉
