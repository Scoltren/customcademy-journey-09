
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Globe, 
  Award, 
  PlayCircle, 
  CheckCircle, 
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Heart,
  Share2,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Sample course data
const courseData = {
  id: '1',
  title: 'Advanced Web Development Masterclass 2023',
  description: 'Learn modern web development with the latest technologies. This comprehensive course covers frontend frameworks, backend development, databases, deployment strategies, and more. Master the skills needed to build professional, scalable web applications.',
  longDescription: `
    <p>This comprehensive course is designed to take your web development skills to the professional level. Whether you're looking to advance your career, build your own projects, or simply deepen your understanding of modern web technologies, this course provides everything you need.</p>
    
    <p>Over 40+ hours of content, you'll learn:</p>
    <ul>
      <li>Advanced HTML5 and CSS3 techniques for modern layouts</li>
      <li>JavaScript ES6+ features and best practices</li>
      <li>React.js for building dynamic user interfaces</li>
      <li>Node.js and Express for server-side development</li>
      <li>MongoDB and PostgreSQL database integration</li>
      <li>Authentication, authorization, and security best practices</li>
      <li>RESTful API design and implementation</li>
      <li>Testing, debugging, and performance optimization</li>
      <li>Deployment to various cloud platforms</li>
      <li>CI/CD pipelines for automated testing and deployment</li>
    </ul>
    
    <p>By the end of this course, you'll have built multiple portfolio-worthy projects that demonstrate your expertise in modern web development. You'll also receive a certificate of completion that you can share with potential employers or clients.</p>
  `,
  instructor: {
    name: 'Dr. Sarah Mitchell',
    bio: 'Full Stack Developer with 10+ years of experience. Former senior engineer at Google and current CTO at TechInnovate. PhD in Computer Science from MIT.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
    courses: 12,
    students: 45000,
    rating: 4.9
  },
  image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80',
  category: 'Web Development',
  level: 'Advanced',
  duration: '40 hours',
  students: 12543,
  rating: 4.9,
  reviews: 842,
  price: 89.99,
  sale_price: 69.99,
  language: 'English',
  last_updated: 'September 2023',
  features: [
    'Lifetime Access',
    '40 Hours of Video',
    '120+ Lessons',
    '15 Practical Projects',
    'Mobile & Desktop Access',
    'Certificate of Completion',
    'Premium Support'
  ],
  modules: [
    {
      title: 'Course Introduction',
      lessons: [
        { title: 'Welcome to the Course', duration: '5:23', preview: true },
        { title: 'Course Overview', duration: '8:42', preview: true },
        { title: 'Setting Up Your Development Environment', duration: '15:17', preview: false }
      ]
    },
    {
      title: 'Advanced HTML & CSS',
      lessons: [
        { title: 'Modern HTML5 Features', duration: '18:34', preview: false },
        { title: 'CSS Grid and Flexbox Mastery', duration: '23:12', preview: false },
        { title: 'Responsive Design Techniques', duration: '20:05', preview: false },
        { title: 'CSS Variables and Custom Properties', duration: '15:47', preview: false },
        { title: 'CSS Animations and Transitions', duration: '22:31', preview: false }
      ]
    },
    {
      title: 'JavaScript Essentials',
      lessons: [
        { title: 'ES6+ Features You Need to Know', duration: '28:14', preview: false },
        { title: 'Asynchronous JavaScript Deep Dive', duration: '32:47', preview: false },
        { title: 'Working with APIs', duration: '24:19', preview: false },
        { title: 'JavaScript Performance Optimization', duration: '19:58', preview: false }
      ]
    },
    {
      title: 'React.js Framework',
      lessons: [
        { title: 'React Core Concepts', duration: '25:34', preview: false },
        { title: 'Component Architecture', duration: '28:12', preview: false },
        { title: 'State Management with Redux', duration: '35:08', preview: false },
        { title: 'Hooks in Depth', duration: '30:22', preview: false },
        { title: 'Building a Complete React Application', duration: '45:19', preview: false }
      ]
    },
    {
      title: 'Backend Development',
      lessons: [
        { title: 'Node.js Fundamentals', duration: '26:47', preview: false },
        { title: 'RESTful API Design', duration: '22:39', preview: false },
        { title: 'Express.js Framework', duration: '28:13', preview: false },
        { title: 'Database Integration', duration: '33:42', preview: false },
        { title: 'Authentication and Authorization', duration: '35:11', preview: false }
      ]
    }
  ],
  reviews_list: [
    {
      id: 1,
      user: 'James Wilson',
      rating: 5,
      date: '2 months ago',
      comment: 'This course exceeded my expectations! The instructor explains complex concepts in an easy-to-understand way. I was able to build my own full-stack application by the end of the course.',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 2,
      user: 'Emily Parker',
      rating: 4,
      date: '3 months ago',
      comment: 'Great content and well-structured lessons. The projects are practical and relevant to real-world scenarios. I would have liked more exercises for practice, but overall it\'s excellent.',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 3,
      user: 'Michael Rodriguez',
      rating: 5,
      date: '1 month ago',
      comment: 'The best web development course I\'ve taken! Dr. Mitchell has a great teaching style and the course content is up-to-date with the latest industry practices. Highly recommended for anyone looking to level up their skills.',
      avatar: 'https://randomuser.me/api/portraits/men/67.jpg'
    }
  ],
  requirements: [
    'Basic knowledge of HTML, CSS, and JavaScript',
    'Understanding of programming fundamentals',
    'Familiar with the command line interface',
    'A computer with internet access (Windows, Mac, or Linux)'
  ],
  what_you_will_learn: [
    'Build modern, responsive websites with advanced HTML5 and CSS3',
    'Create dynamic user interfaces with React.js',
    'Develop server-side applications with Node.js and Express',
    'Work with both SQL and NoSQL databases',
    'Implement authentication and security best practices',
    'Deploy applications to various cloud platforms',
    'Optimize performance and debug effectively',
    'Build a portfolio of real-world projects'
  ]
};

const CourseDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedModules, setExpandedModules] = useState<number[]>([0]);
  
  const toggleModule = (index: number) => {
    if (expandedModules.includes(index)) {
      setExpandedModules(expandedModules.filter(i => i !== index));
    } else {
      setExpandedModules([...expandedModules, index]);
    }
  };
  
  // For demo purposes, we'll use the sample data regardless of the ID
  const course = courseData;
  
  // Generate stars for ratings
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={16}
            className={i < Math.floor(rating) ? "text-yellow-500 fill-yellow-500" : "text-slate-600"}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-midnight">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Course Header */}
        <section className="bg-navy/50 py-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Course Info */}
              <div className="lg:col-span-2">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="py-1 px-3 rounded-full bg-blue/10 text-blue-light border border-blue/20 text-xs font-medium">
                    {course.category}
                  </span>
                  <span className="py-1 px-3 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-medium">
                    {course.level}
                  </span>
                </div>
                
                <h1 className="heading-lg mb-4">{course.title}</h1>
                
                <p className="text-slate-300 mb-6">{course.description}</p>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img 
                        src={course.instructor.image} 
                        alt={course.instructor.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-white">{course.instructor.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {renderStars(course.rating)}
                    <span className="text-white ml-1">{course.rating.toFixed(1)}</span>
                    <span className="text-slate-400">({course.reviews} reviews)</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-blue-light" />
                    <span className="text-slate-300">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-blue-light" />
                    <span className="text-slate-300">{course.students.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-blue-light" />
                    <span className="text-slate-300">{course.language}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-blue-light" />
                    <span className="text-slate-300">{course.modules.length} modules</span>
                  </div>
                </div>
                
                <div className="block lg:hidden">
                  <div className="glass-card p-6 mb-8">
                    <div className="aspect-video w-full rounded-lg overflow-hidden mb-6">
                      <img 
                        src={course.image} 
                        alt={course.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        {course.sale_price ? (
                          <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-white">${course.sale_price.toFixed(2)}</span>
                            <span className="text-xl text-slate-400 line-through">${course.price.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="text-3xl font-bold text-white">${course.price.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="text-slate-400">Last updated: {course.last_updated}</div>
                    </div>
                    
                    <div className="flex flex-col gap-3 mb-6">
                      <button className="button-primary py-3 w-full flex items-center justify-center gap-2">
                        <ShoppingCart size={18} />
                        Enroll Now
                      </button>
                      <button className="button-secondary py-3 w-full flex items-center justify-center gap-2">
                        <PlayCircle size={18} />
                        Watch Preview
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <button className="flex items-center gap-2 text-slate-300 hover:text-blue-light transition-colors">
                        <Heart size={18} />
                        Wishlist
                      </button>
                      <button className="flex items-center gap-2 text-slate-300 hover:text-blue-light transition-colors">
                        <Share2 size={18} />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Course Purchase Card - Desktop */}
              <div className="hidden lg:block">
                <div className="glass-card p-6 sticky top-24">
                  <div className="aspect-video w-full rounded-lg overflow-hidden mb-6">
                    <img 
                      src={course.image} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <button className="w-16 h-16 rounded-full bg-blue/80 flex items-center justify-center">
                        <PlayCircle size={32} className="text-white" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {course.sale_price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-bold text-white">${course.sale_price.toFixed(2)}</span>
                          <span className="text-xl text-slate-400 line-through">${course.price.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="text-3xl font-bold text-white">${course.price.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="text-slate-400">Last updated: {course.last_updated}</div>
                  </div>
                  
                  <div className="flex flex-col gap-3 mb-6">
                    <button className="button-primary py-3 w-full flex items-center justify-center gap-2">
                      <ShoppingCart size={18} />
                      Enroll Now
                    </button>
                    <button className="button-secondary py-3 w-full flex items-center justify-center gap-2">
                      <PlayCircle size={18} />
                      Watch Preview
                    </button>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <h3 className="font-bold text-white mb-2">This course includes:</h3>
                    
                    {course.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-blue-light" />
                        <span className="text-slate-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button className="flex items-center gap-2 text-slate-300 hover:text-blue-light transition-colors">
                      <Heart size={18} />
                      Wishlist
                    </button>
                    <button className="flex items-center gap-2 text-slate-300 hover:text-blue-light transition-colors">
                      <Share2 size={18} />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Course Content */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                {/* Tabs */}
                <div className="flex border-b border-slate-700 mb-8">
                  <button 
                    className={cn(
                      "py-3 px-6 text-lg transition-colors",
                      activeTab === 'overview' 
                        ? "text-blue-light border-b-2 border-blue-light" 
                        : "text-slate-400 hover:text-white"
                    )}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                  <button 
                    className={cn(
                      "py-3 px-6 text-lg transition-colors",
                      activeTab === 'curriculum' 
                        ? "text-blue-light border-b-2 border-blue-light" 
                        : "text-slate-400 hover:text-white"
                    )}
                    onClick={() => setActiveTab('curriculum')}
                  >
                    Curriculum
                  </button>
                  <button 
                    className={cn(
                      "py-3 px-6 text-lg transition-colors",
                      activeTab === 'instructor' 
                        ? "text-blue-light border-b-2 border-blue-light" 
                        : "text-slate-400 hover:text-white"
                    )}
                    onClick={() => setActiveTab('instructor')}
                  >
                    Instructor
                  </button>
                  <button 
                    className={cn(
                      "py-3 px-6 text-lg transition-colors",
                      activeTab === 'reviews' 
                        ? "text-blue-light border-b-2 border-blue-light" 
                        : "text-slate-400 hover:text-white"
                    )}
                    onClick={() => setActiveTab('reviews')}
                  >
                    Reviews
                  </button>
                </div>
                
                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <div>
                    <h2 className="heading-md mb-6">About This Course</h2>
                    <div 
                      className="text-slate-300 space-y-4 mb-8"
                      dangerouslySetInnerHTML={{ __html: course.longDescription }}
                    />
                    
                    <div className="glass-card p-6 mb-8">
                      <h3 className="text-xl font-bold text-white mb-6">What You'll Learn</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {course.what_you_will_learn.map((item, index) => (
                          <div key={index} className="flex gap-3">
                            <CheckCircle size={20} className="text-blue-light flex-shrink-0 mt-1" />
                            <span className="text-slate-300">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="glass-card p-6">
                      <h3 className="text-xl font-bold text-white mb-6">Requirements</h3>
                      <ul className="space-y-3">
                        {course.requirements.map((req, index) => (
                          <li key={index} className="flex gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-light mt-2 flex-shrink-0" />
                            <span className="text-slate-300">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                {activeTab === 'curriculum' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="heading-md">Course Curriculum</h2>
                      <div className="text-slate-300">
                        <span className="text-blue-light font-medium">{course.modules.reduce((total, module) => total + module.lessons.length, 0)}</span> lessons • 
                        <span className="text-blue-light font-medium"> {course.duration}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {course.modules.map((module, moduleIndex) => (
                        <div key={moduleIndex} className="glass-card overflow-hidden">
                          <button 
                            className="flex items-center justify-between w-full p-6 text-left"
                            onClick={() => toggleModule(moduleIndex)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-blue/10 text-blue-light flex items-center justify-center">
                                {moduleIndex + 1}
                              </div>
                              <h3 className="text-xl font-medium text-white">{module.title}</h3>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-400">{module.lessons.length} lessons</span>
                              {expandedModules.includes(moduleIndex) ? (
                                <ChevronUp size={20} className="text-blue-light" />
                              ) : (
                                <ChevronDown size={20} className="text-blue-light" />
                              )}
                            </div>
                          </button>
                          
                          {expandedModules.includes(moduleIndex) && (
                            <div className="border-t border-slate-700">
                              {module.lessons.map((lesson, lessonIndex) => (
                                <div 
                                  key={lessonIndex} 
                                  className="flex items-center justify-between p-4 border-b border-slate-700/50 last:border-b-0 hover:bg-slate-800/20 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    {lesson.preview ? (
                                      <PlayCircle size={18} className="text-blue-light" />
                                    ) : (
                                      <div className="w-5 h-5 border border-slate-600 rounded-full" />
                                    )}
                                    <span className="text-slate-300">{lesson.title}</span>
                                    {lesson.preview && (
                                      <span className="py-0.5 px-2 rounded-full bg-blue/10 text-blue-light border border-blue/20 text-xs">
                                        Preview
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-slate-400">{lesson.duration}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeTab === 'instructor' && (
                  <div>
                    <h2 className="heading-md mb-6">Meet Your Instructor</h2>
                    
                    <div className="glass-card p-6 mb-8">
                      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                          <img 
                            src={course.instructor.image}
                            alt={course.instructor.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">{course.instructor.name}</h3>
                          <p className="text-slate-400 mb-4">{course.instructor.bio}</p>
                          
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                              <Star size={18} className="text-yellow-500" />
                              <span className="text-white">{course.instructor.rating} Instructor Rating</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageSquare size={18} className="text-blue-light" />
                              <span className="text-slate-300">{course.reviews} Reviews</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users size={18} className="text-blue-light" />
                              <span className="text-slate-300">{course.instructor.students.toLocaleString()} Students</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOpen size={18} className="text-blue-light" />
                              <span className="text-slate-300">{course.instructor.courses} Courses</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'reviews' && (
                  <div>
                    <div className="flex flex-col md:flex-row gap-8 mb-8">
                      <div className="glass-card p-6 flex-grow">
                        <h3 className="text-xl font-bold text-white mb-4">Student Feedback</h3>
                        
                        <div className="flex items-center gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-5xl font-bold text-white mb-2">{course.rating.toFixed(1)}</div>
                            <div className="flex justify-center mb-1">
                              {renderStars(course.rating)}
                            </div>
                            <p className="text-slate-400 text-sm">Course Rating</p>
                          </div>
                          
                          <div className="flex-grow space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => (
                              <div key={star} className="flex items-center gap-2">
                                <div className="flex items-center gap-1 w-20">
                                  <span className="text-slate-400">{star}</span>
                                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                </div>
                                <div className="flex-grow h-2 bg-slate-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-light rounded-full"
                                    style={{ 
                                      width: star === 5 ? '80%' : 
                                             star === 4 ? '15%' : 
                                             star === 3 ? '3%' : 
                                             star === 2 ? '1%' : '1%' 
                                    }}
                                  />
                                </div>
                                <span className="text-slate-400 w-10 text-right">
                                  {star === 5 ? '80%' : 
                                   star === 4 ? '15%' : 
                                   star === 3 ? '3%' : 
                                   star === 2 ? '1%' : '1%'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-6">Recent Reviews</h3>
                    
                    <div className="space-y-6">
                      {course.reviews_list.map((review) => (
                        <div key={review.id} className="glass-card p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                              <img 
                                src={review.avatar}
                                alt={review.user}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            <div className="flex-grow">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                <h4 className="text-lg font-medium text-white">{review.user}</h4>
                                <div className="flex items-center gap-2">
                                  {renderStars(review.rating)}
                                  <span className="text-slate-400">{review.date}</span>
                                </div>
                              </div>
                              
                              <p className="text-slate-300">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 text-center">
                      <button className="button-secondary">View All Reviews</button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Sidebar - Will be empty on desktop since we already have the sticky card */}
              <div className="hidden lg:block">
                {/* Intentionally left empty */}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseDetail;
