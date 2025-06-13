/**
 * @fileoverview Type definitions for Todoist MCP Server
 * 
 * This file contains all the TypeScript interfaces and types used throughout
 * the Todoist MCP server. These types ensure type safety for tool arguments
 * and provide clear contracts for what data each tool expects.
 */

// Using MCP SDK types directly instead of custom ToolResponse interface

/**
 * Arguments for creating a new task in Todoist
 */
export interface CreateTaskArgs {
  /** The title/content of the task (required) */
  content: string;
  /** Optional detailed description of the task */
  description?: string;
  /** Natural language due date like 'tomorrow', 'next Monday', 'Jan 23' */
  due_string?: string;
  /** Task priority: number (1-4) or string (P1-P4) where P1=urgent, P4=normal */
  priority?: string;
  /** ID of the project to assign the task to */
  project_id?: string;
  /** Array of label names to assign to the task */
  labels?: string[];
  /** ID of the section within the project to place the task */
  section_id?: string;
  /** ID of the parent task to create this as a subtask */
  parent_id?: string;
  /** ID of the user to assign this task to */
  responsible_uid?: string;
  /** Deadline date for the task (YYYY-MM-DD or similar, optional) */
  deadline_date?: string;
}

/**
 * Arguments for retrieving tasks from Todoist with various filters
 */
export interface GetTasksArgs {
  /** Filter tasks by specific project ID */
  project_id?: string;
  /** Filter tasks by section ID (optional) */
  section_id?: string;
  /** Filter tasks by parent task ID (optional) */
  parent_id?: string;
  /** Filter tasks by label (optional) */
  label?: string;
  /** Filter tasks by task IDs (optional) */
  ids?: string[];
  /** Filter tasks using natural language (e.g. 'urgent tasks due today', 'high priority work project', 'overdue tasks') or Todoist syntax (e.g. 'p1 & today', '#Work & @urgent'). Natural language gets converted to proper Todoist filter syntax automatically. */
  content?: string;
  /** Maximum number of tasks to return (default: 10) */
  limit?: number;
}

/**
 * Arguments for retrieving projects from Todoist
 */
export interface GetProjectsArgs {
  /** Maximum number of projects to return (default: 50) */
  limit?: number;
}

/**
 * Arguments for updating an existing task in Todoist
 */
export interface UpdateTaskArgs {
  /** ID of the task to update directly (preferred if known) */
  task_id?: string;
  /** Name/content of the task to search for and update (used if task_id is not provided) */
  task_name?: string;
  /** New content/title for the task */
  content?: string;
  /** New description for the task */
  description?: string;
  /** New due date in natural language like 'tomorrow', 'next Monday' */
  due_string?: string;
  /** New priority level: number (1-4) or string (P1-P4) where P1=urgent, P4=normal */
  priority?: string;
  /** ID of the project to move the task to */
  project_id?: string;
  /** Array of label names to assign to the task */
  labels?: string[];
  /** ID of the section within the project to place the task */
  section_id?: string;
  /** ID of the parent task to make this a subtask of */
  parent_id?: string;
  /** ID of the user to assign this task to */
  responsible_uid?: string;
  /** Deadline date for the task (YYYY-MM-DD or similar, optional) */
  deadline_date?: string;
}

/**
 * Arguments for deleting a task from Todoist
 */
export interface DeleteTaskArgs {
  /** ID of the task to delete (required) */
  task_id: string;
}

/**
 * Arguments for marking a task as complete in Todoist
 */
export interface CompleteTaskArgs {
  /** ID of the task to complete (required) */
  task_id: string;
} 
