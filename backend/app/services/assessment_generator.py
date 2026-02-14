"""
Assessment Generator Service - Generate quizzes from documents using LLM
Phase 4: Week 1
"""
import json
import logging
from typing import List, Dict, Any, Optional
import random

from app.services.ollama_client import OllamaClient
from app.services.vector_store import VectorStore
from app.models.quiz_schemas import QuestionCreate
from app.config import settings

logger = logging.getLogger(__name__)


class AssessmentGenerator:
    """Generate quiz questions from educational content using LLM"""

    def __init__(self):
        self.llm_client = OllamaClient()
        self.vector_store = VectorStore()

    async def generate_quiz_questions(
        self,
        document_ids: Optional[List[str]] = None,
        num_questions: int = 10,
        difficulty: str = 'mixed',
        question_types: Optional[List[str]] = None
    ) -> List[QuestionCreate]:
        """
        Generate quiz questions from documents

        Args:
            document_ids: Specific documents to generate from (None = all)
            num_questions: Number of questions to generate
            difficulty: 'easy', 'medium', 'hard', or 'mixed'
            question_types: Filter by question type

        Returns:
            List of generated questions
        """
        # Step 1: Retrieve relevant document chunks
        chunks = await self._get_document_chunks(document_ids)

        if not chunks:
            logger.warning("No document chunks found for quiz generation")
            return []

        # Step 2: Determine question distribution
        question_distribution = self._plan_question_distribution(
            num_questions, difficulty, question_types
        )

        # Step 3: Generate questions
        questions = []
        for question_spec in question_distribution:
            try:
                # Select relevant chunk for this question
                chunk = random.choice(chunks)

                # Generate question using LLM
                question = await self._generate_single_question(
                    chunk=chunk,
                    question_type=question_spec['type'],
                    difficulty=question_spec['difficulty']
                )

                if question:
                    questions.append(question)

            except Exception as e:
                logger.error(f"Failed to generate question: {e}")
                continue

        logger.info(f"Generated {len(questions)} questions successfully")
        return questions

    async def _get_document_chunks(
        self,
        document_ids: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve document chunks for quiz generation"""
        try:
            # Get all chunks from vector store
            # In a full implementation, you'd filter by document_ids
            # For now, we'll use a search query to get diverse content
            results = self.vector_store.search(
                query_text="educational content summary concepts",
                k=20  # Get more chunks for variety
            )

            chunks = []
            for result in results:
                chunks.append({
                    'content': result['content'],
                    'document_name': result.get('document_name', 'Unknown'),
                    'metadata': result.get('metadata', {})
                })

            return chunks

        except Exception as e:
            logger.error(f"Failed to retrieve document chunks: {e}")
            return []

    def _plan_question_distribution(
        self,
        num_questions: int,
        difficulty: str,
        question_types: Optional[List[str]] = None
    ) -> List[Dict[str, str]]:
        """Plan the distribution of question types and difficulties"""

        # Default question types
        if not question_types:
            question_types = ['multiple_choice', 'true_false']

        # Difficulty distribution
        if difficulty == 'mixed':
            difficulties = []
            # 40% easy, 40% medium, 20% hard
            easy_count = int(num_questions * 0.4)
            medium_count = int(num_questions * 0.4)
            hard_count = num_questions - easy_count - medium_count

            difficulties.extend(['easy'] * easy_count)
            difficulties.extend(['medium'] * medium_count)
            difficulties.extend(['hard'] * hard_count)
        else:
            difficulties = [difficulty] * num_questions

        # Type distribution
        types_distribution = []
        for i in range(num_questions):
            types_distribution.append(question_types[i % len(question_types)])

        # Combine into specs
        distribution = []
        for i in range(num_questions):
            distribution.append({
                'type': types_distribution[i],
                'difficulty': difficulties[i]
            })

        return distribution

    async def _generate_single_question(
        self,
        chunk: Dict[str, Any],
        question_type: str,
        difficulty: str
    ) -> Optional[QuestionCreate]:
        """Generate a single question using LLM"""

        if question_type == 'multiple_choice':
            return await self._generate_multiple_choice(chunk, difficulty)
        elif question_type == 'true_false':
            return await self._generate_true_false(chunk, difficulty)
        elif question_type == 'short_answer':
            return await self._generate_short_answer(chunk, difficulty)
        else:
            logger.warning(f"Unknown question type: {question_type}")
            return None

    async def _generate_multiple_choice(
        self,
        chunk: Dict[str, Any],
        difficulty: str
    ) -> Optional[QuestionCreate]:
        """Generate a multiple choice question"""

        prompt = self._build_mcq_prompt(chunk['content'], difficulty)

        try:
            response = await self.llm_client.generate(prompt)
            question_data = self._parse_question_response(response)

            if not question_data:
                return None

            return QuestionCreate(
                question_text=question_data['question'],
                question_type='multiple_choice',
                difficulty=difficulty,
                topic=question_data.get('topic'),
                options=question_data['options'],
                correct_answer=question_data['correct_answer'],
                explanation=question_data['explanation'],
                points=self._calculate_points(difficulty)
            )

        except Exception as e:
            logger.error(f"Failed to generate MCQ: {e}")
            return None

    async def _generate_true_false(
        self,
        chunk: Dict[str, Any],
        difficulty: str
    ) -> Optional[QuestionCreate]:
        """Generate a true/false question"""

        prompt = self._build_true_false_prompt(chunk['content'], difficulty)

        try:
            response = await self.llm_client.generate(prompt)
            question_data = self._parse_question_response(response)

            if not question_data:
                return None

            return QuestionCreate(
                question_text=question_data['question'],
                question_type='true_false',
                difficulty=difficulty,
                topic=question_data.get('topic'),
                options=['True', 'False'],
                correct_answer=question_data['correct_answer'],
                explanation=question_data['explanation'],
                points=self._calculate_points(difficulty)
            )

        except Exception as e:
            logger.error(f"Failed to generate T/F question: {e}")
            return None

    async def _generate_short_answer(
        self,
        chunk: Dict[str, Any],
        difficulty: str
    ) -> Optional[QuestionCreate]:
        """Generate a short answer question"""

        prompt = self._build_short_answer_prompt(chunk['content'], difficulty)

        try:
            response = await self.llm_client.generate(prompt)
            question_data = self._parse_question_response(response)

            if not question_data:
                return None

            return QuestionCreate(
                question_text=question_data['question'],
                question_type='short_answer',
                difficulty=difficulty,
                topic=question_data.get('topic'),
                options=None,
                correct_answer=question_data['correct_answer'],
                explanation=question_data['explanation'],
                points=self._calculate_points(difficulty) * 2  # Short answer worth more
            )

        except Exception as e:
            logger.error(f"Failed to generate short answer: {e}")
            return None

    def _build_mcq_prompt(self, content: str, difficulty: str) -> str:
        """Build prompt for multiple choice question generation"""

        difficulty_guidance = {
            'easy': 'Test basic recall and understanding of concepts.',
            'medium': 'Test application and analysis of concepts.',
            'hard': 'Test synthesis, evaluation, and critical thinking.'
        }

        return f"""Based on the following educational content, generate ONE multiple-choice question.

Content:
{content[:1000]}

Requirements:
- Difficulty: {difficulty} - {difficulty_guidance.get(difficulty, '')}
- Provide exactly 4 options (A, B, C, D)
- One correct answer
- Make distractors plausible but clearly wrong
- Focus on understanding, not just memorization
- Provide a clear explanation

Respond with ONLY valid JSON in this exact format:
{{
  "question": "Your question text here?",
  "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
  "correct_answer": "A",
  "explanation": "Explanation why A is correct and others are wrong",
  "topic": "Main topic of the question"
}}"""

    def _build_true_false_prompt(self, content: str, difficulty: str) -> str:
        """Build prompt for true/false question generation"""

        return f"""Based on the following educational content, generate ONE true/false question.

Content:
{content[:1000]}

Requirements:
- Difficulty: {difficulty}
- Create a statement that is clearly true or false
- Avoid ambiguous or trick questions
- Provide a clear explanation

Respond with ONLY valid JSON in this exact format:
{{
  "question": "Your statement here.",
  "correct_answer": "True",
  "explanation": "Explanation of why this is true/false",
  "topic": "Main topic"
}}"""

    def _build_short_answer_prompt(self, content: str, difficulty: str) -> str:
        """Build prompt for short answer question generation"""

        return f"""Based on the following educational content, generate ONE short answer question.

Content:
{content[:1000]}

Requirements:
- Difficulty: {difficulty}
- Question should require 1-3 sentence answer
- Provide model answer
- Focus on explanation and understanding

Respond with ONLY valid JSON in this exact format:
{{
  "question": "Your question here?",
  "correct_answer": "Model answer (1-3 sentences)",
  "explanation": "Grading criteria and key points",
  "topic": "Main topic"
}}"""

    def _parse_question_response(self, response: str) -> Optional[Dict[str, Any]]:
        """Parse LLM response into question data"""
        try:
            # Try to extract JSON from response
            # Sometimes LLM adds extra text, so find the JSON block
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1

            if start_idx == -1 or end_idx == 0:
                logger.error("No JSON found in response")
                return None

            json_str = response[start_idx:end_idx]
            data = json.loads(json_str)

            # Validate required fields
            if 'question' not in data or 'correct_answer' not in data:
                logger.error("Missing required fields in parsed question")
                return None

            return data

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from LLM response: {e}")
            logger.debug(f"Response was: {response}")
            return None
        except Exception as e:
            logger.error(f"Error parsing question response: {e}")
            return None

    def _calculate_points(self, difficulty: str) -> int:
        """Calculate points based on difficulty"""
        points_map = {
            'easy': 1,
            'medium': 2,
            'hard': 3
        }
        return points_map.get(difficulty, 1)

    async def extract_topics(self, chunks: List[Dict[str, Any]]) -> List[str]:
        """Extract main topics from document chunks"""
        # Simple topic extraction - in production, use NLP libraries
        topics = set()

        for chunk in chunks[:10]:  # Sample first 10 chunks
            # Use LLM to extract topics
            prompt = f"""Identify the main topics or concepts in this text.
List 1-3 topics, separated by commas.

Text:
{chunk['content'][:500]}

Topics:"""

            try:
                response = await self.llm_client.generate(prompt)
                # Parse comma-separated topics
                chunk_topics = [t.strip() for t in response.split(',')]
                topics.update(chunk_topics[:3])
            except Exception as e:
                logger.error(f"Failed to extract topics: {e}")
                continue

        return list(topics)
