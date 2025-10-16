import React, { useState, useRef, useEffect } from 'react';
import { Task, ZoomLevel, Epic, UserStory, Milestone } from '../../types';
import Header from './Header';
import TaskList from './TaskList';
import TaskModal from './TaskModal';
import EpicModal from './EpicModal';
import UserStoryModal from './UserStoryModal';
import MilestoneModal from './MilestoneModal';
import ExportModal, { ExportOptions } from './ExportModal';
import ViewControls from './ViewControls';
import GanttChartView from './GanttChartView';
import { saveProjectToFile, openProjectFile } from '../../utils/projectFileHandler';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './animations.css';

const GanttChartMain: React.FC = () => {
  // Initial sample data
  const getInitialEpics = (): Epic[] => {
    return [
      { id: 1, name: 'Epic 1', isSelected: true },
      { id: 2, name: 'Epic 2', isSelected: false },
      { id: 3, name: 'Epic 3', isSelected: false }
    ];
  };

  const getInitialUserStories = (): UserStory[] => {
    return [
      { id: 1, epicId: 1, name: 'User Story 1', isSelected: true },
      { id: 2, epicId: 1, name: 'User Story 2', isSelected: true },
      { id: 3, epicId: 2, name: 'User Story 3', isSelected: false },
      { id: 4, epicId: 3, name: 'User Story 4', isSelected: false }
    ];
  };

  const getInitialTasks = (): Task[] => {
    return [
      {
        id: 1,
        process: 'Task 1',
        startDate: '01/01/2025',
        endDate: '28/02/2025',
        assignee: 'John Doe',
        status: 'completed',
        priority: 'high',
        progress: 100,
        description: 'First task',
        dependencies: [],
        epicId: 1,
        userStoryId: 1
      },
      {
        id: 2,
        process: 'Task 2',
        startDate: '01/03/2025',
        endDate: '15/04/2025',
        assignee: 'Jane Smith',
        status: 'in-progress',
        priority: 'medium',
        progress: 60,
        description: 'Second task',
        dependencies: [1],
        epicId: 1,
        userStoryId: 1
      },
      {
        id: 3,
        process: 'Task 3',
        startDate: '15/04/2025',
        endDate: '31/05/2025',
        assignee: 'Bob Johnson',
        status: 'not-started',
        priority: 'high',
        progress: 0,
        description: 'Third task',
        dependencies: [2],
        epicId: 1,
        userStoryId: 2
      }
    ];
  };

  const [epics, setEpics] = useState<Epic[]>(getInitialEpics);
  const [userStories, setUserStories] = useState<UserStory[]>(getInitialUserStories);
  const [tasks, setTasks] = useState<Task[]>(getInitialTasks);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [projectName, setProjectName] = useState('My Project');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEpicModalOpen, setIsEpicModalOpen] = useState(false);
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
  const [isUserStoryModalOpen, setIsUserStoryModalOpen] = useState(false);
  const [editingUserStory, setEditingUserStory] = useState<UserStory | null>(null);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('day');
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [isTaskListCollapsed, setIsTaskListCollapsed] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const ganttScrollRef = useRef<HTMLDivElement>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState<string>('');

  // Navigate to current day on mount
  useEffect(() => {
    // Use a small delay to ensure the DOM is fully rendered
    const timer = setTimeout(() => {
      if (!ganttScrollRef.current) return;

      const today = new Date();
      const yearStart = new Date(today.getFullYear(), 0, 1);
      let todayIndex = 0;

      if (zoomLevel === 'day') {
        todayIndex = Math.floor((today.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
      } else if (zoomLevel === 'week') {
        todayIndex = Math.floor((today.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24 * 7));
      } else if (zoomLevel === 'month') {
        todayIndex = today.getMonth();
      } else if (zoomLevel === 'quarter') {
        todayIndex = Math.floor(today.getMonth() / 3);
      }

      // Calculate scroll position to center today
      const totalColumns = zoomLevel === 'day' ? 365 : zoomLevel === 'week' ? 52 : zoomLevel === 'month' ? 12 : 4;
      const scrollAmount = (todayIndex / totalColumns) * ganttScrollRef.current.scrollWidth;
      ganttScrollRef.current.scrollTo({ left: scrollAmount - ganttScrollRef.current.clientWidth / 2, behavior: 'smooth' });
    }, 500);
    return () => clearTimeout(timer);
  }, []); // Empty dependency array means this runs once on mount

  // Track changes to project data
  useEffect(() => {
    const currentState = JSON.stringify({ projectName, epics, userStories, tasks, milestones });
    if (lastSavedState === '') {
      // Initialize the saved state on first render
      setLastSavedState(currentState);
    } else if (currentState !== lastSavedState) {
      setHasUnsavedChanges(true);
    }
  }, [projectName, epics, userStories, tasks, milestones, lastSavedState]);

  // Add keyboard shortcut for save (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveProject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projectName, epics, userStories, tasks, milestones]);

  // Filter tasks based on selected epics and user stories
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      // Find the epic for this task
      const epic = epics.find(e => e.id === task.epicId);
      if (!epic || !epic.isSelected) return false;

      // Find the user story for this task
      const userStory = userStories.find(us => us.id === task.userStoryId);
      if (!userStory || !userStory.isSelected) return false;

      return true;
    });
  };

  const filteredTasks = getFilteredTasks();

  // Handle New Project
  const handleNewProject = () => {
    const confirmNew = window.confirm(
      'Are you sure you want to create a new project? Any unsaved changes will be lost.'
    );

    if (confirmNew) {
      // Reset to completely empty state
      setProjectName('New Project');
      setEpics([]);
      setUserStories([]);
      setTasks([]);
      setMilestones([]);
      setZoomLevel('day');
      setShowCriticalPath(false);
      setIsTaskListCollapsed(false);

      alert('New project created successfully!');
    }
  };

  // Handle Save Project
  const handleSaveProject = () => {
    try {
      saveProjectToFile(projectName, epics, userStories, tasks, milestones);
      const currentState = JSON.stringify({ projectName, epics, userStories, tasks, milestones });
      setLastSavedState(currentState);
      setHasUnsavedChanges(false);
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  // Handle Open Project
  const handleOpenProject = async () => {
    try {
      const projectData = await openProjectFile();

      // Update state with loaded data
      setProjectName(projectData.projectName);
      setEpics(projectData.epics);
      setUserStories(projectData.userStories);
      setTasks(projectData.tasks);
      setMilestones(projectData.milestones || []);

      // Reset saved state
      const currentState = JSON.stringify({
        projectName: projectData.projectName,
        epics: projectData.epics,
        userStories: projectData.userStories,
        tasks: projectData.tasks,
        milestones: projectData.milestones || []
      });
      setLastSavedState(currentState);
      setHasUnsavedChanges(false);

      alert('Project loaded successfully!');
    } catch (error) {
      if (error instanceof Error && error.message !== 'File selection cancelled') {
        console.error('Failed to open project:', error);
        alert('Failed to open project: ' + error.message);
      }
    }
  };

  // Handle adding a new task
  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Handle clicking on a task (either from list or chart)
  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Handle clicking on an empty cell in the chart
  const handleEmptyCellClick = (date: Date, taskIndex?: number) => {
    const formatDate = (d: Date): string => {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 7); // Default 1 week duration

    const newTask: Task = {
      id: 0, // Will be set when saving
      process: '',
      startDate: formatDate(date),
      endDate: formatDate(endDate),
      assignee: '',
      status: 'not-started',
      priority: 'medium',
      progress: 0,
      description: '',
      dependencies: []
    };

    setEditingTask(newTask);
    setIsModalOpen(true);
  };

  // Handle saving a task (create or update)
  const handleSaveTask = (task: Task) => {
    if (task.id === 0 || !tasks.find(t => t.id === task.id)) {
      // New task
      const newTask = { ...task, id: Date.now() };
      setTasks([...tasks, newTask]);
    } else {
      // Update existing task
      setTasks(tasks.map(t => t.id === task.id ? task : t));
    }
  };

  // Handle deleting a task
  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  // Handle reordering tasks via drag and drop in the task list
  const handleTaskReorder = (fromIndex: number, toIndex: number) => {
    const newTasks = [...tasks];
    const [movedTask] = newTasks.splice(fromIndex, 1);
    newTasks.splice(toIndex, 0, movedTask);
    setTasks(newTasks);
  };

  // Handle task drag in chart (changing dates)
  const handleTaskDragInChart = (taskId: number, newStartDate: string, newEndDate: string) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, startDate: newStartDate, endDate: newEndDate } : t
    ));
  };

  // Handle opening export modal
  const handleExportClick = () => {
    setIsExportModalOpen(true);
  };

  // Handle export with options
  const handleExportWithOptions = async (options: ExportOptions) => {
    if (!chartRef.current) return;

    try {
      // Temporarily change zoom level if different from current
      const originalZoomLevel = zoomLevel;
      if (options.viewMode !== zoomLevel) {
        setZoomLevel(options.viewMode);
        // Wait for the DOM to update
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Determine scale based on option
      let canvasScale = 2;
      if (options.scale === 'zoom-in') {
        canvasScale = 3; // 150% of normal (2 * 1.5)
      } else if (options.scale === 'zoom-out') {
        canvasScale = 1.5; // 75% of normal (2 * 0.75)
      } else if (options.scale === 'actual') {
        canvasScale = 1;
      } else if (options.scale === 'fit') {
        canvasScale = 2;
      }

      const canvas = await html2canvas(chartRef.current, {
        scale: canvasScale,
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');

      if (options.fileType === 'image') {
        // Download as PNG
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_gantt_chart.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Download as PDF
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        const imgWidth = 297; // A4 landscape width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_gantt_chart.pdf`);
      }

      // Restore original zoom level if changed
      if (options.viewMode !== originalZoomLevel) {
        setZoomLevel(originalZoomLevel);
      }

      alert('Chart exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export chart. Please try again.');
    }
  };

  // Handle navigate to today
  const handleNavigateToToday = () => {
    if (!ganttScrollRef.current) return;

    const today = new Date();
    const yearStart = new Date(today.getFullYear(), 0, 1);
    let todayIndex = 0;

    if (zoomLevel === 'day') {
      todayIndex = Math.floor((today.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
    } else if (zoomLevel === 'week') {
      todayIndex = Math.floor((today.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24 * 7));
    } else if (zoomLevel === 'month') {
      todayIndex = today.getMonth();
    } else if (zoomLevel === 'quarter') {
      todayIndex = Math.floor(today.getMonth() / 3);
    }

    // Calculate scroll position to center today
    const totalColumns = zoomLevel === 'day' ? 365 : zoomLevel === 'week' ? 52 : zoomLevel === 'month' ? 12 : 4;
    const scrollAmount = (todayIndex / totalColumns) * ganttScrollRef.current.scrollWidth;
    ganttScrollRef.current.scrollTo({ left: scrollAmount - ganttScrollRef.current.clientWidth / 2, behavior: 'smooth' });
  };

  // Handle navigate left
  const handleNavigateLeft = () => {
    if (!ganttScrollRef.current) return;
    ganttScrollRef.current.scrollBy({ left: -ganttScrollRef.current.clientWidth * 0.5, behavior: 'smooth' });
  };

  // Handle navigate right
  const handleNavigateRight = () => {
    if (!ganttScrollRef.current) return;
    ganttScrollRef.current.scrollBy({ left: ganttScrollRef.current.clientWidth * 0.5, behavior: 'smooth' });
  };

  // Handle Epic toggle
  const handleEpicToggle = (epicId: number) => {
    const epic = epics.find(e => e.id === epicId);
    if (!epic) return;

    const newSelectedState = !epic.isSelected;

    // Update Epic
    setEpics(epics.map(e =>
      e.id === epicId ? { ...e, isSelected: newSelectedState } : e
    ));

    // Update all related User Stories
    setUserStories(userStories.map(us =>
      us.epicId === epicId ? { ...us, isSelected: newSelectedState } : us
    ));
  };

  // Handle User Story toggle
  const handleUserStoryToggle = (userStoryId: number) => {
    setUserStories(userStories.map(us =>
      us.id === userStoryId ? { ...us, isSelected: !us.isSelected } : us
    ));
  };

  // Handle add Epic
  const handleAddEpic = () => {
    setEditingEpic(null);
    setIsEpicModalOpen(true);
  };

  // Handle edit Epic
  const handleEditEpic = (epic: Epic) => {
    setEditingEpic(epic);
    setIsEpicModalOpen(true);
  };

  // Handle save Epic
  const handleSaveEpic = (epic: Epic) => {
    if (!epics.find(e => e.id === epic.id)) {
      // New epic
      setEpics([...epics, epic]);
    } else {
      // Update existing epic
      setEpics(epics.map(e => e.id === epic.id ? epic : e));
    }
  };

  // Handle delete Epic
  const handleDeleteEpic = (epicId: number) => {
    // Also delete related user stories and tasks
    setUserStories(userStories.filter(us => us.epicId !== epicId));
    setTasks(tasks.filter(t => t.epicId !== epicId));
    setEpics(epics.filter(e => e.id !== epicId));
  };

  // Handle clone Epic
  const handleCloneEpic = (epicId: number) => {
    const epicToClone = epics.find(e => e.id === epicId);
    if (!epicToClone) return;

    // Generate new IDs
    const newEpicId = Date.now();
    const timestamp = Date.now();

    // Clone Epic
    const clonedEpic: Epic = {
      ...epicToClone,
      id: newEpicId,
      name: `${epicToClone.name} (Copy)`,
      isSelected: false
    };

    // Clone related User Stories
    const relatedUserStories = userStories.filter(us => us.epicId === epicId);
    const clonedUserStories: UserStory[] = [];
    const userStoryIdMap = new Map<number, number>(); // old ID -> new ID mapping

    relatedUserStories.forEach((us, index) => {
      const newUserStoryId = timestamp + index + 1;
      userStoryIdMap.set(us.id, newUserStoryId);
      clonedUserStories.push({
        ...us,
        id: newUserStoryId,
        epicId: newEpicId,
        name: `${us.name} (Copy)`,
        isSelected: false
      });
    });

    // Clone related Tasks
    const relatedTasks = tasks.filter(t => t.epicId === epicId);
    const clonedTasks: Task[] = relatedTasks.map((task, index) => {
      const newUserStoryId = task.userStoryId ? userStoryIdMap.get(task.userStoryId) : undefined;
      return {
        ...task,
        id: timestamp + relatedUserStories.length + index + 1,
        process: `${task.process} (Copy)`,
        epicId: newEpicId,
        userStoryId: newUserStoryId,
        // Reset dependencies since they might reference tasks outside this epic
        dependencies: []
      };
    });

    // Update state with cloned items
    setEpics([...epics, clonedEpic]);
    setUserStories([...userStories, ...clonedUserStories]);
    setTasks([...tasks, ...clonedTasks]);
  };

  // Handle add User Story
  const handleAddUserStory = (epicId: number) => {
    const newUserStory: UserStory = {
      id: Date.now(),
      epicId: epicId,
      name: `User Story ${userStories.filter(us => us.epicId === epicId).length + 1}`,
      isSelected: true
    };
    setEditingUserStory(newUserStory);
    setIsUserStoryModalOpen(true);
  };

  // Handle edit User Story
  const handleEditUserStory = (userStory: UserStory) => {
    setEditingUserStory(userStory);
    setIsUserStoryModalOpen(true);
  };

  // Handle save User Story
  const handleSaveUserStory = (userStory: UserStory) => {
    if (!userStories.find(us => us.id === userStory.id)) {
      // New user story
      setUserStories([...userStories, userStory]);
    } else {
      // Update existing user story
      setUserStories(userStories.map(us => us.id === userStory.id ? userStory : us));
    }
  };

  // Handle delete User Story
  const handleDeleteUserStory = (userStoryId: number) => {
    // Also delete related tasks
    setTasks(tasks.filter(t => t.userStoryId !== userStoryId));
    setUserStories(userStories.filter(us => us.id !== userStoryId));
  };

  // Handle milestone creation from chart click
  const handleMilestoneCreate = (date: string) => {
    const newMilestone: Milestone = {
      id: 0,
      name: '',
      date: date,
      color: '#10b981'
    };
    setEditingMilestone(newMilestone);
    setIsMilestoneModalOpen(true);
  };

  // Handle milestone click
  const handleMilestoneClick = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setIsMilestoneModalOpen(true);
  };

  // Handle milestone drag update (save directly without modal)
  const handleMilestoneDragUpdate = (milestone: Milestone) => {
    if (!milestones.find(m => m.id === milestone.id)) {
      // New milestone (shouldn't happen in drag, but handle it)
      const newMilestone = { ...milestone, id: Date.now() };
      setMilestones([...milestones, newMilestone]);
    } else {
      // Update existing milestone
      setMilestones(milestones.map(m => m.id === milestone.id ? milestone : m));
    }
  };

  // Handle save milestone
  const handleSaveMilestone = (milestone: Milestone) => {
    if (milestone.id === 0 || !milestones.find(m => m.id === milestone.id)) {
      // New milestone
      const newMilestone = { ...milestone, id: Date.now() };
      setMilestones([...milestones, newMilestone]);
    } else {
      // Update existing milestone
      setMilestones(milestones.map(m => m.id === milestone.id ? milestone : m));
    }
  };

  // Handle delete milestone
  const handleDeleteMilestone = (milestoneId: number) => {
    setMilestones(milestones.filter(m => m.id !== milestoneId));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <Header
        onExport={handleExportClick}
        onSaveProject={handleSaveProject}
        onOpenProject={handleOpenProject}
        onNewProject={handleNewProject}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* View Controls */}
      <ViewControls
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        showCriticalPath={showCriticalPath}
        onToggleCriticalPath={setShowCriticalPath}
        onNavigateLeft={handleNavigateLeft}
        onNavigateRight={handleNavigateRight}
        onNavigateToToday={handleNavigateToToday}
      />

      {/* Main Content: Task List + Gantt Chart */}
      <div className="flex flex-1 overflow-hidden" ref={chartRef}>
        {/* Task List Sidebar */}
        {!isTaskListCollapsed && (
          <TaskList
            tasks={tasks}
            epics={epics}
            userStories={userStories}
            onAddTask={handleAddTask}
            onTaskClick={handleTaskClick}
            onTaskReorder={handleTaskReorder}
            onEpicToggle={handleEpicToggle}
            onUserStoryToggle={handleUserStoryToggle}
            onAddEpic={handleAddEpic}
            onAddUserStory={handleAddUserStory}
            onEpicClick={handleEditEpic}
            onUserStoryClick={handleEditUserStory}
            onToggleCollapse={() => setIsTaskListCollapsed(true)}
            onCloneEpic={handleCloneEpic}
            onDeleteEpic={handleDeleteEpic}
          />
        )}

        {/* Expand Button when collapsed */}
        {isTaskListCollapsed && (
          <div className="flex items-start p-4 bg-white border-r border-gray-200">
            <button
              onClick={() => setIsTaskListCollapsed(false)}
              className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Show sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Gantt Chart View */}
        <GanttChartView
          ref={ganttScrollRef}
          tasks={tasks}
          epics={epics}
          milestones={milestones}
          zoomLevel={zoomLevel}
          onTaskClick={handleTaskClick}
          onEpicClick={handleEditEpic}
          onEmptyCellClick={handleEmptyCellClick}
          onTaskDragInChart={handleTaskDragInChart}
          onMilestoneCreate={handleMilestoneCreate}
          onMilestoneClick={handleMilestoneClick}
          onMilestoneDragUpdate={handleMilestoneDragUpdate}
          showCriticalPath={showCriticalPath}
        />
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        task={editingTask}
        epics={epics}
        userStories={userStories}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      {/* Epic Modal */}
      <EpicModal
        isOpen={isEpicModalOpen}
        epic={editingEpic}
        onClose={() => setIsEpicModalOpen(false)}
        onSave={handleSaveEpic}
        onDelete={handleDeleteEpic}
      />

      {/* User Story Modal */}
      <UserStoryModal
        isOpen={isUserStoryModalOpen}
        userStory={editingUserStory}
        epics={epics}
        onClose={() => setIsUserStoryModalOpen(false)}
        onSave={handleSaveUserStory}
        onDelete={handleDeleteUserStory}
      />

      {/* Milestone Modal */}
      <MilestoneModal
        isOpen={isMilestoneModalOpen}
        milestone={editingMilestone}
        onClose={() => setIsMilestoneModalOpen(false)}
        onSave={handleSaveMilestone}
        onDelete={handleDeleteMilestone}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportWithOptions}
        currentZoomLevel={zoomLevel}
      />
    </div>
  );
};

export default GanttChartMain;
