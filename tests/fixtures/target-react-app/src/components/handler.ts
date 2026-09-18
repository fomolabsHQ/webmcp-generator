import { QuoteRequestSchema, type QuoteRequestInput } from './schema';

export interface ProcessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ProcessError {
  success: false;
  error: string;
}

export type ProcessResult<T = unknown> = ProcessResponse<T> | ProcessError;

// Target app deterministic in-memory store for test verification
export const quotesStore: QuoteRequestInput[] = [];

export async function executeProcessAction(
  input: unknown,
  signal?: AbortSignal
): Promise<ProcessResult<QuoteRequestInput>> {
  const parsed = QuoteRequestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.message
    };
  }

  if (signal?.aborted) {
    throw new DOMException('The operation was aborted.', 'AbortError');
  }

  try {
    quotesStore.push(parsed.data);
    return {
      success: true,
      data: parsed.data
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Process execution failed.'
    };
  }
}
