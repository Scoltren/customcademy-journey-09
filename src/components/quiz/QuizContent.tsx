
import React from "react";
import { CardContent } from "@/components/ui/card";
import QuizAnswerOption from "./QuizAnswerOption";

export type QuizContentProps = {
  answers: any[];
  selectedAnswerIds: number[];
  showFeedback: boolean;
  handleSelectAnswer: (answerId: number) => void;
  currentQuestion?: any; // Added this prop
  categoryName?: string; // Added this prop
  onSelectAnswer?: (answerId: number) => void; // Added for compatibility
  onSubmitAnswer?: () => void; // Added for compatibility
  onFinish?: () => void; // Added for compatibility
};

const QuizContent: React.FC<QuizContentProps> = ({
  answers,
  selectedAnswerIds,
  showFeedback,
  handleSelectAnswer,
  onSelectAnswer, // For compatibility with other components
}) => {
  // Use the provided callback or the default one
  const handleSelect = (answerId: number) => {
    if (onSelectAnswer) {
      onSelectAnswer(answerId);
    } else {
      handleSelectAnswer(answerId);
    }
  };

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
            onSelect={handleSelect}
          />
        ))}
      </div>
    </CardContent>
  );
};

export default QuizContent;
