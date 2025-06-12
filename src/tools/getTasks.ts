/**
 * @fileoverview Get Tasks tool for Todoist MCP server
 * 
 * This tool allows users to retrieve and filter tasks from Todoist with
 * support for various filtering options including project, priority, and
 * natural language filters.
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TodoistApi } from "@doist/todoist-api-typescript";
import { BaseTool, ToolResponse } from "./BaseTool.js";
import { GetTasksArgs } from "../types/index.js";
import { mapPriority } from "../utils/priorityMapper.js";
import { handleTodoistApiError } from "../utils/errorHandler.js";

/**
 * Tool for retrieving tasks from Todoist with filtering capabilities
 * 
 * This tool is self-contained and handles all aspects of task retrieval:
 * - Argument validation
 * - API interaction with filtering
 * - Additional client-side filtering (priority)
 * - Response formatting with task details
 */
export class GetTasksTool extends BaseTool<GetTasksArgs> {
  readonly definition: Tool = {
    name: "todoist_get_tasks",
    description: "Get a list of tasks from Todoist with various filters",
    inputSchema: {
      type: "object",
      properties: {
        project_id: {
          type: "string",
          description: "Filter tasks by project ID (optional)"
        },
        filter: {
          type: "string",
          description: "Natural language filter like 'today', 'tomorrow', 'next week', 'priority 1', 'overdue' (optional)"
        },
        priority: {
          type: ["number", "string"],
          description: "Filter by priority level: number (1-4) or string (P1-P4) (optional)",
          oneOf: [
            { type: "number", enum: [1, 2, 3, 4] },
            { type: "string", enum: ["P1", "P2", "P3", "P4", "p1", "p2", "p3", "p4"] }
          ]
        },
        limit: {
          type: "number",
          description: "Maximum number of tasks to return (optional)",
          default: 10
        }
      }
    }
  };

  protected validateArgs(args: unknown): args is GetTasksArgs {
    // All fields are optional, basic object validation handled by BaseTool
    return true;
  }

  /**
   * Executes task retrieval directly with the Todoist API
   * 
   * This method handles the complete task retrieval workflow:
   * 1. Builds API parameters from provided filters
   * 2. Retrieves tasks via the Todoist API with promise-based error handling
   * 3. Applies additional client-side filtering (priority)
   * 4. Applies result limiting
   * 5. Formats response with task details
   * 
   * @param args Validated task retrieval arguments
   * @param client Todoist API client for making requests
   * @returns Promise resolving to formatted task list
   */
  protected async execute(args: GetTasksArgs, client: TodoistApi): Promise<ToolResponse> {
    // Build API parameters - only pass filter if at least one filtering parameter is provided
    const apiParams: any = {};
    if (args.project_id) {
      apiParams.projectId = args.project_id;
    }
    if (args.filter) {
      apiParams.filter = args.filter;
    }
    
    // Retrieve tasks from Todoist API with promise-based error handling
    return client.getTasks(Object.keys(apiParams).length > 0 ? apiParams : undefined)
      .then(tasks => {
        // Apply additional client-side filters
        let filteredTasks = tasks;
        if (args.priority) {
          const numericPriority = mapPriority(args.priority);
          filteredTasks = filteredTasks.filter(task => task.priority === numericPriority);
        }
        
        // Apply limit
        if (args.limit && args.limit > 0) {
          filteredTasks = filteredTasks.slice(0, args.limit);
        }
        
        // Format response with task details
        const taskList = filteredTasks.map(task => 
          `- ${task.content}${task.description ? `\n  Description: ${task.description}` : ''}${task.due ? `\n  Due: ${task.due.string}` : ''}${task.priority ? `\n  Priority: ${task.priority}` : ''}`
        ).join('\n\n');
        
        return {
          content: [{ 
            type: "text" as const, 
            text: filteredTasks.length > 0 ? taskList : "No tasks found matching the criteria" 
          }],
          isError: false,
        };
      })
      .catch((error: any) => {
        // Use centralized error handler with filter context
        return handleTodoistApiError(error, { 
          filter: args.filter,
          project_id: args.project_id 
        });
      });
  }
} 
