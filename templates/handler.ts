import {
  [ProcessName]Schema,
  type [ProcessName]Input
} from './schema';

export interface ProcessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ProcessError {
  success: false;
  error: string;
}

export type ProcessResult<T = unknown> =
  | ProcessResponse<T>
  | ProcessError;

/**
 * Shared business-process handler.
 *
 * This is an instructional scaffold.
 *
 * The AI agent MUST replace the business-logic section with the
 * target application's real operation using existing services,
 * repositories, APIs, mutations, or state-management conventions.
 *
 * The handler is shared by:
 * - the human-facing component;
 * - the WebMCP tool.
 */
export async function executeProcessAction(
  input: unknown,
  signal?: AbortSignal
): Promise<ProcessResult> {
  const parsed = [ProcessName]Schema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.message
    };
  }

  const data: [ProcessName]Input = parsed.data;

  if (signal?.aborted) {
    throw new DOMException(
      'The operation was aborted.',
      'AbortError'
    );
  }

  try {
    /*
     * TODO(agent):
     *
     * Implement the actual business process here.
     *
     * Use the target application's existing:
     * - service layer;
     * - API client;
     * - server action;
     * - repository;
     * - state management;
     * - authentication;
     * - authorization;
     * - error conventions.
     *
     * Do NOT add demo behavior or fallback behavior.
     */

    throw new Error(
      '[ProcessName] business logic has not been implemented.'
    );
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === 'AbortError'
    ) {
      throw error;
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Process execution failed.'
    };
  }
}
