
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuizNotAvailableProps {
  onBack?: () => void;
}

const QuizNotAvailable: React.FC<QuizNotAvailableProps> = ({ onBack }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <Card className="backdrop-blur-sm bg-slate-950 border-slate-800 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            Quiz Not Available
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-slate-300 text-lg mb-6">
            The quiz you're looking for isn't available right now.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            Return Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizNotAvailable;
