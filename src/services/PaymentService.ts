
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateCheckoutParams {
  courseId: number;
  price: number;
  title: string;
  userId: string;
}

interface PaymentVerificationParams {
  sessionId: string;
}

export const PaymentService = {
  createCheckoutSession: async ({ courseId, price, title, userId }: CreateCheckoutParams) => {
    try {
      console.log('Creating checkout session with:', { courseId, price, title, userId });
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { courseId, price, title, userId }
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (!data || !data.url) {
        console.error('Invalid response from checkout service:', data);
        throw new Error('Invalid checkout response');
      }
      
      console.log('Checkout session created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to initiate payment. Please try again.');
      throw error;
    }
  },
  
  verifyPaymentStatus: async ({ sessionId }: PaymentVerificationParams) => {
    try {
      console.log('Verifying payment status for session:', sessionId);
      const { data, error } = await supabase.functions.invoke('verify-payment-status', {
        body: { sessionId }
      });
      
      if (error) throw error;
      console.log('Payment verification response:', data);
      return data;
    } catch (error) {
      console.error('Error verifying payment status:', error);
      toast.error('Failed to verify payment status. Please contact support.');
      throw error;
    }
  }
};

export default PaymentService;
