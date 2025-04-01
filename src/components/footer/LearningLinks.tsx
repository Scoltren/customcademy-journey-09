
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * LearningLinks component displays learning-related navigation links in the footer
 */
const LearningLinks = () => {
  return (
    <div>
      <h3 className="font-bold text-lg mb-6">Learning</h3>
      <ul className="space-y-3">
        <li>
          <Link to="/dashboard" className="text-slate-400 hover:text-blue-light transition-colors duration-300">
            My Dashboard
          </Link>
        </li>
        <li>
          <Link to="/account" className="text-slate-400 hover:text-blue-light transition-colors duration-300">
            Account Settings
          </Link>
        </li>
        <li>
          <Link to="/create-course" className="text-slate-400 hover:text-blue-light transition-colors duration-300">
            Become a Teacher
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default LearningLinks;
