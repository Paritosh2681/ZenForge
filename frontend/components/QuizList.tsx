'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api-client';
import type { Quiz, QuizCreateRequest } from '@/types/quiz';

interface QuizListProps {
  onSelectQuiz: (quizId: string) => void;
}

export default function QuizList({ onSelectQuiz }: QuizListProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quiz generation form state
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('mixed');

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listQuizzes(50, 0);
      setQuizzes(data.quizzes);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (generating) return;

    try {
      setGenerating(true);
      setError(null);

      const request: QuizCreateRequest = {
        num_questions: numQuestions,
        difficulty: difficulty,
      };

      const newQuiz = await api.generateQuiz(request);

      // Add to list
      setQuizzes([newQuiz, ...quizzes]);
      setShowGenerateForm(false);

      // Auto-select new quiz
      onSelectQuiz(newQuiz.id);
    } catch (err: any) {
      console.error('Failed to generate quiz:', err);
      setError(err.response?.data?.detail || 'Failed to generate quiz. Make sure documents are uploaded.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Delete this quiz?')) return;

    try {
      await api.deleteQuiz(quizId);
      setQuizzes(quizzes.filter((q) => q.id !== quizId));
    } catch (err) {
      console.error('Failed to delete quiz:', err);
      alert('Failed to delete quiz');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Quizzes
          </h2>
          <button
            onClick={() => setShowGenerateForm(!showGenerateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Generate Quiz
          </button>
        </div>

        {/* Generate Quiz Form */}
        {showGenerateForm && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Generate New Quiz
            </h3>

            <div className="space-y-4">
              {/* Number of Questions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Questions: {numQuestions}
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              {/* Generate Button */}
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateQuiz}
                  disabled={generating}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {generating ? 'Generating...' : 'Generate'}
                </button>
                <button
                  onClick={() => setShowGenerateForm(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quiz List */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            Loading quizzes...
          </div>
        )}

        {!loading && quizzes.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <div className="text-6xl mb-4">📝</div>
            <p className="mb-4">No quizzes yet</p>
            <p className="text-sm">Upload documents and generate your first quiz!</p>
          </div>
        )}

        {!loading && quizzes.length > 0 && (
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                onClick={() => onSelectQuiz(quiz.id)}
                className="group p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors bg-white dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {quiz.title}
                    </h3>
                    {quiz.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {quiz.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {quiz.question_count} questions
                      </span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                        {quiz.difficulty}
                      </span>
                      <span>{formatDate(quiz.created_at)}</span>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteQuiz(quiz.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-opacity"
                    title="Delete quiz"
                  >
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
