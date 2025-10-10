import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Task } from '../../types';

interface TaskListProps {
  tasks: Task[];
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
  onTaskReorder: (fromIndex: number, toIndex: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onAddTask, onTaskClick, onTaskReorder }) => {
  const [draggedTaskIndex, setDraggedTaskIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedTaskIndex(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    // Add slight transparency to the dragged element
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }

    // Perform the reorder
    if (draggedTaskIndex !== null && dropTargetIndex !== null && draggedTaskIndex !== dropTargetIndex) {
      onTaskReorder(draggedTaskIndex, dropTargetIndex);
    }

    setDraggedTaskIndex(null);
    setDropTargetIndex(null);
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedTaskIndex === null) return;

    setDropTargetIndex(index);
  };

  const handleDragLeave = () => {
    // Only clear if we're actually leaving the list
    setDropTargetIndex(null);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* New Task Button */}
      <div className="p-4">
        <button
          onClick={onAddTask}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-5 h-5" strokeWidth={2} />
          <span className="font-medium text-lg">New Task</span>
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-0">
          {tasks.map((task, index) => (
            <React.Fragment key={task.id}>
              {/* Drop indicator line */}
              {isDragging && dropTargetIndex === index && draggedTaskIndex !== index && (
                <div className="h-0.5 bg-blue-500 mx-4 relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full -ml-1"></div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full -mr-1"></div>
                </div>
              )}

              <div
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onClick={() => onTaskClick(task)}
                className={`
                  px-4 py-3 border-b border-gray-100 cursor-move hover:bg-gray-50 transition-all duration-300
                  ${draggedTaskIndex === index ? 'opacity-50' : 'opacity-100'}
                  ${dropTargetIndex === index && draggedTaskIndex !== index ? 'bg-blue-50' : ''}
                `}
                style={{
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={(e) => {
                      e.stopPropagation();
                      // Handle checkbox change
                    }}
                    className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-gray-700 font-medium">{task.process}</span>
                </div>
              </div>
            </React.Fragment>
          ))}

          {/* Drop indicator at the end */}
          {isDragging && dropTargetIndex === tasks.length && (
            <div className="h-0.5 bg-blue-500 mx-4 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full -ml-1"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full -mr-1"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
