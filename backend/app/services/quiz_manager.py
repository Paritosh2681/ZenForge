"""
Quiz Manager Service - CRUD operations for quizzes and sessions
Phase 4: Week 1
"""
import json
import logging
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.services.database import Database
from app.models.quiz_schemas import (
    Quiz, QuizDetail, Question, QuizSession, QuestionResponse,
    QuizResults, QuestionCreate
)
from app.config import settings

logger = logging.getLogger(__name__)


class QuizManager:
    """Manage quizzes, sessions, and responses"""

    def __init__(self):
        self.db = Database()

    async def create_quiz(
        self,
        title: str,
        questions: List[QuestionCreate],
        description: Optional[str] = None,
        document_ids: Optional[List[str]] = None,
        difficulty: str = 'mixed',
        metadata: Optional[Dict[str, Any]] = None
    ) -> Quiz:
        """Create a new quiz with questions"""

        quiz_id = str(uuid.uuid4())
        question_count = len(questions)

        conn = await self.db.connect()

        try:
            # Insert quiz
            await conn.execute(
                """INSERT INTO quizzes (id, title, description, document_ids, difficulty, question_count, metadata)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    quiz_id,
                    title,
                    description,
                    json.dumps(document_ids or []),
                    difficulty,
                    question_count,
                    json.dumps(metadata or {})
                )
            )

            # Insert questions
            for question in questions:
                question_id = str(uuid.uuid4())
                await conn.execute(
                    """INSERT INTO questions
                       (id, quiz_id, question_text, question_type, difficulty, topic,
                        options, correct_answer, explanation, points)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        question_id,
                        quiz_id,
                        question.question_text,
                        question.question_type,
                        question.difficulty,
                        question.topic,
                        json.dumps(question.options) if question.options else None,
                        question.correct_answer,
                        question.explanation,
                        question.points
                    )
                )

            await conn.commit()

            logger.info(f"Created quiz {quiz_id} with {question_count} questions")

            return await self.get_quiz(quiz_id)

        except Exception as e:
            await conn.rollback()
            logger.error(f"Failed to create quiz: {e}")
            raise
        finally:
            await conn.close()

    async def get_quiz(self, quiz_id: str) -> Optional[Quiz]:
        """Get quiz metadata (without questions)"""

        conn = await self.db.connect()

        try:
            cursor = await conn.execute(
                """SELECT id, title, description, document_ids, difficulty, question_count,
                          created_at, metadata
                   FROM quizzes WHERE id = ?""",
                (quiz_id,)
            )
            row = await cursor.fetchone()

            if not row:
                return None

            return Quiz(
                id=row[0],
                title=row[1],
                description=row[2],
                document_ids=json.loads(row[3]) if row[3] else [],
                difficulty=row[4],
                question_count=row[5],
                created_at=datetime.fromisoformat(row[6]),
                metadata=json.loads(row[7]) if row[7] else {}
            )

        finally:
            await conn.close()

    async def get_quiz_with_questions(self, quiz_id: str) -> Optional[QuizDetail]:
        """Get quiz with all questions"""

        quiz = await self.get_quiz(quiz_id)
        if not quiz:
            return None

        questions = await self._get_quiz_questions(quiz_id)

        return QuizDetail(
            **quiz.dict(),
            questions=questions
        )

    async def _get_quiz_questions(self, quiz_id: str) -> List[Question]:
        """Get all questions for a quiz"""

        conn = await self.db.connect()

        try:
            cursor = await conn.execute(
                """SELECT id, quiz_id, question_text, question_type, difficulty, topic,
                          options, correct_answer, explanation, points
                   FROM questions WHERE quiz_id = ?
                   ORDER BY id""",
                (quiz_id,)
            )
            rows = await cursor.fetchall()

            questions = []
            for row in rows:
                questions.append(Question(
                    id=row[0],
                    quiz_id=row[1],
                    question_text=row[2],
                    question_type=row[3],
                    difficulty=row[4],
                    topic=row[5],
                    options=json.loads(row[6]) if row[6] else None,
                    correct_answer=row[7],
                    explanation=row[8],
                    points=row[9]
                ))

            return questions

        finally:
            await conn.close()

    async def list_quizzes(
        self,
        limit: int = 50,
        offset: int = 0
    ) -> tuple[List[Quiz], int]:
        """List all quizzes with pagination"""

        conn = await self.db.connect()

        try:
            # Get total count
            cursor = await conn.execute("SELECT COUNT(*) FROM quizzes")
            total = (await cursor.fetchone())[0]

            # Get quizzes
            cursor = await conn.execute(
                """SELECT id, title, description, document_ids, difficulty, question_count,
                          created_at, metadata
                   FROM quizzes
                   ORDER BY created_at DESC
                   LIMIT ? OFFSET ?""",
                (limit, offset)
            )
            rows = await cursor.fetchall()

            quizzes = []
            for row in rows:
                quizzes.append(Quiz(
                    id=row[0],
                    title=row[1],
                    description=row[2],
                    document_ids=json.loads(row[3]) if row[3] else [],
                    difficulty=row[4],
                    question_count=row[5],
                    created_at=datetime.fromisoformat(row[6]),
                    metadata=json.loads(row[7]) if row[7] else {}
                ))

            return quizzes, total

        finally:
            await conn.close()

    async def delete_quiz(self, quiz_id: str) -> bool:
        """Delete a quiz and all associated data"""

        conn = await self.db.connect()

        try:
            await conn.execute("DELETE FROM quizzes WHERE id = ?", (quiz_id,))
            await conn.commit()
            logger.info(f"Deleted quiz {quiz_id}")
            return True

        except Exception as e:
            await conn.rollback()
            logger.error(f"Failed to delete quiz: {e}")
            return False
        finally:
            await conn.close()

    # Quiz Session Management

    async def start_quiz_session(
        self,
        quiz_id: str,
        conversation_id: Optional[str] = None
    ) -> QuizSession:
        """Start a new quiz session"""

        session_id = str(uuid.uuid4())

        conn = await self.db.connect()

        try:
            await conn.execute(
                """INSERT INTO quiz_sessions (id, quiz_id, conversation_id, started_at)
                   VALUES (?, ?, ?, CURRENT_TIMESTAMP)""",
                (session_id, quiz_id, conversation_id)
            )
            await conn.commit()

            logger.info(f"Started quiz session {session_id} for quiz {quiz_id}")

            return await self.get_quiz_session(session_id)

        except Exception as e:
            await conn.rollback()
            logger.error(f"Failed to start quiz session: {e}")
            raise
        finally:
            await conn.close()

    async def get_quiz_session(self, session_id: str) -> Optional[QuizSession]:
        """Get quiz session details"""

        conn = await self.db.connect()

        try:
            cursor = await conn.execute(
                """SELECT id, quiz_id, conversation_id, started_at, completed_at,
                          score, max_score, time_taken
                   FROM quiz_sessions WHERE id = ?""",
                (session_id,)
            )
            row = await cursor.fetchone()

            if not row:
                return None

            return QuizSession(
                id=row[0],
                quiz_id=row[1],
                conversation_id=row[2],
                started_at=datetime.fromisoformat(row[3]),
                completed_at=datetime.fromisoformat(row[4]) if row[4] else None,
                score=row[5],
                max_score=row[6],
                time_taken=row[7]
            )

        finally:
            await conn.close()

    async def submit_answer(
        self,
        session_id: str,
        question_id: str,
        user_answer: str,
        time_taken: Optional[int] = None
    ) -> QuestionResponse:
        """Submit an answer to a question"""

        # Get correct answer
        conn = await self.db.connect()

        try:
            cursor = await conn.execute(
                "SELECT correct_answer FROM questions WHERE id = ?",
                (question_id,)
            )
            row = await cursor.fetchone()

            if not row:
                raise ValueError(f"Question {question_id} not found")

            correct_answer = row[0]

            # Check if answer is correct
            is_correct = self._check_answer(user_answer, correct_answer)

            # Save response
            response_id = str(uuid.uuid4())
            await conn.execute(
                """INSERT INTO quiz_responses
                   (id, session_id, question_id, user_answer, is_correct, time_taken, timestamp)
                   VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)""",
                (response_id, session_id, question_id, user_answer, is_correct, time_taken)
            )
            await conn.commit()

            # Get the created response
            cursor = await conn.execute(
                """SELECT id, session_id, question_id, user_answer, is_correct,
                          time_taken, timestamp
                   FROM quiz_responses WHERE id = ?""",
                (response_id,)
            )
            row = await cursor.fetchone()

            return QuestionResponse(
                id=row[0],
                session_id=row[1],
                question_id=row[2],
                user_answer=row[3],
                is_correct=bool(row[4]),
                time_taken=row[5],
                timestamp=datetime.fromisoformat(row[6])
            )

        finally:
            await conn.close()

    async def complete_quiz_session(
        self,
        session_id: str
    ) -> QuizResults:
        """Complete quiz session and calculate results"""

        conn = await self.db.connect()

        try:
            # Get session
            session = await self.get_quiz_session(session_id)
            if not session:
                raise ValueError(f"Session {session_id} not found")

            # Get all responses
            cursor = await conn.execute(
                """SELECT id, session_id, question_id, user_answer, is_correct,
                          time_taken, timestamp
                   FROM quiz_responses WHERE session_id = ?""",
                (session_id,)
            )
            rows = await cursor.fetchall()

            responses = []
            for row in rows:
                responses.append(QuestionResponse(
                    id=row[0],
                    session_id=row[1],
                    question_id=row[2],
                    user_answer=row[3],
                    is_correct=bool(row[4]),
                    time_taken=row[5],
                    timestamp=datetime.fromisoformat(row[6])
                ))

            # Get quiz questions and calculate score
            quiz = await self.get_quiz_with_questions(session.quiz_id)
            if not quiz:
                raise ValueError(f"Quiz {session.quiz_id} not found")

            score = sum(
                q.points for q in quiz.questions
                for r in responses
                if r.question_id == q.id and r.is_correct
            )
            max_score = sum(q.points for q in quiz.questions)

            # Calculate time taken
            time_taken = int((datetime.utcnow() - session.started_at).total_seconds())

            # Update session
            await conn.execute(
                """UPDATE quiz_sessions
                   SET completed_at = CURRENT_TIMESTAMP, score = ?, max_score = ?,
                       time_taken = ?
                   WHERE id = ?""",
                (score, max_score, time_taken, session_id)
            )
            await conn.commit()

            # Calculate percentage and pass/fail
            percentage = (score / max_score * 100) if max_score > 0 else 0
            passed = percentage >= 60  # 60% passing threshold

            return QuizResults(
                session=await self.get_quiz_session(session_id),
                responses=responses,
                questions=quiz.questions,
                score=score,
                max_score=max_score,
                percentage=percentage,
                passed=passed,
                time_taken=time_taken
            )

        except Exception as e:
            await conn.rollback()
            logger.error(f"Failed to complete quiz session: {e}")
            raise
        finally:
            await conn.close()

    def _check_answer(self, user_answer: str, correct_answer: str) -> bool:
        """Check if user answer matches correct answer"""
        # Normalize answers for comparison
        user = user_answer.strip().lower()
        correct = correct_answer.strip().lower()

        # For multiple choice, compare just the letter
        if len(correct) == 1 and correct.isalpha():
            # Extract letter from user answer (e.g., "A)" -> "a")
            user_letter = ''.join(c for c in user if c.isalpha())[:1].lower()
            return user_letter == correct

        # For true/false
        if correct in ['true', 'false']:
            return user == correct

        # For short answer, check if key terms are present
        # In production, use more sophisticated NLP matching
        return user == correct
