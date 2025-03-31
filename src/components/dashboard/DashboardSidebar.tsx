
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
            <div className="w-full h-full flex items-center justify-center">
              <User size={32} className="text-gray-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white">{user?.user_metadata?.username || user?.email}</h2>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          <p className="text-slate-500 text-xs mt-1">
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
