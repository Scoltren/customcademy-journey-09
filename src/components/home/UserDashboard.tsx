
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
  const [userInterestIds, setUserInterestIds] = useState<number[]>([]);
  
  useEffect(() => {
    fetchUserInterestIds();
  }, [userId]);

  /**
   * Fetches the user's interests from the database
   */
  const fetchUserInterestIds = async () => {
    try {
      const { data, error } = await supabase
        .from('user_interest_categories')
        .select('category_id')
        .eq('user_id', userId);

      if (error) throw error;
      setUserInterestIds(data?.map(item => item.category_id) || []);
    } catch (error: any) {
      // Error is handled silently
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <UserInterestsSection userId={userId} />
      <RecommendedCoursesSection userId={userId} userInterests={userInterestIds} />
    </div>
  );
};

export default UserDashboard;
