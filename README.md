# Todoist MCP Server

An MCP (Model Context Protocol) server implementation that integrates Claude with Todoist, enabling natural language task management. This server allows Claude to interact with your Todoist tasks using everyday language.

<a href="https://glama.ai/mcp/servers/fhaif4fv1w">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/fhaif4fv1w/badge" alt="Todoist Server MCP server" />
</a>

## Features

* **Natural Language Task Management**: Create, update, complete, and delete tasks using everyday language
* **Project Management**: Retrieve project information and assign tasks to specific projects
* **Smart Task Search**: Find tasks using partial name matches
* **Flexible Filtering**: Filter tasks by due date, priority, project, and other attributes
* **Rich Task Details**: Support for descriptions, due dates, priority levels, and labels
* **Intuitive Error Handling**: Clear feedback for better user experience

## Installation

Forked from https://github.com/abhiz123/todoist-mcp-server

### To run locally
*Ensure you have the latest version of `node` installed.*

1. Check out the repo
2. `cd` into the root
3. run `npm run build`
4. Configure your tool's MCP settings like so:

```json
{
  "mcpServers": {
    "todoist": {
      "command": "node",
      "args": [
          "/path/to/repo/root"
      ],
      "env": {
          "TODOIST_API_TOKEN": "YOUR_API_TOKEN"
      }
    }
  }
}
```

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
* Optional: description, due date, priority level (1-4), project_id, labels
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
* Update any task attribute (content, description, due date, priority)
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

## Development

### Building from source
```bash
# Clone the repository
git clone https://github.com/abhiz123/todoist-mcp-server.git

# Navigate to directory
cd todoist-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

## Contributing
Contributions are welcome! Feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Issues and Support
If you encounter any issues or need support, please file an issue on the [GitHub repository](https://github.com/abhiz123/todoist-mcp-server/issues).
