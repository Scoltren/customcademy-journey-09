
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Category, Question, Answer, QuizState } from "@/types/quiz";

export const useQuiz = (user: any, quizIds: number[], categories: Category[]) => {
  const navigate = useNavigate();
  
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
        
        if (currentQuestion.multiple_correct) {
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
      
      const correctAnswers = questionAnswers.filter(a => a.points && a.points > 0);
      correctAnswers.forEach(answer => {
        maxScore += answer.points || 0;
      });
      
      questionAnswers.forEach(answer => {
        if (selectedAnswerIds.includes(answer.id) && answer.points) {
          score += answer.points > 0 ? answer.points : 0;
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
      
      const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
      let skillLevel: string = 'Beginner';
      
      if (percentage >= 80) {
        skillLevel = 'Advanced';
      } else if (percentage >= 50) {
        skillLevel = 'Intermediate';
      }
      
      const currentCategory = categories.find(c => c.quiz_id === currentQuizId);
      
      if (currentCategory) {
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

  // Additional helper getters
  const currentCategory = categories.find(c => c.quiz_id === quizIds[quizState.currentQuizIndex]);
  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
  const currentAnswers = quizState.answers[quizState.currentQuestionIndex] || [];
  const selectedAnswerIds = currentQuestion ? (quizState.selectedAnswers[currentQuestion.id] || []) : [];

  return {
    quizState,
    isLoading,
    currentCategory,
    currentQuestion,
    currentAnswers,
    selectedAnswerIds,
    handleSelectAnswer,
    handleNextQuestion
  };
};
