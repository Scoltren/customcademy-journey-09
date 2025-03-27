
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
  selectedAnswers: Record<number, number | null>;
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
        
        // Fetch questions for the current quiz
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
        
        // Fetch answers for all questions in the current quiz
        const answersPromises = questionsData.map(question => 
          supabase
            .from("answers")
            .select("*")
            .eq("question_id", question.id)
        );
        
        const answersResults = await Promise.all(answersPromises);
        const answersData = answersResults.map(result => result.data || []);
        
        setQuizState(prev => ({
          ...prev,
          questions: questionsData,
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
    const currentQuestionId = quizState.questions[quizState.currentQuestionIndex]?.id;
    
    if (currentQuestionId) {
      setQuizState(prev => ({
        ...prev,
        selectedAnswers: {
          ...prev.selectedAnswers,
          [currentQuestionId]: answerId
        }
      }));
    }
  };

  const calculateScore = () => {
    let score = 0;
    const currentQuizId = quizIds[quizState.currentQuizIndex];
    
    quizState.questions.forEach((question, index) => {
      const selectedAnswerId = quizState.selectedAnswers[question.id];
      const questionAnswers = quizState.answers[index] || [];
      
      if (selectedAnswerId) {
        const selectedAnswer = questionAnswers.find(a => a.id === selectedAnswerId);
        if (selectedAnswer && selectedAnswer.points) {
          score += selectedAnswer.points;
        }
      }
    });
    
    return score;
  };

  const saveQuizResults = async () => {
    if (!user) return;
    
    try {
      const currentQuizId = quizIds[quizState.currentQuizIndex];
      const score = calculateScore();
      
      // Save quiz results
      const { error } = await supabase
        .from("user_quiz_results")
        .insert({
          user_id: parseInt(user.id),
          quiz_id: currentQuizId,
          score: score
        });
        
      if (error) throw error;
      
      // Update quiz scores
      setQuizState(prev => ({
        ...prev,
        quizScores: {
          ...prev.quizScores,
          [currentQuizId]: score
        }
      }));
      
      toast.success("Quiz completed successfully!");
    } catch (error) {
      console.error("Error saving quiz results:", error);
      toast.error("Failed to save quiz results");
    }
  };

  const handleNextQuestion = async () => {
    const currentQuestionId = quizState.questions[quizState.currentQuestionIndex]?.id;
    
    if (!quizState.selectedAnswers[currentQuestionId]) {
      toast.error("Please select an answer");
      return;
    }
    
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      // Move to next question
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    } else {
      // Last question of current quiz
      await saveQuizResults();
      
      if (quizState.currentQuizIndex < quizIds.length - 1) {
        // Move to next quiz
        const nextQuizIndex = quizState.currentQuizIndex + 1;
        const nextQuizId = quizIds[nextQuizIndex];
        
        try {
          setIsLoading(true);
          
          // Fetch questions for the next quiz
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
          
          // Fetch answers for all questions in the next quiz
          const answersPromises = questionsData.map(question => 
            supabase
              .from("answers")
              .select("*")
              .eq("question_id", question.id)
          );
          
          const answersResults = await Promise.all(answersPromises);
          const answersData = answersResults.map(result => result.data || []);
          
          setQuizState(prev => ({
            ...prev,
            questions: questionsData,
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
        // All quizzes completed
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
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentAnswers.map((answer) => (
                <div
                  key={answer.id}
                  className={`p-4 border rounded-md cursor-pointer transition-all ${
                    quizState.selectedAnswers[currentQuestion?.id] === answer.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleSelectAnswer(answer.id)}
                >
                  {answer.answer_text}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Select the best answer
            </div>
            <Button 
              onClick={handleNextQuestion}
              disabled={!quizState.selectedAnswers[currentQuestion?.id]}
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
