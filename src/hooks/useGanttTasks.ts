import { useState } from 'react';
import { GanttTask } from '../types';
import { parseCSV } from '../utils/ganttUtils';

export const useGanttTasks = () => {
  const [tasks, setTasks] = useState<GanttTask[]>([
    {
      id: 1,
      process: 'Planning',
      startDate: '2025-01-01',
      endDate: '2025-02-28',
    },
    {
      id: 2,
      process: 'Wireframing',
      startDate: '2025-03-01',
      endDate: '2025-04-15',
    },
    {
      id: 3,
      process: 'Design Process',
      startDate: '2025-03-15',
      endDate: '2025-05-31',
    },
    {
      id: 4,
      process: 'Front-end development',
      startDate: '2025-06-01',
      endDate: '2025-09-30',
    },
    {
      id: 5,
      process: 'Back-end development',
      startDate: '2025-05-01',
      endDate: '2025-08-31',
    },
    {
      id: 6,
      process: 'Deployment',
      startDate: '2025-10-01',
      endDate: '2025-12-31',
    }
  ]);

  const addNewTask = () => {
    const newTask: GanttTask = {
      id: tasks.length + 1,
      process: 'New Process',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
    };
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task: GanttTask) => task.id !== id));
  };

  const updateTask = (id: number, field: keyof GanttTask, value: string | number) => {
    setTasks(tasks.map((task: GanttTask) => 
      task.id === id ? { ...task, [field]: value } : task
    ));
  };

  const importTasksFromCSV = (text: string) => {
    const newTasks = parseCSV(text);
    setTasks(newTasks);
  };

  return {
    tasks,
    addNewTask,
    deleteTask,
    updateTask,
    importTasksFromCSV,
    setTasks
  };
};