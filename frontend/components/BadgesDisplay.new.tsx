'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api-client';

interface Badge {
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  earned: boolean;
  earned_at?: string;
}

interface GamificationStats {
  badges_earned: number;
  total_badges: number;
  quizzes_completed: number;
  streak_days: number;
  total_study_minutes: number;
  topics_mastered: number;
  level: number;
}

const ICON_MAP: Record<string, string> = {
  upload: '📤',
  library: '📚', 
  graduation: '🎓',
  quiz: '📝',
  trophy: '🏆',
  star: '⭐',
  fire: '🔥',
  flame: '💪',
  rocket: '🚀',
  compass: '🧭',
  medal: '🏅',
  crown: '👑',
};

const CATEGORY_COLORS = {
  engagement: 'from-blue-600 to-blue-400',
  learning: 'from-purple-600 to-purple-400', 
  mastery: 'from-green-600 to-green-400',
  consistency: 'from-orange-600 to-orange-400',
  milestone: 'from-pink-600 to-pink-400',
  achievement: 'from-yellow-600 to-yellow-400',
};

const CATEGORY_NAMES = {
  engagement: 'Engagement',
  learning: 'Learning',
  mastery: 'Mastery',
  consistency: 'Consistency', 
  milestone: 'Milestone',
  achievement: 'Achievement',
};

export default function BadgesDisplay() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadBadges();
    loadStats();
  }, []);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const response = await api.getBadges();
      setBadges(response.badges || []);
    } catch (error) {
      console.error('Failed to load badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.getGamificationStats();
      setStats(response);
    } catch (error) {
      console.error('Failed to load gamification stats:', error);
    }
  };

  const checkForNewBadges = async () => {
    try {
      setChecking(true);
      const response = await api.checkBadgeProgress();
      if (response.new_badges && response.new_badges.length > 0) {
        setNewBadges(response.new_badges);
        await loadBadges();
        await loadStats();
      }
    } catch (error) {
      console.error('Failed to check badge progress:', error);
    } finally {
      setChecking(false);
    }
  };

  const earnedBadges = badges.filter(b => b.earned);
  const availableBadges = badges.filter(b => !b.earned);
  const categories = Array.from(new Set(badges.map(b => b.category)));
  
  const filteredBadges = selectedCategory === 'all' 
    ? badges 
    : badges.filter(b => b.category === selectedCategory);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-cyan-400">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="font-mono">Loading badges...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-semibold tracking-tight text-white mb-2">Achievement Badges</h2>
          <p className="text-slate-400">Track your learning progress and unlock achievements</p>
        </div>
        <button
          onClick={checkForNewBadges}
          disabled={checking}
          className="gc-btn-secondary px-6 py-3"
        >
          {checking ? (
            <>
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Check Progress
            </>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="gc-card p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{stats.badges_earned}</div>
            <div className="text-sm text-slate-400">Badges Earned</div>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${(stats.badges_earned / stats.total_badges) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="gc-card p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{stats.level}</div>
            <div className="text-sm text-slate-400">Current Level</div>
            <div className="text-xs text-cyan-400 mt-1">🔥 {stats.streak_days} day streak</div>
          </div>

          <div className="gc-card p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{stats.quizzes_completed}</div>
            <div className="text-sm text-slate-400">Quizzes Completed</div>
            <div className="text-xs text-purple-400 mt-1">📚 {stats.topics_mastered} topics mastered</div>
          </div>

          <div className="gc-card p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{Math.round(stats.total_study_minutes / 60)}</div>
            <div className="text-sm text-slate-400">Hours Studied</div>
            <div className="text-xs text-green-400 mt-1">⏱️ {stats.total_study_minutes} minutes total</div>
          </div>
        </div>
      )}

      {/* New Badge Notifications */}
      {newBadges.length > 0 && (
        <div className="gc-card p-6 border-2 border-yellow-500/50 bg-yellow-500/5">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🎉</div>
            <div>
              <h3 className="font-display font-bold text-xl text-white mb-2">New Badges Earned!</h3>
              <div className="flex flex-wrap gap-2">
                {newBadges.map(badgeName => (
                  <span
                    key={badgeName}
                    className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 font-mono text-sm"
                  >
                    {badgeName}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setNewBadges([])}
                className="text-sm text-yellow-400 hover:text-yellow-300 mt-2"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
            selectedCategory === 'all'
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
              : 'bg-[rgb(var(--bg-elevated))] border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
          }`}
        >
          All ({badges.length})
        </button>
        
        {categories.map(category => {
          const count = badges.filter(b => b.category === category).length;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                selectedCategory === category
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-[rgb(var(--bg-elevated))] border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES] || category} ({count})
            </button>
          );
        })}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge, idx) => (
          <div
            key={badge.name}
            className={`gc-card p-6 transition-all duration-300 hover:scale-[1.02] ${
              badge.earned 
                ? 'border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5' 
                : 'border-white/10 bg-[rgb(var(--bg-elevated))]'
            }`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className={`text-3xl p-3 rounded-xl ${
                badge.earned
                  ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30'
                  : 'bg-[rgb(var(--bg-subtle))] border border-white/10'
              }`}>
                {ICON_MAP[badge.icon] || badge.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`font-display font-bold text-lg truncate ${
                    badge.earned ? 'text-white' : 'text-slate-300'
                  }`}>
                    {badge.name}
                  </h3>
                  {badge.earned && (
                    <div className="text-green-400 text-xl">✓</div>
                  )}
                </div>
                
                <p className={`text-sm mb-3 ${
                  badge.earned ? 'text-slate-300' : 'text-slate-400'
                }`}>
                  {badge.description}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className={`px-2 py-1 rounded-lg font-mono ${
                      CATEGORY_COLORS[badge.category as keyof typeof CATEGORY_COLORS]
                        ? `bg-gradient-to-r ${CATEGORY_COLORS[badge.category as keyof typeof CATEGORY_COLORS]}/20 text-white`
                        : 'bg-white/10 text-slate-300'
                    }`}>
                      {CATEGORY_NAMES[badge.category as keyof typeof CATEGORY_NAMES] || badge.category}
                    </span>
                    
                    {badge.earned && badge.earned_at && (
                      <span className="text-slate-400 font-mono">
                        {new Date(badge.earned_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 font-mono">
                    Requirement: {badge.requirement_type} ≥ {badge.requirement_value}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-display font-semibold tracking-tight text-slate-300 mb-2">No badges found</h3>
          <p className="text-slate-400">Try selecting a different category or check back later!</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="gc-card p-6">
        <h3 className="font-display font-semibold tracking-tight text-lg text-white mb-4">Progress Summary</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Earned Badges</span>
              <span className="text-sm font-mono text-green-400">{earnedBadges.length}/{badges.length}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-700"
                style={{ width: badges.length > 0 ? `${(earnedBadges.length / badges.length) * 100}%` : '0%' }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Available to Earn</span>
              <span className="text-sm font-mono text-cyan-400">{availableBadges.length}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-700"
                style={{ width: badges.length > 0 ? `${(availableBadges.length / badges.length) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}