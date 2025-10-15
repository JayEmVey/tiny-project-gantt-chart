import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, ChevronRight, ChevronsLeft } from 'lucide-react';
import { Task, Epic, UserStory } from '../../types';

interface TaskListProps {
  tasks: Task[];
  epics: Epic[];
  userStories: UserStory[];
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
  onTaskReorder: (fromIndex: number, toIndex: number) => void;
  onEpicToggle: (epicId: number) => void;
  onUserStoryToggle: (userStoryId: number) => void;
  onAddEpic: () => void;
  onAddUserStory: (epicId: number) => void;
  onEpicClick?: (epic: Epic) => void;
  onUserStoryClick?: (userStory: UserStory) => void;
  onToggleCollapse?: () => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  epics,
  userStories,
  onAddTask,
  onTaskClick,
  onTaskReorder,
  onEpicToggle,
  onUserStoryToggle,
  onAddEpic,
  onAddUserStory,
  onEpicClick,
  onUserStoryClick,
  onToggleCollapse
}) => {
  const [expandedEpics, setExpandedEpics] = useState<Set<number>>(new Set());
  const [expandedUserStories, setExpandedUserStories] = useState<Set<number>>(new Set());
  const [draggedTaskIndex, setDraggedTaskIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    };

    if (showAddMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddMenu]);

  const toggleEpic = (epicId: number) => {
    setExpandedEpics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(epicId)) {
        newSet.delete(epicId);
      } else {
        newSet.add(epicId);
      }
      return newSet;
    });
  };

  const toggleUserStory = (userStoryId: number) => {
    setExpandedUserStories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userStoryId)) {
        newSet.delete(userStoryId);
      } else {
        newSet.add(userStoryId);
      }
      return newSet;
    });
  };

  // Get user stories for an epic
  const getUserStoriesForEpic = (epicId: number) => {
    return userStories.filter(us => us.epicId === epicId);
  };

  // Get tasks for a user story
  const getTasksForUserStory = (userStoryId: number) => {
    return tasks.filter(task => task.userStoryId === userStoryId);
  };

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
      {/* Header with Collapse Button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex items-center justify-center p-2 border-2 border-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-5 h-5" strokeWidth={2} />
        </button>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Hide sidebar"
          >
            <ChevronsLeft className="w-5 h-5" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Add Button Dropdown Menu */}
      {showAddMenu && (
        <div className="absolute top-20 left-4 right-4 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden" ref={addMenuRef}>
            <button
              onClick={() => {
                onAddTask();
                setShowAddMenu(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-200"
            >
              <span className="font-medium">New Task</span>
            </button>
            <button
              onClick={() => {
                // For now, add to first epic if available
                if (epics.length > 0) {
                  onAddUserStory(epics[0].id);
                }
                setShowAddMenu(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-200"
            >
              <span className="font-medium">New User Story</span>
            </button>
            <button
              onClick={() => {
                onAddEpic();
                setShowAddMenu(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">New Epic</span>
            </button>
        </div>
      )}

      {/* Hierarchical List: Epics → User Stories → Tasks */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-0">
          {epics.map((epic) => (
            <div key={epic.id} className="border-b border-gray-200">
              {/* Epic Level */}
              <div
                className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleEpic(epic.id)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (onEpicClick) {
                    onEpicClick(epic);
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={epic.isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    onEpicToggle(epic.id);
                  }}
                  className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  className="ml-2 text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleEpic(epic.id);
                  }}
                >
                  {expandedEpics.has(epic.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                <span className="ml-2 font-bold text-gray-800">{epic.name}</span>
              </div>

              {/* User Stories under Epic */}
              {expandedEpics.has(epic.id) && (
                <div className="ml-6">
                  {getUserStoriesForEpic(epic.id).map((userStory) => (
                    <div key={userStory.id}>
                      {/* User Story Level */}
                      <div
                        className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleUserStory(userStory.id)}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          if (onUserStoryClick) {
                            onUserStoryClick(userStory);
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={userStory.isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            onUserStoryToggle(userStory.id);
                          }}
                          className="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          className="ml-2 text-gray-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleUserStory(userStory.id);
                          }}
                        >
                          {expandedUserStories.has(userStory.id) ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </button>
                        <span className="ml-2 font-medium text-gray-700">{userStory.name}</span>
                      </div>

                      {/* Tasks under User Story */}
                      {expandedUserStories.has(userStory.id) && (
                        <div className="ml-6">
                          {getTasksForUserStory(userStory.id).map((task) => (
                            <div
                              key={task.id}
                              onClick={() => onTaskClick(task)}
                              className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                            >
                              <span className="ml-6 text-sm text-gray-600">{task.process}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
