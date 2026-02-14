"""
Analytics API Router - Endpoints for learning insights and topic mastery
Phase 4: Week 2
"""
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from app.services.topic_extractor import TopicExtractor
from app.services.mastery_tracker import MasteryTracker
from app.services.analytics_engine import AnalyticsEngine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analytics", tags=["analytics"])

# Initialize services
topic_extractor = TopicExtractor()
mastery_tracker = MasteryTracker()
analytics_engine = AnalyticsEngine()


@router.get("/stats")
async def get_overall_stats(
    conversation_id: Optional[str] = Query(None),
    days: int = Query(default=30, ge=1, le=365)
) -> dict:
    """
    Get overall learning statistics

    - **conversation_id**: Filter by conversation (optional)
    - **days**: Number of days to analyze (default 30)

    Returns comprehensive stats including:
    - Quiz performance
    - Question accuracy
    - Topic mastery
    - Learning streaks
    """
    try:
        stats = await analytics_engine.get_overall_stats(
            conversation_id=conversation_id,
            days=days
        )
        return stats

    except Exception as e:
        logger.error(f"Failed to get overall stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/topics")
async def get_all_topics(
    limit: int = Query(default=100, ge=1, le=500)
) -> dict:
    """
    Get all topics with statistics

    Returns list of all topics sorted by creation date
    """
    try:
        topics = await topic_extractor.get_all_topics(limit=limit)
        return {
            'topics': topics,
            'total': len(topics)
        }

    except Exception as e:
        logger.error(f"Failed to get topics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/topics/extract")
async def extract_topics(
    document_ids: Optional[list[str]] = None,
    max_topics: int = Query(default=10, ge=1, le=50)
) -> dict:
    """
    Extract topics from documents

    - **document_ids**: Specific documents to analyze (empty = all)
    - **max_topics**: Maximum number of topics to extract
    """
    try:
        topics = await topic_extractor.extract_topics_from_documents(
            document_ids=document_ids or [],
            max_topics=max_topics
        )

        return {
            'topics': topics,
            'count': len(topics)
        }

    except Exception as e:
        logger.error(f"Failed to extract topics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/topics/extract-quiz/{quiz_id}")
async def extract_quiz_topics(quiz_id: str) -> dict:
    """
    Extract and assign topics to quiz questions

    Analyzes quiz questions and assigns topics automatically
    """
    try:
        topics = await topic_extractor.extract_topics_from_quiz(quiz_id)

        return {
            'quiz_id': quiz_id,
            'topics': topics,
            'count': len(topics)
        }

    except Exception as e:
        logger.error(f"Failed to extract quiz topics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mastery")
async def get_all_mastery(
    conversation_id: Optional[str] = Query(None),
    limit: int = Query(default=100, ge=1, le=500)
) -> dict:
    """
    Get mastery information for all topics

    - **conversation_id**: Filter by conversation (optional)
    - **limit**: Maximum number of records to return
    """
    try:
        mastery_data = await mastery_tracker.get_all_mastery(
            conversation_id=conversation_id,
            limit=limit
        )

        return {
            'mastery': mastery_data,
            'total': len(mastery_data)
        }

    except Exception as e:
        logger.error(f"Failed to get mastery data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mastery/topic/{topic_id}")
async def get_topic_mastery(
    topic_id: str,
    conversation_id: Optional[str] = Query(None)
) -> dict:
    """
    Get mastery information for a specific topic

    - **topic_id**: Topic to query
    - **conversation_id**: Filter by conversation (optional)
    """
    try:
        mastery = await mastery_tracker.get_topic_mastery(
            topic_id=topic_id,
            conversation_id=conversation_id
        )

        if not mastery:
            raise HTTPException(status_code=404, detail="Mastery record not found")

        return mastery

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get topic mastery: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mastery/review")
async def get_topics_for_review(
    conversation_id: Optional[str] = Query(None),
    limit: int = Query(default=10, ge=1, le=50)
) -> dict:
    """
    Get topics due for review (spaced repetition)

    Returns topics that:
    - Are past their next review date
    - Have lowest mastery levels
    - Need reinforcement

    - **conversation_id**: Filter by conversation (optional)
    - **limit**: Maximum number of topics to return
    """
    try:
        topics = await mastery_tracker.get_topics_for_review(
            conversation_id=conversation_id,
            limit=limit
        )

        return {
            'topics': topics,
            'count': len(topics),
            'should_review': len(topics) > 0
        }

    except Exception as e:
        logger.error(f"Failed to get topics for review: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mastery/update-session/{session_id}")
async def update_mastery_from_session(session_id: str) -> dict:
    """
    Update mastery for all topics in a quiz session

    Automatically called after quiz completion to update topic mastery levels
    using spaced repetition algorithm.

    - **session_id**: Completed quiz session ID
    """
    try:
        result = await mastery_tracker.update_from_quiz_session(session_id)
        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to update mastery from session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/performance/topics")
async def get_topic_performance(
    conversation_id: Optional[str] = Query(None),
    limit: int = Query(default=20, ge=1, le=100)
) -> dict:
    """
    Get performance breakdown by topic

    Returns topics sorted by mastery level (weakest first) with:
    - Mastery level
    - Questions answered
    - Accuracy percentage
    - Next review date

    - **conversation_id**: Filter by conversation (optional)
    - **limit**: Maximum number of topics to return
    """
    try:
        topics = await analytics_engine.get_topic_performance(
            conversation_id=conversation_id,
            limit=limit
        )

        return {
            'topics': topics,
            'count': len(topics)
        }

    except Exception as e:
        logger.error(f"Failed to get topic performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/performance/quizzes")
async def get_quiz_history(
    conversation_id: Optional[str] = Query(None),
    limit: int = Query(default=20, ge=1, le=100)
) -> dict:
    """
    Get recent quiz history with scores

    - **conversation_id**: Filter by conversation (optional)
    - **limit**: Maximum number of quizzes to return
    """
    try:
        quizzes = await analytics_engine.get_quiz_history(
            conversation_id=conversation_id,
            limit=limit
        )

        return {
            'quizzes': quizzes,
            'count': len(quizzes)
        }

    except Exception as e:
        logger.error(f"Failed to get quiz history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations")
async def get_recommendations(
    conversation_id: Optional[str] = Query(None)
) -> dict:
    """
    Get personalized learning recommendations

    Returns:
    - Topics to review based on spaced repetition
    - Suggested quiz difficulty
    - Study tips based on performance patterns

    - **conversation_id**: Filter by conversation (optional)
    """
    try:
        recommendations = await analytics_engine.get_recommendations(
            conversation_id=conversation_id
        )

        return recommendations

    except Exception as e:
        logger.error(f"Failed to get recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def analytics_health() -> dict:
    """Health check for analytics service"""
    return {
        "status": "healthy",
        "service": "analytics",
        "features": {
            "topic_extraction": True,
            "mastery_tracking": True,
            "spaced_repetition": True,
            "performance_insights": True,
            "recommendations": True
        }
    }
