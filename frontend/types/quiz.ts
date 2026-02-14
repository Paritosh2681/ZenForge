// Phase 4: Quiz & Assessment Types
// Corresponds to backend/app/models/quiz_schemas.py

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  difficulty: string;
  topic?: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  document_ids: string[];
  difficulty: string;
  question_count: number;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface QuizDetail extends Quiz {
  questions: Question[];
}

export interface QuizCreateRequest {
  document_ids?: string[];
  num_questions?: number;
  difficulty?: string;
  question_types?: string[];
  topics?: string[];
  title?: string;
  description?: string;
}

export interface QuizList {
  quizzes: Quiz[];
  total: number;
}

export interface QuizSession {
  id: string;
  quiz_id: string;
  conversation_id?: string;
  started_at: string;
  completed_at?: string;
  score?: number;
  max_score?: number;
  time_taken?: number;
}

export interface QuizSessionStart {
  quiz_id: string;
  conversation_id?: string;
}

export interface QuestionResponse {
  id: string;
  session_id: string;
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  time_taken?: number;
  timestamp: string;
}

export interface AnswerSubmit {
  question_id: string;
  user_answer: string;
  time_taken?: number;
}

export interface QuizResults {
  session: QuizSession;
  responses: QuestionResponse[];
  questions: Question[];
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  time_taken: number;
}
