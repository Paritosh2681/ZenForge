'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api-client';
import type { Conversation } from '@/types/conversation';

interface ConversationHeaderProps {
  conversationId?: string;
  onTitleUpdate?: (newTitle: string) => void;
}

export default function ConversationHeader({
  conversationId,
  onTitleUpdate,
}: ConversationHeaderProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (conversationId) {
      loadConversation();
    } else {
      setConversation(null);
    }
  }, [conversationId]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const loadConversation = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      const data = await api.getConversation(conversationId);
      setConversation(data);
      setEditValue(data.title);
    } catch (err) {
      console.error('Failed to load conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = () => {
    if (conversation) {
      setEditValue(conversation.title);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (conversation) {
      setEditValue(conversation.title);
    }
  };

  const handleSaveEdit = async () => {
    if (!conversationId || !editValue.trim()) {
      handleCancelEdit();
      return;
    }

    try {
      const updated = await api.updateConversation(conversationId, {
        title: editValue.trim(),
      });
      setConversation(updated);
      setIsEditing(false);
      if (onTitleUpdate) {
        onTitleUpdate(updated.title);
      }
    } catch (err) {
      console.error('Failed to update conversation title:', err);
      alert('Failed to update title');
      handleCancelEdit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#22C55E] flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.4)]">
            <svg
              className="w-5 h-5 text-[#0D0D0D]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold text-white">
            New Conversation
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0f1c]">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Icon */}
        <div className="w-8 h-8 rounded-full bg-[#22C55E] flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.4)]">
          <svg
            className="w-5 h-5 text-[#0D0D0D]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>

        {/* Title (Editable) */}
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveEdit}
              className="flex-1 px-2 py-1 text-lg font-semibold bg-[#0D1421] border border-[#22C55E] rounded focus:outline-none focus:ring-2 focus:ring-[#22C55E] text-white"
              maxLength={100}
            />
          </div>
        ) : (
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-2 group flex-1 min-w-0 text-left"
          >
            <h1 className="text-lg font-semibold text-white truncate">
              {conversation.title}
            </h1>
            <svg
              className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 ml-4">
        <div className="flex items-center gap-1.5">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>{conversation.message_count} messages</span>
        </div>
      </div>
    </div>
  );
}
