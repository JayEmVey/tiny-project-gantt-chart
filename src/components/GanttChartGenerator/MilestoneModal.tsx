import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Milestone } from '../../types';

interface MilestoneModalProps {
  isOpen: boolean;
  milestone: Milestone | null;
  onClose: () => void;
  onSave: (milestone: Milestone) => void;
  onDelete?: (milestoneId: number) => void;
}

const MilestoneModal: React.FC<MilestoneModalProps> = ({ isOpen, milestone, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Milestone>>({
    name: '',
    date: '',
    color: '#10b981' // Default green color
  });

  // Predefined color options
  const colorOptions = [
    { name: 'Green', value: '#10b981', class: 'bg-green-500' },
    { name: 'Red', value: '#ef4444', class: 'bg-red-500' },
    { name: 'Blue', value: '#3b82f6', class: 'bg-blue-500' },
    { name: 'Yellow', value: '#eab308', class: 'bg-yellow-500' },
    { name: 'Purple', value: '#a855f7', class: 'bg-purple-500' },
    { name: 'Orange', value: '#f97316', class: 'bg-orange-500' },
    { name: 'Pink', value: '#ec4899', class: 'bg-pink-500' },
    { name: 'Indigo', value: '#6366f1', class: 'bg-indigo-500' }
  ];

  useEffect(() => {
    if (milestone) {
      setFormData(milestone);
    } else {
      setFormData({
        name: '',
        date: '',
        color: '#10b981'
      });
    }
  }, [milestone, isOpen]);

  // Convert DD/MM/YYYY to YYYY-MM-DD for input
  const toInputDate = (ddmmyyyy: string): string => {
    if (!ddmmyyyy) return '';
    const [day, month, year] = ddmmyyyy.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Convert YYYY-MM-DD to DD/MM/YYYY
  const toStorageDate = (yyyymmdd: string): string => {
    if (!yyyymmdd) return '';
    const [year, month, day] = yyyymmdd.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please fill in the milestone name');
      return;
    }
    if (!formData.date) {
      alert('Please select a date');
      return;
    }

    const milestoneToSave: Milestone = {
      id: milestone?.id || Date.now(),
      name: formData.name,
      date: formData.date,
      color: formData.color || '#10b981'
    };

    onSave(milestoneToSave);
    onClose();
  };

  const handleDelete = () => {
    if (milestone && onDelete && window.confirm('Are you sure you want to delete this milestone?')) {
      onDelete(milestone.id);
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
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {milestone ? 'Edit Milestone' : 'New Milestone'}
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
          {/* Milestone Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Milestone Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., MVP Release"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={toInputDate(formData.date || '')}
              onChange={(e) => setFormData({ ...formData, date: toStorageDate(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-4 gap-3">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: option.value })}
                  className={`relative w-full h-12 rounded-lg ${option.class} transition-all ${
                    formData.color === option.value
                      ? 'ring-4 ring-blue-500 ring-offset-2'
                      : 'hover:scale-105'
                  }`}
                  title={option.name}
                >
                  {formData.color === option.value && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div>
              {milestone && onDelete && (
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
                {milestone ? 'Save Changes' : 'Create Milestone'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MilestoneModal;
