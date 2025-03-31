
import React from 'react';
import { Edit } from 'lucide-react';

interface UserInterestsProps {
  userInterests: any[];
  handleEditInterests: () => void;
}

const UserInterests = ({ userInterests, handleEditInterests }: UserInterestsProps) => {
  // Function to determine the text color based on difficulty level
  const getDifficultyColor = (level: string | undefined) => {
    switch(level) {
      case 'Beginner':
        return 'text-green-500';
      case 'Intermediate':
        return 'text-yellow-500';
      case 'Advanced':
        return 'text-red-500';
      default:
        return 'text-xs opacity-70';
    }
  };

  // Function to get the appropriate background color for interest tags
  const getTagBackgroundColor = (level: string | undefined) => {
    switch(level) {
      case 'Beginner':
        return 'bg-green-500/10 border-green-500/20';
      case 'Intermediate':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'Advanced':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-blue/10 border-blue/20';
    }
  };

  return (
    <div className="mb-4">
      <h3 className="font-bold text-white mb-4">Your Interests</h3>
      
      {userInterests.length > 0 ? (
        <div>
          <div className="flex flex-wrap gap-2">
            {userInterests.map((interest) => (
              <div 
                key={interest.category_id} 
                className={`py-1 px-3 rounded-full text-blue-light border ${getTagBackgroundColor(interest.difficulty_level)} text-sm`}
              >
                <span>{interest.category?.name || 'Unknown'}</span>
                {interest.difficulty_level ? (
                  <span className={`ml-1 font-medium ${getDifficultyColor(interest.difficulty_level)}`}>
                    • {interest.difficulty_level}
                  </span>
                ) : (
                  <span className="ml-1 text-xs opacity-70">
                    • No level assigned
                  </span>
                )}
              </div>
            ))}
          </div>
          <button 
            onClick={handleEditInterests}
            className="mt-4 flex items-center gap-2 text-blue-light hover:text-blue-400 text-sm transition-colors"
          >
            <Edit size={14} />
            Edit your interests
          </button>
        </div>
      ) : (
        <div className="text-slate-400 text-sm">
          <p>You haven't selected any interests yet.</p>
          <button 
            onClick={handleEditInterests}
            className="mt-2 px-3 py-1 bg-blue text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
          >
            Select Interests
          </button>
        </div>
      )}
    </div>
  );
};

export default UserInterests;
