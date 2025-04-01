
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Logo component used in footer and other places
 */
const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2 mb-6">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue to-sky flex items-center justify-center">
        <span className="text-white font-bold text-lg">C</span>
      </div>
      <span className="text-white font-bold text-xl">CustomCademy</span>
    </Link>
  );
};

export default Logo;
