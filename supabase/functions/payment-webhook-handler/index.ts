
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Unified payment webhook handler for CustomCademy
 * Processes both checkout.session.completed and payment_intent.succeeded events
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Retrieve the request body as text for webhook signature verification
    const body = await req.text();
    
    // Get the signature from the header for verification
    const signature = req.headers.get('stripe-signature');
    
    // Validate that signature exists in header
    if (!signature) {
      console.error('Missing stripe-signature header');
      return new Response('Webhook signature missing', { status: 400 });
    }
    
    // Get the webhook secret from environment variables
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return new Response('Webhook secret not configured', { status: 500 });
    }
    
    // Initialize Stripe with the secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
    
    // Verify the event using the signature to prevent unauthorized requests
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Webhook signature verification failed: ${errorMsg}`);
      return new Response(`Webhook verification failed: ${errorMsg}`, { status: 400 });
    }
    
    console.log(`Processing webhook event: ${event.type}`, { event_id: event.id });
    
    // Setup supabase connection to record payment and enrollment
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    // Handle different webhook event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, supabaseUrl, supabaseKey);
        break;
        
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object, supabaseUrl, supabaseKey);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    // Return success response to Stripe
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Webhook error:', errorMessage);
    
    return new Response(JSON.stringify({ error: errorMessage }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

/**
 * Handle checkout.session.completed webhook events
 */
async function handleCheckoutCompleted(session: any, supabaseUrl: string, supabaseKey: string) {
  const userId = session.metadata?.userId;
  const courseId = session.metadata?.courseId;
  
  if (session.payment_status !== 'paid' || !userId || !courseId) {
    console.log('Skipping enrollment: payment not completed or missing metadata');
    return;
  }
  
  try {
    // Record the payment in the database
    const paymentResponse = await fetch(`${supabaseUrl}/rest/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        user_id: userId,
        course_id: parseInt(courseId),
        amount: session.amount_total ? session.amount_total / 100 : 0,
        status: 'completed',
        stripe_checkout_id: session.id,
        stripe_payment_id: session.payment_intent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    });
    
    if (!paymentResponse.ok) {
      throw new Error(`Failed to record payment: ${await paymentResponse.text()}`);
    }
    
    // Enroll the user in the course
    const enrollResponse = await fetch(`${supabaseUrl}/rest/v1/subscribed_courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        user_id: userId,
        course_id: parseInt(courseId),
        progress: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    });
    
    if (!enrollResponse.ok) {
      throw new Error(`Failed to enroll user: ${await enrollResponse.text()}`);
    }
    
    console.log(`Successfully enrolled user ${userId} in course ${courseId}`);
    
  } catch (error) {
    console.error('Error processing checkout completion:', error);
    throw error;
  }
}

/**
 * Handle payment_intent.succeeded webhook events
 */
async function handlePaymentSucceeded(paymentIntent: any, supabaseUrl: string, supabaseKey: string) {
  // This could be used to handle direct PaymentIntent events
  // Currently we're primarily using the checkout.session.completed event,
  // but we can extend this in the future to handle direct payments
  console.log('Payment intent succeeded:', paymentIntent.id);
}

