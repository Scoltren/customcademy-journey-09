
import React from "react";
import { CardContent } from "@/components/ui/card";
import QuizAnswerOption from "./QuizAnswerOption";

export type QuizContentProps = {
  answers: any[];
  selectedAnswerIds: number[];
  showFeedback: boolean;
  handleSelectAnswer: (answerId: number) => void;
};

const QuizContent: React.FC<QuizContentProps> = ({
  answers,
  selectedAnswerIds,
  showFeedback,
  handleSelectAnswer,
}) => {
  return (
    <CardContent className="py-6">
      <div className="space-y-3">
        {answers.map((answer) => (
          <QuizAnswerOption
            key={answer.id}
            answerId={answer.id}
            answerText={answer.answer_text}
            explanation={answer.explanation}
            isSelected={selectedAnswerIds.includes(answer.id)}
            isCorrect={answer.points > 0}
            showFeedback={showFeedback}
            onSelect={handleSelectAnswer}
          />
        ))}
      </div>
    </CardContent>
  );
};

export default QuizContent;
