import { BarPosition, GanttTask } from '../types';

export const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
};

export const formatDate = (date: Date): string => {
  if (!date) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const calculateBarPosition = (startDate: string, endDate: string): BarPosition | null => {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  const startMonth = start.getMonth() + 1;
  const endMonth = end.getMonth() + 1;
  const startDay = start.getDate();
  const endDay = end.getDate();

  const daysInStartMonth = new Date(2025, startMonth, 0).getDate();
  const daysInEndMonth = new Date(2025, endMonth, 0).getDate();

  const startOffset = ((startMonth - 1) + (startDay / daysInStartMonth)) * (100 / 12);
  const endOffset = ((endMonth - 1) + (endDay / daysInEndMonth)) * (100 / 12);

  return {
    left: `${startOffset}%`,
    width: `${endOffset - startOffset}%`
  };
};

export const calculateDayViewBarPosition = (
  taskStartDate: string,
  taskEndDate: string,
  rangeStart: Date,
  rangeEnd: Date,
  cellWidth: number,
  labelWidth: number
): { left: string; width: string } | null => {
  const start = parseDate(taskStartDate);
  const end = parseDate(taskEndDate);

  if (!start || !end) return null;

  // Clamp to visible range
  const clampedStart = new Date(Math.max(start.getTime(), rangeStart.getTime()));
  const clampedEnd = new Date(Math.min(end.getTime(), rangeEnd.getTime()));

  if (clampedEnd < rangeStart || clampedStart > rangeEnd) return null; // outside range

  const leftDays = (clampedStart.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24);
  const rightDays = (clampedEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
  const duration = rightDays - leftDays;

  return {
    left: `calc(${labelWidth}px + ${leftDays * cellWidth}px)`,
    width: `${duration * cellWidth}px`
  };
};

export interface TimelineColumn {
  date: Date;
  day: number;
  monthIndex: number;
  monthName: string;
  year: number;
}

export const generateDayColumns = (startDate: Date, endDate: Date): TimelineColumn[] => {
  const columns: TimelineColumn[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    columns.push({
      date: new Date(current),
      day: current.getDate(),
      monthIndex: current.getMonth(),
      monthName: current.toLocaleString('default', { month: 'short' }),
      year: current.getFullYear()
    });
    current.setDate(current.getDate() + 1);
  }

  return columns;
};

export const exportToCSV = (tasks: GanttTask[]): void => {
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

export const parseCSV = (text: string): GanttTask[] => {
  const lines = text.split('\n');
  
  return lines.slice(1).filter(line => line.trim()).map((line, index) => {
    const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || [];
    return {
      id: index + 1,
      process: values[0] || '',
      startDate: values[1] || '',
      endDate: values[2] || ''
    };
  });
};