
export interface Category {
  id: number;
  name: string;
  quiz_id: number | null;
}

export interface Question {
  id: number;
  question_text: string;
  quiz_id: number;
  multiple_correct?: boolean;
}

export interface Answer {
  id: number;
  answer_text: string;
  question_id: number;
  explanation?: string;
  points: number | null;
}

export interface QuizState {
  currentQuizIndex: number;
  currentQuestionIndex: number;
  questions: Question[];
  answers: Answer[][];
  selectedAnswers: Record<number, number[]>;
  quizScores: Record<number, number>;
}
