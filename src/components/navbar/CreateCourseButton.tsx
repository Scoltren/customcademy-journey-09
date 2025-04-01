
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Button component for creating a new course
 */
const CreateCourseButton = () => {
  const navigate = useNavigate();
  
  return (
    <Button 
      onClick={() => navigate("/create-course")}
      className="flex items-center gap-2"
      size="sm"
    >
      <PlusCircle size={16} />
      Create a course
    </Button>
  );
};

export default CreateCourseButton;
