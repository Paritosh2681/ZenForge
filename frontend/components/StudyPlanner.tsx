'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api-client';

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

export default function StudyPlanner() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newPlan, setNewPlan] = useState({ title: '', description: '', scheduled_date: '', duration_minutes: 30 });
  const [filter, setFilter] = useState<string>('all');

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

  const filteredPlans = filter === 'all' ? plans : plans.filter(p => p.status === filter);

  const today = new Date().toISOString().split('T')[0];
  const todayPlans = plans.filter(p => p.scheduled_date === today);
  const completedToday = todayPlans.filter(p => p.status === 'completed').length;
  const totalMinutes = plans.filter(p => p.status !== 'skipped').reduce((sum, p) => sum + p.duration_minutes, 0);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    skipped: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-40"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Study Planner</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(!showAdd)} className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 rounded-lg transition-colors">
            + Add Plan
          </button>
          <button onClick={generatePlan} disabled={generating} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground hover:opacity-90 rounded-lg transition-colors disabled:opacity-50">
            {generating ? 'Generating...' : 'Auto-Generate'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{todayPlans.length}</div>
          <div className="text-xs text-muted-foreground">Today&apos;s Plans</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{completedToday}/{todayPlans.length}</div>
          <div className="text-xs text-muted-foreground">Completed Today</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{plans.length}</div>
          <div className="text-xs text-muted-foreground">Total Plans</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{Math.round(totalMinutes / 60)}h</div>
          <div className="text-xs text-muted-foreground">Study Hours</div>
        </div>
      </div>

      {/* Add Plan Form */}
      {showAdd && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold">New Study Plan</h3>
          <input type="text" placeholder="Title" value={newPlan.title} onChange={e => setNewPlan({...newPlan, title: e.target.value})}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
          <input type="text" placeholder="Description (optional)" value={newPlan.description} onChange={e => setNewPlan({...newPlan, description: e.target.value})}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
          <div className="flex gap-3">
            <input type="date" value={newPlan.scheduled_date} onChange={e => setNewPlan({...newPlan, scheduled_date: e.target.value})}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            <select value={newPlan.duration_minutes} onChange={e => setNewPlan({...newPlan, duration_minutes: parseInt(e.target.value)})}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm">
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm bg-secondary rounded-lg">Cancel</button>
            <button onClick={addPlan} disabled={!newPlan.title || !newPlan.scheduled_date} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg disabled:opacity-50">Create</button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'pending', 'in_progress', 'completed', 'skipped'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
            {f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Plans List */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">No study plans yet</p>
          <p className="text-sm">Click &quot;Auto-Generate&quot; to create plans from your study topics, or add one manually.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPlans.map(plan => (
            <div key={plan.id} className={`bg-card border rounded-lg p-4 flex items-center gap-4 ${plan.status === 'completed' ? 'opacity-60' : ''}`}>
              {/* Status indicator */}
              <button
                onClick={() => updateStatus(plan.id, plan.status === 'completed' ? 'pending' : plan.status === 'pending' ? 'in_progress' : 'completed')}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  plan.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                  plan.status === 'in_progress' ? 'border-blue-500 bg-blue-500/20' :
                  'border-gray-400 hover:border-primary'
                }`}
              >
                {plan.status === 'completed' && <span className="text-xs">&#10003;</span>}
                {plan.status === 'in_progress' && <span className="text-xs text-blue-400">&#9654;</span>}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{plan.title}</div>
                {plan.description && <div className="text-xs text-muted-foreground truncate">{plan.description}</div>}
                {plan.topic_name && <span className="text-xs bg-secondary px-1.5 py-0.5 rounded">{plan.topic_name}</span>}
              </div>

              {/* Meta */}
              <div className="text-right shrink-0 space-y-1">
                <div className="text-xs text-muted-foreground">{plan.scheduled_date}</div>
                <div className="text-xs text-muted-foreground">{plan.duration_minutes} min</div>
              </div>

              {/* Status badge */}
              <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${statusColors[plan.status]}`}>
                {plan.status.replace('_', ' ')}
              </span>

              {/* Actions */}
              <button onClick={() => deletePlan(plan.id)} className="text-muted-foreground hover:text-red-400 transition-colors shrink-0" title="Delete">
                &#10005;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
