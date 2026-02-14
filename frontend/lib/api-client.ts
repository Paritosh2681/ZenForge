import axios from 'axios';
import type {
  Conversation,
  ConversationDetail,
  ConversationList,
  ConversationCreateRequest,
  ConversationUpdateRequest,
  ContextInfo,
} from '@/types/conversation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ChatRequest {
  query: string;
  conversation_id?: string;
  include_sources?: boolean;
  generate_diagram?: boolean;
}

export interface SourceChunk {
  content: string;
  document_name: string;
  page_number?: number;
  similarity_score: number;
}

export interface ChatResponse {
  response: string;
  sources: SourceChunk[];
  mermaid_diagram?: string;
  conversation_id: string;
  timestamp: string;
}

export interface DocumentUploadResponse {
  document_id: string;
  filename: string;
  file_size: number;
  chunks_created: number;
  status: string;
  message: string;
}

export interface HealthCheck {
  ollama_connected: boolean;
  vector_db_status: string;
  documents_indexed: number;
}

// API Methods
export const api = {
  // Chat endpoints
  async sendQuery(request: ChatRequest): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>('/chat/query', request);
    return response.data;
  },

  async getHealth(): Promise<HealthCheck> {
    const response = await apiClient.get<HealthCheck>('/chat/health');
    return response.data;
  },

  // Document endpoints
  async uploadDocument(file: File): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<DocumentUploadResponse>(
      '/documents/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  async getDocumentCount(): Promise<{ total_chunks: number }> {
    const response = await apiClient.get('/documents/count');
    return response.data;
  },

  // Phase 3: Conversation Management endpoints
  async listConversations(
    limit?: number,
    offset?: number,
    include_archived?: boolean
  ): Promise<ConversationList> {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append('limit', limit.toString());
    if (offset !== undefined) params.append('offset', offset.toString());
    if (include_archived !== undefined) params.append('include_archived', include_archived.toString());

    const response = await apiClient.get<ConversationList>(
      `/conversations?${params.toString()}`
    );
    return response.data;
  },

  async createConversation(
    request?: ConversationCreateRequest
  ): Promise<Conversation> {
    const response = await apiClient.post<Conversation>('/conversations', request || {});
    return response.data;
  },

  async getConversation(conversationId: string): Promise<ConversationDetail> {
    const response = await apiClient.get<ConversationDetail>(
      `/conversations/${conversationId}`
    );
    return response.data;
  },

  async updateConversation(
    conversationId: string,
    request: ConversationUpdateRequest
  ): Promise<Conversation> {
    const response = await apiClient.patch<Conversation>(
      `/conversations/${conversationId}`,
      request
    );
    return response.data;
  },

  async deleteConversation(conversationId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/conversations/${conversationId}`);
    return response.data;
  },

  async getConversationContext(conversationId: string): Promise<ContextInfo> {
    const response = await apiClient.get<ContextInfo>(
      `/conversations/${conversationId}/context`
    );
    return response.data;
  },
};

export default api;
