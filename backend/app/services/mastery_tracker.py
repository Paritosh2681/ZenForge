"""
Mastery Tracking Service - Spaced repetition and learning progress
Phase 4: Week 2

Implements SuperMemo SM-2 algorithm for spaced repetition and mastery tracking.
"""
import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import aiosqlite

from app.config import settings

logger = logging.getLogger(__name__)


class MasteryTracker:
    """
    Tracks user mastery of topics using spaced repetition algorithm

    Based on SuperMemo SM-2 algorithm:
    - Tracks mastery level (0.0 - 1.0)
    - Calculates next review intervals
    - Adjusts easiness factor based on performance
    """

    def __init__(self):
        self.db_path = settings.DATABASE_PATH

    async def update_mastery(
        self,
        topic_id: str,
        is_correct: bool,
        conversation_id: Optional[str] = None
    ) -> Dict:
        """
        Update mastery level for a topic based on quiz performance

        Args:
            topic_id: Topic to update
            is_correct: Whether the answer was correct
            conversation_id: Optional conversation context

        Returns:
            Updated mastery information
        """
        try:
            async with aiosqlite.connect(self.db_path) as conn:
                conn.row_factory = aiosqlite.Row

                # Get or create mastery record
                cursor = await conn.execute(
                    """SELECT * FROM topic_mastery
                       WHERE topic_id = ? AND (conversation_id = ? OR conversation_id IS NULL)
                       LIMIT 1""",
                    (topic_id, conversation_id)
                )
                mastery_row = await cursor.fetchone()

                if mastery_row:
                    mastery = dict(mastery_row)
                    mastery_id = mastery['id']
                else:
                    # Create new mastery record
                    mastery_id = str(uuid.uuid4())
                    mastery = {
                        'id': mastery_id,
                        'topic_id': topic_id,
                        'conversation_id': conversation_id,
                        'mastery_level': 0.0,
                        'questions_answered': 0,
                        'correct_count': 0,
                        'last_reviewed': None,
                        'next_review': None,
                        'easiness_factor': 2.5
                    }

                # Update statistics
                mastery['questions_answered'] += 1
                if is_correct:
                    mastery['correct_count'] += 1

                # Calculate new mastery level using SM-2
                updated_mastery = self._calculate_sm2_update(mastery, is_correct)

                # Save to database
                await conn.execute(
                    """INSERT OR REPLACE INTO topic_mastery
                       (id, topic_id, conversation_id, mastery_level, questions_answered,
                        correct_count, last_reviewed, next_review, easiness_factor)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        updated_mastery['id'],
                        updated_mastery['topic_id'],
                        updated_mastery['conversation_id'],
                        updated_mastery['mastery_level'],
                        updated_mastery['questions_answered'],
                        updated_mastery['correct_count'],
                        datetime.utcnow().isoformat(),
                        updated_mastery['next_review'],
                        updated_mastery['easiness_factor']
                    )
                )
                await conn.commit()

                logger.info(
                    f"Updated mastery for topic {topic_id}: "
                    f"level={updated_mastery['mastery_level']:.2f}, "
                    f"next_review={updated_mastery['next_review']}"
                )

                return updated_mastery

        except Exception as e:
            logger.error(f"Failed to update mastery: {e}")
            raise

    async def get_topic_mastery(
        self,
        topic_id: str,
        conversation_id: Optional[str] = None
    ) -> Optional[Dict]:
        """Get mastery information for a specific topic"""
        try:
            async with aiosqlite.connect(self.db_path) as conn:
                conn.row_factory = aiosqlite.Row

                cursor = await conn.execute(
                    """SELECT * FROM topic_mastery
                       WHERE topic_id = ? AND (conversation_id = ? OR conversation_id IS NULL)
                       LIMIT 1""",
                    (topic_id, conversation_id)
                )
                row = await cursor.fetchone()

                if row:
                    return dict(row)
                return None

        except Exception as e:
            logger.error(f"Failed to get topic mastery: {e}")
            return None

    async def get_all_mastery(
        self,
        conversation_id: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict]:
        """Get mastery information for all topics"""
        try:
            async with aiosqlite.connect(self.db_path) as conn:
                conn.row_factory = aiosqlite.Row

                if conversation_id:
                    cursor = await conn.execute(
                        """SELECT tm.*, t.name as topic_name, t.category
                           FROM topic_mastery tm
                           JOIN topics t ON tm.topic_id = t.id
                           WHERE tm.conversation_id = ?
                           ORDER BY tm.mastery_level DESC
                           LIMIT ?""",
                        (conversation_id, limit)
                    )
                else:
                    cursor = await conn.execute(
                        """SELECT tm.*, t.name as topic_name, t.category
                           FROM topic_mastery tm
                           JOIN topics t ON tm.topic_id = t.id
                           ORDER BY tm.mastery_level DESC
                           LIMIT ?""",
                        (limit,)
                    )

                rows = await cursor.fetchall()
                return [dict(row) for row in rows]

        except Exception as e:
            logger.error(f"Failed to get all mastery: {e}")
            return []

    async def get_topics_for_review(
        self,
        conversation_id: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict]:
        """
        Get topics that are due for review based on spaced repetition

        Returns topics ordered by:
        1. Past due (next_review < now)
        2. Lowest mastery level
        """
        try:
            async with aiosqlite.connect(self.db_path) as conn:
                conn.row_factory = aiosqlite.Row

                now = datetime.utcnow().isoformat()

                if conversation_id:
                    cursor = await conn.execute(
                        """SELECT tm.*, t.name as topic_name, t.category
                           FROM topic_mastery tm
                           JOIN topics t ON tm.topic_id = t.id
                           WHERE tm.conversation_id = ?
                             AND (tm.next_review IS NULL OR tm.next_review <= ?)
                           ORDER BY tm.next_review ASC, tm.mastery_level ASC
                           LIMIT ?""",
                        (conversation_id, now, limit)
                    )
                else:
                    cursor = await conn.execute(
                        """SELECT tm.*, t.name as topic_name, t.category
                           FROM topic_mastery tm
                           JOIN topics t ON tm.topic_id = t.id
                           WHERE tm.next_review IS NULL OR tm.next_review <= ?
                           ORDER BY tm.next_review ASC, tm.mastery_level ASC
                           LIMIT ?""",
                        (now, limit)
                    )

                rows = await cursor.fetchall()
                return [dict(row) for row in rows]

        except Exception as e:
            logger.error(f"Failed to get topics for review: {e}")
            return []

    async def update_from_quiz_session(self, session_id: str) -> Dict:
        """
        Update mastery for all topics in a completed quiz session

        Args:
            session_id: Completed quiz session

        Returns:
            Summary of mastery updates
        """
        try:
            async with aiosqlite.connect(self.db_path) as conn:
                conn.row_factory = aiosqlite.Row

                # Get session
                cursor = await conn.execute(
                    "SELECT * FROM quiz_sessions WHERE id = ?",
                    (session_id,)
                )
                session = await cursor.fetchone()

                if not session or not session['completed_at']:
                    raise ValueError("Session not found or not completed")

                # Get responses with topics
                cursor = await conn.execute(
                    """SELECT qr.is_correct, q.topic
                       FROM quiz_responses qr
                       JOIN questions q ON qr.question_id = q.id
                       WHERE qr.session_id = ? AND q.topic IS NOT NULL""",
                    (session_id,)
                )
                responses = await cursor.fetchall()

            # Group by topic
            topic_performance: Dict[str, List[bool]] = {}
            for response in responses:
                topic = response['topic']
                if topic:
                    if topic not in topic_performance:
                        topic_performance[topic] = []
                    topic_performance[topic].append(response['is_correct'])

            # Update mastery for each topic
            updates = []
            for topic_name, results in topic_performance.items():
                # Find topic ID
                async with aiosqlite.connect(self.db_path) as conn:
                    conn.row_factory = aiosqlite.Row
                    cursor = await conn.execute(
                        "SELECT id FROM topics WHERE name = ?",
                        (topic_name,)
                    )
                    topic_row = await cursor.fetchone()

                if topic_row:
                    topic_id = topic_row['id']

                    # Update mastery for each question
                    for is_correct in results:
                        mastery = await self.update_mastery(
                            topic_id=topic_id,
                            is_correct=is_correct,
                            conversation_id=session['conversation_id']
                        )

                    updates.append({
                        'topic': topic_name,
                        'questions': len(results),
                        'correct': sum(results),
                        'mastery_level': mastery['mastery_level']
                    })

            logger.info(f"Updated mastery for {len(updates)} topics from session {session_id}")
            return {
                'session_id': session_id,
                'topics_updated': len(updates),
                'updates': updates
            }

        except Exception as e:
            logger.error(f"Failed to update mastery from quiz session: {e}")
            raise

    def _calculate_sm2_update(self, mastery: Dict, is_correct: bool) -> Dict:
        """
        Calculate new mastery level using SuperMemo SM-2 algorithm

        SM-2 Algorithm:
        - Quality: 0-5 (we map correct=5, incorrect=2)
        - Easiness Factor: Adjusted based on quality
        - Interval: Days until next review
        """
        # Map boolean to SM-2 quality (0-5 scale)
        quality = 5 if is_correct else 2

        # Current values
        easiness = mastery['easiness_factor']
        questions_answered = mastery['questions_answered']
        correct_count = mastery['correct_count']

        # Calculate new easiness factor
        # EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        new_easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        new_easiness = max(settings.SR_MIN_EASINESS, new_easiness)  # Minimum 1.3

        # Calculate mastery level (0.0 - 1.0)
        # Simple formula: (correct / total) with exponential smoothing
        raw_accuracy = correct_count / questions_answered if questions_answered > 0 else 0
        mastery_level = raw_accuracy ** 0.7  # Slightly favor accuracy

        # Calculate next review interval (in days)
        if is_correct:
            if questions_answered == 1:
                interval_days = 1
            elif questions_answered == 2:
                interval_days = 6
            else:
                # I(n) = I(n-1) * EF
                interval_days = int(settings.SR_INTERVAL_BASE * (new_easiness ** (questions_answered - 2)))
        else:
            # Reset interval on incorrect answer
            interval_days = 1

        next_review = (datetime.utcnow() + timedelta(days=interval_days)).isoformat()

        # Update mastery record
        mastery['mastery_level'] = round(mastery_level, 3)
        mastery['easiness_factor'] = round(new_easiness, 2)
        mastery['next_review'] = next_review

        return mastery

    def get_mastery_label(self, mastery_level: float) -> str:
        """Convert numeric mastery to human-readable label"""
        if mastery_level >= settings.MASTERY_THRESHOLD_ADVANCED:
            return "Advanced"
        elif mastery_level >= settings.MASTERY_THRESHOLD_INTERMEDIATE:
            return "Intermediate"
        elif mastery_level >= settings.MASTERY_THRESHOLD_BEGINNER:
            return "Beginner"
        else:
            return "Novice"
