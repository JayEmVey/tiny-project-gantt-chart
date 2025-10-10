import React, { useState, useRef } from 'react';
import { Task, ZoomLevel } from '../../types';
import Header from './Header';
import TaskList from './TaskList';
import TaskModal from './TaskModal';
import ViewControls from './ViewControls';
import GanttChartView from './GanttChartView';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './animations.css';

const GanttChartMain: React.FC = () => {
  // Initial sample tasks
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
        dependencies: []
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
        dependencies: [1]
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
        dependencies: [2]
      }
    ];
  };

  const [tasks, setTasks] = useState<Task[]>(getInitialTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('week');
  const [showCriticalPath, setShowCriticalPath] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);

  // Filter tasks based on search term
  const filteredTasks = tasks.filter(task =>
    task.process.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.assignee && task.assignee.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      />

      {/* Main Content: Task List + Gantt Chart */}
      <div className="flex flex-1 overflow-hidden" ref={chartRef}>
        {/* Task List Sidebar */}
        <TaskList
          tasks={filteredTasks}
          onAddTask={handleAddTask}
          onTaskClick={handleTaskClick}
          onTaskReorder={handleTaskReorder}
        />

        {/* Gantt Chart View */}
        <GanttChartView
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
