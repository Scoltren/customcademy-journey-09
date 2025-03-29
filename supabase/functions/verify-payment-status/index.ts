
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    // Initialize Stripe with your secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    const paymentStatus = session.payment_status;
    const userId = session.metadata?.userId;
    const courseId = session.metadata?.courseId;
    
    // Update payment record in our database
    if (paymentStatus === 'paid' && userId && courseId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
      
      // First update the payment status
      const paymentResponse = await fetch(`${supabaseUrl}/rest/v1/payments?stripe_checkout_id=eq.${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          status: 'completed',
          stripe_payment_id: session.payment_intent as string,
          updated_at: new Date().toISOString(),
        }),
      });
      
      if (!paymentResponse.ok) {
        console.error('Failed to update payment record:', await paymentResponse.text());
      }
      
      // Then check if we need to enroll the user in the course
      const enrollmentCheckResponse = await fetch(
        `${supabaseUrl}/rest/v1/subscribed_courses?user_id=eq.${userId}&course_id=eq.${courseId}`,
        {
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
          },
        }
      );
      
      const enrollmentData = await enrollmentCheckResponse.json();
      
      // If user is not enrolled yet, create enrollment
      if (enrollmentData.length === 0) {
        const enrollResponse = await fetch(`${supabaseUrl}/rest/v1/subscribed_courses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
          },
          body: JSON.stringify({
            user_id: userId,
            course_id: parseInt(courseId),
            progress: 0,
          }),
        });
        
        if (!enrollResponse.ok) {
          console.error('Failed to enroll user in course:', await enrollResponse.text());
        }
      }
    }
    
    return new Response(
      JSON.stringify({ 
        status: paymentStatus,
        sessionId,
        courseId: session.metadata?.courseId,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error verifying payment status:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
