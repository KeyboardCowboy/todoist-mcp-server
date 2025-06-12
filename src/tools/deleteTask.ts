/**
 * @fileoverview Delete Task tool for Todoist MCP server
 * 
 * This tool allows users to permanently delete tasks from Todoist by
 * providing the task ID.
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
 * - API interaction for task deletion by ID
 * - Response formatting
 */
export class DeleteTaskTool extends BaseTool<DeleteTaskArgs> {
  readonly definition: Tool = {
    name: "todoist_delete_task",
    description: "Delete a task from Todoist by task ID",
    inputSchema: {
      type: "object",
      properties: {
        task_id: {
          type: "string",
          description: "ID of the task to delete"
        }
      },
      required: ["task_id"]
    }
  };

  protected validateArgs(args: unknown): args is DeleteTaskArgs {
    // Basic object validation handled by BaseTool, now just validate required task_id field
    const argsObj = args as Record<string, unknown>;
    return (
      "task_id" in argsObj &&
      typeof argsObj.task_id === "string"
    );
  }

  /**
   * Executes task deletion directly with the Todoist API
   * 
   * This method handles the complete task deletion workflow:
   * 1. Deletes the task by ID via the Todoist API
   * 2. Returns confirmation or error message
   * 
   * @param args Validated task deletion arguments
   * @param client Todoist API client for making requests
   * @returns Promise resolving to deletion confirmation or error
   */
  protected async execute(args: DeleteTaskArgs, client: TodoistApi): Promise<ToolResponse> {
    return await client.deleteTask(args.task_id)
      .then(() => ({
        content: [{
          type: "text" as const,
          text: `Successfully deleted task with ID: "${args.task_id}"`
        }],
        isError: false,
      }))
      .catch((error: Error) => ({
        content: [{
          type: "text" as const,
          text: `Failed to delete task with ID: "${args.task_id}". ${error.message}`
        }],
        isError: true,
      }));
  }
} 
