
import React from 'react';
import CompanyInfo from './footer/CompanyInfo';
import LearningLinks from './footer/LearningLinks';
import ContactInfo from './footer/ContactInfo';
import Copyright from './footer/Copyright';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8 w-full">
      <div className="w-full mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Company Info */}
          <CompanyInfo />
          
          {/* Learning */}
          <LearningLinks />
          
          {/* Contact Info */}
          <ContactInfo />
        </div>
        
        <Copyright />
      </div>
    </footer>
  );
};

export default Footer;
