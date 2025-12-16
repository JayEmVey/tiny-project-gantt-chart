import { Task } from '../types';

export interface CriticalPathNode {
  id: number;
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  slack: number;
  isCritical: boolean;
}

/**
 * Calculates the critical path for a set of tasks using the Critical Path Method (CPM)
 * Returns a map of task IDs to their critical path analysis
 */
export function calculateCriticalPath(tasks: Task[]): Map<number, CriticalPathNode> {
  const taskMap = new Map<number, Task>();
  const nodeMap = new Map<number, CriticalPathNode>();

  // Build task map
  tasks.forEach(task => {
    taskMap.set(task.id, task);
  });

  // Calculate task duration in days
  const getTaskDuration = (task: Task): number => {
    const [startDay, startMonth, startYear] = task.startDate.split('/').map(Number);
    const [endDay, endMonth, endYear] = task.endDate.split('/').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Initialize nodes
  tasks.forEach(task => {
    nodeMap.set(task.id, {
      id: task.id,
      earlyStart: 0,
      earlyFinish: 0,
      lateStart: 0,
      lateFinish: 0,
      slack: 0,
      isCritical: false
    });
  });

  // Forward pass: Calculate Early Start (ES) and Early Finish (EF)
  const calculateForwardPass = () => {
    const visited = new Set<number>();
    const queue: number[] = [];

    // Find tasks with no dependencies (start tasks)
    tasks.forEach(task => {
      if (!task.dependencies || task.dependencies.length === 0) {
        queue.push(task.id);
      }
    });

    while (queue.length > 0) {
      const taskId = queue.shift()!;
      if (visited.has(taskId)) continue;

      const task = taskMap.get(taskId);
      const node = nodeMap.get(taskId);
      if (!task || !node) continue;

      // Calculate ES as max EF of all predecessors
      let maxPredecessorEF = 0;
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          const depNode = nodeMap.get(depId);
          if (depNode) {
            maxPredecessorEF = Math.max(maxPredecessorEF, depNode.earlyFinish);
          }
        });
      }

      node.earlyStart = maxPredecessorEF;
      node.earlyFinish = node.earlyStart + getTaskDuration(task);

      visited.add(taskId);

      // Add successor tasks to queue
      tasks.forEach(t => {
        if (t.dependencies && t.dependencies.includes(taskId) && !visited.has(t.id)) {
          // Check if all dependencies of this task have been processed
          const allDepsProcessed = t.dependencies.every(depId => visited.has(depId));
          if (allDepsProcessed) {
            queue.push(t.id);
          }
        }
      });
    }
  };

  // Backward pass: Calculate Late Start (LS) and Late Finish (LF)
  const calculateBackwardPass = () => {
    // Find the maximum EF (project completion time)
    let projectEndTime = 0;
    nodeMap.forEach(node => {
      projectEndTime = Math.max(projectEndTime, node.earlyFinish);
    });

    // Initialize LF for end tasks
    nodeMap.forEach((node, taskId) => {
      const task = taskMap.get(taskId);
      if (!task) return;

      // Check if this is an end task (no other tasks depend on it)
      const isEndTask = !tasks.some(t => t.dependencies && t.dependencies.includes(taskId));
      if (isEndTask) {
        node.lateFinish = node.earlyFinish;
      } else {
        node.lateFinish = projectEndTime;
      }
    });

    const visited = new Set<number>();
    const queue: number[] = [];

    // Find end tasks (tasks with no successors)
    tasks.forEach(task => {
      const hasSuccessors = tasks.some(t => t.dependencies && t.dependencies.includes(task.id));
      if (!hasSuccessors) {
        queue.push(task.id);
      }
    });

    while (queue.length > 0) {
      const taskId = queue.shift()!;
      if (visited.has(taskId)) continue;

      const task = taskMap.get(taskId);
      const node = nodeMap.get(taskId);
      if (!task || !node) continue;

      // Find all successors
      const successors = tasks.filter(t => t.dependencies && t.dependencies.includes(taskId));

      // Calculate LF as min LS of all successors
      if (successors.length > 0) {
        let minSuccessorLS = Infinity;
        successors.forEach(successor => {
          const successorNode = nodeMap.get(successor.id);
          if (successorNode) {
            minSuccessorLS = Math.min(minSuccessorLS, successorNode.lateStart);
          }
        });
        if (minSuccessorLS !== Infinity) {
          node.lateFinish = minSuccessorLS;
        }
      }

      node.lateStart = node.lateFinish - getTaskDuration(task);

      visited.add(taskId);

      // Add predecessor tasks to queue
      if (task.dependencies) {
        task.dependencies.forEach(depId => {
          if (!visited.has(depId)) {
            // Check if all successors of this dependency have been processed
            const depTask = taskMap.get(depId);
            if (depTask) {
              const allSuccessorsProcessed = tasks
                .filter(t => t.dependencies && t.dependencies.includes(depId))
                .every(t => visited.has(t.id));
              if (allSuccessorsProcessed) {
                queue.push(depId);
              }
            }
          }
        });
      }
    }
  };

  // Calculate slack and identify critical tasks
  const calculateSlack = () => {
    nodeMap.forEach(node => {
      node.slack = node.lateStart - node.earlyStart;
      // Tasks with slack close to 0 are critical (allowing small tolerance for rounding)
      node.isCritical = Math.abs(node.slack) < 0.5;
    });
  };

  // Execute CPM algorithm
  calculateForwardPass();
  calculateBackwardPass();
  calculateSlack();

  return nodeMap;
}

/**
 * Gets all dependencies for tasks, filtering to only show critical path connections
 * when showCriticalPath is enabled
 */
export function getCriticalDependencies(
  tasks: Task[],
  showCriticalPath: boolean
): Array<{ fromTaskId: number; toTaskId: number; isCritical: boolean }> {
  const dependencies: Array<{ fromTaskId: number; toTaskId: number; isCritical: boolean }> = [];

  if (!showCriticalPath) {
    return dependencies;
  }

  const criticalPathMap = calculateCriticalPath(tasks);

  tasks.forEach(task => {
    if (task.dependencies && task.dependencies.length > 0) {
      task.dependencies.forEach(depId => {
        const fromNode = criticalPathMap.get(depId);
        const toNode = criticalPathMap.get(task.id);

        // A dependency is critical if both tasks are on the critical path
        const isCritical = !!(fromNode?.isCritical && toNode?.isCritical);

        dependencies.push({
          fromTaskId: depId,
          toTaskId: task.id,
          isCritical
        });
      });
    }
  });

  return dependencies;
}
