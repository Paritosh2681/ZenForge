'use client';

import { useState, useEffect } from 'react';
import { api, ChatResponse } from '@/lib/api-client';
import type { Message as ConversationMessage } from '@/types/conversation';
import MermaidRenderer from './MermaidRenderer';
import SessionSidebar from './SessionSidebar';
import ConversationHeader from './ConversationHeader';
import ContextIndicator from './ContextIndicator';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mermaid_diagram?: string;
  sources?: any[];
  timestamp: Date;
}

const styles = {
  container: {
    display: 'flex',
    height: '100%',
    background: 'transparent',
    fontFamily: "var(--font-outfit), system-ui, sans-serif",
  } as React.CSSProperties,

  sidebar: (open: boolean): React.CSSProperties => ({
    width: open ? '280px' : '0',
    flexShrink: 0,
    overflow: 'hidden',
    transition: 'width 0.25s ease',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(8, 9, 18, 0.65)',
    backdropFilter: 'blur(20px)',
  }),

  toggleBtn: {
    position: 'fixed',
    top: '60px',
    left: '8px',
    zIndex: 50,
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    color: 'hsl(220 10% 50%)',
    transition: 'all 0.15s ease',
    fontSize: '0.75rem',
  } as React.CSSProperties,

  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: 'transparent',
  } as React.CSSProperties,

  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255,255,255,0.055)',
    background: 'rgba(8,9,18,0.55)',
    backdropFilter: 'blur(20px)',
    padding: '0 1rem',
    flexShrink: 0,
  } as React.CSSProperties,

  messages: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem',
  },

  emptyState: {
    margin: 'auto',
    textAlign: 'center' as const,
    paddingTop: '5rem',
  },

  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },

  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'hsl(220 15% 80%)',
    letterSpacing: '-0.02em',
    marginBottom: '0.4rem',
    fontFamily: "var(--font-outfit), sans-serif",
  },

  emptyText: {
    fontSize: '0.85rem',
    color: 'hsl(220 10% 46%)',
    fontFamily: "var(--font-outfit), sans-serif",
  },

  userBubble: {
    maxWidth: '70%',
    alignSelf: 'flex-end' as const,
    background: 'rgba(80,120,255,0.18)',
    border: '1px solid rgba(80,120,255,0.28)',
    padding: '0.85rem 1.25rem',
    color: 'hsl(220 20% 90%)',
    fontSize: '0.88rem',
    lineHeight: 1.65,
    fontFamily: "var(--font-outfit), sans-serif",
    whiteSpace: 'pre-wrap' as const,
    borderRadius: '1.5rem',
  },

  assistantBubble: {
    maxWidth: '78%',
    alignSelf: 'flex-start' as const,
    background: 'rgba(14,15,30,0.85)',
    border: '1px solid rgba(255,255,255,0.07)',
    padding: '0.85rem 1.25rem',
    color: 'hsl(220 12% 80%)',
    fontSize: '0.88rem',
    lineHeight: 1.7,
    fontFamily: "var(--font-outfit), sans-serif",
    whiteSpace: 'pre-wrap' as const,
    backdropFilter: 'blur(10px)',
    borderRadius: '1.5rem',
  },

  sourceCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    padding: '0.5rem 0.75rem',
    fontSize: '0.75rem',
    marginTop: '0.4rem',
  },

  sourceName: {
    fontWeight: 600,
    color: 'hsl(220 15% 75%)',
    fontFamily: "var(--font-outfit), sans-serif",
  },

  sourceText: {
    color: 'hsl(220 10% 50%)',
    marginTop: '0.2rem',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.72rem',
  },

  inputBar: {
    borderTop: '1px solid rgba(255,255,255,0.055)',
    padding: '1rem 1.25rem',
    background: 'rgba(8,9,18,0.65)',
    backdropFilter: 'blur(20px)',
    flexShrink: 0,
  } as React.CSSProperties,

  inputRow: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    padding: '0.65rem 1rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    color: 'hsl(220 15% 85%)',
    fontSize: '0.88rem',
    fontFamily: "var(--font-outfit), sans-serif",
    outline: 'none',
    transition: 'border-color 0.15s ease',
    borderRadius: 0,
  },

  sendBtn: (disabled: boolean): React.CSSProperties => ({
    padding: '0.65rem 1.5rem',
    background: disabled ? 'rgba(80,120,255,0.12)' : 'hsl(220 80% 62%)',
    color: disabled ? 'hsl(220 10% 40%)' : 'hsl(230 20% 4%)',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.85rem',
    fontFamily: "var(--font-outfit), sans-serif",
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: '9999px',
    transition: 'all 0.15s ease',
    letterSpacing: '0.01em',
  }),

  loadingDots: {
    display: 'flex',
    gap: '0.35rem',
    padding: '0.75rem 1rem',
    background: 'rgba(14,15,30,0.85)',
    border: '1px solid rgba(255,255,255,0.07)',
    alignSelf: 'flex-start' as const,
  },
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId]);

  const loadConversation = async (id: string) => {
    try {
      const conversation = await api.getConversation(id);
      const loadedMessages: Message[] = conversation.messages.map((msg) => {
        const message: Message = {
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        };
        if (msg.metadata) {
          if (msg.metadata.mermaid_diagram) message.mermaid_diagram = msg.metadata.mermaid_diagram;
          if (msg.metadata.sources) message.sources = msg.metadata.sources;
        }
        return message;
      });
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleNewConversation = () => {
    setConversationId(undefined);
    setMessages([]);
  };

  const handleConversationSelect = (id: string) => {
    setConversationId(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response: ChatResponse = await api.sendQuery({
        query: input,
        conversation_id: conversationId,
        include_sources: true,
        generate_diagram: true,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        mermaid_diagram: response.mermaid_diagram,
        sources: response.sources,
        timestamp: new Date(response.timestamp),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (!conversationId) {
        setConversationId(response.conversation_id);
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error.response?.data?.detail || 'Failed to get response. Make sure the backend is running and Ollama is active.'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={styles.toggleBtn}
        className="lg:hidden"
        title="Toggle sidebar"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <div style={styles.sidebar(sidebarOpen)}>
        <SessionSidebar
          currentConversationId={conversationId}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Chat area */}
      <div style={styles.chatArea}>
        {/* Chat header */}
        <div style={styles.chatHeader}>
          <div style={{ flex: 1 }}>
            <ConversationHeader conversationId={conversationId} />
          </div>
          <div style={{ padding: '0 0.5rem' }}>
            <ContextIndicator conversationId={conversationId} />
          </div>
        </div>

        {/* Messages */}
        <div style={styles.messages}>
          {messages.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyTitle}>Ask GuruCortex</div>
              <div style={styles.emptyText}>Upload study materials and start asking questions.</div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              style={message.role === 'user' ? styles.userBubble : styles.assistantBubble}
            >
              <div>{message.content}</div>

              {message.mermaid_diagram && (
                <div style={{ marginTop: '1rem' }}>
                  <MermaidRenderer chart={message.mermaid_diagram} />
                </div>
              )}

              {message.sources && message.sources.length > 0 && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'hsl(220 10% 42%)', fontFamily: "'JetBrains Mono', monospace", marginBottom: '0.5rem' }}>
                    Sources
                  </div>
                  {message.sources.map((source, idx) => (
                    <div key={idx} style={styles.sourceCard}>
                      <div style={styles.sourceName}>{source.document_name}</div>
                      <div style={styles.sourceText}>{source.content}</div>
                      <div style={{ color: 'hsl(220 10% 38%)', fontSize: '0.68rem', marginTop: '0.2rem', fontFamily: "'JetBrains Mono', monospace" }}>
                        Relevance: {(source.similarity_score * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={styles.loadingDots}>
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
              <span style={{ fontSize: '0.8rem', color: 'hsl(220 15% 75%)', fontFamily: "var(--font-outfit), sans-serif", marginLeft: '0.5rem' }}>
                GuruCortex is thinking...
              </span>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div style={styles.inputBar}>
          <form onSubmit={handleSubmit} style={styles.inputRow}>
            <input
              type="text"
              className="rounded-full"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your study materials..."
              disabled={loading}
              style={styles.input}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(80,120,255,0.35)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}
            />
            <button
              type="submit"
              className="rounded-full"
              disabled={loading || !input.trim()}
              style={styles.sendBtn(loading || !input.trim())}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

