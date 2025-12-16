export interface TaskDependency {
  taskId: number
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish'
}

export interface LinkedIssue {
  taskId: number
  linkType: 'blocks' | 'is-blocked-by' | 'duplicates' | 'is-duplicated-by' | 'clones' | 'is-cloned-by' | 'relates-to'
}

export interface Epic {
  id: number
  name: string
  assignee?: string
  status?: 'not-started' | 'in-progress' | 'completed' | 'overdue'
  priority?: 'low' | 'medium' | 'high'
  progress?: number // 0-100
  description?: string
  isSelected: boolean
}

export interface UserStory {
  id: number
  epicId: number
  name: string
  assignee?: string
  status?: 'not-started' | 'in-progress' | 'completed' | 'overdue'
  priority?: 'low' | 'medium' | 'high'
  progress?: number // 0-100
  description?: string
  isSelected: boolean
}

export interface Task {
  id: number
  process: string
  startDate: string // DD/MM/YYYY format
  endDate: string   // DD/MM/YYYY format
  description?: string
  assignee?: string
  /**
   * Priority accepts both title-case and lowercase variants for backward compatibility,
   * and will gracefully accept other string values coming from imports.
   */
  priority?:
    | 'Low'
    | 'Medium'
    | 'High'
    | 'Critical'
    | 'low'
    | 'medium'
    | 'high'
    | 'critical'
    | (string & {})
  /**
   * Status accepts both spaced and kebab-case variants, plus 'overdue',
   * and will gracefully accept other string values coming from imports.
   */
  status?:
    | 'Not Started'
    | 'In Progress'
    | 'Completed'
    | 'On Hold'
    | 'not-started'
    | 'in-progress'
    | 'completed'
    | 'overdue'
    | (string & {})
  progress?: number // 0-100 percentage
  dependencies?: number[] // Array of task IDs this task depends on
  /** Optional relations for grouping in lists and views */
  epicId?: number
  userStoryId?: number
  /** Rich dependency model (optional, used by some UIs) */
  dependenciesV2?: TaskDependency[]
  /** Optional linked issue metadata used in TaskModal */
  linkedIssues?: LinkedIssue[]
}

// Alias for backward compatibility
export type GanttTask = Task

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

export type ZoomLevel = 'day' | 'week' | 'month' | 'quarter'

export type ViewType = 'task' | 'user-story' | 'epic'

// Zoom scale factor (0.25x to 3.0x)
export type ZoomScale = number

export interface Dependency {
  fromTaskId: number
  toTaskId: number
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish'
}

export interface Milestone {
  id: number
  name: string
  date: string // DD/MM/YYYY format
  color: string // Hex color code or Tailwind class
}
