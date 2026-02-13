'use client';

import { useState, useEffect } from 'react';
import DocumentUploader from '@/components/DocumentUploader';
import ChatInterface from '@/components/ChatInterface';
import { api } from '@/lib/api-client';

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<{
    ollama_connected: boolean;
    documents_indexed: number;
  } | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    // Check system health on mount
    const checkHealth = async () => {
      try {
        const health = await api.getHealth();
        setHealthStatus({
          ollama_connected: health.ollama_connected,
          documents_indexed: health.documents_indexed,
        });
      } catch (error) {
        console.error('Health check failed:', error);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  const handleUploadSuccess = () => {
    // Refresh health status to update document count
    api.getHealth().then((health) => {
      setHealthStatus({
        ollama_connected: health.ollama_connected,
        documents_indexed: health.documents_indexed,
      });
    });

    // Close uploader after successful upload
    setTimeout(() => setShowUploader(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              🧠 Guru-Agent
            </h1>
            <p className="text-sm text-gray-600">Active Cognitive Learning OS</p>
          </div>

          <div className="flex items-center space-x-6">
            {/* System Status */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    healthStatus?.ollama_connected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-gray-600">
                  {healthStatus?.ollama_connected ? 'Ollama Running' : 'Ollama Offline'}
                </span>
              </div>

              <div className="text-gray-600">
                📚 {healthStatus?.documents_indexed || 0} chunks indexed
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setShowUploader(!showUploader)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              {showUploader ? 'Close' : 'Upload Documents'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex">
        <div className="flex-1 flex flex-col">
          {/* Document Uploader (Collapsible) */}
          {showUploader && (
            <div className="bg-white border-b border-gray-200 p-6 animate-slide-up">
              <DocumentUploader onUploadSuccess={handleUploadSuccess} />
            </div>
          )}

          {/* Chat Interface */}
          <div className="flex-1 overflow-hidden bg-white">
            <ChatInterface />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-600">
          <div>100% Local • 100% Private • Zero Cloud Dependency</div>
          <div>Phase 1: Core RAG Foundation</div>
        </div>
      </footer>
    </div>
  );
}
