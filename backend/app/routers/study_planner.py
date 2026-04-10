"""
Phase 5: Study Planner Router
Dynamic study plan generation using spaced repetition data
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import uuid
import logging
from datetime import datetime, timedelta

from app.services.database import get_database

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/planner", tags=["study-planner"])

class StudyPlanCreate(BaseModel):
    topic_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    scheduled_date: str  # YYYY-MM-DD
    duration_minutes: int = 30

class StudyPlanUpdate(BaseModel):
    status: Optional[str] = None
    scheduled_date: Optional[str] = None
    duration_minutes: Optional[int] = None

@router.get("/plans")
async def get_study_plans(status: Optional[str] = None, days_ahead: int = 7):
    """Get study plans for the next N days"""
    try:
        db = get_database()
        conn = await db.connect()
        today = datetime.now().strftime('%Y-%m-%d')
        future = (datetime.now() + timedelta(days=days_ahead)).strftime('%Y-%m-%d')

        if status:
            cursor = await conn.execute(
                "SELECT sp.*, t.name as topic_name FROM study_plans sp LEFT JOIN topics t ON sp.topic_id = t.id WHERE sp.status = ? AND sp.scheduled_date BETWEEN ? AND ? ORDER BY sp.scheduled_date",
                (status, today, future)
            )
        else:
            cursor = await conn.execute(
                "SELECT sp.*, t.name as topic_name FROM study_plans sp LEFT JOIN topics t ON sp.topic_id = t.id WHERE sp.scheduled_date >= ? ORDER BY sp.scheduled_date",
                (today,)
            )
        rows = await cursor.fetchall()
        cols = [d[0] for d in cursor.description]
        return {"plans": [dict(zip(cols, row)) for row in rows], "count": len(rows)}
    except Exception as e:
        logger.error(f"Failed to get study plans: {e}")
        return {"plans": [], "count": 0}

@router.post("/plans")
async def create_study_plan(request: StudyPlanCreate):
    """Create a new study plan"""
    try:
        db = get_database()
        conn = await db.connect()
        plan_id = str(uuid.uuid4())
        await conn.execute(
            "INSERT INTO study_plans (id, topic_id, title, description, scheduled_date, duration_minutes) VALUES (?, ?, ?, ?, ?, ?)",
            (plan_id, request.topic_id, request.title, request.description, request.scheduled_date, request.duration_minutes)
        )
        await conn.commit()
        return {"id": plan_id, "status": "created", **request.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/plans/{plan_id}")
async def update_study_plan(plan_id: str, request: StudyPlanUpdate):
    """Update a study plan status"""
    try:
        db = get_database()
        conn = await db.connect()
        updates = []
        params = []
        if request.status:
            updates.append("status = ?")
            params.append(request.status)
            if request.status == 'completed':
                updates.append("completed_at = CURRENT_TIMESTAMP")
        if request.scheduled_date:
            updates.append("scheduled_date = ?")
            params.append(request.scheduled_date)
        if request.duration_minutes:
            updates.append("duration_minutes = ?")
            params.append(request.duration_minutes)

        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")

        params.append(plan_id)
        await conn.execute(f"UPDATE study_plans SET {', '.join(updates)} WHERE id = ?", params)
        await conn.commit()
        return {"id": plan_id, "status": "updated"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/plans/{plan_id}")
async def delete_study_plan(plan_id: str):
    """Delete a study plan"""
    try:
        db = get_database()
        conn = await db.connect()
        await conn.execute("DELETE FROM study_plans WHERE id = ?", (plan_id,))
        await conn.commit()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
async def generate_study_plan(days: int = 7):
    """Auto-generate a study plan based on spaced repetition data"""
    try:
        db = get_database()
        conn = await db.connect()

        # Get topics needing review
        cursor = await conn.execute(
            """SELECT tm.*, t.name as topic_name
               FROM topic_mastery tm
               JOIN topics t ON tm.topic_id = t.id
               WHERE tm.next_review IS NOT NULL OR tm.mastery_level < 0.5
               ORDER BY tm.next_review ASC, tm.mastery_level ASC
               LIMIT 20"""
        )
        review_topics = await cursor.fetchall()
        cols = [d[0] for d in cursor.description]
        
        # Fallback if no topics in mastery: get random topics
        if not review_topics:
            cursor = await conn.execute(
                """SELECT id as topic_id, name as topic_name, 0.0 as mastery_level
                   FROM topics LIMIT 5"""
            )
            fallback_topics = await cursor.fetchall()
            cols = ['topic_id', 'topic_name', 'mastery_level']
            review_topics = fallback_topics
            
        # If absolutely nothing is in database, create a default onboarding plan
        if not review_topics:
            today = datetime.now()
            plan_id = str(uuid.uuid4())
            await conn.execute(
                "INSERT OR IGNORE INTO study_plans (id, topic_id, title, description, scheduled_date, duration_minutes) VALUES (?, ?, ?, ?, ?, ?)",
                (plan_id, None, "Welcome to ZenForge Study Planner",
                 "Start by reading some documents, taking quizzes, and uploading materials to build your learning path.",
                 today.strftime('%Y-%m-%d'), 15)
            )
            await conn.commit()
            return {"plans_created": 1, "plans": [{"id": plan_id, "topic": "Onboarding", "date": today.strftime('%Y-%m-%d'), "duration": 15}]}
            
        plans_created = []
        today = datetime.now()

        for i, row in enumerate(review_topics):
            topic = dict(zip(cols, row))
            # Spread reviews across the planning period
            day_offset = i % days
            scheduled = (today + timedelta(days=day_offset)).strftime('%Y-%m-%d')

            # Determine duration based on mastery level
            mastery = topic.get('mastery_level', 0)
            duration = 15 if mastery > 0.7 else 30 if mastery > 0.4 else 45

            plan_id = str(uuid.uuid4())
            await conn.execute(
                "INSERT OR IGNORE INTO study_plans (id, topic_id, title, description, scheduled_date, duration_minutes) VALUES (?, ?, ?, ?, ?, ?)",
                (plan_id, topic['topic_id'], f"Review: {topic['topic_name']}",
                 f"Mastery: {int(mastery*100)}% - {'Quick review' if mastery > 0.7 else 'Deep study needed'}",
                 scheduled, duration)
            )
            plans_created.append({"id": plan_id, "topic": topic['topic_name'], "date": scheduled, "duration": duration})

        await conn.commit()
        return {"plans_created": len(plans_created), "plans": plans_created}
    except Exception as e:
        logger.error(f"Failed to generate study plan: {e}")
        return {"plans_created": 0, "plans": [], "error": str(e)}
