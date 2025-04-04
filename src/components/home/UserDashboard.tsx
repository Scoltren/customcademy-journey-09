
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import UserInterestsSection from './UserInterestsSection';
import RecommendedCoursesSection from './RecommendedCoursesSection';

interface UserDashboardProps {
  userId: string;
}

/**
 * Main dashboard component for logged-in users
 */
const UserDashboard: React.FC<UserDashboardProps> = ({ userId }) => {
  // State to store user's interest category IDs
  const [userInterestIds, setUserInterestIds] = useState<number[]>([]);
  
  // Fetch user interests when component mounts or userId changes
  useEffect(() => {
    fetchUserInterestIds();
  }, [userId]);

  /**
   * Fetches the user's interests from the database
   */
  const fetchUserInterestIds = async () => {
    try {
      // Query user interests from Supabase
      const { data, error } = await supabase
        .from('user_interest_categories')
        .select('category_id')
        .eq('user_id', userId);

      if (error) throw error;
      // Extract category IDs from result
      setUserInterestIds(data?.map(item => item.category_id) || []);
    } catch (error: any) {
      // Error is handled silently
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Display user interests section */}
      <UserInterestsSection userId={userId} />
      {/* Display recommended courses based on user interests */}
      <RecommendedCoursesSection userId={userId} userInterests={userInterestIds} />
    </div>
  );
};

export default UserDashboard;
