import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useQuiz } from '@/hooks/quiz/useQuiz';
import QuizContent from '@/components/quiz/QuizContent';
import QuizHeader from '@/components/quiz/QuizHeader';
import QuizFooter from '@/components/quiz/QuizFooter';
import QuizLoading from '@/components/quiz/QuizLoading';
import QuizNotAvailable from '@/components/quiz/QuizNotAvailable';
import { toast } from 'sonner';

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
  
  // Log received props
  console.log("CategoryQuizView received props:", { quizIds, categories });
  
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
  } = useQuiz(quizIds, categories, user);

  // Computed values
  const score = quizState.score;
  const totalQuestions = quizState.questions.length;
  const currentQuizIndex = quizState.currentQuizIndex;
  const totalQuizzes = quizIds.length;
  const currentQuestionIndex = quizState.currentQuestionIndex;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isLastQuiz = currentQuizIndex === totalQuizzes - 1;

  // Handle quiz completion
  if (isCompleted) {
    console.log("Quiz completed, redirecting to dashboard");
    return (
      <div className="container mx-auto p-4">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Quiz Completed!</h1>
          <p className="mb-4">Your responses have been saved.</p>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => navigate('/')}
          >
            Go to Homepage
          </button>
        </Card>
      </div>
    );
  }

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
    const points = handleSubmitAnswer();
    
    // Add a toast message showing points earned
    if (points > 0) {
      toast.success(`You earned ${points} points!`);
    }
    
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
        // We don't navigate here as the isCompleted state will trigger the completion UI
      });
    } else {
      // Otherwise proceed to next question/quiz
      handleNextQuestion(user, quizIds, categories);
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
