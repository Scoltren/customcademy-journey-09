
import React from 'react';
import { Loader2 } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calculateDifficultyLevel } from '@/hooks/quiz/utils/calculateDifficultyLevel';

interface QuizResult {
  id: number;
  quiz_id: number;
  score: number;
  user_id: string;
  quiz?: {
    title: string;
    category?: {
      name: string;
    }
  }
}

interface QuizResultsTabProps {
  quizResults: QuizResult[];
  isLoading: boolean;
}

const QuizResultsTab: React.FC<QuizResultsTabProps> = ({ quizResults, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!quizResults || quizResults.length === 0) {
    return (
      <div className="py-8 text-center bg-slate-800/50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">No Quiz Results Yet</h2>
        <p className="text-gray-400">
          Take quizzes to test your knowledge and see your results here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Quiz Results</h2>
      
      <div className="bg-slate-800/50 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-base font-medium pl-3">Quiz</TableHead>
              <TableHead className="text-base font-medium pl-3">Category</TableHead>
              <TableHead className="text-base font-medium pl-3">Score</TableHead>
              <TableHead className="text-base font-medium pl-3">Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizResults.map(result => {
              const skillLevel = calculateDifficultyLevel(result.score);
              const categoryName = result.quiz?.category?.name || 'Unknown';
              
              return (
                <TableRow key={result.id}>
                  <TableCell className="text-base font-medium text-white pl-3">
                    {result.quiz?.title || 'Unnamed Quiz'}
                  </TableCell>
                  <TableCell className="text-base pl-3">
                    {categoryName}
                  </TableCell>
                  <TableCell className="text-base pl-3">
                    {result.score}
                  </TableCell>
                  <TableCell className="pl-3">
                    <span className={`text-base font-semibold ${
                      skillLevel === 'Beginner' ? 'text-green-400' :
                      skillLevel === 'Intermediate' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {skillLevel}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default QuizResultsTab;
