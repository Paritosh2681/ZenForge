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

function getApiBaseUrl(): string {
  // Use build-time env var if set and not the default localhost
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }
  // In browser: dynamically derive backend URL from current hostname
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Cloud Run pattern: replace 'frontend' with 'backend' in the service name
    if (host.includes('zenforge-frontend')) {
      return `${window.location.protocol}//${host.replace('zenforge-frontend', 'zenforge-backend')}`;
    }
  }
  // Fallback for local development
  return envUrl || 'http://localhost:8001';
}

const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ChatRequest {
  query: string;
  conversation_id?: string;
  document_ids?: string[];
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

export interface DocumentListItem {
  document_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  chunks_created: number;
  upload_date: string;
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

  async listDocuments(): Promise<{ documents: DocumentListItem[]; total: number }> {
    const response = await apiClient.get('/documents');
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

  // Phase 3: Code Execution
  async executeCode(code: string, language: string = 'python', conversationId?: string): Promise<{
    execution_id: string; output: string; error: string | null; execution_time: number; language: string;
  }> {
    const response = await apiClient.post('/code/execute', { code, language, conversation_id: conversationId });
    return response.data;
  },

  async getCodeHistory(conversationId?: string, limit: number = 20): Promise<{
    executions: any[]; count: number;
  }> {
    const params = new URLSearchParams();
    if (conversationId) params.append('conversation_id', conversationId);
    params.append('limit', limit.toString());
    const response = await apiClient.get(`/code/history?${params.toString()}`);
    return response.data;
  },

  // Phase 5: Study Planner
  async getStudyPlans(status?: string, daysAhead: number = 7): Promise<{
    plans: any[]; count: number;
  }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('days_ahead', daysAhead.toString());
    const response = await apiClient.get(`/planner/plans?${params.toString()}`);
    return response.data;
  },

  async createStudyPlan(plan: { topic_id?: string; title: string; description?: string; scheduled_date: string; duration_minutes?: number }): Promise<any> {
    const response = await apiClient.post('/planner/plans', plan);
    return response.data;
  },

  async updateStudyPlan(planId: string, update: { status?: string; scheduled_date?: string; duration_minutes?: number }): Promise<any> {
    const response = await apiClient.patch(`/planner/plans/${planId}`, update);
    return response.data;
  },

  async deleteStudyPlan(planId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/planner/plans/${planId}`);
    return response.data;
  },

  async generateStudyPlan(days: number = 7): Promise<{ plans_created: number; plans: any[] }> {
    const response = await apiClient.post(`/planner/generate?days=${days}`);
    return response.data;
  },

  // Phase 5: Gamification
  async getBadges(): Promise<{ badges: any[]; earned: number; total: number }> {
    const response = await apiClient.get('/gamification/badges');
    return response.data;
  },

  async checkBadges(): Promise<{ newly_earned: string[]; stats: any; count: number }> {
    const response = await apiClient.post('/gamification/check-badges');
    return response.data;
  },

  async getGamificationStats(): Promise<{
    badges_earned: number; total_badges: number; quizzes_completed: number;
    streak_days: number; total_study_minutes: number; topics_mastered: number; level: number;
  }> {
    const response = await apiClient.get('/gamification/stats');
    return response.data;
  },

  // Phase 4: Podcast Generation
  async generatePodcastScript(topic?: string, duration?: string, style?: string): Promise<{
    title: string; speakers: string[]; segments: { speaker: string; text: string }[];
    duration_estimate: string; style: string; segment_count: number;
  }> {
    const response = await apiClient.post('/podcast/generate-script', { topic, duration, style });
    return response.data;
  },

  // Phase 4: Protege Effect (Teach-Back Mode)
  async startProtegeSession(topic?: string, difficulty?: string): Promise<{
    topic: string; difficulty: string; ai_message: string; instructions: string;
  }> {
    const response = await apiClient.post('/protege/start', { topic, difficulty });
    return response.data;
  },

  async protegeEvaluate(sessionTopic: string, conversationHistory: { role: string; content: string }[]): Promise<{
    scores: Record<string, number>;
    overall_score: number;
    max_score: number;
    percentage: number;
    feedback: string;
    strengths: string;
    improvements: string;
    grade: string;
  }> {
    const response = await apiClient.post('/protege/evaluate', {
      session_topic: sessionTopic,
      conversation_history: conversationHistory
    });
    return response.data;
  },

  async protegeRespond(sessionTopic: string, userExplanation: string, history: { role: string; content: string }[]): Promise<{
    ai_message: string;
  }> {
    const response = await apiClient.post('/protege/respond', {
      session_topic: sessionTopic,
      user_explanation: userExplanation,
      conversation_history: history
    });
    return response.data;
  },

  async evaluateTeaching(sessionTopic: string, history: { role: string; content: string }[]): Promise<{
    scores: Record<string, number>; overall_score: number; max_score: number;
    percentage: number; feedback: string; strengths: string; improvements: string; grade: string;
  }> {
    const response = await apiClient.post('/protege/evaluate', {
      session_topic: sessionTopic, conversation_history: history
    });
    return response.data;
  },

  // Multimodal: TTS
  async synthesizeSpeech(text: string, language?: string): Promise<Blob> {
    const response = await apiClient.post('/multimodal/synthesize-speech',
      { text, language: language || 'en' },
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Badges system
  async checkBadgeProgress(): Promise<any> {
    const response = await apiClient.get('/badges/check-progress');
    return response.data;
  },

  // Document management
  async deleteDocument(documentId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/documents/${documentId}`);
    return response.data;
  },
};

export default api;
