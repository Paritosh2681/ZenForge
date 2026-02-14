# Phase 4: Smart Assessment & Learning Analytics

**Status**: 🚧 Planning
**Focus**: AI-Generated Assessments, Knowledge Tracking, Learning Analytics

---

## Vision

Transform Guru-Agent from a Q&A assistant into a comprehensive learning platform with:
- AI-generated quizzes from study materials
- Progress tracking and performance analytics
- Knowledge gap identification
- Spaced repetition scheduling
- Learning insights and recommendations

---

## Phase 4 Breakdown

### Week 1: Assessment Generation Backend (Priority: HIGH)
**Goal**: Generate quizzes from uploaded documents

**Features**:
- Quiz generation service (multiple choice, true/false, short answer)
- Question difficulty estimation (easy/medium/hard)
- Topic extraction from documents
- Question bank storage
- Quiz session management

**API Endpoints**:
```
POST   /assessments/generate        # Generate quiz from documents
GET    /assessments/quizzes         # List available quizzes
GET    /assessments/quizzes/{id}    # Get quiz details
POST   /assessments/sessions        # Start quiz session
POST   /assessments/sessions/{id}/submit  # Submit answer
GET    /assessments/sessions/{id}/results # Get results
```

**Database Schema**:
- `quizzes` - Generated quiz metadata
- `questions` - Individual questions with answers
- `quiz_sessions` - User quiz attempts
- `quiz_responses` - User answers to questions

---

### Week 2: Knowledge Tracking & Analytics (Priority: MEDIUM)
**Goal**: Track learning progress and identify gaps

**Features**:
- Knowledge graph from documents
- Topic mastery tracking
- Performance analytics
- Learning streaks
- Weak areas identification

**API Endpoints**:
```
GET    /analytics/overview          # Overall learning stats
GET    /analytics/topics            # Topic mastery breakdown
GET    /analytics/performance       # Performance over time
GET    /analytics/gaps              # Knowledge gaps identified
GET    /analytics/recommendations   # Learning recommendations
```

**Database Schema**:
- `topics` - Extracted topics from documents
- `topic_mastery` - User mastery levels per topic
- `learning_sessions` - Study session tracking
- `performance_metrics` - Aggregated performance data

---

### Week 3: Frontend Assessment UI (Priority: HIGH)
**Goal**: Interactive quiz interface and analytics dashboard

**Features**:
- Quiz taking interface
- Real-time feedback
- Performance dashboard
- Progress visualization
- Topic mastery charts

**Components**:
- `QuizInterface.tsx` - Take quizzes
- `QuizResults.tsx` - View results with explanations
- `AnalyticsDashboard.tsx` - Learning analytics
- `TopicMastery.tsx` - Topic-wise performance
- `ProgressTracker.tsx` - Timeline view

---

## Technical Architecture

### Quiz Generation Algorithm

```python
def generate_quiz(document_chunks, num_questions=10, difficulty='mixed'):
    # 1. Extract key concepts from chunks
    concepts = extract_concepts(document_chunks)

    # 2. Generate questions using LLM
    questions = []
    for concept in concepts[:num_questions]:
        question = llm.generate_question(
            concept=concept,
            context=document_chunks,
            difficulty=difficulty,
            type='multiple_choice'
        )
        questions.append(question)

    # 3. Validate and store
    quiz = create_quiz(questions)
    return quiz
```

### Knowledge Graph Structure

```
Documents
    ├── Topics
    │   ├── Subtopics
    │   │   ├── Concepts
    │   │   └── Facts
    │   └── Relationships
    └── Learning Objectives
```

### Spaced Repetition Formula

```python
# SM-2 Algorithm for optimal review intervals
def calculate_next_review(easiness_factor, interval, quality):
    if quality < 3:
        interval = 1  # Reset if answer was hard
    else:
        if interval == 0:
            interval = 1
        elif interval == 1:
            interval = 6
        else:
            interval = interval * easiness_factor

    easiness_factor = max(1.3, easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))

    return interval, easiness_factor
```

---

## Database Schema

### Quizzes & Questions

