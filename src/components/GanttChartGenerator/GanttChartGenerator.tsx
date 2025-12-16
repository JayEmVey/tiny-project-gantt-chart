import React, { useState, useRef } from 'react';
import { Calendar, Download, Plus, Trash2, Upload } from 'lucide-react';
import { Task, DragState } from '../../types';
import '../GanttNew.css';

const GanttChartGenerator: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      process: 'Planning',
      startDate: '01/01/2025',
      endDate: '28/02/2025',
      description: 'Initial project planning and requirements gathering',
      assignee: 'John Doe',
      priority: 'High',
      status: 'Completed',
      progress: 100,
      dependencies: []
    },
    {
      id: 2,
      process: 'Wireframing',
      startDate: '01/03/2025',
      endDate: '15/04/2025',
      description: 'Create wireframes for all major screens',
      assignee: 'Loran Doe',
      priority: 'Medium',
      status: 'Completed',
      progress: 100,
      dependencies: [1]
    },
    {
      id: 3,
      process: 'Design Process',
      startDate: '15/03/2025',
      endDate: '31/05/2025',
      description: 'UI/UX design and prototyping',
      assignee: 'Anthony Black',
      priority: 'High',
      status: 'In Progress',
      progress: 75,
      dependencies: [2]
    },
    {
      id: 4,
      process: 'Front-end development',
      startDate: '01/06/2025',
      endDate: '30/09/2025',
      description: 'Implement user interface components',
      assignee: 'Kate Small',
      priority: 'High',
      status: 'Not Started',
      progress: 0,
      dependencies: [3]
    },
    {
      id: 5,
      process: 'Back-end development',
      startDate: '01/05/2025',
      endDate: '31/08/2025',
      description: 'Develop server-side functionality and APIs',
      assignee: 'Jim White',
      priority: 'Critical',
      status: 'In Progress',
      progress: 30,
      dependencies: [2]
    },
    {
      id: 6,
      process: 'Deployment',
      startDate: '01/10/2025',
      endDate: '31/12/2025',
      description: 'Production deployment and monitoring',
      assignee: 'John Doe',
      priority: 'Medium',
      status: 'Not Started',
      progress: 0,
      dependencies: [4, 5]
    }
  ]);

  const [currentPage, setCurrentPage] = useState<'chart' | 'edit'>('chart');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Zoom and pagination state
  const [zoomLevel, setZoomLevel] = useState<'day' | 'week' | 'month'>('day');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const tasksPerPage = 10;
  
  const [dragState, setDragState] = useState<DragState>({
    draggingTask: null,
    dragStartX: 0,
    dragType: null,
    dragPreview: null,
    originalTaskState: null
  });
  
  // State for task creation by drawing
  const [creationState, setCreationState] = useState<{
    isCreating: boolean;
    startX: number;
    startDate: string | null;
    currentDate: string | null;
  }>({
    isCreating: false,
    startX: 0,
    startDate: null,
    currentDate: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tgcInputRef = useRef<HTMLInputElement>(null);
  // Save project as .tgc file
  const saveProjectAsTGC = () => {
    const data = JSON.stringify({ tasks });
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project.tgc';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Open project from .tgc file
  const handleTGCFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.tasks && Array.isArray(json.tasks)) {
          setTasks(json.tasks);
        }
      } catch (err) {
        alert('Invalid .tgc file format');
      }
    };
    reader.readAsText(file);
  };

  // Color classes for task bars (rotate colors like legend)
  const taskColors = ['task-blue', 'task-teal', 'task-green', 'task-yellow', 'task-red'];

  // Agile-style header data: Q1 (Jan-Mar), Q2 (Apr-Jul)
  const months = [
    { key: 'JANUARY', short: 'JAN', days: 31, color: '#2b78e4', band: '#eaf3ff' },
    { key: 'FEBRUARY', short: 'FEB', days: 28, color: '#2b78e4', band: '#e9f6ff' },
    { key: 'MARCH', short: 'MAR', days: 31, color: '#18b0d6', band: '#e6f7fb' },
    { key: 'APRIL', short: 'APR', days: 30, color: '#a758c9', band: '#f3e9fb' },
    { key: 'MAY', short: 'MAY', days: 31, color: '#a758c9', band: '#f5e9f7' },
    { key: 'JUNE', short: 'JUN', days: 30, color: '#b46cc9', band: '#f4ecfb' },
    { key: 'JULY', short: 'JUL', days: 31, color: '#ff2f6d', band: '#ffe6ee' }
  ];

  const q1Days = months[0].days + months[1].days + months[2].days;
  const q2Days = months[3].days + months[4].days + months[5].days + months[6].days;

  // Timeline range (Jan 1 - Jul 31, 2025)
  const rangeStart = new Date(2025, 0, 1);
  const rangeEnd = new Date(2025, 6, 31);
  const totalRangeDays = Math.round((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Calculate cell width based on zoom level
  const cellWidth = React.useMemo(() => {
    switch (zoomLevel) {
      case 'day': return 28;
      case 'week': return 100;
      case 'month': return 200;
      default: return 28;
    }
  }, [zoomLevel]);

  const dayColumns = React.useMemo(() => {
    const cols: { day: number; monthIndex: number }[] = [];
    months.forEach((m, mi) => {
      for (let d = 1; d <= m.days; d++) cols.push({ day: d, monthIndex: mi });
    });
    return cols;
  }, []);

  // Helper function to convert DD/MM/YYYY to Date object
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  // Helper function to convert Date object to DD/MM/YYYY
  const formatDate = (date: Date): string => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to convert mouse X position to date
  const getDateFromMouseX = (mouseX: number, containerElement: HTMLElement): string | null => {
    const tableOffset = 260; // width of first column
    
    // Get the position relative to the container
    const rect = containerElement.getBoundingClientRect();
    const relativeX = mouseX - rect.left - tableOffset;
    
    if (relativeX < 0) return null;
    
    // Calculate which day this corresponds to
    const dayIndex = Math.floor(relativeX / cellWidth);
    
    if (dayIndex < 0 || dayIndex >= totalRangeDays) return null;
    
    // Calculate the actual date
    const targetDate = new Date(rangeStart.getTime() + (dayIndex * 24 * 60 * 60 * 1000));
    return formatDate(targetDate);
  };

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

  const addNewTask = () => {
    const newTask: Task = {
      id: Math.max(...tasks.map(t => t.id), 0) + 1,
      process: 'New Process',
      startDate: '01/01/2025',
      endDate: '31/01/2025',
    };
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const updateTask = (id: number, field: keyof Task, value: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, [field]: value } : task
    ));
  };

  const calculateBarPosition = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return null;
    
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    if (!start || !end) return null;

    // Clamp to visible range
    const clampedStart = new Date(Math.max(start.getTime(), rangeStart.getTime()));
    const clampedEnd = new Date(Math.min(end.getTime(), rangeEnd.getTime()));
    if (clampedEnd < rangeStart || clampedStart > rangeEnd) return null; // outside range

    const leftDays = (clampedStart.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24);
    const rightDays = (clampedEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
    const duration = rightDays - leftDays;

    // Calculate position based on the first cell's position - 
    // the bar will be positioned absolutely relative to the table
    const labelWidth = 260; // width of first column
    
    return {
      left: `calc(${labelWidth}px + ${leftDays * cellWidth}px)`,
      width: `${duration * cellWidth}px`
    };
  };

  const exportToCSV = () => {
    const csv = [
      ['Process', 'Start Date', 'End Date'].join(','),
      ...tasks.map(task => [
        `"${task.process}"`,
        task.startDate,
        task.endDate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gantt_chart.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      
      const newTasks = lines.slice(1).filter(line => line.trim()).map((line, index) => {
        const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || [];
        return {
          id: index + 1,
          process: values[0] || '',
          startDate: values[1] || '',
          endDate: values[2] || ''
        };
      });
      
      setTasks(newTasks);
    };
    reader.readAsText(file);
  };

  const openEditModal = (task: Task) => {
    setEditingTask({ ...task });
    setShowModal(true);
  };

  const saveEditedTask = () => {
    if (editingTask) {
      // Validate dependencies - check for circular dependencies
      if (editingTask.dependencies && editingTask.dependencies.length > 0) {
        const hasCircular = (taskId: number, visited: Set<number> = new Set()): boolean => {
          if (visited.has(taskId)) return true;
          visited.add(taskId);
          
          const task = tasks.find(t => t.id === taskId);
          if (!task?.dependencies) return false;
          
          return task.dependencies.some(depId => hasCircular(depId, new Set(visited)));
        };
        
        if (hasCircular(editingTask.id)) {
          alert('Cannot save: Circular dependency detected! A task cannot depend on itself directly or indirectly.');
          return;
        }
      }
      
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? editingTask : task
      ));
      setShowModal(false);
      setEditingTask(null);
    }
  };

  const handleBarMouseDown = (e: React.MouseEvent, task: Task, type: 'move' | 'resize-left' | 'resize-right') => {
    e.stopPropagation();
    setDragState({
      draggingTask: task.id,
      dragStartX: e.clientX,
      dragType: type,
      originalTaskState: { ...task },
      dragPreview: {
        startDate: task.startDate,
        endDate: task.endDate
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.draggingTask || !dragState.dragType || !dragState.originalTaskState) return;

    const ganttTable = document.querySelector('.gantt-timeline table') as HTMLElement;
    if (!ganttTable) return;

    const rect = ganttTable.getBoundingClientRect();
    const processColumn = ganttTable.querySelector('th:first-child') as HTMLElement;
    const processWidth = processColumn ? processColumn.offsetWidth : 200;
    
    const chartWidth = rect.width - processWidth;
    const deltaX = e.clientX - dragState.dragStartX;
    
    // Calculate days per pixel (365 days across the chart width)
    const daysPerPixel = 365 / chartWidth;
    const daysDelta = Math.round(deltaX * daysPerPixel);

    if (daysDelta === 0) return;

    const startDate = parseDate(dragState.originalTaskState.startDate);
    const endDate = parseDate(dragState.originalTaskState.endDate);

    if (!startDate || !endDate) return;

    if (dragState.dragType === 'move') {
      startDate.setDate(startDate.getDate() + daysDelta);
      endDate.setDate(endDate.getDate() + daysDelta);
    } else if (dragState.dragType === 'resize-left') {
      startDate.setDate(startDate.getDate() + daysDelta);
      if (startDate >= endDate) return;
    } else if (dragState.dragType === 'resize-right') {
      endDate.setDate(endDate.getDate() + daysDelta);
      if (endDate <= startDate) return;
    }

    setDragState(prev => ({
      ...prev,
      dragPreview: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
      }
    }));
  };

  const handleMouseUp = () => {
    if (dragState.draggingTask && dragState.dragPreview && dragState.originalTaskState) {
      const task = tasks.find(t => t.id === dragState.draggingTask);
      if (task && (dragState.dragPreview.startDate !== task.startDate || dragState.dragPreview.endDate !== task.endDate)) {
        setEditingTask({
          ...task,
          startDate: dragState.dragPreview.startDate,
          endDate: dragState.dragPreview.endDate
        });
        setShowModal(true);
      }
    }
    setDragState({
      draggingTask: null,
      dragStartX: 0,
      dragType: null,
      dragPreview: null,
      originalTaskState: null
    });

    // Handle task creation
    if (creationState.isCreating && creationState.startDate && creationState.currentDate) {
      const startDate = parseDate(creationState.startDate);
      const endDate = parseDate(creationState.currentDate);
      
      if (startDate && endDate) {
        // Ensure start is before end
        const actualStartDate = startDate <= endDate ? startDate : endDate;
        const actualEndDate = startDate <= endDate ? endDate : startDate;
        
        // Create new task with generated dates
        const newTask: Task = {
          id: Math.max(...tasks.map(t => t.id), 0) + 1,
          process: `New Task ${tasks.length + 1}`,
          startDate: formatDate(actualStartDate),
          endDate: formatDate(actualEndDate),
          description: 'New task created by drawing',
          assignee: 'Unassigned',
          priority: 'Medium',
          status: 'Not Started',
          progress: 0
        };
        
        setTasks([...tasks, newTask]);
        setEditingTask(newTask);
        setShowModal(true);
      }
    }

    setCreationState({
      isCreating: false,
      startX: 0,
      startDate: null,
      currentDate: null
    });
  };

  // Handle mouse down on empty timeline for task creation
  const handleTimelineMouseDown = (e: React.MouseEvent, containerElement: HTMLElement) => {
    // Only start creation if clicking on empty space (not on a task bar)
    const target = e.target as HTMLElement;
    if (target.closest('.gantt-task-bar')) return;
    
    const date = getDateFromMouseX(e.clientX, containerElement);
    if (date) {
      setCreationState({
        isCreating: true,
        startX: e.clientX,
        startDate: date,
        currentDate: date
      });
    }
  };

  // Handle mouse move during task creation
  const handleTimelineMouseMove = (e: React.MouseEvent, containerElement: HTMLElement) => {
    if (creationState.isCreating) {
      const date = getDateFromMouseX(e.clientX, containerElement);
      if (date) {
        setCreationState(prev => ({
          ...prev,
          currentDate: date
        }));
      }
    }
  };

  return (
    <div 
      className="w-full min-h-screen bg-white p-8"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-pink-400" />
            <h1 className="text-3xl font-bold text-gray-800">Project Gantt Chart</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentPage(currentPage === 'edit' ? 'chart' : 'edit')}
              className="flex items-center gap-2 px-6 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition font-medium"
            >
              {currentPage === 'edit' ? 'View Chart' : 'Edit Data'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              ref={tgcInputRef}
              type="file"
              accept=".tgc"
              onChange={handleTGCFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-pink-300 text-gray-800 rounded hover:bg-pink-400 transition font-medium"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-pink-300 text-gray-800 rounded hover:bg-pink-400 transition font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={saveProjectAsTGC}
              className="flex items-center gap-2 px-4 py-2 bg-pink-300 text-gray-800 rounded hover:bg-pink-400 transition font-medium"
            >
              Save Project
            </button>
            <button
              onClick={() => tgcInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-pink-300 text-gray-800 rounded hover:bg-pink-400 transition font-medium"
            >
              Open Project
            </button>
            {currentPage === 'edit' && (
              <button
                onClick={addNewTask}
                className="flex items-center gap-2 px-4 py-2 bg-pink-400 text-white rounded hover:bg-pink-500 transition font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Process
              </button>
            )}
            
            {/* Zoom Level Controls */}
            {currentPage === 'chart' && (
              <div className="flex items-center gap-2 border-l-2 border-gray-300 pl-4">
                <span className="text-sm font-medium text-gray-700">Zoom:</span>
                <button
                  onClick={() => setZoomLevel('day')}
                  className={`px-3 py-2 rounded transition font-medium ${
                    zoomLevel === 'day' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setZoomLevel('week')}
                  className={`px-3 py-2 rounded transition font-medium ${
                    zoomLevel === 'week' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setZoomLevel('month')}
                  className={`px-3 py-2 rounded transition font-medium ${
                    zoomLevel === 'month' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Month
                </button>
              </div>
            )}
          </div>
        </div>

        {currentPage === 'edit' ? (
          <div className="border-2 border-pink-300 rounded-lg overflow-hidden">
            <div className="bg-pink-200 p-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Process Data</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-pink-100">
                    <th className="border border-pink-300 p-3 text-left font-bold text-gray-800">Actions</th>
                    <th className="border border-pink-300 p-3 text-left font-bold text-gray-800">Process</th>
                    <th className="border border-pink-300 p-3 text-left font-bold text-gray-800">Start Date</th>
                    <th className="border border-pink-300 p-3 text-left font-bold text-gray-800">End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id} className="hover:bg-pink-50">
                      <td className="border border-pink-300 p-3">
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                      <td className="border border-pink-300 p-3">
            {/* Today line if within range */}
            {(() => {
              const today = new Date();
              if (today < rangeStart || today > rangeEnd) return null;
              const daysFromStart = (today.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24);
              const leftPct = (daysFromStart / totalRangeDays) * 100;
              return (
                <div>
                  <div className="absolute top-[52px] bottom-2" style={{ left: `${leftPct}%` }}>
                    <div style={{ width: '2px', height: '100%', background: '#08a0ff' }} />
                  </div>
                  <div className="absolute -top-3 text-white text-sm font-bold px-3 py-1 rounded" style={{ left: `calc(${leftPct}% - 30px)`, background: '#08a0ff' }}>TODAY</div>
                </div>
              );
            })()}
                        <input
                          type="text"
                          value={task.process}
                          onChange={(e) => updateTask(task.id, 'process', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                      </td>
                      <td className="border border-pink-300 p-3">
                        <input
                          type="date"
                          value={toInputFormat(task.startDate)}
                          onChange={(e) => updateTask(task.id, 'startDate', fromInputFormat(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                      </td>
                      <td className="border border-pink-300 p-3">
                        <input
                          type="date"
                          value={toInputFormat(task.endDate)}
                          onChange={(e) => updateTask(task.id, 'endDate', fromInputFormat(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="gantt-container overflow-hidden relative">
            {/* Quarter banner */}
            <div className="flex text-white text-xl font-bold">
              <div className="flex-1 text-center py-3" style={{ background: '#2b78e4' }}>Q1</div>
              <div className="flex-1 text-center py-3" style={{ background: '#00b0ff' }}>Q2</div>
            </div>
            <div 
              className="overflow-x-auto gantt-timeline"
              onMouseDown={(e) => handleTimelineMouseDown(e, e.currentTarget)}
              onMouseMove={(e) => handleTimelineMouseMove(e, e.currentTarget)}
              onMouseUp={handleMouseUp}
            >
              <table className="w-full border-collapse gantt-grid">
                <thead>
                  <tr>
                    <th className="gantt-row-label p-3 text-left" rowSpan={3} style={{ width: '260px' }}>Project Description</th>
                    <th className="text-white p-2 text-center" style={{ background: '#2b78e4' }} colSpan={q1Days}>Q1</th>
                    <th className="text-white p-2 text-center" style={{ background: '#00b0ff' }} colSpan={q2Days}>Q2</th>
                  </tr>
                  <tr>
                    {months.map((m, mi) => (
                      <th key={mi} className="text-white text-sm font-bold" style={{ background: m.color }} colSpan={m.days}>{m.key}</th>
                    ))}
                  </tr>
                  <tr>
                    {dayColumns.map((c, idx) => (
                      <th key={idx} className="gantt-day-cell p-1 text-xs" style={{ minWidth: `${cellWidth}px`, background: months[c.monthIndex].band }}>{c.day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks
                    .slice(currentPageIndex * tasksPerPage, (currentPageIndex + 1) * tasksPerPage)
                    .map((task, rowIdx) => {
                    const displayTask = dragState.draggingTask === task.id && dragState.dragPreview 
                      ? { ...task, ...dragState.dragPreview }
                      : task;
                    const colorClass = taskColors[rowIdx % taskColors.length];
                    return (
                      <tr key={task.id}>
                        <td className="gantt-row-label p-3 font-medium" style={{ width: '260px' }}>
                          {task.process}
                        </td>
                        {dayColumns.map((c, dayIdx) => (
                          <td key={dayIdx} className="gantt-day-cell p-0 relative" style={{ height: '44px', minWidth: `${cellWidth}px`, background: months[c.monthIndex].band }}>
                            {/* Only render the bar once in the first cell, but position it absolutely across all cells */}
                            {dayIdx === 0 && (() => {
                              const barPosition = calculateBarPosition(displayTask.startDate, displayTask.endDate);
                              if (!barPosition) return null;
                              const isDragging = dragState.draggingTask === task.id;
                              return (
                                <div
                                  className={`absolute gantt-task-bar ${colorClass}`}
                                  style={{
                                    left: barPosition.left,
                                    width: barPosition.width,
                                    height: '16px',
                                    opacity: isDragging ? 0.9 : 1,
                                    zIndex: 10
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleBarMouseDown(e, task, 'move');
                                  }}
                                  onClick={(e) => {
                                    if (!isDragging && !dragState.dragPreview) {
                                      e.stopPropagation();
                                      openEditModal(task);
                                    }
                                  }}
                                >
                                  <div
                                    className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize"
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      handleBarMouseDown(e, task, 'resize-left');
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div
                                    className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize"
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      handleBarMouseDown(e, task, 'resize-right');
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  {isDragging && (
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                                      {displayTask.startDate} - {displayTask.endDate}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Task creation preview */}
              {creationState.isCreating && creationState.startDate && creationState.currentDate && (() => {
                const startDate = parseDate(creationState.startDate);
                const currentDate = parseDate(creationState.currentDate);
                if (!startDate || !currentDate) return null;
                
                const actualStartDate = startDate <= currentDate ? startDate : currentDate;
                const actualEndDate = startDate <= currentDate ? currentDate : startDate;
                
                const previewPosition = calculateBarPosition(formatDate(actualStartDate), formatDate(actualEndDate));
                if (!previewPosition) return null;
                
                return (
                  <div
                    className="absolute task-creation-preview"
                    style={{
                      left: previewPosition.left,
                      width: previewPosition.width,
                      height: '16px',
                      top: '140px',
                      zIndex: 20
                    }}
                  />
                );
              })()}
              
            </div>
            {/* Today line */}
            {(() => {
              const today = new Date();
              if (today < rangeStart || today > rangeEnd) return null;
              const daysFromStart = (today.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24);
              const leftPct = (daysFromStart / totalRangeDays) * 100;
              return (
                <div>
                  <div className="absolute top-[140px] bottom-2" style={{ left: `${leftPct}%` }}>
                    <div style={{ width: '2px', height: '100%', background: '#08a0ff' }} />
                  </div>
                  <div className="absolute -top-3 text-white text-sm font-bold px-3 py-1 rounded" style={{ left: `calc(${leftPct}% - 30px)`, background: '#08a0ff' }}>TODAY</div>
                </div>
              );
            })()}
            <div className="gantt-legend">
              <div className="legend-item"><span className="legend-swatch task-blue"></span> John Doe</div>
              <div className="legend-item"><span className="legend-swatch task-teal"></span> Loran Doe</div>
              <div className="legend-item"><span className="legend-swatch task-green"></span> Anthony Black</div>
              <div className="legend-item"><span className="legend-swatch task-yellow"></span> Kate Small</div>
              <div className="legend-item"><span className="legend-swatch task-red"></span> Jim White</div>
            </div>
            
            {/* Pagination Controls */}
            {tasks.length > tasksPerPage && (
              <div className="flex items-center justify-center gap-4 mt-6 pb-4">
                <button
                  onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                  disabled={currentPageIndex === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition font-medium ${
                    currentPageIndex === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  <span>← Previous</span>
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.ceil(tasks.length / tasksPerPage) }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPageIndex(i)}
                      className={`w-10 h-10 rounded-full transition font-medium ${
                        currentPageIndex === i
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPageIndex(Math.min(Math.ceil(tasks.length / tasksPerPage) - 1, currentPageIndex + 1))}
                  disabled={currentPageIndex >= Math.ceil(tasks.length / tasksPerPage) - 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition font-medium ${
                    currentPageIndex >= Math.ceil(tasks.length / tasksPerPage) - 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  <span>Next →</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Process</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Process Name</label>
                <input
                  type="text"
                  value={editingTask.process}
                  onChange={(e) => setEditingTask({ ...editingTask, process: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={toInputFormat(editingTask.startDate)}
                  onChange={(e) => setEditingTask({ ...editingTask, startDate: fromInputFormat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={toInputFormat(editingTask.endDate)}
                  onChange={(e) => setEditingTask({ ...editingTask, endDate: fromInputFormat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dependencies</label>
                <select
                  multiple
                  value={editingTask.dependencies?.map(d => d.toString()) || []}
                  onChange={(e) => {
                    const selectedDeps = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                    setEditingTask({ ...editingTask, dependencies: selectedDeps });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 h-24"
                >
                  {tasks
                    .filter(t => t.id !== editingTask.id)
                    .map(task => (
                      <option key={task.id} value={task.id}>
                        {task.process}
                      </option>
                    ))
                  }
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Hold Ctrl/Cmd to select multiple dependencies
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={saveEditedTask}
                className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTask(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GanttChartGenerator;