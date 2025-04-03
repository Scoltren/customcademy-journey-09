
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useQuiz } from '@/hooks/quiz/useQuiz';
import QuizContent from '@/components/quiz/QuizContent';
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
  
  // Log received props
  console.log("CategoryQuizView received props:", { quizIds, categories });
  
  // Use the quiz hook to manage quiz state and logic
  const {
    currentQuestion,
    currentAnswers,
    selectedAnswerIds,
    isLoading,
    isCompleted,
    currentCategory,
    handleAnswerSelect,
    handleSubmitAnswer,
    handleFinishQuiz
  } = useQuiz(quizIds, categories, [], user);

  // Handle quiz completion
  if (isCompleted) {
    console.log("Quiz completed, redirecting to dashboard");
    // We can add a success message here if needed
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

  // Render the quiz content
  return (
    <QuizContent
      currentQuestion={currentQuestion}
      currentAnswers={currentAnswers}
      selectedAnswerIds={selectedAnswerIds}
      categoryName={currentCategory?.name || "Quiz"}
      onSelectAnswer={handleAnswerSelect}
      onSubmitAnswer={handleSubmitAnswer}
      onFinish={handleFinishQuiz}
    />
  );
};

export default CategoryQuizView;
