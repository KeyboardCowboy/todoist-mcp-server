interface FilterPatterns {
  priority: Record<string, string>;
  date: Record<string, string>;
  project: Record<string, string>;
  label: Record<string, string>;
  status: Record<string, string>;
  deadline: Record<string, string>;
}

const FILTER_PATTERNS: FilterPatterns = {
  priority: {
    'high priority': 'p1',
    'urgent tasks': 'p1',  // More specific match first
    'urgent': 'p1',
    'important': 'p1',
    'priority 1': 'p1',
    'p1': 'p1',
    
    'medium priority': 'p2',
    'normal priority': 'p2',
    'priority 2': 'p2',
    'p2': 'p2',
    
    'low priority': 'p3',
    'priority 3': 'p3',
    'p3': 'p3',
    
    'lowest priority': 'p4',
    'priority 4': 'p4',
    'p4': 'p4',
    
    'no priority': 'no priority'
  },
  
  date: {
    'today': 'today',
    'due today': 'today',
    'scheduled today': 'today',
    
    'tomorrow': 'tomorrow',
    'due tomorrow': 'tomorrow',
    'scheduled tomorrow': 'tomorrow',
    
    'this week': '7 days',
    'due this week': '7 days',
    'next 7 days': '7 days',
    
    'next week': '7 days & before: 14 days',
    'due next week': '7 days & before: 14 days',
    
    'overdue': 'overdue',
    'past due': 'overdue',
    'late': 'overdue',
    
    'no date': 'no date',
    'no due date': 'no date',
    'unscheduled': 'no date',
    
    'yesterday': 'yesterday',
    'due yesterday': 'yesterday'
  },
  
  project: {
    'work project': '#Work',
    'work': '#Work',
    'in work': '#Work',
    
    'personal project': '#Personal',
    'personal': '#Personal',
    'in personal': '#Personal',
    
    'inbox': '#Inbox',
    'in inbox': '#Inbox'
  },
  
  label: {
    'with urgent label': '@urgent',
    
    'waiting tasks': '@waiting_for',
    'waiting for': '@waiting_for',
    'blocked': '@waiting_for',
    
    'important tasks': '@important',
    'important': '@important',
    'with important label': '@important',
    
    'home tasks': '@home',
    'at home': '@home',
    
    'office tasks': '@office',
    'at office': '@office',
    'work location': '@office'
  },
  
  status: {
    'completed': 'completed',
    'done': 'completed',
    'finished': 'completed',
    
    'assigned to me': 'assigned by: others',
    'delegated': 'assigned by: me',
    'shared': 'shared'
  },
  deadline: {
    'has deadline': '!no deadline',
    'with deadline': '!no deadline',
    'deadline': '!no deadline',
    'no deadline': '!deadline',
    'without deadline': '!deadline',
    'deadline today': 'deadline: today',
    'deadline tomorrow': 'deadline: tomorrow',
    'deadline this week': 'deadline before: next week',
    'deadline next week': 'deadline after: this week & deadline before: 2 weeks',
    'deadline none': '!deadline',
    'deadline before': 'deadline before:',
    'deadline after': 'deadline after:',
    'deadline on': 'deadline:',
  },
};

/**
 * Converts natural language filter descriptions into proper Todoist filter syntax
 * 
 * @param input - Natural language description (e.g., "urgent tasks due today")
 * @param projects - Optional array of user's actual projects from cache
 * @returns Formatted Todoist filter syntax (e.g., "p1 & today")
 */
