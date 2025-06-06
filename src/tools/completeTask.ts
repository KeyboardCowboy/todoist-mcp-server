/**
 * @fileoverview Complete Task tool for Todoist MCP server
 * 
 * This tool allows users to mark tasks as completed in Todoist by
 * searching for them by name.
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
 * - Task search by name (case-insensitive)
 * - API interaction for task completion
 * - Response formatting
 */
export class CompleteTaskTool extends BaseTool<CompleteTaskArgs> {
  readonly definition: Tool = {
    name: "todoist_complete_task",
    description: "Mark a task as complete by searching for it by name",
    inputSchema: {
      type: "object",
      properties: {
        task_name: {
          type: "string",
          description: "Name/content of the task to search for and complete"
        }
      },
      required: ["task_name"]
    }
  };

  protected validateArgs(args: unknown): args is CompleteTaskArgs {
    // Basic object validation handled by BaseTool, now just validate required task_name field
    const argsObj = args as Record<string, unknown>;
    return (
      "task_name" in argsObj &&
      typeof argsObj.task_name === "string"
    );
  }

  /**
   * Executes task completion directly with the Todoist API
   * 
   * This method handles the complete task completion workflow:
   * 1. Searches for the task by name (case-insensitive)
   * 2. Marks the task as completed via the Todoist API
   * 3. Returns confirmation or error message
   * 
   * @param args Validated task completion arguments
   * @param client Todoist API client for making requests
   * @returns Promise resolving to completion confirmation or error
   */
  protected async execute(args: CompleteTaskArgs, client: TodoistApi): Promise<ToolResponse> {
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

    // Complete the task
    await client.closeTask(matchingTask.id);
    
    return {
      content: [{ 
        type: "text", 
        text: `Successfully completed task: "${matchingTask.content}"` 
      }],
      isError: false,
    };
  }
} 
