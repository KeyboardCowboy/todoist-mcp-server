/**
 * @fileoverview Create Task tool for Todoist MCP server
 * 
 * This tool allows users to create new tasks in Todoist with comprehensive
 * support for all task properties including due dates, priorities, labels,
 * project assignment, and more.
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TodoistApi } from "@doist/todoist-api-typescript";
import { BaseTool, ToolResponse } from "./BaseTool.js";
import { CreateTaskArgs } from "../types/index.js";
import { mapPriority } from "../utils/priorityMapper.js";

/**
 * Tool for creating new tasks in Todoist
 * 
 * This tool extends BaseTool to provide task creation functionality with
 * support for all Todoist task properties including content, description,
 * due dates, priorities, labels, project assignment, sections, and subtasks.
 * 
 * This tool is self-contained and handles all aspects of task creation:
 * - Argument validation
 * - Task data building
 * - API interaction
 * - Response formatting
 */
export class CreateTaskTool extends BaseTool<CreateTaskArgs> {
  /** MCP tool definition with schema and description */
  readonly definition: Tool = {
    name: "todoist_create_task",
    description: "Create a new task in Todoist with optional description, due date, priority, project assignment, labels, and more",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The content/title of the task"
        },
        description: {
          type: "string",
          description: "Detailed description of the task (optional)"
        },
        due_string: {
          type: "string",
          description: "Natural language due date like 'tomorrow', 'next Monday', 'Jan 23' (optional)"
        },
        priority: {
          type: "string",
          description: "Task priority: number ('1'-'4') or string (P1-P4) where P1=urgent, P4=normal (optional)",
        },
        project_id: {
          type: "string",
          description: "ID of the project to assign the task to (optional)"
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
          description: "ID of the parent task to create this as a subtask (optional)"
        },
        responsible_uid: {
          type: "string",
          description: "UID of the user to assign as responsible for this task (optional)"
        }
      },
      required: ["content"]
    }
  };

  /**
   * Validates that the provided arguments contain a valid content string
   * 
   * @param args Unknown arguments to validate
   * @returns Type predicate indicating if args are valid CreateTaskArgs
   */
  protected validateArgs(args: unknown): args is CreateTaskArgs {
    // Basic object validation handled by BaseTool, now just validate required content field
    const argsObj = args as Record<string, unknown>;
    return (
      "content" in argsObj &&
      typeof argsObj.content === "string"
    );
  }

  /**
   * Executes task creation directly with the Todoist API
   * 
   * This method handles the complete task creation workflow:
   * 1. Builds task data with all available properties
   * 2. Creates the task via the Todoist API
   * 3. Formats a comprehensive response showing all set values
   * 
   * @param args Validated task creation arguments
   * @param client Todoist API client for making requests
   * @returns Promise resolving to task creation response
   */
  protected async execute(args: CreateTaskArgs, client: TodoistApi): Promise<ToolResponse> {
    // Build task data with all available properties
    const taskData: any = {
      content: args.content,
    };
    
    // Add optional properties if provided
    if (args.description) taskData.description = args.description;
    if (args.due_string) taskData.dueString = args.due_string;
    if (args.priority) taskData.priority = mapPriority(args.priority);
    if (args.project_id) taskData.projectId = args.project_id;
    if (args.labels && args.labels.length > 0) taskData.labels = args.labels;
    if (args.section_id) taskData.sectionId = args.section_id;
    if (args.parent_id) taskData.parentId = args.parent_id;
    if (args.responsible_uid) taskData.responsibleUid = args.responsible_uid;
    
    // Create the task via Todoist API
    const task = await client.addTask(taskData);
    
    // Build enhanced response showing all set properties including taskID for future reference
    let responseText = `Task created:\nTitle: ${task.content}\nTask ID: ${task.id}`;
    if (task.description) responseText += `\nDescription: ${task.description}`;
    if (task.due) responseText += `\nDue: ${task.due.string}`;
    if (task.priority) responseText += `\nPriority: ${task.priority}`;
    if (task.projectId) responseText += `\nProject ID: ${task.projectId}`;
    if (task.labels && task.labels.length > 0) responseText += `\nLabels: ${task.labels.join(', ')}`;
    if (task.sectionId) responseText += `\nSection ID: ${task.sectionId}`;
    if (task.parentId) responseText += `\nParent Task ID: ${task.parentId}`;
    if (task.responsibleUid) responseText += `\nAssigned to: ${task.responsibleUid}`;
    
    return {
      content: [{ 
        type: "text", 
        text: responseText
      }],
      isError: false,
    };
  }
} 
