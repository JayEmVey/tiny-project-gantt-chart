import { Task, Epic, UserStory, Milestone, ZoomLevel } from '../types';

/**
 * Data adapter for converting between the app's data format
 * and wx-react-gantt's expected format
 */

// wx-react-gantt task type
export interface WxGanttTask {
  id: number;
  text: string;
  start: Date;
  end: Date;
  duration?: number;
  progress?: number;
  type: 'task' | 'summary' | 'milestone';
  parent?: number;
  lazy?: boolean;
  details?: string;
  owner?: string;
  priority?: string;
  status?: string;
}

// wx-react-gantt link type
export interface WxGanttLink {
  id: number | string;
  source: number;
  target: number;
  type: 'e2e' | 's2s' | 'e2s' | 's2e'; // end-to-end, start-to-start, end-to-start, start-to-end
}

// wx-react-gantt scale configuration
export interface WxGanttScale {
  unit: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  step: number;
  format: string;
}

/**
 * Parse DD/MM/YYYY string to Date object
 */
export function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format Date object to DD/MM/YYYY string
 */
export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Calculate duration in days between two dates
 */
function calculateDuration(start: Date, end: Date): number {
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Transform app Task to wx-react-gantt task
 */
export function transformTaskToWxGantt(
  task: Task,
  parentId?: number
): WxGanttTask {
  // Validate and parse dates
  if (!task.startDate || !task.endDate) {
    throw new Error(`Task ${task.id} is missing start or end date`);
  }

  const start = parseDate(task.startDate);
  const end = parseDate(task.endDate);

  // Ensure dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error(`Task ${task.id} has invalid dates: ${task.startDate} - ${task.endDate}`);
  }

  const duration = calculateDuration(start, end);

  const wxTask: WxGanttTask = {
    id: task.id,
    text: task.process || 'Untitled Task',
    start,
    end,
    duration: duration || 1, // Ensure at least 1 day duration
    progress: Math.min(100, Math.max(0, task.progress || 0)), // Clamp between 0-100
    type: 'task',
  };

  // Only add parent if it's defined (avoid undefined)
  if (parentId !== undefined) {
    wxTask.parent = parentId;
  }

  return wxTask;
}

/**
 * Transform Epic to wx-react-gantt summary task
 */
export function transformEpicToWxGantt(
  epic: Epic,
  tasks: Task[]
): WxGanttTask | null {
  // Find all tasks belonging to this epic
  const epicTasks = tasks.filter((t) => t.epicId === epic.id && t.startDate && t.endDate);

  if (epicTasks.length === 0) return null;

  try {
    // Calculate date range from child tasks
    const dates = epicTasks.reduce(
      (acc, task) => {
        const taskStart = parseDate(task.startDate);
        const taskEnd = parseDate(task.endDate);

        if (isNaN(taskStart.getTime()) || isNaN(taskEnd.getTime())) {
          return acc;
        }

        if (!acc.start || taskStart < acc.start) {
          acc.start = taskStart;
        }
        if (!acc.end || taskEnd > acc.end) {
          acc.end = taskEnd;
        }
        return acc;
      },
      { start: null as Date | null, end: null as Date | null }
    );

    if (!dates.start || !dates.end) return null;

    const duration = calculateDuration(dates.start, dates.end);

    return {
      id: epic.id * 10000, // Use high ID to avoid conflicts
      text: epic.name || 'Untitled Epic',
      start: dates.start,
      end: dates.end,
      duration: duration || 1,
      progress: Math.min(100, Math.max(0, epic.progress || 0)),
      type: 'summary',
    };
  } catch (error) {
    console.error(`Error transforming epic ${epic.id}:`, error);
    return null;
  }
}

/**
 * Transform UserStory to wx-react-gantt summary task
 */
