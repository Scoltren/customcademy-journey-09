
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen,
  Settings, 
  User, 
  LogOut,
  Clock, 
  BarChart,
  Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
        <h3 className="font-bold text-white mb-4">Your Interests</h3>
        
        {userInterests.length > 0 ? (
          <div className="mb-4">
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
          <div className="text-slate-400 text-sm mb-4">
            <p>You haven't selected any interests yet.</p>
            <button 
              onClick={handleEditInterests}
              className="mt-2 px-3 py-1 bg-blue text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
            >
              Select Interests
            </button>
          </div>
        )}
        
        <h3 className="font-bold text-white mb-4 mt-6">Learning Stats</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Total Courses</span>
              <span className="text-white font-medium">{enrolledCourses.length}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: '100%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">In Progress</span>
              <span className="text-white font-medium">
                {enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length}
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${(enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length / Math.max(1, enrolledCourses.length)) * 100}%` 
                }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Completed</span>
              <span className="text-white font-medium">
                {enrolledCourses.filter(c => c.progress === 100).length}
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${(enrolledCourses.filter(c => c.progress === 100).length / Math.max(1, enrolledCourses.length)) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
