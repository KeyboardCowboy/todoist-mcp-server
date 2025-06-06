# Contributing to Todoist MCP Server

Welcome to the Todoist MCP (Model Context Protocol) Server! This guide will help you understand how to contribute to the project, specifically how to add new tools to extend the server's functionality.

## Project Overview

This MCP server enables Claude (and other MCP clients) to interact with Todoist tasks and projects. The server is built using:

- **TypeScript/Node.js** for implementation
- **@modelcontextprotocol/sdk** for MCP integration
- **@doist/todoist-api-typescript** for Todoist API interaction
- **Object-Oriented Architecture** with tool management patterns

## Architecture Overview

The server follows a clean OOP architecture:

```
index.ts              # Server entry point and dependency injection
├── ToolManager.ts    # Registry pattern for tool management
├── tools/
│   ├── BaseTool.ts   # Abstract base class for all tools
│   ├── createTask.ts # Individual tool implementations
│   ├── getTasks.ts
│   ├── getProjects.ts
│   ├── updateTask.ts
│   ├── deleteTask.ts
│   ├── completeTask.ts
│   └── index.ts      # Tool exports
└── types/
    └── index.ts      # TypeScript type definitions
```

## How to Add a New Tool

Follow these steps to add a new tool to the MCP server:

### Step 1: Define the Tool Arguments Type

Add your tool's argument interface to `web/src/types/index.ts`:

```typescript
/**
 * Arguments for your new tool
 */
export interface YourToolArgs {
  /** Required field description */
  required_field: string;
  /** Optional field description */
  optional_field?: number;
}
```

### Step 2: Create the Tool Implementation

Create a new file `web/src/tools/yourTool.ts`:

```typescript
/**
 * @fileoverview Your Tool description
 * 
 * Brief description of what this tool does and its purpose.
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TodoistApi } from "@doist/todoist-api-typescript";
import { BaseTool, ToolResponse } from "./BaseTool.js";
import { YourToolArgs } from "../types/index.js";

/**
 * Tool for [description of functionality]
 * 
 * This tool is self-contained and handles all aspects of [operation]:
 * - Argument validation
 * - [Key responsibility 1]
 * - [Key responsibility 2]
 * - Response formatting
 */
export class YourTool extends BaseTool<YourToolArgs> {
  readonly definition: Tool = {
    name: "todoist_your_action",
    description: "Brief description of what this tool does",
    inputSchema: {
      type: "object",
      properties: {
        required_field: {
          type: "string",
          description: "Description of the required field"
        },
        optional_field: {
          type: "number",
          description: "Description of the optional field (optional)"
        }
      },
      required: ["required_field"]
    }
  };

  /**
   * Validates tool-specific arguments
   * 
   * Note: Basic object validation is handled by BaseTool.handle()
   * Focus only on validating your tool's specific requirements
   */
  protected validateArgs(args: unknown): args is YourToolArgs {
    const argsObj = args as Record<string, unknown>;
    return (
      "required_field" in argsObj &&
      typeof argsObj.required_field === "string"
      // Add additional validations as needed
    );
  }

  /**
   * Executes the tool's core functionality
   * 
   * @param args Validated arguments of the correct type
   * @param client Todoist API client for making requests
   * @returns Promise resolving to a tool response
   */
  protected async execute(args: YourToolArgs, client: TodoistApi): Promise<ToolResponse> {
    // Implement your tool's logic here
    // Example:
    // const result = await client.someApiMethod(args.required_field);
    
    return {
      content: [{ 
        type: "text", 
        text: `Operation completed: ${args.required_field}` 
      }],
      isError: false,
    };
  }
}
```

### Step 3: Export the Tool

Add your tool to `web/src/tools/index.ts`:

```typescript
export { YourTool } from "./yourTool.js";
```

### Step 4: Register the Tool

In `web/src/index.ts`, import and register your tool:

```typescript
import { 
  CreateTaskTool,
  GetTasksTool,
  GetProjectsTool,
  UpdateTaskTool,
  DeleteTaskTool,
  CompleteTaskTool,
  YourTool  // Add this import
} from "./tools/index.js";

// In the tool registration section:
toolManager.register(new YourTool());  // Add this line
```

### Step 5: Build and Test

1. **Build the project**:
   ```bash
   cd web
   npm run build
   ```

2. **Test your tool** by creating a simple test script or using the MCP client.

## Validation Pattern

The project uses a two-tier validation system established in the recent refactoring:

### BaseTool Validation (Automatic)
- **Common object validation** is handled automatically by `BaseTool.handle()`
- Validates that `args` is a non-null object
- Provides clear error messages for basic validation failures

