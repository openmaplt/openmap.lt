import "server-only";

type ToolResult = {
  content?: { type: string; text?: string }[];
  isError?: boolean;
};

// Short, single-line preview of what a tool returned (the full JSON can be
// many KB). Counts `results` when the payload has that shape.
function summarize(result: ToolResult) {
  const raw = result.content?.[0]?.text ?? "";
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.results)) {
      return `${parsed.results.length} results`;
    }
  } catch {
    // not JSON — fall through to the raw preview
  }
  return raw.length > 120 ? `${raw.slice(0, 120)}…` : raw;
}

// Logs the JSON-RPC call (method + tool name + arguments) BEFORE the SDK
// validates it, so calls rejected for bad arguments still show up. Clones the
// request so the handler can still read the body.
export async function logMcpRequest(request: Request) {
  if (request.method !== "POST") return;
  try {
    const body = await request.clone().json();
    for (const msg of Array.isArray(body) ? body : [body]) {
      if (msg?.method === "tools/call") {
        console.log(
          `[mcp] → ${msg.params?.name} ${JSON.stringify(msg.params?.arguments)}`,
        );
      } else if (msg?.method) {
        console.log(`[mcp] → ${msg.method}`);
      }
    }
  } catch {
    console.log("[mcp] → (unparseable body)");
  }
}

// Wraps `server.registerTool` so every handler logs its duration and a result
// summary. Must run before the tools are registered.
export function logToolResults(server: {
  registerTool: (...args: never[]) => unknown;
}) {
  const original = server.registerTool.bind(server) as (
    ...args: unknown[]
  ) => unknown;
  server.registerTool = ((
    name: string,
    config: unknown,
    handler: (...args: unknown[]) => Promise<ToolResult>,
  ) =>
    original(name, config, async (...args: unknown[]) => {
      const start = Date.now();
      try {
        const result = await handler(...args);
        console.log(
          `[mcp] ← ${name} ${result.isError ? "ERROR " : ""}${summarize(result)} (${Date.now() - start}ms)`,
        );
        return result;
      } catch (error) {
        console.error(`[mcp] ✗ ${name} threw (${Date.now() - start}ms)`, error);
        throw error;
      }
    })) as never;
}
