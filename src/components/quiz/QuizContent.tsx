
import React from "react";
import { CardContent } from "@/components/ui/card";
import { AnswerOption } from "@/components/quiz/AnswerOption";
import { Answer, Question } from "@/types/quiz";

interface QuizContentProps {
  currentAnswers: Answer[];
  selectedAnswerIds: number[];
  currentQuestion?: Question;
  onSelectAnswer: (answerId: number) => void;
  isReviewMode?: boolean;
}

export const QuizContent: React.FC<QuizContentProps> = ({
  currentAnswers,
  selectedAnswerIds,
  currentQuestion,
  onSelectAnswer,
  isReviewMode = false,
}) => {
  // Function to get the correct answers
  const getCorrectAnswerIds = () => {
    return currentAnswers
      .filter(answer => answer.points && answer.points > 0)
      .map(answer => answer.id);
  };

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
            isCorrect={isReviewMode ? answer.points && answer.points > 0 : undefined}
            isIncorrect={
              isReviewMode
                ? selectedAnswerIds.includes(answer.id) && (!answer.points || answer.points <= 0)
                : undefined
            }
          />
        ))}
      </div>
      
      {isReviewMode && (
        <div className="mt-6 p-4 rounded-md bg-slate-800">
          <h4 className="font-medium text-lg mb-2">Correct Answers:</h4>
          <ul className="list-disc list-inside">
            {currentAnswers
              .filter(answer => answer.points && answer.points > 0)
              .map(answer => (
                <li key={answer.id} className="text-green-400">
                  {answer.answer_text}
                  {answer.explanation && (
                    <p className="ml-6 mt-1 text-slate-300 text-sm">{answer.explanation}</p>
                  )}
                </li>
              ))}
          </ul>
        </div>
      )}
    </CardContent>
  );
};
