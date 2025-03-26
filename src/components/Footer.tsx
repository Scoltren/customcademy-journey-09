
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue to-sky flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-white font-bold text-xl">CustomCademy</span>
            </Link>
            
            <p className="text-slate-400 mb-6">
              Personalized learning experiences tailored to your interests and skill level. 
              Learn at your own pace with CustomCademy's intuitive platform.
            </p>
            
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue hover:text-white transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue hover:text-white transition-all duration-300"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue hover:text-white transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue hover:text-white transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          {/* Learning */}
          <div>
            <h3 className="font-bold text-lg mb-6">Learning</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/dashboard" className="text-slate-400 hover:text-blue-light transition-colors duration-300">My Dashboard</Link>
              </li>
              <li>
                <Link to="/account" className="text-slate-400 hover:text-blue-light transition-colors duration-300">Account Settings</Link>
              </li>
              <li>
                <Link to="/teach" className="text-slate-400 hover:text-blue-light transition-colors duration-300">Become a Teacher</Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-6">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-blue-light mt-1 flex-shrink-0" />
                <span className="text-slate-400">123 Education Street, Learning City, 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-blue-light flex-shrink-0" />
                <a href="mailto:info@customcademy.com" className="text-slate-400 hover:text-blue-light transition-colors duration-300">
                  info@customcademy.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-blue-light flex-shrink-0" />
                <a href="tel:+11234567890" className="text-slate-400 hover:text-blue-light transition-colors duration-300">
                  +1 (123) 456-7890
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 text-center md:flex md:justify-between md:items-center text-slate-400">
          <p>© {currentYear} CustomCademy. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <Link to="/terms" className="hover:text-blue-light transition-colors duration-300">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-blue-light transition-colors duration-300">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
