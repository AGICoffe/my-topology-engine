# Topology-Based AI Agent Engine (MCP Server)

A Model Context Protocol (MCP) server that provides a deterministic, topology-based workflow engine for AI Agents. Instead of relying on open-ended, unpredictable persona prompting, this server interfaces with Cloudflare Workers to execute 10-step state transition pipelines at the edge, returning structured progress snapshots and iteration templates to the client.

## Overview

This MCP server acts as a bridge between AI clients (such as Claude Desktop, Cursor, or Glama) and an edge-computed topology execution engine running on Cloudflare Workers. 

It allows an AI agent to map (analogize) human intent into a fixed, 10-step state transition pipeline. It delivers 10 output snapshots simultaneously alongside an adaptive JSON fill-in-the-blank template for the next iteration.

## Key Features & Capabilities

- **Protocol Compliance**: Implemented using the official Model Context Protocol (`@modelcontextprotocol/sdk`).
- **Deterministic Topology**: Executes fixed problem-solving steps at Cloudflare Edge, eliminating hallucinatory loops and reducing GPU/token consumption.
- **Human-in-the-Loop (Snapshot UX)**: Returns 10 intermediate progress snapshots at once, allowing users to inspect the timeline and roll back seamlessly.
- **Adaptive Prompt Template**: Appends an adaptive JSON schema at the end of output for smooth human-AI collaborative prompt refinement.

---

## MCP Tools Provided

This server exposes the following MCP Tools to connected AI clients:

### 1. `run_topology_pipeline`
Executes a 10-step deterministic topology pipeline on Cloudflare Workers and returns 10 state transition snapshots along with a JSON iteration template.

- **Input Schema (`inputSchema`)**:
  - `task_description` (string, required): The task or user intent to be processed through the topology.
  - `filled_template` (object, optional): A JSON object containing parameters or fill-in-the-blank values provided by the human or inferred by the agent.

- **Behavior & Agent Prompt Instructions**:
  1. The AI Agent maps the user's high-level request to the engine's fixed topology steps.
  2. The server calls the Cloudflare Workers API to execute state transitions.
  3. Returns a structured JSON payload containing 10 snapshots and an `appendix_template`.
  4. The AI Agent translates the `appendix_template` into natural conversation to help the human refine inputs for subsequent runs.

---

## Architecture & Communication Flow

[Human / AI Client (Claude, Cursor, Glama)]
│
│ MCP Protocol (Stdio)
▼
[This MCP Server (Node.js Container)]
│
│ HTTP POST (Edge REST API)
▼
[Cloudflare Workers Engine]
└─ Runs 10-step State Machine Topology & Returns Snapshots

---

## Environment Variables

- `WORKER_URL`: The URL of your Cloudflare Worker endpoint (e.g., `https://my-topology-engine.my-agent-api.workers.dev`).

## Getting Started

### Local Running via Docker

```bash
# Build the Docker image
docker build -t mcp-topology-server .

# Run the MCP container
docker run -i --rm -e WORKER_URL="[https://my-topology-engine.my-agent-api.workers.dev](https://my-topology-engine.my-agent-api.workers.dev)" mcp-topology-server
Installation in Claude Desktop / MCP Clients
Add the following configuration to your claude_desktop_config.json:
{
  "mcpServers": {
    "topology-engine": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "WORKER_URL=[https://your-worker.workers.dev](https://your-worker.workers.dev)",
        "mcp-topology-server"
      ]
    }
  }
}
