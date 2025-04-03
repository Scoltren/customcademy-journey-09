
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateCheckoutParams {
  courseId: number;
  price: number;
  title: string;
  userId: string;
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

  verifyPaymentStatus: async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment-status', {
        body: { sessionId }
      });
      
      if (error) {
        console.error('Error verifying payment status:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }
};

export default PaymentService;
