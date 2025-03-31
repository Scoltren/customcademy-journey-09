
import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative flex-grow">
      <input 
        type="text" 
        placeholder="Search courses..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full py-3 pl-10 pr-4 rounded-lg bg-navy border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
    </div>
  );
};

export default SearchInput;
