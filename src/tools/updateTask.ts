/**
 * @fileoverview Update Task tool for Todoist MCP server
 * 
 * This tool allows users to update existing tasks by searching for them
 * by name and modifying their properties like content, description, due date,
 * and priority.
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
    description: "Update an existing task in Todoist by searching for it by name and then updating it",
    inputSchema: {
      type: "object",
      properties: {
        task_name: {
          type: "string",
          description: "Name/content of the task to search for and update"
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
          description: "Task priority: number ('1'-'4') or string (P1-P4) where P1=urgent, P4=normal (optional)",
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
      required: ["task_name"]
    }
  };

  protected validateArgs(args: unknown): args is UpdateTaskArgs {
    // Basic object validation handled by BaseTool, now just validate required task_name field
    const argsObj = args as Record<string, unknown>;
    return (
      "task_name" in argsObj &&
      typeof argsObj.task_name === "string"
    );
  }

  /**
   * Executes task update directly with the Todoist API
   * 
   * This method handles the complete task update workflow:
   * 1. Searches for the task by name (case-insensitive)
   * 2. Builds update data from provided arguments
   * 3. Updates the task via the Todoist API
   * 4. Returns detailed confirmation with updated values
   * 
   * @param args Validated task update arguments
   * @param client Todoist API client for making requests
   * @returns Promise resolving to update confirmation or error
   */
  protected async execute(args: UpdateTaskArgs, client: TodoistApi): Promise<ToolResponse> {
    // Search for the task by name (case-insensitive)
    const tasks = await client.getTasks();
    const matchingTask = tasks.find(task => 
      task.content.toLowerCase().includes(args.task_name.toLowerCase())
    );

    if (!matchingTask) {
      return {
        content: [{ 
          type: "text", 
          text: `Could not find a task matching "${args.task_name}"` 
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
    const updatedTask = await client.updateTask(matchingTask.id, updateData);
    
    // Format detailed response showing all updated values
    let responseText = `Task "${matchingTask.content}" updated:\nNew Title: ${updatedTask.content}`;
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
