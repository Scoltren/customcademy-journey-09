
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

interface Question {
  id: number;
  question_text: string;
  quiz_id: number | null;
  answers: Answer[];
}

interface Answer {
  id: number;
  answer_text: string;
  is_correct: boolean | null;
  explanation: string | null;
  question_id: number | null;
}

interface QuizComponentProps {
  quizId: number;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ quizId }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  
  const form = useForm();
  
  // Fetch quiz questions and answers
  const { data: questions = [], isLoading, error } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      // First fetch the questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId);
      
      if (questionsError) throw questionsError;
      
      if (!questionsData || questionsData.length === 0) {
        return [];
      }
      
      // Then fetch answers for all questions
      const questionIds = questionsData.map(q => q.id);
      
      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select('*')
        .in('question_id', questionIds);
      
      if (answersError) throw answersError;
      
      // Combine questions with their answers
      return questionsData.map(question => ({
        ...question,
        answers: answersData.filter(answer => answer.question_id === question.id) || []
      })) as Question[];
    },
    enabled: !!quizId,
  });
  
  // Reset state when quiz ID changes
  useEffect(() => {
    setUserAnswers({});
    setSubmitted(false);
    form.reset();
  }, [quizId, form]);

  const handleAnswerSelect = (questionId: number, answerId: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const isAnswerCorrect = (questionId: number, answerId: number) => {
    if (!submitted) return null;
    
    const question = questions.find(q => q.id === questionId);
    if (!question) return null;
    
    const answer = question.answers.find(a => a.id === answerId);
    return answer?.is_correct || false;
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-slate-800/30 rounded-lg animate-pulse">
        <p className="text-center text-slate-400">Loading quiz questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-slate-800/30 rounded-lg">
        <p className="text-center text-red-400">Failed to load quiz questions. Please try again later.</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="p-6 bg-slate-800/30 rounded-lg">
        <p className="text-center text-slate-400">No questions available for this quiz.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Quiz</h3>
      
      <div className="space-y-8">
        {questions.map((question) => (
          <div key={question.id} className="bg-slate-700/20 p-4 rounded-lg">
            <h4 className="text-lg font-medium mb-3">{question.question_text}</h4>
            
            <Form {...form}>
              <FormField
                control={form.control}
                name={`question-${question.id}`}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleAnswerSelect(question.id, parseInt(value, 10));
                      }}
                      value={field.value}
                      className="space-y-2"
                    >
                      {question.answers.map((answer) => {
                        const isSelected = userAnswers[question.id] === answer.id;
                        const isCorrect = isAnswerCorrect(question.id, answer.id);
                        
                        let className = "flex items-start space-x-2 p-3 rounded-md";
                        
                        if (submitted && isSelected) {
                          className += isCorrect 
                            ? " bg-green-500/20 border border-green-500/40" 
                            : " bg-red-500/20 border border-red-500/40";
                        } else if (isSelected) {
                          className += " bg-blue-500/20 border border-blue-500/40";
                        } else {
                          className += " hover:bg-slate-700/30";
                        }
                        
                        return (
                          <div key={answer.id} className="relative">
                            <FormItem className={className}>
                              <FormControl>
                                <RadioGroupItem value={answer.id.toString()} />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {answer.answer_text}
                              </FormLabel>
                              
                              {submitted && isSelected && (
                                isCorrect ? (
                                  <CheckCircle className="absolute right-2 top-3 text-green-500" size={18} />
                                ) : (
                                  <XCircle className="absolute right-2 top-3 text-red-500" size={18} />
                                )
                              )}
                            </FormItem>
                            
                            {submitted && isSelected && !isCorrect && answer.explanation && (
                              <div className="mt-2 ml-8 p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-200">
                                <p>{answer.explanation}</p>
                              </div>
                            )}
                            
                            {submitted && isSelected && isCorrect && answer.explanation && (
                              <div className="mt-2 ml-8 p-3 bg-green-500/10 border border-green-500/20 rounded text-sm text-green-200">
                                <p>{answer.explanation}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </FormItem>
                )}
              />
            </Form>
          </div>
        ))}
      </div>
      
      {!submitted && (
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSubmit}
            disabled={Object.keys(userAnswers).length < questions.length}
          >
            Submit Answers
          </Button>
        </div>
      )}
      
      {submitted && (
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={() => {
              setSubmitted(false);
              setUserAnswers({});
              form.reset();
            }}
            variant="outline"
          >
            Retry Quiz
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizComponent;
