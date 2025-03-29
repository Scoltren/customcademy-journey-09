
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
  multiple_correct?: boolean;
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
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
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
            
            // Check if this question has multiple correct answers
            const correctAnswers = answersData?.filter(answer => answer.points > 0) || [];
            const multiple_correct = correctAnswers.length > 1;
            
            return {
              ...question,
              answers: answersData || [],
              multiple_correct
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
      const question = questions.find(q => q.id === questionId);
      
      // If this is a single-answer question, replace previous selection
      if (!question?.multiple_correct) {
        return {
          ...prev,
          [questionId]: [answerId]
        };
      }
      
      // For multiple-answer questions, toggle the selection
      if (currentAnswers.includes(answerId)) {
        return {
          ...prev,
          [questionId]: currentAnswers.filter(id => id !== answerId)
        };
      }
      
      // Add to the selection
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
      // Calculate max possible score (sum of all positive point values)
      const correctAnswers = question.answers.filter(answer => answer.points > 0);
      correctAnswers.forEach(answer => {
        maxScore += answer.points;
      });
      
      // Calculate user's score
      const selectedAnswerIds = selectedAnswers[question.id] || [];
      question.answers.forEach(answer => {
        if (selectedAnswerIds.includes(answer.id)) {
          // Add the points (can be positive or negative)
          score += answer.points;
        }
      });
    });
    
    // Determine skill level based on percentage score
    // Note: We're only comparing against the total positive points as specified
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    let skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
    
    if (percentage >= 80) {
      skillLevel = 'Advanced';
    } else if (percentage >= 50) {
      skillLevel = 'Intermediate';
    }
    
    return {
      score,
      maxScore,
      passed: score > 0, // Consider passed if any points scored
      skillLevel
    };
  };

  const handleSubmit = async () => {
    const result = calculateScore();
    setQuizResult(result);
    setSubmittedAnswers({...selectedAnswers});
    setShowResults(true);
    
    try {
      // Get the category associated with this quiz
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('category_id')
        .eq('id', quizId)
        .single();
      
      if (quizError) throw quizError;
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && quizData?.category_id) {
        // Store the user's skill level for this category
        const { error: interestError } = await supabase
          .from('user_interest_categories')
          .upsert({
            user_id: user.id,
            category_id: quizData.category_id,
            difficulty_level: result.skillLevel
          }, {
            onConflict: 'user_id,category_id'
          });
          
        if (interestError) {
          console.error('Error saving user skill level:', interestError);
        }
        
        // Store the quiz result
        const { error: resultError } = await supabase
          .from('user_quiz_results')
          .insert({
            user_id: user.id,
            quiz_id: quizId,
            score: result.score
          });
          
        if (resultError) {
          console.error('Error saving quiz result:', resultError);
        }
      }
    } catch (error) {
      console.error('Error processing quiz submission:', error);
    }
    
    if (result.score > 0) {
      toast.success(`You scored ${result.score}/${result.maxScore}. Skill level: ${result.skillLevel}`);
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
            {question.multiple_correct && (
              <span className="text-sm font-normal text-blue-400 ml-2">
                (Select all that apply)
              </span>
            )}
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
                          w-5 h-5 rounded ${question.multiple_correct ? 'rounded-md' : 'rounded-full'} border flex items-center justify-center
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
                          isSelected && <div className={`${question.multiple_correct ? 'w-2 h-2' : 'w-3 h-3'} bg-white ${question.multiple_correct ? 'rounded-sm' : 'rounded-full'}`}></div>
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
                  ? 'Quiz completed!' 
                  : 'You did not pass the quiz.'}
              </p>
              <p className="text-slate-300 mt-1">
                Your score: {quizResult?.score}/{quizResult?.maxScore}
              </p>
              <p className="text-slate-300 mt-1">
                Skill level: <span className={
                  quizResult?.skillLevel === 'Beginner' ? 'text-green-400' :
                  quizResult?.skillLevel === 'Intermediate' ? 'text-yellow-400' : 'text-red-400'
                }>
                  {quizResult?.skillLevel}
                </span>
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
