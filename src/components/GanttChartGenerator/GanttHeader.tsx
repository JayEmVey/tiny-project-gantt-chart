import React from 'react';
import { Calendar, Download, Plus, Upload } from 'lucide-react';
import { ZoomLevel } from '../../types';

interface GanttHeaderProps {
  currentPage: string;
  onTogglePage: () => void;
  onImportCSV: () => void;
  onExportCSV: () => void;
  onAddTask: () => void;
  viewMode?: ZoomLevel;
  onViewModeChange?: (mode: ZoomLevel) => void;
}

const GanttHeader: React.FC<GanttHeaderProps> = ({
  currentPage,
  onTogglePage,
  onImportCSV,
  onExportCSV,
  onAddTask,
  viewMode = 'day',
  onViewModeChange
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Calendar className="w-8 h-8 text-pink-400" />
        <h1 className="text-3xl font-bold text-gray-800">Project Gantt Chart</h1>
      </div>
      <div className="flex gap-3">
        {currentPage === 'chart' && onViewModeChange && (
          <div className="flex gap-1 bg-pink-100 rounded p-1">
            {(['day', 'week', 'month', 'quarter'] as ZoomLevel[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-3 py-1 rounded font-medium text-sm transition ${
                  viewMode === mode
                    ? 'bg-pink-500 text-white'
                    : 'bg-transparent text-gray-700 hover:bg-pink-200'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={onTogglePage}
          className="flex items-center gap-2 px-6 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition font-medium"
        >
          {currentPage === 'edit' ? 'View Chart' : 'Edit Data'}
        </button>
        <button
          onClick={onImportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-pink-300 text-gray-800 rounded hover:bg-pink-400 transition font-medium"
        >
          <Upload className="w-4 h-4" />
          Import CSV
        </button>
        <button
          onClick={onExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-pink-300 text-gray-800 rounded hover:bg-pink-400 transition font-medium"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
        {currentPage === 'edit' && (
          <button
            onClick={onAddTask}
            className="flex items-center gap-2 px-4 py-2 bg-pink-400 text-white rounded hover:bg-pink-500 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Process
          </button>
        )}
      </div>
    </div>
  );
};

export default GanttHeader;