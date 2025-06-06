#!/usr/bin/env node

/**
 * @fileoverview Main entry point for the Todoist MCP Server
 * 
 * This file sets up and configures the MCP server with dependency injection,
 * registers all available tools, and handles incoming requests. It implements
 * a modern OOP architecture with service layers and tool management.
 * 
 * The server provides the following tools:
 * - Create tasks with full property support
 * - Retrieve and filter tasks
 * - Get project listings
 * - Update existing tasks by name search
 * - Delete tasks by name search
 * - Mark tasks as completed by name search
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { TodoistApi } from "@doist/todoist-api-typescript";
import { ToolManager } from "./ToolManager.js";
import { 
  CreateTaskTool,
  GetTasksTool,
  GetProjectsTool,
  UpdateTaskTool,
  DeleteTaskTool,
  CompleteTaskTool
} from "./tools/index.js";

/**
 * Initialize the MCP server with basic configuration
 */
const server = new Server(
  {
    name: "todoist-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

/**
 * Validate required environment variables
 */
const TODOIST_API_TOKEN = process.env.TODOIST_API_TOKEN!;
if (!TODOIST_API_TOKEN) {
  console.error("Error: TODOIST_API_TOKEN environment variable is required");
  process.exit(1);
}

/**
 * Initialize Todoist API client
 * 
 * The client is passed directly to tools as they are now self-contained
 * and handle their own business logic without requiring a service layer.
 */
const todoistClient = new TodoistApi(TODOIST_API_TOKEN);

/**
 * Initialize tool manager and register all available tools
 * 
 * The ToolManager implements the Registry pattern to manage all tools
 * and route requests to the appropriate handlers.
 */
const toolManager = new ToolManager();
toolManager.register(new CreateTaskTool());
toolManager.register(new GetTasksTool());
toolManager.register(new GetProjectsTool());
toolManager.register(new UpdateTaskTool());
toolManager.register(new DeleteTaskTool());
toolManager.register(new CompleteTaskTool());

/**
 * Handler for listing all available tools
 * 
 * This endpoint returns the tool definitions that MCP clients use
 * to understand what tools are available and their schemas.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: toolManager.getAllDefinitions(),
}));

/**
 * Handler for executing tool requests
 * 
 * This endpoint receives tool execution requests and routes them
 * through the ToolManager to the appropriate tool handler.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error("No arguments provided");
    }

    // Use the tool manager to handle the request
    return await toolManager.handle(name, args, todoistClient);
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Main server startup function
 * 
 * Initializes the stdio transport and starts the MCP server.
 */
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Todoist MCP Server running on stdio");
}

/**
 * Start the server with error handling
 */
runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
