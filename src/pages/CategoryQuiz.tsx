
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Category {
  id: number;
  name: string;
  quiz_id: number | null;
}

interface Question {
  id: number;
  question_text: string;
  quiz_id: number;
  multiple_correct?: boolean;
}

interface Answer {
  id: number;
  answer_text: string;
  question_id: number;
  explanation?: string;
  points: number | null;
}

interface QuizState {
  currentQuizIndex: number;
  currentQuestionIndex: number;
  questions: Question[];
  answers: Answer[][];
  selectedAnswers: Record<number, number[]>;
  quizScores: Record<number, number>;
}

const CategoryQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { quizIds = [], categories = [] } = location.state || {};

  const [quizState, setQuizState] = useState<QuizState>({
    currentQuizIndex: 0,
    currentQuestionIndex: 0,
    questions: [],
    answers: [],
    selectedAnswers: {},
    quizScores: {},
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!quizIds || quizIds.length === 0) {
      navigate("/dashboard");
      return;
    }

    const fetchQuizData = async () => {
      try {
        setIsLoading(true);
        const currentQuizId = quizIds[0];
        
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("*")
          .eq("quiz_id", currentQuizId);
        
        if (questionsError) throw questionsError;
        
        if (!questionsData || questionsData.length === 0) {
          toast.error("No questions found for this quiz");
          navigate("/dashboard");
          return;
        }
        
        const answersPromises = questionsData.map(question => 
          supabase
            .from("answers")
            .select("*")
            .eq("question_id", question.id)
        );
        
        const answersResults = await Promise.all(answersPromises);
        const answersData = answersResults.map(result => result.data || []);
        
        // Determine which questions have multiple correct answers
        const questionsWithMultipleFlag = questionsData.map((question, index) => {
          const questionAnswers = answersData[index] || [];
          const correctAnswers = questionAnswers.filter(answer => answer.points && answer.points > 0);
          return {
            ...question,
            multiple_correct: correctAnswers.length > 1
          };
        });
        
        setQuizState(prev => ({
          ...prev,
          questions: questionsWithMultipleFlag,
          answers: answersData,
          currentQuizIndex: 0,
          currentQuestionIndex: 0,
          selectedAnswers: {},
        }));
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        toast.error("Failed to load quiz questions");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [user, navigate, quizIds]);

  const handleSelectAnswer = (answerId: number) => {
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    
    if (currentQuestion) {
      setQuizState(prev => {
        const currentSelected = prev.selectedAnswers[currentQuestion.id] || [];
        
        // If this question allows multiple answers
        if (currentQuestion.multiple_correct) {
          // Toggle selection
          if (currentSelected.includes(answerId)) {
            return {
              ...prev,
              selectedAnswers: {
                ...prev.selectedAnswers,
                [currentQuestion.id]: currentSelected.filter(id => id !== answerId)
              }
            };
          } else {
            return {
              ...prev,
              selectedAnswers: {
                ...prev.selectedAnswers,
                [currentQuestion.id]: [...currentSelected, answerId]
              }
            };
          }
        } else {
          // Single selection for regular questions
          return {
            ...prev,
            selectedAnswers: {
              ...prev.selectedAnswers,
              [currentQuestion.id]: [answerId]
            }
          };
        }
      });
    }
  };

  const calculateScore = () => {
    let score = 0;
    let maxScore = 0;
    const currentQuizId = quizIds[quizState.currentQuizIndex];
    
    quizState.questions.forEach((question, index) => {
      const selectedAnswerIds = quizState.selectedAnswers[question.id] || [];
      const questionAnswers = quizState.answers[index] || [];
      
      // Calculate max score from positive point values
      const correctAnswers = questionAnswers.filter(a => a.points && a.points > 0);
      correctAnswers.forEach(answer => {
        maxScore += answer.points || 0;
      });
      
      // Calculate user's score
      questionAnswers.forEach(answer => {
        if (selectedAnswerIds.includes(answer.id) && answer.points) {
          score += answer.points > 0 ? answer.points : 0; // Only add positive points
        }
      });
    });
    
    return { score, maxScore };
  };

  const saveQuizResults = async () => {
    if (!user) return;
    
    try {
      const currentQuizId = quizIds[quizState.currentQuizIndex];
      const { score, maxScore } = calculateScore();
      
      // Calculate skill level based on percentage
      const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
      let skillLevel: string = 'Beginner';
      
      if (percentage >= 80) {
        skillLevel = 'Advanced';
      } else if (percentage >= 50) {
        skillLevel = 'Intermediate';
      }
      
      // Get category associated with this quiz
      const currentCategory = categories.find(c => c.quiz_id === currentQuizId);
      
      if (currentCategory) {
        // Update user's skill level for this category
        const { error: interestError } = await supabase
          .from('user_interest_categories')
          .upsert({
            user_id: user.id,
            category_id: currentCategory.id,
            difficulty_level: skillLevel
          }, {
            onConflict: 'user_id,category_id'
          });
          
        if (interestError) {
          console.error('Error saving user skill level:', interestError);
        }
      }
      
      const { error } = await supabase
        .from('user_quiz_results')
        .insert({
          user_id: user.id,
          quiz_id: currentQuizId,
          score: score
        });
        
      if (error) throw error;
      
      setQuizState(prev => ({
        ...prev,
        quizScores: {
          ...prev.quizScores,
          [currentQuizId]: score
        }
      }));
      
      const message = percentage >= 50 
        ? `Quiz completed! Your skill level: ${skillLevel}`
        : `Quiz completed! Keep practicing to improve your skills.`;
      
      toast.success(message);
    } catch (error) {
      console.error("Error saving quiz results:", error);
      toast.error("Failed to save quiz results");
    }
  };

  const handleNextQuestion = async () => {
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    
    if (!quizState.selectedAnswers[currentQuestion?.id]) {
      toast.error("Please select an answer");
      return;
    }
    
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    } else {
      await saveQuizResults();
      
      if (quizState.currentQuizIndex < quizIds.length - 1) {
        const nextQuizIndex = quizState.currentQuizIndex + 1;
        const nextQuizId = quizIds[nextQuizIndex];
        
        try {
          setIsLoading(true);
          
          const { data: questionsData, error: questionsError } = await supabase
            .from("questions")
            .select("*")
            .eq("quiz_id", nextQuizId);
          
          if (questionsError) throw questionsError;
          
          if (!questionsData || questionsData.length === 0) {
            toast.error("No questions found for the next quiz");
            navigate("/dashboard");
            return;
          }
          
          const answersPromises = questionsData.map(question => 
            supabase
              .from("answers")
              .select("*")
              .eq("question_id", question.id)
          );
          
          const answersResults = await Promise.all(answersPromises);
          const answersData = answersResults.map(result => result.data || []);
          
          // Determine which questions have multiple correct answers
          const questionsWithMultipleFlag = questionsData.map((question, index) => {
            const questionAnswers = answersData[index] || [];
            const correctAnswers = questionAnswers.filter(answer => answer.points && answer.points > 0);
            return {
              ...question,
              multiple_correct: correctAnswers.length > 1
            };
          });
          
          setQuizState(prev => ({
            ...prev,
            questions: questionsWithMultipleFlag,
            answers: answersData,
            currentQuizIndex: nextQuizIndex,
            currentQuestionIndex: 0,
            selectedAnswers: {},
          }));
        } catch (error) {
          console.error("Error fetching next quiz data:", error);
          toast.error("Failed to load next quiz");
          navigate("/dashboard");
        } finally {
          setIsLoading(false);
        }
      } else {
        toast.success("All quizzes completed!");
        navigate("/dashboard");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-blue-600 p-4">
        <div className="text-white text-xl">Loading quiz...</div>
      </div>
    );
  }

  const currentCategory = categories.find(c => c.quiz_id === quizIds[quizState.currentQuizIndex]);
  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
  const currentAnswers = quizState.answers[quizState.currentQuestionIndex] || [];
  const selectedAnswerIds = currentQuestion ? (quizState.selectedAnswers[currentQuestion.id] || []) : [];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-blue-600 p-4">
      <div className="absolute top-4 left-4">
        <Button 
          variant="outline" 
          size="sm"
          className="bg-white/80 hover:bg-white"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Homepage
        </Button>
      </div>
      <div className="w-full max-w-3xl">
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-black/80 border-none shadow-xl transition-all duration-300">
          <CardHeader className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Quiz {quizState.currentQuizIndex + 1} of {quizIds.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {currentCategory?.name} Quiz
            </CardTitle>
            <CardDescription className="text-lg font-medium">
              {currentQuestion?.question_text}
              {currentQuestion?.multiple_correct && (
                <span className="text-sm font-normal text-blue-600 dark:text-blue-400 ml-2 block mt-1">
                  (Select all correct answers)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentAnswers.map((answer) => (
                <div
                  key={answer.id}
                  className={`p-4 border rounded-md cursor-pointer transition-all ${
                    selectedAnswerIds.includes(answer.id)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleSelectAnswer(answer.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 flex items-center justify-center ${
                      currentQuestion?.multiple_correct 
                        ? "border rounded-md" 
                        : "border rounded-full"
                    } ${
                      selectedAnswerIds.includes(answer.id)
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-gray-300"
                    }`}>
                      {selectedAnswerIds.includes(answer.id) && (
                        <div className={`${
                          currentQuestion?.multiple_correct 
                            ? "w-2 h-2 bg-white" 
                            : "w-3 h-3 bg-white rounded-full"
                        }`}></div>
                      )}
                    </div>
                    <div>{answer.answer_text}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              {currentQuestion?.multiple_correct 
                ? "Select all correct answers" 
                : "Select the best answer"}
            </div>
            <Button 
              onClick={handleNextQuestion}
              disabled={!selectedAnswerIds.length}
              className="bg-black text-white dark:bg-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
            >
              {quizState.currentQuestionIndex < quizState.questions.length - 1
                ? "Next Question"
                : quizState.currentQuizIndex < quizIds.length - 1
                  ? "Next Quiz"
                  : "Finish"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CategoryQuiz;
