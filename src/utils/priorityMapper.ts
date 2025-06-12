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
 * Valid numeric priority values for Todoist API (1-4)
 */
export type TodoistPriority = 1 | 2 | 3 | 4;

/**
 * Mapping from various priority notations to Todoist API priority values
 * Supports P1-P4 notation and word-based priorities
 */
const PRIORITY_MAP: Record<string, TodoistPriority> = {
    // P1-P4 notation
    'P1': 4, // Urgent
    'P2': 3, // High
    'P3': 2, // Medium  
    'P4': 1, // Normal

    // Word-based priorities
    'URGENT': 4,
    'HIGH': 3,
    'MEDIUM': 2,
    'NORMAL': 1,
    'LOW': 1,
};

/**
 * Maps priority input to the correct Todoist API priority value
 * 
 * Accepts string input in multiple formats:
 * - Numeric strings: "1"-"4" 
 * - P-notation: "P1"-"P4" (P1=urgent, P4=normal)
 * - Word-based: "urgent", "high", "medium", "normal", "low"
 * 
 * @param priority Priority value as string in any supported format
 * @returns Numeric priority value for Todoist API (1-4 where 1=lowest, 4=highest)
 * @throws Error if priority value is invalid
 */
export function mapPriority(priority: string): TodoistPriority {
    const trimmed = priority.trim();

    // Check if it's a numeric string
    const numValue = parseInt(trimmed, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 4) {
        return numValue as TodoistPriority;
    }

    // Check if it's P1-P4 notation or word-based priority
    const normalizedPriority = trimmed.toUpperCase();
    if (normalizedPriority in PRIORITY_MAP) {
        return PRIORITY_MAP[normalizedPriority];
    }

    throw new Error(`Invalid priority string: ${priority}. Must be P1-P4, urgent/high/medium/normal/low, or numeric string 1-4.`);
}

/**
 * Validates if a priority input is valid without converting it
 * 
 * @param priority Priority value to validate
 * @returns True if the priority is valid, false otherwise
 */
export function isValidPriority(priority: string): priority is string {
    try {
        const trimmed = priority.trim();

        // Check numeric string
        const numValue = parseInt(trimmed, 10);
        if (!isNaN(numValue) && numValue >= 1 && numValue <= 4) {
            return true;
        }

        // Check P1-P4 notation or word-based
        const normalized = trimmed.toUpperCase();
        return normalized in PRIORITY_MAP;
    } catch {
        return false;
    }
} 
