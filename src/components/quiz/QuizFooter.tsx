
import React from "react";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Question } from "@/types/quiz";

interface QuizFooterProps {
  currentQuestion?: Question;
  hasSelectedAnswers: boolean;
  isLastQuestion: boolean;
  isLastQuiz: boolean;
  onNext: () => void;
  onSubmit: () => void;
  showFeedback: boolean;
}

export const QuizFooter: React.FC<QuizFooterProps> = ({
  currentQuestion,
  hasSelectedAnswers,
  isLastQuestion,
  isLastQuiz,
  onNext,
  onSubmit,
  showFeedback,
}) => {
  let buttonText = showFeedback ? "Next Question" : "Submit Answer";
  if (showFeedback && isLastQuestion) {
    buttonText = isLastQuiz ? "Finish" : "Next Quiz";
  }

  const handleAction = () => {
    if (showFeedback) {
      onNext();
    } else {
      onSubmit();
    }
  };

  return (
    <CardFooter className="flex justify-between">
      <div className="text-sm text-gray-400">
        {currentQuestion?.multiple_correct 
          ? "Select all correct answers" 
          : "Select the best answer"}
      </div>
      <Button 
        onClick={handleAction}
        disabled={!hasSelectedAnswers}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {showFeedback ? (
          <>
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        ) : (
          <>
            {buttonText}
            <CheckCircle className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </CardFooter>
  );
};
