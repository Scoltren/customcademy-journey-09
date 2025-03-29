
import React from 'react';
import QuizAnswer from './QuizAnswer';

interface Question {
  id: number;
  question_text: string;
  multiple_correct?: boolean;
  answers: Answer[];
}

interface Answer {
  id: number;
  answer_text: string;
  points: number;
  explanation: string | null;
}

interface QuizQuestionProps {
  question: Question;
  index: number;
  selectedAnswers: {[key: number]: number[]};
  submittedAnswers: {[key: number]: number[]};
  showResults: boolean;
  onAnswerSelect: (questionId: number, answerId: number) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  index,
  selectedAnswers,
  submittedAnswers,
  showResults,
  onAnswerSelect,
}) => {
  return (
    <div key={question.id} className="mb-8">
      <h4 className="text-lg font-medium mb-3">
        {index + 1}. {question.question_text}
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
          
          return (
            <QuizAnswer
              key={answer.id}
              answer={answer}
              isSelected={isSelected}
              wasSubmitted={wasSubmitted}
              showResults={showResults}
              question={question}
              onSelect={(answerId) => onAnswerSelect(question.id, answerId)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default QuizQuestion;
