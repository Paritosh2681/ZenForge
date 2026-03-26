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
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;
    try {
      await api.deleteConversation(conversationId);
      setConversations(conversations.filter((c) => c.id !== conversationId));
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'transparent',
        fontFamily: "var(--font-outfit), system-ui, sans-serif",
      }}
    >
      {/* Header — New Chat */}
      <div
        style={{
          padding: '0.85rem 1rem',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={onNewConversation}
          className="rounded-full"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'rgba(80,120,255,0.14)',
            border: '1px solid rgba(80,120,255,0.28)',
            color: 'hsl(220 80% 75%)',
            fontSize: '0.82rem',
            fontWeight: 600,
            fontFamily: "var(--font-outfit), sans-serif",
            cursor: 'pointer',
            borderRadius: '9999px',
            transition: 'all 0.15s ease',
            letterSpacing: '0.01em',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(80,120,255,0.22)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(80,120,255,0.14)';
          }}
        >
          <span>+</span>
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversation list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
        {loading && (
          <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <div 
              className="animate-spin rounded-full border-b-2" 
              style={{ 
                width: '1.25rem', 
                height: '1.25rem', 
                borderColor: 'hsl(220 80% 62%)',
                borderTopColor: 'transparent',
                borderRightColor: 'transparent',
                borderLeftColor: 'transparent',
              }}
            />
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.78rem', color: 'hsl(0 60% 55%)' }}>
            {error}
          </div>
        )}

        {!loading && !error && conversations.length === 0 && (
          <div style={{ padding: '1.5rem 1rem', textAlign: 'center', fontSize: '0.78rem', color: 'hsl(220 10% 38%)', fontFamily: "var(--font-outfit), sans-serif" }}>
            No conversations yet
          </div>
        )}

        {!loading && !error && conversations.map((conversation) => {
          const isActive = conversation.id === currentConversationId;
          return (
            <div
              key={conversation.id}
              onClick={() => onConversationSelect(conversation.id)}
              style={{
                position: 'relative',
                padding: '0.6rem 1rem',
                margin: '0 0.4rem 2px',
                cursor: 'pointer',
                background: isActive ? 'rgba(80,120,255,0.12)' : 'transparent',
                borderLeft: isActive ? '2px solid hsl(220 80% 62%)' : '2px solid transparent',
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'hsl(220 15% 85%)' : 'hsl(220 12% 68%)',
                      fontFamily: "var(--font-outfit), sans-serif",
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {conversation.title}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'hsl(220 10% 38%)', marginTop: '0.2rem', fontFamily: "'JetBrains Mono', monospace" }}>
                    {conversation.message_count} msg · {formatDate(conversation.updated_at)}
                  </div>
                </div>

                <button
                  onClick={(e) => handleDelete(conversation.id, e)}
                  title="Delete"
                  style={{
                    opacity: 0,
                    padding: '0.2rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'hsl(0 50% 55%)',
                    fontSize: '0.7rem',
                    transition: 'opacity 0.15s ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0'; }}
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '0.6rem 1rem',
          borderTop: '1px solid rgba(255,255,255,0.045)',
          fontSize: '0.65rem',
          color: 'hsl(220 10% 30%)',
          textAlign: 'center',
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          flexShrink: 0,
        }}
      >
        Context Management
      </div>
    </div>
  );
}

