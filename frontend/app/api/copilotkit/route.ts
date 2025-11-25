import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { AgnoAgent } from "@ag-ui/agno"
import { NextRequest } from "next/server";
import OpenAI from "openai";

// Create agent instances (module level - shared across requests)
const chatAgent = new AgnoAgent({
    url: "http://localhost:7777/chat/agui",
    agentId: "ChatAgent",
    description: "General chat agent for conversations"
});

const searchAgent = new AgnoAgent({
    url: "http://localhost:7777/search/agui",
    agentId: "SearchAgent",
    description: "Search agent with web search capabilities"
});

console.log("Initializing CopilotKit runtime with agents:", {
    ChatAgent: chatAgent.agentId,
    SearchAgent: searchAgent.agentId
});

// Use OpenAIAdapter as serviceAdapter (required but not used for AG-UI agents)
// We need a dummy OpenAI client since serviceAdapter is required
const serviceAdapter = new OpenAIAdapter({
    openai: new OpenAI({ apiKey: "dummy-key" }),
    model: "gpt-4o"
});

console.log("Module initialized with agents:", {
    ChatAgent: chatAgent.agentId,
    SearchAgent: searchAgent.agentId
});

// 3. Build a Next.js API route that handles the CopilotKit runtime requests.
export const POST = async (req: NextRequest) => {
  const url = new URL(req.url);
  console.log("===== CopilotKit API Request =====");
  console.log("URL:", url.pathname + url.search);

  // Create a fresh runtime for EACH request to avoid state pollution
  const runtime = new CopilotRuntime({
    agents: {
      ChatAgent: chatAgent,
      SearchAgent: searchAgent,
    }
  });

  console.log("Fresh runtime created with agents:", Object.keys(runtime.agents));

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};