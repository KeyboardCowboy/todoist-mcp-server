/**
 * @fileoverview Delete Task tool for Todoist MCP server
 * 
 * This tool allows users to permanently delete tasks from Todoist by
 * searching for them by name.
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TodoistApi } from "@doist/todoist-api-typescript";
import { BaseTool, ToolResponse } from "./BaseTool.js";
import { DeleteTaskArgs } from "../types/index.js";

/**
 * Tool for permanently deleting tasks from Todoist
 * 
 * This tool is self-contained and handles all aspects of task deletion:
 * - Argument validation
 * - Task search by name (case-insensitive)
 * - API interaction for task deletion
 * - Response formatting
 */
export class DeleteTaskTool extends BaseTool<DeleteTaskArgs> {
  readonly definition: Tool = {
    name: "todoist_delete_task",
    description: "Delete a task from Todoist by searching for it by name",
    inputSchema: {
      type: "object",
      properties: {
        task_name: {
          type: "string",
          description: "Name/content of the task to search for and delete"
        }
      },
      required: ["task_name"]
    }
  };

  protected validateArgs(args: unknown): args is DeleteTaskArgs {
    // Basic object validation handled by BaseTool, now just validate required task_name field
    const argsObj = args as Record<string, unknown>;
    return (
      "task_name" in argsObj &&
      typeof argsObj.task_name === "string"
    );
  }

  /**
   * Executes task deletion directly with the Todoist API
   * 
   * This method handles the complete task deletion workflow:
   * 1. Searches for the task by name (case-insensitive)
   * 2. Permanently deletes the task via the Todoist API
   * 3. Returns confirmation or error message
   * 
   * @param args Validated task deletion arguments
   * @param client Todoist API client for making requests
   * @returns Promise resolving to deletion confirmation or error
   */
  protected async execute(args: DeleteTaskArgs, client: TodoistApi): Promise<ToolResponse> {
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

    // Delete the task permanently
    await client.deleteTask(matchingTask.id);
    
    return {
      content: [{ 
        type: "text", 
        text: `Successfully deleted task: "${matchingTask.content}"` 
      }],
      isError: false,
    };
  }
} 
