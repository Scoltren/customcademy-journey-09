
import React from "react";
import { Answer, Question } from "@/types/quiz";
import { Check, X, CheckCircle, XCircle } from "lucide-react";

interface AnswerOptionProps {
  answer: Answer;
  isSelected: boolean;
  currentQuestion?: Question;
  onSelect: (answerId: number) => void;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  showExplanation?: boolean;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  answer,
  isSelected,
  currentQuestion,
  onSelect,
  isCorrect,
  isIncorrect,
  showExplanation = false,
}) => {
  // Determine if this is a multiple choice question
  const isMultipleChoice = currentQuestion?.multiple_correct;

  // Determine the styling based on selection state and correctness
  const getBorderStyle = () => {
    if (isCorrect) return "border-green-500";
    if (isIncorrect) return "border-red-500";
    if (isSelected) return "border-blue-500";
    return "border-gray-600";
  };

  const getBackgroundStyle = () => {
    if (isCorrect) return "bg-green-500/10";
    if (isIncorrect) return "bg-red-500/10";
    if (isSelected) return "bg-blue-500/10";
    return "bg-transparent";
  };

  return (
    <div className="space-y-2">
      <div
        className={`p-4 rounded-lg border ${getBorderStyle()} ${getBackgroundStyle()} transition-colors cursor-pointer`}
        onClick={() => onSelect(answer.id)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-5 h-5 flex-shrink-0 ${
              isMultipleChoice ? "rounded-sm" : "rounded-full"
            } border ${isSelected ? "border-blue-500" : "border-gray-600"} flex items-center justify-center`}
          >
            {isSelected && (
              <div
                className={`${
                  isMultipleChoice ? "w-3 h-3 rounded-sm" : "w-3 h-3 rounded-full"
                } ${isCorrect ? "bg-green-500" : isIncorrect ? "bg-red-500" : "bg-blue-500"}`}
              ></div>
            )}
            {isCorrect && !isSelected && <CheckCircle className="w-4 h-4 text-green-500" />}
          </div>
          <div className="flex-1">
            <p className={`${isCorrect ? "font-medium text-green-400" : isIncorrect ? "text-red-400" : ""}`}>
              {answer.answer_text}
            </p>
          </div>
          {isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
          {isIncorrect && <XCircle className="w-5 h-5 text-red-500" />}
        </div>
      </div>

      {/* Show explanation when applicable */}
      {showExplanation && answer.explanation && (isSelected || isCorrect) && (
        <div className={`ml-8 p-3 rounded-md ${isCorrect ? "bg-green-500/5 border border-green-500/20" : 
          isIncorrect ? "bg-red-500/5 border border-red-500/20" : "bg-slate-800"}`}>
          <p className="text-sm">
            <span className="font-medium">{isCorrect ? "Correct: " : "Explanation: "}</span>
            {answer.explanation}
          </p>
        </div>
      )}
    </div>
  );
};
