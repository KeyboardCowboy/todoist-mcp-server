/**
 * @fileoverview Update Task tool for Todoist MCP server
 * 
 * This tool allows users to update existing tasks by task_id only.
 * You can modify properties like content (task name), description, due date, and priority.
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TodoistApi } from "@doist/todoist-api-typescript";
import { BaseTool, ToolResponse } from "./BaseTool.js";
import { UpdateTaskArgs } from "../types/index.js";
import { mapPriority } from "../utils/priorityMapper.js";

/**
 * Tool for updating existing tasks in Todoist
 * 
 * This tool is self-contained and handles all aspects of task updates:
 * - Argument validation
 * - Task search by name (case-insensitive)
 * - API interaction for task updates
 * - Response formatting with updated values
 */
export class UpdateTaskTool extends BaseTool<UpdateTaskArgs> {
  readonly definition: Tool = {
    name: "todoist_update_task",
    description: "Update an existing task in Todoist by task_id. You can update content (task name), description, due date, priority, etc. Task ID is required.",
    inputSchema: {
      type: "object",
      properties: {
        task_id: {
          type: "string",
          description: "ID of the task to update (required)"
        },
        content: {
          type: "string",
          description: "New content/title for the task (optional)"
        },
        description: {
          type: "string",
          description: "New description for the task (optional)"
        },
        due_string: {
          type: "string",
          description: "New due date in natural language like 'tomorrow', 'next Monday' (optional)"
        },
        priority: {
          type: "string",
          description: "Task priority: number ('1'-'4') or string (P1-P4) where P1=urgent, P4=normal (optional)"
        },
        project_id: {
          type: "string",
          description: "ID of the project to move the task to (optional)"
        },
        labels: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Array of label names to assign to the task (optional)"
        },
        section_id: {
          type: "string", 
          description: "ID of the section within the project to place the task (optional)"
        },
        parent_id: {
          type: "string",
          description: "ID of the parent task to make this a subtask of (optional)"
        },
        assignee_id: {
          type: "number",
          description: "ID of the user to assign this task to (optional)"
        }
      },
      required: ["task_id"]
    }
  };

  protected validateArgs(args: unknown): args is UpdateTaskArgs {
    // Only accept task_id (required)
    const argsObj = args as Record<string, unknown>;
    return typeof argsObj.task_id === "string" && argsObj.task_id.length > 0;
  }

  /**
   * Executes task update directly with the Todoist API
   * 
   * This method handles the complete task update workflow:
   * 1. Uses the provided task_id to fetch the task
   * 2. Builds update data from provided arguments
   * 3. Updates the task via the Todoist API
   * 4. Returns detailed confirmation with updated values
   * 
   * @param args Validated task update arguments
   * @param client Todoist API client for making requests
   * @returns Promise resolving to update confirmation or error
   */
  protected async execute(args: UpdateTaskArgs, client: TodoistApi): Promise<ToolResponse> {
    const taskId = args.task_id as string;
    let matchingTask: any = undefined;

    try {
      matchingTask = await client.getTask(taskId);
    } catch (e) {
      return {
        content: [{
          type: "text",
          text: `Could not find a task with ID \"${taskId}\"`
        }],
        isError: true,
      };
    }

    // Build update data with provided values
    const updateData: any = {};
    if (args.content) updateData.content = args.content;
    if (args.description) updateData.description = args.description;
    if (args.due_string) updateData.dueString = args.due_string;
    if (args.priority) updateData.priority = mapPriority(args.priority);
    if (args.project_id) updateData.projectId = args.project_id;
    if (args.labels) updateData.labels = args.labels;
    if (args.section_id) updateData.sectionId = args.section_id;
    if (args.parent_id) updateData.parentId = args.parent_id;
    if (args.assignee_id) updateData.assigneeId = args.assignee_id;

    // Update the task via Todoist API
    const updatedTask = await client.updateTask(taskId, updateData);
    
    // Format detailed response showing all updated values including taskID for future reference
    let responseText = `Task "${updatedTask.content}" updated:\nTask ID: ${updatedTask.id}`;
    if (updatedTask.description) responseText += `\nNew Description: ${updatedTask.description}`;
    if (updatedTask.due) responseText += `\nNew Due Date: ${updatedTask.due.string}`;
    if (updatedTask.priority) responseText += `\nNew Priority: ${updatedTask.priority}`;
    if (updatedTask.projectId) responseText += `\nNew Project ID: ${updatedTask.projectId}`;
    if (updatedTask.labels && updatedTask.labels.length > 0) responseText += `\nNew Labels: ${updatedTask.labels.join(', ')}`;
    if (updatedTask.sectionId) responseText += `\nNew Section ID: ${updatedTask.sectionId}`;
    if (updatedTask.parentId) responseText += `\nNew Parent Task ID: ${updatedTask.parentId}`;
    if (updatedTask.assigneeId) responseText += `\nNew Assignee ID: ${updatedTask.assigneeId}`;
    
    return {
      content: [{
        type: "text",
        text: responseText
      }],
      isError: false,
    };
  }
} 
