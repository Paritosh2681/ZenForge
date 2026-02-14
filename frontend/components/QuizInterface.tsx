'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api-client';
import type { QuizDetail, Question, QuizSession, QuestionResponse } from '@/types/quiz';

interface QuizInterfaceProps {
  quizId: string;
  onComplete: (sessionId: string) => void;
  onBack: () => void;
}

export default function QuizInterface({ quizId, onComplete, onBack }: QuizInterfaceProps) {
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, string>>(new Map());
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  useEffect(() => {
    loadQuizAndStart();
  }, [quizId]);

  const loadQuizAndStart = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load quiz (without answers)
      const quizData = await api.getQuiz(quizId, false);
      setQuiz(quizData);

      // Start session
      const sessionData = await api.startQuizSession({ quiz_id: quizId });
      setSession(sessionData);
      setQuestionStartTime(Date.now());

    } catch (err: any) {
      console.error('Failed to load quiz:', err);
      setError(err.response?.data?.detail || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (!quiz) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const newAnswers = new Map(userAnswers);
    newAnswers.set(currentQuestion.id, answer);
    setUserAnswers(newAnswers);
  };

  const handleNext = async () => {
    if (!quiz || !session) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const userAnswer = userAnswers.get(currentQuestion.id);

    if (!userAnswer) {
      alert('Please select an answer before proceeding');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Calculate time taken for this question
      const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

      // Submit answer
      const response = await api.submitAnswer(session.id, {
        question_id: currentQuestion.id,
        user_answer: userAnswer,
        time_taken: timeTaken,
      });

      setResponses([...responses, response]);

      // Move to next question or complete
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setQuestionStartTime(Date.now());
      } else {
        // Complete quiz
        await api.completeQuiz(session.id);
        onComplete(session.id);
      }

    } catch (err: any) {
      console.error('Failed to submit answer:', err);
      setError('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setQuestionStartTime(Date.now());
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Quiz not found'}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const currentAnswer = userAnswers.get(currentQuestion.id) || '';
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {quiz.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            Exit Quiz
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Question Text */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded">
                {currentQuestion.difficulty}
              </span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded">
                {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
              {currentQuestion.question_text}
            </h3>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
              <>
                {currentQuestion.options.map((option, index) => {
                  const optionLetter = option.charAt(0);
                  const isSelected = currentAnswer === optionLetter;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(optionLetter)}
                      className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                    >
                      <span className="text-gray-900 dark:text-gray-100">{option}</span>
                    </button>
                  );
                })}
              </>
            )}

            {currentQuestion.question_type === 'true_false' && (
              <>
                {['True', 'False'].map((option) => {
                  const isSelected = currentAnswer === option;

                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                    >
                      <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {option}
                      </span>
                    </button>
                  );
                })}
              </>
            )}

            {currentQuestion.question_type === 'short_answer' && (
              <textarea
                value={currentAnswer}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={4}
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0 || submitting}
            className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {responses.length} of {quiz.questions.length} answered
          </div>

          <button
            onClick={handleNext}
            disabled={!currentAnswer || submitting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            {submitting
              ? 'Submitting...'
              : currentQuestionIndex === quiz.questions.length - 1
              ? 'Finish Quiz'
              : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
}
