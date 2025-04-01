
import { Link } from "react-router-dom";

interface MobileMenuProps {
  isOpen: boolean;
  user: any | null;
  onLogout: () => Promise<void>;
}

const MobileMenu = ({ isOpen, user, onLogout }: MobileMenuProps) => {
  if (!isOpen) return null;

  return (
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
              onClick={onLogout}
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
  );
};

export default MobileMenu;
