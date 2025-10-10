import React from 'react';
import { ZoomLevel } from '../../types';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface ViewControlsProps {
  zoomLevel: ZoomLevel;
  onZoomChange: (level: ZoomLevel) => void;
  showCriticalPath: boolean;
  onToggleCriticalPath: (show: boolean) => void;
}

const ViewControls: React.FC<ViewControlsProps> = ({
  zoomLevel,
  onZoomChange,
  showCriticalPath,
  onToggleCriticalPath
}) => {
  const zoomLevels: ZoomLevel[] = ['day', 'week', 'month', 'quarter'];

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* View Mode Selector */}
        <div className="flex items-center gap-2">
          <span className="text-gray-700 font-medium mr-2">Day</span>
          <div className="flex border-2 border-gray-800 rounded-lg overflow-hidden">
            {zoomLevels.slice(1).map((level) => (
              <button
                key={level}
                onClick={() => onZoomChange(level)}
                className={`
                  px-6 py-2 font-medium capitalize transition-colors border-r-2 last:border-r-0 border-gray-800
                  ${zoomLevel === level
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
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
            <button className="p-2 border-2 border-gray-800 rounded hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-5 h-5" strokeWidth={2} />
            </button>
            <button className="p-2 border-2 border-gray-800 rounded hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </button>
            <button className="p-2 border-2 border-gray-800 rounded hover:bg-gray-50 transition-colors">
              <span className="px-2 font-medium">•••</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewControls;
