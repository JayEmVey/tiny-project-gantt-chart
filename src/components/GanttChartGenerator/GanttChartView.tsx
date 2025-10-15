import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Task, ZoomLevel } from '../../types';

interface GanttChartViewProps {
  tasks: Task[];
  zoomLevel: ZoomLevel;
  onTaskClick: (task: Task) => void;
  onEmptyCellClick: (date: Date, taskIndex?: number) => void;
  onTaskDragInChart: (taskId: number, newStartDate: string, newEndDate: string) => void;
  showCriticalPath: boolean;
}

interface BarPosition {
  left: string;
  width: string;
}

const GanttChartView = forwardRef<HTMLDivElement, GanttChartViewProps>(({
  tasks,
  zoomLevel,
  onTaskClick,
  onEmptyCellClick,
  onTaskDragInChart,
  showCriticalPath
}, scrollRef) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [draggedTask, setDraggedTask] = useState<{ task: Task; startX: number } | null>(null);

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
          label: `${i + 1}`,
          date: weekStart,
          type: 'week',
          month: weekStart.getMonth(),
          monthName: weekStart.toLocaleDateString('en-US', { month: 'short' })
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
        columns.push({
          label: date.getDate().toString(),
          date: date,
          type: 'day',
          month: date.getMonth(),
          monthName: date.toLocaleDateString('en-US', { month: 'short' })
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

  // Calculate bar position for a task
  const calculateBarPosition = (startDate: string, endDate: string): BarPosition | null => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const yearStart = new Date(start.getFullYear(), 0, 1);

    let startIndex = 0;
    let endIndex = 0;

    if (zoomLevel === 'day') {
      startIndex = Math.floor((start.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
      endIndex = Math.floor((end.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
    } else if (zoomLevel === 'week') {
      startIndex = Math.floor((start.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24 * 7));
      endIndex = Math.floor((end.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24 * 7));
    } else if (zoomLevel === 'month') {
      startIndex = start.getMonth();
      endIndex = end.getMonth();
    } else if (zoomLevel === 'quarter') {
      startIndex = Math.floor(start.getMonth() / 3);
      endIndex = Math.floor(end.getMonth() / 3);
    }

    const columnWidth = 100 / timeColumns.length;
    const left = startIndex * columnWidth;
    const width = (endIndex - startIndex + 1) * columnWidth;

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

  const handleCellClick = (columnIndex: number, taskIndex: number) => {
    const column = timeColumns[columnIndex];
    onEmptyCellClick(column.date, taskIndex);
  };

  const handleTaskMouseDown = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setDraggedTask({ task, startX: e.clientX });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
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
  const quarters = [
    { name: 'Q1', months: timeColumns.slice(0, Math.ceil(timeColumns.length / 4)) },
    { name: 'Q2', months: timeColumns.slice(Math.ceil(timeColumns.length / 4), Math.ceil(timeColumns.length / 2)) },
    { name: 'Q3', months: timeColumns.slice(Math.ceil(timeColumns.length / 2), Math.ceil(timeColumns.length * 3 / 4)) },
    { name: 'Q4', months: timeColumns.slice(Math.ceil(timeColumns.length * 3 / 4)) }
  ].filter(q => q.months.length > 0);

  return (
    <div ref={scrollRef} className="flex-1 overflow-auto bg-gray-50">
      <div ref={chartRef} className="min-w-max relative">
        <table className="w-full border-collapse">
          <thead>
            {/* Month Row (for day view) */}
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
                    {group.monthName}
                  </th>
                ))}
              </tr>
            )}

            {/* Quarter Row (only for certain zoom levels) */}
            {(zoomLevel === 'week' || zoomLevel === 'month') && (
              <tr>
                <th className="sticky left-0 z-20 bg-white border-2 border-gray-800 p-3 font-bold text-gray-800 w-64">
                  {/* Empty cell for task names column */}
                </th>
                {quarters.map((quarter, idx) => (
                  <th
                    key={idx}
                    colSpan={quarter.months.length}
                    className="bg-gray-200 border-2 border-gray-800 p-3 text-center font-bold text-gray-800"
                  >
                    {quarter.name}
                  </th>
                ))}
              </tr>
            )}

            {/* Time Period Row */}
            <tr>
              <th className="sticky left-0 z-20 bg-white border-2 border-gray-800 p-3 font-bold text-gray-800 w-64">
                Task
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
          </thead>
          <tbody>
            {tasks.map((task, taskIndex) => {
              const barPosition = calculateBarPosition(task.startDate, task.endDate);
              const colorClass = getTaskColor(task);

              return (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                  <td className="sticky left-0 z-10 bg-white border-2 border-gray-300 p-3 font-medium text-gray-800">
                    <div className="flex flex-col">
                      <span>{task.process}</span>
                      {task.assignee && (
                        <span className="text-xs text-gray-500">{task.assignee}</span>
                      )}
                    </div>
                  </td>
                  <td colSpan={timeColumns.length} className="p-0 relative" style={{ padding: 0 }}>
                    <div className="relative w-full h-16" style={{ display: 'flex' }}>
                      {timeColumns.map((column, colIdx) => (
                        <div
                          key={colIdx}
                          className="border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors flex-shrink-0"
                          onClick={() => handleCellClick(colIdx, taskIndex)}
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
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

GanttChartView.displayName = 'GanttChartView';

export default GanttChartView;
