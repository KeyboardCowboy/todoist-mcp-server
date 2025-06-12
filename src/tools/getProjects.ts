/**
 * @fileoverview Get Projects tool for Todoist MCP server
 * 
 * This tool allows users to retrieve all projects from their Todoist account
 * with optional limiting functionality.
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TodoistApi } from "@doist/todoist-api-typescript";
import { BaseTool, ToolResponse } from "./BaseTool.js";
import { GetProjectsArgs } from "../types/index.js";

/**
 * Tool for retrieving projects from Todoist
 * 
 * This tool is self-contained and handles all aspects of project retrieval:
 * - Argument validation
 * - API interaction
 * - Response formatting with project IDs and names
 */
export class GetProjectsTool extends BaseTool<GetProjectsArgs> {
  readonly definition: Tool = {
    name: "todoist_get_projects",
    description: "Get a list of all projects with their IDs and names for use in other tools",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of projects to return (optional, default: 50)",
          default: 50
        }
      }
    }
  };

  protected validateArgs(args: unknown): args is GetProjectsArgs {
    // All fields are optional, basic object validation handled by BaseTool
    return true;
  }

  /**
   * Executes project retrieval directly with the Todoist API
   * 
   * This method handles the complete project retrieval workflow:
   * 1. Retrieves all projects via the Todoist API
   * 2. Applies optional limit if specified
   * 3. Formats response with project names and IDs
   * 
   * @param args Validated project retrieval arguments
   * @param client Todoist API client for making requests
   * @returns Promise resolving to formatted project list
   */
  protected async execute(args: GetProjectsArgs, client: TodoistApi): Promise<ToolResponse> {
    // Retrieve all projects from Todoist
    const projects = await client.getProjects();
    
    // Format response with project names and IDs
    const projectList = projects.results.map((project: any) => 
      `- ${project.name} (ID: ${project.id})`
    ).join('\n');
    
    return {
      content: [{ 
        type: "text", 
        text: projects.results.length > 0 ? `Projects:\n${projectList}` : "No projects found" 
      }],
      isError: false,
    };
  }
} 
