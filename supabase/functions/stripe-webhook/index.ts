
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

// Supabase Edge Function to handle Stripe webhook events
// This function processes payment notifications from Stripe after checkout completion
serve(async (req) => {
  try {
    // Retrieve the request body as text from the webhook request
    const body = await req.text();
    
    // Get the signature from the header for verification
    const signature = req.headers.get('stripe-signature');
    
    // Validate that signature exists in header
    if (!signature) {
      console.error('Webhook error: Missing stripe-signature header');
      return new Response('Webhook signature missing', { status: 400 });
    }
    
    // Get the webhook secret from environment variables
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
    
    // Validate webhook secret is configured
    if (!webhookSecret) {
      console.error('Webhook error: STRIPE_WEBHOOK_SECRET not configured');
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
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Webhook signature verification failed: ${errMsg}`);
      return new Response(`Webhook signature verification failed: ${errMsg}`, { status: 400 });
    }
    
    console.log(`Processing webhook event: ${event.type}`, { event_id: event.id });
    
    // Setup supabase connection to record payment and enrollment
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    // Validate Supabase configuration exists
    if (!supabaseUrl || !supabaseKey) {
      console.error('Webhook error: Missing Supabase configuration');
      return new Response('Server configuration error', { status: 500 });
    }
    
    // Handle different webhook event types
    switch (event.type) {
      case 'checkout.session.completed': {
        // Extract data from the completed checkout session
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const courseId = session.metadata?.courseId;
        
        console.log('Processing checkout.session.completed', { 
          userId, 
          courseId, 
          paymentStatus: session.payment_status,
          sessionId: session.id
        });
        
        // Only process paid sessions with valid user and course IDs
        if (session.payment_status === 'paid' && userId && courseId) {
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
            }),
          });
          
          // Handle payment record creation response
          if (!paymentResponse.ok) {
            const errorText = await paymentResponse.text();
            console.error('Failed to record payment:', errorText);
            // Continue processing despite the error
          } else {
            console.log('Payment record created successfully');
          }
          
          // Enroll user in the course - ALWAYS create this record regardless of existing enrollment
          console.log('Creating user enrollment record for course');
          const enrollResponse = await fetch(`${supabaseUrl}/rest/v1/subscribed_courses`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey,
              'Prefer': 'resolution=merge-duplicates', // Handle potential duplicates with an upsert approach
            },
            body: JSON.stringify({
              user_id: userId,
              course_id: parseInt(courseId),
              progress: 0,
            }),
          });
          
          // Handle enrollment response
          if (!enrollResponse.ok) {
            const errorText = await enrollResponse.text();
            console.error('Failed to enroll user:', errorText);
          } else {
            console.log('Successfully enrolled user in course');
          }
        } else {
          console.log('Skipping enrollment: conditions not met', {
            paymentStatus: session.payment_status,
            hasUserId: !!userId,
            hasCourseId: !!courseId
          });
        }
        break;
      }
      // Add handlers for other event types as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    // Return success response to Stripe
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error: unknown) {
    // Handle any unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Webhook error:', errorMessage, error instanceof Error ? error.stack : '');
    return new Response(`Webhook error: ${errorMessage}`, { status: 500 });
  }
});
