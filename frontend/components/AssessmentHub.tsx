'use client';

import { useState } from 'react';
import QuizList from './QuizList';
import QuizInterface from './QuizInterface';
import QuizResults from './QuizResults';

type ViewMode = 'list' | 'taking' | 'results';

export default function AssessmentHub() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleSelectQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setViewMode('taking');
  };

  const handleQuizComplete = (completedSessionId: string) => {
    setSessionId(completedSessionId);
    setViewMode('results');
  };

  const handleBackToList = () => {
    setSelectedQuizId(null);
    setSessionId(null);
    setViewMode('list');
  };

  const handleRetryQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setSessionId(null);
    setViewMode('taking');
  };

  return (
    <div className="h-full">
      {viewMode === 'list' && <QuizList onSelectQuiz={handleSelectQuiz} />}

      {viewMode === 'taking' && selectedQuizId && (
        <QuizInterface
          quizId={selectedQuizId}
          onComplete={handleQuizComplete}
          onBack={handleBackToList}
        />
      )}

      {viewMode === 'results' && sessionId && (
        <QuizResults
          sessionId={sessionId}
          onBack={handleBackToList}
          onRetry={handleRetryQuiz}
        />
      )}
    </div>
  );
}
