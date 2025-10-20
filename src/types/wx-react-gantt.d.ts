/**
 * Type definitions for wx-react-gantt
 * This library doesn't have official TypeScript definitions
 */

declare module 'wx-react-gantt' {
  import { ComponentType, ReactNode } from 'react';

  export interface GanttTask {
    id: number | string;
    text: string;
    start: Date;
    end: Date;
    duration?: number;
    progress?: number;
    type?: 'task' | 'summary' | 'milestone';
    parent?: number | string;
    lazy?: boolean;
    [key: string]: any;
  }

  export interface GanttLink {
    id: number | string;
    source: number | string;
    target: number | string;
    type?: 'e2e' | 's2s' | 'e2s' | 's2e';
  }

  export interface GanttScale {
    unit: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
    step: number;
    format: string;
  }

  export interface GanttColumn {
    id: string;
    header: string;
    width?: number;
    flexgrow?: number;
    align?: 'left' | 'center' | 'right';
    template?: (task: GanttTask) => string;
  }

  export interface GanttAPI {
    on(event: string, handler: (event: any) => void): void;
    off(event: string, handler: (event: any) => void): void;
    getState(): any;
    setState(state: any): void;
    exec(action: string, params?: any): void;
  }

  export interface GanttProps {
    tasks?: GanttTask[];
    links?: GanttLink[];
    scales?: GanttScale[];
    columns?: GanttColumn[];
    init?: (api: GanttAPI) => void;
    zoom?: boolean;
    readonly?: boolean;
    cellWidth?: number;
    cellHeight?: number;
    [key: string]: any;
  }

  export interface WillowProps {
    children: ReactNode;
  }

  export const Gantt: ComponentType<GanttProps>;
  export const Willow: ComponentType<WillowProps>;
  export const WillowDark: ComponentType<WillowProps>;
}
