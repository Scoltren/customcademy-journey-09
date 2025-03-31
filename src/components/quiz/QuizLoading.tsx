
import React from "react";
import { Loader2 } from "lucide-react";

const QuizLoading: React.FC = () => {
  return (
    <div className="text-center text-white">
      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
      <p className="text-xl">Loading quiz...</p>
    </div>
  );
};

export default QuizLoading;
