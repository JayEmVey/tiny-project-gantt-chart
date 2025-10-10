import React, { useState, useRef, useMemo } from 'react';
import { Calendar, Download, Plus, Trash2, Upload, ZoomIn, ZoomOut, Filter, Save, FolderOpen, Search, FileImage } from 'lucide-react';
import { Task, DragState, ZoomLevel } from '../../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../GanttNew.css';

// Memoized task row component for better performance
const TaskRow = React.memo(({
  task,
  displayTask,
  colorClass,
  isDragging,
  isCritical,
  zoomLevel,
  dayColumns,
  months,
  calculateBarPosition,
  handleBarMouseDown,
  openEditModal,
  dragState,
  isDrawingNewTask,
  setNewTaskDraw,
  filteredTasks,
  isDrawingDependency,
  setDependencyDraw
}: any) => {
  return (
    <tr>
      <td className="gantt-row-label p-3 font-medium" style={{ width: '260px', position: 'sticky', left: 0, background: 'white', zIndex: 10 }}>
        <div className="flex flex-col">
          <span className="font-semibold">{task.process}</span>
          <span className="text-xs text-gray-600">{task.assignee}</span>
          {task.progress !== undefined && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          )}
        </div>
      </td>
      {zoomLevel === 'day' && dayColumns.map((c: any, dayIdx: number) => (
        <td
          key={dayIdx}
          className="gantt-day-cell p-0 relative"
          style={{ height: '60px', minWidth: '28px', background: months[c.monthIndex].band, cursor: isDrawingNewTask ? 'crosshair' : 'default' }}
          onMouseDown={(e) => {
            if (isDrawingNewTask && dayIdx === 0) {
              e.preventDefault();
              const taskIndex = filteredTasks.findIndex((t: Task) => t.id === task.id);
              setNewTaskDraw({
                startX: e.clientX,
                currentX: e.clientX,
                rowIndex: taskIndex
              });
            }
          }}
        >
          {dayIdx === 0 && (() => {
            const barPosition = calculateBarPosition(displayTask.startDate, displayTask.endDate);
            if (!barPosition) return null;
            return (
              <div
                className={`absolute gantt-task-bar ${colorClass}`}
                data-task-id={task.id}
                style={{
                  left: barPosition.left,
                  width: barPosition.width,
                  height: '20px',
                  opacity: isDragging ? 0.9 : 1,
                  zIndex: 10,
                  cursor: isDrawingDependency ? 'pointer' : 'move',
                  border: isCritical ? '3px solid #ff0000' : 'none',
                  boxShadow: isCritical ? '0 0 8px rgba(255, 0, 0, 0.6)' : 'none'
                }}
                onMouseDown={(e) => {
                  if (isDrawingDependency) {
                    e.preventDefault();
                    e.stopPropagation();
                    setDependencyDraw({
                      fromTaskId: task.id,
                      currentX: e.clientX,
                      currentY: e.clientY
                    });
                  } else {
                    e.preventDefault();
                    handleBarMouseDown(e, task, 'move');
                  }
                }}
                onClick={(e) => {
                  if (!isDragging && !dragState.dragPreview && !isDrawingDependency) {
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
                {task.progress !== undefined && task.progress > 0 && (
                  <div
                    className="absolute top-0 left-0 h-full bg-black bg-opacity-30 rounded"
                    style={{ width: `${task.progress}%` }}
                  />
                )}
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
      {/* Similar rendering for week, month, quarter views would go here */}
    </tr>
  );
});

TaskRow.displayName = 'TaskRow';

const GanttChartComplete: React.FC = () => {
  console.log('GanttChartComplete rendering...');

  // Check for shared data in URL and load tasks
  const getInitialTasks = (): Task[] => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('share');

    if (sharedData) {
      try {
        const decoded = atob(sharedData);
        const data = JSON.parse(decoded);
        if (data.tasks && Array.isArray(data.tasks)) {
          return data.tasks;
        }
      } catch (err) {
        console.error('Failed to load shared data:', err);
      }
    }
    return [
      {
        id: 1,
        process: 'Planning',
        startDate: '01/01/2025',
        endDate: '28/02/2025',
        assignee: 'John Doe',
        status: 'completed',
        priority: 'high',
        progress: 100,
        description: 'Initial project planning phase',
        dependencies: []
      },
      {
        id: 2,
        process: 'Wireframing',
        startDate: '01/03/2025',
        endDate: '15/04/2025',
        assignee: 'Loran Doe',
        status: 'in-progress',
        priority: 'medium',
        progress: 60,
        description: 'Create wireframes for all pages',
        dependencies: [1]
      },
      {
        id: 3,
        process: 'Design Process',
        startDate: '15/03/2025',
        endDate: '31/05/2025',
        assignee: 'Anthony Black',
        status: 'in-progress',
        priority: 'high',
        progress: 45,
        description: 'UI/UX design',
        dependencies: [1]
      },
      {
        id: 4,
        process: 'Front-end development',
        startDate: '01/06/2025',
        endDate: '30/09/2025',
        assignee: 'Kate Small',
        status: 'not-started',
        priority: 'high',
        progress: 0,
        description: 'Build React components',
        dependencies: [3]
      },
      {
        id: 5,
        process: 'Back-end development',
        startDate: '01/05/2025',
        endDate: '31/08/2025',
        assignee: 'Jim White',
        status: 'not-started',
        priority: 'high',
        progress: 0,
        description: 'API and database development',
        dependencies: [1]
      },
      {
        id: 6,
        process: 'Deployment',
        startDate: '01/10/2025',
        endDate: '31/12/2025',
        assignee: 'John Doe',
        status: 'not-started',
        priority: 'medium',
        progress: 0,
        description: 'Deploy to production',
        dependencies: [4, 5]
      }
    ];
  };

  const [tasks, setTasks] = useState<Task[]>(getInitialTasks);
  const [isReadOnlyMode] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('readonly') === 'true';
  });

  const [currentPage, setCurrentPage] = useState<'chart' | 'edit'>('chart');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('day');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCriticalPath, setShowCriticalPath] = useState(true);

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

  const [dragState, setDragState] = useState<DragState>({
    draggingTask: null,
    dragStartX: 0,
    dragType: null,
    dragPreview: null,
    originalTaskState: null
  });

  const [isDrawingNewTask, setIsDrawingNewTask] = useState(false);
  const [newTaskDraw, setNewTaskDraw] = useState<{ startX: number; currentX: number; rowIndex: number } | null>(null);

  const [isDrawingDependency, setIsDrawingDependency] = useState(false);
  const [dependencyDraw, setDependencyDraw] = useState<{ fromTaskId: number; currentX: number; currentY: number } | null>(null);

  const [hoveredTask, setHoveredTask] = useState<{task: Task; x: number; y: number} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tgpInputRef = useRef<HTMLInputElement>(null);
  const ganttChartRef = useRef<HTMLDivElement>(null);

  // Calculate critical path using longest path algorithm
  const calculateCriticalPath = useMemo(() => {
    const criticalTaskIds = new Set<number>();

    // Calculate earliest start and finish times
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    const earlyStart = new Map<number, number>();
    const earlyFinish = new Map<number, number>();
    const lateStart = new Map<number, number>();
    const lateFinish = new Map<number, number>();

    // Helper to calculate duration in days
    const getDuration = (task: Task) => {
      const start = parseDate(task.startDate);
      const end = parseDate(task.endDate);
      if (!start || !end) return 0;
      return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    };

    // Forward pass - calculate early start and early finish
    const calculateEarly = (taskId: number, visited = new Set<number>()): number => {
      if (visited.has(taskId)) return earlyFinish.get(taskId) || 0;
      visited.add(taskId);

      const task = taskMap.get(taskId);
      if (!task) return 0;

      let maxPredecessorFinish = 0;
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          const finish = calculateEarly(depId, visited);
          maxPredecessorFinish = Math.max(maxPredecessorFinish, finish);
        });
      }

      earlyStart.set(taskId, maxPredecessorFinish);
      const duration = getDuration(task);
      const finish = maxPredecessorFinish + duration;
      earlyFinish.set(taskId, finish);
      return finish;
    };

    // Calculate early times for all tasks
    tasks.forEach(task => calculateEarly(task.id));

    // Find project end time
    const projectEnd = Math.max(...Array.from(earlyFinish.values()));

    // Backward pass - calculate late start and late finish
    const calculateLate = (taskId: number, visited = new Set<number>()): number => {
      if (visited.has(taskId)) return lateStart.get(taskId) || projectEnd;
      visited.add(taskId);

      const task = taskMap.get(taskId);
      if (!task) return projectEnd;

      // Find tasks that depend on this task
      const successors = tasks.filter(t =>
        t.dependencies && t.dependencies.includes(taskId)
      );

      let minSuccessorStart = projectEnd;
      if (successors.length > 0) {
        successors.forEach(successor => {
          const start = calculateLate(successor.id, visited);
          minSuccessorStart = Math.min(minSuccessorStart, start);
        });
      }

      lateFinish.set(taskId, minSuccessorStart);
      const duration = getDuration(task);
      const start = minSuccessorStart - duration;
      lateStart.set(taskId, start);
      return start;
    };

    // Calculate late times for all tasks
    tasks.forEach(task => calculateLate(task.id));

    // Identify critical tasks (slack = 0)
    tasks.forEach(task => {
      const es = earlyStart.get(task.id) || 0;
      const ls = lateStart.get(task.id) || 0;
      const slack = ls - es;

      if (Math.abs(slack) < 0.01) { // Critical if slack is essentially 0
        criticalTaskIds.add(task.id);
      }
    });

    return criticalTaskIds;
  }, [tasks]);

  // Save project as .tgp file
  const saveProjectAsTGP = () => {
    const data = JSON.stringify({ tasks, version: '1.0' }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project.tgp';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Open project from .tgp file
  const handleTGPFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        alert('Invalid .tgp file format');
      }
    };
    reader.readAsText(file);
  };

  // Get unique assignees for filter
  const uniqueAssignees = useMemo(() => {
    const assignees = new Set(tasks.map(t => t.assignee).filter(Boolean));
    return Array.from(assignees);
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesAssignee = filterAssignee === 'all' || task.assignee === filterAssignee;
      const matchesSearch = task.process.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesAssignee && matchesSearch;
    });
  }, [tasks, filterStatus, filterAssignee, searchTerm]);

  // Color classes for task bars with critical path consideration
  const getTaskColor = (task: Task) => {
    // Check if task is overdue
    const endDate = parseDate(task.endDate);
    const today = new Date();
    const isOverdue = endDate && endDate < today && task.status !== 'completed';

    if (isOverdue) return 'task-red';
    if (task.status === 'completed') return 'task-blue';
    if (task.status === 'in-progress') return 'task-yellow';
    return 'task-teal';
  };

  const isCriticalTask = (taskId: number) => {
    return showCriticalPath && calculateCriticalPath.has(taskId);
  };

  // Agile-style header data - colors match quarters
  const months = [
    // Q1 - Blue
    { key: 'JANUARY', short: 'JAN', days: 31, color: '#2b78e4', band: '#eaf3ff' },
    { key: 'FEBRUARY', short: 'FEB', days: 28, color: '#2b78e4', band: '#e9f6ff' },
    { key: 'MARCH', short: 'MAR', days: 31, color: '#2b78e4', band: '#e6f7fb' },
    // Q2 - Cyan
    { key: 'APRIL', short: 'APR', days: 30, color: '#00b0ff', band: '#e0f7ff' },
    { key: 'MAY', short: 'MAY', days: 31, color: '#00b0ff', band: '#e0f7ff' },
    { key: 'JUNE', short: 'JUN', days: 30, color: '#00b0ff', band: '#e0f7ff' },
    // Q3 - Orange
    { key: 'JULY', short: 'JUL', days: 31, color: '#ff9500', band: '#fff4e6' },
    { key: 'AUGUST', short: 'AUG', days: 31, color: '#ff9500', band: '#fff4e6' },
    { key: 'SEPTEMBER', short: 'SEP', days: 30, color: '#ff9500', band: '#fff4e6' },
    // Q4 - Green
    { key: 'OCTOBER', short: 'OCT', days: 31, color: '#34c759', band: '#e8f8ec' },
    { key: 'NOVEMBER', short: 'NOV', days: 30, color: '#34c759', band: '#e8f8ec' },
    { key: 'DECEMBER', short: 'DEC', days: 31, color: '#34c759', band: '#e8f8ec' }
  ];

  const q1Days = months[0].days + months[1].days + months[2].days; // Jan, Feb, Mar
  const q2Days = months[3].days + months[4].days + months[5].days; // Apr, May, Jun
  const q3Days = months[6].days + months[7].days + months[8].days; // Jul, Aug, Sep
  const q4Days = months[9].days + months[10].days + months[11].days; // Oct, Nov, Dec

  // Calculate weeks in each quarter for week zoom
  const q1Weeks = Math.ceil(months[0].days / 7) + Math.ceil(months[1].days / 7) + Math.ceil(months[2].days / 7);
  const q2Weeks = Math.ceil(months[3].days / 7) + Math.ceil(months[4].days / 7) + Math.ceil(months[5].days / 7);
  const q3Weeks = Math.ceil(months[6].days / 7) + Math.ceil(months[7].days / 7) + Math.ceil(months[8].days / 7);
  const q4Weeks = Math.ceil(months[9].days / 7) + Math.ceil(months[10].days / 7) + Math.ceil(months[11].days / 7);

  // Timeline range (full year 2025)
  const rangeStart = new Date(2025, 0, 1);
  const rangeEnd = new Date(2025, 11, 31);

  const dayColumns = useMemo(() => {
    const cols: { day: number; monthIndex: number }[] = [];
    months.forEach((m, mi) => {
      for (let d = 1; d <= m.days; d++) cols.push({ day: d, monthIndex: mi });
    });
    return cols;
  }, []);

  // Calculate columns based on zoom level
  const timelineColumns = useMemo(() => {
    if (zoomLevel === 'day') {
      return dayColumns;
    } else if (zoomLevel === 'week') {
      // Group by weeks (approx 4 weeks per month)
      const weekCols: { week: number; monthIndex: number }[] = [];
      months.forEach((m, mi) => {
        const weeksInMonth = Math.ceil(m.days / 7);
        for (let w = 1; w <= weeksInMonth; w++) {
          weekCols.push({ week: w, monthIndex: mi });
        }
      });
      return weekCols;
    } else if (zoomLevel === 'month') {
      return months.map((_m, mi) => ({ monthIndex: mi }));
    } else {
      // quarter view
      return [
        { quarter: 1 },
        { quarter: 2 },
        { quarter: 3 },
        { quarter: 4 }
      ];
    }
  }, [zoomLevel, dayColumns, months]);

  const addNewTask = () => {
    const newTask: Task = {
      id: Math.max(...tasks.map(t => t.id), 0) + 1,
      process: 'New Task',
      startDate: '01/01/2025',
      endDate: '31/01/2025',
      assignee: '',
      status: 'not-started',
      priority: 'medium',
      progress: 0,
      description: '',
      dependencies: []
    };
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const updateTask = (id: number, field: keyof Task, value: any) => {
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
    if (clampedEnd < rangeStart || clampedStart > rangeEnd) return null;

    const leftDays = (clampedStart.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24);
    const rightDays = (clampedEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
    const duration = rightDays - leftDays;

    // Adjust width based on zoom level
    let tdWidth = 28; // default for day
    if (zoomLevel === 'week') tdWidth = 40 / 7; // each week column represents 7 days
    else if (zoomLevel === 'month') tdWidth = 60 / 30; // each month column represents ~30 days
    else if (zoomLevel === 'quarter') tdWidth = 80 / 91; // each quarter column represents ~91 days

    // No label width offset needed anymore (labels in separate sidebar)
    return {
      left: `${leftDays * tdWidth}px`,
      width: `${duration * tdWidth}px`
    };
  };

  const exportToCSV = () => {
    const csv = [
      ['Process', 'Start Date', 'End Date', 'Assignee', 'Status', 'Priority', 'Progress', 'Description', 'Dependencies'].join(','),
      ...tasks.map(task => [
        `"${task.process}"`,
        task.startDate,
        task.endDate,
        `"${task.assignee || ''}"`,
        task.status || '',
        task.priority || '',
        task.progress || 0,
        `"${task.description || ''}"`,
        `"${(task.dependencies || []).join(';')}"`,
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

  const exportToPNG = async () => {
    if (!ganttChartRef.current) return;
    try {
      const canvas = await html2canvas(ganttChartRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gantt_chart.png';
      a.click();
    } catch (error) {
      console.error('Error exporting to PNG:', error);
      alert('Failed to export to PNG');
    }
  };

  const exportToPDF = async () => {
    if (!ganttChartRef.current) return;
    try {
      const canvas = await html2canvas(ganttChartRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('gantt_chart.pdf');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export to PDF');
    }
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
          endDate: values[2] || '',
          assignee: values[3] || '',
          status: (values[4] as Task['status']) || 'not-started',
          priority: (values[5] as Task['priority']) || 'medium',
          progress: parseInt(values[6]) || 0,
          description: values[7] || '',
          dependencies: values[8] ? values[8].split(';').map(Number).filter(n => !isNaN(n)) : []
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
    // Handle drawing dependency
    if (dependencyDraw) {
      setDependencyDraw({
        ...dependencyDraw,
        currentX: e.clientX,
        currentY: e.clientY
      });
      return;
    }

    // Handle drawing new task
    if (newTaskDraw) {
      setNewTaskDraw({
        ...newTaskDraw,
        currentX: e.clientX
      });
      return;
    }

    if (!dragState.draggingTask || !dragState.dragType || !dragState.originalTaskState) return;

    const ganttTable = document.querySelector('.gantt-timeline table') as HTMLElement;
    if (!ganttTable) return;

    const rect = ganttTable.getBoundingClientRect();
    const processColumn = ganttTable.querySelector('th:first-child') as HTMLElement;
    const processWidth = processColumn ? processColumn.offsetWidth : 200;

    const chartWidth = rect.width - processWidth;
    const deltaX = e.clientX - dragState.dragStartX;

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

  const handleMouseUp = (e?: React.MouseEvent) => {
    // Handle finishing drawing dependency
    if (dependencyDraw && e) {
      const target = e.target as HTMLElement;
      const taskBar = target.closest('.gantt-task-bar');

      if (taskBar) {
        const toTaskId = parseInt(taskBar.getAttribute('data-task-id') || '0');
        if (toTaskId && toTaskId !== dependencyDraw.fromTaskId) {
          const toTask = tasks.find(t => t.id === toTaskId);
          if (toTask) {
            const newDep = { taskId: dependencyDraw.fromTaskId, type: 'finish-to-start' as const };
            setTasks(tasks.map(task =>
              task.id === toTaskId
                ? {
                    ...task,
                    dependenciesV2: [...(task.dependenciesV2 || []), newDep],
                    dependencies: [...(task.dependencies || []), dependencyDraw.fromTaskId]
                  }
                : task
            ));
          }
        }
      }
      setDependencyDraw(null);
      return;
    }

    // Handle finishing drawing new task
    if (newTaskDraw) {
      const ganttTable = document.querySelector('.gantt-timeline table') as HTMLElement;
      if (ganttTable) {
        const rect = ganttTable.getBoundingClientRect();
        const processColumn = ganttTable.querySelector('th:first-child') as HTMLElement;
        const processWidth = processColumn ? processColumn.offsetWidth : 260;
        const chartWidth = rect.width - processWidth;

        const startX = Math.min(newTaskDraw.startX, newTaskDraw.currentX);
        const endX = Math.max(newTaskDraw.startX, newTaskDraw.currentX);

        const startOffset = startX - rect.left - processWidth;
        const endOffset = endX - rect.left - processWidth;

        const daysPerPixel = 365 / chartWidth;
        const startDay = Math.max(0, Math.floor(startOffset * daysPerPixel));
        const endDay = Math.min(364, Math.floor(endOffset * daysPerPixel));

        if (endDay - startDay >= 1) {
          const startDate = new Date(rangeStart);
          startDate.setDate(startDate.getDate() + startDay);

          const endDate = new Date(rangeStart);
          endDate.setDate(endDate.getDate() + endDay);

          const newTask: Task = {
            id: Math.max(...tasks.map(t => t.id), 0) + 1,
            process: 'New Task',
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            assignee: '',
            status: 'not-started',
            priority: 'medium',
            progress: 0,
            description: '',
            dependencies: []
          };

          setTasks([...tasks, newTask]);
          setEditingTask(newTask);
          setShowModal(true);
        }
      }
      setNewTaskDraw(null);
      setIsDrawingNewTask(false);
      return;
    }

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
  };

  // Draw dependency lines with SVG
  const renderDependencies = () => {
    const svgPaths: JSX.Element[] = [];

    filteredTasks.forEach((task, taskIndex) => {
      if (!task.dependencies || task.dependencies.length === 0) return;

      task.dependencies.forEach(depId => {
        const depTask = filteredTasks.find(t => t.id === depId);
        if (!depTask) return;

        const depIndex = filteredTasks.findIndex(t => t.id === depId);
        if (depIndex === -1) return;

        // Calculate positions
        const fromBarPos = calculateBarPosition(depTask.startDate, depTask.endDate);
        const toBarPos = calculateBarPosition(task.startDate, task.endDate);

        if (!fromBarPos || !toBarPos) return;

        // Parse positions
        const parseLeft = (left: string) => {
          const match = left.match(/calc\(([\d.]+)px \+ ([\d.]+)px\)/);
          if (match) return parseFloat(match[1]) + parseFloat(match[2]);
          return parseFloat(left);
        };

        const parseWidth = (width: string) => parseFloat(width);

        const fromLeft = parseLeft(fromBarPos.left);
        const fromWidth = parseWidth(fromBarPos.width);
        const toLeft = parseLeft(toBarPos.left);

        // Row heights
        const rowHeight = 60;
        const headerHeight = 150;
        const fromY = headerHeight + depIndex * rowHeight + rowHeight / 2;
        const toY = headerHeight + taskIndex * rowHeight + rowHeight / 2;

        // Start from end of predecessor bar, end at start of dependent bar
        const x1 = fromLeft + fromWidth;
        const y1 = fromY;
        const x2 = toLeft;
        const y2 = toY;

        // Create path with arrow
        const midX = (x1 + x2) / 2;
        const pathD = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;

        svgPaths.push(
          <g key={`dep-${depId}-${task.id}`}>
            <path
              d={pathD}
              stroke="#ff6b6b"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
          </g>
        );
      });
    });

    if (svgPaths.length === 0) return null;

    return (
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        style={{ width: '100%', height: '100%', zIndex: 8 }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#ff6b6b" />
          </marker>
        </defs>
        {svgPaths}
      </svg>
    );
  };

  return (
    <div
      className="w-full min-h-screen bg-white p-8"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="max-w-full mx-auto">
        {isReadOnlyMode && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
            <p className="font-bold">Read-Only Mode</p>
            <p className="text-sm">You are viewing a shared Gantt chart. Editing is disabled.</p>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
            <Calendar className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Project Gantt Chart</h1>
          </div>

          {/* Toolbar - Clean horizontal layout */}
          <div className="flex items-center gap-3 flex-wrap bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
            {/* View Toggle */}
            {!isReadOnlyMode && (
              <button
                onClick={() => setCurrentPage(currentPage === 'edit' ? 'chart' : 'edit')}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg text-sm font-semibold"
              >
                {currentPage === 'edit' ? 'View Chart' : 'Edit Data'}
              </button>
            )}

            {/* File Operations */}
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            <input ref={tgpInputRef} type="file" accept=".tgp" onChange={handleTGPFileUpload} className="hidden" />

            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all text-sm font-medium shadow-sm">
              <Upload className="w-4 h-4 inline mr-2" />
              Import CSV
            </button>

            <button onClick={() => tgpInputRef.current?.click()} className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all text-sm font-medium shadow-sm">
              <FolderOpen className="w-4 h-4 inline mr-2" />
              Open .TGP
            </button>

            <button onClick={exportToCSV} className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all text-sm font-medium shadow-sm">
              <Download className="w-4 h-4 inline mr-2" />
              Export CSV
            </button>

            <button onClick={exportToPNG} className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all text-sm font-medium shadow-sm">
              <FileImage className="w-4 h-4 inline mr-2" />
              Export PNG
            </button>

            <button onClick={exportToPDF} className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all text-sm font-medium shadow-sm">
              <Download className="w-4 h-4 inline mr-2" />
              Export PDF
            </button>

            <button onClick={saveProjectAsTGP} className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all text-sm font-medium shadow-sm">
              <Save className="w-4 h-4 inline mr-2" />
              Save .TGP
            </button>

            <button
              onClick={() => {
                const projectData = JSON.stringify({ tasks, version: '1.0' });
                const encoded = btoa(projectData);
                const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encoded}&readonly=true`;
                navigator.clipboard.writeText(shareUrl).then(() => {
                  alert('Shareable read-only link copied to clipboard!');
                }).catch(() => {
                  prompt('Copy this link:', shareUrl);
                });
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all text-sm font-medium shadow-md"
            >
              <Download className="w-4 h-4 inline mr-2" />
              Share Link
            </button>

            {/* Chart Tools */}
            {currentPage === 'chart' && (
              <>
                <div className="h-8 w-px bg-gray-400 mx-1"></div>

                <button onClick={() => setShowFilters(!showFilters)} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all text-sm font-medium shadow-md">
                  <Filter className="w-4 h-4 inline mr-2" />
                  Filters
                </button>

                <button
                  onClick={() => setShowCriticalPath(!showCriticalPath)}
                  className={`px-4 py-2 rounded-lg transition-all text-sm font-medium shadow-md ${showCriticalPath ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700' : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'}`}
                >
                  Critical Path
                </button>

                <button
                  onClick={() => {
                    setIsDrawingNewTask(!isDrawingNewTask);
                    if (isDrawingDependency) setIsDrawingDependency(false);
                  }}
                  className={`px-4 py-2 rounded-lg transition-all text-sm font-medium shadow-md ${isDrawingNewTask ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'}`}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Draw Task
                </button>

                <button
                  onClick={() => {
                    setIsDrawingDependency(!isDrawingDependency);
                    if (isDrawingNewTask) setIsDrawingNewTask(false);
                  }}
                  className={`px-4 py-2 rounded-lg transition-all text-sm font-medium shadow-md ${isDrawingDependency ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700' : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'}`}
                >
                  Link Tasks
                </button>

                <div className="flex items-center gap-1 bg-white border-2 border-gray-300 rounded-lg px-3 py-2 shadow-sm">
                  <button
                    onClick={() => {
                      const levels: ZoomLevel[] = ['day', 'week', 'month', 'quarter'];
                      const currentIndex = levels.indexOf(zoomLevel);
                      if (currentIndex > 0) setZoomLevel(levels[currentIndex - 1]);
                    }}
                    className="p-1.5 hover:bg-blue-100 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={zoomLevel === 'day'}
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4 text-blue-600" />
                  </button>
                  <span className="text-sm font-semibold px-3 min-w-[70px] text-center capitalize text-gray-700">{zoomLevel}</span>
                  <button
                    onClick={() => {
                      const levels: ZoomLevel[] = ['day', 'week', 'month', 'quarter'];
                      const currentIndex = levels.indexOf(zoomLevel);
                      if (currentIndex < levels.length - 1) setZoomLevel(levels[currentIndex + 1]);
                    }}
                    className="p-1.5 hover:bg-blue-100 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={zoomLevel === 'quarter'}
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              </>
            )}

            {currentPage === 'edit' && !isReadOnlyMode && (
              <button onClick={addNewTask} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition text-sm">
                <Plus className="w-4 h-4 inline mr-1" />
                Add Task
              </button>
            )}
          </div>
        </div>

        {showFilters && currentPage === 'chart' && (
          <div className="bg-gray-100 p-4 rounded-lg mb-4 flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-600" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option value="all">All</option>
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Assignee:</label>
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option value="all">All</option>
                {uniqueAssignees.map(assignee => (
                  <option key={assignee} value={assignee}>{assignee}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterAssignee('all');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}

        {currentPage === 'edit' ? (
          <div className="border-2 border-pink-300 rounded-lg overflow-hidden">
            <div className="bg-pink-200 p-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Task Data</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-pink-100">
                    <th className="border border-pink-300 p-3 text-left font-bold text-gray-800">Actions</th>
                    <th className="border border-pink-300 p-3 text-left font-bold text-gray-800">Task Name</th>
                    <th className="border border-pink-300 p-3 text-left font-bold text-gray-800">Start Date</th>
                    <th className="border border-pink-300 p-3 text-left font-bold text-gray-800">End Date</th>
                    <th className="border border-pink-300 p-3 text-left font-bold text-gray-800">Assignee</th>
                    <th className="border border-pink-300 p-3 text-left font-bold text-gray-800">Status</th>
                    <th className="border border-pink-300 p-3 text-left font-bold text-gray-800">Priority</th>
                    <th className="border border-pink-300 p-3 text-left font-bold text-gray-800">Progress (%)</th>
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
                      <td className="border border-pink-300 p-3">
                        <input
                          type="text"
                          value={task.assignee || ''}
                          onChange={(e) => updateTask(task.id, 'assignee', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                      </td>
                      <td className="border border-pink-300 p-3">
                        <select
                          value={task.status || 'not-started'}
                          onChange={(e) => updateTask(task.id, 'status', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                        >
                          <option value="not-started">Not Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </td>
                      <td className="border border-pink-300 p-3">
                        <select
                          value={task.priority || 'medium'}
                          onChange={(e) => updateTask(task.id, 'priority', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </td>
                      <td className="border border-pink-300 p-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={task.progress || 0}
                          onChange={(e) => updateTask(task.id, 'progress', parseInt(e.target.value))}
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
          <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-white shadow-lg" ref={ganttChartRef}>
            {/* Split View: Left Sidebar + Right Timeline */}
            <div className="flex" style={{ height: '700px', minHeight: '700px' }}>
              {/* Left Sidebar - Task List */}
              <div style={{ width: '320px', minWidth: '320px', maxWidth: '320px' }} className="border-r-2 border-gray-300 overflow-y-auto flex-shrink-0 bg-gradient-to-b from-gray-50 to-gray-100">
                {/* Task List Header */}
                <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-blue-700 border-b-2 border-blue-800 px-4 py-3 shadow-md">
                  <h3 className="font-bold text-white text-base">Tasks</h3>
                </div>

                {/* Task List Items */}
                <div className="divide-y divide-gray-300">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="px-4 py-3 hover:bg-blue-50 transition-all duration-200 cursor-pointer group border-l-4 hover:border-l-blue-500 border-l-transparent"
                      onClick={() => openEditModal(task)}
                      style={{ minHeight: '70px', display: 'flex', alignItems: 'center' }}
                    >
                      <div className="flex flex-col w-full gap-1">
                        <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors leading-relaxed break-words">
                          {task.process}
                        </div>
                        <div className="text-xs text-gray-600 font-medium leading-relaxed">
                          {task.assignee || 'Unassigned'}
                        </div>
                        {task.progress !== undefined && (
                          <div className="w-full bg-gray-300 rounded-full h-2 mt-1 shadow-inner">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 shadow-sm"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Timeline Canvas */}
              <div className="flex-1 overflow-x-auto overflow-y-auto gantt-timeline relative" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                <table className="border-collapse gantt-grid" style={{ minWidth: '100%' }}>
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th className="text-white p-2 text-center font-bold text-lg" colSpan={zoomLevel === 'day' ? q1Days + q2Days + q3Days + q4Days : zoomLevel === 'week' ? q1Weeks + q2Weeks + q3Weeks + q4Weeks : zoomLevel === 'month' ? 12 : 4} style={{ background: '#1a1a2e' }}>
                        2025
                      </th>
                    </tr>
                    <tr>
                    <th className="text-white p-2 text-center" style={{ background: '#2b78e4' }} colSpan={zoomLevel === 'day' ? q1Days : zoomLevel === 'week' ? q1Weeks : zoomLevel === 'month' ? 3 : 1}>Q1</th>
                    <th className="text-white p-2 text-center" style={{ background: '#00b0ff' }} colSpan={zoomLevel === 'day' ? q2Days : zoomLevel === 'week' ? q2Weeks : zoomLevel === 'month' ? 3 : 1}>Q2</th>
                    <th className="text-white p-2 text-center" style={{ background: '#ff9500' }} colSpan={zoomLevel === 'day' ? q3Days : zoomLevel === 'week' ? q3Weeks : zoomLevel === 'month' ? 3 : 1}>Q3</th>
                    <th className="text-white p-2 text-center" style={{ background: '#34c759' }} colSpan={zoomLevel === 'day' ? q4Days : zoomLevel === 'week' ? q4Weeks : zoomLevel === 'month' ? 3 : 1}>Q4</th>
                  </tr>
                  <tr>
                    {zoomLevel === 'day' && months.map((m, mi) => (
                      <th key={mi} className="text-white text-sm font-bold" style={{ background: m.color }} colSpan={m.days}>{m.short}</th>
                    ))}
                    {zoomLevel === 'week' && months.map((m, mi) => {
                      const weeksInMonth = Math.ceil(m.days / 7);
                      return <th key={mi} className="text-white text-sm font-bold" style={{ background: m.color }} colSpan={weeksInMonth}>{m.short}</th>
                    })}
                    {zoomLevel === 'month' && months.map((m, mi) => (
                      <th key={mi} className="text-white text-sm font-bold" style={{ background: m.color }} colSpan={1}>{m.short}</th>
                    ))}
                    {zoomLevel === 'quarter' && (
                      <>
                        <th className="text-white text-sm font-bold" style={{ background: '#2b78e4' }} colSpan={1}>Q1</th>
                        <th className="text-white text-sm font-bold" style={{ background: '#00b0ff' }} colSpan={1}>Q2</th>
                        <th className="text-white text-sm font-bold" style={{ background: '#ff9500' }} colSpan={1}>Q3</th>
                        <th className="text-white text-sm font-bold" style={{ background: '#34c759' }} colSpan={1}>Q4</th>
                      </>
                    )}
                  </tr>
                  <tr>
                    {zoomLevel === 'day' && dayColumns.map((c, idx) => (
                      <th key={idx} className="gantt-day-cell p-1 text-xs" style={{ minWidth: '28px', background: months[c.monthIndex].band }}>{c.day}</th>
                    ))}
                    {zoomLevel === 'week' && timelineColumns.map((c: any, idx) => (
                      <th key={idx} className="gantt-day-cell p-1 text-xs" style={{ minWidth: '40px', background: months[c.monthIndex].band }}>W{c.week}</th>
                    ))}
                    {zoomLevel === 'month' && timelineColumns.map((c: any, idx) => (
                      <th key={idx} className="gantt-day-cell p-1 text-xs" style={{ minWidth: '60px', background: months[c.monthIndex].band }}>{months[c.monthIndex].short}</th>
                    ))}
                    {zoomLevel === 'quarter' && timelineColumns.map((c: any, idx) => (
                      <th key={idx} className="gantt-day-cell p-1 text-xs" style={{ minWidth: '80px' }}>Q{c.quarter}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => {
                    const displayTask = dragState.draggingTask === task.id && dragState.dragPreview
                      ? { ...task, ...dragState.dragPreview }
                      : task;
                    const colorClass = getTaskColor(task);
                    return (
                      <tr key={task.id} style={{ height: '70px', minHeight: '70px' }}>
                        {zoomLevel === 'day' && dayColumns.map((c, dayIdx) => (
                          <td
                            key={dayIdx}
                            className="gantt-day-cell p-0 relative border-r border-gray-200"
                            style={{ height: '70px', minHeight: '70px', minWidth: '32px', background: months[c.monthIndex].band, cursor: isDrawingNewTask ? 'crosshair' : 'pointer' }}
                            onClick={(e) => {
                              // Check if clicking on empty space (not on a task bar)
                              const target = e.target as HTMLElement;
                              if (target.classList.contains('gantt-day-cell') && !isDrawingNewTask && !isDrawingDependency) {
                                // Calculate the date clicked
                                const dayOfYear = dayIdx + 1;
                                const clickDate = new Date(2025, 0, dayOfYear);

                                // Create new task
                                const newTask: Task = {
                                  id: Math.max(...tasks.map(t => t.id), 0) + 1,
                                  process: 'New Task',
                                  startDate: formatDate(clickDate),
                                  endDate: formatDate(new Date(clickDate.getTime() + 7 * 24 * 60 * 60 * 1000)), // 7 days duration
                                  assignee: '',
                                  status: 'not-started',
                                  priority: 'medium',
                                  progress: 0,
                                  description: '',
                                  dependencies: []
                                };

                                setTasks([...tasks, newTask]);
                                setEditingTask(newTask);
                                setShowModal(true);
                              }
                            }}
                            onMouseDown={(e) => {
                              if (isDrawingNewTask && dayIdx === 0) {
                                e.preventDefault();
                                const taskIndex = filteredTasks.findIndex(t => t.id === task.id);
                                setNewTaskDraw({
                                  startX: e.clientX,
                                  currentX: e.clientX,
                                  rowIndex: taskIndex
                                });
                              }
                            }}
                          >
                            {dayIdx === 0 && (() => {
                              const barPosition = calculateBarPosition(displayTask.startDate, displayTask.endDate);
                              if (!barPosition) return null;
                              const isDragging = dragState.draggingTask === task.id;
                              const isCritical = isCriticalTask(task.id);
                              return (
                                <div
                                  className={`absolute gantt-task-bar ${colorClass}`}
                                  data-task-id={task.id}
                                  style={{
                                    left: barPosition.left,
                                    width: barPosition.width,
                                    height: '24px',
                                    opacity: isDragging ? 0.4 : 1,
                                    zIndex: isDragging ? 20 : 10,
                                    cursor: isDrawingDependency ? 'pointer' : 'move',
                                    border: isCritical ? '3px solid #ff0000' : '1px solid rgba(0, 0, 0, 0.1)',
                                    boxShadow: isCritical ? '0 0 8px rgba(255, 0, 0, 0.6)' : (isDragging ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)'),
                                    transform: isDragging ? 'scale(1.05)' : 'scale(1)',
                                    transition: isDragging ? 'none' : 'all 0.2s ease',
                                    top: '50%',
                                    marginTop: '-12px'
                                  }}
                                  onMouseDown={(e) => {
                                    if (isDrawingDependency) {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setDependencyDraw({
                                        fromTaskId: task.id,
                                        currentX: e.clientX,
                                        currentY: e.clientY
                                      });
                                    } else {
                                      e.preventDefault();
                                      handleBarMouseDown(e, task, 'move');
                                    }
                                  }}
                                  onClick={(e) => {
                                    if (!isDragging && !dragState.dragPreview && !isDrawingDependency) {
                                      e.stopPropagation();
                                      openEditModal(task);
                                    }
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isDragging && !isDrawingDependency) {
                                      setHoveredTask({ task, x: e.clientX, y: e.clientY });
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    setHoveredTask(null);
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
                                  {task.progress !== undefined && task.progress > 0 && (
                                    <div
                                      className="absolute top-0 left-0 h-full bg-black bg-opacity-30 rounded"
                                      style={{ width: `${task.progress}%` }}
                                    />
                                  )}
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
                        {zoomLevel === 'week' && timelineColumns.map((_c: any, idx) => (
                          <td key={idx} className="gantt-day-cell p-0 relative" style={{ height: '60px', minWidth: '40px', background: months[_c.monthIndex].band }}>
                            {idx === 0 && (() => {
                              const barPosition = calculateBarPosition(displayTask.startDate, displayTask.endDate);
                              if (!barPosition) return null;
                              const isDragging = dragState.draggingTask === task.id;
                              const isCritical = isCriticalTask(task.id);
                              return (
                                <div
                                  className={`absolute gantt-task-bar ${getTaskColor(task)}`}
                                  style={{
                                    left: barPosition.left,
                                    width: barPosition.width,
                                    height: '20px',
                                    opacity: isDragging ? 0.9 : 1,
                                    zIndex: 10,
                                    cursor: 'move',
                                    border: isCritical ? '3px solid #ff0000' : 'none',
                                    boxShadow: isCritical ? '0 0 8px rgba(255, 0, 0, 0.6)' : 'none'
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
                                  {task.progress !== undefined && task.progress > 0 && (
                                    <div
                                      className="absolute top-0 left-0 h-full bg-black bg-opacity-30 rounded"
                                      style={{ width: `${task.progress}%` }}
                                    />
                                  )}
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
                        {zoomLevel === 'month' && timelineColumns.map((c: any, idx) => (
                          <td key={idx} className="gantt-day-cell p-0 relative" style={{ height: '60px', minWidth: '60px', background: months[c.monthIndex].band }}>
                            {idx === 0 && (() => {
                              const barPosition = calculateBarPosition(displayTask.startDate, displayTask.endDate);
                              if (!barPosition) return null;
                              const isDragging = dragState.draggingTask === task.id;
                              const isCritical = isCriticalTask(task.id);
                              return (
                                <div
                                  className={`absolute gantt-task-bar ${getTaskColor(task)}`}
                                  style={{
                                    left: barPosition.left,
                                    width: barPosition.width,
                                    height: '20px',
                                    opacity: isDragging ? 0.9 : 1,
                                    zIndex: 10,
                                    cursor: 'move',
                                    border: isCritical ? '3px solid #ff0000' : 'none',
                                    boxShadow: isCritical ? '0 0 8px rgba(255, 0, 0, 0.6)' : 'none'
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
                                  {task.progress !== undefined && task.progress > 0 && (
                                    <div
                                      className="absolute top-0 left-0 h-full bg-black bg-opacity-30 rounded"
                                      style={{ width: `${task.progress}%` }}
                                    />
                                  )}
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
                        {zoomLevel === 'quarter' && timelineColumns.map((_c: any, idx) => (
                          <td key={idx} className="gantt-day-cell p-0 relative" style={{ height: '60px', minWidth: '80px' }}>
                            {idx === 0 && (() => {
                              const barPosition = calculateBarPosition(displayTask.startDate, displayTask.endDate);
                              if (!barPosition) return null;
                              const isDragging = dragState.draggingTask === task.id;
                              const isCritical = isCriticalTask(task.id);
                              return (
                                <div
                                  className={`absolute gantt-task-bar ${getTaskColor(task)}`}
                                  style={{
                                    left: barPosition.left,
                                    width: barPosition.width,
                                    height: '20px',
                                    opacity: isDragging ? 0.9 : 1,
                                    zIndex: 10,
                                    cursor: 'move',
                                    border: isCritical ? '3px solid #ff0000' : 'none',
                                    boxShadow: isCritical ? '0 0 8px rgba(255, 0, 0, 0.6)' : 'none'
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
                                  {task.progress !== undefined && task.progress > 0 && (
                                    <div
                                      className="absolute top-0 left-0 h-full bg-black bg-opacity-30 rounded"
                                      style={{ width: `${task.progress}%` }}
                                    />
                                  )}
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

              {/* Today line */}
                {(() => {
                  const today = new Date();
                  if (today < rangeStart || today > rangeEnd) return null;
                  const daysFromStart = (today.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24);

                  // Calculate pixel position based on zoom level
                  let tdWidth = 28;
                  if (zoomLevel === 'week') tdWidth = 40 / 7;
                  else if (zoomLevel === 'month') tdWidth = 60 / 30;
                  else if (zoomLevel === 'quarter') tdWidth = 80 / 91;

                  const leftPx = daysFromStart * tdWidth;

                  return (
                    <>
                      <div className="absolute pointer-events-none" style={{ left: `${leftPx}px`, top: '100px', bottom: 0, width: '2px', background: '#08a0ff', zIndex: 5 }} />
                      <div className="absolute text-white text-xs font-bold px-2 py-1 rounded pointer-events-none" style={{ left: `${leftPx - 25}px`, top: '80px', background: '#08a0ff', zIndex: 5 }}>
                        TODAY
                      </div>
                    </>
                  );
                })()}

            {renderDependencies()}

            {/* Dragging task preview - ghost bar */}
            {dragState.draggingTask && dragState.dragPreview && (() => {
              const task = tasks.find(t => t.id === dragState.draggingTask);
              if (!task) return null;

              const previewPosition = calculateBarPosition(dragState.dragPreview.startDate, dragState.dragPreview.endDate);
              if (!previewPosition) return null;

              const taskIndex = filteredTasks.findIndex(t => t.id === dragState.draggingTask);
              if (taskIndex === -1) return null;

              const rowHeight = 60;
              const headerHeight = 150;
              const top = headerHeight + taskIndex * rowHeight + (rowHeight - 20) / 2;

              return (
                <div
                  className={`absolute ${getTaskColor(task)} pointer-events-none`}
                  style={{
                    left: previewPosition.left,
                    top: `${top}px`,
                    width: previewPosition.width,
                    height: '20px',
                    opacity: 0.6,
                    zIndex: 15,
                    border: '2px dashed #4B5563',
                    borderRadius: '4px'
                  }}
                />
              );
            })()}

            {/* Drawing new task preview */}
            {newTaskDraw && (() => {
              const ganttTable = document.querySelector('.gantt-timeline table') as HTMLElement;
              if (!ganttTable) return null;

              const rect = ganttTable.getBoundingClientRect();

              const startX = Math.min(newTaskDraw.startX, newTaskDraw.currentX) - rect.left;
              const endX = Math.max(newTaskDraw.startX, newTaskDraw.currentX) - rect.left;
              const width = endX - startX;

              const rowHeight = 60;
              const headerHeight = 150;
              const top = headerHeight + newTaskDraw.rowIndex * rowHeight + (rowHeight - 20) / 2;

              return (
                <div
                  className="absolute bg-pink-400 opacity-60 rounded"
                  style={{
                    left: `${startX}px`,
                    top: `${top}px`,
                    width: `${width}px`,
                    height: '20px',
                    zIndex: 15,
                    pointerEvents: 'none'
                  }}
                />
              );
            })()}

            {/* Drawing dependency preview */}
            {dependencyDraw && (() => {
              const fromTask = tasks.find(t => t.id === dependencyDraw.fromTaskId);
              if (!fromTask) return null;

              const ganttTable = document.querySelector('.gantt-timeline table') as HTMLElement;
              if (!ganttTable) return null;

              const rect = ganttTable.getBoundingClientRect();
              const barPosition = calculateBarPosition(fromTask.startDate, fromTask.endDate);
              if (!barPosition) return null;

              // Parse the left position
              const match = barPosition.left.match(/calc\(([\d.]+)px \+ ([\d.]+)px\)/);
              const barLeft = match ? parseFloat(match[1]) + parseFloat(match[2]) : 0;
              const barWidth = parseFloat(barPosition.width);

              const startX = barLeft + barWidth;
              const taskIndex = filteredTasks.findIndex(t => t.id === dependencyDraw.fromTaskId);
              const startY = 150 + taskIndex * 60 + 30; // header + row height * index + half row

              return (
                <svg
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{ width: '100%', height: '100%', zIndex: 20 }}
                >
                  <line
                    x1={startX}
                    y1={startY}
                    x2={dependencyDraw.currentX - rect.left}
                    y2={dependencyDraw.currentY - rect.top}
                    stroke="#6366f1"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                  />
                  <circle
                    cx={dependencyDraw.currentX - rect.left}
                    cy={dependencyDraw.currentY - rect.top}
                    r="6"
                    fill="#6366f1"
                  />
                </svg>
              );
            })()}

              {/* Tooltip */}
              {hoveredTask && (
                <div
                  className="fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl text-sm pointer-events-none"
                  style={{
                    left: `${hoveredTask.x + 10}px`,
                    top: `${hoveredTask.y - 60}px`,
                  }}
                >
                  <div className="font-semibold">{hoveredTask.task.process}</div>
                  <div className="text-xs text-gray-300 mt-1">
                    {hoveredTask.task.startDate} → {hoveredTask.task.endDate}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {hoveredTask.task.assignee} • {hoveredTask.task.progress}% complete
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-gray-200" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 rounded-t-2xl border-b-2 border-blue-800">
              <h2 className="text-2xl font-bold text-white">{editingTask.id ? 'Edit Task' : 'New Task'}</h2>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-5">
              {/* Task Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Task Name</label>
                <input
                  type="text"
                  value={editingTask.process}
                  onChange={(e) => setEditingTask({ ...editingTask, process: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter task name"
                />
              </div>

              {/* Start & End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={toInputFormat(editingTask.startDate)}
                    onChange={(e) => setEditingTask({ ...editingTask, startDate: fromInputFormat(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={toInputFormat(editingTask.endDate)}
                    onChange={(e) => setEditingTask({ ...editingTask, endDate: fromInputFormat(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assignee</label>
                <input
                  type="text"
                  value={editingTask.assignee || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, assignee: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., John Doe"
                />
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={editingTask.status || 'not-started'}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as Task['status'] })}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select
                    value={editingTask.priority || 'medium'}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Task['priority'] })}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Progress */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Progress (%)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editingTask.progress || 0}
                    onChange={(e) => setEditingTask({ ...editingTask, progress: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingTask.progress || 0}
                    onChange={(e) => setEditingTask({ ...editingTask, progress: parseInt(e.target.value) })}
                    className="w-20 px-3 py-2 bg-white border-2 border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center font-semibold"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                  rows={3}
                  placeholder="Enter task description..."
                />
              </div>

              {/* Dependencies */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dependencies</label>
                <p className="text-xs text-gray-500 mb-3">Tasks this task depends on:</p>

                {/* Existing Dependencies */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {editingTask.dependenciesV2 && editingTask.dependenciesV2.length > 0 ? (
                    editingTask.dependenciesV2.map((dep, idx) => {
                      const depTask = tasks.find(t => t.id === dep.taskId);
                      const typeLabel = dep.type === 'finish-to-start' ? 'FS' : dep.type === 'start-to-start' ? 'SS' : 'FF';
                      return (
                        <div key={idx} className="flex items-center gap-2 bg-blue-100 px-3 py-1.5 rounded-lg text-sm border border-blue-200">
                          <span className="text-blue-900 font-medium">{depTask?.process || `Task ${dep.taskId}`}</span>
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded font-semibold">{typeLabel}</span>
                          <button
                            onClick={() => {
                              setEditingTask({
                                ...editingTask,
                                dependenciesV2: editingTask.dependenciesV2?.filter((_, i) => i !== idx) || [],
                                dependencies: editingTask.dependenciesV2?.filter((_, i) => i !== idx).map(d => d.taskId) || []
                              });
                            }}
                            className="text-red-600 hover:text-red-800 font-bold text-lg leading-none"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })
                  ) : editingTask.dependencies && editingTask.dependencies.length > 0 ? (
                    editingTask.dependencies.map((depId) => {
                      const depTask = tasks.find(t => t.id === depId);
                      return (
                        <div key={depId} className="flex items-center gap-2 bg-blue-100 px-3 py-1.5 rounded-lg text-sm border border-blue-200">
                          <span className="text-blue-900 font-medium">{depTask?.process || `Task ${depId}`}</span>
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded font-semibold">FS</span>
                          <button
                            onClick={() => {
                              setEditingTask({
                                ...editingTask,
                                dependencies: editingTask.dependencies?.filter(id => id !== depId) || []
                              });
                            }}
                            className="text-red-600 hover:text-red-800 font-bold text-lg leading-none"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-sm text-gray-400 italic">No dependencies</span>
                  )}
                </div>

                {/* Add Dependency */}
                <div className="flex gap-2">
                  <select
                    id="dep-task-select"
                    className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                  >
                    <option value="">Select task...</option>
                    {tasks
                      .filter(t => t.id !== editingTask.id && !(editingTask.dependenciesV2?.some(d => d.taskId === t.id) || editingTask.dependencies?.includes(t.id)))
                      .map(t => (
                        <option key={t.id} value={t.id}>{t.process}</option>
                      ))
                    }
                  </select>
                  <select
                    id="dep-type-select"
                    className="px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                  >
                    <option value="finish-to-start">Finish-to-Start (FS)</option>
                    <option value="start-to-start">Start-to-Start (SS)</option>
                    <option value="finish-to-finish">Finish-to-Finish (FF)</option>
                  </select>
                  <button
                    onClick={() => {
                      const taskSelect = document.getElementById('dep-task-select') as HTMLSelectElement;
                      const typeSelect = document.getElementById('dep-type-select') as HTMLSelectElement;
                      const depId = parseInt(taskSelect.value);
                      const depType = typeSelect.value as 'finish-to-start' | 'start-to-start' | 'finish-to-finish';

                      if (depId) {
                        const newDep = { taskId: depId, type: depType };
                        setEditingTask({
                          ...editingTask,
                          dependenciesV2: [...(editingTask.dependenciesV2 || []), newDep],
                          dependencies: [...(editingTask.dependencies || []), depId]
                        });
                        taskSelect.value = '';
                      }
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all text-sm font-semibold shadow-md"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-5 bg-gray-100 rounded-b-2xl flex gap-3 border-t-2 border-gray-200">
              <button
                onClick={saveEditedTask}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md hover:shadow-lg text-base"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingTask(null);
                }}
                className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold shadow-sm text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default GanttChartComplete;
