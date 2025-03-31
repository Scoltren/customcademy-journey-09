
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen,
  Settings, 
  User, 
  LogOut,
  Clock, 
  BarChart,
  Edit,
  PenTool
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import UserInterests from './UserInterests';
import LearningStats from './LearningStats';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userInterests: any[];
  enrolledCourses: any[];
  handleEditInterests: () => void;
}

const DashboardSidebar = ({ 
  activeTab, 
  setActiveTab, 
  userInterests,
  enrolledCourses,
  handleEditInterests
}: SidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userBio, setUserBio] = React.useState<string>('');
  const [profilePicture, setProfilePicture] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    // Fetch user bio and profile picture from database
    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('bio, profile_picture')
          .eq('auth_user_id', user?.id)
          .single();
        
        if (data) {
          setUserBio(data.bio || '');
          setProfilePicture(data.profile_picture);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    if (user) {
      fetchUserProfile();
    }
  }, [user]);
  
  const navItems = [
    { id: 'my-learning', label: 'My Learning', icon: BookOpen },
    { id: 'quiz-results', label: 'Quiz Results', icon: BarChart },
    { id: 'created-courses', label: 'Created Courses', icon: PenTool },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };
  
  return (
    <aside className="lg:w-64 flex-shrink-0">
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden mb-4 bg-gray-700">
            {profilePicture ? (
              <Avatar className="w-full h-full">
                <AvatarImage src={profilePicture} alt="Profile picture" className="w-full h-full object-cover" />
                <AvatarFallback>
                  <User size={32} className="text-gray-400" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={32} className="text-gray-400" />
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold text-white">{user?.user_metadata?.username || user?.email}</h2>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          {userBio && (
            <p className="text-slate-400 text-sm mt-2 text-center italic">
              "{userBio}"
            </p>
          )}
          <p className="text-slate-500 text-xs mt-2">
            Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
          </p>
        </div>
        
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={cn(
                "flex items-center gap-3 w-full p-3 rounded-lg transition-colors",
                activeTab === item.id 
                  ? "bg-blue text-white" 
                  : "text-slate-300 hover:bg-slate-800"
              )}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
          
          <button 
            className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors mt-8"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      <div className="hidden lg:block glass-card p-6">
        <UserInterests 
          userInterests={userInterests} 
          handleEditInterests={handleEditInterests} 
        />
        
        <LearningStats enrolledCourses={enrolledCourses} />
      </div>
    </aside>
  );
};

export default DashboardSidebar;
