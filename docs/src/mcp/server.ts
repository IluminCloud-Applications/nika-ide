import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { getTasks, updateTaskStatus, getProject, getProjects, getProjectByPath, updateTaskObservation, updateTaskTerminalSlug } from '../db/queries';

export class TaskMeMCPServer {
  private server: Server;
  private hasFetchedTask: boolean = false;

  constructor() {
    this.server = new Server(
      { name: "taskme-mcp", version: "1.0.0" },
      { capabilities: { tools: {} } }
    );

    // Prevent server-level errors from crashing the process
    this.server.onerror = (error) => {
      console.error("[MCP Server Error]", error);
    };

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "list_projects",
            description: "Lists all registered projects with their ID, name and path. Use this FIRST to find the project that matches your current working directory, then use get_task with the project_id.",
            inputSchema: {
              type: "object",
              properties: {},
              required: []
            }
          },
          {
            name: "get_task",
            description: "Gets the current task to work on for a specific project. Prioritizes 'implementing' tasks with a disclaimer, then 'rejected' tasks to fix, then 'pending' tasks. You MUST provide either project_id (preferred) or project_path so that only tasks from the correct project are returned. ALWAYS read the INSTRUCTIONS FOR AI at the end of the response.",
            inputSchema: {
              type: "object",
              properties: {
                project_id: {
                  type: "number",
                  description: "The ID of the project to get tasks from. Get this from list_projects first."
                },
                project_path: {
                  type: "string",
                  description: "Absolute path of the project directory. Used to auto-detect the project if project_id is not known."
                }
              },
              required: []
            }
          },
          {
            name: "update_task",
            description: "Updates the status of a task. CRITICAL INSTRUCTION: You MUST update the task status to 'implementing' immediately after fetching a new pending or rejected task and BEFORE starting work. Once your work is completely finished and verified, update the status to 'testing' so it can be reviewed.",
            inputSchema: {
              type: "object",
              properties: {
                taskId: {
                  type: "number",
                  description: "The ID of the task to update."
                },
                status: {
                  type: "string",
                  enum: ["implementing", "testing"],
                  description: "The new status of the task. 'implementing' when you start, and 'testing' when you finish."
                }
              },
              required: ["taskId", "status"]
            }
          },
          {
            name: "add_task_observation",
            description: "Adds an AI observation/note to a specific task. Use this to leave important notes, context, or thoughts about the implementation for the user to read.",
            inputSchema: {
              type: "object",
              properties: {
                taskId: {
                  type: "number",
                  description: "The ID of the task to add observation to."
                },
                observation: {
                  type: "string",
                  description: "The observation or note text."
                }
              },
              required: ["taskId", "observation"]
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
     try {
      // ── LIST PROJECTS ──────────────────────────────────────────────
      if (request.params.name === "list_projects") {
        const projects = await getProjects();

        if (projects.length === 0) {
          return {
            content: [{ type: "text", text: "No projects registered yet. Create a project in the TaskMe web UI first." }]
          };
        }

        const lines = projects.map(p =>
          `• [ID: ${p.id}] ${p.name}\n  Path: ${p.path}`
        ).join('\n\n');

        return {
          content: [{
            type: "text",
            text: `Registered projects:\n\n${lines}\n\nUse the matching project_id in get_task to filter tasks for your current project.`
          }]
        };
      }

      // ── GET TASK ───────────────────────────────────────────────────
      if (request.params.name === "get_task") {
        const args = (request.params.arguments ?? {}) as {
          project_id?: number;
          project_path?: string;
        };

        let projectId: number | undefined;
        let projectName: string = 'Unknown';

        // Resolve project from arguments
        if (args.project_id !== undefined) {
          const proj = await getProject(args.project_id);
          projectId = proj.id;
          projectName = proj.name;
        } else if (args.project_path) {
          const proj = await getProjectByPath(args.project_path);
          if (!proj) {
            return {
              content: [{
                type: "text",
                text: `No project found for path: "${args.project_path}".\nUse list_projects to see all registered projects and their paths.`
              }]
            };
          }
          projectId = proj.id;
          projectName = proj.name;
        } else {
          // No filter provided — instruct AI to use list_projects first
          return {
            content: [{
              type: "text",
              text: "You must provide either 'project_id' or 'project_path' to get tasks.\nCall list_projects first to find the correct project_id for your current directory."
            }]
          };
        }

        const allTasks = await getTasks(projectId);
        const projectInfo = await getProject(projectId);

        const mySlug = process.env.TASKME_TERMINAL_SLUG || '';
        const isFirstFetch = !this.hasFetchedTask;
        this.hasFetchedTask = true; // Mark as fetched

        const activeRouteSlug = mySlug ? `slug:${mySlug}` : 'any';

        // Filter eligible tasks for THIS terminal
        const tasks = allTasks.filter(t => {
          if (t.terminal_slug === activeRouteSlug) return true;
          if (t.terminal_slug === 'any' || !t.terminal_slug) return true;
          if (t.terminal_slug === 'new' && isFirstFetch) return true;
          return false;
        });

        // Priority 1: Implementing (resuming interrupted work)
        const implementingTask = tasks.find(t => t.status === 'implementing');
        if (implementingTask) {
          return {
            content: [{
              type: "text",
              text: [
                `Found a task currently 'implementing' — you may have been interrupted.`,
                `Disclaimer: If you already finished, use update_task to move it to 'testing'.`,
                ``,
                `Task ID: ${implementingTask.id}`,
                `Project: ${projectInfo.name}`,
                `Path: ${projectInfo.path}`,
                `Task Name: ${implementingTask.name}`,
                `Description:\n${implementingTask.description}`,
                ``,
                `=== INSTRUCTIONS FOR AI ===`,
                `1. Esta tarefa já está em 'implementing'. Continue o trabalho de onde parou.`,
                `2. Execute/finalize a tarefa descrita acima.`,
                `3. Quando terminar toda a implementação e testes locais, altere o status desta tarefa para 'testing' usando a tool update_task.`
              ].join('\n')
            }]
          };
        }

        // Priority 2: Rejected (fix bugs)
        const rejectedTask = tasks.find(t => t.status === 'rejected');
        if (rejectedTask) {
          return {
            content: [{
              type: "text",
              text: [
                `Found a REJECTED task that failed testing. Fix the errors and move it back to 'testing'.`,
                ``,
                `Task ID: ${rejectedTask.id}`,
                `Project: ${projectInfo.name}`,
                `Path: ${projectInfo.path}`,
                `Task Name: ${rejectedTask.name}`,
                `Description:\n${rejectedTask.description}`,
                ``,
                `=== ERROR LOGS / REASON FOR REJECTION ===`,
                rejectedTask.error_log || 'No logs provided.',
                ``,
                `=== INSTRUCTIONS FOR AI ===`,
                `1. Altere o status desta tarefa para 'implementing' IMEDIATAMENTE usando a tool update_task, ANTES de começar a consertar.`,
                `2. Analise os erros e corrija o problema descrito.`,
                `3. Quando terminar a correção e testar, altere o status para 'testing' usando a tool update_task.`
              ].join('\n')
            }]
          };
        }

        // Priority 3: Pending
        const pendingTask = tasks.find(t => t.status === 'pending');
        if (pendingTask) {
          return {
            content: [{
              type: "text",
              text: [
                `Next pending task:`,
                ``,
                `Task ID: ${pendingTask.id}`,
                `Project: ${projectInfo.name}`,
                `Path: ${projectInfo.path}`,
                `Task Name: ${pendingTask.name}`,
                `Description:\n${pendingTask.description}`,
                ``,
                `=== INSTRUCTIONS FOR AI ===`,
                `1. Altere o status desta tarefa para 'implementing' IMEDIATAMENTE usando a tool update_task, ANTES de começar a trabalhar.`,
                `2. Execute a tarefa descrita acima.`,
                `3. Quando terminar toda a implementação e testes locais, altere o status desta tarefa para 'testing' usando a tool update_task.`
              ].join('\n')
            }]
          };
        }

        // Se chegou aqui, não tem tarefas elegíveis.
        // Pode haver tarefas pendentes de OUTROS terminais.
        const otherPending = allTasks.filter(t => t.status === 'pending').length;
        let doneMsg = `No active tasks for project "${projectName}" (ID: ${projectId}) assigned to this terminal (slug: ${mySlug || 'any'}). All done! 🎉`;
        if (otherPending > 0) {
          doneMsg += `\n(There are ${otherPending} pending tasks assigned to other terminals).`;
        }

        return {
          content: [{
            type: "text",
            text: doneMsg
          }]
        };
      }

      // ── UPDATE TASK ────────────────────────────────────────────────
      if (request.params.name === "update_task") {
        const { taskId, status } = request.params.arguments as any;
        const validStatuses = ["implementing", "testing"];
        if (!validStatuses.includes(status)) {
          throw new Error(`Invalid status '${status}'. AI is only allowed to use 'implementing' (when starting) and 'testing' (when finished). 'pending', 'completed', and 'rejected' are managed by the user manually or via get_task.`);
        }
        await updateTaskStatus(taskId, status);

        // Claim ownership of the task if starting it
        if (status === 'implementing') {
          const mySlug = process.env.TASKME_TERMINAL_SLUG || '';
          const activeRouteSlug = mySlug ? `slug:${mySlug}` : 'any';
          await updateTaskTerminalSlug(taskId, activeRouteSlug);
        }

        let responseText = `Task ${taskId} successfully updated to status: ${status}`;
        
        if (status === 'testing') {
          responseText += `\n\n=== INSTRUCTIONS FOR AI ===\nAgora que você finalizou esta tarefa (status 'testing'), chame a tool 'get_task' para obter a próxima tarefa.\nSe houver uma nova tarefa, inicie-a mudando o status para 'implementing'. Se não houver mais tarefas, você terminou.`;
        }

        return {
          content: [{
            type: "text",
            text: responseText
          }]
        };
      }

      // ── ADD OBSERVATION ───────────────────────────────────────────
      if (request.params.name === "add_task_observation") {
        const { taskId, observation } = request.params.arguments as any;
        await updateTaskObservation(taskId, observation);
        return {
          content: [{
            type: "text",
            text: `Observation successfully added to Task ${taskId}.`
          }]
        };
      }

      throw new Error("Unknown tool");
     } catch (error: any) {
        console.error(`[MCP Tool Error] ${request.params.name}:`, error);
        return {
          content: [{
            type: "text" as const,
            text: `Error executing tool '${request.params.name}': ${error.message}`
          }],
          isError: true
        };
      }
    });
  }

  public async start() {
    // Prevent the process from dying on uncaught errors
    process.on('uncaughtException', (err) => {
      console.error('[MCP uncaughtException]', err);
    });
    process.on('unhandledRejection', (reason) => {
      console.error('[MCP unhandledRejection]', reason);
    });

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("TaskMe MCP Server running on stdio");
  }
}
