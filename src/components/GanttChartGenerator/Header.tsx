import React from 'react';
import { MessageSquare, Download, Search } from 'lucide-react';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onExport: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, onSearchChange, onExport }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <div className="border-2 border-gray-800 rounded px-6 py-3">
            <span className="text-2xl font-bold text-gray-800">LOGO</span>
          </div>
        </div>

        {/* Projects Dropdown */}
        <div className="flex items-center gap-2 ml-8">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium">
            <span className="text-xl">Projects</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-800 rounded-lg focus:outline-none focus:border-gray-600"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2 border-2 border-gray-800 rounded-lg hover:bg-gray-50 transition-colors">
            <MessageSquare className="w-5 h-5" strokeWidth={2} />
            <span className="font-medium">Comment</span>
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-6 py-2 border-2 border-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" strokeWidth={2} />
            <span className="font-medium">Export</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
