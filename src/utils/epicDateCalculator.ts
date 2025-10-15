import { Task } from '../types';

/**
 * Parses a date string in DD/MM/YYYY format to a Date object
 */
const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Formats a Date object to DD/MM/YYYY format
 */
const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Calculates the start and end dates for an Epic based on its related tasks
 * The start date is the earliest start date of any task in the epic
 * The end date is the latest end date of any task in the epic
 *
 * @param epicId - The ID of the Epic
 * @param tasks - Array of all tasks
 * @returns An object with startDate and endDate in DD/MM/YYYY format, or null if no tasks
 */
export const calculateEpicDates = (
  epicId: number,
  tasks: Task[]
): { startDate: string; endDate: string } | null => {
  // Filter tasks that belong to this epic
  const epicTasks = tasks.filter(task => task.epicId === epicId);

  // If no tasks, return null
  if (epicTasks.length === 0) {
    return null;
  }

  // Find the earliest start date
  let earliestStart: Date | null = null;
  let latestEnd: Date | null = null;

  epicTasks.forEach(task => {
    const startDate = parseDate(task.startDate);
    const endDate = parseDate(task.endDate);

    if (!earliestStart || startDate < earliestStart) {
      earliestStart = startDate;
    }

    if (!latestEnd || endDate > latestEnd) {
      latestEnd = endDate;
    }
  });

  if (!earliestStart || !latestEnd) {
    return null;
  }

  return {
    startDate: formatDate(earliestStart),
    endDate: formatDate(latestEnd)
  };
};

/**
 * Calculates the total duration in days for an Epic based on its date range
 *
 * @param startDate - Start date in DD/MM/YYYY format
 * @param endDate - End date in DD/MM/YYYY format
 * @returns Number of days between start and end dates (inclusive)
 */
export const calculateEpicDuration = (startDate: string, endDate: string): number => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to make it inclusive

  return diffDays;
};

/**
 * Gets Epic dates and duration information
 *
 * @param epicId - The ID of the Epic
 * @param tasks - Array of all tasks
 * @returns An object with startDate, endDate, and duration, or null if no tasks
 */
export const getEpicDateInfo = (
  epicId: number,
  tasks: Task[]
): { startDate: string; endDate: string; duration: number } | null => {
  const dates = calculateEpicDates(epicId, tasks);

  if (!dates) {
    return null;
  }

  const duration = calculateEpicDuration(dates.startDate, dates.endDate);

  return {
    ...dates,
    duration
  };
};
