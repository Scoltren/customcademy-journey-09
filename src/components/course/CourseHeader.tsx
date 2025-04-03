
import React, { useState, useEffect } from 'react';
import { Star, Clock, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Course } from '@/types/course';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { PaymentService } from '@/services/PaymentService';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface CourseHeaderProps {
  course: Course;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
  const { user, isEnrolled } = useAuth();
  const [enrollmentStatus, setEnrollmentStatus] = useState<boolean>(false);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [isLoadingDialog, setIsLoadingDialog] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkEnrollment = async () => {
      if (user && course.id) {
        const status = await isEnrolled(course.id);
        setEnrollmentStatus(status);
      }
    };

    checkEnrollment();
  }, [user, course.id, isEnrolled]);

  // Check for payment success query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const paymentSuccess = searchParams.get('payment_success');
    const paymentCancelled = searchParams.get('payment_cancelled');
    
    if (paymentSuccess === 'true') {
      // Clear the query parameter by replacing the URL
      const newUrl = location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Show success message
      toast.success('Payment successful! You are now enrolled in this course.');
      
      // Refresh enrollment status
      if (user && course.id) {
        isEnrolled(course.id).then(status => setEnrollmentStatus(status));
      }
    } else if (paymentCancelled === 'true') {
      // Clear the query parameter
      const newUrl = location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Show cancelled message
      toast.info('Payment was cancelled.');
    }
  }, [location, user, course.id, isEnrolled]);

  const handleFreeEnrollment = async () => {
    if (!user) {
      toast.info('Please log in to enroll in this course');
      navigate('/login');
      return;
    }

    setIsEnrolling(true);
    try {
      // Make sure course.id is a number
      const courseIdNumber = typeof course.id === 'string' ? parseInt(course.id, 10) : course.id;
      
      if (isNaN(courseIdNumber)) {
        throw new Error("Invalid ID format");
      }
      
      const { error } = await supabase
        .from('subscribed_courses')
        .insert({
          course_id: courseIdNumber,
          user_id: user.id, // This is already a string (UUID)
          progress: 0
        });

      if (error) throw error;
      
      setEnrollmentStatus(true);
      toast.success('Successfully enrolled in the course');
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in the course');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handlePaidEnrollment = async () => {
    if (!user) {
      toast.info('Please log in to purchase this course');
      navigate('/login');
      return;
    }

    if (!course.price) {
      handleFreeEnrollment();
      return;
    }

    setIsProcessingPayment(true);
    setIsLoadingDialog(true);
    
    try {
      const courseIdNumber = typeof course.id === 'string' ? parseInt(course.id, 10) : course.id;
      
      if (isNaN(courseIdNumber)) {
        throw new Error("Invalid ID format");
      }

      console.log('Initiating checkout for course:', courseIdNumber);
      
      const response = await PaymentService.createCheckoutSession({
        courseId: courseIdNumber,
        price: course.price,
        title: course.title,
        userId: user.id
      });

      console.log('Checkout response:', response);

      if (response?.url) {
        // Add a small delay before redirecting to ensure the dialog is visible
        setTimeout(() => {
          window.location.href = response.url;
        }, 500);
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to process payment. Please try again.');
      setIsLoadingDialog(false);
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="glass-card p-8 md:p-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Course Image */}
        <div className="lg:w-1/2">
          <div className="aspect-video rounded-xl overflow-hidden bg-slate-800">
            {course.thumbnail && (
              <img 
                src={course.thumbnail}
                alt={course.title} 
                className="w-full h-full object-cover"
              />
            )}
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
              <Clock className="text-green-400" size={18} />
              <span>{course.course_time || 0} Hours</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart className="text-purple-400" size={18} />
              <span>{course.difficulty_level || 'No difficulty assigned to course'}</span>
            </div>
          </div>
          
          {/* Price and Enroll Button */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700">
            <div className="text-2xl font-bold">
              {course.price ? `$${course.price}` : 'Free'}
            </div>
            {enrollmentStatus ? (
              <Button 
                className="button-secondary"
                disabled
              >
                Enrolled
              </Button>
            ) : (
              <Button 
                className="button-primary"
                onClick={course.price ? handlePaidEnrollment : handleFreeEnrollment}
                disabled={isEnrolling || isProcessingPayment}
              >
                {isEnrolling ? 'Enrolling...' : isProcessingPayment ? 'Processing...' : course.price ? 'Purchase Now' : 'Enroll Now'}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Loading Dialog */}
      <Dialog open={isLoadingDialog} onOpenChange={setIsLoadingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Processing Payment</DialogTitle>
          <DialogDescription>
            Connecting to payment provider. You'll be redirected to Stripe shortly...
          </DialogDescription>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mb-4"></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseHeader;
