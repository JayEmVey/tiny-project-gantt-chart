import { Task, Epic, UserStory, Milestone } from '../types';

export interface ProjectData {
  version: string;
  projectName: string;
  createdAt: string;
  lastModified: string;
  epics: Epic[];
  userStories: UserStory[];
  tasks: Task[];
  milestones: Milestone[];
}

/**
 * Saves the current project data to a .tgc file
 */
export const saveProjectToFile = (
  projectName: string,
  epics: Epic[],
  userStories: UserStory[],
  tasks: Task[],
  milestones: Milestone[]
): void => {
  const projectData: ProjectData = {
    version: '1.0.0',
    projectName: projectName || 'Untitled Project',
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    epics,
    userStories,
    tasks,
    milestones
  };

  // Convert to JSON
  const jsonString = JSON.stringify(projectData, null, 2);

  // Create a blob
  const blob = new Blob([jsonString], { type: 'application/json' });

  // Generate filename with format: projectname_YYYYMMDD-HHMM.tgc
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const dateTimeStr = `${year}${month}${day}-${hours}${minutes}`;

  // Clean project name (remove special characters, replace spaces with underscores)
  const cleanProjectName = (projectName || 'project')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();

  const filename = `${cleanProjectName}_${dateTimeStr}.tgc`;

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Opens and loads a .tgc project file
 */
export const openProjectFile = (): Promise<ProjectData> => {
  return new Promise((resolve, reject) => {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.tgc,.json';

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      try {
        const text = await file.text();
        const projectData: ProjectData = JSON.parse(text);

        // Validate the data structure
        if (!projectData.epics || !projectData.userStories || !projectData.tasks) {
          throw new Error('Invalid project file format');
        }

        // Ensure milestones exists (for backward compatibility with older files)
        if (!projectData.milestones) {
          projectData.milestones = [];
        }

        // Update last modified
        projectData.lastModified = new Date().toISOString();

        resolve(projectData);
      } catch (error) {
        reject(new Error('Failed to parse project file: ' + (error as Error).message));
      }
    };

    input.oncancel = () => {
      reject(new Error('File selection cancelled'));
    };

    // Trigger file picker
    input.click();
  });
};

/**
 * Validates project data structure
 */
export const validateProjectData = (data: any): data is ProjectData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.version === 'string' &&
    typeof data.projectName === 'string' &&
    Array.isArray(data.epics) &&
    Array.isArray(data.userStories) &&
    Array.isArray(data.tasks) &&
    Array.isArray(data.milestones)
  );
};
