"""
Assessment API Router - Endpoints for quiz generation and management
Phase 4: Week 1
"""
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from app.models.quiz_schemas import (
    QuizCreate, Quiz, QuizDetail, QuizList,
    QuizSessionStart, QuizSession, AnswerSubmit,
    QuestionResponse, QuizResults
)
from app.services.assessment_generator import AssessmentGenerator
from app.services.quiz_manager import QuizManager
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assessments", tags=["assessments"])

# Initialize services
assessment_generator = AssessmentGenerator()
quiz_manager = QuizManager()


@router.post("/generate")
async def generate_quiz(request: QuizCreate) -> Quiz:
    """
    Generate a new quiz from uploaded documents

    - **document_ids**: Specific documents to use (empty = all documents)
    - **num_questions**: Number of questions (5-50, default 10)
    - **difficulty**: easy, medium, hard, or mixed
    - **question_types**: Types to include (multiple_choice, true_false, short_answer)
    """
    try:
        # Validate number of questions
        if request.num_questions < settings.QUIZ_MIN_QUESTIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Minimum {settings.QUIZ_MIN_QUESTIONS} questions required"
            )
        if request.num_questions > settings.QUIZ_MAX_QUESTIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Maximum {settings.QUIZ_MAX_QUESTIONS} questions allowed"
            )

        # Validate difficulty
        if request.difficulty not in settings.QUIZ_DIFFICULTY_LEVELS:
            raise HTTPException(
                status_code=400,
                detail=f"Difficulty must be one of: {settings.QUIZ_DIFFICULTY_LEVELS}"
            )

        logger.info(f"Generating quiz: {request.num_questions} questions, difficulty={request.difficulty}")

        # Generate questions using LLM
        questions = await assessment_generator.generate_quiz_questions(
            document_ids=request.document_ids,
            num_questions=request.num_questions,
            difficulty=request.difficulty,
            question_types=request.question_types
        )

        if not questions:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate quiz questions. Please ensure documents are uploaded."
            )

        # Create quiz
        title = request.title or f"Quiz - {request.difficulty.capitalize()} ({len(questions)} questions)"
        description = request.description or f"Auto-generated quiz with {len(questions)} questions"

        quiz = await quiz_manager.create_quiz(
            title=title,
            questions=questions,
            description=description,
            document_ids=request.document_ids or [],
            difficulty=request.difficulty,
            metadata={
                'question_types': request.question_types or ['multiple_choice', 'true_false'],
                'topics': request.topics
            }
        )

        logger.info(f"Created quiz {quiz.id} with {len(questions)} questions")
        return quiz

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/quizzes")
async def list_quizzes(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0)
) -> QuizList:
    """Get list of all generated quizzes"""
    try:
        quizzes, total = await quiz_manager.list_quizzes(limit=limit, offset=offset)

        return QuizList(
            quizzes=quizzes,
            total=total
        )

    except Exception as e:
        logger.error(f"Failed to list quizzes: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/quizzes/{quiz_id}")
async def get_quiz(quiz_id: str, include_answers: bool = False) -> QuizDetail:
    """
    Get quiz details with questions

    - **quiz_id**: Quiz identifier
    - **include_answers**: Include correct answers and explanations (for review)
    """
    try:
        quiz = await quiz_manager.get_quiz_with_questions(quiz_id)

        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")

        # Remove answers if not requested (for taking quiz)
        if not include_answers:
            for question in quiz.questions:
                question.correct_answer = "hidden"
                question.explanation = "Take the quiz to see the explanation"

        return quiz

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/quizzes/{quiz_id}")
async def delete_quiz(quiz_id: str) -> dict:
    """Delete a quiz and all associated sessions"""
    try:
        success = await quiz_manager.delete_quiz(quiz_id)

        if not success:
            raise HTTPException(status_code=404, detail="Quiz not found or already deleted")

        return {"success": True, "message": f"Quiz {quiz_id} deleted"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sessions")
async def start_quiz_session(request: QuizSessionStart) -> QuizSession:
    """Start a new quiz session"""
    try:
        # Verify quiz exists
        quiz = await quiz_manager.get_quiz(request.quiz_id)
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")

        session = await quiz_manager.start_quiz_session(
            quiz_id=request.quiz_id,
            conversation_id=request.conversation_id
        )

        logger.info(f"Started quiz session {session.id} for quiz {request.quiz_id}")
        return session

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start quiz session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sessions/{session_id}/submit")
async def submit_answer(session_id: str, answer: AnswerSubmit) -> QuestionResponse:
    """Submit an answer to a question"""
    try:
        # Verify session exists
        session = await quiz_manager.get_quiz_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Quiz session not found")

        if session.completed_at:
            raise HTTPException(status_code=400, detail="Quiz already completed")

        response = await quiz_manager.submit_answer(
            session_id=session_id,
            question_id=answer.question_id,
            user_answer=answer.user_answer,
            time_taken=answer.time_taken
        )

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to submit answer: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sessions/{session_id}/complete")
async def complete_quiz(session_id: str) -> QuizResults:
    """Complete quiz session and get results"""
    try:
        results = await quiz_manager.complete_quiz_session(session_id)

        logger.info(f"Completed quiz session {session_id}: {results.score}/{results.max_score}")
        return results

    except Exception as e:
        logger.error(f"Failed to complete quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions/{session_id}/results")
async def get_quiz_results(session_id: str) -> QuizResults:
    """Get results for a completed quiz session"""
    try:
        session = await quiz_manager.get_quiz_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        if not session.completed_at:
            raise HTTPException(status_code=400, detail="Quiz not yet completed")

        # This would normally call a method to retrieve cached results
        # For now, recalculate
        results = await quiz_manager.complete_quiz_session(session_id)
        return results

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get quiz results: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def assessment_health() -> dict:
    """Health check for assessment service"""
    return {
        "status": "healthy",
        "service": "assessment",
        "features": {
            "quiz_generation": True,
            "quiz_management": True,
            "session_tracking": True
        }
    }
