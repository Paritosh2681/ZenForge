'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

interface VoiceInputProps {
  onTranscription: (text: string, language: string) => void;
  onError?: (error: string) => void;
}

export default function VoiceInput({ onTranscription, onError }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [browserSupport, setBrowserSupport] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition in useEffect to avoid state updates during render
  useEffect(() => {
    if (typeof window !== 'undefined' && !recognitionRef.current) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          if (event.results && event.results[0] && event.results[0][0]) {
            const transcript = event.results[0][0].transcript;
            onTranscription(transcript, 'en');
          }
          setIsRecording(false);
        };

        recognition.onerror = () => {
          setIsRecording(false);
          if (onError) onError('Voice recognition error. Please try speaking again.');
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      } else {
        setBrowserSupport(false);
      }
    }
  }, [onTranscription, onError]);

  const startRecording = async () => {
    if (!browserSupport && onError) {
      onError('Browser does not support local voice recognition. WebKit needed.');
      return;
    }
    try {
      recognitionRef.current?.start();
    } catch (e) {
      if (onError) onError('Failed to start voice input.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all font-medium ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]'
            : 'bg-[#22C55E] hover:bg-[#16A34A] shadow-[0_0_15px_rgba(34,197,94,0.3)]'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''} text-[#0D0D0D] font-semibold`}
        title={isRecording ? 'Stop recording' : 'Start voice input'}
      >
        {isProcessing ? (
          <div className="w-6 h-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          </div>
        ) : isRecording ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <rect x="6" y="6" width="8" height="8" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        )}
        
        <span>
          {isProcessing ? 'Processing...' : isRecording ? 'Stop Recording' : 'Start Voice Input'}
        </span>
      </button>

      {isRecording && (
        <div className="flex items-center gap-2 text-[#22C55E] font-mono text-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          Recording...
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center gap-2 text-amber-400 font-mono text-sm">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
          Transcribing...
        </div>
      )}
    </div>
  );
}
