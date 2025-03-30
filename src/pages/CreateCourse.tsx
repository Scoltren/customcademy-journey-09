
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CourseForm } from '@/components/course-creation/CourseForm';
import { ChapterForm } from '@/components/course-creation/ChapterForm';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const CreateCourse = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [courseId, setCourseId] = useState<number | null>(null);
  const [courseCreated, setCourseCreated] = useState(false);
  
  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate]);
  
  const handleCourseCreated = (createdCourseId: number) => {
    setCourseId(createdCourseId);
    setCourseCreated(true);
  };
  
  const handlePublishCourse = () => {
    navigate(`/courses/${courseId}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-midnight">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-midnight">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-3xl font-bold text-white mb-8">Create a New Course</h1>
          
          {!courseCreated ? (
            <CourseForm onSubmitSuccess={handleCourseCreated} userId={user.id} />
          ) : (
            <div className="space-y-6">
              <ChapterForm courseId={courseId!} onPublishCourse={handlePublishCourse} />
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCourseId(null);
                    setCourseCreated(false);
                  }}
                >
                  Back to Course Details
                </Button>
                
                <Button onClick={() => navigate('/dashboard')}>
                  Save as Draft
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateCourse;
