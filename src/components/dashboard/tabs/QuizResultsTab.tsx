
import React from 'react';
import { Loader2, BookOpen, Book } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface QuizResult {
  id: number;
  quiz_id: number;
  score: number;
  user_id: string;
  quiz?: {
    title: string;
    category_id: number;
    category?: {
      name: string;
    }
  }
  // Additional fields for the join
  origin?: 'category' | 'course';
  origin_name?: string;
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

  // Group results by category
  const groupedResults: {[key: string]: QuizResult[]} = {};
  
  quizResults.forEach(result => {
    const categoryName = result.quiz?.category?.name || 'Uncategorized';
    if (!groupedResults[categoryName]) {
      groupedResults[categoryName] = [];
    }
    groupedResults[categoryName].push(result);
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Quiz Results</h2>
      
      <div className="space-y-6">
        {Object.entries(groupedResults).map(([categoryName, results]) => (
          <div key={categoryName} className="bg-slate-800/50 rounded-lg overflow-hidden">
            <div className="bg-slate-700/50 px-6 py-3">
              <h3 className="font-semibold text-lg">{categoryName}</h3>
            </div>
            
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map(result => {
                    // Calculate skill level based on score
                    let skillLevel = 'Beginner';
                    if (result.score >= 8) {
                      skillLevel = 'Advanced';
                    } else if (result.score >= 5) {
                      skillLevel = 'Intermediate';
                    }
                    
                    // Determine if quiz is from a course or category
                    const originIcon = result.origin === 'course' ? 
                      <BookOpen className="h-4 w-4 mr-1" /> : 
                      <Book className="h-4 w-4 mr-1" />;
                    
                    const originText = result.origin_name || 
                      (result.quiz?.category?.name ? `Category: ${result.quiz.category.name}` : 'Unknown');
                    
                    return (
                      <TableRow key={result.id}>
                        <TableCell>{result.quiz?.title || `Quiz #${result.quiz_id}`}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {originIcon}
                            <span>{originText}</span>
                          </div>
                        </TableCell>
                        <TableCell>{result.score}</TableCell>
                        <TableCell>
                          <span className={
                            skillLevel === 'Beginner' ? 'text-green-400' :
                            skillLevel === 'Intermediate' ? 'text-yellow-400' : 'text-red-400'
                          }>
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
        ))}
      </div>
    </div>
  );
};

export default QuizResultsTab;
