import axios from 'axios';

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
};

export default api;
