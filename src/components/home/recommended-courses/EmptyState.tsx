
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  hasInterests: boolean;
}

/**
 * Component shown when there are no recommended courses
 */
const EmptyState: React.FC<EmptyStateProps> = ({ hasInterests }) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-slate-50 dark:bg-gray-800 rounded-lg p-6 text-center">
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {hasInterests 
          ? "No courses match your interests yet" 
          : "Select interests to get course recommendations"}
      </p>
      <Button 
        onClick={() => hasInterests 
          ? navigate('/courses') 
          : navigate('/select-interests')}
      >
        {hasInterests ? "Browse All Courses" : "Select Interests"}
      </Button>
    </div>
  );
};

export default EmptyState;
