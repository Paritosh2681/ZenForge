// Phase 3: Conversation Management Types
// Corresponds to backend/app/models/conversation_schemas.py

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  token_count?: number;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  is_archived: boolean;
  metadata?: Record<string, any>;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export interface ConversationList {
  conversations: Conversation[];
  total: number;
}

export interface ContextInfo {
  total_tokens: number;
  max_tokens: number;
  message_count: number;
  context_window_messages: number;
  utilization_percent: number;
}

export interface ContextSummary {
  id: string;
  conversation_id: string;
  summary_text: string;
  messages_covered: number;
  created_at: string;
}

export interface ConversationCreateRequest {
  title?: string;
  metadata?: Record<string, any>;
}

export interface ConversationUpdateRequest {
  title?: string;
  is_archived?: boolean;
  metadata?: Record<string, any>;
}