```sql
CREATE TABLE quizzes (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    document_ids TEXT,  -- JSON array
    difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard', 'mixed')),
    question_count INTEGER,
    created_at TIMESTAMP,
    metadata TEXT  -- JSON
);

CREATE TABLE questions (
    id TEXT PRIMARY KEY,
    quiz_id TEXT,
    question_text TEXT NOT NULL,
    question_type TEXT CHECK(question_type IN ('multiple_choice', 'true_false', 'short_answer')),
    difficulty TEXT,
    topic TEXT,
    options TEXT,  -- JSON array for multiple choice
    correct_answer TEXT,
    explanation TEXT,
    points INTEGER DEFAULT 1,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

CREATE TABLE quiz_sessions (
    id TEXT PRIMARY KEY,
    quiz_id TEXT,
    conversation_id TEXT,  -- Link to conversation
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    score INTEGER,
    max_score INTEGER,
    time_taken INTEGER,  -- seconds
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

CREATE TABLE quiz_responses (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    question_id TEXT,
    user_answer TEXT,
    is_correct BOOLEAN,
    time_taken INTEGER,
    timestamp TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES quiz_sessions(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
);
```

### Learning Analytics

```sql
CREATE TABLE topics (
    id TEXT PRIMARY KEY,
    name TEXT,
    category TEXT,
    document_ids TEXT,  -- JSON array
    concept_count INTEGER,
    created_at TIMESTAMP
);

CREATE TABLE topic_mastery (
    id TEXT PRIMARY KEY,
    topic_id TEXT,
    conversation_id TEXT,
    mastery_level REAL,  -- 0.0 to 1.0
    questions_answered INTEGER,
    correct_count INTEGER,
    last_reviewed TIMESTAMP,
    next_review TIMESTAMP,
    easiness_factor REAL,
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);

CREATE TABLE learning_sessions (
    id TEXT PRIMARY KEY,
    conversation_id TEXT,
    session_type TEXT,  -- 'quiz', 'chat', 'review'
    duration INTEGER,  -- seconds
    topics_covered TEXT,  -- JSON array
    started_at TIMESTAMP,
    ended_at TIMESTAMP
);
```

---

## Implementation Plan

### Week 1: Backend (Days 1-7)

**Day 1-2**: Quiz Generation Service
- Implement `AssessmentGenerator` service
- LLM prompt engineering for question generation
- Multiple choice, true/false, short answer support

**Day 3-4**: Database & Storage
- Create database schema
- Implement `QuizManager` for CRUD operations
- Session management

**Day 5**: API Routes
- Quiz generation endpoint
- Quiz listing and retrieval
- Session management endpoints

**Day 6**: Quiz Validation
- Answer checking logic
- Scoring system
- Difficulty estimation

**Day 7**: Testing & Documentation
- Unit tests for quiz generation
- API testing
- Write backend documentation

---

### Week 2: Analytics (Days 8-14)

**Day 8-9**: Topic Extraction
- NLP-based topic extraction from documents
- Topic relationship mapping
- Concept extraction

**Day 10-11**: Performance Tracking
- Calculate mastery levels
- Track performance over time
- Identify weak areas

**Day 12**: Spaced Repetition
- Implement SM-2 algorithm
- Schedule next review dates
- Track review history

**Day 13**: Analytics API
- Performance metrics endpoints
- Topic mastery endpoints
- Recommendations engine

**Day 14**: Testing & Optimization
- Test analytics calculations
- Optimize database queries
- Write analytics documentation

---

### Week 3: Frontend (Days 15-21)

**Day 15-16**: Quiz Interface
- Quiz taking component
- Question display (MCQ, T/F, short answer)
- Answer submission
- Timer component

**Day 17**: Results & Feedback
- Results display component
- Explanations for correct/incorrect answers
- Score visualization
- Retry/Review options

**Day 18-19**: Analytics Dashboard
- Overview dashboard
- Performance charts (Chart.js or Recharts)
- Topic mastery visualization
- Progress timeline

**Day 20**: Integration
- Connect all components
- State management (Context API or Zustand)
- Error handling
- Loading states

**Day 21**: Testing & Polish
- E2E testing
- UI/UX refinements
- Mobile responsiveness
- Dark mode support

---

## Sample LLM Prompts

### Multiple Choice Question Generation

```python
QUIZ_GENERATION_PROMPT = """
Based on the following educational content, generate a multiple-choice question.

Context:
{document_chunk}

Requirements:
- Question should test understanding, not memorization
- Difficulty: {difficulty}
- Provide 4 options (A, B, C, D)
- Mark the correct answer
- Provide a brief explanation

Format your response as JSON:
{
  "question": "...",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correct_answer": "A",
  "explanation": "...",
  "difficulty": "medium",
  "topic": "..."
}
"""
```

### Knowledge Gap Identification

