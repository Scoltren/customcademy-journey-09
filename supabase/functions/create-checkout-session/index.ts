
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

// Define CORS headers to allow cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Edge function to create a Stripe checkout session
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Extract course and user information from request body
    const { courseId, price, title, userId } = await req.json();
    
    // Validate required parameters
    if (!courseId || !price || !title || !userId) {
      throw new Error('Missing required parameters');
    }
    
    // Initialize Stripe with your secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
    
    // Create a checkout session with course details
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: title,
              description: `Course enrollment for ${title}`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/course/${courseId}?payment_success=true`,
      cancel_url: `${req.headers.get('origin')}/course/${courseId}?payment_cancelled=true`,
      metadata: {
        userId,
        courseId: courseId.toString(),
      },
    });
    
    // Return the session information to redirect user to Stripe checkout
    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error: unknown) {
    // Type the error appropriately
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Checkout session error:', errorMessage);
    
    // Return error response
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
