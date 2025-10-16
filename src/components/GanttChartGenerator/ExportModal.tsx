import React, { useState } from 'react';
import { X, Download, Image, FileText } from 'lucide-react';
import { ZoomLevel } from '../../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  currentZoomLevel: ZoomLevel;
}

export interface ExportOptions {
  fileType: 'image' | 'pdf';
  viewMode: ZoomLevel;
  scale: 'fit' | 'zoom-in' | 'zoom-out' | 'actual';
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport, currentZoomLevel }) => {
  const [fileType, setFileType] = useState<'image' | 'pdf'>('pdf');
  const [viewMode, setViewMode] = useState<ZoomLevel>(currentZoomLevel);
  const [scale, setScale] = useState<'fit' | 'zoom-in' | 'zoom-out' | 'actual'>('fit');

  const handleExport = () => {
    onExport({ fileType, viewMode, scale });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Export Gantt Chart</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* File Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              File Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFileType('image')}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                  fileType === 'image'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Image className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">Image</div>
                  <div className="text-xs text-gray-500">PNG format</div>
                </div>
              </button>
              <button
                onClick={() => setFileType('pdf')}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                  fileType === 'pdf'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <FileText className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">PDF</div>
                  <div className="text-xs text-gray-500">Portable document</div>
                </div>
              </button>
            </div>
          </div>

          {/* View Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              View Mode
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['day', 'week', 'month', 'quarter'] as ZoomLevel[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 border-2 rounded-lg capitalize transition-all font-medium ${
                    viewMode === mode
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Scale Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Scale
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setScale('fit')}
                className={`px-4 py-3 border-2 rounded-lg transition-all ${
                  scale === 'fit'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Fit to Page
              </button>
              <button
                onClick={() => setScale('actual')}
                className={`px-4 py-3 border-2 rounded-lg transition-all ${
                  scale === 'actual'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Actual Size
              </button>
              <button
                onClick={() => setScale('zoom-in')}
                className={`px-4 py-3 border-2 rounded-lg transition-all ${
                  scale === 'zoom-in'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Zoom In (150%)
              </button>
              <button
                onClick={() => setScale('zoom-out')}
                className={`px-4 py-3 border-2 rounded-lg transition-all ${
                  scale === 'zoom-out'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Zoom Out (75%)
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
