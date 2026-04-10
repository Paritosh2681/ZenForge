"""
Assessment Generator Service - Generate quizzes from documents using LLM
Phase 4: Week 1
"""

import json
import logging
import random
import re
from typing import Any, Dict, List, Optional

from app.models.quiz_schemas import QuestionCreate
from app.services.llm_client import OllamaClient
from app.services.vector_store import VectorStore

logger = logging.getLogger(__name__)


class AssessmentGenerator:
    """Generate quiz questions from educational content using LLM"""

    def __init__(self):
        self.llm_client = OllamaClient()
        self.vector_store = VectorStore()

    async def generate_quiz_questions(
        self,
        document_ids: Optional[List[str]] = None,
        num_questions: int = 5,
        difficulty: str = "mixed",
        question_types: Optional[List[str]] = None,
    ) -> List[QuestionCreate]:
        """Generate quiz questions from documents."""
        chunks = await self._get_document_chunks(document_ids)

        if document_ids and not chunks:
            logger.warning("No chunks found for selected documents: %s", document_ids)
            return []

        if not chunks:
            logger.warning("No document chunks found for quiz generation")
            return []

        question_distribution = self._plan_question_distribution(
            num_questions, difficulty, question_types
        )

        questions: List[QuestionCreate] = []
        random.shuffle(chunks)

        for i, question_spec in enumerate(question_distribution):
            try:
                chunk = chunks[i % len(chunks)]
                question = await self._generate_single_question(
                    chunk=chunk,
                    question_type=question_spec["type"],
                    difficulty=question_spec["difficulty"],
                )

                if not question:
                    continue

                if not self._is_question_grounded(question, chunk):
                    logger.warning("Generated question not grounded. Using deterministic fallback.")
                    question = self._build_grounded_fallback(
                        chunk=chunk,
                        question_type=question_spec["type"],
                        difficulty=question_spec["difficulty"],
                    )

                if question:
                    questions.append(question)

            except Exception as e:
                logger.error("Failed to generate question: %s", e)
                continue

        logger.info("Generated %d questions successfully", len(questions))
        return questions

    async def _get_document_chunks(
        self,
        document_ids: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """Retrieve document chunks for quiz generation."""
        try:
            logger.info(f"📚 Retrieving chunks for document_ids: {document_ids}")
            
            chunks = self.vector_store.get_chunks(document_ids=document_ids, limit=180)
            logger.info(f"  Retrieved {len(chunks)} chunks from vector store")

            if document_ids:
                requested = set(document_ids)
                logger.info(f"  Filtering to requested document IDs: {requested}")
                
                chunks = [
                    c
                    for c in chunks
                    if c.get("metadata", {}).get("document_id") in requested
                ]
                
                logger.info(f"  After filtering: {len(chunks)} chunks match requested documents")
                
                # Debug: show which documents are actually in the chunks
                found_docs = set()
                for c in chunks:
                    doc_id = c.get("metadata", {}).get("document_id")
                    if doc_id:
                        found_docs.add(doc_id)
                
                logger.info(f"  Found chunks from documents: {found_docs}")
                if requested - found_docs:
                    logger.warning(f"  ⚠️ No chunks found for documents: {requested - found_docs}")

            chunks = [c for c in chunks if c.get("content")]
            logger.info(f"  Final chunk count (with content): {len(chunks)}")
            
            return chunks

        except Exception as e:
            logger.error(f"❌ Failed to retrieve document chunks: {e}")
            return []

    def _plan_question_distribution(
        self,
        num_questions: int,
        difficulty: str,
        question_types: Optional[List[str]] = None,
    ) -> List[Dict[str, str]]:
        """Plan distribution of question types and difficulties."""
        if not question_types:
            question_types = ["multiple_choice", "true_false"]

        if difficulty == "mixed":
            difficulties: List[str] = []
            easy_count = int(num_questions * 0.4)
            medium_count = int(num_questions * 0.4)
            hard_count = num_questions - easy_count - medium_count

            difficulties.extend(["easy"] * easy_count)
            difficulties.extend(["medium"] * medium_count)
            difficulties.extend(["hard"] * hard_count)
        else:
            difficulties = [difficulty] * num_questions

        types_distribution: List[str] = []
        for i in range(num_questions):
            types_distribution.append(question_types[i % len(question_types)])

        distribution: List[Dict[str, str]] = []
        for i in range(num_questions):
            distribution.append({
                "type": types_distribution[i],
                "difficulty": difficulties[i],
            })

        return distribution

    async def _generate_single_question(
        self,
        chunk: Dict[str, Any],
        question_type: str,
        difficulty: str,
    ) -> Optional[QuestionCreate]:
        if question_type == "multiple_choice":
            return await self._generate_multiple_choice(chunk, difficulty)
        if question_type == "true_false":
            return await self._generate_true_false(chunk, difficulty)
        if question_type == "short_answer":
            return await self._generate_short_answer(chunk, difficulty)

        logger.warning("Unknown question type: %s", question_type)
        return None

    async def _generate_multiple_choice(
        self,
        chunk: Dict[str, Any],
        difficulty: str,
    ) -> Optional[QuestionCreate]:
        prompt = self._build_mcq_prompt(chunk["content"], difficulty)

        try:
            response = await self.llm_client.generate(prompt)
            question_data = self._parse_question_response(response)
            question_data = self._normalize_mcq_payload(question_data)

            if not question_data:
                raise ValueError("Failed to parse MCQ response")

            return QuestionCreate(
                question_text=question_data["question"],
                question_type="multiple_choice",
                difficulty=difficulty,
                topic=question_data.get("topic"),
                options=question_data["options"],
                correct_answer=question_data["correct_answer"],
                explanation=question_data["explanation"],
                points=self._calculate_points(difficulty),
            )

        except Exception as e:
            logger.warning("Failed to generate MCQ, using grounded fallback: %s", e)
            return self._fallback_multiple_choice(chunk, difficulty)

    async def _generate_true_false(
        self,
        chunk: Dict[str, Any],
        difficulty: str,
    ) -> Optional[QuestionCreate]:
        prompt = self._build_true_false_prompt(chunk["content"], difficulty)

        try:
            response = await self.llm_client.generate(prompt)
            question_data = self._parse_question_response(response)
            question_data = self._normalize_true_false_payload(question_data)

            if not question_data:
                raise ValueError("Failed to parse True/False response")

            return QuestionCreate(
                question_text=question_data["question"],
                question_type="true_false",
                difficulty=difficulty,
                topic=question_data.get("topic"),
                options=["True", "False"],
                correct_answer=question_data["correct_answer"],
                explanation=question_data["explanation"],
                points=self._calculate_points(difficulty),
            )

        except Exception as e:
            logger.warning("Failed to generate True/False, using grounded fallback: %s", e)
            return self._fallback_true_false(chunk, difficulty)

    async def _generate_short_answer(
        self,
        chunk: Dict[str, Any],
        difficulty: str,
    ) -> Optional[QuestionCreate]:
        prompt = self._build_short_answer_prompt(chunk["content"], difficulty)

        try:
            response = await self.llm_client.generate(prompt)
            question_data = self._parse_question_response(response)
            question_data = self._normalize_short_answer_payload(question_data)

            if not question_data:
                raise ValueError("Failed to parse short answer response")

            return QuestionCreate(
                question_text=question_data["question"],
                question_type="short_answer",
                difficulty=difficulty,
                topic=question_data.get("topic"),
                options=None,
                correct_answer=question_data["correct_answer"],
                explanation=question_data["explanation"],
                points=self._calculate_points(difficulty) * 2,
            )

        except Exception as e:
            logger.warning("Failed to generate short answer, using grounded fallback: %s", e)
            return self._fallback_short_answer(chunk, difficulty)

    def _build_grounded_fallback(
        self,
        chunk: Dict[str, Any],
        question_type: str,
        difficulty: str,
    ) -> Optional[QuestionCreate]:
        if question_type == "multiple_choice":
            return self._fallback_multiple_choice(chunk, difficulty)
        if question_type == "true_false":
            return self._fallback_true_false(chunk, difficulty)
        if question_type == "short_answer":
            return self._fallback_short_answer(chunk, difficulty)
        return None

    def _fallback_multiple_choice(self, chunk: Dict[str, Any], difficulty: str) -> QuestionCreate:
        content = chunk.get("content", "")
        keywords = self._extract_keywords(content, max_keywords=6)
        focus = keywords[0] if keywords else "key concept"
        excerpt = self._best_excerpt(content, max_chars=180)
        topic = self._derive_topic(chunk, fallback=focus)

        options = [
            f"A) {focus}",
            "B) A concept not mentioned in the excerpt",
            "C) A random fact unrelated to the excerpt",
            "D) An outside assumption not present in the material",
        ]

        return QuestionCreate(
            question_text=f"According to this excerpt, which term appears explicitly? \"{excerpt}\"",
            question_type="multiple_choice",
            difficulty=difficulty,
            topic=topic,
            options=options,
            correct_answer="A",
            explanation=f"The excerpt explicitly contains '{focus}'. The other options are not grounded in the provided text.",
            points=self._calculate_points(difficulty),
        )

    def _fallback_true_false(self, chunk: Dict[str, Any], difficulty: str) -> QuestionCreate:
        content = chunk.get("content", "")
        statement = self._best_excerpt(content, max_chars=180)
        topic = self._derive_topic(chunk)

        return QuestionCreate(
            question_text=f"True or False: {statement}",
            question_type="true_false",
            difficulty=difficulty,
            topic=topic,
            options=["True", "False"],
            correct_answer="True",
            explanation="This statement is taken directly from the study material.",
            points=self._calculate_points(difficulty),
        )

    def _fallback_short_answer(self, chunk: Dict[str, Any], difficulty: str) -> QuestionCreate:
        content = chunk.get("content", "")
        keywords = self._extract_keywords(content, max_keywords=6)
        focus = keywords[0] if keywords else "the main concept"
        answer_seed = self._best_excerpt(content, max_chars=220)
        topic = self._derive_topic(chunk, fallback=focus)

        return QuestionCreate(
            question_text=f"In 1-2 sentences, explain '{focus}' using only the study material.",
            question_type="short_answer",
            difficulty=difficulty,
            topic=topic,
            options=None,
            correct_answer=answer_seed,
            explanation="A strong answer should stay faithful to the provided material and avoid outside assumptions.",
            points=self._calculate_points(difficulty) * 2,
        )

    def _build_mcq_prompt(self, content: str, difficulty: str) -> str:
        difficulty_guidance = {
            "easy": "Test basic recall and understanding.",
            "medium": "Test application and analysis.",
            "hard": "Test synthesis, evaluation, and critical thinking.",
        }

        return f"""Based on the following educational content, generate ONE multiple-choice question.

Content:
{content[:1000]}

Requirements:
1) Use ONLY facts in the provided content. Do not use outside knowledge.
2) Difficulty target: {difficulty}. {difficulty_guidance.get(difficulty, difficulty_guidance['medium'])}
3) Create exactly 4 options with only one correct answer.
4) Avoid placeholders like Concept A/B/C/D.

Respond with ONLY valid JSON in this exact format:
{{
  "question": "Your question text here?",
  "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
  "correct_answer": "A",
  "explanation": "Why A is correct and others are wrong",
  "topic": "Main topic of the question"
}}"""

    def _build_true_false_prompt(self, content: str, difficulty: str) -> str:
        return f"""Based on the following educational content, generate ONE true/false question.

Content:
{content[:1000]}

Requirements:
1) Use ONLY facts present in the provided content.
2) Difficulty target: {difficulty}.
3) The statement must be directly verifiable from the content.

Respond with ONLY valid JSON in this exact format:
{{
  "question": "Your statement here.",
  "correct_answer": "True",
  "explanation": "Explanation of why this is true/false",
  "topic": "Main topic"
}}"""

    def _build_short_answer_prompt(self, content: str, difficulty: str) -> str:
        return f"""Based on the following educational content, generate ONE short answer question.

Content:
{content[:1000]}

Requirements:
1) Use ONLY facts present in the provided content.
2) Difficulty target: {difficulty}.
3) Keep the answer concise and grounded in the text.

Respond with ONLY valid JSON in this exact format:
{{
  "question": "Your question here?",
  "correct_answer": "Model answer (1-3 sentences)",
  "explanation": "Grading criteria and key points",
  "topic": "Main topic"
}}"""

    def _parse_question_response(self, response: str) -> Optional[Dict[str, Any]]:
        try:
            start_idx = response.find("{")
            end_idx = response.rfind("}") + 1

            if start_idx == -1 or end_idx == 0:
                logger.error("No JSON found in response")
                return None

            json_str = response[start_idx:end_idx]
            data = json.loads(json_str)

            if "question" not in data or "correct_answer" not in data:
                logger.error("Missing required fields in parsed question")
                return None

            return data

        except json.JSONDecodeError as e:
            logger.error("Failed to parse JSON from LLM response: %s", e)
            logger.debug("Response was: %s", response)
            return None
        except Exception as e:
            logger.error("Error parsing question response: %s", e)
            return None

    def _normalize_mcq_payload(self, data: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if not data:
            return None

        question = str(data.get("question", "")).strip()
        explanation = str(data.get("explanation", "")).strip()
        topic = str(data.get("topic", "")).strip() or "Core Concept"
        options_raw = data.get("options")

        if not question or not isinstance(options_raw, list) or len(options_raw) < 4:
            return None

        letters = ["A", "B", "C", "D"]
        options: List[str] = []
        for i, option in enumerate(options_raw[:4]):
            option_text = re.sub(r"^[A-Da-d][\)\.:\-]\s*", "", str(option).strip())
            if not option_text:
                return None
            options.append(f"{letters[i]}) {option_text}")

        raw_correct = str(data.get("correct_answer", "")).strip()
        match = re.search(r"[ABCD]", raw_correct.upper())

        if match:
            correct_answer = match.group(0)
        else:
            lowered = raw_correct.lower()
            correct_answer = None
            for i, option in enumerate(options):
                if lowered and lowered in option.lower():
                    correct_answer = letters[i]
                    break
            if not correct_answer:
                return None

        if not explanation:
            explanation = "Correct answer is supported by the provided material."

        return {
            "question": question,
            "options": options,
            "correct_answer": correct_answer,
            "explanation": explanation,
            "topic": topic,
        }

    def _normalize_true_false_payload(self, data: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if not data:
            return None

        question = str(data.get("question", "")).strip()
        explanation = str(data.get("explanation", "")).strip() or "Evaluate the statement using only the provided text."
        topic = str(data.get("topic", "")).strip() or "Core Concept"
        correct_raw = str(data.get("correct_answer", "")).strip().lower()

        if not question:
            return None

        if correct_raw in ("true", "t", "yes"):
            correct_answer = "True"
        elif correct_raw in ("false", "f", "no"):
            correct_answer = "False"
        else:
            return None

        return {
            "question": question,
            "correct_answer": correct_answer,
            "explanation": explanation,
            "topic": topic,
        }

    def _normalize_short_answer_payload(self, data: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if not data:
            return None

        question = str(data.get("question", "")).strip()
        correct_answer = str(data.get("correct_answer", "")).strip()
        explanation = str(data.get("explanation", "")).strip() or "Answer should reflect key facts from the material."
        topic = str(data.get("topic", "")).strip() or "Core Concept"

        if not question or not correct_answer:
            return None

        return {
            "question": question,
            "correct_answer": correct_answer,
            "explanation": explanation,
            "topic": topic,
        }

    def _derive_topic(self, chunk: Dict[str, Any], fallback: str = "Core Concept") -> str:
        metadata = chunk.get("metadata", {}) if chunk else {}
        filename = metadata.get("filename") or metadata.get("document_name")
        if filename:
            name = str(filename).strip()
            if "." in name:
                name = ".".join(name.split(".")[:-1]) or name
            return name[:80]
        return fallback

    def _extract_sentences(self, content: str) -> List[str]:
        if not content:
            return []

        collapsed = re.sub(r"\s+", " ", content).strip()
        sentences = re.split(r"(?<=[.!?])\s+", collapsed)
        return [s.strip() for s in sentences if len(s.strip()) >= 30]

    def _extract_keywords(self, content: str, max_keywords: int = 8) -> List[str]:
        if not content:
            return []

        stopwords = {
            "the", "and", "that", "with", "from", "this", "these", "those", "are", "for",
            "was", "were", "have", "has", "had", "into", "about", "after", "before", "while",
            "which", "their", "there", "where", "when", "what", "your", "each", "than", "then",
            "would", "could", "should", "also", "using", "used", "between", "within", "across",
            "over", "under", "through", "because", "such", "some", "many", "most", "only", "same",
        }

        words = re.findall(r"[A-Za-z][A-Za-z0-9_-]{3,}", content)
        keywords: List[str] = []
        seen = set()
        for raw in words:
            word = raw.strip()
            lower = word.lower()
            if lower in stopwords or lower in seen:
                continue
            seen.add(lower)
            keywords.append(word)
            if len(keywords) >= max_keywords:
                break

        return keywords

    def _best_excerpt(self, content: str, max_chars: int = 160) -> str:
        sentences = self._extract_sentences(content)
        if sentences:
            return sentences[0][:max_chars].strip()
        return re.sub(r"\s+", " ", (content or "")).strip()[:max_chars]

    def _is_question_grounded(self, question: QuestionCreate, chunk: Dict[str, Any]) -> bool:
        content = (chunk.get("content") or "").lower()
        if not content:
            return False

        question_text = (question.question_text or "").lower()
        explanation = (question.explanation or "").lower()
        combined = f"{question_text} {explanation}".strip()

        disallowed_markers = [
            "concept a",
            "concept b",
            "concept c",
            "concept d",
            "placeholder question",
        ]

        for marker in disallowed_markers:
            if marker in combined:
                return False
            if question.options and any(marker in opt.lower() for opt in question.options):
                return False

        keywords = [k.lower() for k in self._extract_keywords(chunk.get("content", ""), max_keywords=6)]
        if not keywords:
            return True

        return any(keyword in combined for keyword in keywords)

    def _calculate_points(self, difficulty: str) -> int:
        points_map = {
            "easy": 1,
            "medium": 2,
            "hard": 3,
        }
        return points_map.get(difficulty, 1)

    async def extract_topics(self, chunks: List[Dict[str, Any]]) -> List[str]:
        """Extract main topics from document chunks."""
        topics = set()

        for chunk in chunks[:10]:
            prompt = f"""Identify the main topics or concepts in this text.
List 1-3 topics, separated by commas.

Text:
{chunk['content'][:500]}

Topics:"""

            try:
                response = await self.llm_client.generate(prompt)
                chunk_topics = [t.strip() for t in response.split(",")]
                topics.update(chunk_topics[:3])
            except Exception as e:
                logger.error("Failed to extract topics: %s", e)
                continue

        return list(topics)
