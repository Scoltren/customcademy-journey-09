
import React from "react";
import { Answer, Question } from "@/types/quiz";

interface AnswerOptionProps {
  answer: Answer;
  isSelected: boolean;
  currentQuestion?: Question;
  onSelect: (answerId: number) => void;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  answer,
  isSelected,
  currentQuestion,
  onSelect,
}) => {
  return (
    <div
      className={`p-4 rounded-md cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-900/20 border"
          : "border border-slate-700 hover:border-blue-400/50"
      }`}
      onClick={() => onSelect(answer.id)}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 flex items-center justify-center ${
          currentQuestion?.multiple_correct 
            ? "border rounded-md" 
            : "border rounded-full"
        } ${
          isSelected
            ? "bg-blue-500 border-blue-500 text-white"
            : "border-slate-500"
        }`}>
          {isSelected && (
            <div className={`${
              currentQuestion?.multiple_correct 
                ? "w-2 h-2 bg-white" 
                : "w-3 h-3 bg-white rounded-full"
            }`}></div>
          )}
        </div>
        <div className="text-gray-200">{answer.answer_text}</div>
      </div>
    </div>
  );
};
