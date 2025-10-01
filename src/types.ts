export interface Task {
  id: number
  process: string
  startDate: string // DD/MM/YYYY format
  endDate: string   // DD/MM/YYYY format
}

export interface DragState {
  draggingTask: number | null
  dragStartX: number
  dragType: 'move' | 'resize-left' | 'resize-right' | null
  dragPreview: { startDate: string; endDate: string } | null
  originalTaskState: Task | null
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
