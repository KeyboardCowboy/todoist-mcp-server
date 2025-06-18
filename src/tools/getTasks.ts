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
import { formatFilter, getFilterExamples } from "../utils/filterFormatter.js";

/**
 * Tool for retrieving tasks from Todoist with filtering capabilities
 * 
 * This tool is self-contained and handles all aspects of task retrieval:
 * - Argument validation
 * - Natural language filter conversion to Todoist syntax
 * - API interaction with filtering
 * - Additional client-side filtering (priority)
 * - Response formatting with task details
 */
export class GetTasksTool extends BaseTool<GetTasksArgs> {
  readonly definition: Tool = {
    name: "todoist_get_tasks",
    description: "Get a list of tasks from Todoist using a properly formatted Todoist natural language query.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Filter tasks using natural language by any other criteria or text strings (e.g. 'urgent tasks due today', 'high priority work project', 'overdue tasks') or Todoist syntax (e.g. 'p1 & today', '#Work & @urgent'). Natural language gets converted to proper Todoist filter syntax automatically."
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
   * 1. Determines whether any filtering is needed
   * 2. Combines all filters (content + properties) into a single query
   * 3. Retrieves tasks via the appropriate API method
   * 4. Applies result limiting
   * 5. Formats response with task details
   * 
   * @param args Validated task retrieval arguments
   * @param client Todoist API client for making requests
   * @returns Promise resolving to formatted task list
   */
  protected async execute(args: GetTasksArgs, client: TodoistApi): Promise<ToolResponse> {
    let response: { status: boolean, tasks?: any, error?: any };
    let method: string = "";

    const apiParams: any = { query: formatFilter(args.query) };

    response = await client.getTasksByFilter(apiParams)
      .then(tasksResponse => {
        return { status: true, tasks: tasksResponse.results };
      })
      .catch(error => {
        console.error('Error fetching tasks by filter:', error);
        return { status: false, error: error };
      });

    // If the API call failed, process the error.
    if (!response.status) {
      return {
        content: [{
          type: 'text',
          text: 'Failed to fetch tasks by filter.  Error: ' + response.error
        }],
        isError: true,
      };
    }

    // Format response with task details including taskID for parent-child relationships
    const taskList = response.tasks.map((task: any) =>
      `- ${task.content} (ID: ${task.id})${task.description ? `\n  Description: ${task.description}` : ''}${task.due ? `\n  Due: ${task.due.string}` : ''}${task.priority ? `\n  Priority: ${task.priority}` : ''}${task.parentId ? `\n  Parent Task ID: ${task.parentId}` : ''}${task.responsibleUid ? `\n  Responsible UID: ${task.responsibleUid}` : ''}`
    ).join('\n\n');

    return {
      content: [{
        type: "text",
        text: response.tasks.length > 0 ? taskList : "No tasks found matching the criteria."
      }],
      isError: false,
    };
  }
} 
