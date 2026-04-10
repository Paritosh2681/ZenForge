'use client';

import { useState, useEffect } from 'react';
import { api, ChatResponse } from '@/lib/api-client';
import MermaidRenderer from './MermaidRenderer';
import SessionSidebar from './SessionSidebar';
import ConversationHeader from './ConversationHeader';
import ContextIndicator from './ContextIndicator';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mermaid_diagram?: string;
  sources?: any[];
  timestamp: Date;
}

interface ChatInterfaceProps {
  selectedDocumentIds?: string[];
  selectedDocumentNames?: string[];
  onClearDocumentScope?: () => void;
}

function sanitizeAssistantText(text: string): string {
  if (!text) return '';

  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const cleaned = lines.filter((line) => {
    const trimmed = line.trim().toLowerCase();
    if (!trimmed) return true;

    if (trimmed.startsWith('```mermaid') || trimmed === '```') return false;
    if (trimmed.startsWith('error: parse error')) return false;
    if (trimmed.startsWith('parse error on line')) return false;
    if (trimmed.startsWith('expecting ')) return false;
    if (trimmed.startsWith('mermaid syntax error')) return false;

    return true;
  });

  return cleaned.join('\n').trim();
}

export default function ChatInterface({
  selectedDocumentIds = [],
  selectedDocumentNames = [],
  onClearDocumentScope,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load conversation history when conversationId changes
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId]);

  const loadConversation = async (id: string) => {
    try {
      const conversation = await api.getConversation(id);

      // Convert backend messages to frontend format
      const loadedMessages: Message[] = conversation.messages.map((msg) => {
        const message: Message = {
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        };

        // Extract metadata if available
        if (msg.metadata) {
          if (msg.metadata.mermaid_diagram) {
            message.mermaid_diagram = msg.metadata.mermaid_diagram;
          }
          if (msg.metadata.sources) {
            message.sources = msg.metadata.sources;
          }
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
        document_ids: selectedDocumentIds.length > 0 ? selectedDocumentIds : undefined,
        include_sources: true,
        generate_diagram: true,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: sanitizeAssistantText(response.response),
        mermaid_diagram: response.mermaid_diagram,
        sources: response.sources,
        timestamp: new Date(response.timestamp),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update conversation ID if this is a new conversation
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
    <div className="flex h-full bg-[#080C14]">
      {/* Sidebar Toggle Button (Mobile) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-[#0D1421] dark:bg-[#0D1421] rounded-lg shadow-lg lg:hidden border border-white/10"
      >
        <svg
          className="w-6 h-6 text-gray-600 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {sidebarOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed lg:relative lg:translate-x-0
          w-80 h-full z-40 transition-transform duration-300
        `}
      >
        <SessionSidebar
          currentConversationId={conversationId}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header with Context Indicator */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#0D0D0D]">
          <div className="flex-1">
            <ConversationHeader conversationId={conversationId} />
          </div>
          <div className="px-4">
            <ContextIndicator conversationId={conversationId} />
          </div>
        </div>

        {selectedDocumentIds.length > 0 && (
          <div className="px-6 py-3 bg-[#22C55E]/10 border-b border-[#22C55E]/20 flex items-center justify-between gap-3">
            <div className="text-sm text-[#22C55E]/80 truncate">
              Scoped to: {selectedDocumentNames.length > 0 ? selectedDocumentNames.join(', ') : `${selectedDocumentIds.length} selected document(s)`}
            </div>
            {onClearDocumentScope && (
              <button
                type="button"
                onClick={onClearDocumentScope}
                className="text-xs px-2.5 py-1.5 rounded-md border border-[#22C55E]/30 hover:bg-[#22C55E]/10 text-[#22C55E] transition-colors"
              >
                Clear Scope
              </button>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0D0D0D]">
          {messages.length === 0 && (
            <div className="text-center mt-20">
              <h2 className="text-3xl font-display font-semibold tracking-tight text-[#22C55E] mb-3">Ask GuruCortex Anything</h2>
              <p className="text-slate-400 text-lg">Upload study materials and start asking questions!</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-lg p-4 space-y-4 animate-fade-in ${
                  message.role === 'user'
                    ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30'
                    : 'bg-[#0D1421] text-slate-200 border border-white/10'
                }`}
              >
                {message.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed prose-p:my-2 prose-headings:mb-3 prose-headings:mt-4 prose-ul:my-2 prose-li:my-0.5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Mermaid Diagram */}
                {message.mermaid_diagram && (
                  <div className="mt-4">
                    <MermaidRenderer chart={message.mermaid_diagram} />
                  </div>
                )}

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                    <div className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">
                      Sources:
                    </div>
                    <div className="space-y-2">
                      {message.sources.map((source, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-[#1A1A1A] p-2 rounded border border-white/10"
                        >
                          <div className="font-medium text-[#22C55E]">
                            {source.document_name}
                          </div>
                          <div className="text-slate-400 mt-1">
                            {source.content}
                          </div>
                          <div className="text-slate-500 mt-1">
                            Relevance: {(source.similarity_score * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#0D1421] rounded-lg p-4 border border-white/10">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-white/10 p-4 bg-[#0D0D0D]">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your study materials..."
              disabled={loading}
              className="flex-1 px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E] disabled:opacity-50 bg-[#0D1421] text-slate-200 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-[#22C55E] text-[#0D0D0D] rounded-lg font-medium hover:bg-[#22C55E]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
