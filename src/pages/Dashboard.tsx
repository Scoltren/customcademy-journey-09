
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Home, 
  Settings, 
  User, 
  LogOut, 
  Clock, 
  Award, 
  Star, 
  Heart, 
  ShoppingCart, 
  ChevronRight,
  BarChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Sample user data
const userData = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  memberSince: 'January 2023',
  enrolledCourses: [
    {
      id: '1',
      title: 'Advanced Web Development Masterclass 2023',
      instructor: 'Dr. Sarah Mitchell',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80',
      progress: 68,
      lastAccessed: '2 days ago',
      category: 'Web Development',
      totalLessons: 48,
      completedLessons: 32
    },
    {
      id: '2',
      title: 'Machine Learning for Beginners',
      instructor: 'Prof. Alex Johnson',
      image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      progress: 25,
      lastAccessed: '1 week ago',
      category: 'Data Science',
      totalLessons: 36,
      completedLessons: 9
    },
    {
      id: '3',
      title: 'Digital Marketing Fundamentals',
      instructor: 'Emma Rodriguez',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80',
      progress: 92,
      lastAccessed: 'Yesterday',
      category: 'Marketing',
      totalLessons: 25,
      completedLessons: 23
    }
  ],
  wishlist: [
    {
      id: '4',
      title: 'The Complete Mobile App Development',
      instructor: 'David Chen',
      image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
      price: 79.99,
      category: 'Mobile Development',
      rating: 4.8
    },
    {
      id: '5',
      title: 'Cybersecurity Essentials',
      instructor: 'Michael Thompson',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      price: 99.99,
      category: 'Cybersecurity',
      rating: 4.6
    }
  ],
  certificates: [
    {
      id: 'cert-1',
      title: 'Responsive Web Design',
      issueDate: 'June 10, 2023',
      image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80'
    },
    {
      id: 'cert-2',
      title: 'JavaScript Algorithms and Data Structures',
      issueDate: 'August 25, 2023',
      image: 'https://images.unsplash.com/photo-1568952433726-3896e3881c65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    }
  ],
  quizResults: [
    {
      id: 'quiz-1',
      title: 'Web Development Assessment',
      score: 92,
      totalQuestions: 25,
      category: 'Web Development',
      level: 'Intermediate'
    },
    {
      id: 'quiz-2',
      title: 'Python Fundamentals',
      score: 85,
      totalQuestions: 20,
      category: 'Programming',
      level: 'Beginner'
    },
    {
      id: 'quiz-3',
      title: 'Data Science Concepts',
      score: 78,
      totalQuestions: 30,
      category: 'Data Science',
      level: 'Advanced'
    }
  ]
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('my-learning');
  
  const navItems = [
    { id: 'my-learning', label: 'My Learning', icon: BookOpen },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'quiz-results', label: 'Quiz Results', icon: BarChart },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];
  
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
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
                    <img 
                      src={userData.avatar} 
                      alt={userData.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-white">{userData.name}</h2>
                  <p className="text-slate-400 text-sm">{userData.email}</p>
                  <p className="text-slate-500 text-xs mt-1">Member since {userData.memberSince}</p>
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
                  
                  <button className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors mt-8">
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
              
              <div className="hidden lg:block glass-card p-6">
                <h3 className="font-bold text-white mb-4">Learning Stats</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400">Total Courses</span>
                      <span className="text-white font-medium">{userData.enrolledCourses.length}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400">In Progress</span>
                      <span className="text-white font-medium">2</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: '66%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400">Completed</span>
                      <span className="text-white font-medium">1</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: '33%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400">Certificates Earned</span>
                      <span className="text-white font-medium">{userData.certificates.length}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${(userData.certificates.length / 3) * 100}%` }}></div>
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
                  
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-white">In Progress</h2>
                      <Link to="/courses" className="text-blue-light hover:text-blue flex items-center gap-1">
                        Find more courses <ChevronRight size={16} />
                      </Link>
                    </div>
                    
                    <div className="space-y-6">
                      {userData.enrolledCourses.map((course) => (
                        <div key={course.id} className="glass-card overflow-hidden">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/3 h-48 md:h-auto">
                              <img 
                                src={course.image} 
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
                                  <p className="text-slate-400">{course.instructor}</p>
                                </div>
                                
                                <div className="mt-3 md:mt-0 flex items-center">
                                  <span className="text-slate-400 text-sm mr-2">Last accessed:</span>
                                  <span className="text-white">{course.lastAccessed}</span>
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
                                    {course.completedLessons}/{course.totalLessons} lessons
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock size={16} className="text-blue-light" />
                                  <span className="text-slate-300">
                                    {Math.round(course.totalLessons * 0.75)} hours left
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
                </div>
              )}
              
              {/* Certificates Tab */}
              {activeTab === 'certificates' && (
                <div>
                  <h1 className="heading-lg mb-6">My Certificates</h1>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userData.certificates.map((certificate) => (
                      <div key={certificate.id} className="glass-card overflow-hidden">
                        <div className="relative h-48">
                          <img 
                            src={certificate.image} 
                            alt={certificate.title} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-midnight to-transparent"></div>
                        </div>
                        
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white mb-2">{certificate.title}</h3>
                          <p className="text-slate-400 mb-4">Issued on {certificate.issueDate}</p>
                          
                          <div className="flex gap-3">
                            <button className="button-primary py-2">Download</button>
                            <button className="button-secondary py-2">Share</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {userData.certificates.length === 0 && (
                      <div className="glass-card p-6 col-span-2 text-center">
                        <h3 className="text-xl font-bold text-white mb-2">No Certificates Yet</h3>
                        <p className="text-slate-400 mb-4">Complete courses to earn certificates.</p>
                        <Link to="/courses" className="button-primary inline-block py-2">Explore Courses</Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div>
                  <h1 className="heading-lg mb-6">My Wishlist</h1>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userData.wishlist.map((course) => (
                      <div key={course.id} className="glass-card overflow-hidden">
                        <div className="h-48">
                          <img 
                            src={course.image} 
                            alt={course.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white mb-1">
                            <Link to={`/course/${course.id}`} className="hover:text-blue-light transition-colors">
                              {course.title}
                            </Link>
                          </h3>
                          <p className="text-slate-400 mb-3">{course.instructor}</p>
                          
                          <div className="flex items-center mb-4">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={16}
                                  className={i < Math.floor(course.rating) ? "text-yellow-500 fill-yellow-500" : "text-slate-600"}
                                />
                              ))}
                            </div>
                            <span className="text-white ml-2">{course.rating.toFixed(1)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl font-bold text-white">${course.price.toFixed(2)}</span>
                            <span className="text-sm py-1 px-3 rounded-full bg-blue/10 text-blue-light border border-blue/20">
                              {course.category}
                            </span>
                          </div>
                          
                          <div className="flex gap-3">
                            <button className="button-primary py-2 flex items-center gap-2">
                              <ShoppingCart size={16} />
                              Add to Cart
                            </button>
                            <button className="button-secondary py-2 text-blue-light">
                              <Heart size={16} className="fill-blue-light" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {userData.wishlist.length === 0 && (
                      <div className="glass-card p-6 col-span-2 text-center">
                        <h3 className="text-xl font-bold text-white mb-2">Your Wishlist is Empty</h3>
                        <p className="text-slate-400 mb-4">Save courses you're interested in to your wishlist for later.</p>
                        <Link to="/courses" className="button-primary inline-block py-2">Explore Courses</Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Quiz Results Tab */}
              {activeTab === 'quiz-results' && (
                <div>
                  <h1 className="heading-lg mb-6">Quiz Results</h1>
                  
                  <div className="glass-card p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">Performance Summary</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-navy/50 rounded-lg p-4 text-center">
                        <h3 className="text-slate-400 mb-2">Average Score</h3>
                        <p className="text-3xl font-bold text-white">
                          {Math.round(userData.quizResults.reduce((acc, quiz) => acc + quiz.score, 0) / userData.quizResults.length)}%
                        </p>
                      </div>
                      
                      <div className="bg-navy/50 rounded-lg p-4 text-center">
                        <h3 className="text-slate-400 mb-2">Quizzes Taken</h3>
                        <p className="text-3xl font-bold text-white">{userData.quizResults.length}</p>
                      </div>
                      
                      <div className="bg-navy/50 rounded-lg p-4 text-center">
                        <h3 className="text-slate-400 mb-2">Total Questions</h3>
                        <p className="text-3xl font-bold text-white">
                          {userData.quizResults.reduce((acc, quiz) => acc + quiz.totalQuestions, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-4">Quiz History</h2>
                  <div className="space-y-4">
                    {userData.quizResults.map((quiz) => (
                      <div key={quiz.id} className="glass-card p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">{quiz.title}</h3>
                            <div className="flex gap-3 mb-3">
                              <span className="text-sm py-1 px-3 rounded-full bg-blue/10 text-blue-light border border-blue/20">
                                {quiz.category}
                              </span>
                              <span className="text-sm py-1 px-3 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                {quiz.level}
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-navy/50 rounded-full h-24 w-24 flex flex-col items-center justify-center">
                            <span className="text-sm text-slate-400">Score</span>
                            <span className="text-2xl font-bold text-white">{quiz.score}%</span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400">Questions</span>
                            <span className="text-white">{quiz.totalQuestions} questions</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-bar-fill" 
                              style={{ 
                                width: `${quiz.score}%`,
                                background: quiz.score >= 90 ? 'linear-gradient(to right, #10b981, #047857)' :
                                           quiz.score >= 70 ? 'linear-gradient(to right, #3b82f6, #1d4ed8)' :
                                           quiz.score >= 50 ? 'linear-gradient(to right, #f59e0b, #d97706)' :
                                                            'linear-gradient(to right, #ef4444, #b91c1c)'
                              }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex gap-3">
                          <button className="button-primary py-2">View Details</button>
                          <button className="button-secondary py-2">Retake Quiz</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h1 className="heading-lg mb-6">Profile</h1>
                  
                  <div className="glass-card p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="w-full md:w-1/3 flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                          <img 
                            src={userData.avatar} 
                            alt={userData.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button className="button-secondary py-2 w-full">Change Photo</button>
                      </div>
                      
                      <div className="w-full md:w-2/3">
                        <h2 className="text-xl font-bold text-white mb-4">Personal Information</h2>
                        
                        <form className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-slate-400 mb-2">First Name</label>
                              <input 
                                type="text" 
                                defaultValue="Alex" 
                                className="w-full p-3 rounded-lg bg-navy border border-slate-700 text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 mb-2">Last Name</label>
                              <input 
                                type="text" 
                                defaultValue="Johnson" 
                                className="w-full p-3 rounded-lg bg-navy border border-slate-700 text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-slate-400 mb-2">Email</label>
                            <input 
                              type="email" 
                              defaultValue={userData.email} 
                              className="w-full p-3 rounded-lg bg-navy border border-slate-700 text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-slate-400 mb-2">Bio</label>
                            <textarea 
                              rows={4}
                              className="w-full p-3 rounded-lg bg-navy border border-slate-700 text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
                              defaultValue="Web developer with a passion for learning new technologies."
                            />
                          </div>
                          
                          <div>
                            <button type="submit" className="button-primary py-2 px-6">Save Changes</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Interests & Skills</h2>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-white mb-3">My Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        <div className="py-1 px-3 rounded-full bg-blue/10 text-blue-light border border-blue/20 text-sm">
                          Web Development
                        </div>
                        <div className="py-1 px-3 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20 text-sm">
                          Data Science
                        </div>
                        <div className="py-1 px-3 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-sm">
                          UI/UX Design
                        </div>
                        <button className="py-1 px-3 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600 text-sm hover:bg-slate-700 transition-colors">
                          + Add Interest
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-white mb-3">My Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        <div className="py-1 px-3 rounded-full bg-blue/10 text-blue-light border border-blue/20 text-sm">
                          HTML/CSS
                        </div>
                        <div className="py-1 px-3 rounded-full bg-blue/10 text-blue-light border border-blue/20 text-sm">
                          JavaScript
                        </div>
                        <div className="py-1 px-3 rounded-full bg-blue/10 text-blue-light border border-blue/20 text-sm">
                          React
                        </div>
                        <div className="py-1 px-3 rounded-full bg-blue/10 text-blue-light border border-blue/20 text-sm">
                          Python
                        </div>
                        <button className="py-1 px-3 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600 text-sm hover:bg-slate-700 transition-colors">
                          + Add Skill
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <h1 className="heading-lg mb-6">Settings</h1>
                  
                  <div className="space-y-8">
                    <div className="glass-card p-6">
                      <h2 className="text-xl font-bold text-white mb-4">Account Settings</h2>
                      
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-white mb-3">Change Password</h3>
                          <form className="space-y-4">
                            <div>
                              <label className="block text-slate-400 mb-2">Current Password</label>
                              <input 
                                type="password" 
                                className="w-full p-3 rounded-lg bg-navy border border-slate-700 text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 mb-2">New Password</label>
                              <input 
                                type="password" 
                                className="w-full p-3 rounded-lg bg-navy border border-slate-700 text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 mb-2">Confirm New Password</label>
                              <input 
                                type="password" 
                                className="w-full p-3 rounded-lg bg-navy border border-slate-700 text-white focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
                              />
                            </div>
                            <div>
                              <button type="submit" className="button-primary py-2 px-6">Update Password</button>
                            </div>
                          </form>
                        </div>
                        
                        <div className="pt-6 border-t border-slate-700">
                          <h3 className="text-lg font-medium text-white mb-3">Email Notifications</h3>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-white">Course Updates</p>
                                <p className="text-slate-400 text-sm">Receive updates about your enrolled courses</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
                              </label>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-white">Promotions</p>
                                <p className="text-slate-400 text-sm">Receive special offers and discounts</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
                              </label>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-white">Learning Reminders</p>
                                <p className="text-slate-400 text-sm">Get reminders to continue learning</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" defaultChecked className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="glass-card p-6">
                      <h2 className="text-xl font-bold text-white mb-4">Privacy Settings</h2>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">Profile Visibility</p>
                            <p className="text-slate-400 text-sm">Control who can see your profile</p>
                          </div>
                          <select className="bg-navy border border-slate-700 text-white rounded-lg p-2 focus:outline-none focus:border-blue">
                            <option>Everyone</option>
                            <option>Only Students</option>
                            <option>Only Friends</option>
                            <option>Private</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">Show Courses</p>
                            <p className="text-slate-400 text-sm">Show your enrolled courses on your profile</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">Share Learning Activity</p>
                            <p className="text-slate-400 text-sm">Share your learning progress with others</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="glass-card p-6">
                      <h2 className="text-xl font-bold text-white mb-4">Danger Zone</h2>
                      
                      <div className="space-y-4">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                          <h3 className="text-lg font-medium text-red-500 mb-2">Delete Account</h3>
                          <p className="text-slate-300 mb-4">
                            Once you delete your account, all of your data will be permanently removed. 
                            This action cannot be undone.
                          </p>
                          <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                            Delete Account
                          </button>
                        </div>
                      </div>
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
