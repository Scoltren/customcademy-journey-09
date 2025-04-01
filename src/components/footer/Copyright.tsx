
import React from 'react';

const Copyright = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
      <p>© {currentYear} CustomCademy. All rights reserved.</p>
    </div>
  );
};

export default Copyright;
