
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useQuiz } from "@/hooks/useQuiz";

const CategoryQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get the quiz IDs and categories from the location state
  const { quizIds = [], categories = [] } = location.state || {};
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { 
    quizState, 
    isLoading, 
    currentCategory, 
    currentQuestion, 
    currentAnswers, 
    selectedAnswerIds, 
    handleSelectAnswer, 
    handleNextQuestion, 
    isCompleted
  } = useQuiz(user, quizIds, categories);
  
  // If no quiz IDs were provided, redirect to courses
  useEffect(() => {
    if (!quizIds.length || !categories.length) {
      navigate('/');
    }
  }, [quizIds, categories, navigate]);
  
  // Handle when all quizzes are completed
  useEffect(() => {
    if (isCompleted) {
      toast.success("All quizzes completed! Your results have been saved.");
      navigate('/');
    }
  }, [isCompleted, navigate]);
  
  // Handle submitting an answer
  const handleSubmitAnswer = () => {
    // Calculate if any selected answers are correct
    const correctlySelected = currentAnswers
      .filter(a => selectedAnswerIds.includes(a.id) && a.points > 0)
      .length;
    
    // Update the score
    if (correctlySelected > 0) {
      // Update just the score in the quizState
      quizState.score += correctlySelected;
    }
    
    setShowFeedback(true);
  };
  
  // Handle moving to the next question
  const handleNextQuestionClick = () => {
    setShowFeedback(false);
    handleNextQuestion();
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 p-4">
        <div className="text-center text-white">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-xl">Loading quiz...</p>
        </div>
      </div>
    );
  }
  
  if (!quizState.questions.length && !isCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 p-4">
        <div className="w-full max-w-3xl">
          <Card className="backdrop-blur-sm bg-slate-950 border-slate-800 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">Quiz Not Available</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-300 text-lg mb-6">
                The quiz you're looking for isn't available right now.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pb-6">
              <Button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                Return Home
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 p-4">
      <div className="w-full max-w-3xl">
        <Card className="backdrop-blur-sm bg-slate-950 border-slate-800 shadow-xl transition-all duration-300">
          {/* Quiz Header */}
          <CardHeader className="text-center border-b border-slate-800">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Quiz {quizState.currentQuizIndex + 1} of {quizIds.length}</span>
              <span>Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}</span>
            </div>
            <CardTitle className="text-2xl font-bold text-white">{currentCategory?.name || "Quiz"}</CardTitle>
            <p className="text-slate-300 mt-4">{currentQuestion?.question_text}</p>
          </CardHeader>
          
          {/* Quiz Content - Answer Choices */}
          <CardContent className="py-6">
            <div className="space-y-3">
              {currentAnswers.map((answer) => {
                const isSelected = selectedAnswerIds.includes(answer.id);
                const isCorrect = answer.points > 0;
                
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
                    key={answer.id}
                    className={answerClasses}
                    onClick={() => !showFeedback && handleSelectAnswer(answer.id)}
                  >
                    <div className={`mr-3 h-5 w-5 rounded border flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-500'
                    }`}>
                      {isSelected && <div className="h-2 w-2 rounded-sm bg-white"></div>}
                    </div>
                    <div className="flex-1">
                      <p className="text-white">{answer.answer_text}</p>
                      {showFeedback && answer.explanation && (
                        <p className="text-sm text-slate-400 mt-1">{answer.explanation}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          
          {/* Quiz Footer with Actions */}
          <CardFooter className="flex justify-between border-t border-slate-800 pt-4">
            <div className="text-slate-400">
              {showFeedback && (
                <p>Score: {quizState.score}</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              {!showFeedback ? (
                <Button
                  onClick={handleSubmitAnswer}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={selectedAnswerIds.length === 0 || isSaving}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestionClick}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isSaving}
                >
                  {quizState.currentQuestionIndex === quizState.questions.length - 1 && 
                   quizState.currentQuizIndex === quizIds.length - 1 
                    ? "Finish Quiz" 
                    : quizState.currentQuestionIndex === quizState.questions.length - 1
                      ? "Next Quiz"
                      : "Next Question"}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CategoryQuiz;
