export abstract class BasePrompt {
  /**
   * The name of the prompt
   */
  public abstract name: string;

  /**
   * The description of the prompt
   */
  public abstract description: string;

  /**
   * The arguments expected by the prompt
   */
  public arguments: { name: string; description: string; required: boolean }[] = [];

  /**
   * Handles the prompt logic
   * @param args Arguments for the prompt
   * @returns A promise resolving to the prompt response
   */
  public abstract handle(args: unknown): Promise<object>;
} 
