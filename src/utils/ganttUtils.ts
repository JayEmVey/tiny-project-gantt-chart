import { BarPosition, GanttTask } from '../types';

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