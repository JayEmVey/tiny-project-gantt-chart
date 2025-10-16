import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FolderOpen, Save, FilePlus, Pencil, Check, X } from 'lucide-react';

interface HeaderProps {
  onExport: () => void;
  onSaveProject: () => void;
  onOpenProject: () => void;
  onNewProject: () => void;
  projectName?: string;
  onProjectNameChange?: (name: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  onExport,
  onSaveProject,
  onOpenProject,
  onNewProject,
  projectName = 'Untitled Project',
  onProjectNameChange
}) => {
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(projectName);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update editedName when projectName changes
  useEffect(() => {
    setEditedName(projectName);
  }, [projectName]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

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

  const handleSaveName = () => {
    if (editedName.trim() && onProjectNameChange) {
      onProjectNameChange(editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setEditedName(projectName);
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

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
                  onNewProject();
                  setShowProjectMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-200 flex items-center gap-3"
              >
                <FilePlus className="w-5 h-5" />
                <span className="font-medium">New Project</span>
              </button>
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
        <div className="flex-1 flex items-center justify-center gap-2">
          {isEditingName ? (
            <>
              <input
                ref={inputRef}
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-lg font-semibold text-gray-700 px-3 py-1 border-2 border-blue-500 rounded focus:outline-none"
                maxLength={50}
              />
              <button
                onClick={handleSaveName}
                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Save"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <span className="text-lg font-semibold text-gray-700">{projectName}</span>
              <button
                onClick={() => setIsEditingName(true)}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="Edit project name"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </>
          )}
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
