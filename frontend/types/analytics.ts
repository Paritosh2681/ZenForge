// Phase 4: Learning Analytics Types
// Corresponds to backend analytics services

export interface Topic {
  id: string;
  name: string;
  category: string;
  concept_count: number;
  created_at: string;
  learners?: number;
  avg_mastery?: number;
}

export interface TopicMastery {
  id: string;
  topic_id: string;
  topic_name?: string;
  category?: string;
  conversation_id?: string;
  mastery_level: number;
  questions_answered: number;
  correct_count: number;
  last_reviewed?: string;
  next_review?: string;
  easiness_factor: number;
}

export interface OverallStats {
  quizzes: {
    total: number;
    completed: number;
    avg_score: number;
    recent: number;
  };
  questions: {
    total: number;
    correct: number;
    accuracy: number;
    avg_time: number;
  };
  topics: {
    learning: number;
    mastered: number;
    struggling: number;
    avg_mastery: number;
  };
  engagement: {
    streak_days: number;
    last_activity?: string;
  };
  period_days: number;
}

export interface TopicPerformance {
  name: string;
  category: string;
  mastery_level: number;
  questions_answered: number;
  correct_count: number;
  accuracy: number;
  next_review?: string;
  status: string; // "Mastered" | "Proficient" | "Learning" | "Beginner"
}

export interface QuizHistoryItem {
  session_id: string;
  title: string;
  started_at: string;
  completed_at: string;
  score: number;
  max_score: number;
  percentage: number;
  time_taken: number;
  passed: boolean;
}

export interface LearningRecommendations {
  topics_to_review: {
    name: string;
    mastery_level: number;
    next_review?: string;
  }[];
  suggested_difficulty: string;
  study_tips: string[];
  should_practice: boolean;
}

export interface ExtractedTopic {
  id?: string;
  name: string;
  category: string;
  confidence: number;
}

export interface MasteryUpdate {
  session_id: string;
  topics_updated: number;
  updates: {
    topic: string;
    questions: number;
    correct: number;
    mastery_level: number;
  }[];
}
