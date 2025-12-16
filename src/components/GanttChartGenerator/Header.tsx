import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FolderOpen, Save, FilePlus, Pencil, Check, X, Cloud } from 'lucide-react';

interface HeaderProps {
  onExport: () => void;
  onSaveProject: () => void;
  onSaveToCloud: () => void;
  onOpenProject: () => void;
  onNewProject: () => void;
  projectName?: string;
  onProjectNameChange?: (name: string) => void;
  hasUnsavedChanges?: boolean;
  lastSavedTime?: string | null;
  autoSaveEnabled?: boolean;
  onAutoSaveToggle?: (enabled: boolean) => void;
  fontSizeOption?: 'larger' | 'medium' | 'smaller';
  onFontSizeChange?: (opt: 'larger' | 'medium' | 'smaller') => void;
  viewType?: 'task' | 'user-story' | 'epic';
  onViewTypeChange?: (type: 'task' | 'user-story' | 'epic') => void;
}

const Header: React.FC<HeaderProps> = ({
  onExport,
  onSaveProject,
  onSaveToCloud,
  onOpenProject,
  onNewProject,
  projectName = 'Untitled Project',
  onProjectNameChange,
  hasUnsavedChanges = false,
  lastSavedTime = null,
  autoSaveEnabled = false,
  onAutoSaveToggle,
  fontSizeOption = 'medium',
  onFontSizeChange,
  viewType = 'task',
  onViewTypeChange
}) => {
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(projectName);
  const menuRef = useRef<HTMLDivElement>(null);
  const viewMenuRef = useRef<HTMLDivElement>(null);
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
      if (viewMenuRef.current && !viewMenuRef.current.contains(event.target as Node)) {
        setShowViewMenu(false);
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

  // Format last saved time for display
  const formatLastSavedTime = (isoString: string | null): string => {
    if (!isoString) return '';

    try {
      const savedDate = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - savedDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

      // Format as readable date/time
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return savedDate.toLocaleString('en-US', options);
    } catch (error) {
      return '';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Menus */}
        <div className="flex items-center gap-4">
          {/* Projects Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowProjectMenu(!showProjectMenu)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              <span className="text-xl">Projects</span>
              <ChevronDown className="w-5 h-5" />
            </button>

            {showProjectMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden min-w-[220px]">
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
                  <span className="font-medium">Save to file</span>
                </button>

                <button
                  onClick={() => {
                    onSaveToCloud();
                    setShowProjectMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-200 flex items-center gap-3"
                >
                  <Cloud className="w-5 h-5" />
                  <span className="font-medium">On Cloud</span>
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

          {/* View / Font Size Dropdown */}
          <div className="relative" ref={viewMenuRef}>
            <button
              onClick={() => setShowViewMenu(!showViewMenu)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              <span className="text-xl">View</span>
              <ChevronDown className="w-5 h-5" />
            </button>
            {showViewMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden min-w-[220px]">
                {/* Font Size Section */}
                <div className="px-4 py-2 text-xs text-gray-500 border-b">Font Size</div>
                {(['larger','medium','smaller'] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      onFontSizeChange && onFontSizeChange(opt);
                      setShowViewMenu(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${fontSizeOption === opt ? 'bg-gray-50' : ''}`}
                  >
                    <span className="font-medium capitalize">{opt}</span>
                    {fontSizeOption === opt && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                ))}

                {/* Item View Section */}
                <div className="mt-2 px-4 py-2 text-xs text-gray-500 border-b border-t">Item View</div>
                {[
                  { value: 'task', label: 'Task' },
                  { value: 'user-story', label: 'User Story' },
                  { value: 'epic', label: 'Epic' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => {
                      onViewTypeChange && onViewTypeChange(value as 'task' | 'user-story' | 'epic');
                      setShowViewMenu(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${viewType === value ? 'bg-gray-50' : ''}`}
                  >
                    <span className="font-medium">{label}</span>
                    {viewType === value && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Project Name Display */}
        <div className="flex-1 flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-2">
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
                {hasUnsavedChanges && (
                  <span className="w-2 h-2 bg-orange-500 rounded-full" title="Unsaved changes"></span>
                )}
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
          {lastSavedTime && (
            <div className="text-sm text-gray-500">
              Last Modified: {formatLastSavedTime(lastSavedTime)}
            </div>
          )}
        </div>

        {/* AutoSave Toggle and Export Button */}
        <div className="flex items-center gap-3">
          {/* AutoSave Toggle */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <span className="text-sm font-medium text-gray-700">AutoSave</span>
            <button
              onClick={() => onAutoSaveToggle && onAutoSaveToggle(!autoSaveEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                autoSaveEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
              title={autoSaveEnabled ? 'Auto-save enabled' : 'Auto-save disabled'}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  autoSaveEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-xs text-gray-500">
              {autoSaveEnabled ? 'On' : 'Off'}
            </span>
          </div>

          {/* Cloud Save Icon - Quick Save */}
          <button
            onClick={onSaveToCloud}
            className="flex items-center justify-center p-2 border-2 border-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
            title="Quick save to cloud"
          >
            <Cloud className="w-5 h-5" strokeWidth={2} />
          </button>

          {/* Export Button */}
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
