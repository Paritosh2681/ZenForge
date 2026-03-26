'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api-client';
import { GraduationCap } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface EvalResult {
  scores: Record<string, number>;
  overall_score: number;
  max_score: number;
  percentage: number;
  feedback: string;
  strengths: string;
  improvements: string;
  grade: string;
}

export default function ProtegeMode() {
  const [phase, setPhase] = useState<'setup' | 'teaching' | 'results'>('setup');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [sessionTopic, setSessionTopic] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const [instructions, setInstructions] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startSession = async () => {
    setLoading(true);
    try {
      const result = await api.startProtegeSession(topic || undefined, difficulty);
      setSessionTopic(result.topic);
      setInstructions(result.instructions);
      setMessages([{ role: 'assistant', content: result.ai_message }]);
      setPhase('teaching');
    } catch (err: any) {
      console.error('Failed to start session:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const result = await api.protegeRespond(sessionTopic, userMsg, [
        ...messages,
        { role: 'user', content: userMsg }
      ]);
      setMessages(prev => [...prev, { role: 'assistant', content: result.ai_message }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Hmm, I got confused by that. Can you try explaining it differently?' }]);
    } finally {
      setLoading(false);
    }
  };

  const evaluateSession = async () => {
    setEvaluating(true);
    try {
      const result = await api.evaluateTeaching(sessionTopic, messages);
      setEvalResult(result);
      setPhase('results');
    } catch (err: any) {
      console.error('Evaluation failed:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const resetSession = () => {
    setPhase('setup');
    setMessages([]);
    setEvalResult(null);
    setSessionTopic('');
    setInput('');
  };

  const gradeColors: Record<string, string> = {
    'A': 'text-green-400 bg-green-500/20 border-green-500/30',
    'B': 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    'C': 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    'D': 'text-red-400 bg-red-500/20 border-red-500/30',
  };

  // Setup Phase
  if (phase === 'setup') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Teach Mode</h2>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">Protege Effect</span>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="text-center mb-4">
            <div className="flex justify-center mb-4">
              <GraduationCap size={48} strokeWidth={1.5} style={{ color: 'hsl(220 80% 62%)', opacity: 0.8 }} />
            </div>
            <h3 className="text-lg font-semibold">Become the Teacher</h3>
            <p className="text-muted-foreground text-sm mt-1">The AI will play a confused student. Teach it a concept to deepen your own understanding. Your teaching quality will be graded.</p>
          </div>

          <input
            type="text"
            placeholder="Topic to teach (leave empty for auto-select)"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-border rounded-full text-sm"
          />

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Student Confusion Level</label>
            <div className="flex gap-2">
              {['easy', 'medium', 'hard'].map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                    difficulty === d ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}>
                  {d}
                </button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {difficulty === 'easy' ? 'Student has minor confusion' : difficulty === 'medium' ? 'Student has several misconceptions' : 'Student is fundamentally confused'}
            </div>
          </div>

          <button 
            onClick={startSession} 
            disabled={loading}
            className="w-full py-3 btn-pill-primary flex items-center justify-center transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Starting Session...' : 'Start Teaching Session'}
          </button>
        </div>
      </div>
    );
  }

  // Results Phase
  if (phase === 'results' && evalResult) {
    const scoreEntries = Object.entries(evalResult.scores).filter(([k]) => k !== 'overall');
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Teaching Evaluation</h2>
          <button onClick={resetSession} className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 rounded-lg">New Session</button>
        </div>

        {/* Grade */}
        <div className="text-center">
          <div className={`inline-block text-5xl font-bold px-8 py-4 rounded-xl border ${gradeColors[evalResult.grade] || 'text-foreground bg-card border-border'}`}>
            {evalResult.grade}
          </div>
          <div className="text-lg mt-2">{evalResult.percentage}% - {evalResult.overall_score}/{evalResult.max_score}</div>
          <div className="text-sm text-muted-foreground mt-1">Topic: {sessionTopic}</div>
        </div>

        {/* Score Breakdown */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="font-semibold">Score Breakdown</h3>
          {scoreEntries.map(([key, val]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize">{key}</span>
                <span>{val}/10</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${val >= 8 ? 'bg-green-500' : val >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${val * 10}%` }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-1">Feedback</h4>
            <p className="text-sm text-muted-foreground">{evalResult.feedback || 'No feedback available'}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-green-400 mb-1">Strengths</h4>
            <p className="text-sm text-muted-foreground">{evalResult.strengths || 'Keep up the good work!'}</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-yellow-400 mb-1">Areas to Improve</h4>
            <p className="text-sm text-muted-foreground">{evalResult.improvements || 'Practice more!'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Teaching Phase
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <div className="font-semibold text-sm">Teaching: {sessionTopic}</div>
          <div className="text-xs text-muted-foreground">{instructions}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={evaluateSession} disabled={messages.length < 4 || evaluating}
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50">
            {evaluating ? 'Evaluating...' : 'Get Grade'}
          </button>
          <button onClick={resetSession} className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 rounded-lg">End</button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary'
            }`}>
              <div className="text-xs font-semibold mb-1 opacity-70">
                {msg.role === 'user' ? 'You (Teacher)' : 'AI (Student)'}
              </div>
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Explain the concept to the student..."
            className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm"
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={!input.trim() || loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 disabled:opacity-50">
            Send
          </button>
        </div>
        <div className="text-xs text-muted-foreground mt-1">Teach at least 4 exchanges before getting graded</div>
      </div>
    </div>
  );
}
