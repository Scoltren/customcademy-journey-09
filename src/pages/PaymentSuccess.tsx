
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PaymentService } from '@/services/PaymentService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [courseId, setCourseId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const sessionId = params.get('session_id');
        const courseIdParam = params.get('course_id');
        
        if (!sessionId) {
          toast.error('Missing session information');
          navigate('/dashboard');
          return;
        }
        
        if (!user) {
          toast.error('User authentication required');
          navigate('/login');
          return;
        }
        
        // Verify the payment with our backend
        const result = await PaymentService.verifyPaymentStatus({ sessionId });
        
        if (result.status === 'paid') {
          // Get the course ID, either from URL params or from the verification result
          const finalCourseId = courseIdParam || result.courseId;
          setCourseId(finalCourseId);
          
          // Ensure the user is enrolled in the course
          if (finalCourseId && user.id) {
            // Check if already enrolled
            const { data: existingEnrollment } = await supabase
              .from('subscribed_courses')
              .select('*')
              .eq('user_id', user.id)
              .eq('course_id', finalCourseId)
              .maybeSingle();
              
            // If not enrolled, create enrollment
            if (!existingEnrollment) {
              const { error: enrollError } = await supabase
                .from('subscribed_courses')
                .insert({
                  user_id: user.id,
                  course_id: parseInt(finalCourseId),
                  progress: 0
                });
                
              if (enrollError) {
                console.error('Error enrolling in course:', enrollError);
                toast.error('Failed to enroll in the course. Please contact support.');
              } else {
                toast.success('Payment successful! You have been enrolled in the course.');
              }
            } else {
              toast.success('Payment successful! You are enrolled in the course.');
            }
          }
        } else {
          toast.warning('Payment is still processing. You will be enrolled once payment is confirmed.');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        toast.error('Failed to verify payment. Please contact support.');
      } finally {
        setIsVerifying(false);
      }
    };
    
    if (user) {
      verifyPayment();
    }
  }, [location.search, navigate, user]);
  
  return (
    <div className="min-h-screen bg-midnight">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto glass-card p-12 text-center">
            <div className="mb-8">
              <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-4" />
              <h1 className="heading-lg mb-2">Payment Successful!</h1>
              <p className="text-slate-400">
                Thank you for your purchase. Your enrollment is now complete and you can start learning right away.
              </p>
            </div>
            
            {isVerifying ? (
              <div className="flex justify-center mb-6">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <Button 
                  className="button-primary w-full" 
                  onClick={() => courseId ? navigate(`/course/${courseId}`) : navigate('/dashboard')}
                >
                  Start Learning Now <ArrowRight className="ml-2" size={16} />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
