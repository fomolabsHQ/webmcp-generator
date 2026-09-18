import * as z from 'zod';

/**
 * WebMCP Process Schema — instructional scaffold.
 *
 * The AI agent MUST replace this scaffold with the actual schema
 * required by the requested business process.
 *
 * Rules:
 * - Define exactly one authoritative Zod schema.
 * - Do not maintain a second manually-authored JSON Schema.
 * - Use the target application's existing Zod conventions when present.
 * - Add metadata that helps the generated JSON Schema describe fields
 *   accurately to AI agents.
 */

// TODO(agent): Replace with the actual process name.
export const [ProcessName]Schema = z.object({
  // TODO(agent): Define the actual business-process inputs.
});

export type [ProcessName]Input = z.infer<typeof [ProcessName]Schema>;

/**
 * Derive the WebMCP input schema from the authoritative Zod schema.
 *
 * Do not manually duplicate properties or required fields here.
 */
export const [ProcessName]JsonSchema = z.toJSONSchema(
  [ProcessName]Schema,
  {
    target: 'draft-2020-12'
  }
);
