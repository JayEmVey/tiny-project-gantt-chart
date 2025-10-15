import React, { useState, useRef } from 'react';
import { Task, ZoomLevel, Epic, UserStory } from '../../types';
import Header from './Header';
import TaskList from './TaskList';
import TaskModal from './TaskModal';
import ViewControls from './ViewControls';
import GanttChartView from './GanttChartView';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('day');
  const [showCriticalPath, setShowCriticalPath] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const ganttScrollRef = useRef<HTMLDivElement>(null);

  // Filter tasks based on selected epics and user stories
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      // Find the epic for this task
      const epic = epics.find(e => e.id === task.epicId);
      if (!epic || !epic.isSelected) return false;

      // Find the user story for this task
      const userStory = userStories.find(us => us.id === task.userStoryId);
      if (!userStory || !userStory.isSelected) return false;

      // Apply search filter
      if (searchTerm) {
        return (
          task.process.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.assignee && task.assignee.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      return true;
    });
  };

  const filteredTasks = getFilteredTasks();

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

  // Handle export to PDF
  const handleExport = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('gantt-chart.pdf');
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

    // Calculate scroll position (approximate)
    const scrollAmount = (todayIndex / (zoomLevel === 'day' ? 365 : zoomLevel === 'week' ? 52 : zoomLevel === 'month' ? 12 : 4)) * ganttScrollRef.current.scrollWidth;
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
    setEpics(epics.map(epic =>
      epic.id === epicId ? { ...epic, isSelected: !epic.isSelected } : epic
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
    const newEpic: Epic = {
      id: Date.now(),
      name: `Epic ${epics.length + 1}`,
      isSelected: true
    };
    setEpics([...epics, newEpic]);
  };

  // Handle add User Story
  const handleAddUserStory = (epicId: number) => {
    const newUserStory: UserStory = {
      id: Date.now(),
      epicId: epicId,
      name: `User Story ${userStories.filter(us => us.epicId === epicId).length + 1}`,
      isSelected: true
    };
    setUserStories([...userStories, newUserStory]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onExport={handleExport}
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
        />

        {/* Gantt Chart View */}
        <GanttChartView
          ref={ganttScrollRef}
          tasks={filteredTasks}
          zoomLevel={zoomLevel}
          onTaskClick={handleTaskClick}
          onEmptyCellClick={handleEmptyCellClick}
          onTaskDragInChart={handleTaskDragInChart}
          showCriticalPath={showCriticalPath}
        />
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        task={editingTask}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
};

export default GanttChartMain;
