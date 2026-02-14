'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api-client';
import type {
  OverallStats,
  TopicPerformance,
  QuizHistoryItem,
  LearningRecommendations,
} from '@/types/analytics';
import TopicMasteryCard from './TopicMasteryCard';

export default function LearningDashboard() {
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [topicPerformance, setTopicPerformance] = useState<TopicPerformance[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  const [recommendations, setRecommendations] = useState<LearningRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    loadDashboard();
  }, [selectedPeriod]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, topicsData, quizzesData, recommendationsData] = await Promise.all([
        api.getOverallStats(undefined, selectedPeriod),
        api.getTopicPerformance(undefined, 10),
        api.getQuizHistory(undefined, 10),
        api.getRecommendations(),
      ]);

      setStats(statsData);
      setTopicPerformance(topicsData.topics);
      setQuizHistory(quizzesData.quizzes);
      setRecommendations(recommendationsData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to load analytics dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'No data available'}</p>
          <button
            onClick={loadDashboard}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getMasteryColor = (level: number) => {
    if (level >= 0.9) return 'text-green-600 dark:text-green-400';
    if (level >= 0.6) return 'text-blue-600 dark:text-blue-400';
    if (level >= 0.3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Learning Analytics</h1>
          <p className="text-blue-100">Track your progress and mastery</p>

          {/* Period Selector */}
          <div className="mt-4 flex gap-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setSelectedPeriod(days)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === days
                    ? 'bg-white text-blue-600'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quizzes Taken */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Quizzes Taken
              </span>
              <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.quizzes.completed}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {stats.quizzes.recent} in last {selectedPeriod} days
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Average Score
              </span>
              <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.quizzes.avg_score.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {stats.questions.accuracy.toFixed(1)}% question accuracy
            </div>
          </div>

          {/* Topics Learning */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Topics
              </span>
              <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.topics.mastered}/{stats.topics.learning}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Mastered / Learning
            </div>
          </div>

          {/* Learning Streak */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Streak
              </span>
              <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.engagement.streak_days}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">days</div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations && recommendations.study_tips.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
              Recommendations
            </h3>
            <div className="space-y-2">
              {recommendations.study_tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {tip}
                </div>
              ))}
            </div>
            {recommendations.topics_to_review.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Topics to review:
                </p>
                <div className="flex flex-wrap gap-2">
                  {recommendations.topics_to_review.slice(0, 5).map((topic, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm rounded-full"
                    >
                      {topic.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Topic Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Topic Mastery
          </h3>

          {topicPerformance.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No topic data available. Complete quizzes to track your mastery!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topicPerformance.map((topic) => (
                <TopicMasteryCard key={topic.name} topic={topic} />
              ))}
            </div>
          )}
        </div>

        {/* Quiz History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Recent Quiz History
          </h3>

          {quizHistory.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No quiz history yet. Start taking quizzes!
            </p>
          ) : (
            <div className="space-y-3">
              {quizHistory.map((quiz) => (
                <div
                  key={quiz.session_id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{quiz.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(quiz.completed_at).toLocaleDateString()} •{' '}
                      {Math.floor(quiz.time_taken / 60)}m {quiz.time_taken % 60}s
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${
                          quiz.passed
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {quiz.percentage.toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {quiz.score}/{quiz.max_score}
                      </div>
                    </div>

                    {quiz.passed ? (
                      <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
