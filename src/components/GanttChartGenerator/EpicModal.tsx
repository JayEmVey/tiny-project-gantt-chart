import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Epic } from '../../types';
import { getAssigneeList } from '../../utils/assigneeListParser';

interface EpicModalProps {
  isOpen: boolean;
  epic: Epic | null;
  onClose: () => void;
  onSave: (epic: Epic) => void;
  onDelete?: (epicId: number) => void;
}

const EpicModal: React.FC<EpicModalProps> = ({ isOpen, epic, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Epic>>({
    name: '',
    assignee: '',
    status: 'not-started',
    priority: 'medium',
    progress: 0,
    description: ''
  });

  useEffect(() => {
    if (epic) {
      setFormData(epic);
    } else {
      setFormData({
        name: '',
        assignee: '',
        status: 'not-started',
        priority: 'medium',
        progress: 0,
        description: ''
      });
    }
  }, [epic]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please fill in the Epic name');
      return;
    }

    const epicToSave: Epic = {
      id: epic?.id || Date.now(),
      name: formData.name,
      assignee: formData.assignee || '',
      status: formData.status || 'not-started',
      priority: formData.priority || 'medium',
      progress: formData.progress || 0,
      description: formData.description || '',
      isSelected: epic?.isSelected ?? true
    };

    onSave(epicToSave);
    onClose();
  };

  const handleDelete = () => {
    if (epic && onDelete && window.confirm('Are you sure you want to delete this epic?')) {
      onDelete(epic.id);
      onClose();
    }
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
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {epic ? 'Edit Epic' : 'New Epic'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Epic Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Epic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignee
            </label>
            <select
              value={formData.assignee || ''}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an assignee</option>
              {getAssigneeList().map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status || 'not-started'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority || 'medium'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Progress ({formData.progress || 0}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.progress || 0}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div>
              {epic && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-6 py-2 text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {epic ? 'Save Changes' : 'Create Epic'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EpicModal;
