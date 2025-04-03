
import React from "react";
import CategoryQuizContainer from "./quiz/CategoryQuizContainer";
import { Card } from "@/components/ui/card";

/**
 * Main entry point for the category quiz feature
 * Wraps the container in a full-page layout without navbar/footer
 */
const CategoryQuiz = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 flex items-center justify-center py-10">
      <div className="w-full max-w-3xl px-4">
        <Card className="backdrop-blur-sm bg-slate-950 border-slate-800 shadow-xl overflow-hidden">
          <CategoryQuizContainer />
        </Card>
      </div>
    </div>
  );
};

export default CategoryQuiz;
