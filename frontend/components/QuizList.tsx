'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api-client';
import type { Quiz, QuizCreateRequest } from '@/types/quiz';
import { ClipboardList } from 'lucide-react';

interface QuizListProps {
  onSelectQuiz: (quizId: string) => void;
}

const D = {
  wrap: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    background: 'rgba(8,9,18,0.65)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.06)',
    fontFamily: "var(--font-outfit), system-ui, sans-serif",
  },
  header: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    flexShrink: 0,
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '1.3rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: 'hsl(220 15% 90%)',
    fontFamily: "var(--font-outfit), sans-serif",
  },
  generateBtn: (alt: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.4rem 1rem',
    background: alt ? 'rgba(255,255,255,0.05)' : 'rgba(80,120,255,0.18)',
    border: `1px solid ${alt ? 'rgba(255,255,255,0.1)' : 'rgba(80,120,255,0.3)'}`,
    color: alt ? 'hsl(220 10% 55%)' : 'hsl(220 80% 75%)',
    fontSize: '0.82rem',
    fontWeight: 600,
    fontFamily: "var(--font-outfit), sans-serif",
    cursor: 'pointer',
    borderRadius: '9999px',
    transition: 'all 0.15s ease',
  }),
  form: {
    marginTop: '1rem',
    padding: '1rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  label: {
    display: 'block',
    fontSize: '0.72rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'hsl(220 10% 42%)',
    fontFamily: "'JetBrains Mono', monospace",
    marginBottom: '0.4rem',
  },
  select: {
    width: '100%',
    padding: '0.45rem 0.75rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    color: 'hsl(220 12% 75%)',
    fontSize: '0.85rem',
    fontFamily: "var(--font-outfit), sans-serif",
    outline: 'none',
    borderRadius: 0,
  },
  actionBtn: (green?: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '0.5rem 1rem',
    background: green ? 'rgba(80,200,140,0.15)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${green ? 'rgba(80,200,140,0.25)' : 'rgba(255,255,255,0.08)'}`,
    color: green ? '#4ade80' : 'hsl(220 10% 55%)',
    fontSize: '0.82rem',
    fontWeight: 600,
    fontFamily: "var(--font-outfit), sans-serif",
    cursor: 'pointer',
    borderRadius: '9999px',
    transition: 'all 0.15s ease',
  }),
  list: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '1rem 1.5rem',
  },
  quizCard: (hover: boolean): React.CSSProperties => ({
    padding: '1rem',
    background: hover ? 'rgba(80,120,255,0.08)' : 'rgba(255,255,255,0.02)',
    border: `1px solid ${hover ? 'rgba(80,120,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
    cursor: 'pointer',
    marginBottom: '0.5rem',
    transition: 'all 0.15s ease',
  }),
  quizTitle: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'hsl(220 15% 85%)',
    fontFamily: "var(--font-outfit), sans-serif",
  },
  quizMeta: {
    fontSize: '0.72rem',
    color: 'hsl(220 10% 42%)',
    fontFamily: "'JetBrains Mono', monospace",
    marginTop: '0.35rem',
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  badge: {
    padding: '0.1rem 0.5rem',
    background: 'rgba(80,120,255,0.12)',
    border: '1px solid rgba(80,120,255,0.2)',
    color: 'hsl(220 80% 72%)',
    fontSize: '0.65rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    fontFamily: "'JetBrains Mono', monospace",
  },
};

export default function QuizList({ onSelectQuiz }: QuizListProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('mixed');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => { loadQuizzes(); }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listQuizzes(50, 0);
      setQuizzes(data.quizzes);
    } catch (err) {
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
      const request: QuizCreateRequest = { num_questions: numQuestions, difficulty };
      const newQuiz = await api.generateQuiz(request);
      setQuizzes([newQuiz, ...quizzes]);
      setShowGenerateForm(false);
      onSelectQuiz(newQuiz.id);
    } catch (err: any) {
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
    } catch {
      alert('Failed to delete quiz');
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString();

  return (
    <div style={D.wrap}>
      <div style={D.header}>
        <div style={D.headerRow}>
          <span style={D.title}>Quizzes</span>
          <button
            onClick={() => setShowGenerateForm(!showGenerateForm)}
            style={D.generateBtn(showGenerateForm)}
          >
            <span>+</span> Generate Quiz
          </button>
        </div>

        {showGenerateForm && (
          <div style={D.form}>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={D.label}>Questions: {numQuestions}</label>
              <input
                type="range" min="5" max="20" value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'hsl(220 80% 62%)' }}
              />
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={D.label}>Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={D.select}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleGenerateQuiz} disabled={generating} style={D.actionBtn(true)}>
                {generating ? 'Generating...' : 'Generate'}
              </button>
              <button onClick={() => setShowGenerateForm(false)} style={D.actionBtn()}>Cancel</button>
            </div>
            {error && (
              <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.15)', color: 'hsl(0 60% 65%)', fontSize: '0.78rem' }}>
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={D.list}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', fontSize: '0.78rem', color: 'hsl(220 10% 38%)', fontFamily: "'JetBrains Mono', monospace" }}>
            Loading quizzes...
          </div>
        )}

        {!loading && quizzes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ClipboardList size={48} strokeWidth={1.5} style={{ color: 'hsl(220 80% 62%)', opacity: 0.8 }} />
            </div>
            <div style={{ color: 'hsl(220 15% 75%)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.3rem' }}>No quizzes yet</div>
            <div style={{ color: 'hsl(220 10% 42%)', fontSize: '0.8rem' }}>Upload documents and generate your first quiz.</div>
          </div>
        )}

        {!loading && quizzes.map((quiz) => (
          <div
            key={quiz.id}
            onClick={() => onSelectQuiz(quiz.id)}
            style={D.quizCard(hoveredId === quiz.id)}
            onMouseEnter={() => setHoveredId(quiz.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={D.quizTitle}>{quiz.title}</div>
                {quiz.description && (
                  <div style={{ fontSize: '0.78rem', color: 'hsl(220 10% 48%)', marginTop: '0.2rem' }}>{quiz.description}</div>
                )}
                <div style={D.quizMeta}>
                  <span>{quiz.question_count} questions</span>
                  <span style={D.badge}>{quiz.difficulty}</span>
                  <span>{formatDate(quiz.created_at)}</span>
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteQuiz(quiz.id, e)}
                title="Delete"
                style={{ padding: '0.2rem 0.4rem', background: 'transparent', border: 'none', color: 'hsl(0 50% 55%)', cursor: 'pointer', fontSize: '0.75rem', opacity: 0.6 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.6'; }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

