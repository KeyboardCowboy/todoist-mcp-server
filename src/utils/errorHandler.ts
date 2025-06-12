/**
 * @fileoverview Error handling utility for Todoist MCP server
 * 
 * This module provides centralized error handling for Todoist API errors,
 * converting technical errors into user-friendly messages with actionable guidance.
 */

import { ToolResponse } from "../tools/BaseTool.js";

/**
 * Context information for error handling to provide specific guidance
 */
export interface ErrorContext {
  /** The filter that was attempted (for filter syntax errors) */
  filter?: string;
  /** The project ID that was attempted (for project not found errors) */
  project_id?: string;
  /** The task name that was searched for (for task not found errors) */
  task_name?: string;
  /** The action being performed (for general context) */
  action?: string;
}

/**
 * Handles Todoist API errors and converts them to user-friendly ToolResponse
 * 
 * This function provides consistent error handling across all tools, with
 * context-specific guidance based on the operation being performed.
 * 
 * @param error The error object from the API call
 * @param context Optional context information for specific error guidance
 * @returns ToolResponse with user-friendly error message
 */
export function handleTodoistApiError(error: any, context: ErrorContext = {}): ToolResponse {
  // Handle specific Todoist API errors with user-friendly messages
  if (error.response) {
    const status = error.response.status;
    // Todoist API returns simple HTTP errors without structured JSON bodies
    const statusText = error.response.statusText || `HTTP ${status}`;
    
    switch (status) {
      case 400:
        return {
          content: [{ 
            type: "text", 
            text: buildBadRequestMessage(statusText, context)
          }],
          isError: true,
        };
      
      case 401:
        return {
          content: [{ 
            type: "text", 
            text: `Authentication failed: ${statusText}\n\nPlease check that your TODOIST_API_TOKEN environment variable is set correctly.\nYou can get your API token from: https://todoist.com/prefs/integrations` 
          }],
          isError: true,
        };
      
      case 403:
        return {
          content: [{ 
            type: "text", 
            text: `Access denied or rate limit exceeded: ${statusText}\n\nIf this is a rate limit error, please wait a few minutes before trying again.\nTodoist allows 450 requests per 15 minutes.` 
          }],
          isError: true,
        };
      
      case 404:
        return {
          content: [{ 
            type: "text", 
            text: buildNotFoundMessage(statusText, context)
          }],
          isError: true,
        };
      
      case 429:
        return {
          content: [{ 
            type: "text", 
            text: `Rate limit exceeded: ${statusText}\n\nToo many requests have been made. Please wait before trying again.\nTodoist allows 450 requests per 15 minutes.` 
          }],
          isError: true,
        };
      
      default:
        return {
          content: [{ 
            type: "text", 
            text: `API Error (${status}): ${statusText}\n\nPlease try again or contact support if the problem persists.` 
          }],
          isError: true,
        };
    }
  }
  
  // Handle network or other errors
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return {
      content: [{ 
        type: "text", 
        text: `Network error: Unable to connect to Todoist.\n\nPlease check your internet connection and try again.` 
      }],
      isError: true,
    };
  }
  
  // Generic error fallback
  return {
    content: [{ 
      type: "text", 
      text: `Unexpected error: ${error.message || 'Unknown error occurred'}\n\nPlease try again or contact support if the problem persists.` 
    }],
    isError: true,
  };
}

/**
 * Builds context-specific message for 400 Bad Request errors
 */
function buildBadRequestMessage(statusText: string, context: ErrorContext): string {
  let message = `Invalid request: ${statusText}\n\n`;
  
  if (context.filter !== undefined) {
    message += `Tip: Check your filter syntax. Examples of valid filters:
- "today" or "tomorrow"
- "p1" for priority 1 tasks
- "#ProjectName" for specific projects
- "@LabelName" for specific labels

Your filter was: "${context.filter || 'none'}"

Visit https://www.todoist.com/help/articles/introduction-to-filters-V98wIH for filter examples.`;
  } else if (context.task_name) {
    message += `Tip: The task "${context.task_name}" could not be found or the update parameters are invalid.
- Check that the task name exists
- Verify that any IDs (project_id, section_id, etc.) are valid
- Ensure label names don't contain special characters`;
  } else {
    message += `Tip: Check your parameters:
- Ensure all IDs are valid numbers or strings
- Verify that project and section IDs exist
- Check that label names are properly formatted`;
  }
  
  return message;
}

/**
 * Builds context-specific message for 404 Not Found errors
 */
function buildNotFoundMessage(statusText: string, context: ErrorContext): string {
  let message = `Resource not found: ${statusText}\n\n`;
  
  if (context.project_id) {
    message += `The project_id "${context.project_id}" does not exist or you don't have access to it.
Use "Get my projects" to see available project IDs.`;
  } else if (context.task_name) {
    message += `The task "${context.task_name}" could not be found.
- Check the task name spelling
- Ensure the task hasn't been deleted
- Try searching with partial task name`;
  } else {
    message += `The requested resource could not be found.
- Verify that all IDs are correct
- Check that you have access to the resource
- Use the appropriate "get" command to list available resources`;
  }
  
  return message;
} 
