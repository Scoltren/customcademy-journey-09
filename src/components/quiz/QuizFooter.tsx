
import React from "react";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type QuizFooterProps = {
  score: number;
  showFeedback: boolean;
  selectedAnswerIds: number[];
  isSaving: boolean;
  isLastQuestion: boolean;
  isLastQuiz: boolean;
  onSubmitAnswer: () => void;
  onNextQuestion: () => void;
};

const QuizFooter: React.FC<QuizFooterProps> = ({
  score,
  showFeedback,
  selectedAnswerIds,
  isSaving,
  isLastQuestion,
  isLastQuiz,
  onSubmitAnswer,
  onNextQuestion,
}) => {
  let nextButtonText = "Next Question";
  if (isLastQuestion && isLastQuiz) {
    nextButtonText = "Finish Quiz";
  } else if (isLastQuestion) {
    nextButtonText = "Next Quiz";
  }

  return (
    <CardFooter className="flex justify-between border-t border-slate-800 pt-4">
      <div className="text-slate-400">
        {showFeedback && <p>Score: {score}</p>}
      </div>

      <div className="flex space-x-3">
        {!showFeedback ? (
          <Button
            onClick={onSubmitAnswer}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={selectedAnswerIds.length === 0 || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Submit Answer"
            )}
          </Button>
        ) : (
          <Button
            onClick={onNextQuestion}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isLastQuestion ? "Loading Next Quiz..." : "Loading..."}
              </>
            ) : (
              nextButtonText
            )}
          </Button>
        )}
      </div>
    </CardFooter>
  );
};

export default QuizFooter;
