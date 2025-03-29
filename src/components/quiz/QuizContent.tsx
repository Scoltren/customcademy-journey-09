
import React from "react";
import { CardContent } from "@/components/ui/card";
import { AnswerOption } from "@/components/quiz/AnswerOption";
import { Answer, Question } from "@/types/quiz";

interface QuizContentProps {
  currentAnswers: Answer[];
  selectedAnswerIds: number[];
  currentQuestion?: Question;
  onSelectAnswer: (answerId: number) => void;
}

export const QuizContent: React.FC<QuizContentProps> = ({
  currentAnswers,
  selectedAnswerIds,
  currentQuestion,
  onSelectAnswer,
}) => {
  return (
    <CardContent>
      <div className="space-y-4">
        {currentAnswers.map((answer) => (
          <AnswerOption
            key={answer.id}
            answer={answer}
            isSelected={selectedAnswerIds.includes(answer.id)}
            currentQuestion={currentQuestion}
            onSelect={onSelectAnswer}
          />
        ))}
      </div>
    </CardContent>
  );
};