export function formatFilter(input: string): string {
  if (!input || typeof input !== 'string') {
    return input || '';
  }

  // Normalize input
  let normalized = input.toLowerCase().trim();
  
  // If it already looks like Todoist syntax (contains #, @, p1-p4, etc.), return as-is
  if (isAlreadyTodoistSyntax(normalized)) {
    return input.trim();
  }
  // If input already starts with 'search:', return as-is
  if (normalized.startsWith('search:')) {
    return input.trim();
  }

  // Track found patterns to combine with proper operators
  const foundPatterns: string[] = [];
  let workingText = normalized;
  
  // Sort patterns by length (longest first) to match more specific patterns first
  const allPatterns: Array<{phrase: string, syntax: string}> = [];
  Object.values(FILTER_PATTERNS).forEach(patternCategory => {
    Object.entries(patternCategory).forEach(([phrase, syntax]) => {
      allPatterns.push({phrase: phrase as string, syntax: syntax as string});
    });
  });
  
  // Special handling for deadline before/after/on with dates
  // e.g., "deadline before Sept 5 2025" => "deadline before: Sept 5 2025"
  const deadlineRegexes = [
    { regex: /deadline before ([\w\s,\-\/]+)/i, syntax: (date: string) => `deadline before: ${date.trim()}` },
    { regex: /deadline after ([\w\s,\-\/]+)/i, syntax: (date: string) => `deadline after: ${date.trim()}` },
    { regex: /deadline on ([\w\s,\-\/]+)/i, syntax: (date: string) => `deadline: ${date.trim()}` },
  ];
  deadlineRegexes.forEach(({regex, syntax}) => {
    const match = normalized.match(regex);
    if (match && match[1]) {
      foundPatterns.push(syntax(match[1]));
      workingText = workingText.replace(match[0], '').trim();
    }
  });
  
  // Sort by phrase length descending to match longer phrases first
  allPatterns.sort((a, b) => b.phrase.length - a.phrase.length);
  
  // Check each pattern
  allPatterns.forEach(({phrase, syntax}) => {
    if (workingText.includes(phrase)) {
      foundPatterns.push(syntax);
      // Remove the matched phrase to avoid double-matching
      workingText = workingText.replace(phrase, '').trim();
    }
  });

  // After extracting all known patterns, any remaining words are unmatched
  // Remove common stopwords and connector words (like 'and', 'tasks', etc.)
  const stopwords = ['and', 'or', 'tasks', 'task', 'that', 'are', 'is', 'with', 'the', 'a', 'an', 'to', 'for', 'of', 'by', 'in', 'on', 'at', 'as', 'from', 'mention'];
  let unmatchedWords = workingText
    .split(/\s+/)
    .filter(word => word && !stopwords.includes(word))
    .filter(word => word.length > 0)
    .join(' ')
    .trim();

  // If there are unmatched words, add them as a search: pattern (but don't double-wrap)
  if (unmatchedWords) {
    if (!unmatchedWords.startsWith('search:')) {
      foundPatterns.push(`search: ${unmatchedWords}`);
    } else {
      foundPatterns.push(unmatchedWords);
    }
  }

  // If no patterns found and not Todoist syntax, treat as plain text search
  if (foundPatterns.length === 0) {
    return `search: ${input.trim()}`;
  }

  // Remove duplicates and combine with & operator
  const uniquePatterns = [...new Set(foundPatterns)];
  return uniquePatterns.join(' & ');
}

/**
 * Checks if the input already appears to be in Todoist filter syntax
 */
function isAlreadyTodoistSyntax(input: string): boolean {
  // Look for strong Todoist syntax indicators that suggest it's already formatted
  const strongTodoistIndicators = [
    /#\w+/,        // Project names (#Work, #Personal)
    /@\w+/,        // Labels (@urgent, @home)
    /\bp[1-4]\b/,  // Priority (p1, p2, p3, p4)
    /&|\|/,        // Operators
    /\bassigned by:/,
    /\bbefore:/,
    /\bafter:/
  ];

  // Check for strong indicators first
  if (strongTodoistIndicators.some(pattern => pattern.test(input))) {
    return true;
  }

  // Only consider it Todoist syntax if it's ONLY date keywords (not mixed with other words)
  const dateOnlyPatterns = [
    /^\s*today\s*$/,
    /^\s*tomorrow\s*$/,
    /^\s*overdue\s*$/,
    /^\s*yesterday\s*$/,
    /^\s*no date\s*$/,
    /^\s*no priority\s*$/,
    /^\s*completed\s*$/
  ];

  return dateOnlyPatterns.some(pattern => pattern.test(input));
}

/**
 * Get examples of natural language inputs and their Todoist syntax outputs
 */
export function getFilterExamples(): Array<{input: string, output: string}> {
  return [
    { input: "urgent tasks due today", output: "p1 & today" },
    { input: "high priority work project", output: "p1 & #Work" },
    { input: "overdue tasks with no priority", output: "no priority & overdue" },
    { input: "personal tasks due this week", output: "7 days & #Personal" },
    { input: "waiting tasks in work", output: "@waiting_for & #Work" },
    { input: "important tasks due tomorrow", output: "@important & tomorrow" },
    { input: "no date low priority", output: "p3 & no date" },
    { input: "work urgent", output: "p1 & #Work" },
    { input: "tasks with deadline", output: "!no deadline" },
    { input: "no deadline", output: "!deadline" },
    { input: "deadline before Sept 5 2025", output: "deadline before: Sept 5 2025" },
    { input: "deadline after Jan 1 2024", output: "deadline after: Jan 1 2024" },
    { input: "deadline on March 10 2025", output: "deadline: March 10 2025" },
    { input: "deadline today", output: "deadline: today" },
    { input: "deadline this week", output: "deadline before: next week" },
    { input: "deadline next week", output: "deadline after: this week & deadline before: 2 weeks" },
  ];
} 