export function transformUserStoryToWxGantt(
  userStory: UserStory,
  tasks: Task[],
  epicId?: number
): WxGanttTask | null {
  // Find all tasks belonging to this user story
  const userStoryTasks = tasks.filter((t) => t.userStoryId === userStory.id && t.startDate && t.endDate);

  if (userStoryTasks.length === 0) return null;

  try {
    // Calculate date range from child tasks
    const dates = userStoryTasks.reduce(
      (acc, task) => {
        const taskStart = parseDate(task.startDate);
        const taskEnd = parseDate(task.endDate);

        if (isNaN(taskStart.getTime()) || isNaN(taskEnd.getTime())) {
          return acc;
        }

        if (!acc.start || taskStart < acc.start) {
          acc.start = taskStart;
        }
        if (!acc.end || taskEnd > acc.end) {
          acc.end = taskEnd;
        }
        return acc;
      },
      { start: null as Date | null, end: null as Date | null }
    );

    if (!dates.start || !dates.end) return null;

    const duration = calculateDuration(dates.start, dates.end);

    const wxTask: WxGanttTask = {
      id: userStory.id * 1000, // Use high ID to avoid conflicts
      text: userStory.name || 'Untitled User Story',
      start: dates.start,
      end: dates.end,
      duration: duration || 1,
      progress: Math.min(100, Math.max(0, userStory.progress || 0)),
      type: 'summary',
    };

    // Only add parent if defined
    if (epicId !== undefined) {
      wxTask.parent = epicId * 10000;
    }

    return wxTask;
  } catch (error) {
    console.error(`Error transforming user story ${userStory.id}:`, error);
    return null;
  }
}

/**
 * Transform Milestone to wx-react-gantt milestone
 */
export function transformMilestoneToWxGantt(milestone: Milestone): WxGanttTask | null {
  try {
    const date = parseDate(milestone.date);

    if (isNaN(date.getTime())) {
      console.error(`Invalid milestone date: ${milestone.date}`);
      return null;
    }

    return {
      id: milestone.id * 100000, // Use very high ID to avoid conflicts
      text: milestone.name || 'Untitled Milestone',
      start: date,
      end: date,
      duration: 0,
      type: 'milestone',
      progress: 0,
    };
  } catch (error) {
    console.error(`Error transforming milestone ${milestone.id}:`, error);
    return null;
  }
}

/**
 * Transform task dependencies to wx-react-gantt links
 */
export function transformDependenciesToLinks(tasks: Task[]): WxGanttLink[] {
  const links: WxGanttLink[] = [];
  let linkId = 1;

  tasks.forEach((task) => {
    if (task.dependencies && task.dependencies.length > 0) {
      task.dependencies.forEach((depId) => {
        links.push({
          id: linkId++,
          source: depId,
          target: task.id,
          type: 'e2e', // Default to finish-to-start (end-to-end)
        });
      });
    }

    // Also handle dependenciesV2 if present
    if (task.dependenciesV2 && task.dependenciesV2.length > 0) {
      task.dependenciesV2.forEach((dep) => {
        let linkType: 'e2e' | 's2s' | 'e2s' | 's2e' = 'e2e';

        // Map dependency types
        switch (dep.type) {
          case 'finish-to-start':
            linkType = 'e2s';
            break;
          case 'start-to-start':
            linkType = 's2s';
            break;
          case 'finish-to-finish':
            linkType = 'e2e';
            break;
        }

        links.push({
          id: linkId++,
          source: dep.taskId,
          target: task.id,
          type: linkType,
        });
      });
    }
  });

  return links;
}

/**
 * Get week display info: week number and date range
 */
function getWeekDisplayInfo(date: Date): string {
  // Get ISO week number
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  // Get week start (Monday)
  const weekStart = new Date(date);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
  weekStart.setDate(diff);

  // Get week end (Sunday)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return `W${weekNum}:\n${weekStart.getDate()}-${weekEnd.getDate()}`;
}

/**
 * Get scale configuration based on zoom level
 */
