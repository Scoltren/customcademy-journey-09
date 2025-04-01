
import React from 'react';
import { NavigationLinks } from './navbar/NavigationLinks';
import { AuthButtons } from './navbar/AuthButtons';
import { UserMenu } from './navbar/UserMenu';
import { MobileMenu } from './navbar/MobileMenu';
import { CreateCourseButton } from './navbar/CreateCourseButton';
import { useAuth } from '../contexts/AuthContext';

const ResponsiveNavbar = () => {
  const { user } = useAuth();

  return (
    <header className="w-full border-b bg-white">
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <div className="flex items-center">
          <a href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-primary">CustomCademy</span>
          </a>
          <div className="hidden md:ml-10 md:flex">
            <NavigationLinks />
          </div>
        </div>

        <div className="hidden md:flex md:items-center md:space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <CreateCourseButton />
              <UserMenu />
            </div>
          ) : (
            <AuthButtons />
          )}
        </div>

        <div className="md:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
};

export default ResponsiveNavbar;
