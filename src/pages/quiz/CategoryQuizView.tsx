import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useQuiz } from '@/hooks/quiz/useQuiz';
import QuizContent from '@/components/quiz/QuizContent';
import QuizHeader from '@/components/quiz/QuizHeader';
import QuizFooter from '@/components/quiz/QuizFooter';
import QuizLoading from '@/components/quiz/QuizLoading';
import QuizNotAvailable from '@/components/quiz/QuizNotAvailable';

interface Category {
  id: number;
  name: string;
  description?: string;
  quiz_id?: number | null;
}

interface CategoryQuizViewProps {
  quizIds: number[];
  categories: Category[];
}

const CategoryQuizView: React.FC<CategoryQuizViewProps> = ({ quizIds, categories }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [activeQuizIds, setActiveQuizIds] = useState<number[]>(quizIds);
  const [activeCategories, setActiveCategories] = useState<Category[]>(categories);
  
  // Log received props
  console.log("CategoryQuizView received props:", { quizIds, categories });
  console.log("CategoryQuizView active state:", { activeQuizIds, activeCategories });
  
  // Use the quiz hook to manage quiz state and logic
  const {
    quizState,
    isLoading,
    currentQuestion,
    currentAnswers,
    selectedAnswerIds,
    isCompleted,
    currentCategory,
    handleSelectAnswer,
    handleSubmitAnswer,
    handleNextQuestion,
    saveQuizResults,
    updateScore,
    handleFinishQuiz
  } = useQuiz(activeQuizIds, activeCategories, user);

  // Computed values
  const score = quizState.score;
  const totalQuestions = quizState.questions.length;
  const currentQuizIndex = 0; // Always 0 since we're shifting arrays
  const totalQuizzes = activeQuizIds.length;
  const currentQuestionIndex = quizState.currentQuestionIndex;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isLastQuiz = totalQuizzes === 1;

  // Handle quiz completion - redirect to homepage
  useEffect(() => {
    if (isCompleted) {
      console.log("Quiz completed, redirecting to homepage");
      navigate('/');
    }
  }, [isCompleted, navigate]);

  // Handle loading state
  if (isLoading) {
    return <QuizLoading />;
  }

  // Handle no quiz available
  if (!currentQuestion) {
    return <QuizNotAvailable onBack={() => navigate('/')} />;
  }

  // Event handlers with corrected signatures
  const handleSubmitAnswerClick = () => {
    setShowFeedback(true);
    setIsSaving(true);
    
    // Call handleSubmitAnswer to calculate points and update score
    handleSubmitAnswer();
    
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  const handleNextQuestionClick = () => {
    setShowFeedback(false);
    setIsSaving(true);
    
    // Check if this is the last question of the last quiz
    if (isLastQuestion && isLastQuiz) {
      // Call handleFinishQuiz instead of handleNextQuestion
      handleFinishQuiz().then(() => {
        setIsSaving(false);
        // We don't navigate here as the isCompleted state will trigger the completion UI in useEffect
      });
    } else {
      // For the last question of non-last quiz, update our active quiz arrays
      if (isLastQuestion) {
        // Remove the current quiz from the array
        setActiveQuizIds(prev => [...prev.slice(1)]);
        setActiveCategories(prev => [...prev.slice(1)]);
        console.log("CategoryQuizView: Moving to next quiz by updating active arrays", {
          newQuizIds: [...activeQuizIds.slice(1)],
          newCategories: [...activeCategories.slice(1)]
        });
      }
      
      // Otherwise proceed to next question/quiz
      handleNextQuestion(user, activeQuizIds, activeCategories);
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  };

  // Render the quiz content with header and footer
  return (
    <>
      <QuizHeader 
        currentQuizIndex={currentQuizIndex}
        totalQuizzes={totalQuizzes}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        categoryName={currentCategory?.name}
        questionText={currentQuestion?.question_text}
      />

      <QuizContent
        answers={currentAnswers}
        selectedAnswerIds={selectedAnswerIds}
        showFeedback={showFeedback}
        handleSelectAnswer={handleSelectAnswer}
      />

      <QuizFooter
        score={score}
        showFeedback={showFeedback}
        selectedAnswerIds={selectedAnswerIds}
        isSaving={isSaving}
        isLastQuestion={isLastQuestion}
        isLastQuiz={isLastQuiz}
        onSubmitAnswer={handleSubmitAnswerClick}
        onNextQuestion={handleNextQuestionClick}
      />
    </>
  );
};

export default CategoryQuizView;