export function getScalesForZoomLevel(zoomLevel: ZoomLevel): WxGanttScale[] {
  switch (zoomLevel) {
    case 'day':
      return [
        { unit: 'month', step: 1, format: 'MMMM yyyy' },
        { unit: 'day', step: 1, format: 'd' },
      ];
    case 'week':
      return [
        { unit: 'month', step: 1, format: 'MMMM yyyy' },
        { unit: 'week', step: 1, format: getWeekDisplayInfo as any },
      ];
    case 'month':
      return [
        { unit: 'year', step: 1, format: 'yyyy' },
        { unit: 'month', step: 1, format: 'MMM' },
      ];
    case 'quarter':
      return [
        { unit: 'year', step: 1, format: 'yyyy' },
        { unit: 'quarter', step: 1, format: '[Q]Q' },
      ];
    default:
      return [
        { unit: 'month', step: 1, format: 'MMMM yyyy' },
        { unit: 'day', step: 1, format: 'd' },
      ];
  }
}

/**
 * Transform all data for wx-react-gantt
 * Returns tasks, links, and scales
 */
export function transformDataForWxGantt(
  tasks: Task[],
  epics: Epic[],
  userStories: UserStory[],
  milestones: Milestone[],
  zoomLevel: ZoomLevel,
  viewType: 'task' | 'user-story' | 'epic',
  showCriticalPath: boolean = false
): {
  tasks: WxGanttTask[];
  links: WxGanttLink[];
  scales: WxGanttScale[];
} {
  const wxTasks: WxGanttTask[] = [];
  const scales = getScalesForZoomLevel(zoomLevel);

  // Filter selected epics and user stories
  const selectedEpics = epics.filter((e) => e.isSelected);
  const selectedUserStories = userStories.filter((us) => us.isSelected);

  if (viewType === 'epic') {
    // Epic view: Show only epics as summary tasks
    selectedEpics.forEach((epic) => {
      const epicTask = transformEpicToWxGantt(epic, tasks);
      if (epicTask) {
        wxTasks.push(epicTask);
      }
    });
  } else if (viewType === 'user-story') {
    // User Story view: Show user stories as summary tasks
    selectedUserStories.forEach((userStory) => {
      const userStoryTask = transformUserStoryToWxGantt(userStory, tasks);
      if (userStoryTask) {
        wxTasks.push(userStoryTask);
      }
    });
  } else {
    // Task view: Simplified - just show all tasks without hierarchy for now
    // This avoids parent/child relationship issues
    tasks.forEach((task) => {
      // Check if task should be visible based on epic/user story selection
      const shouldShow =
        (!task.epicId && !task.userStoryId) || // No parent
        (task.epicId && selectedEpics.find((e) => e.id === task.epicId)) || // Epic is selected
        (task.userStoryId && selectedUserStories.find((us) => us.id === task.userStoryId)); // User story is selected

      if (shouldShow) {
        const wxTask = transformTaskToWxGantt(task); // No parent for now
        wxTasks.push(wxTask);
      }
    });
  }

  // Add milestones
  milestones.forEach((milestone) => {
    const wxMilestone = transformMilestoneToWxGantt(milestone);
    if (wxMilestone) {
      wxTasks.push(wxMilestone);
    }
  });

  // Transform dependencies to links (only if critical path is enabled)
  const links = showCriticalPath ? transformDependenciesToLinks(tasks) : [];

  return {
    tasks: wxTasks,
    links,
    scales,
  };
}

/**
 * Transform wx-react-gantt task back to app Task
 */
export function transformWxGanttToTask(
  wxTask: WxGanttTask,
  originalTask?: Task
): Task {
  return {
    id: wxTask.id,
    process: wxTask.text,
    startDate: formatDate(wxTask.start),
    endDate: formatDate(wxTask.end),
    description: wxTask.details,
    assignee: wxTask.owner,
    priority: wxTask.priority as Task['priority'],
    status: wxTask.status as Task['status'],
    progress: wxTask.progress,
    dependencies: originalTask?.dependencies || [],
    epicId: originalTask?.epicId,
    userStoryId: originalTask?.userStoryId,
  };
}
