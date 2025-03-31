
import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterDropdownProps {
  options: string[];
  selected: string;
  setSelected: (option: string) => void;
  label: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ 
  options, 
  selected, 
  setSelected, 
  label 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button 
        className="flex items-center justify-between w-full px-4 py-2 bg-navy text-white rounded-lg border border-slate-700 hover:border-blue-light focus:outline-none focus:border-blue-light transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selected}</span>
        <ChevronDown size={16} className={cn("transition-transform", isOpen ? "rotate-180" : "")} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-navy border border-slate-700 rounded-lg shadow-xl">
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option}
                className="flex items-center justify-between w-full px-4 py-2 text-left text-white hover:bg-slate-700 transition-colors"
                onClick={() => {
                  setSelected(option);
                  setIsOpen(false);
                }}
              >
                <span>{option}</span>
                {selected === option && <Check size={16} className="text-blue-light" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
