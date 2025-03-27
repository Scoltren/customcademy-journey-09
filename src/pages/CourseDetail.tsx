
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Star, Users, Clock, BarChart, BookOpen, CheckCircle } from 'lucide-react';
import { courseApi } from '@/services/api';
import { toast } from '@/components/ui/sonner';

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const courseData = await courseApi.getCourse(id);
        setCourse(courseData);
        
        // Fetch chapters
        const chaptersData = await courseApi.getCourseChapters(id);
        setChapters(chaptersData);
      } catch (error) {
        console.error('Error fetching course details:', error);
        toast.error('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight">
        <Navbar />
        <div className="container mx-auto px-6 pt-28 pb-16">
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
                    <span>{course.overall_rating || 4.5} Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="text-blue-400" size={18} />
                    <span>1000+ Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="text-green-400" size={18} />
                    <span>30 Hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart className="text-purple-400" size={18} />
                    <span>{course.difficulty_level || 'Intermediate'}</span>
                  </div>
                </div>
                
                {/* Price and Enroll Button */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700">
                  <div className="text-2xl font-bold">
                    {course.price > 0 ? `$${course.price}` : 'Free'}
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
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseDetail;
