
import React from "react";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Question } from "@/types/quiz";

interface QuizFooterProps {
  currentQuestion?: Question;
  hasSelectedAnswers: boolean;
  isLastQuestion: boolean;
  isLastQuiz: boolean;
  onNext: () => void;
}

export const QuizFooter: React.FC<QuizFooterProps> = ({
  currentQuestion,
  hasSelectedAnswers,
  isLastQuestion,
  isLastQuiz,
  onNext,
}) => {
  let buttonText = "Next Question";
  if (isLastQuestion) {
    buttonText = isLastQuiz ? "Finish" : "Next Quiz";
  }

  return (
    <CardFooter className="flex justify-between">
      <div className="text-sm text-gray-400">
        {currentQuestion?.multiple_correct 
          ? "Select all correct answers" 
          : "Select the best answer"}
      </div>
      <Button 
        onClick={onNext}
        disabled={!hasSelectedAnswers}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {buttonText}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </CardFooter>
  );
};
