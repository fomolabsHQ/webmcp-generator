import { useEffect } from 'react';
import { executeProcessAction } from './handler';
import { QuoteRequestJsonSchema } from './schema';

export function useWebMCPTool() {
  useEffect(() => {
    const registrationController = new AbortController();

    async function register() {
      const modelContext = (document as unknown as { modelContext?: { registerTool: Function } }).modelContext;
      if (!modelContext) {
        throw new Error('WebMCP modelContext is not available in this runtime.');
      }

      await modelContext.registerTool(
        {
          name: 'request_customer_quote',
          description: 'Submit a customer quote request for a specified service, contact email, and quantity.',
          inputSchema: QuoteRequestJsonSchema,
          annotations: {
            readOnlyHint: false,
            consequentialHint: true,
            untrustedContentHint: false
          },
          execute: async (input: unknown, { signal }: { signal: AbortSignal }) => {
            return executeProcessAction(input, signal);
          }
        },
        {
          signal: registrationController.signal
        }
      );
    }

    void register();

    return () => {
      registrationController.abort();
    };
  }, []);
}
