
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CategoryQuiz = () => {
  const navigate = useNavigate();

  // Redirect to courses after a delay
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      navigate('/courses');
    }, 10000); // Redirect after 10 seconds

    return () => clearTimeout(redirectTimer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 p-4">
      <div className="w-full max-w-3xl">
        <Card className="backdrop-blur-sm bg-slate-950 border-slate-800 shadow-xl transition-all duration-300">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Quiz Feature Unavailable</CardTitle>
          </CardHeader>
          
          <CardContent className="text-center">
            <div className="my-8 space-y-4">
              <p className="text-slate-300 text-lg">
                The quiz functionality has been removed from this application.
              </p>
              <p className="text-slate-400">
                You will be redirected to the courses page automatically in a few seconds.
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center pb-6">
            <Button
              onClick={() => navigate('/courses')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              Return to Courses
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CategoryQuiz;
