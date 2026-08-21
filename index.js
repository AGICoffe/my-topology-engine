import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const WORKER_URL = process.env.WORKER_URL || "https://my-topology-engine.my-agent-api.workers.dev";

const server = new Server(
  { name: "my-topology-engine", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// MCPツールの定義
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "execute_topology_engine",
        description: "Executes a 10-step deterministic problem-solving topology engine to process tasks and generate state-transition snapshots.",
        inputSchema: {
          type: "object",
          properties: {
            task_description: { 
              type: "string", 
              description: "The primary task or problem to be solved." 
            },
            filled_template: { 
              type: "object", 
              description: "Optional key-value parameters to constrain or guide the 10-step execution." 
            }
          },
          required: ["task_description"]
        }
      }
    ]
  };
});

// ツールの実行処理（Cloudflare Workerへの転送）
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "execute_topology_engine") {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args)
    });

    const data = await res.json();
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
    };
  }

  throw new Error(`Tool not found: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
