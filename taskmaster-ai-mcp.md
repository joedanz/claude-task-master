# Taskmaster AI MCP Server Configuration

## Overview

Taskmaster AI is a powerful Model Context Protocol (MCP) server that provides task management and AI-powered development workflow tools for Cursor IDE and other MCP-compatible applications.

## Features

- **Task Management**: Create, update, and track development tasks
- **AI-Powered Analysis**: Analyze project complexity and generate task breakdowns
- **Dependency Management**: Handle task dependencies and relationships
- **PRD Parsing**: Parse Product Requirements Documents to generate initial tasks
- **Multiple AI Providers**: Support for various AI models including Anthropic, OpenAI, Google, and more

## Installation & Setup

### Prerequisites

- Node.js (version 18 or higher)
- Cursor IDE or other MCP-compatible application
- API keys for desired AI providers

### Quick Setup

1. **Install via NPX (Recommended)**:
   ```bash
   npx -y --package=task-master-ai task-master-ai
   ```

2. **Add to Cursor Configuration**:
   
   Open your Cursor MCP configuration file:
   - **macOS/Linux**: `~/.cursor/mcp.json`
   - **Windows**: `%USERPROFILE%\.cursor\mcp.json`

   Add the following configuration:

   ```json
   {
     "mcpServers": {
       "task-master-ai": {
         "command": "npx",
         "args": ["-y", "--package=task-master-ai", "task-master-ai"],
         "env": {
           "ANTHROPIC_API_KEY": "YOUR_ANTHROPIC_API_KEY_HERE",
           "PERPLEXITY_API_KEY": "YOUR_PERPLEXITY_API_KEY_HERE",
           "OPENAI_API_KEY": "YOUR_OPENAI_KEY_HERE",
           "GOOGLE_API_KEY": "YOUR_GOOGLE_KEY_HERE",
           "MISTRAL_API_KEY": "YOUR_MISTRAL_KEY_HERE",
           "GROQ_API_KEY": "YOUR_GROQ_KEY_HERE",
           "OPENROUTER_API_KEY": "YOUR_OPENROUTER_KEY_HERE",
           "XAI_API_KEY": "YOUR_XAI_KEY_HERE",
           "AZURE_OPENAI_API_KEY": "YOUR_AZURE_KEY_HERE",
           "OLLAMA_API_KEY": "YOUR_OLLAMA_API_KEY_HERE"
         },
         "type": "stdio"
       }
     }
   }
   ```

3. **Restart Cursor**: Close and reopen Cursor to load the new MCP server configuration.

## Environment Variables

Configure the following environment variables based on your preferred AI providers:

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | Optional |
| `PERPLEXITY_API_KEY` | Perplexity AI API key | Optional |
| `OPENAI_API_KEY` | OpenAI API key | Optional |
| `GOOGLE_API_KEY` | Google AI API key | Optional |
| `MISTRAL_API_KEY` | Mistral AI API key | Optional |
| `GROQ_API_KEY` | Groq API key | Optional |
| `OPENROUTER_API_KEY` | OpenRouter API key | Optional |
| `XAI_API_KEY` | xAI API key | Optional |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | Optional |
| `OLLAMA_API_KEY` | Ollama API key | Optional |

**Note**: You only need to provide API keys for the AI providers you plan to use.

## Available MCP Tools

Once configured, Taskmaster AI provides the following tools in Cursor:

### Project Management
- `initialize_project` - Set up Taskmaster in a new project
- `parse_prd` - Parse Product Requirements Documents to generate tasks
- `models` - Configure AI models for different operations

### Task Operations
- `get_tasks` - List all tasks with optional filtering
- `get_task` - Get detailed information about a specific task
- `next_task` - Find the next available task to work on
- `add_task` - Create new tasks with AI assistance
- `update_task` - Update specific tasks with new information
- `set_task_status` - Change task status (pending, in-progress, done, etc.)
- `remove_task` - Delete tasks from the project

### Task Structure & Analysis
- `expand_task` - Break down complex tasks into subtasks
- `expand_all` - Expand multiple tasks simultaneously
- `analyze_project_complexity` - Analyze task complexity for better planning
- `complexity_report` - View complexity analysis results

### Subtask Management
- `add_subtask` - Add subtasks to existing tasks
- `update_subtask` - Update subtask details and progress
- `clear_subtasks` - Remove all subtasks from a task
- `remove_subtask` - Remove specific subtasks

### Dependency Management
- `add_dependency` - Create task dependencies
- `remove_dependency` - Remove task dependencies
- `validate_dependencies` - Check for dependency issues
- `fix_dependencies` - Automatically fix dependency problems

### File Operations
- `generate` - Generate markdown files for tasks

## Usage Examples

### Basic Workflow

1. **Initialize a new project**:
   ```
   Ask Cursor: "Initialize Taskmaster for this project"
   ```

2. **Parse a PRD**:
   ```
   Ask Cursor: "Parse my PRD file to generate initial tasks"
   ```

3. **View tasks**:
   ```
   Ask Cursor: "Show me all pending tasks"
   ```

4. **Get next task**:
   ```
   Ask Cursor: "What's the next task I should work on?"
   ```

5. **Break down complex tasks**:
   ```
   Ask Cursor: "Expand task 5 into subtasks"
   ```

6. **Update task status**:
   ```
   Ask Cursor: "Mark task 3 as completed"
   ```

### Advanced Features

- **Research-backed operations**: Many tools support a `--research` flag for more informed AI responses
- **Complexity analysis**: Automatically analyze which tasks need breakdown
- **Dependency validation**: Ensure proper task ordering and relationships
- **Multi-model support**: Configure different AI models for different operations

## Configuration Management

Taskmaster uses a `.taskmasterconfig` file in your project root for configuration. Use the `models` tool to:

- View current AI model configuration
- Set different models for main, research, and fallback operations
- Configure custom Ollama or OpenRouter models
- Manage API endpoints and parameters

## Best Practices

1. **Start with PRD parsing** for new projects to get comprehensive task breakdown
2. **Use complexity analysis** before expanding tasks to identify which need attention
3. **Maintain dependency relationships** to ensure proper task ordering
4. **Regular status updates** to track progress and unlock dependent tasks
5. **Leverage research mode** for more informed AI responses when needed

## Troubleshooting

### Common Issues

1. **MCP server not appearing**: Ensure Cursor is restarted after configuration
2. **API key errors**: Verify environment variables are set correctly
3. **Tool failures**: Check that required API keys are provided for AI operations
4. **Configuration issues**: Use the `models` tool to verify and update settings

### Debug Steps

1. Check Cursor's MCP server status in settings
2. Verify API keys are correctly formatted
3. Test with a simple tool like `get_tasks` first
4. Review Cursor's developer console for error messages

## Integration with Development Workflow

Taskmaster AI integrates seamlessly with your development process:

- **Planning Phase**: Use PRD parsing and complexity analysis
- **Development Phase**: Track progress with task status updates
- **Review Phase**: Use dependency validation and task updates
- **Iteration Phase**: Expand tasks and add new requirements as needed

## Support & Resources

- **Documentation**: Comprehensive guides available in the package
- **Community**: Active development and user community
- **Updates**: Regular updates with new features and improvements

This configuration enables powerful task-driven development workflows directly within Cursor, leveraging AI to help manage complex projects efficiently.