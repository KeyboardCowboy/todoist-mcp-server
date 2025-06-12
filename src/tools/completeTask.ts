/**
 * @fileoverview Complete Task tool for Todoist MCP server
 * 
 * This tool allows users to mark tasks as completed in Todoist by
 * providing the task ID.
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TodoistApi } from "@doist/todoist-api-typescript";
import { BaseTool, ToolResponse } from "./BaseTool.js";
import { CompleteTaskArgs } from "../types/index.js";

/**
 * Tool for marking tasks as completed in Todoist
 * 
 * This tool is self-contained and handles all aspects of task completion:
 * - Argument validation
 * - API interaction for task completion by ID
 * - Response formatting
 */
export class CompleteTaskTool extends BaseTool<CompleteTaskArgs> {
  readonly definition: Tool = {
    name: "todoist_complete_task",
    description: "Mark a task as complete by task ID",
    inputSchema: {
      type: "object",
      properties: {
        task_id: {
          type: "string",
          description: "ID of the task to complete"
        }
      },
      required: ["task_id"]
    }
  };

  protected validateArgs(args: unknown): args is CompleteTaskArgs {
    // Basic object validation handled by BaseTool, now just validate required task_id field
    const argsObj = args as Record<string, unknown>;
    return (
      "task_id" in argsObj &&
      typeof argsObj.task_id === "string"
    );
  }

  /**
   * Executes task completion directly with the Todoist API
   * 
   * This method handles the complete task completion workflow:
   * 1. Completes the task by ID via the Todoist API
   * 2. Returns confirmation or error message
   * 
   * @param args Validated task completion arguments
   * @param client Todoist API client for making requests
   * @returns Promise resolving to completion confirmation or error
   */
  protected async execute(args: CompleteTaskArgs, client: TodoistApi): Promise<ToolResponse> {
    return await client.closeTask(args.task_id)
      .then(() => ({
        content: [{
          type: "text" as const,
          text: `Successfully completed task with ID: "${args.task_id}"`
        }],
        isError: false,
      }))
      .catch((error: Error) => ({
        content: [{
          type: "text" as const,
          text: `Failed to complete task with ID: "${args.task_id}". ${error.message}`
        }],
        isError: true,
      }));
  }
} 
