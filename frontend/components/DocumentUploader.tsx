'use client';

import { useState, useRef } from 'react';
import { api } from '@/lib/api-client';
import { UploadCloud } from 'lucide-react';

interface DocumentUploaderProps {
  onUploadSuccess?: (message: string) => void;
}

export default function DocumentUploader({ onUploadSuccess }: DocumentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.pdf', '.pptx', '.ppt', '.docx', '.doc'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      setMessage({
        text: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
        type: 'error',
      });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const response = await api.uploadDocument(file);

      setMessage({
        text: `✓ ${response.message}`,
        type: 'success',
      });

      if (onUploadSuccess) {
        onUploadSuccess(response.message);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Upload failed. Please try again.';
      setMessage({
        text: errorMessage,
        type: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className="border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300"
        style={{
          borderColor: 'rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.02)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(80,120,255,0.4)';
          e.currentTarget.style.background = 'rgba(80,120,255,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.pptx,.ppt,.docx,.doc"
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />

        <label
          htmlFor="file-upload"
          className={`cursor-pointer block w-full h-full ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="space-y-3 flex flex-col items-center">
            <UploadCloud size={48} strokeWidth={1.5} style={{ color: 'hsl(220 80% 62%)', opacity: 0.85, marginBottom: '0.25rem' }} />
            <div className="text-lg font-semibold" style={{ color: 'hsl(220 15% 90%)' }}>
              {uploading ? 'Processing...' : 'Upload Study Materials'}
            </div>
            <div className="text-sm font-medium" style={{ color: 'hsl(220 10% 55%)' }}>
              PDF, PowerPoint, or Word documents
            </div>
          </div>
        </label>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg animate-fade-in`}
          style={{
            background: message.type === 'success' ? 'rgba(80,200,140,0.1)' : 'rgba(255,80,80,0.1)',
            border: `1px solid ${message.type === 'success' ? 'rgba(80,200,140,0.2)' : 'rgba(255,80,80,0.2)'}`,
            color: message.type === 'success' ? '#4ade80' : 'hsl(0 60% 65%)',
            fontSize: '0.88rem'
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
