'use client';

import type { TopicPerformance } from '@/types/analytics';

interface TopicMasteryCardProps {
  topic: TopicPerformance;
}

export default function TopicMasteryCard({ topic }: TopicMasteryCardProps) {
  const getMasteryColor = (level: number) => {
    if (level >= 0.9) return 'bg-green-500';
    if (level >= 0.6) return 'bg-blue-500';
    if (level >= 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMasteryTextColor = (level: number) => {
    if (level >= 0.9) return 'text-green-600 dark:text-green-400';
    if (level >= 0.6) return 'text-blue-600 dark:text-blue-400';
    if (level >= 0.3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Mastered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Proficient':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Learning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatReviewDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Due now';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    return date.toLocaleDateString();
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white">{topic.name}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{topic.category}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadgeColor(topic.status)}`}>
          {topic.status}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Mastery</span>
          <span className={`text-sm font-bold ${getMasteryTextColor(topic.mastery_level)}`}>
            {Math.round(topic.mastery_level * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getMasteryColor(topic.mastery_level)}`}
            style={{ width: `${topic.mastery_level * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Questions</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {topic.questions_answered}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Accuracy</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {topic.accuracy.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Next Review */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <span>Next review: {formatReviewDate(topic.next_review)}</span>
        </div>
      </div>

      {/* Correct Count */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {topic.correct_count} correct of {topic.questions_answered} total
      </div>
    </div>
  );
}
