import { useMemo } from 'react'
import './GanttChart.css'

interface Task {
  id: string
  name: string
  startDate: Date
  endDate: Date
  progress: number
  dependencies?: string[]
}

interface GanttChartProps {
  tasks: Task[]
}

const GanttChart = ({ tasks }: GanttChartProps) => {
  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (tasks.length === 0) {
      return { minDate: new Date(), maxDate: new Date(), totalDays: 0 }
    }

    const dates = tasks.flatMap(task => [task.startDate, task.endDate])
    const min = new Date(Math.min(...dates.map(d => d.getTime())))
    const max = new Date(Math.max(...dates.map(d => d.getTime())))
    const days = Math.ceil((max.getTime() - min.getTime()) / (1000 * 60 * 60 * 24)) + 1

    return { minDate: min, maxDate: max, totalDays: days }
  }, [tasks])

  const getTaskPosition = (task: Task) => {
    const startOffset = Math.floor((task.startDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
    const duration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (tasks.length === 0) {
    return <div className="gantt-chart-empty">No tasks to display</div>
  }

  return (
    <div className="gantt-chart">
      <div className="gantt-header">
        <div className="gantt-header-left">Task</div>
        <div className="gantt-header-right">
          <div className="gantt-timeline-header">
            <span>{formatDate(minDate)}</span>
            <span>{formatDate(maxDate)}</span>
          </div>
        </div>
      </div>
      
      <div className="gantt-body">
        {tasks.map((task) => {
          const position = getTaskPosition(task)
          
          return (
            <div key={task.id} className="gantt-row">
              <div className="gantt-task-name">
                {task.name}
              </div>
              <div className="gantt-task-timeline">
                <div 
                  className="gantt-task-bar"
                  style={position}
                >
                  <div 
                    className="gantt-task-progress"
                    style={{ width: `${task.progress}%` }}
                  />
                  <span className="gantt-task-label">
                    {task.progress}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default GanttChart
