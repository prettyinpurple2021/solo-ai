
import { z } from 'zod';
import { ToolRegistry, ToolType } from './schemas';

export interface ToolDefinition {
  name: string;
  description: string;
  schema: z.ZodObject<any>;
  handler?: (params: any) => Promise<any>;
}

export class AgentToolRegistry {
  private static instance: AgentToolRegistry;
  private tools: Map<string, ToolDefinition> = new Map();

  private constructor() {
    // Initialize with default tools from schemas
    Object.values(ToolRegistry).forEach(tool => {
      this.registerTool(tool);
    });
  }

  public static getInstance(): AgentToolRegistry {
    if (!AgentToolRegistry.instance) {
      AgentToolRegistry.instance = new AgentToolRegistry();
    }
    return AgentToolRegistry.instance;
  }

  public registerTool(definition: ToolDefinition) {
    this.tools.set(definition.name, definition);
  }

  public getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  public getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  public validateParams(toolName: string, params: any) {
    const tool = this.getTool(toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found in registry`);
    }
    return tool.schema.parse(params);
  }

  /**
   * Generates a tool description for the LLM system prompt
   */
  public getToolManifest(): string {
    let manifest = "AVAILABLE TOOLS:
";
    this.getAllTools().forEach(tool => {
      manifest += `- ${tool.name}: ${tool.description}. JSON Schema for parameters: ${JSON.stringify(this.zodToSchema(tool.schema))}
`;
    });
    return manifest;
  }

  /**
   * Helper to convert Zod schema to a simple JSON-friendly format for the LLM
   */
  private zodToSchema(schema: z.ZodObject<any>): any {
    const shape = schema.shape;
    const result: any = { type: 'object', properties: {}, required: [] };
    
    for (const [key, value] of Object.entries(shape)) {
      const isOptional = value instanceof z.ZodOptional || value instanceof z.ZodDefault;
      if (!isOptional) {
        result.required.push(key);
      }
      
      // Simplified type mapping
      let type = 'string';
      if (value instanceof z.ZodNumber) type = 'number';
      if (value instanceof z.ZodBoolean) type = 'boolean';
      if (value instanceof z.ZodArray) type = 'array';
      if (value instanceof z.ZodRecord) type = 'object';
      
      result.properties[key] = { type };
    }
    
    return result;
  }
}

export const toolRegistry = AgentToolRegistry.getInstance();
