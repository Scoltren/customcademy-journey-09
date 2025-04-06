
// Type declarations for Deno-specific modules used in Edge Functions

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (req: Request) => Promise<Response> | Response): void;
}

declare module "https://esm.sh/stripe@14.21.0" {
  import Stripe from "stripe";
  export default Stripe;
}

// Declare the Deno namespace to provide types for Deno.env
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  
  export const env: Env;
}

// Add any additional Stripe-specific types that might be needed
interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}
