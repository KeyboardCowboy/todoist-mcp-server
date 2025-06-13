/**
 * @fileoverview Prompt manager for Todoist MCP server
 * 
 * This file implements the PromptManager class, which manages the registration
 * and routing of prompts to appropriate handlers. It provides a centralized
 * point for prompt management and execution.
 */

import { Prompt } from "@modelcontextprotocol/sdk/types.js";
import { CacheManager } from "./CacheManager.js";
import { BasePrompt } from "./prompts/BasePrompt.js";

/**
 * Central registry and dispatcher for all Todoist MCP prompts
 */
export class PromptManager {
  /** Internal registry mapping prompt names to prompt instances */
  private prompts = new Map<string, BasePrompt>();

  /** Cache manager instance */
  cacheManager: CacheManager;

  /**
   * Constructor for the PromptManager.
   * 
   * @param cacheManager The cache manager instance.
   */
  constructor(cacheManager: CacheManager) {
    this.cacheManager = cacheManager;
  }

  /**
   * Registers a new prompt in the registry
   *
   * @param prompt The prompt instance to register
   */
  register(prompt: BasePrompt): void {
    this.prompts.set(prompt.name, prompt);
  }

  /**
   * Retrieves all prompt definitions
   *
   * @returns Array of prompt definitions
   */
  getAllDefinitions(): { name: string; description: string; arguments: { name: string; description: string; required: boolean }[] }[] {
    return Array.from(this.prompts.values()).map(prompt => ({
      name: prompt.name,
      description: prompt.description,
      arguments: prompt.arguments,
    }));
  }

  /**
   * Routes a prompt request to the appropriate prompt handler
   *
   * @param name The name of the prompt to execute
   * @param args Arguments to pass to the prompt
   * @returns Promise resolving to a prompt response
   */
  async handle(name: string, args: unknown): Promise<object> {
    const prompt = this.prompts.get(name);
    if (!prompt) {
      return {
        content: [{ type: "text", text: `Unknown prompt: ${name}` }],
        isError: true,
      };
    }
    
    return await prompt.handle(args);
  }
}
