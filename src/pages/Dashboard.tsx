
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
import { supabase } from '@/integrations/supabase/client';
import { Course, Comment, Chapter } from '@/types/course';
import { toast } from 'sonner';

interface UserInterest {
  category_id: number;
  user_id: string;
  category?: {
    name: string;
  }
}

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
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('my-learning');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [enrolledCourses, setEnrolledCourses] = useState<(Course & {progress: number, completedChapters: number, totalChapters: number})[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  
  const navItems = [
    { id: 'my-learning', label: 'My Learning', icon: BookOpen },
    { id: 'quiz-results', label: 'Quiz Results', icon: BarChart },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchUserData();
  }, [user, activeTab]);
  
  const fetchUserData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch user interests with category names
      const { data: interests, error: interestsError } = await supabase
        .from('user_interest_categories')
        .select('*, category:categories(name)')
        .eq('user_id', user?.id || '');
      
      if (interestsError) throw interestsError;
      setUserInterests(interests || []);
      
      // Fetch enrolled courses with progress
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscribed_courses')
        .select('*, course:course_id(id, title, description, thumbnail, difficulty_level, media, course_time, creator_id, overall_rating, price, category_id, created_at)')
        .eq('user_id', user?.id || '');
      
      if (subscriptionsError) throw subscriptionsError;
      
      if (subscriptions && subscriptions.length > 0) {
        const coursesWithDetails = await Promise.all(
          subscriptions.map(async (sub) => {
            const { data: chapters, error: chaptersError } = await supabase
              .from('chapters')
              .select('*')
              .eq('course_id', sub.course_id);
            
            if (chaptersError) throw chaptersError;
            
            // Make sure we maintain all the Course properties while adding our custom ones
            return {
              ...sub.course,
              progress: sub.progress || 0,
              completedChapters: Math.floor((chapters?.length || 0) * ((sub.progress || 0) / 100)),
              totalChapters: chapters?.length || 0
            };
          })
        );
        
        setEnrolledCourses(coursesWithDetails);
      } else {
        setEnrolledCourses([]);
      }
      
      // Fetch quiz results
      const { data: quizzes, error: quizzesError } = await supabase
        .from('user_quiz_results')
        .select('*, quiz:quiz_id(title, category_id, category:category_id(name))')
        .eq('user_id', user?.id || '');
      
      if (quizzesError) throw quizzesError;
      setQuizResults(quizzes || []);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load your data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      setChangingPassword(true);
      
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });
      
      if (signInError) {
        toast.error('Current password is incorrect');
        return;
      }
      
      // Then update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) throw updateError;
      
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };
  
  const handleEditInterests = () => {
    navigate('/select-interests');
  };
  
  const getAverageScore = () => {
    if (quizResults.length === 0) return 0;
    const totalScore = quizResults.reduce((acc, quiz) => acc + (quiz.score || 0), 0);
    return Math.round(totalScore / quizResults.length);
  };
  
  const getTotalQuestions = () => {
    return quizResults.length;
  };
  
  if (!user) {
    return null; // Will redirect to login in useEffect
  }
  
  return (
    <div className="min-h-screen bg-midnight">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="glass-card p-6 mb-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-4 bg-gray-700">
                    {/* User avatar placeholder */}
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={32} className="text-gray-400" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-white">{user.user_metadata?.username || user.email}</h2>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Member since {new Date(user.created_at).toLocaleDateString()}
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
            
            {/* Main Content */}
            <div className="flex-grow">
              {/* My Learning Tab */}
              {activeTab === 'my-learning' && (
                <div>
                  <h1 className="heading-lg mb-6">My Learning</h1>
                  
                  {isLoading ? (
                    <div className="glass-card p-6 text-center">
                      <p className="text-white">Loading your courses...</p>
                    </div>
                  ) : enrolledCourses.length > 0 ? (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white">Your Courses</h2>
                        <Link to="/courses" className="text-blue-light hover:text-blue flex items-center gap-1">
                          Find more courses
                        </Link>
                      </div>
                      
                      <div className="space-y-6">
                        {enrolledCourses.map((course) => (
                          <div key={course.id} className="glass-card overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                              <div className="md:w-1/3 h-48 md:h-auto">
                                <img 
                                  src={course.thumbnail || '/placeholder.svg'} 
                                  alt={course.title} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              
                              <div className="p-6 flex-grow">
                                <div className="flex flex-col md:flex-row justify-between mb-4">
                                  <div>
                                    <h3 className="text-xl font-bold text-white mb-1">
                                      <Link to={`/course/${course.id}`} className="hover:text-blue-light transition-colors">
                                        {course.title}
                                      </Link>
                                    </h3>
                                    <p className="text-slate-400">{course.difficulty_level || 'All Levels'}</p>
                                  </div>
                                </div>
                                
                                <div className="mb-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-slate-400">Progress</span>
                                    <span className="text-white">{course.progress}%</span>
                                  </div>
                                  <div className="progress-bar">
                                    <div 
                                      className="progress-bar-fill" 
                                      style={{ width: `${course.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <BookOpen size={16} className="text-blue-light" />
                                    <span className="text-slate-300">
                                      {course.completedChapters}/{course.totalChapters} lessons
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock size={16} className="text-blue-light" />
                                    <span className="text-slate-300">
                                      {course.course_time || course.totalChapters} minutes
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="mt-6 flex gap-3">
                                  <Link 
                                    to={`/course/${course.id}/learn`}
                                    className="button-primary py-2 px-4"
                                  >
                                    Continue Learning
                                  </Link>
                                  <Link 
                                    to={`/course/${course.id}`}
                                    className="button-secondary py-2 px-4"
                                  >
                                    Course Details
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card p-8 text-center">
                      <h3 className="text-xl font-bold text-white mb-3">You haven't enrolled in any courses yet</h3>
                      <p className="text-slate-400 mb-6">Explore our course catalog to find something that interests you</p>
                      <Link to="/courses" className="button-primary py-2 px-6">Browse Courses</Link>
                    </div>
                  )}
                  
                  {/* Your Interests Section */}
                  <div className="mt-8 lg:hidden">
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
                  </div>
                </div>
              )}
              
              {/* Quiz Results Tab */}
              {activeTab === 'quiz-results' && (
                <div>
                  <h1 className="heading-lg mb-6">Quiz Results</h1>
                  
                  {isLoading ? (
                    <div className="glass-card p-6 text-center">
                      <p className="text-white">Loading your quiz results...</p>
                    </div>
                  ) : quizResults.length > 0 ? (
                    <>
                      <div className="glass-card p-6 mb-8">
                        <h2 className="text-xl font-bold text-white mb-4">Performance Summary</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="bg-navy/50 rounded-lg p-4 text-center">
                            <h3 className="text-slate-400 mb-2">Average Score</h3>
                            <p className="text-3xl font-bold text-white">
                              {getAverageScore()}%
                            </p>
                          </div>
                          
                          <div className="bg-navy/50 rounded-lg p-4 text-center">
                            <h3 className="text-slate-400 mb-2">Quizzes Taken</h3>
                            <p className="text-3xl font-bold text-white">{quizResults.length}</p>
                          </div>
                          
                          <div className="bg-navy/50 rounded-lg p-4 text-center">
                            <h3 className="text-slate-400 mb-2">Total Questions</h3>
                            <p className="text-3xl font-bold text-white">
                              {getTotalQuestions()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <h2 className="text-2xl font-bold text-white mb-4">Quiz History</h2>
                      <div className="space-y-4">
                        {quizResults.map((quiz) => (
                          <div key={quiz.id} className="glass-card p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                              <div>
                                <h3 className="text-xl font-bold text-white mb-1">{quiz.quiz?.title || 'Quiz'}</h3>
                                <div className="flex gap-3 mb-3">
                                  <span className="text-sm py-1 px-3 rounded-full bg-blue/10 text-blue-light border border-blue/20">
                                    {quiz.quiz?.category?.name || 'General'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="bg-navy/50 rounded-full h-24 w-24 flex flex-col items-center justify-center">
                                <span className="text-sm text-slate-400">Score</span>
                                <span className="text-2xl font-bold text-white">{quiz.score}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="glass-card p-8 text-center">
                      <h3 className="text-xl font-bold text-white mb-3">You haven't taken any quizzes yet</h3>
                      <p className="text-slate-400 mb-6">Take quizzes to test your knowledge and track your progress</p>
                      <Link to="/courses" className="button-primary py-2 px-6">Find Courses with Quizzes</Link>
                    </div>
                  )}
                </div>
              )}
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h1 className="heading-lg mb-6">Profile</h1>
                  
                  <div className="glass-card p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="w-full md:w-1/3 flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-gray-700 flex items-center justify-center">
                          <User size={48} className="text-gray-400" />
                        </div>
                        <button className="button-secondary py-2 w-full">Change Photo</button>
                      </div>
                      
                      <div className="w-full md:w-2/3">
                        <h2 className="text-xl font-bold text-white mb-4">Profile Information</h2>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-slate-400 mb-2">Username</label>
                            <p className="p-3 rounded-lg bg-navy border border-slate-700 text-white">
                              {user.user_metadata?.username || 'Not set'}
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-slate-400 mb-2">Email</label>
                            <p className="p-3 rounded-lg bg-navy border border-slate-700 text-white">
                              {user.email}
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-slate-400 mb-2">Account Created</label>
                            <p className="p-3 rounded-lg bg-navy border border-slate-700 text-white">
                              {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Your Interests Section */}
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-white">Your Interests</h2>
                      <button 
                        onClick={handleEditInterests}
                        className="text-blue-light hover:text-blue-400 flex items-center gap-1"
                      >
                        <Edit size={14} className="mr-1" />
                        Edit your interests
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
                </div>
              )}
              
              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <h1 className="heading-lg mb-6">Settings</h1>
                  
                  <div className="space-y-8">
                    <div className="glass-card p-6">
                      <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
                      
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                          <label className="block text-slate-400 mb-2">Current Password</label>
                          <input 
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg bg-navy border border-slate-700 text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-2">New Password</label>
                          <input 
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg bg-navy border border-slate-700 text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-2">Confirm New Password</label>
                          <input 
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg bg-navy border border-slate-700 text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
                          />
                        </div>
                        <div>
                          <button 
                            type="submit" 
                            className="button-primary py-2 px-6" 
                            disabled={changingPassword}
                          >
                            {changingPassword ? 'Updating...' : 'Update Password'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
