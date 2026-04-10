'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api-client';
import type { Conversation } from '@/types/conversation';

interface SessionSidebarProps {
  currentConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  onNewConversation: () => void;
}

export default function SessionSidebar({
  currentConversationId,
  onConversationSelect,
  onNewConversation,
}: SessionSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listConversations(50, 0, false);
      setConversations(data.conversations);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent conversation selection

    if (!confirm('Delete this conversation?')) return;

    try {
      await api.deleteConversation(conversationId);
      setConversations(conversations.filter((c) => c.id !== conversationId));

      // If deleting current conversation, create a new one
      if (conversationId === currentConversationId) {
        onNewConversation();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      alert('Failed to delete conversation');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] border-r border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#22C55E] hover:bg-[#22C55E]/90 text-[#0D0D0D] rounded-lg transition-colors font-medium"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Chat
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-center text-slate-400">
            Loading conversations...
          </div>
        )}

        {error && (
          <div className="p-4 text-center text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && conversations.length === 0 && (
          <div className="p-4 text-center text-slate-400">
            No conversations yet
          </div>
        )}

        {!loading && !error && conversations.length > 0 && (
          <div className="py-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className={`
                  group relative px-4 py-3 mx-2 mb-1 rounded-lg cursor-pointer transition-colors border
                  ${
                    conversation.id === currentConversationId
                      ? 'bg-[#22C55E]/20 border-[#22C55E]/40 text-[#22C55E]'
                      : 'hover:bg-white/5 border-white/0 hover:border-white/10 text-slate-300'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-sm font-medium truncate">
                      {conversation.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>{conversation.message_count} messages</span>
                      <span>•</span>
                      <span>{formatDate(conversation.updated_at)}</span>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(conversation.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-opacity text-red-400"
                    title="Delete conversation"
                  >
                    <svg
                      className="w-4 h-4 text-red-600 dark:text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Removed Phase 3 text */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 text-center">
        {/* Phase text removed per user request */}
      </div>
    </div>
  );
}
