'use client';

import { useState, useRef } from 'react';
import { api } from '@/lib/api-client';

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
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
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
          className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="space-y-2">
            <div className="text-4xl">📚</div>
            <div className="text-lg font-medium text-gray-700">
              {uploading ? 'Processing...' : 'Upload Study Materials'}
            </div>
            <div className="text-sm text-gray-500">
              PDF, PowerPoint, or Word documents
            </div>
          </div>
        </label>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg animate-fade-in ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
