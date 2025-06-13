import { CacheManager } from "../CacheManager";
import { BaseTool, ToolResponse } from "./BaseTool.js";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TodoistApi } from "@doist/todoist-api-typescript";

/**
 * Tool: deleteCache
 *
 * Deletes a cache file by name using CacheManager.
 * Usage: Provide the cache name (without .json extension).
 * Returns a ToolResponse indicating success or failure.
 */
export class DeleteCacheTool extends BaseTool<{ name: string }> {
    readonly definition: Tool = {
        name: "todoist_delete_cache",
        description: "Delete a cache file by name (without .json)",
        inputSchema: {
            type: "object",
            properties: {
                name: { type: "string", description: "Cache name (without .json)" }
            },
            required: ["name"]
        }
    };

    /**
     * Validate the arguments for the tool.
     *
     * @param args The arguments to validate.
     * @returns True if the arguments are valid, false otherwise.
     */
    protected validateArgs(args: unknown): args is { name: string } {
        return typeof args === "object" && args !== null && typeof (args as any).name === "string";
    }

    /**
     * Execute the tool.
     *
     * @param args The arguments to execute the tool with.
     * @param client The client to execute the tool with.
     * @returns A ToolResponse indicating success or failure.
     */ 
    protected async execute(args: { name: string }, client: TodoistApi): Promise<ToolResponse> {
        const { name } = args;
        const deleted = this.cacheManager.deleteCache(name);
        if (deleted) {
            return {
                content: [{ type: "text", text: `Cache file '${name}.json' deleted.` }],
                isError: false
            };
        } else {
            return {
                content: [{ type: "text", text: `Cache file '${name}.json' not found or could not be deleted.` }],
                isError: true
            };
        }
    }
}

export default DeleteCacheTool; 
