/**
 * Utility to parse and load assignee list from AssigneeList.md
 */

// Hardcoded assignee list (parsed from AssigneeList.md)
// In a real application, you might want to load this dynamically
export const ASSIGNEE_LIST = [
  'Giang Nguyen',
  'Phong Tran',
  'Hien Nguyen',
  'Minh Tran',
  'Thanh Phan',
  'Nhu Nguyen',
  'Thuan Tran',
  'Hieu Le'
];

/**
 * Gets the list of available assignees
 */
export const getAssigneeList = (): string[] => {
  return ASSIGNEE_LIST;
};

/**
 * Parses assignee list from markdown content
 * Each line is treated as an assignee name
 */
export const parseAssigneeList = (content: string): string[] => {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'));
};
