import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FolderOpen, Save } from 'lucide-react';

interface HeaderProps {
  onExport: () => void;
  onSaveProject: () => void;
  onOpenProject: () => void;
  projectName?: string;
}

const Header: React.FC<HeaderProps> = ({ onExport, onSaveProject, onOpenProject, projectName = 'Untitled Project' }) => {
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProjectMenu(false);
      }
    };

    if (showProjectMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProjectMenu]);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Projects Dropdown - Moved to the left */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProjectMenu(!showProjectMenu)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            <span className="text-xl">Projects</span>
            <ChevronDown className="w-5 h-5" />
          </button>

          {/* Dropdown Menu */}
          {showProjectMenu && (
            <div className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden min-w-[200px]">
              <button
                onClick={() => {
                  onSaveProject();
                  setShowProjectMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-200 flex items-center gap-3"
              >
                <Save className="w-5 h-5" />
                <span className="font-medium">Save Project</span>
              </button>
              <button
                onClick={() => {
                  onOpenProject();
                  setShowProjectMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <FolderOpen className="w-5 h-5" />
                <span className="font-medium">Open Project</span>
              </button>
            </div>
          )}
        </div>

        {/* Project Name Display */}
        <div className="flex-1 text-center">
          <span className="text-lg font-semibold text-gray-700">{projectName}</span>
        </div>

        {/* Export Button */}
        <div className="flex items-center gap-3">
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
