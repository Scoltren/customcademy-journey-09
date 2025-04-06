
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for handling Stripe webhook-related operations and verifications
 */
export const PaymentWebhookService = {
  /**
   * Register a webhook endpoint with Stripe
   * This would typically be done through the Stripe dashboard or CLI,
   * but this method provides a way to do it programmatically
   * @returns Result of webhook registration
   */
  registerWebhook: async () => {
    try {
      const { data, error } = await supabase.functions.invoke('register-webhook', {
        body: { endpoint: window.location.origin + '/api/webhooks/stripe' }
      });
      
      if (error) {
        console.error('Error registering webhook:', error);
        throw new Error('Failed to register webhook');
      }
      
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Webhook registration error:', errorMessage);
      throw error;
    }
  },
  
  /**
   * Check if a Stripe webhook is properly configured
   * @returns Webhook verification status
   */
  verifyWebhookConfig: async () => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-webhook-config');
      
      if (error) {
        console.error('Error verifying webhook config:', error);
        throw new Error('Failed to verify webhook configuration');
      }
      
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Webhook verification error:', errorMessage);
      throw error;
    }
  }
};

