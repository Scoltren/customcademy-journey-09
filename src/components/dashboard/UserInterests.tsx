
import React from 'react';
import { Edit } from 'lucide-react';

interface UserInterestsProps {
  userInterests: any[];
  handleEditInterests: () => void;
}

const UserInterests = ({ userInterests, handleEditInterests }: UserInterestsProps) => {
  return (
    <div className="mb-4">
      {userInterests.length > 0 ? (
        <div>
          <div className="flex flex-wrap gap-2">
            {userInterests.map((interest) => (
              <div 
                key={interest.category_id} 
                className="py-1 px-3 rounded-full bg-blue/10 text-blue-light border border-blue/20 text-sm"
              >
                {interest.category?.name || 'Unknown'}
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
