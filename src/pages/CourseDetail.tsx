import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Star, Users, Clock, BarChart, BookOpen, CheckCircle, MessageSquare, StarHalf } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Chapter {
  id: number;
  chapter_text: string;
  video_link: string | null;
  title?: string;
}

interface Course {
  id: number;
  title: string;
  description: string | null;
  thumbnail: string | null;
  difficulty_level: string | null;
  overall_rating: number | null;
  price: number | null;
  media: string | null;
  category_id: number | null;
  creator_id: number | null;
  created_at: string | null;
  course_time: number | null;
}

interface Comment {
  id: number;
  comment_text: string;
  user_id: number | null;
  created_at: string | null;
  rating?: number;
  username?: string;
}

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  // Fetch course data
  const { 
    data: course, 
    isLoading: courseLoading, 
    error: courseError 
  } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      if (!id) throw new Error('Course ID is required');
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', parseInt(id, 10))
        .single();
      
      if (error) throw error;
      return data as Course;
    },
    enabled: !!id,
  });
  
  // Fetch chapters data
  const { 
    data: chapters = [], 
    isLoading: chaptersLoading, 
    error: chaptersError 
  } = useQuery({
    queryKey: ['chapters', id],
    queryFn: async () => {
      if (!id) throw new Error('Course ID is required');
      
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('course_id', parseInt(id, 10))
        .order('id', { ascending: true });
      
      if (error) throw error;
      return data as Chapter[];
    },
    enabled: !!id,
  });
  
  // Fetch comments/reviews data
  const { 
    data: comments = [], 
    isLoading: commentsLoading, 
    error: commentsError 
  } = useQuery({
    queryKey: ['comments', id],
    queryFn: async () => {
      if (!id) throw new Error('Course ID is required');
      
      // Fetch comments along with user data for display
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users:user_id (
            username
          )
        `)
        .eq('course_id', parseInt(id, 10))
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to include the username
      return data.map(comment => ({
        ...comment,
        username: comment.users?.username || 'Anonymous User'
      })) as Comment[];
    },
    enabled: !!id,
  });
  
  // Show error messages
  useEffect(() => {
    if (courseError) {
      console.error('Error fetching course:', courseError);
      toast.error('Failed to load course details');
    }
    
    if (chaptersError) {
      console.error('Error fetching chapters:', chaptersError);
      toast.error('Failed to load course chapters');
    }
    
    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      toast.error('Failed to load course reviews');
    }
  }, [courseError, chaptersError, commentsError]);

  const handleEnroll = async () => {
    if (!id) return;
    
    try {
      // This would typically be implemented with authentication
      toast.info('Please log in to enroll in this course');
      // Uncomment when authentication is implemented
      // await userApi.enrollCourse(id);
      // toast.success('Successfully enrolled in the course');
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in the course');
    }
  };

  const isLoading = courseLoading || chaptersLoading || commentsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-midnight">
        <Navbar />
        <div className="container mx-auto px-6 py-28 pb-16">
          <div className="animate-pulse">
            <div className="h-10 bg-slate-800 rounded mb-4 w-3/4"></div>
            <div className="h-6 bg-slate-800 rounded mb-6 w-1/2"></div>
            <div className="glass-card h-96"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-midnight">
        <Navbar />
        <div className="container mx-auto px-6 pt-28 pb-16 text-center">
          <h1 className="heading-lg mb-6">Course Not Found</h1>
          <p className="text-slate-400 mb-8">The course you're looking for doesn't exist or has been removed.</p>
          <Link to="/courses" className="button-primary">Browse Courses</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Course Header */}
        <div className="container mx-auto px-6 mb-12">
          <div className="glass-card p-8 md:p-12">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Course Image */}
              <div className="lg:w-1/2">
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-800">
                  <img 
                    src={course.thumbnail || "https://images.unsplash.com/photo-1498050108023-c5249f4df085"}
                    alt={course.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Course Info */}
              <div className="lg:w-1/2">
                <h1 className="heading-lg mb-4">{course.title}</h1>
                
                <div className="text-slate-400 mb-6">
                  {course.description}
                </div>
                
                {/* Course Meta */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-500" size={18} />
                    <span>{course.overall_rating ? course.overall_rating.toFixed(1) : '0.0'} Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="text-blue-400" size={18} />
                    <span>1000+ Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="text-green-400" size={18} />
                    <span>{course.course_time || 0} Hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart className="text-purple-400" size={18} />
                    <span>{course.difficulty_level || 'Intermediate'}</span>
                  </div>
                </div>
                
                {/* Price and Enroll Button */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700">
                  <div className="text-2xl font-bold">
                    {course.price ? `$${course.price}` : 'Free'}
                  </div>
                  <button 
                    className="button-primary"
                    onClick={handleEnroll}
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Course Content */}
        <section className="container mx-auto px-6 mb-12">
          <h2 className="heading-md mb-6">Course Content</h2>
          
          {chapters.length > 0 ? (
            <div className="glass-card divide-y divide-slate-700/50">
              {chapters.map((chapter, index) => (
                <div key={chapter.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        {chapter.title || `Chapter ${index + 1}`}
                      </h3>
                      <p className="text-slate-400 mb-4">
                        {chapter.chapter_text}
                      </p>
                      
                      {chapter.video_link && (
                        <div className="flex items-center gap-2 text-blue-light">
                          <BookOpen size={16} />
                          <span>Video Lecture</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <p className="text-slate-400">No content available for this course yet.</p>
            </div>
          )}
        </section>
        
        {/* What You'll Learn */}
        <section className="container mx-auto px-6 mb-12">
          <h2 className="heading-md mb-6">What You'll Learn</h2>
          
          <div className="glass-card p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Build professional web applications with modern technologies",
                "Understand key programming concepts and best practices",
                "Deploy applications to production environments",
                "Collaborate effectively with development teams",
                "Debug common issues in your applications",
                "Follow industry standard security practices"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="text-green-400 flex-shrink-0" size={20} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Reviews */}
        <section className="container mx-auto px-6 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-md">Reviews</h2>
            <div className="flex items-center gap-2">
              <StarHalf className="text-yellow-500" size={20} />
              <span className="text-lg font-bold">{course?.overall_rating ? course.overall_rating.toFixed(1) : '0.0'} Overall Rating</span>
            </div>
          </div>
          
          <div className="glass-card">
            {comments.length > 0 ? (
              <div className="divide-y divide-slate-700/50">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${comment.username?.replace(' ', '+')}&background=random`}
                          alt={comment.username} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-bold">{comment.username}</h4>
                            <div className="text-xs text-slate-400">
                              {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : 'Unknown date'}
                            </div>
                          </div>
                          {comment.rating && (
                            <div className="flex items-center">
                              <Star className="text-yellow-500" size={16} />
                              <span className="ml-1">{comment.rating}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-slate-300">{comment.comment_text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="mx-auto mb-4 text-slate-500" size={40} />
                <p className="text-slate-400">No reviews available for this course yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseDetail;
