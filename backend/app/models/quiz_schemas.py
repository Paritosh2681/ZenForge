"""
Pydantic schemas for Phase 4: Quiz & Assessment system
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# Question Types
class QuestionOption(BaseModel):
    """Single option for multiple choice question"""
    label: str  # A, B, C, D
    text: str


class Question(BaseModel):
    """Individual quiz question"""
    id: str
    quiz_id: str
    question_text: str
    question_type: str  # 'multiple_choice', 'true_false', 'short_answer'
    difficulty: str  # 'easy', 'medium', 'hard'
    topic: Optional[str] = None
    options: Optional[List[str]] = None  # For multiple choice
    correct_answer: str
    explanation: str
    points: int = 1


class QuestionCreate(BaseModel):
    """Schema for creating a question"""
    question_text: str
    question_type: str
    difficulty: str
    topic: Optional[str] = None
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: str
    points: int = 1


# Quiz Types
class Quiz(BaseModel):
    """Quiz metadata"""
    id: str
    title: str
    description: Optional[str] = None
    document_ids: List[str]
    difficulty: str
    question_count: int
    created_at: datetime
    metadata: Optional[dict] = None


class QuizDetail(Quiz):
    """Quiz with all questions"""
    questions: List[Question]


class QuizCreate(BaseModel):
    """Schema for creating/generating a quiz"""
    document_ids: Optional[List[str]] = None  # If empty, use all documents
    num_questions: int = Field(default=10, ge=5, le=50)
    difficulty: str = 'mixed'  # 'easy', 'medium', 'hard', 'mixed'
    question_types: Optional[List[str]] = None  # Filter question types
    topics: Optional[List[str]] = None  # Focus on specific topics
    title: Optional[str] = None
    description: Optional[str] = None


class QuizList(BaseModel):
    """List of quizzes"""
    quizzes: List[Quiz]
    total: int


# Quiz Session Types
class QuizSession(BaseModel):
    """Quiz attempt/session"""
    id: str
    quiz_id: str
    conversation_id: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    score: Optional[int] = None
    max_score: Optional[int] = None
    time_taken: Optional[int] = None  # seconds


class QuizSessionStart(BaseModel):
    """Start a quiz session"""
    quiz_id: str
    conversation_id: Optional[str] = None


class QuestionResponse(BaseModel):
    """User's answer to a question"""
    id: str
    session_id: str
    question_id: str
    user_answer: str
    is_correct: bool
    time_taken: Optional[int] = None
    timestamp: datetime


class AnswerSubmit(BaseModel):
    """Submit an answer"""
    question_id: str
    user_answer: str
    time_taken: Optional[int] = None  # seconds


class QuizResults(BaseModel):
    """Complete quiz results"""
    session: QuizSession
    responses: List[QuestionResponse]
    questions: List[Question]  # Include correct answers and explanations
    score: int
    max_score: int
    percentage: float
    passed: bool
    time_taken: int


# Topic & Mastery Types
class Topic(BaseModel):
    """Learning topic"""
    id: str
    name: str
    category: Optional[str] = None
    document_ids: List[str]
    concept_count: int
    created_at: datetime


class TopicMastery(BaseModel):
    """User's mastery of a topic"""
    id: str
    topic_id: str
    conversation_id: Optional[str] = None
    mastery_level: float  # 0.0 to 1.0
    questions_answered: int
    correct_count: int
    last_reviewed: Optional[datetime] = None
    next_review: Optional[datetime] = None
    easiness_factor: float


class TopicMasteryDetail(TopicMastery):
    """Topic mastery with topic info"""
    topic: Topic
    accuracy: float  # Calculated
    mastery_label: str  # 'Beginner', 'Intermediate', 'Advanced'


# Analytics Types
class PerformanceOverview(BaseModel):
    """Overall learning performance"""
    total_quizzes: int
    total_questions: int
    total_correct: int
    average_score: float
    topics_mastered: int
    total_topics: int
    current_streak: int  # days
    total_study_time: int  # minutes


class TopicPerformance(BaseModel):
    """Performance for a specific topic"""
    topic: Topic
    mastery: TopicMastery
    recent_accuracy: float
    questions_answered: int
    needs_review: bool


class LearningRecommendation(BaseModel):
    """Personalized learning recommendation"""
    type: str  # 'weak_topic', 'spaced_repetition', 'new_material'
    topic: Optional[Topic] = None
    reason: str
    suggested_action: str
    priority: int  # 1-5, 5 being highest
