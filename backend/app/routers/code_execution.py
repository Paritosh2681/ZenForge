"""
Phase 3: Code Execution Sandbox Router
Secure Python code execution for STEM learning
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import subprocess
import tempfile
import os
import time
import uuid
import logging

from app.services.database import get_database

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/code", tags=["code-execution"])

class CodeRequest(BaseModel):
    code: str
    language: str = "python"
    conversation_id: Optional[str] = None
    timeout: int = 10

class CodeResponse(BaseModel):
    execution_id: str
    output: str
    error: Optional[str]
    execution_time: float
    language: str

@router.post("/execute", response_model=CodeResponse)
async def execute_code(request: CodeRequest):
    """Execute Python code in a sandboxed environment"""
    if request.language != "python":
        raise HTTPException(status_code=400, detail="Only Python is currently supported")

    # Security: block dangerous imports/operations
    dangerous = ['os.system', 'subprocess', 'shutil.rmtree', '__import__', 'eval(', 'exec(',
                 'open(', 'os.remove', 'os.unlink', 'os.rmdir', 'importlib']
    for d in dangerous:
        if d in request.code:
            raise HTTPException(status_code=400, detail=f"Blocked: '{d}' is not allowed for security")

    execution_id = str(uuid.uuid4())
    start_time = time.time()

    # Write code to temp file and execute
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, prefix='zenforge_') as f:
            # Add safe imports preamble
            safe_code = "import sys\nsys.path = [p for p in sys.path if 'site-packages' not in p or 'numpy' in p or 'matplotlib' in p]\n"
            safe_code += request.code
            f.write(safe_code)
            temp_path = f.name

        result = subprocess.run(
            ['python3', temp_path],
            capture_output=True,
            text=True,
            timeout=min(request.timeout, 30),
            cwd=tempfile.gettempdir()
        )

        execution_time = time.time() - start_time
        output = result.stdout or ""
        error = result.stderr if result.returncode != 0 else None

    except subprocess.TimeoutExpired:
        execution_time = time.time() - start_time
        output = ""
        error = f"Execution timed out after {request.timeout} seconds"
    except Exception as e:
        execution_time = time.time() - start_time
        output = ""
        error = str(e)
    finally:
        try:
            os.unlink(temp_path)
        except:
            pass

    # Save to database
    try:
        db = get_database()
        conn = await db.connect()
        await conn.execute(
            "INSERT INTO code_executions (id, conversation_id, code, language, output, error, execution_time) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (execution_id, request.conversation_id, request.code, request.language, output, error, execution_time)
        )
        await conn.commit()
    except Exception as e:
        logger.warning(f"Failed to save code execution: {e}")

    return CodeResponse(
        execution_id=execution_id,
        output=output[:5000],  # Limit output size
        error=error[:2000] if error else None,
        execution_time=round(execution_time, 3),
        language=request.language
    )

@router.get("/history")
async def get_execution_history(conversation_id: Optional[str] = None, limit: int = 20):
    """Get code execution history"""
    try:
        db = get_database()
        conn = await db.connect()
        if conversation_id:
            cursor = await conn.execute(
                "SELECT * FROM code_executions WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?",
                (conversation_id, limit)
            )
        else:
            cursor = await conn.execute(
                "SELECT * FROM code_executions ORDER BY created_at DESC LIMIT ?",
                (limit,)
            )
        rows = await cursor.fetchall()
        cols = [d[0] for d in cursor.description]
        return {"executions": [dict(zip(cols, row)) for row in rows], "count": len(rows)}
    except Exception as e:
        return {"executions": [], "count": 0}
