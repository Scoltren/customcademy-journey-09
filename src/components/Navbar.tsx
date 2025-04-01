
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useIsMobile } from "../hooks/use-mobile";
import NavigationLinks from "./navbar/NavigationLinks";
import UserMenu from "./navbar/UserMenu";
import AuthButtons from "./navbar/AuthButtons";
import MobileMenu from "./navbar/MobileMenu";
import CreateCourseButton from "./navbar/CreateCourseButton";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Close mobile menu when route changes
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy shadow-md">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
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
                <NavigationLinks />
              </div>
              
              <div className="relative z-10 flex items-center space-x-3">
                {user ? (
                  <>
                    <CreateCourseButton />
                    <UserMenu user={user} />
                  </>
                ) : (
                  <AuthButtons />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu 
        isOpen={isMobile && menuOpen} 
        user={user} 
        onLogout={handleLogout} 
      />
    </nav>
  );
};

export default Navbar;
