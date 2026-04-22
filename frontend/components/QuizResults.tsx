'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api-client';
import type { QuizResults as QuizResultsType } from '@/types/quiz';

interface QuizResultsProps {
  sessionId: string;
  onBack: () => void;
  onRetry: (quizId: string) => void;
}

export default function QuizResults({ sessionId, onBack, onRetry }: QuizResultsProps) {
  const [results, setResults] = useState<QuizResultsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResults();
  }, [sessionId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getQuizResults(sessionId);
      setResults(data);
    } catch (err) {
      console.error('Failed to load results:', err);
      setError('Failed to load quiz results');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Results not found'}</p>
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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 overflow-y-auto">
      {/* Header with Score */}
      <div className="p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Quiz Results</h2>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-sm opacity-90 mb-2">Score</div>
              <div className="text-4xl font-bold">
                {results.score}/{results.max_score}
              </div>
            </div>

            {/* Percentage */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-sm opacity-90 mb-2">Percentage</div>
              <div className="text-4xl font-bold">{Math.round(results.percentage)}%</div>
              <div className="mt-2">
                {results.passed ? (
                  <span className="inline-flex items-center gap-1 text-green-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Passed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-red-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Not Passed
                  </span>
                )}
              </div>
            </div>

            {/* Time */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-sm opacity-90 mb-2">Time Taken</div>
              <div className="text-4xl font-bold">{formatTime(results.time_taken)}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => onRetry(results.session.quiz_id)}
              className="px-6 py-3 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Retry Quiz
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Question Review
          </h3>

          <div className="space-y-6">
            {results.questions.map((question, index) => {
              const response = results.responses.find((r) => r.question_id === question.id);
              const isCorrect = response?.is_correct || false;

              return (
                <div
                  key={question.id}
                  className={`p-6 rounded-lg border-2 ${
                    isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/10'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Question {index + 1}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded">
                          {question.difficulty}
                        </span>
                        {question.topic && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                            {question.topic}
                          </span>
                        )}
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {question.question_text}
                      </p>
                    </div>

                    {/* Correct/Incorrect Icon */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      {isCorrect ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Answers */}
                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Your Answer:{' '}
                      </span>
                      <span
                        className={`font-semibold ${
                          isCorrect
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-red-700 dark:text-red-300'
                        }`}
                      >
                        {response?.user_answer}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Correct Answer:{' '}
                        </span>
                        <span className="font-semibold text-green-700 dark:text-green-300">
                          {question.correct_answer}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Explanation */}
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Explanation:
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {question.explanation}
                    </p>
                  </div>

                  {/* Time Taken */}
                  {response?.time_taken && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Time taken: {response.time_taken}s
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
