
import React from 'react';
import { Link } from 'react-router-dom';

interface QuizResult {
  id: number;
  quiz_id: number;
  score: number;
  user_id: string;
  quiz?: {
    title: string;
    category_id: number;
    category?: {
      name: string;
    }
  }
}

interface QuizResultsTabProps {
  quizResults: QuizResult[];
  isLoading: boolean;
}

const QuizResultsTab = ({ quizResults, isLoading }: QuizResultsTabProps) => {
  
  const getAverageScore = () => {
    if (quizResults.length === 0) return 0;
    const totalScore = quizResults.reduce((acc, quiz) => acc + (quiz.score || 0), 0);
    return Math.round(totalScore / quizResults.length);
  };
  
  const getTotalQuestions = () => {
    return quizResults.length;
  };
  
  return (
    <div>
      <h1 className="heading-lg mb-6">Quiz Results</h1>
      
      {isLoading ? (
        <div className="glass-card p-6 text-center">
          <p className="text-white">Loading your quiz results...</p>
        </div>
      ) : quizResults.length > 0 ? (
        <>
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Performance Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-navy/50 rounded-lg p-4 text-center">
                <h3 className="text-slate-400 mb-2">Average Score</h3>
                <p className="text-3xl font-bold text-white">
                  {getAverageScore()}%
                </p>
              </div>
              
              <div className="bg-navy/50 rounded-lg p-4 text-center">
                <h3 className="text-slate-400 mb-2">Quizzes Taken</h3>
                <p className="text-3xl font-bold text-white">{quizResults.length}</p>
              </div>
              
              <div className="bg-navy/50 rounded-lg p-4 text-center">
                <h3 className="text-slate-400 mb-2">Total Questions</h3>
                <p className="text-3xl font-bold text-white">
                  {getTotalQuestions()}
                </p>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">Quiz History</h2>
          <div className="space-y-4">
            {quizResults.map((quiz) => (
              <div key={quiz.id} className="glass-card p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{quiz.quiz?.title || 'Quiz'}</h3>
                    <div className="flex gap-3 mb-3">
                      <span className="text-sm py-1 px-3 rounded-full bg-blue/10 text-blue-light border border-blue/20">
                        {quiz.quiz?.category?.name || 'General'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-navy/50 rounded-full h-24 w-24 flex flex-col items-center justify-center">
                    <span className="text-sm text-slate-400">Score</span>
                    <span className="text-2xl font-bold text-white">{quiz.score}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="glass-card p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-3">You haven't taken any quizzes yet</h3>
          <p className="text-slate-400 mb-6">Take quizzes to test your knowledge and track your progress</p>
          <Link to="/courses" className="button-primary py-2 px-6">Find Courses with Quizzes</Link>
        </div>
      )}
    </div>
  );
};

export default QuizResultsTab;
