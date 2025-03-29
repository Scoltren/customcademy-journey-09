
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Category, QuizState } from "@/types/quiz";

/**
 * Hook to fetch quiz data from the database
 */
export const useQuizFetcher = (
  user: any, 
  quizIds: number[], 
  setQuizState: React.Dispatch<React.SetStateAction<QuizState>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const navigate = useNavigate();

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
  }, [user, navigate, quizIds, setQuizState, setIsLoading]);
};
