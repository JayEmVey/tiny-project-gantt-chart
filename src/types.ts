export interface Task {
  id: string
  name: string
  startDate: Date
  endDate: Date
  progress: number
  dependencies?: string[]
}

export interface GanttTask {
  id: number
  process: string
  startDate: string
  endDate: string
}

export interface Month {
  name: string
  quarter: number
  month: number
}

export interface Quarter {
  name: string
  months: string[]
}

export interface BarPosition {
  left: string
  width: string
}
