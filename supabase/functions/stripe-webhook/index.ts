
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
    
    // Get the signature from the header
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      return new Response('Webhook signature missing', { status: 400 });
    }
    
    // Get the webhook secret from environment
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
    
    if (!webhookSecret) {
      console.error('Stripe webhook secret is not set');
      return new Response('Webhook secret not configured', { status: 500 });
    }
    
    // Get the raw request body
    const body = await req.text();
    
    // Verify the event using the signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }
    
    // Setup supabase connection
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const courseId = session.metadata?.courseId;
        
        if (session.payment_status === 'paid' && userId && courseId) {
          // Update payment record
          const paymentResponse = await fetch(`${supabaseUrl}/rest/v1/payments?stripe_checkout_id=eq.${session.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey,
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              status: 'completed',
              stripe_payment_id: session.payment_intent,
              updated_at: new Date().toISOString(),
            }),
          });
          
          if (!paymentResponse.ok) {
            console.error('Failed to update payment record:', await paymentResponse.text());
          }
          
          // Enroll user in the course if not already enrolled
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
        break;
      }
      // Add other event types as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Error handling webhook event:', error);
    return new Response(`Webhook error: ${error.message}`, { status: 500 });
  }
});
