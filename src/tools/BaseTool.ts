/**
 * @fileoverview Abstract base class for all Todoist MCP tools
 * 
 * This file defines the base structure that all Todoist tools must follow.
 * It implements the Template Method pattern to ensure consistent behavior
 * across all tools while allowing each tool to implement its specific logic.
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TodoistApi } from "@doist/todoist-api-typescript";

/**
 * Standard response format for all tool operations
 */
export type ToolResponse = {
  /** Array of content blocks to return to the user */
  content: Array<{ type: "text"; text: string }>;
  /** Whether this response represents an error condition */
  isError: boolean;
};

/**
 * Abstract base class for all Todoist MCP tools
 * 
 * This class implements the Template Method pattern, providing a consistent
 * interface for all tools while allowing each tool to implement its specific
 * validation and execution logic.
 * 
 * @template T The type of arguments this tool expects
 */
export abstract class BaseTool<T = unknown> {
  /** The MCP tool definition including schema and description */
  abstract readonly definition: Tool;

  /**
   * Gets the unique name identifier for this tool from the definition
   * This eliminates duplication and ensures name and definition.name are always in sync
   */
  get name(): string {
    return this.definition.name;
  }

  /**
   * Validates that the provided arguments match the expected type for this tool
   * 
   * Note: args is guaranteed to be a non-null object by the handle method
   * 
   * @param args Arguments to validate (guaranteed to be non-null object)
   * @returns Type predicate indicating if args are valid for this tool
   */
  protected abstract validateArgs(args: unknown): args is T;

  /**
   * Executes the core functionality of this tool with validated arguments
   * 
   * @param args Validated arguments of the correct type
   * @param client Todoist API client for making requests
   * @returns Promise resolving to a tool response
   */
  protected abstract execute(args: T, client: TodoistApi): Promise<ToolResponse>;

  /**
   * Main entry point for tool execution
   * 
   * This method implements the Template Method pattern:
   * 1. Validates that args is a non-null object (common to all tools)
   * 2. Validates arguments using the tool-specific validator
   * 3. Delegates to the tool-specific execute method if validation passes
   * 4. Throws an error if validation fails
   * 
   * @param args Arguments provided by the user
   * @param client Todoist API client
   * @returns Promise resolving to a tool response
   * @throws Error if argument validation fails
   */
  async handle(args: unknown, client: TodoistApi): Promise<ToolResponse> {
    // Common validation: ensure args is a non-null object
    if (typeof args !== "object" || args === null) {
      throw new Error(`Invalid arguments for ${this.name}: expected object, got ${typeof args}`);
    }
    
    // Tool-specific validation - args is now guaranteed to be a non-null object
    if (!this.validateArgs(args)) {
      throw new Error(`Invalid arguments for ${this.name}`);
    }
    
    return await this.execute(args, client);
  }
} 
