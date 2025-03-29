
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QuizState } from "@/types/quiz";

/**
 * Hook to handle quiz navigation logic
 */
export const useQuizNavigation = (
  quizIds: number[],
  quizState: QuizState,
  setQuizState: React.Dispatch<React.SetStateAction<QuizState>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  saveQuizResults: () => Promise<void>
) => {
  const navigate = useNavigate();

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

  return { handleNextQuestion };
};
