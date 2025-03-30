
import { useState } from 'react';

export function useQuizManagement() {
  const [activeQuiz, setActiveQuiz] = useState<number | null>(null);

  const toggleQuiz = (quizId: number | null) => {
    setActiveQuiz(activeQuiz === quizId ? null : quizId);
  };

  return {
    activeQuiz,
    toggleQuiz
  };
}
