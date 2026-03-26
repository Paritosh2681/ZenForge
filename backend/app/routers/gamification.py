"""
Phase 5: Gamification Router
Badges, streaks, and achievements
"""
from fastapi import APIRouter
from typing import Optional
import uuid
import logging
from datetime import datetime

from app.services.database import get_database

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/gamification", tags=["gamification"])

# Badge definitions
BADGE_DEFINITIONS = [
    {"name": "First Upload", "description": "Upload your first document", "icon": "upload", "category": "upload", "requirement_type": "uploads", "requirement_value": 1},
    {"name": "Knowledge Builder", "description": "Upload 5 documents", "icon": "library", "category": "upload", "requirement_type": "uploads", "requirement_value": 5},
    {"name": "Scholar", "description": "Upload 10 documents", "icon": "graduation", "category": "upload", "requirement_type": "uploads", "requirement_value": 10},
    {"name": "Quiz Taker", "description": "Complete your first quiz", "icon": "quiz", "category": "quiz", "requirement_type": "quizzes_completed", "requirement_value": 1},
    {"name": "Quiz Master", "description": "Complete 10 quizzes", "icon": "trophy", "category": "quiz", "requirement_type": "quizzes_completed", "requirement_value": 10},
    {"name": "Perfect Score", "description": "Get 100% on a quiz", "icon": "star", "category": "quiz", "requirement_type": "perfect_score", "requirement_value": 1},
    {"name": "Hot Streak", "description": "Maintain a 3-day streak", "icon": "fire", "category": "streak", "requirement_type": "streak_days", "requirement_value": 3},
    {"name": "Dedicated Learner", "description": "Maintain a 7-day streak", "icon": "flame", "category": "streak", "requirement_type": "streak_days", "requirement_value": 7},
    {"name": "Unstoppable", "description": "Maintain a 30-day streak", "icon": "rocket", "category": "streak", "requirement_type": "streak_days", "requirement_value": 30},
    {"name": "Topic Explorer", "description": "Study 5 different topics", "icon": "compass", "category": "exploration", "requirement_type": "topics_studied", "requirement_value": 5},
    {"name": "Mastery Beginner", "description": "Master your first topic", "icon": "medal", "category": "mastery", "requirement_type": "topics_mastered", "requirement_value": 1},
    {"name": "Mastery Expert", "description": "Master 5 topics", "icon": "crown", "category": "mastery", "requirement_type": "topics_mastered", "requirement_value": 5},
]

@router.get("/badges")
async def get_badges():
    """Get all badges with earned status"""
    try:
        db = get_database()
        conn = await db.connect()

        # Get earned badges
        cursor = await conn.execute("SELECT * FROM badges ORDER BY earned_at DESC")
        rows = await cursor.fetchall()
        cols = [d[0] for d in cursor.description]
        earned = {dict(zip(cols, row))['name']: dict(zip(cols, row)) for row in rows}

        # Merge with definitions
        all_badges = []
        for defn in BADGE_DEFINITIONS:
            badge = {**defn, "earned": defn['name'] in earned}
            if badge['earned']:
                badge['earned_at'] = earned[defn['name']].get('earned_at')
            all_badges.append(badge)

        earned_count = sum(1 for b in all_badges if b['earned'])
        return {"badges": all_badges, "earned": earned_count, "total": len(all_badges)}
    except Exception as e:
        logger.error(f"Failed to get badges: {e}")
        return {"badges": [{"earned": False, **d} for d in BADGE_DEFINITIONS], "earned": 0, "total": len(BADGE_DEFINITIONS)}

