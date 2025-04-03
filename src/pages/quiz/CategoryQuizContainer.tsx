
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CategoryQuizView from "./CategoryQuizView";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Container component for the Category Quiz feature
 * Handles state management and navigation logic
 */
const CategoryQuizContainer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Debug the incoming state
    console.log("CategoryQuizContainer received state:", location.state);
    
    // Check if we have the required state data
    if (!location.state || !location.state.quizIds || !location.state.categories) {
      console.error("Missing required quiz data in location state:", location.state);
      toast.error("Quiz data is missing. Please try again.");
      navigate('/select-interests');
      return;
    }
    
    setInitializing(false);
  }, [location.state, navigate]);

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  // Pass the quiz data to the view component
  return <CategoryQuizView 
    quizIds={location.state.quizIds} 
    categories={location.state.categories}
  />;
};

export default CategoryQuizContainer;
