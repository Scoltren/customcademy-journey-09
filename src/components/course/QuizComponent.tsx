import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface QuizComponentProps {
  quizId: number;
}

interface Question {
  id: number;
  question_text: string;
  answers: Answer[];
}

interface Answer {
  id: number;
  answer_text: string;
  points: number;
  explanation: string | null;
}

interface QuizResult {
  score: number;
  maxScore: number;
  passed: boolean;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ quizId }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number[]}>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<{[key: number]: number[]}>({});
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setIsLoading(true);
        
        // First get the questions for this quiz
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizId);
        
        if (questionsError) throw questionsError;
        
        if (!questionsData || questionsData.length === 0) {
          console.log('No questions found for quiz ID:', quizId);
          setQuestions([]);
          setIsLoading(false);
          return;
        }
        
        // For each question, get its answers
        const questionsWithAnswers = await Promise.all(
          questionsData.map(async (question) => {
            const { data: answersData, error: answersError } = await supabase
              .from('answers')
              .select('*')
              .eq('question_id', question.id);
            
            if (answersError) throw answersError;
            
            return {
              ...question,
              answers: answersData || []
            };
          })
        );
        
        console.log('Questions with answers:', questionsWithAnswers);
        setQuestions(questionsWithAnswers);
      } catch (error) {
        console.error('Error fetching quiz data:', error);
        toast.error('Failed to load quiz');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);

  const handleAnswerSelect = (questionId: number, answerId: number) => {
    setSelectedAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      
      // If the answer is already selected, remove it
      if (currentAnswers.includes(answerId)) {
        return {
          ...prev,
          [questionId]: currentAnswers.filter(id => id !== answerId)
        };
      }
      
      // Otherwise add it to the selection
      return {
        ...prev,
        [questionId]: [...currentAnswers, answerId]
      };
    });
  };

  const calculateScore = () => {
    let score = 0;
    let maxScore = 0;
    
    questions.forEach(question => {
      const correctAnswers = question.answers.filter(answer => answer.points > 0);
      const selectedAnswerIds = selectedAnswers[question.id] || [];
      
      // Calculate max possible score
      correctAnswers.forEach(answer => {
        maxScore += answer.points;
      });
      
      // Calculate user's score
      question.answers.forEach(answer => {
        if (selectedAnswerIds.includes(answer.id)) {
          score += answer.points > 0 ? answer.points : 0;
        }
      });
    });
    
    return {
      score,
      maxScore,
      passed: score === maxScore
    };
  };

  const handleSubmit = () => {
    const result = calculateScore();
    setQuizResult(result);
    setSubmittedAnswers({...selectedAnswers});
    setShowResults(true);
    
    if (result.passed) {
      toast.success('Congratulations! You passed the quiz!');
    } else {
      toast.error(`You scored ${result.score}/${result.maxScore}. Try again!`);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setShowResults(false);
    setQuizResult(null);
  };

  // Helper function to check if an answer is correct
  const isCorrectAnswer = (answer: Answer) => {
    return answer.points > 0;
  };

  if (isLoading) {
    return (
      <div className="bg-navy/50 rounded-lg p-6">
        <Skeleton className="h-8 w-3/4 mb-6 bg-slate-700/50" />
        
        {[1, 2, 3].map((item) => (
          <div key={item} className="mb-6">
            <Skeleton className="h-6 w-full mb-4 bg-slate-700/50" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((option) => (
                <Skeleton key={option} className="h-5 w-full bg-slate-700/50" />
              ))}
            </div>
          </div>
        ))}
        
        <Skeleton className="h-10 w-32 mt-6 bg-slate-700/50" />
      </div>
    );
  }
  
  if (questions.length === 0) {
    return (
      <div className="bg-navy/50 rounded-lg p-6 text-center">
        <p className="text-slate-400">No questions available for this quiz.</p>
      </div>
    );
  }

  return (
    <div className="bg-navy/50 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-6">Quiz Assessment</h3>
      
      {questions.map((question, qIndex) => (
        <div key={question.id} className="mb-8">
          <h4 className="text-lg font-medium mb-3">
            {qIndex + 1}. {question.question_text}
          </h4>
          
          <div className="space-y-3">
            {question.answers.map((answer) => {
              const isSelected = (selectedAnswers[question.id] || []).includes(answer.id);
              const wasSubmitted = showResults && (submittedAnswers[question.id] || []).includes(answer.id);
              const correct = isCorrectAnswer(answer);
              
              return (
                <div 
                  key={answer.id} 
                  className={`
                    p-3 rounded-lg border transition-colors cursor-pointer
                    ${showResults 
                      ? wasSubmitted 
                        ? correct 
                          ? 'border-green-500 bg-green-500/10' 
                          : 'border-red-500 bg-red-500/10'
                        : correct 
                          ? 'border-green-500 bg-green-500/10' 
                          : 'border-slate-700 bg-transparent'
                      : isSelected 
                        ? 'border-blue-400 bg-blue-400/10' 
                        : 'border-slate-700 hover:border-blue-400/50'
                    }
                  `}
                  onClick={() => !showResults && handleAnswerSelect(question.id, answer.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div 
                        className={`
                          w-5 h-5 rounded border flex items-center justify-center
                          ${showResults 
                            ? wasSubmitted 
                              ? correct 
                                ? 'border-green-500 bg-green-500 text-white' 
                                : 'border-red-500 bg-red-500 text-white'
                              : 'border-slate-500' 
                            : isSelected 
                              ? 'border-blue-400 bg-blue-400 text-white' 
                              : 'border-slate-500'
                          }
                        `}
                      >
                        {showResults ? (
                          wasSubmitted ? (
                            correct ? <CheckCircle size={14} /> : <XCircle size={14} />
                          ) : null
                        ) : (
                          isSelected && <div className="w-3 h-3 bg-white rounded-sm"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className={`
                        ${showResults && correct ? 'font-medium' : ''}
                      `}>
                        {answer.answer_text}
                      </p>
                      
                      {showResults && answer.explanation && (
                        <p className="mt-2 text-sm text-slate-400">
                          {answer.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      <div className="mt-6">
        {showResults ? (
          <div className="space-y-4">
            <div className={`
              p-4 rounded-lg text-center
              ${quizResult?.passed ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}
            `}>
              <p className="font-bold text-lg">
                {quizResult?.passed 
                  ? 'Congratulations! You passed the quiz.' 
                  : 'You did not pass the quiz.'}
              </p>
              <p className="text-slate-300 mt-1">
                Your score: {quizResult?.score}/{quizResult?.maxScore}
              </p>
            </div>
            
            <Button 
              onClick={handleRetry}
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <Button 
            onClick={handleSubmit}
            className="button-primary"
            disabled={Object.keys(selectedAnswers).length === 0}
          >
            Submit Answers
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;
