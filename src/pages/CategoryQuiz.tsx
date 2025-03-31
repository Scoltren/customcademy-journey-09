
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CategoryQuiz = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 p-4">
      <div className="w-full max-w-3xl">
        <Card className="backdrop-blur-sm bg-slate-950 border-slate-800 shadow-xl transition-all duration-300 p-8">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-white">Quiz Feature Unavailable</h2>
            <p className="text-gray-300">
              The quiz feature has been temporarily removed from this platform.
              We're working on improving the learning experience and will bring back enhanced quiz functionality soon.
            </p>
            <Button 
              onClick={() => navigate('/courses')} 
              className="flex items-center gap-2 mt-4 mx-auto"
            >
              <ArrowLeft size={16} />
              Return to Courses
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CategoryQuiz;
