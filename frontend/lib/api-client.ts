import axios from 'axios';
import type {
  Conversation,
  ConversationDetail,
  ConversationList,
  ConversationCreateRequest,
  ConversationUpdateRequest,
  ContextInfo,
} from '@/types/conversation';
import type {
  Quiz,
  QuizDetail,
  QuizList,
  QuizCreateRequest,
  QuizSession,
  QuizSessionStart,
  AnswerSubmit,
  QuestionResponse,
  QuizResults,
} from '@/types/quiz';
import type {
  Topic,
  TopicMastery,
  OverallStats,
  TopicPerformance,
  QuizHistoryItem,
  LearningRecommendations,
  ExtractedTopic,
  MasteryUpdate,
} from '@/types/analytics';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

  // Phase 4: Assessment & Quiz endpoints
  async generateQuiz(request: QuizCreateRequest): Promise<Quiz> {
    const response = await apiClient.post<Quiz>('/assessments/generate', request);
    return response.data;
  },

  async listQuizzes(limit?: number, offset?: number): Promise<QuizList> {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append('limit', limit.toString());
    if (offset !== undefined) params.append('offset', offset.toString());

    const response = await apiClient.get<QuizList>(
      `/assessments/quizzes?${params.toString()}`
    );
    return response.data;
  },

  async getQuiz(quizId: string, includeAnswers: boolean = false): Promise<QuizDetail> {
    const params = new URLSearchParams();
    if (includeAnswers) params.append('include_answers', 'true');

    const response = await apiClient.get<QuizDetail>(
      `/assessments/quizzes/${quizId}?${params.toString()}`
    );
    return response.data;
  },

  async deleteQuiz(quizId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/assessments/quizzes/${quizId}`);
    return response.data;
  },

  async startQuizSession(request: QuizSessionStart): Promise<QuizSession> {
    const response = await apiClient.post<QuizSession>('/assessments/sessions', request);
    return response.data;
  },

  async submitAnswer(sessionId: string, answer: AnswerSubmit): Promise<QuestionResponse> {
    const response = await apiClient.post<QuestionResponse>(
      `/assessments/sessions/${sessionId}/submit`,
      answer
    );
    return response.data;
  },

  async completeQuiz(sessionId: string): Promise<QuizResults> {
    const response = await apiClient.post<QuizResults>(
      `/assessments/sessions/${sessionId}/complete`
    );
    return response.data;
  },

  async getQuizResults(sessionId: string): Promise<QuizResults> {
    const response = await apiClient.get<QuizResults>(
      `/assessments/sessions/${sessionId}/results`
    );
    return response.data;
  },

  // Phase 4 Week 2: Learning Analytics endpoints
  async getOverallStats(conversationId?: string, days: number = 30): Promise<OverallStats> {
    const params = new URLSearchParams();
    if (conversationId) params.append('conversation_id', conversationId);
    params.append('days', days.toString());

    const response = await apiClient.get<OverallStats>(
      `/analytics/stats?${params.toString()}`
    );
    return response.data;
  },

  async getAllTopics(limit: number = 100): Promise<{ topics: Topic[]; total: number }> {
    const response = await apiClient.get(`/analytics/topics?limit=${limit}`);
    return response.data;
  },

  async extractTopics(
    documentIds?: string[],
    maxTopics: number = 10
  ): Promise<{ topics: ExtractedTopic[]; count: number }> {
    const response = await apiClient.post('/analytics/topics/extract', {
      document_ids: documentIds,
      max_topics: maxTopics,
    });
    return response.data;
  },

  async extractQuizTopics(quizId: string): Promise<{ topics: string[]; count: number }> {
    const response = await apiClient.post(`/analytics/topics/extract-quiz/${quizId}`);
    return response.data;
  },

  async getAllMastery(
    conversationId?: string,
    limit: number = 100
  ): Promise<{ mastery: TopicMastery[]; total: number }> {
    const params = new URLSearchParams();
    if (conversationId) params.append('conversation_id', conversationId);
    params.append('limit', limit.toString());

    const response = await apiClient.get(`/analytics/mastery?${params.toString()}`);
    return response.data;
  },

  async getTopicMastery(topicId: string, conversationId?: string): Promise<TopicMastery> {
    const params = new URLSearchParams();
    if (conversationId) params.append('conversation_id', conversationId);

    const response = await apiClient.get<TopicMastery>(
      `/analytics/mastery/topic/${topicId}?${params.toString()}`
    );
    return response.data;
  },

  async getTopicsForReview(
    conversationId?: string,
    limit: number = 10
  ): Promise<{ topics: TopicMastery[]; count: number; should_review: boolean }> {
    const params = new URLSearchParams();
    if (conversationId) params.append('conversation_id', conversationId);
    params.append('limit', limit.toString());

    const response = await apiClient.get(`/analytics/mastery/review?${params.toString()}`);
    return response.data;
  },

  async updateMasteryFromSession(sessionId: string): Promise<MasteryUpdate> {
    const response = await apiClient.post<MasteryUpdate>(
      `/analytics/mastery/update-session/${sessionId}`
    );
    return response.data;
  },

  async getTopicPerformance(
    conversationId?: string,
    limit: number = 20
  ): Promise<{ topics: TopicPerformance[]; count: number }> {
    const params = new URLSearchParams();
    if (conversationId) params.append('conversation_id', conversationId);
    params.append('limit', limit.toString());

    const response = await apiClient.get(`/analytics/performance/topics?${params.toString()}`);
    return response.data;
  },

  async getQuizHistory(
    conversationId?: string,
    limit: number = 20
  ): Promise<{ quizzes: QuizHistoryItem[]; count: number }> {
    const params = new URLSearchParams();
    if (conversationId) params.append('conversation_id', conversationId);
    params.append('limit', limit.toString());

    const response = await apiClient.get(`/analytics/performance/quizzes?${params.toString()}`);
    return response.data;
  },

  async getRecommendations(conversationId?: string): Promise<LearningRecommendations> {
    const params = new URLSearchParams();
    if (conversationId) params.append('conversation_id', conversationId);

    const response = await apiClient.get<LearningRecommendations>(
      `/analytics/recommendations?${params.toString()}`
    );
    return response.data;
  },
};

export default api;
