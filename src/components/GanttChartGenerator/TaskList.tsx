import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, ChevronRight, ChevronsLeft, Copy, Trash2 } from 'lucide-react';
import { Task, Epic, UserStory } from '../../types';

interface TaskListProps {
  tasks: Task[];
  epics: Epic[];
  userStories: UserStory[];
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
  onEpicToggle: (epicId: number) => void;
  onUserStoryToggle: (userStoryId: number) => void;
  onAddEpic: () => void;
  onAddUserStory: (epicId: number) => void;
  onEpicClick?: (epic: Epic) => void;
  onUserStoryClick?: (userStory: UserStory) => void;
  onToggleCollapse?: () => void;
  onCloneEpic?: (epicId: number) => void;
  onDeleteEpic?: (epicId: number) => void;
  onToggleAllEpics?: (selectAll: boolean) => void;
  onEpicReorder?: (epicId: number, targetEpicId: number) => void;
  onUserStoryReorder?: (userStoryId: number, targetUserStoryId: number) => void;
  onTaskReorder?: (taskId: number, targetTaskId: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  epics,
  userStories,
  onAddTask,
  onTaskClick,
  onEpicToggle,
  onUserStoryToggle,
  onAddEpic,
  onAddUserStory,
  onEpicClick,
  onUserStoryClick,
  onToggleCollapse,
  onCloneEpic,
  onDeleteEpic,
  onToggleAllEpics,
  onEpicReorder,
  onUserStoryReorder,
  onTaskReorder
}) => {
  const [expandedEpics, setExpandedEpics] = useState<Set<number>>(new Set());
  const [expandedUserStories, setExpandedUserStories] = useState<Set<number>>(new Set());
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Drag and drop state
  const [draggedEpicId, setDraggedEpicId] = useState<number | null>(null);
  const [draggedUserStoryId, setDraggedUserStoryId] = useState<number | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [dragOverEpicId, setDragOverEpicId] = useState<number | null>(null);
  const [dragOverUserStoryId, setDragOverUserStoryId] = useState<number | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<number | null>(null);

  // Get selected epics
  const selectedEpics = epics.filter(epic => epic.isSelected);
  const hasSelectedEpics = selectedEpics.length > 0;
  const allEpicsSelected = epics.length > 0 && epics.every(epic => epic.isSelected);

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

  const handleCheckUncheckAll = () => {
    // Use the bulk toggle if available, otherwise fall back to individual toggles
    if (onToggleAllEpics) {
      onToggleAllEpics(!allEpicsSelected);
    } else {
      // Fallback: Toggle all epics individually
      if (allEpicsSelected) {
        // Uncheck all
        epics.forEach(epic => {
          if (epic.isSelected) {
            onEpicToggle(epic.id);
          }
        });
      } else {
        // Check all
        epics.forEach(epic => {
          if (!epic.isSelected) {
            onEpicToggle(epic.id);
          }
        });
      }
    }
  };

  const handleCloneSelected = () => {
    if (selectedEpics.length > 0 && onCloneEpic) {
      selectedEpics.forEach(epic => {
        onCloneEpic(epic.id);
      });
    }
  };

  const handleDeleteSelected = () => {
    if (selectedEpics.length > 0 && onDeleteEpic) {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete ${selectedEpics.length} epic(s)? This will also delete all related user stories and tasks.`
      );
      if (confirmDelete) {
        selectedEpics.forEach(epic => {
          onDeleteEpic(epic.id);
        });
      }
    }
  };

  // Get user stories for an epic
  const getUserStoriesForEpic = (epicId: number) => {
    return userStories.filter(us => us.epicId === epicId);
  };

  // Get tasks for a user story
  const getTasksForUserStory = (userStoryId: number) => {
    return tasks.filter(task => task.userStoryId === userStoryId);
  };

  // Placeholder for future handlers if needed

  const handleToggleAll = () => {
    if (isAllExpanded) {
      // Collapse all
      setExpandedEpics(new Set());
      setExpandedUserStories(new Set());
    } else {
      // Expand all
      const allEpics = new Set(epics.map(epic => epic.id));
      const allUserStories = new Set(userStories.map(story => story.id));
      setExpandedEpics(allEpics);
      setExpandedUserStories(allUserStories);
    }
    setIsAllExpanded(!isAllExpanded);
  };

  // Drag handlers for Epics
  const handleEpicDragStart = (e: React.DragEvent, epicId: number) => {
    setDraggedEpicId(epicId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', epicId.toString());
  };

  const handleEpicDragOver = (e: React.DragEvent, epicId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverEpicId(epicId);
  };

  const handleEpicDragLeave = () => {
    setDragOverEpicId(null);
  };

  const handleEpicDrop = (e: React.DragEvent, targetEpicId: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedEpicId !== null && draggedEpicId !== targetEpicId && onEpicReorder) {
      onEpicReorder(draggedEpicId, targetEpicId);
    }

    setDraggedEpicId(null);
    setDragOverEpicId(null);
  };

  const handleEpicDragEnd = () => {
    setDraggedEpicId(null);
    setDragOverEpicId(null);
  };

  // Drag handlers for User Stories
  const handleUserStoryDragStart = (e: React.DragEvent, userStoryId: number) => {
    e.stopPropagation();
    setDraggedUserStoryId(userStoryId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', userStoryId.toString());
  };

  const handleUserStoryDragOver = (e: React.DragEvent, userStoryId: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverUserStoryId(userStoryId);
  };

  const handleUserStoryDragLeave = () => {
    setDragOverUserStoryId(null);
  };

  const handleUserStoryDrop = (e: React.DragEvent, targetUserStoryId: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedUserStoryId !== null && draggedUserStoryId !== targetUserStoryId && onUserStoryReorder) {
      onUserStoryReorder(draggedUserStoryId, targetUserStoryId);
    }

    setDraggedUserStoryId(null);
    setDragOverUserStoryId(null);
  };

  const handleUserStoryDragEnd = () => {
    setDraggedUserStoryId(null);
    setDragOverUserStoryId(null);
  };

  // Drag handlers for Tasks
  const handleTaskDragStart = (e: React.DragEvent, taskId: number) => {
    e.stopPropagation();
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId.toString());
  };

  const handleTaskDragOver = (e: React.DragEvent, taskId: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTaskId(taskId);
  };

  const handleTaskDragLeave = () => {
    setDragOverTaskId(null);
  };

  const handleTaskDrop = (e: React.DragEvent, targetTaskId: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedTaskId !== null && draggedTaskId !== targetTaskId && onTaskReorder) {
      onTaskReorder(draggedTaskId, targetTaskId);
    }

    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  const handleTaskDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header with Actions */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        {/* Top Row: Add, Clone, Delete, Collapse */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleAll}
              className="flex items-center justify-center p-2 border-2 border-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
              title={isAllExpanded ? "Collapse all" : "Expand all"}
            >
              {isAllExpanded ? (
                <ChevronRight className="w-5 h-5" strokeWidth={2} />
              ) : (
                <ChevronDown className="w-5 h-5" strokeWidth={2} />
              )}
            </button>
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center justify-center p-2 border-2 border-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
              title="Add new item"
            >
              <Plus className="w-5 h-5" strokeWidth={2} />
            </button>

            {hasSelectedEpics && onCloneEpic && (
              <button
                onClick={handleCloneSelected}
                className="flex items-center justify-center px-3 py-2 border-2 border-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
                title="Clone selected epic(s)"
              >
                <Copy className="w-4 h-4" strokeWidth={2} />
              </button>
            )}

            {hasSelectedEpics && onDeleteEpic && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center justify-center px-3 py-2 border-2 border-gray-800 rounded-lg hover:bg-gray-50 transition-colors"
                title="Delete selected epic(s)"
              >
                <Trash2 className="w-4 h-4" strokeWidth={2} />
              </button>
            )}
          </div>

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

        {/* Bottom Row: Check/Uncheck All */}
        {epics.length > 0 && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allEpicsSelected}
              onChange={handleCheckUncheckAll}
              className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-600">Check/Uncheck All</span>
          </div>
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
            <div
              key={epic.id}
              className="border-b border-gray-200"
            >
              {/* Epic Level */}
              <div
                draggable
                onDragStart={(e) => handleEpicDragStart(e, epic.id)}
                onDragOver={(e) => handleEpicDragOver(e, epic.id)}
                onDragLeave={handleEpicDragLeave}
                onDrop={(e) => handleEpicDrop(e, epic.id)}
                onDragEnd={handleEpicDragEnd}
                className={`flex items-center px-4 py-3 hover:bg-gray-50 cursor-move transition-colors ${
                  draggedEpicId === epic.id ? 'opacity-50' : ''
                } ${
                  dragOverEpicId === epic.id && draggedEpicId !== epic.id ? 'border-t-2 border-blue-500' : ''
                }`}
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
                <div className="ml-2 flex items-center gap-2">
                  <div className="w-4 h-4 rounded flex-shrink-0" style={{ backgroundColor: '#9A4D99' }} />
                  <span className="font-bold text-gray-800">{epic.name}</span>
                </div>
              </div>

              {/* User Stories under Epic */}
              {expandedEpics.has(epic.id) && (
                <div className="ml-6">
                  {getUserStoriesForEpic(epic.id).map((userStory) => (
                    <div key={userStory.id}>
                      {/* User Story Level */}
                      <div
                        draggable
                        onDragStart={(e) => handleUserStoryDragStart(e, userStory.id)}
                        onDragOver={(e) => handleUserStoryDragOver(e, userStory.id)}
                        onDragLeave={handleUserStoryDragLeave}
                        onDrop={(e) => handleUserStoryDrop(e, userStory.id)}
                        onDragEnd={handleUserStoryDragEnd}
                        className={`flex items-center px-4 py-2 hover:bg-gray-50 cursor-move transition-colors ${
                          draggedUserStoryId === userStory.id ? 'opacity-50' : ''
                        } ${
                          dragOverUserStoryId === userStory.id && draggedUserStoryId !== userStory.id ? 'border-t-2 border-blue-500' : ''
                        }`}
                        onClick={() => toggleUserStory(userStory.id)}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          if (onUserStoryClick) {
                            onUserStoryClick(userStory);
                          }
                        }
                        }
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
                        <div className="ml-2 flex items-center gap-2">
                          <div className="w-4 h-4 rounded flex-shrink-0" style={{ backgroundColor: '#00694C' }} />
                          <span className="font-medium text-gray-700">{userStory.name}</span>
                        </div>
                      </div>

                      {/* Tasks under User Story */}
                      {expandedUserStories.has(userStory.id) && (
                        <div className="ml-6">
                          {getTasksForUserStory(userStory.id).map((task) => (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={(e) => handleTaskDragStart(e, task.id)}
                              onDragOver={(e) => handleTaskDragOver(e, task.id)}
                              onDragLeave={handleTaskDragLeave}
                              onDrop={(e) => handleTaskDrop(e, task.id)}
                              onDragEnd={handleTaskDragEnd}
                              onClick={() => onTaskClick(task)}
                              className={`flex items-center px-4 py-2 hover:bg-gray-50 cursor-move transition-colors ${
                                draggedTaskId === task.id ? 'opacity-50' : ''
                              } ${
                                dragOverTaskId === task.id && draggedTaskId !== task.id ? 'border-t-2 border-blue-500' : ''
                              }`}
                            >
                              <div className="ml-6 flex items-center gap-2">
                                <div className="w-3.5 h-3.5 rounded flex-shrink-0" style={{ backgroundColor: '#0085CA' }} />
                                <span className="text-sm text-gray-600">{task.process}</span>
                              </div>
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