### Tool-Specific Validation (Your Responsibility)
- Implement `validateArgs()` to check your tool's specific requirements
- Focus only on validating required fields and their types
- Use type assertions: `const argsObj = args as Record<string, unknown>;`

### Validation Examples

**For tools with required fields**:
```typescript
protected validateArgs(args: unknown): args is YourToolArgs {
  const argsObj = args as Record<string, unknown>;
  return (
    "required_field" in argsObj &&
    typeof argsObj.required_field === "string"
  );
}
```

**For tools with all optional fields**:
```typescript
protected validateArgs(args: unknown): args is YourToolArgs {
  // All fields are optional, basic object validation handled by BaseTool
  return true;
}
```

## Error Handling Guidelines

- **Use descriptive error messages** that help users understand what went wrong
- **Return structured responses** with `isError: true` for expected failures
- **Let exceptions bubble up** for unexpected errors (they'll be caught by the server)

Example:
```typescript
if (!matchingItem) {
  return {
    content: [{ 
      type: "text", 
      text: `Could not find item matching "${args.search_term}"` 
    }],
    isError: true,
  };
}
```

## Documentation Requirements

When adding a new tool, ensure you:

1. **Add JSDoc comments** for the class and all methods
2. **Document the tool schema** clearly in the MCP definition
3. **Include usage examples** in comments
4. **Update this CONTRIBUTING.md** if you establish new patterns

## Testing Your Tool

Create a simple test to verify your tool works:

```typescript
import { YourTool } from './dist/tools/yourTool.js';

const tool = new YourTool();

// Test validation
console.log('Valid args:', tool.validateArgs({ required_field: 'test' })); // true
console.log('Invalid args:', tool.validateArgs({})); // false
```

## Code Style Guidelines

- **Use TypeScript** with strict typing
- **Follow existing naming conventions** (camelCase for variables, PascalCase for classes)
- **Import types explicitly** for clarity
- **Use meaningful variable names**
- **Keep methods focused** on single responsibilities

## Available Todoist API Methods

The `TodoistApi` client provides these commonly used methods:

- `client.getTasks(filter?)` - Retrieve tasks with optional filtering
- `client.addTask(taskData)` - Create a new task
- `client.updateTask(id, taskData)` - Update an existing task
- `client.deleteTask(id)` - Delete a task
- `client.closeTask(id)` - Mark a task as completed
- `client.getProjects()` - Retrieve all projects
- `client.getLabels()` - Retrieve all labels

Refer to the [@doist/todoist-api-typescript documentation](https://github.com/Doist/todoist-api-typescript) for complete API reference.

## Getting Help

- **Check existing tools** for implementation patterns
- **Review the Todoist API documentation** for available endpoints
- **Look at the project's GitHub issues** for known limitations or planned features
- **Test your changes thoroughly** before submitting

## Example: Complete Tool Implementation

Here's a complete example of a simple tool that gets label information:

```typescript
// web/src/types/index.ts
export interface GetLabelsArgs {
  limit?: number;
}

// web/src/tools/getLabels.ts
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { TodoistApi } from "@doist/todoist-api-typescript";
import { BaseTool, ToolResponse } from "./BaseTool.js";
import { GetLabelsArgs } from "../types/index.js";

export class GetLabelsTool extends BaseTool<GetLabelsArgs> {
  readonly definition: Tool = {
    name: "todoist_get_labels",
    description: "Get a list of all labels with their names and colors",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of labels to return (optional)"
        }
      }
    }
  };

  protected validateArgs(args: unknown): args is GetLabelsArgs {
    // All fields are optional, basic object validation handled by BaseTool
    return true;
  }

  protected async execute(args: GetLabelsArgs, client: TodoistApi): Promise<ToolResponse> {
    const labels = await client.getLabels();
    
    let limitedLabels = labels;
    if (args.limit && args.limit > 0) {
      limitedLabels = labels.slice(0, args.limit);
    }
    
    const labelList = limitedLabels.map(label => 
      `- ${label.name} (Color: ${label.color})`
    ).join('\n');
    
    return {
      content: [{ 
        type: "text", 
        text: limitedLabels.length > 0 ? `Labels:\n${labelList}` : "No labels found" 
      }],
      isError: false,
    };
  }
}
```

## Summary

Adding a new tool involves:
1. **Define types** in `types/index.ts`
2. **Implement tool class** extending `BaseTool`
3. **Export from tools/index.ts**
4. **Register in index.ts**
5. **Build and test**

The architecture handles the complexity of MCP integration, API management, and error handling, so you can focus on implementing your tool's specific functionality.

Happy contributing! 🚀 
