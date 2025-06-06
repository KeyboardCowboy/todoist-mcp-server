/**
 * @fileoverview Priority mapping utility for Todoist MCP server
 * 
 * This utility handles the conversion between user-friendly P1-P4 priority notation
 * and the Todoist API's numeric priority system, following the formatting rules:
 * - P1 = Urgent (API priority 4)
 * - P2 = High (API priority 3)  
 * - P3 = Medium (API priority 2)
 * - P4 = Normal (API priority 1)
 */

/**
 * Valid priority input types - can be numeric API values or P1-P4 strings
 */
export type PriorityInput = number | string;

/**
 * Valid numeric priority values for Todoist API (1-4)
 */
export type TodoistPriority = 1 | 2 | 3 | 4;

/**
 * Mapping from P1-P4 notation to Todoist API priority values
 */
const PRIORITY_MAP: Record<string, TodoistPriority> = {
  'P1': 4, // Urgent
  'P2': 3, // High
  'P3': 2, // Medium  
  'P4': 1, // Normal
};

/**
 * Maps priority input to the correct Todoist API priority value
 * 
 * Accepts both numeric values (1-4) and P1-P4 string notation.
 * P1-P4 strings are mapped according to the formatting rules where
 * P1 represents the highest priority (urgent) and P4 the lowest (normal).
 * 
 * @param priority Priority value as number (1-4) or string (P1-P4)
 * @returns Numeric priority value for Todoist API (1-4)
 * @throws Error if priority value is invalid
 */
export function mapPriority(priority: PriorityInput): TodoistPriority {
  // Handle numeric input
  if (typeof priority === 'number') {
    if (priority >= 1 && priority <= 4) {
      return priority as TodoistPriority;
    }
    throw new Error(`Invalid numeric priority: ${priority}. Must be 1-4.`);
  }
  
  // Handle string input
  if (typeof priority === 'string') {
    const normalizedPriority = priority.toUpperCase().trim();
    if (normalizedPriority in PRIORITY_MAP) {
      return PRIORITY_MAP[normalizedPriority];
    }
    throw new Error(`Invalid priority string: ${priority}. Must be P1, P2, P3, or P4.`);
  }
  
  throw new Error(`Invalid priority type: ${typeof priority}. Must be number (1-4) or string (P1-P4).`);
}

/**
 * Validates if a priority input is valid without converting it
 * 
 * @param priority Priority value to validate
 * @returns True if the priority is valid, false otherwise
 */
export function isValidPriority(priority: unknown): priority is PriorityInput {
  try {
    if (typeof priority === 'number') {
      return priority >= 1 && priority <= 4;
    }
    if (typeof priority === 'string') {
      const normalized = priority.toUpperCase().trim();
      return normalized in PRIORITY_MAP;
    }
    return false;
  } catch {
    return false;
  }
} 
