import { useState } from 'react'
import GanttChart from './components/GanttChart'
import './App.css'

interface Task {
  id: string
  name: string
  startDate: Date
  endDate: Date
  progress: number
  dependencies?: string[]
}

const sampleTasks: Task[] = [
  {
    id: '1',
    name: 'Project Planning',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-15'),
    progress: 100
  },
  {
    id: '2',
    name: 'Design Phase',
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-02-05'),
    progress: 75,
    dependencies: ['1']
  },
  {
    id: '3',
    name: 'Development',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-03-15'),
    progress: 40,
    dependencies: ['2']
  },
  {
    id: '4',
    name: 'Testing',
    startDate: new Date('2024-03-10'),
    endDate: new Date('2024-03-25'),
    progress: 0,
    dependencies: ['3']
  }
]

function App() {
  const [tasks] = useState<Task[]>(sampleTasks)

  return (
    <div className="app">
      <header>
        <h1>Tiny Project Gantt Chart</h1>
        <p>A lite version of project timeline management</p>
      </header>
      <main>
        <GanttChart tasks={tasks} />
      </main>
    </div>
  )
}

export default App
