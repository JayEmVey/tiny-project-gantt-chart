import React from 'react';
import { ZoomLevel, ViewType } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ViewControlsProps {
  zoomLevel: ZoomLevel;
  onZoomChange: (level: ZoomLevel) => void;
  viewType: ViewType;
  onViewTypeChange: (type: ViewType) => void;
  showCriticalPath: boolean;
  onToggleCriticalPath: (show: boolean) => void;
  onNavigateLeft?: () => void;
  onNavigateRight?: () => void;
  onNavigateToToday?: () => void;
}

const ViewControls: React.FC<ViewControlsProps> = ({
  zoomLevel,
  onZoomChange,
  viewType,
  onViewTypeChange,
  showCriticalPath,
  onToggleCriticalPath,
  onNavigateLeft,
  onNavigateRight,
  onNavigateToToday
}) => {
  const zoomLevels: ZoomLevel[] = ['day', 'week', 'month', 'quarter'];
  const viewTypes: ViewType[] = ['task', 'user-story', 'epic'];

  const formatViewType = (type: ViewType): string => {
    if (type === 'user-story') return 'User Story';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side controls */}
        <div className="flex items-center gap-4">
          {/* View Type Selector */}
          <div className="flex items-center gap-2">
            <label className="text-gray-700 font-medium text-sm">View:</label>
            <select
              value={viewType}
              onChange={(e) => onViewTypeChange(e.target.value as ViewType)}
              className="px-4 py-2 border-2 border-gray-800 rounded-lg font-medium cursor-pointer hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-1"
            >
              {viewTypes.map((type) => (
                <option key={type} value={type}>
                  {formatViewType(type)}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Selector - Segmented Control */}
          <div className="inline-flex border-2 border-gray-800 rounded-lg overflow-hidden">
            {zoomLevels.map((level) => (
              <button
                key={level}
                onClick={() => onZoomChange(level)}
                className={`
                  px-6 py-2 font-medium capitalize transition-all border-r-2 last:border-r-0 border-gray-800
                  ${zoomLevel === level
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center gap-4">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCriticalPath}
                onChange={(e) => onToggleCriticalPath(e.target.checked)}
                className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer"
              />
              <span className="text-gray-700 font-medium">Critical Path</span>
            </label>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateLeft}
              className="p-2 border-2 border-gray-800 rounded hover:bg-gray-50 transition-colors"
              title="Navigate left"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2} />
            </button>
            <button
              onClick={onNavigateToToday}
              className="px-4 py-2 border-2 border-gray-800 rounded hover:bg-gray-50 transition-colors font-medium"
              title="Go to today"
            >
              Today
            </button>
            <button
              onClick={onNavigateRight}
              className="p-2 border-2 border-gray-800 rounded hover:bg-gray-50 transition-colors"
              title="Navigate right"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewControls;
