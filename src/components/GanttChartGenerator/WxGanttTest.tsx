import React, { useRef, useEffect } from 'react';
import { Gantt, Willow } from 'wx-react-gantt';
import 'wx-react-gantt/dist/gantt.css';

/**
 * Minimal test component for wx-react-gantt
 * This uses hardcoded data from the library's readme to verify it works
 */
const WxGanttTest: React.FC = () => {
  const apiRef = useRef<any>(null);

  const tasks = [
    {
      id: 1,
      text: "Project Planning",
      start: new Date(2024, 11, 1), // December 1, 2024
      end: new Date(2024, 11, 15),
      duration: 14,
      progress: 100,
      type: "task" as const,
    },
    {
      id: 2,
      text: "Development Phase",
      start: new Date(2024, 11, 16),
      end: new Date(2025, 0, 15), // January 15, 2025
      duration: 30,
      progress: 60,
      type: "task" as const,
    },
    {
      id: 3,
      text: "Testing",
      start: new Date(2025, 0, 16),
      end: new Date(2025, 0, 31),
      duration: 15,
      progress: 0,
      type: "task" as const,
    },
  ];

  const links = [
    { id: 1, source: 1, target: 2, type: "e2s" as const },
    { id: 2, source: 2, target: 3, type: "e2s" as const }
  ];

  const scales = [
    { unit: "month" as const, step: 1, format: "MMMM yyyy" },
    { unit: "day" as const, step: 1, format: "d" },
  ];

  const columns = [
    { id: "text", header: "Task", width: 250 },
    { id: "start", header: "Start", width: 120 },
    { id: "duration", header: "Duration", width: 80 },
  ];

  const handleInit = (api: any) => {
    console.log('Test Gantt API initialized:', api);
    apiRef.current = api;

    api.on('select-task', (event: any) => {
      console.log('Task selected:', event);
    });
  };

  useEffect(() => {
    console.log('Test component mounted with data:', { tasks, links, scales, columns });
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100 p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-800">wx-react-gantt Test Component</h1>
        <p className="text-gray-600 mt-2">Minimal test to verify the library works correctly</p>
        <div className="mt-2 space-y-1 text-sm text-gray-700">
          <p>✓ {tasks.length} tasks</p>
          <p>✓ {links.length} links</p>
          <p>✓ {scales.length} scales</p>
        </div>
      </div>

      <div className="flex-1 bg-white border-2 border-gray-300 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
        <Willow>
          <Gantt
            tasks={tasks}
            links={links}
            scales={scales}
            columns={columns}
            init={handleInit}
          />
        </Willow>
      </div>
    </div>
  );
};

export default WxGanttTest;
