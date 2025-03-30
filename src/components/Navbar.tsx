
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "../hooks/use-mobile";
import { Home, Menu, PlusCircle, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Close mobile menu when route changes
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-navy shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold font-sans text-blue-400"
            >
              CustomCademy
            </Link>
          </div>

          {isMobile ? (
            <div className="flex items-center">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-white focus:outline-none"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              {/* Center the navigation items */}
              <div className="flex-1 flex justify-center absolute left-0 right-0 mx-auto">
                <NavigationMenu>
                  <NavigationMenuList className="flex justify-center">
                    <NavigationMenuItem>
                      <Link to="/" className="text-white hover:text-blue-300 px-4 py-2 transition-colors">
                        Home
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link to="/courses" className="text-white hover:text-blue-300 px-4 py-2 transition-colors">
                        Courses
                      </Link>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
              
              {user ? (
                <div className="relative z-10 flex items-center space-x-3">
                  <Button 
                    onClick={() => navigate("/create-course")}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <PlusCircle size={16} />
                    Create a course
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="h-8 w-8 cursor-pointer">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
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
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div className="md:hidden bg-navy shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 text-base font-medium text-white hover:bg-blue-600"
            >
              Home
            </Link>
            <Link
              to="/courses"
              className="block px-3 py-2 text-base font-medium text-white hover:bg-blue-600"
            >
              Courses
            </Link>
            {user ? (
              <>
                <Link
                  to="/create-course"
                  className="block px-3 py-2 text-base font-medium text-white hover:bg-blue-600"
                >
                  Create a course
                </Link>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-base font-medium text-white hover:bg-blue-600"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-white hover:bg-blue-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base font-medium text-white hover:bg-blue-600"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 text-base font-medium text-white hover:bg-blue-600"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
