# Todoist MCP Server

An MCP (Model Context Protocol) server implementation that integrates Claude with Todoist, enabling natural language task management. This server allows Claude to interact with your Todoist tasks using everyday language.

## Features

* **Natural Language Task Management**: Create, update, complete, and delete tasks using everyday language
* **Project Management**: Retrieve project information and assign tasks to specific projects
* **Smart Task Search**: Find tasks using partial name matches
* **Flexible Filtering**: Filter tasks by due date, deadline, priority, project, and other attributes
* **Rich Task Details**: Support for descriptions, due dates, deadlines, priority levels, and labels
* **Deadline Support**: Set and update deadlines for tasks, in addition to due dates
* **Intuitive Error Handling**: Clear feedback for better user experience

> **Note:** Deadlines are now supported. You can set both due dates and deadlines for tasks.

## How to Add to Claude, Cursor, or Any AI Client Supporting MCPs

To use this server with Claude, Cursor, or any AI client that supports MCPs, configure your tool's MCP settings as follows:

```json
{
  "mcpServers": {
    "todoist": {
      "command": "npx",
      "args": ["-y", "@keyboardcowboy/todoist-mcp-server"],
      "env": {
          "TODOIST_API_TOKEN": "YOUR_API_TOKEN"
      }
    }
  }
}
```

- Replace `YOUR_API_TOKEN` with your Todoist API token (see below).

## How to Run Locally

*Ensure you have the latest version of `node` installed.*

1. Clone the repository:
   ```bash
   git clone git@github.com:KeyboardCowboy/todoist-mcp-server.git
   ```
2. Navigate to the project directory:
   ```bash
   cd todoist-mcp-server
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the project:
   ```bash
   npm run build
   ```
5. Set your Todoist API token as an environment variable:
   - Get your API token by logging into Todoist, going to Settings → Integrations, and copying the token under "Developer".
   - You can set it in your shell or in the MCP config as shown above.
6. Start the server as described in the MCP configuration above.

---

## Tools

### todoist_get_projects
Retrieve all projects with their IDs and names:
* Optional: limit (number of projects to return)
* Returns formatted list of projects with IDs for use in other tools
* Example: "Get all my projects" or "List my first 10 projects"
* Recommended to store these where your agent can look up the ID for creating tasks

### todoist_create_task
Create new tasks with various attributes:
* Required: content (task title)
* Optional: description, due date, deadline_date, priority level (1-4), project_id, labels
* Example: "Create task 'Team Meeting' in project 'Work' with label 'urgent' due tomorrow"

### todoist_get_tasks
Retrieve and filter tasks:
* Filter by due date, priority, or project
* Natural language date filtering
* Optional result limit
* Example: "Show high priority tasks due this week"

### todoist_update_task
Update existing tasks using natural language search:
* Find tasks by partial name match
* Update any task attribute (content, description, due date, deadline_date, priority)
* Example: "Update meeting task to be due next Monday"

### todoist_complete_task
Mark tasks as complete using natural language search:
* Find tasks by partial name match
* Confirm completion status
* Example: "Mark the documentation task as complete"

### todoist_delete_task
Remove tasks using natural language search:
* Find and delete tasks by name
* Confirmation messages
* Example: "Delete the PR review task"

## Setup

### Getting a Todoist API Token
1. Log in to your Todoist account
2. Navigate to Settings → Integrations
3. Find your API token under "Developer"

## Example Usage

### Getting Projects
```
"Show me all my projects"
"List my projects with their IDs"
"Get my first 5 projects"
```

### Creating Tasks
```
"Create task 'Team Meeting'"
"Add task 'Review PR' due tomorrow at 2pm"
"Create high priority task 'Fix bug' with description 'Critical performance issue'"
"Create task 'Design Review' in project 'Work' with labels 'urgent' and 'review'"
"Create task 'Submit report' with deadline 2024-07-01"
```

### Getting Tasks
```
"Show all my tasks"
"List tasks due today"
"Get high priority tasks"
"Show tasks due this week"
```

### Updating Tasks
```
"Update documentation task to be due next week"
"Change priority of bug fix task to urgent"
"Add description to team meeting task"
"Update 'Review PR' to have a deadline next Friday"
```

### Completing Tasks
```
"Mark the PR review task as complete"
"Complete the documentation task"
```

### Deleting Tasks
```
"Delete the PR review task"
"Remove meeting prep task"
```

## Contributing
Contributions are welcome! Feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Issues and Support
If you encounter any issues or need support, please file an issue on the [GitHub repository](https://github.com/abhiz123/todoist-mcp-server/issues).
