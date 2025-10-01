import React, { useState, useRef } from 'react';
import { Calendar, Download, Plus, Trash2, Upload } from 'lucide-react';

const GanttChartGenerator = () => {
  const [tasks, setTasks] = useState([
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

  const [currentPage, setCurrentPage] = useState('chart'); // 'edit' or 'chart'
  const fileInputRef = useRef(null);

  const months = [
    { name: 'Jan', quarter: 1, month: 1 },
    { name: 'Feb', quarter: 1, month: 2 },
    { name: 'Mar', quarter: 1, month: 3 },
    { name: 'Apr', quarter: 2, month: 4 },
    { name: 'May', quarter: 2, month: 5 },
    { name: 'Jun', quarter: 2, month: 6 },
    { name: 'Jul', quarter: 3, month: 7 },
    { name: 'Aug', quarter: 3, month: 8 },
    { name: 'Sep', quarter: 3, month: 9 },
    { name: 'Oct', quarter: 3, month: 10 },
    { name: 'Nov', quarter: 3, month: 11 },
    { name: 'Dec', quarter: 3, month: 12 }
  ];

  const quarters = [
    { name: 'QUARTER 1', months: ['Jan', 'Feb', 'Mar'] },
    { name: 'QUARTER 2', months: ['Apr', 'May', 'Jun'] },
    { name: 'QUARTER 3', months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] }
  ];

  const addNewTask = () => {
    const newTask = {
      id: tasks.length + 1,
      process: 'New Process',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
    };
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const updateTask = (id, field, value) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, [field]: value } : task
    ));
  };

  const calculateBarPosition = (startDate, endDate) => {
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

  const exportToCSV = () => {
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

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      
      const newTasks = lines.slice(1).filter(line => line.trim()).map((line, index) => {
        const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g).map(v => v.replace(/^"|"$/g, '').trim());
        return {
          id: index + 1,
          process: values[0] || '',
          startDate: values[1] || '',
          endDate: values[2] || ''
        };
      });
      
      setTasks(newTasks);
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-pink-400" />
            <h1 className="text-3xl font-bold text-gray-800">Project Gantt Chart</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentPage(currentPage === 'edit' ? 'chart' : 'edit')}
              className="flex items-center gap-2 px-6 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition font-medium"
            >
              {currentPage === 'edit' ? 'View Chart' : 'Edit Data'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-pink-300 text-gray-800 rounded hover:bg-pink-400 transition font-medium"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-pink-300 text-gray-800 rounded hover:bg-pink-400 transition font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            {currentPage === 'edit' && (
              <button
                onClick={addNewTask}
                className="flex items-center gap-2 px-4 py-2 bg-pink-400 text-white rounded hover:bg-pink-500 transition font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Process
              </button>
            )}
          </div>
        </div>

        {currentPage === 'edit' ? (
          <div className="border-2 border-pink-300 rounded-lg overflow-hidden">
            <div className="bg-pink-200 p-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Process Data</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-pink-100">
                    <th className="border border-pink-300 p-3 text-left font-bold text-gray-800">Actions</th>
                    <th className="border border-pink-300 p-3 text-left font-bold text-gray-800">Process</th>
                    <th className="border border-pink-300 p-3 text-left font-bold text-gray-800">Start Date</th>
                    <th className="border border-pink-300 p-3 text-left font-bold text-gray-800">End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id} className="hover:bg-pink-50">
                      <td className="border border-pink-300 p-3">
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                      <td className="border border-pink-300 p-3">
                        <input
                          type="text"
                          value={task.process}
                          onChange={(e) => updateTask(task.id, 'process', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                      </td>
                      <td className="border border-pink-300 p-3">
                        <input
                          type="date"
                          value={task.startDate}
                          onChange={(e) => updateTask(task.id, 'startDate', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                      </td>
                      <td className="border border-pink-300 p-3">
                        <input
                          type="date"
                          value={task.endDate}
                          onChange={(e) => updateTask(task.id, 'endDate', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="border-2 border-pink-300 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-pink-300 border-2 border-gray-800 p-4 text-center font-black text-gray-900 text-lg" rowSpan="2">
                      PROCESS
                    </th>
                    {quarters.map((quarter, idx) => (
                      <th
                        key={idx}
                        className="bg-pink-200 border-2 border-gray-800 p-3 text-center font-black text-gray-900 text-base"
                        colSpan={quarter.months.length}
                      >
                        {quarter.name}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {months.map((month, idx) => (
                      <th
                        key={idx}
                        className="bg-pink-200 border border-gray-800 p-2 text-center font-bold text-gray-900 text-sm min-w-16"
                      >
                        {month.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, taskIdx) => (
                    <tr key={task.id}>
                      <td className="bg-white border-2 border-gray-800 p-4 font-medium text-gray-900">
                        {task.process}
                      </td>
                      {months.map((month, monthIdx) => (
                        <td
                          key={monthIdx}
                          className="bg-pink-50 border border-gray-400 p-0 relative"
                          style={{ height: '60px' }}
                        >
                          {monthIdx === 0 && (
                            <div className="absolute inset-0 flex items-center" style={{ left: 0, right: 0 }}>
                              {(() => {
                                const barPosition = calculateBarPosition(task.startDate, task.endDate);
                                if (!barPosition) return null;
                                return (
                                  <div
                                    className="absolute bg-pink-300 rounded"
                                    style={{
                                      left: barPosition.left,
                                      width: barPosition.width,
                                      height: '32px',
                                      top: '50%',
                                      transform: 'translateY(-50%)'
                                    }}
                                  />
                                );
                              })()}
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GanttChartGenerator;