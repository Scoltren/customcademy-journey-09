
import React from "react";
import { Card } from "@/components/ui/card";
import QuizHeader from "@/components/quiz/QuizHeader";
import QuizContent from "@/components/quiz/QuizContent";
import QuizFooter from "@/components/quiz/QuizFooter";
import QuizLoading from "@/components/quiz/QuizLoading";
import QuizNotAvailable from "@/components/quiz/QuizNotAvailable";

interface CategoryQuizViewProps {
  isLoading: boolean;
  isCompleted: boolean;
  hasQuestions: boolean;
  currentQuizIndex: number;
  totalQuizzes: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  categoryName?: string;
  questionText?: string;
  currentAnswers: any[];
  selectedAnswerIds: number[];
  showFeedback: boolean;
  score: number;
  isSaving: boolean;
  isLastQuestion: boolean;
  isLastQuiz: boolean;
  handleSelectAnswer: (answerId: number) => void;
  handleSubmitAnswer: () => void;
  handleNextQuestion: () => void;
}

const CategoryQuizView: React.FC<CategoryQuizViewProps> = ({
  isLoading,
  isCompleted,
  hasQuestions,
  currentQuizIndex,
  totalQuizzes,
  currentQuestionIndex,
  totalQuestions,
  categoryName,
  questionText,
  currentAnswers,
  selectedAnswerIds,
  showFeedback,
  score,
  isSaving,
  isLastQuestion,
  isLastQuiz,
  handleSelectAnswer,
  handleSubmitAnswer,
  handleNextQuestion,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 p-4">
        <QuizLoading />
      </div>
    );
  }
  
  if (!hasQuestions && !isCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 p-4">
        <QuizNotAvailable />
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 p-4">
      <div className="w-full max-w-3xl">
        <Card className="backdrop-blur-sm bg-slate-950 border-slate-800 shadow-xl transition-all duration-300">
          <QuizHeader 
            currentQuizIndex={currentQuizIndex}
            totalQuizzes={totalQuizzes}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            categoryName={categoryName}
            questionText={questionText}
          />
          
          <QuizContent
            answers={currentAnswers}
            selectedAnswerIds={selectedAnswerIds}
            showFeedback={showFeedback}
            handleSelectAnswer={handleSelectAnswer}
          />
          
          <QuizFooter 
            score={score}
            showFeedback={showFeedback}
            selectedAnswerIds={selectedAnswerIds}
            isSaving={isSaving}
            isLastQuestion={isLastQuestion}
            isLastQuiz={isLastQuiz}
            onSubmitAnswer={handleSubmitAnswer}
            onNextQuestion={handleNextQuestion}
          />
        </Card>
      </div>
    </div>
  );
};

export default CategoryQuizView;
