'use client';

import type { TopicPerformance } from '@/types/analytics';

interface TopicMasteryCardProps {
  topic: TopicPerformance;
}

export default function TopicMasteryCard({ topic }: TopicMasteryCardProps) {
  const getMasteryColor = (level: number) => {
    if (level >= 0.9) return 'bg-emerald-500';
    if (level >= 0.6) return 'bg-[#22C55E]';
    if (level >= 0.3) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getMasteryTextColor = (level: number) => {
    if (level >= 0.9) return 'text-emerald-400';
    if (level >= 0.6) return 'text-[#22C55E]';
    if (level >= 0.3) return 'text-amber-400';
    return 'text-red-400';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Mastered':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'Proficient':
        return 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30';
      case 'Learning':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
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
    <div className="gc-card p-4 border border-[#22C55E]/20 hover:border-[#22C55E]/40 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-white">{topic.name}</h4>
          <p className="text-xs text-slate-400">{topic.category}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadgeColor(topic.status)}`}>
          {topic.status}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-400">Mastery</span>
          <span className={`text-sm font-bold ${getMasteryTextColor(topic.mastery_level)}`}>
            {Math.round(topic.mastery_level * 100)}%
          </span>
        </div>
        <div className="w-full bg-[rgb(var(--bg-surface))] rounded-full h-2 border border-[#22C55E]/10">
          <div
            className={`h-2 rounded-full transition-all ${getMasteryColor(topic.mastery_level)}`}
            style={{ width: `${topic.mastery_level * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-xs text-slate-400">Questions</div>
          <div className="text-lg font-semibold text-white">
            {topic.questions_answered}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Accuracy</div>
          <div className="text-lg font-semibold text-white">
            {topic.accuracy.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Next Review */}
      <div className="pt-3 border-t border-[#22C55E]/20">
        <div className="flex items-center gap-2 text-xs text-slate-400">
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
      <div className="mt-2 text-xs text-slate-400">
        {topic.correct_count} correct of {topic.questions_answered} total
      </div>
    </div>
  );
}
