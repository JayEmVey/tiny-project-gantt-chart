import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Task, Epic, UserStory, LinkedIssue } from '../../types';
import { getAssigneeList } from '../../utils/assigneeListParser';

interface TaskModalProps {
  isOpen: boolean;
  task: Task | null;
  tasks: Task[];
  epics: Epic[];
  userStories: UserStory[];
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete?: (taskId: number) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  task,
  tasks,
  epics,
  userStories,
  onClose,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    process: '',
    startDate: '',
    endDate: '',
    assignee: '',
    status: 'not-started',
    priority: 'medium',
    progress: 0,
    description: '',
    dependencies: [],
    linkedIssues: [],
    epicId: undefined,
    userStoryId: undefined
  });

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      // Set default epic and user story if available
      const defaultEpicId = epics.length > 0 ? epics[0].id : undefined;
      const defaultUserStoryId = userStories.length > 0 ? userStories[0].id : undefined;
      setFormData({
        process: '',
        startDate: '',
        endDate: '',
        assignee: '',
        status: 'not-started',
        priority: 'medium',
        progress: 0,
        description: '',
        dependencies: [],
        linkedIssues: [],
        epicId: defaultEpicId,
        userStoryId: defaultUserStoryId
      });
    }
  }, [task, epics, userStories]);

  // Helper function to convert DD/MM/YYYY to YYYY-MM-DD for input fields
  const toInputFormat = (dateStr: string): string => {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Helper function to convert YYYY-MM-DD to DD/MM/YYYY
  const fromInputFormat = (dateStr: string): string => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleAddLinkedIssue = () => {
    const newLinkedIssue: LinkedIssue = {
      taskId: 0,
      linkType: 'relates-to'
    };
    setFormData({
      ...formData,
      linkedIssues: [...(formData.linkedIssues || []), newLinkedIssue]
    });
  };

  const handleRemoveLinkedIssue = (index: number) => {
    const updatedLinkedIssues = [...(formData.linkedIssues || [])];
    updatedLinkedIssues.splice(index, 1);
    setFormData({ ...formData, linkedIssues: updatedLinkedIssues });
  };

  const handleLinkedIssueChange = (index: number, field: keyof LinkedIssue, value: any) => {
    const updatedLinkedIssues = [...(formData.linkedIssues || [])];
    updatedLinkedIssues[index] = {
      ...updatedLinkedIssues[index],
      [field]: value
    };
    setFormData({ ...formData, linkedIssues: updatedLinkedIssues });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.process || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }
    if (!formData.epicId) {
      alert('Please select an Epic');
      return;
    }
    if (!formData.userStoryId) {
      alert('Please select a User Story');
      return;
    }

    const taskToSave: Task = {
      id: task?.id || Date.now(),
      process: formData.process,
      startDate: formData.startDate,
      endDate: formData.endDate,
      assignee: formData.assignee || '',
      status: formData.status || 'not-started',
      priority: formData.priority || 'medium',
      progress: formData.progress || 0,
      description: formData.description || '',
      dependencies: formData.dependencies || [],
      linkedIssues: formData.linkedIssues || [],
      epicId: formData.epicId,
      userStoryId: formData.userStoryId
    };

    onSave(taskToSave);
    onClose();
  };

  const handleDelete = () => {
    if (task && onDelete && window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
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
            {task ? 'Edit Task' : 'New Task'}
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
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.process || ''}
              onChange={(e) => setFormData({ ...formData, process: e.target.value })}
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
              onChange={(e) => {
                const epicId = e.target.value ? parseInt(e.target.value) : undefined;
                // Filter user stories based on selected epic
                const filteredUserStories = userStories.filter(us => us.epicId === epicId);
                const newUserStoryId = filteredUserStories.length > 0 ? filteredUserStories[0].id : undefined;
                setFormData({ ...formData, epicId, userStoryId: newUserStoryId });
              }}
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

          {/* User Story Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Story <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.userStoryId || ''}
              onChange={(e) => setFormData({ ...formData, userStoryId: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={!formData.epicId}
            >
              <option value="">Select a User Story</option>
              {userStories
                .filter(us => us.epicId === formData.epicId)
                .map(userStory => (
                  <option key={userStory.id} value={userStory.id}>
                    {userStory.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={toInputFormat(formData.startDate || '')}
                onChange={(e) => setFormData({ ...formData, startDate: fromInputFormat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={toInputFormat(formData.endDate || '')}
                onChange={(e) => setFormData({ ...formData, endDate: fromInputFormat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
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

          {/* Linked Issues */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Linked Issues
              </label>
              <button
                type="button"
                onClick={handleAddLinkedIssue}
                className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Link
              </button>
            </div>
            {formData.linkedIssues && formData.linkedIssues.length > 0 ? (
              <div className="space-y-2">
                {formData.linkedIssues.map((link, index) => (
                  <div key={index} className="flex gap-2 items-start p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Link Type
                        </label>
                        <select
                          value={link.linkType}
                          onChange={(e) => handleLinkedIssueChange(index, 'linkType', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="blocks">Blocks</option>
                          <option value="is-blocked-by">Is blocked by</option>
                          <option value="duplicates">Duplicates</option>
                          <option value="is-duplicated-by">Is duplicated by</option>
                          <option value="clones">Clones</option>
                          <option value="is-cloned-by">Is cloned by</option>
                          <option value="relates-to">Relates to</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Task
                        </label>
                        <select
                          value={link.taskId || ''}
                          onChange={(e) => handleLinkedIssueChange(index, 'taskId', parseInt(e.target.value))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a task</option>
                          {tasks
                            .filter(t => t.id !== task?.id) // Exclude current task
                            .map(t => (
                              <option key={t.id} value={t.id}>
                                {t.process}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLinkedIssue(index)}
                      className="mt-5 text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                      title="Remove link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No linked issues. Click "Add Link" to create a relationship.</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div>
              {task && onDelete && (
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
                {task ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
