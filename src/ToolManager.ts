/**
 * @fileoverview Tool registry and request dispatcher for Todoist MCP tools
 * 
 * This file implements the Registry pattern to manage all available tools
 * and route incoming requests to the appropriate tool handler. It provides
 * a centralized point for tool management and execution.
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TodoistApi } from "@doist/todoist-api-typescript";
import { BaseTool, ToolResponse } from "./tools/BaseTool.js";
import { CacheManager } from "./CacheManager.js";

/**
 * Central registry and dispatcher for all Todoist MCP tools
 * 
 * The ToolManager implements the Registry pattern, providing:
 * - Tool registration and management
 * - Request routing to appropriate tools
 * - Unified error handling for unknown tools
 * - Tool discovery via definition listing
 */
export class ToolManager {
  /** Internal registry mapping tool names to tool instances */
  private tools = new Map<string, BaseTool>();

  /** Cache manager instance */
  private cacheManager: CacheManager;

  /**
   * Constructor for the ToolManager.
   * 
   * @param cacheManager The cache manager instance.
   */
  constructor(cacheManager: CacheManager) {
    this.cacheManager = cacheManager;
  }

  /**
   * Registers a new tool in the registry
   * 
   * @param tool The tool instance to register
   */
  register(tool: BaseTool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Retrieves all tool definitions for MCP tool listing
   * 
   * @returns Array of MCP tool definitions
   */
  getAllDefinitions(): Tool[] {
    return Array.from(this.tools.values()).map(tool => tool.definition);
  }

  /**
   * Routes a tool request to the appropriate tool handler
   * 
   * This method acts as a dispatcher, finding the correct tool by name
   * and delegating the request to its handle method.
   * 
   * @param name The name of the tool to execute
   * @param args Arguments to pass to the tool
   * @param client Todoist API client
   * @returns Promise resolving to a tool response
   */
  async handle(name: string, args: unknown, client: TodoistApi): Promise<ToolResponse> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
    }
    // Initialize the cache manager for the tool.
    return await tool.handle(args, client, this.cacheManager);
  }

  /**
   * Gets a list of all registered tool names
   * 
   * @returns Array of tool names
   */
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }
} 
