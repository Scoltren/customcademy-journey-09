
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, Mail, RefreshCw } from "lucide-react";

const ConfirmEmail = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect to the interests page
    if (user) {
      console.log("User is already logged in, redirecting to select interests");
      navigate("/select-interests");
    } else if (!email) {
      // If there's no email in the state, redirect to login
      console.log("No email in state, redirecting to login");
      navigate("/login");
    }
  }, [user, navigate, email]);

  useEffect(() => {
    // Set up a polling mechanism to check auth status
    let interval: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;
    
    if (!user && email) {
      console.log("Setting up polling for email confirmation check");
      
      // Poll every 5 seconds to check if email was confirmed
      interval = setInterval(async () => {
        try {
          setIsChecking(true);
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: location.state?.password || "",
          });
          
          if (data.user && !error) {
            clearInterval(interval);
            clearInterval(countdownInterval);
            toast.success("Email confirmed successfully!");
            console.log("Email confirmed, redirecting to select interests");
            navigate("/select-interests");
          }
        } catch (error) {
          console.log("Still waiting for email confirmation");
        } finally {
          setIsChecking(false);
        }
      }, 5000);

      // Countdown for resend button
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, [email, navigate, user, location.state]);

  const handleResendEmail = async () => {
    if (!email || !canResend) return;

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Confirmation email resent!");
        setCanResend(false);
        setCountdown(60);
      }
    } catch (error) {
      console.error("Error resending confirmation email:", error);
      toast.error("Failed to resend confirmation email");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 p-4">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-slate-950 border-slate-800 shadow-xl transition-all duration-300">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <Mail className="h-16 w-16 text-blue-400" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-white">Confirm Your Email</CardTitle>
            <CardDescription className="text-gray-300">
              We've sent a confirmation email to:
            </CardDescription>
            <div className="mt-1 text-blue-400 font-semibold">
              {email || "your email address"}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-md text-gray-300 text-sm">
              <p className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-400" />
                Check your inbox for the confirmation link
              </p>
              <p className="mt-2">
                You need to confirm your email address before you can sign in. 
                The page will automatically redirect you once your email is confirmed.
              </p>
            </div>
            
            <div className="text-center text-gray-400 text-sm">
              {isChecking ? (
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Checking confirmation status...</span>
                </div>
              ) : (
                <span>Didn't receive the email?</span>
              )}
            </div>
            
            <Button
              onClick={handleResendEmail}
              disabled={!canResend || isChecking}
              variant="outline"
              className="w-full border-gray-700 text-white hover:bg-slate-800"
            >
              {canResend 
                ? "Resend confirmation email" 
                : `Resend available in ${countdown}s`}
            </Button>
            
            <div className="text-center">
              <Button
                variant="link"
                className="text-gray-400 hover:text-gray-300"
                onClick={() => navigate("/login")}
              >
                Back to login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmEmail;
