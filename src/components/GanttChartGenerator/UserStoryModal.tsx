import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { UserStory, Epic } from '../../types';

interface UserStoryModalProps {
  isOpen: boolean;
  userStory: UserStory | null;
  epics: Epic[];
  onClose: () => void;
  onSave: (userStory: UserStory) => void;
  onDelete?: (userStoryId: number) => void;
}

const UserStoryModal: React.FC<UserStoryModalProps> = ({
  isOpen,
  userStory,
  epics,
  onClose,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<Partial<UserStory>>({
    name: '',
    epicId: 0,
    assignee: '',
    status: 'not-started',
    priority: 'medium',
    progress: 0,
    description: ''
  });

  useEffect(() => {
    if (userStory) {
      setFormData(userStory);
    } else {
      // Set default epic to the first one if available
      const defaultEpicId = epics.length > 0 ? epics[0].id : 0;
      setFormData({
        name: '',
        epicId: defaultEpicId,
        assignee: '',
        status: 'not-started',
        priority: 'medium',
        progress: 0,
        description: ''
      });
    }
  }, [userStory, epics]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please fill in the User Story name');
      return;
    }
    if (!formData.epicId) {
      alert('Please select an Epic');
      return;
    }

    const userStoryToSave: UserStory = {
      id: userStory?.id || Date.now(),
      name: formData.name,
      epicId: formData.epicId,
      assignee: formData.assignee || '',
      status: formData.status || 'not-started',
      priority: formData.priority || 'medium',
      progress: formData.progress || 0,
      description: formData.description || '',
      isSelected: userStory?.isSelected ?? true
    };

    onSave(userStoryToSave);
    onClose();
  };

  const handleDelete = () => {
    if (userStory && onDelete && window.confirm('Are you sure you want to delete this user story?')) {
      onDelete(userStory.id);
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
            {userStory ? 'Edit User Story' : 'New User Story'}
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
          {/* User Story Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Story <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Epic Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Epic <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.epicId || ''}
              onChange={(e) => setFormData({ ...formData, epicId: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select an Epic</option>
              {epics.map(epic => (
                <option key={epic.id} value={epic.id}>
                  {epic.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignee
            </label>
            <input
              type="text"
              value={formData.assignee || ''}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              {userStory && onDelete && (
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
                {userStory ? 'Save Changes' : 'Create User Story'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserStoryModal;
