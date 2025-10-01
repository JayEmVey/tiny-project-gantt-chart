import React, { useState, useRef } from 'react';
import { MONTHS, QUARTERS } from '../../constants/calendar';
import { useGanttTasks } from '../../hooks/useGanttTasks';
import { exportToCSV } from '../../utils/ganttUtils';
import GanttHeader from './GanttHeader';
import EditTable from './EditTable';
import ChartView from './ChartView';

const GanttChartGenerator: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'chart' | 'edit'>('chart');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    tasks,
    addNewTask,
    deleteTask,
    updateTask,
    importTasksFromCSV
  } = useGanttTasks();

  const handleTogglePage = () => {
    setCurrentPage(currentPage === 'edit' ? 'chart' : 'edit');
  };

  const handleExportCSV = () => {
    exportToCSV(tasks);
  };

  const handleImportCSV = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        importTasksFromCSV(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <GanttHeader
          currentPage={currentPage}
          onTogglePage={handleTogglePage}
          onImportCSV={handleImportCSV}
          onExportCSV={handleExportCSV}
          onAddTask={addNewTask}
        />

        {currentPage === 'edit' ? (
          <EditTable
            tasks={tasks}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        ) : (
          <ChartView
            tasks={tasks}
            months={MONTHS}
            quarters={QUARTERS}
          />
        )}
      </div>
    </div>
  );
};

export default GanttChartGenerator;