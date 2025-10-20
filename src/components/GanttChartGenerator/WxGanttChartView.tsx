import React, { useEffect, useRef, useState } from 'react';
import { Gantt, Willow } from 'wx-react-gantt';
import 'wx-react-gantt/dist/gantt.css';
import './WxGanttCustom.css';
import { Task, Epic, UserStory, Milestone, ZoomLevel, ViewType } from '../../types';
import {
  transformDataForWxGantt,
  transformWxGanttToTask,
  WxGanttTask,
  WxGanttLink,
} from '../../utils/wxGanttAdapter';

interface WxGanttChartViewProps {
  tasks: Task[];
  epics: Epic[];
  userStories: UserStory[];
  milestones: Milestone[];
  zoomLevel: ZoomLevel;
  viewType: ViewType;
  onTaskClick?: (task: Task) => void;
  onTaskUpdate?: (task: Task) => void;
  onEpicClick?: (epic: Epic) => void;
  showCriticalPath?: boolean;
}

/**
 * WxGanttChartView - Wrapper component for wx-react-gantt library
 *
 * This component adapts the wx-react-gantt Gantt chart to work with
 * the application's data model and UI patterns.
 */
const WxGanttChartView: React.FC<WxGanttChartViewProps> = ({
  tasks,
  epics,
  userStories,
  milestones,
  zoomLevel,
  viewType,
  onTaskClick,
  onTaskUpdate,
  onEpicClick,
  // showCriticalPath is currently not supported by wx-react-gantt
  // We may need to implement custom styling for critical path tasks later
}) => {
  const apiRef = useRef<any>(null);
  const [ganttData, setGanttData] = useState<{
    tasks: WxGanttTask[];
    links: WxGanttLink[];
    scales: any[];
  } | null>(null);

  // Transform data whenever inputs change
  useEffect(() => {
    try {
      const transformed = transformDataForWxGantt(
        tasks,
        epics,
        userStories,
        milestones,
        zoomLevel,
        viewType
      );
      console.log('Transformed Gantt Data:', transformed);
      setGanttData(transformed);
    } catch (error) {
      console.error('Error transforming data for wx-react-gantt:', error);
      setGanttData(null);
    }
  }, [tasks, epics, userStories, milestones, zoomLevel, viewType]);

  // Initialize API reference
  const handleInit = (api: any) => {
    console.log('wx-react-gantt API initialized:', api);
    apiRef.current = api;

    // Listen to task events
    api.on('update-task', (event: any) => {
      const { id, task: updatedWxTask } = event;

      // Find the original task
      const originalTask = tasks.find((t) => t.id === id);
      if (originalTask && onTaskUpdate) {
        // Convert back to app format
        const updatedTask = transformWxGanttToTask(updatedWxTask, originalTask);
        onTaskUpdate(updatedTask);
      }
    });

    api.on('select-task', (event: any) => {
      const { id } = event;

      // Check if it's a task (not epic or user story based on ID)
      if (id < 1000) {
        const task = tasks.find((t) => t.id === id);
        if (task && onTaskClick) {
          onTaskClick(task);
        }
      } else if (id >= 10000) {
        // Epic (ID * 10000)
        const epicId = Math.floor(id / 10000);
        const epic = epics.find((e) => e.id === epicId);
        if (epic && onEpicClick) {
          onEpicClick(epic);
        }
      }
    });

    api.on('add-link', (event: any) => {
      console.log('Link added:', event);
      // Handle new dependency creation if needed
    });

    api.on('delete-link', (event: any) => {
      console.log('Link deleted:', event);
      // Handle dependency deletion if needed
    });
  };

  // Configuration for the Gantt chart
  const columns = [
    {
      id: 'text',
      header: viewType === 'epic' ? 'Epic' : viewType === 'user-story' ? 'User Story' : 'Task',
      width: 250,
    },
    {
      id: 'start',
      header: 'Start Date',
      width: 120,
    },
    {
      id: 'duration',
      header: 'Duration',
      width: 80,
    },
  ];

  // Show loading state while data is being prepared
  if (!ganttData) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Gantt chart...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no tasks
  if (ganttData.tasks.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-2">No tasks to display</p>
          <p className="text-gray-500 text-sm">Add tasks to see them in the Gantt chart</p>
        </div>
      </div>
    );
  }

  // Log the actual data being passed to Gantt
  console.log('WxGanttChartView rendering with:', {
    tasksCount: ganttData.tasks.length,
    linksCount: ganttData.links.length,
    scalesCount: ganttData.scales.length,
    tasks: ganttData.tasks,
    links: ganttData.links,
    scales: ganttData.scales,
  });

  return (
    <div className="gantt-container" style={{ width: '100%', height: '100%' }}>
      <Willow>
        <Gantt
          tasks={ganttData.tasks}
          links={ganttData.links}
          scales={ganttData.scales}
          init={handleInit}
        />
      </Willow>
    </div>
  );
};

export default WxGanttChartView;
