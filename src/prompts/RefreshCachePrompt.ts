import { BasePrompt } from "./BasePrompt.js";

/**
 * Prompt to refresh the cache
 */
export class RefreshCachePrompt extends BasePrompt {
  public name = "todoist_refresh_cache";
  public description = "Refresh stale data by deleting the cache file for a particular Todoist object type and fetching fresh data from the API.";
  public arguments = [{
    name: "data_type",
    description: "The type of data the user wants to refresh, usually a Todoist object like projects, users, etc.",
    required: true,
  }];

  /**
   * Handle the prompt request
   * 
   * @param args The arguments to pass to the prompt
   * @returns A promise resolving to a string response
   */
  async handle(args: unknown): Promise<object> {
    const { data_type } = args as { data_type: string };
    let cache_name = null;

    // Filter allowed caches.
    switch(data_type) {
      case "project":
      case "projects":
        cache_name = "projects";
        break;

      default:
        return {
          messages: [
            {
              role: "assistant",
              content: {
                type: "text",
                text: `I'm sorry, but it looks like we're not caching ${data_type} data.`,
              },
            },
          ],
        };
        break;
    }

    return {
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text: `Got it.  The ${cache_name} cache file is a little stale.

EXECUTE THESE STEPS:
Step 1: Run the todoist_delete_cache tool to delete the ${cache_name} cache file.
Step 2: Run the todoist_get_projects tool to get the latest ${cache_name} data and automatically store the data in the cache.
Step 3: Cache will rebuild automatically; no need to manually write the file.

Beginning execution...`,
          },
        }
      ],
    };
  }
} 
