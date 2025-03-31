
import React from "react";

type QuizAnswerOptionProps = {
  answerId: number;
  answerText: string;
  explanation?: string;
  isSelected: boolean;
  isCorrect?: boolean;
  showFeedback: boolean;
  onSelect: (answerId: number) => void;
};

const QuizAnswerOption: React.FC<QuizAnswerOptionProps> = ({
  answerId,
  answerText,
  explanation,
  isSelected,
  isCorrect,
  showFeedback,
  onSelect,
}) => {
  // Determine classes based on selection and feedback state
  let answerClasses = "flex items-center p-4 rounded-md border cursor-pointer transition-all";

  if (isSelected) {
    answerClasses += " border-blue-500 bg-blue-900/20";
  } else {
    answerClasses += " border-slate-700 hover:border-slate-500";
  }

  // Add feedback colors when showing feedback
  if (showFeedback) {
    if (isSelected && isCorrect) {
      answerClasses = "flex items-center p-4 rounded-md border cursor-pointer border-green-500 bg-green-900/20";
    } else if (isSelected && !isCorrect) {
      answerClasses = "flex items-center p-4 rounded-md border cursor-pointer border-red-500 bg-red-900/20";
    } else if (!isSelected && isCorrect) {
      answerClasses = "flex items-center p-4 rounded-md border cursor-pointer border-green-500 bg-green-900/10";
    }
  }

  return (
    <div
      className={answerClasses}
      onClick={() => !showFeedback && onSelect(answerId)}
    >
      <div
        className={`mr-3 h-5 w-5 rounded border flex items-center justify-center ${
          isSelected ? "bg-blue-600 border-blue-600" : "border-slate-500"
        }`}
      >
        {isSelected && <div className="h-2 w-2 rounded-sm bg-white"></div>}
      </div>
      <div className="flex-1">
        <p className="text-white">{answerText}</p>
        {showFeedback && explanation && (
          <p className="text-sm text-slate-400 mt-1">{explanation}</p>
        )}
      </div>
    </div>
  );
};

export default QuizAnswerOption;
