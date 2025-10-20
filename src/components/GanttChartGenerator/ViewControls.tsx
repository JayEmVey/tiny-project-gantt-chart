import React from 'react';
import { ZoomLevel, ViewType } from '../../types';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface ViewControlsProps {
  viewType: ViewType;
  onViewTypeChange: (type: ViewType) => void;
  zoomLevel: ZoomLevel;
  onZoomChange: (level: ZoomLevel) => void;
  zoomScale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  showCriticalPath: boolean;
  onToggleCriticalPath: (show: boolean) => void;
  onNavigateLeft?: () => void;
  onNavigateRight?: () => void;
  onNavigateToToday?: () => void;
  useWxGantt?: boolean;
  onToggleWxGantt?: (use: boolean) => void;
}

const ViewControls: React.FC<ViewControlsProps> = ({
  viewType,
  onViewTypeChange,
  zoomLevel,
  onZoomChange,
  zoomScale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  showCriticalPath,
  onToggleCriticalPath,
  onNavigateLeft,
  onNavigateRight,
  onNavigateToToday,
  useWxGantt = true,
  onToggleWxGantt
}) => {
  const viewTypes: ViewType[] = ['task', 'user-story', 'epic'];
  const zoomLevels: ZoomLevel[] = ['day', 'week', 'month'];

  const formatViewType = (type: ViewType): string => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
          {/* Chart Library Toggle */}
          {onToggleWxGantt && (
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useWxGantt}
                  onChange={(e) => onToggleWxGantt(e.target.checked)}
                  className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer"
                />
                <span className="text-gray-700 font-medium">wx-react-gantt</span>
              </label>
            </div>
          )}

          {/* Critical Path Toggle */}
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

          {/* Zoom Scale Controls */}
          <div className="flex items-center gap-2 border-2 border-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={onZoomOut}
              disabled={zoomScale <= 0.25}
              className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom out (Ctrl/Cmd + -)"
            >
              <ZoomOut className="w-5 h-5" strokeWidth={2} />
            </button>
            <button
              onClick={onResetZoom}
              className="px-3 py-2 hover:bg-gray-50 transition-colors border-x-2 border-gray-800 font-medium text-sm min-w-[60px]"
              title="Reset zoom (Ctrl/Cmd + 0)"
            >
              {Math.round(zoomScale * 100)}%
            </button>
            <button
              onClick={onZoomIn}
              disabled={zoomScale >= 3.0}
              className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom in (Ctrl/Cmd + +)"
            >
              <ZoomIn className="w-5 h-5" strokeWidth={2} />
            </button>
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
