
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Question, Category } from "@/types/quiz";

interface QuizHeaderProps {
  quizIndex: number;
  totalQuizzes: number;
  questionIndex: number;
  totalQuestions: number;
  currentCategory?: Category;
  currentQuestion?: Question;
}

export const QuizHeader: React.FC<QuizHeaderProps> = ({
  quizIndex,
  totalQuizzes,
  questionIndex,
  totalQuestions,
  currentCategory,
  currentQuestion,
}) => {
  const navigate = useNavigate();
  
  return (
    <>
      <div className="absolute top-4 left-4">
        <Button 
          variant="outline" 
          size="sm"
          className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Homepage
        </Button>
      </div>
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Quiz {quizIndex + 1} of {totalQuizzes}
          </div>
          <div className="text-sm text-gray-400">
            Question {questionIndex + 1} of {totalQuestions}
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-white">
          {currentCategory?.name} Quiz
        </CardTitle>
        <CardDescription className="text-lg font-medium text-gray-300">
          {currentQuestion?.question_text}
          {currentQuestion?.multiple_correct && (
            <span className="text-sm font-normal text-blue-400 ml-2 block mt-1">
              (Select all correct answers)
            </span>
          )}
        </CardDescription>
      </CardHeader>
    </>
  );
};
