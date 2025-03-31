
import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

type QuizHeaderProps = {
  currentQuizIndex: number;
  totalQuizzes: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  categoryName: string | undefined;
  questionText: string | undefined;
};

const QuizHeader: React.FC<QuizHeaderProps> = ({
  currentQuizIndex,
  totalQuizzes,
  currentQuestionIndex,
  totalQuestions,
  categoryName,
  questionText,
}) => {
  return (
    <CardHeader className="text-center border-b border-slate-800">
      <div className="flex justify-between text-sm text-slate-400 mb-2">
        <span>Quiz {currentQuizIndex + 1} of {totalQuizzes}</span>
        <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
      </div>
      <CardTitle className="text-2xl font-bold text-white">
        {categoryName || "Quiz"}
      </CardTitle>
      <p className="text-slate-300 mt-4">{questionText}</p>
    </CardHeader>
  );
};

export default QuizHeader;
