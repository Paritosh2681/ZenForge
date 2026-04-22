'use client';

import { useEffect, useRef, useState } from 'react';
import { api, DocumentListItem } from '@/lib/api-client';

interface DocumentUploaderProps {
  onUploadSuccess?: (message: string) => void;
  selectedDocumentIds?: string[];
  onSelectionChange?: (documentIds: string[], documentNames: string[]) => void;
  onOpenChatForDocuments?: (documentIds: string[], documentNames: string[]) => void;
}

export default function DocumentUploader({
  onUploadSuccess,
  selectedDocumentIds = [],
  onSelectionChange,
  onOpenChatForDocuments,
}: DocumentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const response = await api.listDocuments();
      setDocuments(response.documents);
    } catch (error) {
      console.error('Failed to load documents:', error);
      setMessage({ text: 'Failed to load document list.', type: 'error' });
    } finally {
      setLoadingDocuments(false);
    }
  };

  const updateSelection = (documentIds: string[], selectedNamesOverride?: string[]) => {
    const selectedNames = selectedNamesOverride ?? documents
      .filter((doc) => documentIds.includes(doc.document_id))
      .map((doc) => doc.filename);
    onSelectionChange?.(documentIds, selectedNames);
  };

  const handleToggleDocument = (documentId: string) => {
    if (selectedDocumentIds.includes(documentId)) {
      updateSelection(selectedDocumentIds.filter((id) => id !== documentId));
      return;
    }

    updateSelection([...selectedDocumentIds, documentId]);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.pdf', '.pptx', '.ppt', '.docx', '.doc', '.txt'];
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

      await loadDocuments();
      updateSelection([response.document_id], [response.filename]);

      setMessage({
        text: `✓ ${response.message} Selected ${response.filename} for chat scope.`,
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

  const handleOpenScopedChat = (documentIds: string[]) => {
    if (documentIds.length === 0) return;
    updateSelection(documentIds);
    const selectedNames = documents
      .filter((doc) => documentIds.includes(doc.document_id))
      .map((doc) => doc.filename);
    onOpenChatForDocuments?.(documentIds, selectedNames);
  };

  const handleDeleteDocument = async (documentId: string, documentName: string) => {
    if (!confirm(`Are you sure you want to delete "${documentName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteDocument(documentId);
      setMessage({ text: `Successfully deleted "${documentName}"`, type: 'success' });
      
      // Remove from selection if it was selected
      if (selectedDocumentIds.includes(documentId)) {
        const newSelection = selectedDocumentIds.filter(id => id !== documentId);
        updateSelection(newSelection);
      }
      
      // Reload documents
      await loadDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
      setMessage({ text: `Failed to delete "${documentName}". Please try again.`, type: 'error' });
    }
  };

  const selectedCount = selectedDocumentIds.length;

  return (
    <div className="space-y-6">
      {/* Upload Area - Cyberpunk Styled */}
      <div className="relative group">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.pptx,.ppt,.docx,.doc,.txt"
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />

        <label
          htmlFor="file-upload"
          className={`block cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="gc-card border-2 border-dashed border-white/10 group-hover:border-[#22C55E]/30 transition-all duration-300 p-12 text-center">
            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#22C55E]/0 via-[#22C55E]/0 to-[#22C55E]/0 group-hover:from-[#22C55E]/5 group-hover:via-[#22C55E]/5 group-hover:to-[#22C55E]/5 transition-all duration-500 pointer-events-none" />
            
            <div className="relative space-y-4">
              {/* Icon with gradient */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-xl bg-[#22C55E] flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                  📚
                </div>
              </div>
              
              <div>
                <div className="text-xl font-display font-semibold tracking-tight text-white mb-2">
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
                      Processing Document...
                    </span>
                  ) : (
                    'Upload Study Materials'
                  )}
                </div>
                <div className="text-sm text-slate-400 font-mono">
                  PDF, PowerPoint, or Word documents
                </div>
              </div>
            </div>
          </div>
        </label>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div
          className={`gc-card p-4 border-l-4 animate-fade-in ${
            message.type === 'success'
              ? 'border-l-emerald-500 bg-emerald-500/10'
              : 'border-l-red-500 bg-red-500/10'
          }`}
        >
          <p className={`text-sm font-medium ${
            message.type === 'success' ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Documents List */}
      <div className="gc-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display font-semibold tracking-tight text-white">Uploaded Documents</h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadDocuments}
              disabled={loadingDocuments}
              className="gc-btn-secondary text-xs"
            >
              {loadingDocuments ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  Refreshing...
                </span>
              ) : (
                'Refresh'
              )}
            </button>
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={() => handleOpenScopedChat(selectedDocumentIds)}
              className="gc-btn-primary text-xs"
            >
              Chat with Selected ({selectedCount})
            </button>
          </div>
        </div>

        {documents.length === 0 && !loadingDocuments && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3 opacity-40">📄</div>
            <p className="text-sm text-slate-500 font-mono">No documents uploaded yet</p>
          </div>
        )}

        {documents.length > 0 && (
          <div className="space-y-3">
            {documents.map((doc) => {
              const checked = selectedDocumentIds.includes(doc.document_id);
              return (
                <div
                  key={doc.document_id}
                  className={`group relative gc-card p-4 transition-all duration-200 ${
                    checked 
                      ? 'border-[#22C55E]/50 bg-[#22C55E]/5 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                      : 'hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <label className="flex items-start gap-3 flex-1 cursor-pointer">
                      {/* Custom Checkbox */}
                      <div className="relative mt-1">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleDocument(doc.document_id)}
                          className="peer sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 transition-all ${
                          checked 
                            ? 'border-[#22C55E] bg-[#22C55E]' 
                            : 'border-slate-600 bg-transparent'
                        }`}>
                          {checked && (
                            <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white truncate group-hover:text-[#22C55E] transition-colors">
                          {doc.filename}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs font-mono">
                          <span className={`px-2 py-0.5 rounded ${
                            doc.file_type === 'pdf' ? 'bg-red-500/20 text-red-400' :
                            doc.file_type === 'pptx' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {doc.file_type.toUpperCase()}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-400">{formatBytes(doc.file_size)}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-[#22C55E]">{doc.chunks_created} chunks</span>
                        </div>
                      </div>
                    </label>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenScopedChat([doc.document_id])}
                        className="gc-btn-secondary text-xs whitespace-nowrap"
                      >
                        Ask This File
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.document_id, doc.filename)}
                        className="px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 rounded transition-all duration-200"
                        title="Delete document"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
