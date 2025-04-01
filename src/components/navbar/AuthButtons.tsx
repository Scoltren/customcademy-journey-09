
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AuthButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="relative z-10 flex space-x-2">
      <Button
        variant="outline"
        className="border-gray-200 text-white hover:bg-blue-700 hover:text-white transition-all duration-300"
        onClick={() => navigate("/login")}
      >
        Sign In
      </Button>
      <Button
        className="bg-black text-white hover:bg-white hover:text-black transition-all duration-300"
        onClick={() => navigate("/signup")}
      >
        Sign Up
      </Button>
    </div>
  );
};

export default AuthButtons;
