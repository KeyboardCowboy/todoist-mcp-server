import { BasePrompt } from "./BasePrompt.js";

/**
 * Prompt to explain Todoist's priority systems and when to use each format
 */
export class PriorityGuidePrompt extends BasePrompt {
  public name = "todoist_priority_guide";
  public description = "Comprehensive guide explaining Todoist's dual priority systems: API priority values (1-4) vs filter priority syntax (P1-P4), including when to use each format to properly communicate the user's desired priority with Todoist.";
  public arguments = [{
      name: "query",
      description: "The natural language query to determine the task priority.",
      required: true,
  }];

  /**
   * Handle the priority guide prompt request
   * 
   * @param args The arguments to pass to the prompt
   * @returns A promise resolving to comprehensive priority guidance
   */
  async handle(args: unknown): Promise<object> {
    const { query } = (args as { query?: string }) || {};

    return {
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text: `# Todoist Priority Systems Guide

Todoist has **two different priority systems** that can be confusing. Here's the complete breakdown:

## 🔄 The Key Difference

**API Priority Values** (for creating/updating tasks):
- 1 = Normal (lowest priority)
- 2 = Medium  
- 3 = High
- 4 = Urgent (highest priority)

**Filter Priority Syntax** (for searching/filtering tasks using the natural language query, or "content" property):
- P4 = Normal (lowest priority)
- P3 = Medium
- P2 = High  
- P1 = Urgent (highest priority)

**Notice**: The numbers are **INVERTED** between these two systems!

## 🛠️ When to Use Each Format

### Use API Priority Values (1-4) when:
- Creating tasks with \`todoist_create_task\`
- Updating tasks with \`todoist_update_task\`
- Setting the \`priority\` parameter in any tool

### Use Filter Priority Syntax (P1-P4) when:
- Filtering tasks with \`todoist_get_tasks\`
- Writing filter queries like "P1 & today"
- Using natural language that gets converted to filters

## 🎯 The MCP Handles This For You

**Good News**: The \`priorityMapper.ts\` utility automatically handles conversions!

It accepts multiple formats:
- **P-notation**: "P1", "P2", "P3", "P4" → converts to correct API values
- **Words**: "urgent", "high", "medium", "normal" → converts to correct API values  
- **Numbers**: "1", "2", "3", "4" → uses as-is for API calls

## 📝 Practical Examples

### Creating a High Priority Task:
\`\`\`
todoist_create_task({
  content: "Important meeting prep",
  priority: "P2"  // Gets converted to API value 3
})
\`\`\`

### Filtering for Urgent Tasks:
\`\`\`
todoist_get_tasks({
  content: "P1 tasks"  // Filter syntax: P1 = urgent
})
\`\`\`

### Natural Language Examples:
- "Create urgent task" → priority gets converted to 4
- "Show me high priority tasks" → filter uses P2 syntax
- "Set priority to P1" → system converts P1→4 for API calls

## 🚀 Best Practices

1. **Use P-notation** (P1-P4) when talking to users - it's more intuitive
2. **Let the mapper handle conversions** - don't manually convert
3. **Remember**: P1 = most urgent, P4 = least urgent (user perspective)
4. **The system handles the API inversion automatically**

## 🔍 Quick Reference

| User Says | P-Notation | API Value | Meaning |
|-----------|------------|-----------|---------|
| "Urgent" | P1 | 4 | Highest Priority |
| "High" | P2 | 3 | High Priority |  
| "Medium" | P3 | 2 | Medium Priority |
| "Normal" | P4 | 1 | Lowest Priority |

**Remember**: You don't need to worry about the inversion - the MCP handles it automatically!`,
          },
        }
      ],
    };
  }
} 
