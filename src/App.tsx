import { useState } from 'react'
import GanttChartMain from './components/GanttChartGenerator/GanttChartMain'
import WxGanttTest from './components/GanttChartGenerator/WxGanttTest'
import './App.css'

function App() {
  // Add test mode toggle - press "T" key to toggle
  const [testMode, setTestMode] = useState(false);

  // Listen for "T" key press
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
      if (e.key === 't' || e.key === 'T') {
        setTestMode(prev => !prev);
      }
    });
  }

  return (
    <div className="app">
      {testMode ? (
        <div>
          <div className="fixed top-2 right-2 z-50 bg-yellow-400 text-black px-4 py-2 rounded shadow-lg font-bold">
            TEST MODE - Press "T" to return to main app
          </div>
          <WxGanttTest />
        </div>
      ) : (
        <div>
          <div className="fixed bottom-2 right-2 z-50 bg-blue-500 text-white px-3 py-1 rounded shadow text-xs opacity-50 hover:opacity-100 transition-opacity">
            Press "T" for wx-react-gantt test
          </div>
          <GanttChartMain />
        </div>
      )}
    </div>
  )
}

export default App
