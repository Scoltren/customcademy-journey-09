
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

serve(async (req) => {
  try {
    // Retrieve the request body as text
    const body = await req.text();
    
    // Get the signature from the header
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      return new Response('Webhook signature missing', { status: 400 });
    }
    
    // Get the webhook secret from environment
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
    
    if (!webhookSecret) {
      return new Response('Webhook secret not configured', { status: 500 });
    }
    
    // Setup Stripe with the secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
    
    // Verify the event using the signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }
    
    console.log(`Processing webhook event: ${event.type}`);
    
    // Setup supabase connection
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response('Server configuration error', { status: 500 });
    }
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const courseId = session.metadata?.courseId;
        
        console.log('Processing checkout.session.completed', { userId, courseId, paymentStatus: session.payment_status });
        
        if (session.payment_status === 'paid' && userId && courseId) {
          // Record the payment in our database
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
          
          if (!paymentResponse.ok) {
            console.error('Failed to record payment:', await paymentResponse.text());
          }
          
          // Enroll user in the course
          console.log('Checking if user is already enrolled');
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
          
          if (enrollmentData.length === 0) {
            console.log('User not enrolled yet, creating enrollment');
            const enrollResponse = await fetch(`${supabaseUrl}/rest/v1/subscribed_courses`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Prefer': 'return=minimal',
              },
              body: JSON.stringify({
                user_id: userId,
                course_id: parseInt(courseId),
                progress: 0,
              }),
            });
            
            if (!enrollResponse.ok) {
              console.error('Failed to enroll user:', await enrollResponse.text());
            } else {
              console.log('Successfully enrolled user in course');
            }
          } else {
            console.log('User already enrolled in course');
          }
        }
        break;
      }
      // Add handlers for other event types as needed
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(`Webhook error: ${error.message}`, { status: 500 });
  }
});