@router.post("/check-badges")
async def check_and_award_badges():
    """Check progress and award any newly earned badges"""
    try:
        db = get_database()
        conn = await db.connect()

        # Get current stats
        stats = {}

        # Count documents (via vector store chunks as proxy)
        try:
            from app.services.vector_store import VectorStore
            vs = VectorStore()
            stats['uploads'] = vs.get_document_count() // 5  # rough estimate
        except:
            stats['uploads'] = 0

        # Count completed quizzes
        cursor = await conn.execute("SELECT COUNT(*) FROM quiz_sessions WHERE completed_at IS NOT NULL")
        row = await cursor.fetchone()
        stats['quizzes_completed'] = row[0] if row else 0

        # Check for perfect scores
        cursor = await conn.execute("SELECT COUNT(*) FROM quiz_sessions WHERE score = max_score AND completed_at IS NOT NULL")
        row = await cursor.fetchone()
        stats['perfect_score'] = row[0] if row else 0

        # Get streak (from analytics)
        try:
            cursor = await conn.execute(
                """SELECT COUNT(DISTINCT date(started_at)) as active_days
                   FROM quiz_sessions WHERE started_at >= date('now', '-30 days')"""
            )
            row = await cursor.fetchone()
            stats['streak_days'] = row[0] if row else 0
        except:
            stats['streak_days'] = 0

        # Count topics studied
        cursor = await conn.execute("SELECT COUNT(*) FROM topic_mastery WHERE questions_answered > 0")
        row = await cursor.fetchone()
        stats['topics_studied'] = row[0] if row else 0

        # Count mastered topics
        cursor = await conn.execute("SELECT COUNT(*) FROM topic_mastery WHERE mastery_level >= 0.9")
        row = await cursor.fetchone()
        stats['topics_mastered'] = row[0] if row else 0

        # Award new badges
        newly_earned = []
        for defn in BADGE_DEFINITIONS:
            current_val = stats.get(defn['requirement_type'], 0)
            if current_val >= defn['requirement_value']:
                # Check if already earned
                cursor = await conn.execute("SELECT id FROM badges WHERE name = ?", (defn['name'],))
                existing = await cursor.fetchone()
                if not existing:
                    badge_id = str(uuid.uuid4())
                    await conn.execute(
                        "INSERT INTO badges (id, name, description, icon, category, requirement_type, requirement_value, earned_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        (badge_id, defn['name'], defn['description'], defn['icon'], defn['category'],
                         defn['requirement_type'], defn['requirement_value'], datetime.now().isoformat())
                    )
                    newly_earned.append(defn['name'])

        await conn.commit()
        return {"newly_earned": newly_earned, "stats": stats, "count": len(newly_earned)}
    except Exception as e:
        logger.error(f"Badge check failed: {e}")
        return {"newly_earned": [], "stats": {}, "count": 0, "error": str(e)}

@router.get("/stats")
async def get_gamification_stats():
    """Get gamification overview stats"""
    try:
        db = get_database()
        conn = await db.connect()

        # Earned badges count
        cursor = await conn.execute("SELECT COUNT(*) FROM badges")
        badges_earned = (await cursor.fetchone())[0]

        # Total quizzes completed
        cursor = await conn.execute("SELECT COUNT(*) FROM quiz_sessions WHERE completed_at IS NOT NULL")
        quizzes_done = (await cursor.fetchone())[0]

        # Active streak
        cursor = await conn.execute(
            """SELECT COUNT(DISTINCT date(started_at)) FROM quiz_sessions
               WHERE started_at >= date('now', '-30 days')"""
        )
        streak = (await cursor.fetchone())[0]

        # Total study time (minutes)
        cursor = await conn.execute("SELECT COALESCE(SUM(time_taken), 0) FROM quiz_sessions WHERE completed_at IS NOT NULL")
        total_time = (await cursor.fetchone())[0]

        # Topics mastered
        cursor = await conn.execute("SELECT COUNT(*) FROM topic_mastery WHERE mastery_level >= 0.9")
        mastered = (await cursor.fetchone())[0]

        return {
            "badges_earned": badges_earned,
            "total_badges": len(BADGE_DEFINITIONS),
            "quizzes_completed": quizzes_done,
            "streak_days": streak,
            "total_study_minutes": total_time // 60 if total_time else 0,
            "topics_mastered": mastered,
            "level": 1 + (badges_earned * 2) + (quizzes_done) + (mastered * 3)
        }
    except Exception as e:
        logger.error(f"Failed to get gamification stats: {e}")
        return {"badges_earned": 0, "total_badges": len(BADGE_DEFINITIONS), "quizzes_completed": 0,
                "streak_days": 0, "total_study_minutes": 0, "topics_mastered": 0, "level": 1}
