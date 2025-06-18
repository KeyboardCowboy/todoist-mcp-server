import { BasePrompt } from "./BasePrompt.js";

/**
 * Prompt to help debug and test project lookup functionality
 */
export class ProjectLookupPrompt extends BasePrompt {
  public name = "todoist_project_lookup";
  public description = "Find the project name and id that most closely matches the natural language query when the user wants to get, add, update, delete, or complete tasks in a specific project.";
  public arguments = [{
    name: "query",
    description: "The natural language query to test project filtering with (e.g., 'home improvement project tasks', 'business project due today')",
    required: true,
  }];

  /**
   * Handle the prompt request
   * 
   * @param args The arguments to pass to the prompt
   * @returns A promise resolving to debugging information
   */
  async handle(args: unknown): Promise<object> {
    const { query } = args as { query: string };

    return {
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text: `The Todoist API needs to know the exact name of the project when building a filter, and the ID of the project when using a project parameter in the API call.  Let's get the project data:"

EXECUTE THESE STEPS:
Step 1: Run todoist_get_projects to refresh project data and see all available projects
Step 2: Find the project entry that most closely matches the natural language query: "${query}"

Beginning execution...`,
          },
        }
      ],
    };
  }
} 
