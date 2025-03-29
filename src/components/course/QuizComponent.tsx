
import React from 'react';
import { Button } from '@/components/ui/button';
import QuizSkeleton from './quiz/QuizSkeleton';
import QuizQuestion from './quiz/QuizQuestion';
import QuizResults from './quiz/QuizResults';
import { useQuizData } from './quiz/useQuizData';
import { useQuizState } from './quiz/hooks/useQuizState';

interface QuizComponentProps {
  quizId: number;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ quizId }) => {
  // Get quiz data (questions & answers)
  const { questions, isLoading } = useQuizData(quizId);
  
  // Get quiz state management
  const { 
    selectedAnswers, 
    submittedAnswers, 
    showResults, 
    quizResult, 
    handleAnswerSelect, 
    handleSubmit, 
    handleRetry 
  } = useQuizState(quizId, questions);

  if (isLoading) {
    return <QuizSkeleton />;
  }
  
  if (questions.length === 0) {
    return (
      <div className="bg-navy/50 rounded-lg p-6 text-center">
        <p className="text-slate-400">No questions available for this quiz.</p>
      </div>
    );
  }

  return (
    <div className="bg-navy/50 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-6">Quiz Assessment</h3>
      
      {/* Map through questions and render them */}
      {questions.map((question, qIndex) => (
        <QuizQuestion
          key={question.id}
          question={question}
          index={qIndex}
          selectedAnswers={selectedAnswers}
          submittedAnswers={submittedAnswers}
          showResults={showResults}
          onAnswerSelect={handleAnswerSelect}
        />
      ))}
      
      <div className="mt-6">
        {showResults ? (
          <QuizResults 
            quizResult={quizResult}
            onRetry={handleRetry}
          />
        ) : (
          <Button 
            onClick={handleSubmit}
            className="button-primary"
            disabled={Object.keys(selectedAnswers).length === 0}
          >
            Submit Answers
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;
