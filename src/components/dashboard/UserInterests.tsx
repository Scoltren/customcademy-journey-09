
import React from 'react';
import { Edit } from 'lucide-react';

interface UserInterestsProps {
  userInterests: any[];
  handleEditInterests: () => void;
}

const UserInterests = ({ userInterests, handleEditInterests }: UserInterestsProps) => {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Your Interests</h2>
        <button 
          onClick={handleEditInterests}
          className="text-blue-light hover:text-blue-400 flex items-center gap-1 text-sm"
        >
          <Edit size={14} />
          Edit
        </button>
      </div>
      
      {userInterests.length > 0 ? (
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
      ) : (
        <div className="text-slate-400">
          <p>You haven't selected any interests yet.</p>
          <button 
            onClick={handleEditInterests}
            className="mt-2 px-4 py-1.5 bg-blue text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
          >
            Select Interests
          </button>
        </div>
      )}
    </div>
  );
};

export default UserInterests;
