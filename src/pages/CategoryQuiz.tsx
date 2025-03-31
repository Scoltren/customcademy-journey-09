
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface QuizState {
  quizIds: number[];
  categories: any[];
  currentQuizIndex: number;
  currentQuestionIndex: number;
  questions: any[];
  answers: Record<number, number[]>;
  score: number;
}

const CategoryQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get the quiz IDs and categories from the location state
  const { quizIds = [], categories = [] } = location.state || {};
  
  const [isLoading, setIsLoading] = useState(true);
  const [quizState, setQuizState] = useState<QuizState>({
    quizIds,
    categories,
    currentQuizIndex: 0,
    currentQuestionIndex: 0,
    questions: [],
    answers: {},
    score: 0
  });
  
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [currentAnswers, setCurrentAnswers] = useState<any[]>([]);
  const [selectedAnswerIds, setSelectedAnswerIds] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  // If no quiz IDs were provided, redirect to courses
  useEffect(() => {
    if (!quizIds.length || !categories.length) {
      navigate('/courses');
      return;
    }

    loadQuiz();
  }, [quizIds, categories]);
  
  // Load the current quiz questions
  const loadQuiz = async () => {
    if (quizState.currentQuizIndex >= quizState.quizIds.length) {
      // All quizzes completed
      navigate('/courses');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const currentQuizId = quizState.quizIds[quizState.currentQuizIndex];
      
      // Fetch questions for the current quiz
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', currentQuizId);
      
      if (questionsError) throw questionsError;
      
      if (!questions || questions.length === 0) {
        toast.error("No questions found for this quiz.");
        setIsLoading(false);
        return;
      }
      
      // Update the quiz state with the questions
      setQuizState(prev => ({
        ...prev,
        questions: questions
      }));
      
      // Set the current question
      setCurrentQuestion(questions[0]);
      
      // Fetch answers for the first question
      await loadAnswersForQuestion(questions[0].id);
      
    } catch (error) {
      console.error("Error loading quiz:", error);
      toast.error("Failed to load quiz questions.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load answers for a specific question
  const loadAnswersForQuestion = async (questionId: number) => {
    try {
      const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', questionId);
      
      if (answersError) throw answersError;
      
      setCurrentAnswers(answers || []);
      setSelectedAnswerIds([]);
      
    } catch (error) {
      console.error("Error loading answers:", error);
      toast.error("Failed to load question answers.");
    }
  };
  
  // Handle selecting an answer
  const handleSelectAnswer = (answerId: number) => {
    if (showFeedback) return; // Prevent changing answer after submission
    
    setSelectedAnswerIds(prev => {
      const isSelected = prev.includes(answerId);
      
      // If multi-select is not needed, uncomment this:
      // return isSelected ? [] : [answerId];
      
      // For multi-select:
      return isSelected 
        ? prev.filter(id => id !== answerId) 
        : [...prev, answerId];
    });
  };
  
  // Handle submitting an answer
  const handleSubmitAnswer = () => {
    setShowFeedback(true);
    
    // Calculate score
    const correctAnswers = currentAnswers.filter(a => a.points > 0);
    const correctlySelected = currentAnswers
      .filter(a => selectedAnswerIds.includes(a.id) && a.points > 0)
      .length;
    
    // Update total score
    if (correctlySelected > 0) {
      setQuizState(prev => ({
        ...prev,
        score: prev.score + correctlySelected
      }));
    }
    
    // Store the answer for this question
    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: selectedAnswerIds
      }
    }));
  };
  
  // Handle moving to the next question
  const handleNextQuestion = () => {
    // Check if we need to save the quiz results
    if (quizState.currentQuestionIndex === quizState.questions.length - 1 && showFeedback) {
      setQuizCompleted(true);
      return;
    }
    
    setShowFeedback(false);
    
    // Move to the next question
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      // Next question in current quiz
      const nextQuestionIndex = quizState.currentQuestionIndex + 1;
      const nextQuestion = quizState.questions[nextQuestionIndex];
      
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: nextQuestionIndex
      }));
      
      setCurrentQuestion(nextQuestion);
      loadAnswersForQuestion(nextQuestion.id);
    } else {
      // Move to the next quiz
      setQuizState(prev => ({
        ...prev,
        currentQuizIndex: prev.currentQuizIndex + 1,
        currentQuestionIndex: 0
      }));
      
      loadQuiz();
    }
  };
  
  // Save quiz results when completed
  const saveQuizResults = async () => {
    if (!user) return;
    
    try {
      const currentQuizId = quizState.quizIds[quizState.currentQuizIndex];
      
      // Save quiz result
      const { error } = await supabase
        .from('user_quiz_results')
        .insert({
          user_id: user.id,
          quiz_id: currentQuizId,
          score: quizState.score
        });
      
      if (error) throw error;
      
      toast.success("Quiz results saved successfully!");
      
      // Move to the next quiz or finish
      handleNextQuestion();
      
    } catch (error) {
      console.error("Error saving quiz results:", error);
      toast.error("Failed to save quiz results.");
    }
  };
  
  // Save results when quiz is completed
  useEffect(() => {
    if (quizCompleted) {
      saveQuizResults();
      setQuizCompleted(false);
    }
  }, [quizCompleted]);
  
  // Get the current category name
  const getCurrentCategoryName = () => {
    if (quizState.currentQuizIndex < quizState.categories.length) {
      return quizState.categories[quizState.currentQuizIndex]?.name || "Quiz";
    }
    return "Quiz";
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
  
  if (!quizState.questions.length) {
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
                onClick={() => navigate('/courses')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                Return to Courses
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
              <span>Quiz {quizState.currentQuizIndex + 1} of {quizState.quizIds.length}</span>
              <span>Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}</span>
            </div>
            <CardTitle className="text-2xl font-bold text-white">{getCurrentCategoryName()}</CardTitle>
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
                    onClick={() => handleSelectAnswer(answer.id)}
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
                  disabled={selectedAnswerIds.length === 0}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {quizState.currentQuestionIndex === quizState.questions.length - 1 && 
                   quizState.currentQuizIndex === quizState.quizIds.length - 1 
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
