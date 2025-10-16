import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Task, ZoomLevel, Epic, Milestone } from '../../types';
import { calculateEpicDates } from '../../utils/epicDateCalculator';

interface GanttChartViewProps {
  tasks: Task[];
  epics: Epic[];
  milestones: Milestone[];
  zoomLevel: ZoomLevel;
  onTaskClick: (task: Task) => void;
  onEpicClick?: (epic: Epic) => void;
  onEmptyCellClick: (date: Date, taskIndex?: number) => void;
  onTaskDragInChart: (taskId: number, newStartDate: string, newEndDate: string) => void;
  onMilestoneCreate: (date: string) => void;
  onMilestoneClick: (milestone: Milestone) => void;
  onMilestoneDragUpdate: (milestone: Milestone) => void;
  showCriticalPath: boolean;
  onTaskReorder?: (fromIndex: number, toIndex: number) => void;
}

interface BarPosition {
  left: string;
  width: string;
}

const GanttChartView = forwardRef<HTMLDivElement, GanttChartViewProps>(({
  tasks,
  epics,
  milestones,
  zoomLevel,
  onTaskClick,
  onEpicClick,
  onEmptyCellClick,
  onTaskDragInChart: _onTaskDragInChart,
  onMilestoneCreate,
  onMilestoneClick,
  onMilestoneDragUpdate,
  showCriticalPath,
  onTaskReorder
}, scrollRef) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [draggedTask, setDraggedTask] = useState<{ task: Task; startX: number } | null>(null);
  const [milestonePreviewPosition, setMilestonePreviewPosition] = useState<number | null>(null);
  const [draggedMilestone, setDraggedMilestone] = useState<{ milestone: Milestone; startX: number; originalPosition: number } | null>(null);
  const [draggedTaskRowIndex, setDraggedTaskRowIndex] = useState<number | null>(null);
  const [dropTargetRowIndex, setDropTargetRowIndex] = useState<number | null>(null);

  // Generate time columns based on zoom level
  const generateTimeColumns = () => {
    const columns = [];
    const today = new Date();
    const startDate = new Date(today.getFullYear(), 0, 1); // Start of year

    if (zoomLevel === 'week') {
      // Generate 52 weeks
      for (let i = 0; i < 52; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + i * 7);
        columns.push({
          label: `W${i + 1}`,
          date: weekStart,
          type: 'week',
          month: weekStart.getMonth(),
          monthName: weekStart.toLocaleDateString('en-US', { month: 'short' }),
          quarter: Math.floor(weekStart.getMonth() / 3)
        });
      }
    } else if (zoomLevel === 'month') {
      // Generate 12 months
      for (let i = 0; i < 12; i++) {
        columns.push({
          label: new Date(today.getFullYear(), i, 1).toLocaleDateString('en-US', { month: 'short' }),
          date: new Date(today.getFullYear(), i, 1),
          type: 'month',
          month: i,
          monthName: new Date(today.getFullYear(), i, 1).toLocaleDateString('en-US', { month: 'short' })
        });
      }
    } else if (zoomLevel === 'quarter') {
      // Generate 4 quarters
      for (let i = 0; i < 4; i++) {
        columns.push({
          label: `Q${i + 1}`,
          date: new Date(today.getFullYear(), i * 3, 1),
          type: 'quarter',
          month: i * 3,
          monthName: ''
        });
      }
    } else {
      // Generate days (showing 365 days)
      for (let i = 0; i < 365; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
        const isSaturday = date.getDay() === 6;
        const isSunday = date.getDay() === 0;
        columns.push({
          label: date.getDate().toString(),
          date: date,
          type: 'day',
          month: date.getMonth(),
          monthName: date.toLocaleDateString('en-US', { month: 'long' }),
          dayOfWeek: dayOfWeek,
          isWeekend: isSaturday || isSunday
        });
      }
    }

    return columns;
  };

  const timeColumns = generateTimeColumns();

  // Group columns by month for day view header
  const getMonthGroups = () => {
    if (zoomLevel !== 'day') return [];

    const groups: { monthName: string; count: number; startIndex: number }[] = [];
    let currentMonth = -1;
    let currentGroup: { monthName: string; count: number; startIndex: number } | null = null;

    timeColumns.forEach((col, idx) => {
      if (col.month !== currentMonth) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentMonth = col.month;
        currentGroup = {
          monthName: col.monthName,
          count: 1,
          startIndex: idx
        };
      } else if (currentGroup) {
        currentGroup.count++;
      }
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  };

  const monthGroups = getMonthGroups();

  // Group columns by quarter for week view header
  const getQuarterGroups = () => {
    if (zoomLevel !== 'week') return [];

    const groups: { quarterName: string; count: number; startIndex: number }[] = [];
    let currentQuarter = -1;
    let currentGroup: { quarterName: string; count: number; startIndex: number } | null = null;

    timeColumns.forEach((col: any, idx) => {
      if (col.quarter !== currentQuarter) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentQuarter = col.quarter;
        currentGroup = {
          quarterName: `Q${col.quarter + 1} ${col.date.getFullYear()}`,
          count: 1,
          startIndex: idx
        };
      } else if (currentGroup) {
        currentGroup.count++;
      }
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  };

  const quarterGroups = getQuarterGroups();

  // Calculate today's position
  const getTodayPosition = (): number | null => {
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

    // Check if today is within the visible range
    if (todayIndex < 0 || todayIndex >= timeColumns.length) return null;

    const columnWidth = 100 / timeColumns.length;
    return todayIndex * columnWidth;
  };

  const todayPosition = getTodayPosition();

  // Parse date from DD/MM/YYYY format
  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  // Format date to DD/MM/YYYY
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Calculate milestone position (similar to today position but for any date)
  const getMilestonePosition = (dateStr: string): number | null => {
    const date = parseDate(dateStr);
    const yearStart = new Date(date.getFullYear(), 0, 1);

    let dateIndex = 0;

    if (zoomLevel === 'day') {
      dateIndex = Math.floor((date.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
    } else if (zoomLevel === 'week') {
      dateIndex = Math.floor((date.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24 * 7));
    } else if (zoomLevel === 'month') {
      dateIndex = date.getMonth();
    } else if (zoomLevel === 'quarter') {
      dateIndex = Math.floor(date.getMonth() / 3);
    }

    // Check if date is within the visible range
    if (dateIndex < 0 || dateIndex >= timeColumns.length) return null;

    const columnWidth = 100 / timeColumns.length;
    return dateIndex * columnWidth;
  };

  // Calculate bar position for a task
  const calculateBarPosition = (startDate: string, endDate: string): BarPosition | null => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const yearStart = new Date(start.getFullYear(), 0, 1);

    let startPosition = 0;
    let endPosition = 0;

    if (zoomLevel === 'day') {
      startPosition = Math.floor((start.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
      endPosition = Math.floor((end.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)) + 1; // +1 to include end date
    } else if (zoomLevel === 'week') {
      startPosition = Math.floor((start.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24 * 7));
      endPosition = Math.floor((end.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1; // +1 to include end week
    } else if (zoomLevel === 'month') {
      // For month view, we need more granular positioning within each month
      const startMonth = start.getMonth();
      const endMonth = end.getMonth();
      const startDay = start.getDate();
      const endDay = end.getDate();

      // Get the number of days in start and end months
      const daysInStartMonth = new Date(start.getFullYear(), startMonth + 1, 0).getDate();
      const daysInEndMonth = new Date(end.getFullYear(), endMonth + 1, 0).getDate();

      // Calculate fractional position within the month
      const startFraction = (startDay - 1) / daysInStartMonth; // -1 because day 1 should start at 0%
      const endFraction = endDay / daysInEndMonth;

      startPosition = startMonth + startFraction;
      endPosition = endMonth + endFraction;
    } else if (zoomLevel === 'quarter') {
      // For quarter view, calculate position within the quarter
      const startQuarter = Math.floor(start.getMonth() / 3);
      const endQuarter = Math.floor(end.getMonth() / 3);
      const startMonthInQuarter = start.getMonth() % 3;
      const endMonthInQuarter = end.getMonth() % 3;
      const startDay = start.getDate();
      const endDay = end.getDate();

      // Get days in the month
      const daysInStartMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
      const daysInEndMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();

      // Calculate fractional position within the quarter (each quarter has 3 months)
      const startFraction = (startMonthInQuarter + (startDay - 1) / daysInStartMonth) / 3;
      const endFraction = (endMonthInQuarter + endDay / daysInEndMonth) / 3;

      startPosition = startQuarter + startFraction;
      endPosition = endQuarter + endFraction;
    }

    const columnWidth = 100 / timeColumns.length;
    const left = startPosition * columnWidth;
    const width = (endPosition - startPosition) * columnWidth;

    return {
      left: `${left}%`,
      width: `${width}%`
    };
  };

  // Get color based on status
  const getTaskColor = (task: Task): string => {
    if (task.status === 'completed') return 'bg-green-400';
    if (task.status === 'in-progress') return 'bg-blue-400';
    if (task.status === 'overdue') return 'bg-red-400';
    return 'bg-gray-300';
  };

  // Get color based on Epic status
  const getEpicColor = (epic: Epic): string => {
    if (epic.status === 'completed') return 'bg-green-500';
    if (epic.status === 'in-progress') return 'bg-blue-500';
    if (epic.status === 'overdue') return 'bg-red-500';
    return 'bg-gray-400';
  };

  // Prepare Epic data with calculated dates
  const epicsWithDates = epics.map(epic => {
    const dates = calculateEpicDates(epic.id, tasks);
    return {
      ...epic,
      startDate: dates?.startDate,
      endDate: dates?.endDate
    };
  }).filter(epic => epic.startDate && epic.endDate); // Only show epics with tasks

  // Determine what to display based on zoom level
  const shouldShowEpics = zoomLevel === 'month' || zoomLevel === 'quarter';
  // const itemsToDisplay = shouldShowEpics ? epicsWithDates : tasks; // not used in current rendering path

  const handleCellClick = (e: React.MouseEvent, columnIndex: number, taskIndex: number) => {
    e.stopPropagation(); // Prevent the chart click from firing
    const column = timeColumns[columnIndex];
    onEmptyCellClick(column.date, taskIndex);
  };

  const handleTaskMouseDown = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setDraggedTask({ task, startX: e.clientX });
  };

  // Task row drag and drop handlers
  const handleTaskRowDragStart = (e: React.DragEvent, taskIndex: number) => {
    setDraggedTaskRowIndex(taskIndex);
    e.dataTransfer.effectAllowed = 'move';
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleTaskRowDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }

    // Perform the reorder
    if (draggedTaskRowIndex !== null && dropTargetRowIndex !== null &&
        draggedTaskRowIndex !== dropTargetRowIndex && onTaskReorder) {
      onTaskReorder(draggedTaskRowIndex, dropTargetRowIndex);
    }

    setDraggedTaskRowIndex(null);
    setDropTargetRowIndex(null);
  };

  const handleTaskRowDragOver = (e: React.DragEvent, taskIndex: number) => {
    e.preventDefault();
    if (draggedTaskRowIndex === null) return;
    setDropTargetRowIndex(taskIndex);
  };

  const handleTaskRowDragLeave = () => {
    // Only clear if we're actually leaving the row
    setDropTargetRowIndex(null);
  };

  useEffect(() => {
    const handleMouseMove = (_e: MouseEvent) => {
      if (draggedTask) {
        // Calculate new position based on mouse movement
        // This is a simplified version - you'd need more sophisticated logic
      }
    };

    const handleMouseUp = () => {
      if (draggedTask) {
        setDraggedTask(null);
      }
    };

    if (draggedTask) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedTask]);

  // Group months by quarter for header
  // (unused) quarters grouping retained in case needed later
  // const quarters = [
  //   { name: 'Q1', months: timeColumns.slice(0, Math.ceil(timeColumns.length / 4)) },
  //   { name: 'Q2', months: timeColumns.slice(Math.ceil(timeColumns.length / 4), Math.ceil(timeColumns.length / 2)) },
  //   { name: 'Q3', months: timeColumns.slice(Math.ceil(timeColumns.length / 2), Math.ceil(timeColumns.length * 3 / 4)) },
  //   { name: 'Q4', months: timeColumns.slice(Math.ceil(timeColumns.length * 3 / 4)) }
  // ].filter(q => q.months.length > 0);

  // Handle milestone mouse down
  const handleMilestoneMouseDown = (e: React.MouseEvent, milestone: Milestone) => {
    e.stopPropagation();
    const position = getMilestonePosition(milestone.date);
    if (position !== null) {
      setDraggedMilestone({
        milestone,
        startX: e.clientX,
        originalPosition: position
      });
    }
  };

  // Handle mouse move over chart for milestone preview and drag
  const handleChartMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!chartRef.current) return;

    const tableRect = chartRef.current.querySelector('table')?.getBoundingClientRect();
    if (!tableRect) return;

    // Calculate position relative to the table
    const x = e.clientX - tableRect.left;
    const tableWidth = tableRect.width;

    // Get the first row's cell to determine column start position
    const firstCell = chartRef.current.querySelector('thead th:first-child');
    if (!firstCell) return;

    const firstCellWidth = firstCell.getBoundingClientRect().width;

    // Adjust x to account for the first column (task names)
    const chartX = x - firstCellWidth;
    if (chartX < 0) {
      if (!draggedMilestone) {
        setMilestonePreviewPosition(null);
      }
      return;
    }

    const chartWidth = tableWidth - firstCellWidth;
    const position = (chartX / chartWidth) * 100;

    // Handle milestone dragging
    if (draggedMilestone) {
      if (position >= 0 && position <= 100) {
        setMilestonePreviewPosition(position);
      }
      return;
    }

    // Only show preview if within valid range and not dragging
    if (position >= 0 && position <= 100) {
      setMilestonePreviewPosition(position);
    } else {
      setMilestonePreviewPosition(null);
    }
  };

  // Handle mouse leave from chart
  const handleChartMouseLeave = () => {
    if (!draggedMilestone) {
      setMilestonePreviewPosition(null);
    }
  };

  // Handle mouse up for milestone drag
  const handleChartMouseUp = () => {
    if (draggedMilestone && milestonePreviewPosition !== null) {
      // Calculate the new date based on the preview position
      const columnIndex = Math.floor((milestonePreviewPosition / 100) * timeColumns.length);
      if (columnIndex >= 0 && columnIndex < timeColumns.length) {
        const newDate = timeColumns[columnIndex].date;
        const dateStr = formatDate(newDate);

        // Update the milestone with the new date
        const updatedMilestone = {
          ...draggedMilestone.milestone,
          date: dateStr
        };

        // Save directly without opening modal
        onMilestoneDragUpdate(updatedMilestone);
      }

      setDraggedMilestone(null);
      setMilestonePreviewPosition(null);
    }
  };

  // Handle chart click to create milestone
  const handleChartClick = (_e: React.MouseEvent<HTMLDivElement>) => {
    // Don't create milestone if we just finished dragging
    if (draggedMilestone) {
      return;
    }

    // Only create milestone if clicking with preview line visible
    if (!chartRef.current || milestonePreviewPosition === null) return;

    // Calculate which date was clicked based on preview position
    const columnIndex = Math.floor((milestonePreviewPosition / 100) * timeColumns.length);
    if (columnIndex >= 0 && columnIndex < timeColumns.length) {
      const clickedDate = timeColumns[columnIndex].date;
      const dateStr = formatDate(clickedDate);
      onMilestoneCreate(dateStr);
    }
  };

  // Add global mouse up handler for milestone dragging
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (draggedMilestone && milestonePreviewPosition !== null) {
        // Calculate the new date based on the preview position
        const columnIndex = Math.floor((milestonePreviewPosition / 100) * timeColumns.length);
        if (columnIndex >= 0 && columnIndex < timeColumns.length) {
          const newDate = timeColumns[columnIndex].date;
          const dateStr = formatDate(newDate);

          // Update the milestone with the new date
          const updatedMilestone = {
            ...draggedMilestone.milestone,
            date: dateStr
          };

          // Save directly without opening modal
          onMilestoneDragUpdate(updatedMilestone);
        }
      }

      setDraggedMilestone(null);
      setMilestonePreviewPosition(null);
    };

    if (draggedMilestone) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [draggedMilestone, milestonePreviewPosition, timeColumns, onMilestoneDragUpdate]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-auto bg-gray-50">
      <div
        ref={chartRef}
        className="min-w-max relative"
        onMouseMove={handleChartMouseMove}
        onMouseLeave={handleChartMouseLeave}
        onMouseUp={handleChartMouseUp}
        onClick={handleChartClick}
      >
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-30">
            {/* Milestone Header Row */}
            <tr className="relative h-8">
              <th className="sticky left-0 z-20 bg-white border-2 border-gray-800 w-64">
                {/* Empty cell for task names column */}
              </th>
              <th colSpan={timeColumns.length} className="border-2 border-gray-800 p-0 relative bg-white">
                <div className="relative w-full h-8">
                  {/* Milestone preview line in header */}
                  {milestonePreviewPosition !== null && (
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        left: `${milestonePreviewPosition}%`,
                        top: 0,
                        bottom: 0,
                        zIndex: 30
                      }}
                    >
                      <div className="relative h-full">
                        <div className="absolute w-0.5 h-full bg-gray-400 opacity-50" />
                        {draggedMilestone && (
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Milestones in header */}
                  {milestones.map((milestone) => {
                    const position = getMilestonePosition(milestone.date);
                    if (position === null) return null;
                    const isDragging = draggedMilestone?.milestone.id === milestone.id;
                    return (
                      <div
                        key={milestone.id}
                        className={`absolute top-0 bottom-0 ${isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab hover:opacity-80'} transition-opacity`}
                        style={{
                          left: `${position}%`,
                          zIndex: 31
                        }}
                        onMouseDown={(e) => handleMilestoneMouseDown(e, milestone)}
                        onClick={(e) => {
                          if (!draggedMilestone) {
                            e.stopPropagation();
                            onMilestoneClick(milestone);
                          }
                        }}
                      >
                        <div className="relative h-full flex items-center">
                          <div
                            className="absolute left-1/2 transform -translate-x-1/2 text-white text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap shadow-md"
                            style={{ backgroundColor: milestone.color }}
                          >
                            {milestone.name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </th>
            </tr>
            {/* Year + Month Row (for day view) */}
            {zoomLevel === 'day' && monthGroups.length > 0 && (
              <tr>
                <th className="sticky left-0 z-20 bg-white border-2 border-gray-800 p-3 font-bold text-gray-800 w-64">
                  {/* Empty cell for task names column */}
                </th>
                {monthGroups.map((group, idx) => (
                  <th
                    key={idx}
                    colSpan={group.count}
                    className="bg-blue-100 border-2 border-gray-800 p-3 text-center font-bold text-gray-800 text-base"
                  >
                    {group.monthName} {timeColumns[group.startIndex]?.date.getFullYear()}
                  </th>
                ))}
              </tr>
            )}

            {/* Quarter Row (for week view) */}
            {zoomLevel === 'week' && quarterGroups.length > 0 && (
              <tr>
                <th className="sticky left-0 z-20 bg-white border-2 border-gray-800 p-3 font-bold text-gray-800 w-64">
                  {/* Empty cell for task names column */}
                </th>
                {quarterGroups.map((group, idx) => (
                  <th
                    key={idx}
                    colSpan={group.count}
                    className="bg-gray-200 border-2 border-gray-800 p-3 text-center font-bold text-gray-800"
                  >
                    {group.quarterName}
                  </th>
                ))}
              </tr>
            )}

            {/* Year Row (for month and quarter view) */}
            {(zoomLevel === 'month' || zoomLevel === 'quarter') && (
              <tr>
                <th className="sticky left-0 z-20 bg-white border-2 border-gray-800 p-3 font-bold text-gray-800 w-64">
                  {/* Empty cell for task names column */}
                </th>
                <th
                  colSpan={timeColumns.length}
                  className="bg-gray-200 border-2 border-gray-800 p-3 text-center font-bold text-gray-800"
                >
                  {zoomLevel === 'quarter' ? `Q1 ${new Date().getFullYear()}` : new Date().getFullYear()}
                </th>
              </tr>
            )}

            {/* Day of Week + Day Number Row (for day view) */}
            {zoomLevel === 'day' && (
              <tr>
                <th className="sticky left-0 z-20 bg-white border-2 border-gray-800 p-3 font-bold text-gray-800 w-64">
                  {shouldShowEpics ? 'Epic' : 'Task'}
                </th>
                {timeColumns.map((column: any, idx) => (
                  <th
                    key={idx}
                    className={`border border-gray-300 p-2 text-center text-sm font-semibold min-w-12 ${
                      column.isWeekend ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="text-xs">{column.label}</div>
                      <div className="text-xs">{column.dayOfWeek}</div>
                    </div>
                  </th>
                ))}
              </tr>
            )}

            {/* Week Number Row (for week view) */}
            {zoomLevel === 'week' && (
              <tr>
                <th className="sticky left-0 z-20 bg-white border-2 border-gray-800 p-3 font-bold text-gray-800 w-64">
                  {shouldShowEpics ? 'Epic' : 'Task'}
                </th>
                {timeColumns.map((column, idx) => (
                  <th
                    key={idx}
                    className="bg-gray-100 border border-gray-300 p-2 text-center text-sm font-semibold text-gray-700 min-w-12"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            )}

            {/* Month/Quarter Row (for month and quarter view) */}
            {(zoomLevel === 'month' || zoomLevel === 'quarter') && (
              <tr>
                <th className="sticky left-0 z-20 bg-white border-2 border-gray-800 p-3 font-bold text-gray-800 w-64">
                  {shouldShowEpics ? 'Epic' : 'Task'}
                </th>
                {timeColumns.map((column, idx) => (
                  <th
                    key={idx}
                    className="bg-gray-100 border border-gray-300 p-2 text-center text-sm font-semibold text-gray-700 min-w-12"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {shouldShowEpics ? (
              // Render Epics in Month/Quarter view
              epicsWithDates.map((epic, epicIndex) => {
                const barPosition = epic.startDate && epic.endDate ? calculateBarPosition(epic.startDate, epic.endDate) : null;
                const colorClass = getEpicColor(epic);

                return (
                  <tr key={epic.id} className="hover:bg-gray-50 transition-colors">
                    <td className="sticky left-0 z-10 bg-white border-2 border-gray-300 p-3 font-medium text-gray-800">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-pink-500 rounded flex-shrink-0" />
                          <span className="truncate">{epic.name}</span>
                        </div>
                        {epic.assignee && (
                          <span className="text-xs text-gray-500 ml-6">{epic.assignee}</span>
                        )}
                      </div>
                    </td>
                    <td colSpan={timeColumns.length} className="p-0 relative" style={{ padding: 0 }}>
                      <div className="relative w-full h-16" style={{ display: 'flex' }}>
                        {timeColumns.map((_column, colIdx) => (
                          <div
                            key={colIdx}
                            className="border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors flex-shrink-0"
                            onClick={(e) => handleCellClick(e, colIdx, epicIndex)}
                            style={{ minWidth: '48px', height: '64px', flexGrow: 1 }}
                          />
                        ))}
                        {/* Render epic bar as overlay */}
                        {barPosition && (
                          <div
                            className={`absolute top-1/2 transform -translate-y-1/2 ${colorClass} rounded-lg shadow cursor-pointer transition-all duration-300 hover:shadow-lg`}
                            style={{
                              left: barPosition.left,
                              width: barPosition.width,
                              height: '32px',
                              zIndex: 5
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onEpicClick) {
                                onEpicClick(epic);
                              }
                            }}
                          >
                            {/* Progress indicator */}
                            {epic.progress !== undefined && epic.progress > 0 && (
                              <div
                                className="absolute left-0 top-0 bottom-0 bg-black bg-opacity-20 rounded-l-lg"
                                style={{ width: `${epic.progress}%` }}
                              />
                            )}
                          </div>
                        )}
                        {/* Today marker for first row */}
                        {epicIndex === 0 && todayPosition !== null && (
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              left: `${todayPosition}%`,
                              top: '-100vh',
                              bottom: '-100vh',
                              zIndex: 20
                            }}
                          >
                            <div className="relative h-full">
                              <div className="absolute w-0.5 h-full bg-red-500" />
                              <div className="absolute -top-0 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap">
                                Now
                              </div>
                            </div>
                          </div>
                        )}
                        {/* Milestone preview line for first row */}
                        {epicIndex === 0 && milestonePreviewPosition !== null && (
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              left: `${milestonePreviewPosition}%`,
                              top: '-100vh',
                              bottom: '-100vh',
                              zIndex: 19
                            }}
                          >
                            <div className="relative h-full">
                              <div className="absolute w-0.5 h-full bg-gray-400 opacity-50" />
                            </div>
                          </div>
                        )}
                        {/* Milestones for first row - only vertical lines */}
                        {epicIndex === 0 && milestones.map((milestone) => {
                          const position = getMilestonePosition(milestone.date);
                          if (position === null) return null;
                          const isDragging = draggedMilestone?.milestone.id === milestone.id;
                          return (
                            <div
                              key={milestone.id}
                              className="absolute pointer-events-none"
                              style={{
                                left: `${position}%`,
                                top: '-100vh',
                                bottom: '-100vh',
                                zIndex: 21,
                                opacity: isDragging ? 0.3 : 1
                              }}
                            >
                              <div className="relative h-full">
                                <div
                                  className="absolute w-0.5 h-full"
                                  style={{ backgroundColor: milestone.color }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              // Render Tasks in Day/Week view
              tasks.map((task, taskIndex) => {
                const barPosition = calculateBarPosition(task.startDate, task.endDate);
                const colorClass = getTaskColor(task);
                const isDraggingOver = dropTargetRowIndex === taskIndex;
                const isDragging = draggedTaskRowIndex === taskIndex;

                return (
                  <tr
                    key={task.id}
                    className={`hover:bg-gray-50 transition-colors ${isDraggingOver ? 'border-t-4 border-blue-500' : ''} ${isDragging ? 'opacity-50' : ''}`}
                    draggable={onTaskReorder !== undefined}
                    onDragStart={(e) => handleTaskRowDragStart(e, taskIndex)}
                    onDragEnd={handleTaskRowDragEnd}
                    onDragOver={(e) => handleTaskRowDragOver(e, taskIndex)}
                    onDragLeave={handleTaskRowDragLeave}
                  >
                    <td className="sticky left-0 z-10 bg-white border-2 border-gray-300 p-3 font-medium text-gray-800 cursor-grab active:cursor-grabbing">
                      <div className="flex items-start gap-2">
                        {onTaskReorder && (
                          <div className="flex-shrink-0 text-gray-400 hover:text-gray-600 mt-0.5">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
                            </svg>
                          </div>
                        )}
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 bg-blue-600 rounded flex-shrink-0" />
                            <span className="truncate">{task.process}</span>
                          </div>
                          {task.assignee && (
                            <span className="text-xs text-gray-500 ml-5">{task.assignee}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td colSpan={timeColumns.length} className="p-0 relative" style={{ padding: 0 }}>
                      <div className="relative w-full h-16" style={{ display: 'flex' }}>
                        {timeColumns.map((_column, colIdx) => (
                          <div
                            key={colIdx}
                            className="border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors flex-shrink-0"
                            onClick={(e) => handleCellClick(e, colIdx, taskIndex)}
                            style={{ minWidth: '48px', height: '64px', flexGrow: 1 }}
                          />
                        ))}
                        {/* Render task bar as overlay spanning across days */}
                        {barPosition && (
                          <div
                            className={`absolute top-1/2 transform -translate-y-1/2 ${colorClass} rounded-lg shadow cursor-move transition-all duration-300 hover:shadow-lg`}
                            style={{
                              left: barPosition.left,
                              width: barPosition.width,
                              height: '32px',
                              opacity: draggedTask?.task.id === task.id ? 0.5 : 1,
                              zIndex: 5
                            }}
                            onMouseDown={(e) => handleTaskMouseDown(e, task)}
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskClick(task);
                            }}
                          >
                            {/* Progress indicator */}
                            {task.progress !== undefined && task.progress > 0 && (
                              <div
                                className="absolute left-0 top-0 bottom-0 bg-black bg-opacity-20 rounded-l-lg"
                                style={{ width: `${task.progress}%` }}
                              />
                            )}
                            {/* Critical path indicator */}
                            {showCriticalPath && task.dependencies && task.dependencies.length > 0 && (
                              <div className="absolute inset-0 border-2 border-red-500 rounded-lg" />
                            )}
                          </div>
                        )}
                        {/* Today marker for this row */}
                        {taskIndex === 0 && todayPosition !== null && (
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              left: `${todayPosition}%`,
                              top: '-100vh',
                              bottom: '-100vh',
                              zIndex: 20
                            }}
                          >
                            <div className="relative h-full">
                              <div className="absolute w-0.5 h-full bg-red-500" />
                              <div className="absolute -top-0 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap">
                                Now
                              </div>
                            </div>
                          </div>
                        )}
                        {/* Milestone preview line for first row */}
                        {taskIndex === 0 && milestonePreviewPosition !== null && (
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              left: `${milestonePreviewPosition}%`,
                              top: '-100vh',
                              bottom: '-100vh',
                              zIndex: 19
                            }}
                          >
                            <div className="relative h-full">
                              <div className="absolute w-0.5 h-full bg-gray-400 opacity-50" />
                            </div>
                          </div>
                        )}
                        {/* Milestones for first row - only vertical lines */}
                        {taskIndex === 0 && milestones.map((milestone) => {
                          const position = getMilestonePosition(milestone.date);
                          if (position === null) return null;
                          const isDragging = draggedMilestone?.milestone.id === milestone.id;
                          return (
                            <div
                              key={milestone.id}
                              className="absolute pointer-events-none"
                              style={{
                                left: `${position}%`,
                                top: '-100vh',
                                bottom: '-100vh',
                                zIndex: 21,
                                opacity: isDragging ? 0.3 : 1
                              }}
                            >
                              <div className="relative h-full">
                                <div
                                  className="absolute w-0.5 h-full"
                                  style={{ backgroundColor: milestone.color }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

GanttChartView.displayName = 'GanttChartView';

export default GanttChartView;
