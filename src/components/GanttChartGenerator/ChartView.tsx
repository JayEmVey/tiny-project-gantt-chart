import React from 'react';
import { GanttTask, Month, Quarter } from '../../types';
import { calculateBarPosition } from '../../utils/ganttUtils';

interface ChartViewProps {
  tasks: GanttTask[];
  months: Month[];
  quarters: Quarter[];
}

const ChartView: React.FC<ChartViewProps> = ({
  tasks,
  months,
  quarters
}) => {
  return (
    <div className="border-2 border-pink-300 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-pink-300 border-2 border-gray-800 p-4 text-center font-black text-gray-900 text-lg" rowSpan={2}>
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
            {tasks.map((task) => (
              <tr key={task.id}>
                <td className="bg-white border-2 border-gray-800 p-4 font-medium text-gray-900">
                  {task.process}
                </td>
                {months.map((_month, monthIdx) => (
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
  );
};

export default ChartView;