import React, { useState, useRef } from 'react';
import { Calendar, Download, Plus, Trash2, Upload } from 'lucide-react';
import { Task, DragState } from '../../types';
import '../GanttChart.css';

const GanttChartGenerator: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      process: 'Planning',
      startDate: '01/01/2025',
      endDate: '28/02/2025',
    },
    {
      id: 2,
      process: 'Wireframing',
      startDate: '01/03/2025',
      endDate: '15/04/2025',
    },
    {
      id: 3,
      process: 'Design Process',
      startDate: '15/03/2025',
      endDate: '31/05/2025',
    },
    {
      id: 4,
      process: 'Front-end development',
      startDate: '01/06/2025',
      endDate: '30/09/2025',
    },
    {
      id: 5,
      process: 'Back-end development',
      startDate: '01/05/2025',
      endDate: '31/08/2025',
    },
    {
      id: 6,
      process: 'Deployment',
      startDate: '01/10/2025',
      endDate: '31/12/2025',
    }
  ]);

  const [currentPage, setCurrentPage] = useState<'chart' | 'edit'>('chart');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [dragState, setDragState] = useState<DragState>({
    draggingTask: null,
    dragStartX: 0,
    dragType: null,
    dragPreview: null,
    originalTaskState: null
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const months = [
    { name: 'Jan', quarter: 1, month: 1 },
    { name: 'Feb', quarter: 1, month: 2 },
    { name: 'Mar', quarter: 1, month: 3 },
    { name: 'Apr', quarter: 2, month: 4 },
    { name: 'May', quarter: 2, month: 5 },
    { name: 'Jun', quarter: 2, month: 6 },
    { name: 'Jul', quarter: 3, month: 7 },
    { name: 'Aug', quarter: 3, month: 8 },
    { name: 'Sep', quarter: 3, month: 9 },
    { name: 'Oct', quarter: 3, month: 10 },
    { name: 'Nov', quarter: 3, month: 11 },
    { name: 'Dec', quarter: 3, month: 12 }
  ];

  const quarters = [
    { name: 'QUARTER 1', months: ['Jan', 'Feb', 'Mar'] },
    { name: 'QUARTER 2', months: ['Apr', 'May', 'Jun'] },
    { name: 'QUARTER 3', months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] }
  ];

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
    
    // Calculate position based on days from January 1, 2025
    const yearStart = new Date(2025, 0, 1);
    const yearEnd = new Date(2025, 11, 31);
    
    const totalDays = (yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
    const startDays = (start.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24);
    const endDays = (end.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
    const duration = endDays - startDays;
    
    return {
      left: `${(startDays / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
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
            {currentPage === 'edit' && (
              <button
                onClick={addNewTask}
                className="flex items-center gap-2 px-4 py-2 bg-pink-400 text-white rounded hover:bg-pink-500 transition font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Process
              </button>
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
          <div className="border-2 border-pink-300 rounded-lg overflow-hidden relative">
            <div className="overflow-x-auto gantt-timeline">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-pink-300 border-2 border-gray-800 p-4 text-center font-black text-gray-900 text-lg" rowSpan={2} style={{ width: '200px' }}>
                      PROCESS
                    </th>
                    {quarters.map((quarter, idx) => (
                      <th
                        key={idx}
                        className="bg-pink-200 border-2 border-gray-800 p-3 text-center font-black text-gray-900 text-base"
                        colSpan={quarter.months.length}
                      >
                        {quarter.name}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {months.map((month, idx) => (
                      <th
                        key={idx}
                        className="bg-pink-200 border border-gray-800 p-2 text-center font-bold text-gray-900 text-sm"
                        style={{ minWidth: '80px' }}
                      >
                        {month.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => {
                    const displayTask = dragState.draggingTask === task.id && dragState.dragPreview 
                      ? { ...task, ...dragState.dragPreview }
                      : task;
                    return (
                      <tr key={task.id}>
                        <td className="bg-white border-2 border-gray-800 p-4 font-medium text-gray-900" style={{ width: '200px' }}>
                          {task.process}
                        </td>
                        {months.map((_, monthIdx) => (
                          <td
                            key={monthIdx}
                            className="bg-pink-50 border border-gray-400 p-0 relative"
                            style={{ 
                              height: '60px',
                              minWidth: '80px'
                            }}
                          >
                            {monthIdx === 0 && (() => {
                              const barPosition = calculateBarPosition(displayTask.startDate, displayTask.endDate);
                              if (!barPosition) return null;
                              const isDragging = dragState.draggingTask === task.id;
                              return (
                                <div
                                  className={`absolute rounded transition-colors group ${
                                    isDragging ? 'bg-pink-400 shadow-lg cursor-grabbing' : 'bg-pink-300 cursor-grab hover:bg-pink-400'
                                  }`}
                                  style={{
                                    left: barPosition.left,
                                    width: barPosition.width,
                                    height: '32px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    opacity: isDragging ? 0.8 : 1,
                                    minWidth: '20px',
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
                                    className="absolute left-0 top-0 bottom-0 w-2 bg-pink-500 rounded-l cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      handleBarMouseDown(e, task, 'resize-left');
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div
                                    className="absolute right-0 top-0 bottom-0 w-2 bg-pink-500 rounded-r cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
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
            </div>
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