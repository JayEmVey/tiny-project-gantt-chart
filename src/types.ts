export interface Task {
  id: string
  name: string
  startDate: Date
  endDate: Date
  progress: number
  dependencies?: string[]
}