```python
GAP_ANALYSIS_PROMPT = """
Analyze the student's performance data and identify knowledge gaps.

Topics Covered: {topics}
Performance Data:
{performance_data}

Identify:
1. Topics with low mastery (<60%)
2. Frequently confused concepts
3. Recommended areas for review
4. Suggested learning resources from available documents

Provide actionable learning recommendations.
"""
```

---

## Success Metrics

**Week 1 Completion**:
- ✅ Generate quizzes from documents
- ✅ Store quizzes in database
- ✅ API endpoints working
- ✅ Answer validation working
- ✅ 10+ unit tests passing

**Week 2 Completion**:
- ✅ Topic extraction functional
- ✅ Mastery tracking implemented
- ✅ Analytics calculations accurate
- ✅ Spaced repetition scheduling
- ✅ Recommendations engine working

**Week 3 Completion**:
- ✅ Quiz interface functional
- ✅ Analytics dashboard beautiful
- ✅ Mobile responsive
- ✅ Dark mode support
- ✅ E2E workflow tested

---

## User Workflows

### Taking a Quiz

1. User uploads study materials
2. User clicks "Generate Quiz" button
3. System analyzes documents and generates questions
4. User starts quiz session
5. User answers questions one-by-one
6. System provides real-time feedback
7. User completes quiz and views results
8. System updates mastery levels

### Viewing Analytics

1. User navigates to Analytics tab
2. Dashboard shows:
   - Overall performance score
   - Topic mastery breakdown
   - Learning streak
   - Weak areas highlighted
   - Recommended review topics
3. User drills down into specific topics
4. User sees performance trends over time
5. System suggests personalized quizzes

---

## Configuration

```python
# backend/app/config.py

# Phase 4: Assessment & Analytics
QUIZ_DEFAULT_QUESTIONS = 10
QUIZ_MIN_QUESTIONS = 5
QUIZ_MAX_QUESTIONS = 50
QUIZ_DIFFICULTY_LEVELS = ['easy', 'medium', 'hard', 'mixed']

# Topic extraction
TOPIC_EXTRACTION_MODEL = 'spacy_lg'  # or 'transformer'
MIN_TOPIC_CONFIDENCE = 0.6

# Mastery levels
MASTERY_THRESHOLD_BEGINNER = 0.3
MASTERY_THRESHOLD_INTERMEDIATE = 0.6
MASTERY_THRESHOLD_ADVANCED = 0.9

# Spaced repetition
SR_INTERVAL_BASE = 1  # days
SR_INTERVAL_MULTIPLIER = 2.5
SR_MIN_EASINESS = 1.3
```

---

## Tech Stack Additions

**Backend**:
- spaCy (topic extraction)
- scikit-learn (text analysis)
- FastAPI dependencies for quiz generation

**Frontend**:
- Chart.js or Recharts (analytics visualization)
- react-countdown (quiz timer)
- framer-motion (animations)

**Database**:
- Additional SQLite tables for quizzes and analytics
- Indexes for performance optimization

---

## Future Enhancements (Phase 5+)

- [ ] Adaptive difficulty (adjust based on performance)
- [ ] Collaborative quizzes (multiplayer mode)
- [ ] Gamification (badges, leaderboards)
- [ ] Export quiz results (PDF reports)
- [ ] Quiz sharing with friends
- [ ] Voice-based quiz taking
- [ ] AI tutor mode (explains wrong answers)
- [ ] Flashcard generation
- [ ] Study group features
- [ ] Mobile app with offline quizzes

---

## Development Priority

**Must Have** (v1.0):
- ✅ Quiz generation from documents
- ✅ MCQ and T/F questions
- ✅ Basic analytics dashboard
- ✅ Topic mastery tracking

**Should Have** (v1.1):
- Short answer questions
- Advanced analytics
- Spaced repetition scheduling
- Customizable quiz settings

**Nice to Have** (v2.0):
- Collaborative features
- Gamification
- Advanced visualizations
- AI-powered recommendations

---

## Estimated Effort

- **Week 1** (Backend): 30-35 hours
- **Week 2** (Analytics): 25-30 hours
- **Week 3** (Frontend): 30-35 hours
- **Total**: 85-100 hours (~2-3 weeks full-time)

---

## Questions to Resolve

1. Should quizzes be auto-generated or manually triggered?
2. How many questions per quiz by default?
3. Should we track individual users or per-conversation?
4. Time limits on quizzes - yes or no?
5. Allow quiz retakes - unlimited or limited?

---

**Phase 4 Goal**: Transform Guru-Agent into a complete learning platform with intelligent assessment and personalized analytics.

**Developer**: Abhishek
