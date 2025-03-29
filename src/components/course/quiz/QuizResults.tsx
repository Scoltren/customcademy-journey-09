
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuizResultProps {
  quizResult: {
    score: number;
    maxScore: number;
    passed: boolean;
    skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  } | null;
  onRetry: () => void;
}

const QuizResults: React.FC<QuizResultProps> = ({ quizResult, onRetry }) => {
  if (!quizResult) return null;
  
  return (
    <div className="space-y-4">
      <div className={`
        p-4 rounded-lg text-center
        ${quizResult.passed ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}
      `}>
        <p className="font-bold text-lg">
          {quizResult.passed 
            ? 'Quiz completed!' 
            : 'You did not pass the quiz.'}
        </p>
        <p className="text-slate-300 mt-1">
          Your score: {quizResult.score}/{quizResult.maxScore}
        </p>
        <p className="text-slate-300 mt-1">
          Skill level: <span className={
            quizResult.skillLevel === 'Beginner' ? 'text-green-400' :
            quizResult.skillLevel === 'Intermediate' ? 'text-yellow-400' : 'text-red-400'
          }>
            {quizResult.skillLevel}
          </span>
        </p>
      </div>
      
      <Button 
        onClick={onRetry}
        variant="outline"
        className="w-full"
      >
        Try Again
      </Button>
    </div>
  );
};

export default QuizResults;
