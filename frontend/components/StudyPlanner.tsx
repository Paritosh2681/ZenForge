'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api-client';
import { Calendar, Clock, CheckCircle, Circle, Play, X, Plus, Zap, TrendingUp } from 'lucide-react';

interface StudyPlan {
  id: string;
  topic_id: string | null;
  topic_name: string | null;
  title: string;
  description: string | null;
  scheduled_date: string;
  duration_minutes: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  created_at: string;
  completed_at: string | null;
}

type ViewMode = 'list' | 'calendar';

export default function StudyPlanner() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [newPlan, setNewPlan] = useState({ title: '', description: '', scheduled_date: '', duration_minutes: 30 });
  const [filter, setFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await api.getStudyPlans(undefined, 30);
      setPlans(data.plans || []);
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    setGenerating(true);
    try {
      const result = await api.generateStudyPlan(7);
      if (result.plans_created > 0) {
        await loadPlans();
      }
    } catch (err) {
      console.error('Failed to generate plan:', err);
    } finally {
      setGenerating(false);
    }
  };

  const addPlan = async () => {
    if (!newPlan.title || !newPlan.scheduled_date) return;
    try {
      await api.createStudyPlan(newPlan);
      setNewPlan({ title: '', description: '', scheduled_date: '', duration_minutes: 30 });
      setShowAdd(false);
      await loadPlans();
    } catch (err) {
      console.error('Failed to create plan:', err);
    }
  };

  const updateStatus = async (planId: string, status: string) => {
    try {
      await api.updateStudyPlan(planId, { status });
      setPlans(prev => prev.map(p => p.id === planId ? { ...p, status: status as any } : p));
    } catch (err) {
      console.error('Failed to update plan:', err);
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      await api.deleteStudyPlan(planId);
      setPlans(prev => prev.filter(p => p.id !== planId));
    } catch (err) {
      console.error('Failed to delete plan:', err);
    }
  };

  // Calendar generation
  const calendarDays = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    const days: Array<{ date: string; isCurrentMonth: boolean; plans: StudyPlan[] }> = [];
    
    // Add days from previous month
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth, -i);
      days.push({
        date: date.toISOString().split('T')[0],
        isCurrentMonth: false,
        plans: []
      });
    }
    
    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        isCurrentMonth: true,
        plans: plans.filter(p => p.scheduled_date === dateStr)
      });
    }
    
    // Add days from next month to complete the grid
    const endPadding = 42 - days.length; // 6 rows x 7 days
    for (let i = 1; i <= endPadding; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      days.push({
        date: date.toISOString().split('T')[0],
        isCurrentMonth: false,
        plans: []
      });
    }
    
    return days;
  }, [plans]);

  const filteredPlans = filter === 'all' ? plans : plans.filter(p => p.status === filter);
  const displayPlans = selectedDate 
    ? filteredPlans.filter(p => p.scheduled_date === selectedDate)
    : filteredPlans;

  const today = new Date().toISOString().split('T')[0];
  const todayPlans = plans.filter(p => p.scheduled_date === today);
  const completedToday = todayPlans.filter(p => p.status === 'completed').length;
  const totalMinutes = plans.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.duration_minutes, 0);
  const completedCount = plans.filter(p => p.status === 'completed').length;

  const statusConfig = {
    pending: { color: 'amber', icon: Circle, label: 'Pending' },
    in_progress: { color: 'blue', icon: Play, label: 'In Progress' },
    completed: { color: 'emerald', icon: CheckCircle, label: 'Completed' },
    skipped: { color: 'slate', icon: X, label: 'Skipped' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="gc-card p-6 border-b-2 border-[#22C55E]/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-display font-bold text-white mb-1">Study Planner</h2>
            <p className="text-sm text-slate-400 font-mono">Organize your learning journey</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-800/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-[#22C55E] text-[#0D0D0D] font-semibold shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${
                  viewMode === 'calendar'
                    ? 'bg-[#22C55E] text-[#0D0D0D] font-semibold shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Calendar
              </button>
            </div>
            
            <button 
              onClick={() => setShowAdd(!showAdd)} 
              className="gc-btn-secondary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Plan
            </button>
            <button 
              onClick={generatePlan} 
              disabled={generating} 
              className="gc-btn-primary flex items-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Auto-Generate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="gc-card p-4 bg-gradient-to-br from-[#22C55E]/10 to-transparent border-[#22C55E]/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#22C55E]/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#22C55E]" />
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-white">{todayPlans.length}</div>
                <div className="text-xs text-slate-400 font-mono">Today's Plans</div>
              </div>
            </div>
          </div>
          
          <div className="gc-card p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-emerald-400">{completedToday}/{todayPlans.length}</div>
                <div className="text-xs text-slate-400 font-mono">Completed Today</div>
              </div>
            </div>
          </div>
          
          <div className="gc-card p-4 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-white">{completedCount}</div>
                <div className="text-xs text-slate-400 font-mono">Total Completed</div>
              </div>
            </div>
          </div>
          
          <div className="gc-card p-4 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-white">{Math.round(totalMinutes / 60)}h</div>
                <div className="text-xs text-slate-400 font-mono">Study Hours</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Plan Form */}
      {showAdd && (
        <div className="gc-card p-6 border-2 border-[#22C55E]/30 space-y-4">
          <h3 className="text-xl font-display font-semibold tracking-tight text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#22C55E]" />
            New Study Plan
          </h3>
          <input 
            type="text" 
            placeholder="Plan title (e.g., Review Quantum Mechanics)" 
            value={newPlan.title} 
            onChange={e => setNewPlan({...newPlan, title: e.target.value})}
            className="w-full px-4 py-3 bg-[rgb(var(--bg-elevated))] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-[#22C55E]/50 focus:outline-none font-mono text-sm"
          />
          <textarea
            placeholder="Description (optional)"
            value={newPlan.description} 
            onChange={e => setNewPlan({...newPlan, description: e.target.value})}
            className="w-full px-4 py-3 bg-[rgb(var(--bg-elevated))] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-[#22C55E]/50 focus:outline-none font-mono text-sm resize-none"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Scheduled Date</label>
              <input 
                type="date" 
                value={newPlan.scheduled_date} 
                onChange={e => setNewPlan({...newPlan, scheduled_date: e.target.value})}
                className="w-full px-4 py-3 bg-[rgb(var(--bg-elevated))] border border-white/10 rounded-lg text-white focus:border-[#22C55E]/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Duration</label>
              <select 
                value={newPlan.duration_minutes} 
                onChange={e => setNewPlan({...newPlan, duration_minutes: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-[rgb(var(--bg-elevated))] border border-white/10 rounded-lg text-white focus:border-[#22C55E]/50 focus:outline-none"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowAdd(false)} className="gc-btn-secondary">Cancel</button>
            <button 
              onClick={addPlan} 
              disabled={!newPlan.title || !newPlan.scheduled_date} 
              className="gc-btn-primary"
            >
              Create Plan
            </button>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="gc-card p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-display font-semibold tracking-tight text-white">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-sm text-[#22C55E] hover:text-[#16A34A] font-mono"
              >
                Clear filter
              </button>
            )}
          </div>
          
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-500 font-mono py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const isToday = day.date === today;
              const isSelected = day.date === selectedDate;
              const hasPlans = day.plans.length > 0;
              
              return (
                <button
                  key={idx}
                  onClick={() => hasPlans ? setSelectedDate(day.date) : null}
                  className={`aspect-square p-2 rounded-lg border transition-all relative ${
                    !day.isCurrentMonth ? 'opacity-30' :
                    isSelected ? 'border-[#22C55E] bg-[#22C55E]/20 shadow-[0_0_10px_rgba(34,197,94,0.3)]' :
                    isToday ? 'border-purple-500 bg-purple-500/10' :
                    hasPlans ? 'border-white/10 bg-[rgb(var(--bg-elevated))] hover:border-[#22C55E]/30' :
                    'border-white/5 bg-[rgb(var(--bg-surface))]'
                  }`}
                >
                  <div className={`text-sm font-mono ${
                    isToday ? 'text-purple-400 font-bold' :
                    hasPlans ? 'text-white' :
                    'text-slate-500'
                  }`}>
                    {new Date(day.date).getDate()}
                  </div>
                  
                  {/* Plan indicators */}
                  {hasPlans && (
                    <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 justify-center flex-wrap">
                      {day.plans.slice(0, 3).map((plan, i) => (
                        <div 
                          key={i} 
                          className={`w-1.5 h-1.5 rounded-full ${
                            plan.status === 'completed' ? 'bg-emerald-400' :
                            plan.status === 'in_progress' ? 'bg-blue-400' :
                            'bg-amber-400'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'in_progress', 'completed', 'skipped'] as const).map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-all ${
              filter === f 
                ? 'bg-[#22C55E] text-[#0D0D0D] font-semibold shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Plans List */}
      {displayPlans.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-gradient-to-br from-[#22C55E]/20 to-transparent flex items-center justify-center text-4xl">
            📅
          </div>
          <p className="text-xl font-display font-semibold tracking-tight text-white mb-2">
            {selectedDate ? 'No plans for this date' : 'No study plans yet'}
          </p>
          <p className="text-sm text-slate-400 font-mono mb-6">
            {selectedDate 
              ? 'Click "Add Plan" to create one for this date'
              : 'Click "Auto-Generate" to create plans from your topics, or add one manually'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayPlans.map(plan => {
            const config = statusConfig[plan.status];
            const StatusIcon = config.icon;
            
            return (
              <div 
                key={plan.id} 
                className={`group gc-card p-5 transition-all ${
                  plan.status === 'completed' ? 'opacity-60 hover:opacity-80' : 'hover:border-[#22C55E]/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Status Button */}
                  <button
                    onClick={() => updateStatus(
                      plan.id, 
                      plan.status === 'completed' ? 'pending' : 
                      plan.status === 'pending' ? 'in_progress' : 
                      'completed'
                    )}
                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                      plan.status === 'completed' 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                      plan.status === 'in_progress' 
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400' :
                      'border-slate-600 text-slate-400 hover:border-[#22C55E] hover:text-[#22C55E]'
                    }`}
                  >
                    <StatusIcon className="w-5 h-5" />
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-white mb-1 group-hover:text-[#22C55E] transition-colors">
                      {plan.title}
                    </h4>
                    {plan.description && (
                      <p className="text-sm text-slate-400 mb-2 line-clamp-1">{plan.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs font-mono">
                      {plan.topic_name && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                          {plan.topic_name}
                        </span>
                      )}
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(plan.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {plan.duration_minutes} min
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold font-mono shrink-0 ${
                    config.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                    config.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                    config.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {config.label}
                  </span>

                  {/* Delete */}
                  <button 
                    onClick={() => deletePlan(plan.id)} 
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all shrink-0"
                    title="Delete"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
