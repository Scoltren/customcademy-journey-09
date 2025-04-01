
import React from 'react';

interface SectionHeaderProps {
  title: string;
  description: string;
}

/**
 * Section header component for course listings
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description }) => {
  return (
    <div className="text-center mb-12">
      <h2 className="heading-lg mb-4">{title}</h2>
      <p className="text-slate-400 max-w-2xl mx-auto">
        {description}
      </p>
    </div>
  );
};

export default SectionHeader;
