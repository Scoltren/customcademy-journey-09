
// This file would need to be created with comments if it doesn't exist
import { supabase } from '@/integrations/supabase/client';

// Interface for checkout session parameters
interface CheckoutSessionParams {
  courseId: number;
  price: number;
  title: string;
  userId: string;
}

/**
 * Service for handling payment-related operations
 */
export const PaymentService = {
  /**
   * Creates a Stripe checkout session for course purchase
   * @param params Parameters required for checkout session creation
   * @returns Response with checkout session URL
   */
  createCheckoutSession: async (params: CheckoutSessionParams) => {
    try {
      const { courseId, price, title, userId } = params;
      
      // Call the create-checkout-session edge function
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { courseId, price, title, userId }
      });
      
      if (error) {
        console.error('Error creating checkout session:', error);
        throw new Error('Failed to create checkout session');
      }
      
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Payment service error:', errorMessage);
      throw error; // Re-throw to let the caller handle it
    }
  },
  
  /**
   * Verify payment status for a checkout session
   * @param sessionId Stripe checkout session ID
   * @returns Payment verification status
   */
  verifyPayment: async (sessionId: string) => {
    try {
      // Function to verify payment status
      const { data, error } = await supabase.functions.invoke('verify-payment-status', {
        body: { sessionId }
      });
      
      if (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Payment verification failed: ${errorMessage}`);
      }
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Payment verification error:', errorMessage);
      throw error; // Re-throw to let the caller handle it
    }
  }
};
