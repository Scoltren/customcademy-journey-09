
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Menu, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 lg:px-12',
        scrolled ? 'py-3 bg-midnight/90 backdrop-blur-md shadow-md' : 'py-5 bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/e0870d71-c1c8-4790-83ba-ba11a0892a0a.png" 
            alt="CustomCademy Logo" 
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/courses" className="nav-link">Courses</Link>
        </nav>

        {/* Search and User Actions */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search courses..." 
              className="py-2 pl-10 pr-4 rounded-lg bg-navy border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all duration-300 w-48 lg:w-64"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          </div>
          
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="button-secondary py-2">Dashboard</Link>
              <button 
                onClick={handleLogout}
                className="text-slate-300 hover:text-white p-2 rounded-full bg-navy hover:bg-slate-700 transition-all duration-300"
                title="Log out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="button-secondary py-2">Login</Link>
              <Link to="/dashboard" className="text-slate-300 hover:text-white p-2 rounded-full bg-navy hover:bg-slate-700 transition-all duration-300">
                <User size={20} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "fixed inset-0 bg-midnight/95 backdrop-blur-lg z-40 transition-all duration-300 flex flex-col pt-20 px-6 md:hidden",
        mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        <div className="flex flex-col gap-6 items-center">
          <Link to="/" className="text-xl text-white hover:text-blue" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/courses" className="text-xl text-white hover:text-blue" onClick={() => setMobileMenuOpen(false)}>Courses</Link>
        </div>
        
        <div className="mt-10 flex flex-col gap-4 items-center">
          <div className="relative w-full max-w-sm">
            <input 
              type="text" 
              placeholder="Search courses..." 
              className="w-full py-3 pl-10 pr-4 rounded-lg bg-navy border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          </div>
          
          <div className="flex gap-4 mt-4">
            {user ? (
              <>
                <Link to="/dashboard" className="button-secondary py-2 flex-1 text-center" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }} 
                  className="button-primary py-2 flex-1 text-center"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="button-secondary py-2 flex-1 text-center" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="button-primary py-2 flex-1 text-center" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
