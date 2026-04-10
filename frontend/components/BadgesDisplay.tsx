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
  upload: '\u2B06',
  library: '\uD83D\uDCDA',
  graduation: '\uD83C\uDF93',
  quiz: '\uD83D\uDCDD',
  trophy: '\uD83C\uDFC6',
  star: '\u2B50',
  fire: '\uD83D\uDD25',
  flame: '\uD83D\uDCAA',
  rocket: '\uD83D\uDE80',
  compass: '\uD83E\uDDED',
  medal: '\uD83C\uDFC5',
  crown: '\uD83D\uDC51',
};

export default function BadgesDisplay() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [badgeData, statsData] = await Promise.all([
        api.getBadges(),
        api.getGamificationStats()
      ]);
      setBadges(badgeData.badges || []);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load badges:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewBadges = async () => {
    setChecking(true);
    try {
      const result = await api.checkBadges();
      if (result.newly_earned.length > 0) {
        setNewBadges(result.newly_earned);
        await loadData();
        setTimeout(() => setNewBadges([]), 5000);
      }
    } catch (err) {
      console.error('Badge check failed:', err);
    } finally {
      setChecking(false);
    }
  };

  const categories = ['all', 'upload', 'quiz', 'streak', 'mastery', 'exploration'];
  const filteredBadges = selectedCategory === 'all' ? badges : badges.filter(b => b.category === selectedCategory);
  const earnedCount = badges.filter(b => b.earned).length;
  const progressPct = badges.length > 0 ? Math.round((earnedCount / badges.length) * 100) : 0;

  if (loading) {
    return <div className="flex items-center justify-center h-40"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* New Badge Notification */}
      {newBadges.length > 0 && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center animate-bounce">
          <div className="text-lg font-bold text-yellow-400">New Badge{newBadges.length > 1 ? 's' : ''} Earned!</div>
          <div className="text-sm">{newBadges.join(', ')}</div>
        </div>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="gc-card p-6 bg-gradient-to-br from-[#22C55E]/10 to-transparent border-[#22C55E]/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-white">Level {stats.level}</div>
              <div className="text-sm text-slate-400 font-mono">Keep learning to level up!</div>
            </div>
            <button onClick={checkForNewBadges} disabled={checking} className="gc-btn-primary text-sm">
              {checking ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Checking...
                </span>
              ) : (
                'Check Badges'
              )}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{stats.badges_earned}/{stats.total_badges}</div>
              <div className="text-xs font-semibold text-[#A1A1AA]">Badges</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{stats.streak_days}</div>
              <div className="text-xs font-semibold text-[#A1A1AA]">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{stats.quizzes_completed}</div>
              <div className="text-xs font-semibold text-[#A1A1AA]">Quizzes</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{stats.topics_mastered}</div>
              <div className="text-xs font-semibold text-[#A1A1AA]">Mastered</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{stats.total_study_minutes}m</div>
              <div className="text-xs font-semibold text-[#A1A1AA]">Study Time</div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400 font-mono mb-1">
              <span>Badge Progress</span>
              <span>{progressPct}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-[#22C55E] to-emerald-400 h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-all font-mono ${
              selectedCategory === cat 
                ? 'bg-[#22C55E] text-[#0D0D0D] font-semibold shadow-[0_0_10px_rgba(34,197,94,0.3)]' 
                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:border-[#22C55E]/30 border border-white/10'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => (
          <div key={badge.name}
            className={`gc-card p-4 text-center transition-all duration-300 ${
              badge.earned
                ? 'border-[#22C55E]/30 bg-gradient-to-br from-[#22C55E]/10 to-transparent hover:border-[#22C55E]/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                : 'border-white/10 bg-slate-800/50 opacity-50 grayscale'
            } ${newBadges.includes(badge.name) ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
          >
            <div className="text-3xl mb-2">{ICON_MAP[badge.icon] || badge.icon}</div>
            <div className="font-semibold text-sm text-white">{badge.name}</div>
            <div className="text-xs text-slate-400 font-mono mt-1">{badge.description}</div>
            {badge.earned && badge.earned_at && (
              <div className="text-xs text-[#22C55E] mt-2 font-mono">
                Earned {new Date(badge.earned_at).toLocaleDateString()}
              </div>
            )}
            {!badge.earned && (
              <div className="text-xs text-slate-500 mt-2 italic font-mono">Locked</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
