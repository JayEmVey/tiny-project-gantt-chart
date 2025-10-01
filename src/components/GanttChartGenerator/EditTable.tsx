import React from 'react';
import { Trash2 } from 'lucide-react';
import { GanttTask } from '../../types';

interface EditTableProps {
  tasks: GanttTask[];
  onUpdateTask: (id: number, field: keyof GanttTask, value: string | number) => void;
  onDeleteTask: (id: number) => void;
}

const EditTable: React.FC<EditTableProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask
}) => {
  return (
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
                    onClick={() => onDeleteTask(task.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
                <td className="border border-pink-300 p-3">
                  <input
                    type="text"
                    value={task.process}
                    onChange={(e) => onUpdateTask(task.id, 'process', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </td>
                <td className="border border-pink-300 p-3">
                  <input
                    type="date"
                    value={task.startDate}
                    onChange={(e) => onUpdateTask(task.id, 'startDate', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </td>
                <td className="border border-pink-300 p-3">
                  <input
                    type="date"
                    value={task.endDate}
                    onChange={(e) => onUpdateTask(task.id, 'endDate', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EditTable;