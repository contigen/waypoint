type WebMCPToolContent = {
  type: "text" | "json";
  text?: string;
  json?: unknown;
};

type WebMCPToolResult = {
  content: WebMCPToolContent[];
};

type WebMCPToolAnnotations = {
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
};

type WebMCPToolDefinition = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: WebMCPToolAnnotations;
  execute: (args: Record<string, unknown>) => Promise<WebMCPToolResult | unknown>;
};

type WebMCPRegisteredTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: WebMCPToolAnnotations;
};

type ModelContext = {
  registerTool(tool: WebMCPToolDefinition): Promise<void> | void;
  getTools?(): Promise<WebMCPRegisteredTool[]> | WebMCPRegisteredTool[];
  executeTool?(tool: WebMCPRegisteredTool, argsJson: string): Promise<string>;
};

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
  interface Navigator {
    modelContext?: ModelContext;
  }
}

export type {
  WebMCPToolContent,
  WebMCPToolResult,
  WebMCPToolAnnotations,
  WebMCPToolDefinition,
  WebMCPRegisteredTool,
  ModelContext,
};
