"""
Analytics Engine - Learning performance insights and statistics
Phase 4: Week 2
"""
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import aiosqlite

from app.config import settings

logger = logging.getLogger(__name__)


class AnalyticsEngine:
    """
    Aggregates and analyzes learning performance data

    Provides insights including:
    - Overall progress metrics
    - Quiz performance statistics
    - Topic strength/weakness analysis
    - Learning streaks and engagement patterns
    - Personalized recommendations
    """

    def __init__(self):
        self.db_path = settings.DATABASE_PATH

    async def get_overall_stats(
        self,
        conversation_id: Optional[str] = None,
        days: int = 30
    ) -> Dict:
        """
        Get overall learning statistics

        Args:
            conversation_id: Filter by conversation (None = all users)
            days: Number of days to analyze

        Returns:
            Dictionary with comprehensive statistics
        """
        try:
            async with aiosqlite.connect(self.db_path) as conn:
                conn.row_factory = aiosqlite.Row

                cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()

                # Quiz statistics
                if conversation_id:
                    quiz_cursor = await conn.execute(
                        """SELECT COUNT(*) as total_quizzes,
                                  SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) as completed_quizzes,
                                  AVG(CASE WHEN score IS NOT NULL THEN score * 100.0 / max_score END) as avg_score,
                                  SUM(CASE WHEN completed_at >= ? THEN 1 ELSE 0 END) as recent_quizzes
                           FROM quiz_sessions
                           WHERE conversation_id = ?""",
                        (cutoff_date, conversation_id)
                    )
                else:
                    quiz_cursor = await conn.execute(
                        """SELECT COUNT(*) as total_quizzes,
                                  SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) as completed_quizzes,
                                  AVG(CASE WHEN score IS NOT NULL THEN score * 100.0 / max_score END) as avg_score,
                                  SUM(CASE WHEN completed_at >= ? THEN 1 ELSE 0 END) as recent_quizzes
                           FROM quiz_sessions""",
                        (cutoff_date,)
                    )

                quiz_stats = await quiz_cursor.fetchone()

                # Question statistics
                if conversation_id:
                    question_cursor = await conn.execute(
                        """SELECT COUNT(*) as total_questions,
                                  SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
                                  AVG(time_taken) as avg_time
                           FROM quiz_responses qr
                           JOIN quiz_sessions qs ON qr.session_id = qs.id
                           WHERE qs.conversation_id = ? AND qr.timestamp >= ?""",
                        (conversation_id, cutoff_date)
                    )
                else:
                    question_cursor = await conn.execute(
                        """SELECT COUNT(*) as total_questions,
                                  SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
                                  AVG(time_taken) as avg_time
                           FROM quiz_responses
                           WHERE timestamp >= ?""",
                        (cutoff_date,)
                    )

                question_stats = await question_cursor.fetchone()

                # Mastery statistics
                if conversation_id:
                    mastery_cursor = await conn.execute(
                        """SELECT COUNT(*) as topics_learning,
                                  AVG(mastery_level) as avg_mastery,
                                  SUM(CASE WHEN mastery_level >= 0.9 THEN 1 ELSE 0 END) as mastered_topics,
                                  SUM(CASE WHEN mastery_level < 0.3 THEN 1 ELSE 0 END) as struggling_topics
                           FROM topic_mastery
                           WHERE conversation_id = ?""",
                        (conversation_id,)
                    )
                else:
                    mastery_cursor = await conn.execute(
                        """SELECT COUNT(*) as topics_learning,
                                  AVG(mastery_level) as avg_mastery,
                                  SUM(CASE WHEN mastery_level >= 0.9 THEN 1 ELSE 0 END) as mastered_topics,
                                  SUM(CASE WHEN mastery_level < 0.3 THEN 1 ELSE 0 END) as struggling_topics
                           FROM topic_mastery"""
                    )

                mastery_stats = await mastery_cursor.fetchone()

                # Calculate learning streak
                streak = await self._calculate_streak(conversation_id)

                return {
                    'quizzes': {
                        'total': quiz_stats['total_quizzes'] or 0,
                        'completed': quiz_stats['completed_quizzes'] or 0,
                        'avg_score': round(quiz_stats['avg_score'] or 0, 1),
                        'recent': quiz_stats['recent_quizzes'] or 0
                    },
                    'questions': {
                        'total': question_stats['total_questions'] or 0,
                        'correct': question_stats['correct_answers'] or 0,
                        'accuracy': round(
                            (question_stats['correct_answers'] or 0) * 100.0 /
                            max(question_stats['total_questions'] or 1, 1),
                            1
                        ),
                        'avg_time': round(question_stats['avg_time'] or 0, 1)
                    },
                    'topics': {
                        'learning': mastery_stats['topics_learning'] or 0,
                        'mastered': mastery_stats['mastered_topics'] or 0,
                        'struggling': mastery_stats['struggling_topics'] or 0,
                        'avg_mastery': round(mastery_stats['avg_mastery'] or 0, 2)
                    },
                    'engagement': {
                        'streak_days': streak,
                        'last_activity': await self._get_last_activity_date(conversation_id)
                    },
                    'period_days': days
                }

        except Exception as e:
            logger.error(f"Failed to get overall stats: {e}")
            return {}

    async def get_topic_performance(
        self,
        conversation_id: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict]:
        """
        Get performance breakdown by topic

        Returns topics sorted by mastery level (weakest first)
        """
        try:
            async with aiosqlite.connect(self.db_path) as conn:
                conn.row_factory = aiosqlite.Row

                if conversation_id:
                    cursor = await conn.execute(
                        """SELECT t.name, t.category,
                                  tm.mastery_level,
                                  tm.questions_answered,
                                  tm.correct_count,
                                  tm.next_review,
                                  ROUND(tm.correct_count * 100.0 / NULLIF(tm.questions_answered, 0), 1) as accuracy
                           FROM topic_mastery tm
                           JOIN topics t ON tm.topic_id = t.id
                           WHERE tm.conversation_id = ?
                           ORDER BY tm.mastery_level ASC
                           LIMIT ?""",
                        (conversation_id, limit)
                    )
                else:
                    cursor = await conn.execute(
                        """SELECT t.name, t.category,
                                  AVG(tm.mastery_level) as mastery_level,
                                  SUM(tm.questions_answered) as questions_answered,
                                  SUM(tm.correct_count) as correct_count,
                                  MIN(tm.next_review) as next_review,
                                  ROUND(SUM(tm.correct_count) * 100.0 / NULLIF(SUM(tm.questions_answered), 0), 1) as accuracy
                           FROM topic_mastery tm
                           JOIN topics t ON tm.topic_id = t.id
                           GROUP BY t.id
                           ORDER BY mastery_level ASC
                           LIMIT ?""",
                        (limit,)
                    )

                rows = await cursor.fetchall()

                topics = []
                for row in rows:
                    topics.append({
                        'name': row['name'],
                        'category': row['category'],
                        'mastery_level': round(row['mastery_level'] or 0, 2),
                        'questions_answered': row['questions_answered'] or 0,
                        'correct_count': row['correct_count'] or 0,
                        'accuracy': row['accuracy'] or 0,
                        'next_review': row['next_review'],
                        'status': self._get_mastery_status(row['mastery_level'] or 0)
                    })

                return topics

        except Exception as e:
            logger.error(f"Failed to get topic performance: {e}")
            return []

    async def get_quiz_history(
        self,
        conversation_id: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict]:
        """Get recent quiz history with scores"""
        try:
            async with aiosqlite.connect(self.db_path) as conn:
                conn.row_factory = aiosqlite.Row

                if conversation_id:
                    cursor = await conn.execute(
                        """SELECT qs.id, q.title, qs.started_at, qs.completed_at,
                                  qs.score, qs.max_score, qs.time_taken,
                                  ROUND(qs.score * 100.0 / NULLIF(qs.max_score, 0), 1) as percentage
                           FROM quiz_sessions qs
                           JOIN quizzes q ON qs.quiz_id = q.id
                           WHERE qs.conversation_id = ? AND qs.completed_at IS NOT NULL
                           ORDER BY qs.completed_at DESC
                           LIMIT ?""",
                        (conversation_id, limit)
                    )
                else:
                    cursor = await conn.execute(
                        """SELECT qs.id, q.title, qs.started_at, qs.completed_at,
                                  qs.score, qs.max_score, qs.time_taken,
                                  ROUND(qs.score * 100.0 / NULLIF(qs.max_score, 0), 1) as percentage
                           FROM quiz_sessions qs
                           JOIN quizzes q ON qs.quiz_id = q.id
                           WHERE qs.completed_at IS NOT NULL
                           ORDER BY qs.completed_at DESC
                           LIMIT ?""",
                        (limit,)
                    )

                rows = await cursor.fetchall()

                quizzes = []
                for row in rows:
                    quizzes.append({
                        'session_id': row['id'],
                        'title': row['title'],
                        'started_at': row['started_at'],
                        'completed_at': row['completed_at'],
                        'score': row['score'],
                        'max_score': row['max_score'],
                        'percentage': row['percentage'] or 0,
                        'time_taken': row['time_taken'],
                        'passed': (row['percentage'] or 0) >= 70
                    })

                return quizzes

        except Exception as e:
            logger.error(f"Failed to get quiz history: {e}")
            return []

    async def get_recommendations(
        self,
        conversation_id: Optional[str] = None
    ) -> Dict:
        """
        Generate personalized learning recommendations

        Returns:
            - Topics to review
            - Suggested quiz difficulty
            - Study tips based on performance patterns
        """
        try:
            # Get topics due for review
            async with aiosqlite.connect(self.db_path) as conn:
                conn.row_factory = aiosqlite.Row

                now = datetime.utcnow().isoformat()

                if conversation_id:
                    cursor = await conn.execute(
                        """SELECT t.name, tm.mastery_level, tm.next_review
                           FROM topic_mastery tm
                           JOIN topics t ON tm.topic_id = t.id
                           WHERE tm.conversation_id = ?
                             AND (tm.next_review IS NULL OR tm.next_review <= ?)
                           ORDER BY tm.mastery_level ASC
                           LIMIT 5""",
                        (conversation_id, now)
                    )
                else:
                    cursor = await conn.execute(
                        """SELECT t.name, AVG(tm.mastery_level) as mastery_level, MIN(tm.next_review) as next_review
                           FROM topic_mastery tm
                           JOIN topics t ON tm.topic_id = t.id
                           WHERE tm.next_review IS NULL OR tm.next_review <= ?
                           GROUP BY t.id
                           ORDER BY mastery_level ASC
                           LIMIT 5""",
                        (now,)
                    )

                review_topics = await cursor.fetchall()

            # Get overall stats for recommendation logic
            stats = await self.get_overall_stats(conversation_id, days=7)

            # Determine recommended difficulty
            avg_score = stats.get('quizzes', {}).get('avg_score', 0)
            if avg_score >= 85:
                suggested_difficulty = 'hard'
            elif avg_score >= 70:
                suggested_difficulty = 'medium'
            else:
                suggested_difficulty = 'easy'

            # Generate tips
            tips = self._generate_study_tips(stats)

            return {
                'topics_to_review': [
                    {
                        'name': row['name'],
                        'mastery_level': round(row['mastery_level'] or 0, 2),
                        'next_review': row['next_review']
                    }
                    for row in review_topics
                ],
                'suggested_difficulty': suggested_difficulty,
                'study_tips': tips,
                'should_practice': len(review_topics) > 0 or stats.get('engagement', {}).get('streak_days', 0) == 0
            }

        except Exception as e:
            logger.error(f"Failed to get recommendations: {e}")
            return {}

    async def _calculate_streak(self, conversation_id: Optional[str]) -> int:
        """Calculate current learning streak in days"""
        try:
            async with aiosqlite.connect(self.db_path) as conn:
                conn.row_factory = aiosqlite.Row

                # Get dates of completed quizzes
                if conversation_id:
                    cursor = await conn.execute(
                        """SELECT DATE(completed_at) as date
                           FROM quiz_sessions
                           WHERE conversation_id = ? AND completed_at IS NOT NULL
                           ORDER BY completed_at DESC
                           LIMIT 30""",
                        (conversation_id,)
                    )
                else:
                    cursor = await conn.execute(
                        """SELECT DATE(completed_at) as date
                           FROM quiz_sessions
                           WHERE completed_at IS NOT NULL
                           ORDER BY completed_at DESC
                           LIMIT 30"""
                    )

                rows = await cursor.fetchall()

            if not rows:
                return 0

            # Calculate streak from most recent activity
            dates = [row['date'] for row in rows]
            unique_dates = sorted(set(dates), reverse=True)

            streak = 0
            today = datetime.utcnow().date()

            for i, date_str in enumerate(unique_dates):
                activity_date = datetime.fromisoformat(date_str).date()
                expected_date = today - timedelta(days=i)

                if activity_date == expected_date:
                    streak += 1
                else:
                    break

            return streak

        except Exception as e:
            logger.error(f"Failed to calculate streak: {e}")
            return 0

    async def _get_last_activity_date(self, conversation_id: Optional[str]) -> Optional[str]:
        """Get date of last quiz activity"""
        try:
            async with aiosqlite.connect(self.db_path) as conn:
                if conversation_id:
                    cursor = await conn.execute(
                        """SELECT MAX(completed_at) as last_date
                           FROM quiz_sessions
                           WHERE conversation_id = ? AND completed_at IS NOT NULL""",
                        (conversation_id,)
                    )
                else:
                    cursor = await conn.execute(
                        """SELECT MAX(completed_at) as last_date
                           FROM quiz_sessions
                           WHERE completed_at IS NOT NULL"""
                    )

                row = await cursor.fetchone()
                return row['last_date'] if row and row['last_date'] else None

        except Exception as e:
            logger.error(f"Failed to get last activity date: {e}")
            return None

    def _get_mastery_status(self, mastery_level: float) -> str:
        """Convert mastery level to status label"""
        if mastery_level >= settings.MASTERY_THRESHOLD_ADVANCED:
            return "Mastered"
        elif mastery_level >= settings.MASTERY_THRESHOLD_INTERMEDIATE:
            return "Proficient"
        elif mastery_level >= settings.MASTERY_THRESHOLD_BEGINNER:
            return "Learning"
        else:
            return "Beginner"

    def _generate_study_tips(self, stats: Dict) -> List[str]:
        """Generate personalized study tips based on performance"""
        tips = []

        accuracy = stats.get('questions', {}).get('accuracy', 0)
        streak = stats.get('engagement', {}).get('streak_days', 0)
        struggling_topics = stats.get('topics', {}).get('struggling', 0)

        if accuracy >= 90:
            tips.append("Excellent accuracy! Consider trying harder difficulty quizzes.")
        elif accuracy < 60:
            tips.append("Focus on understanding concepts before taking quizzes. Review explanations carefully.")

        if streak == 0:
            tips.append("Start building a study streak! Consistent daily practice improves retention.")
        elif streak >= 7:
            tips.append(f"Amazing {streak}-day streak! Keep up the consistent learning.")

        if struggling_topics > 0:
            tips.append(f"Review your {struggling_topics} struggling topic(s) with focused practice.")

        if not tips:
            tips.append("Keep learning consistently and review topics regularly for best results.")

        return tips
