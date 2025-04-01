
import React from 'react';
import { MapPin, Mail, Phone } from 'lucide-react';

const ContactInfo = () => {
  return (
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
  );
};

export default ContactInfo;
