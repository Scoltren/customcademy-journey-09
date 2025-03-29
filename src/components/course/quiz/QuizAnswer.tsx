
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface Answer {
  id: number;
  answer_text: string;
  points: number;
  explanation: string | null;
}

interface QuizAnswerProps {
  answer: Answer;
  isSelected: boolean;
  wasSubmitted: boolean;
  showResults: boolean;
  question: {
    multiple_correct?: boolean;
  };
  onSelect: (answerId: number) => void;
}

const QuizAnswer: React.FC<QuizAnswerProps> = ({
  answer,
  isSelected,
  wasSubmitted,
  showResults,
  question,
  onSelect,
}) => {
  const isCorrect = answer.points > 0;
  
  return (
    <div 
      key={answer.id} 
      className={`
        p-3 rounded-lg border transition-colors cursor-pointer
        ${showResults 
          ? wasSubmitted 
            ? isCorrect 
              ? 'border-green-500 bg-green-500/10' 
              : 'border-red-500 bg-red-500/10'
            : isCorrect 
              ? 'border-green-500 bg-green-500/10' 
              : 'border-slate-700 bg-transparent'
          : isSelected 
            ? 'border-blue-400 bg-blue-400/10' 
            : 'border-slate-700 hover:border-blue-400/50'
        }
      `}
      onClick={() => !showResults && onSelect(answer.id)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div 
            className={`
              w-5 h-5 rounded ${question.multiple_correct ? 'rounded-md' : 'rounded-full'} border flex items-center justify-center
              ${showResults 
                ? wasSubmitted 
                  ? isCorrect 
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
                isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />
              ) : null
            ) : (
              isSelected && <div className={`${question.multiple_correct ? 'w-2 h-2' : 'w-3 h-3'} bg-white ${question.multiple_correct ? 'rounded-sm' : 'rounded-full'}`}></div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <p className={`
            ${showResults && isCorrect ? 'font-medium' : ''}
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
};

export default QuizAnswer;
