
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QuizState } from "@/types/quiz";

/**
 * Helper function to fetch data for the next quiz
 */
export const fetchNextQuizData = async (
  nextQuizId: number,
  setQuizState: React.Dispatch<React.SetStateAction<QuizState>>,
  nextQuizIndex: number
) => {
  try {
    const { data: questionsData, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", nextQuizId);
    
    if (questionsError) throw questionsError;
    
    if (!questionsData || questionsData.length === 0) {
      toast.error("No questions found for the next quiz");
      return false;
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
    
    return true;
  } catch (error) {
    console.error("Error fetching next quiz data:", error);
    return false;
  }
};
