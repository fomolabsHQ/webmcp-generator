import { useEffect } from 'react';

import { executeProcessAction } from './handler';
import { [ProcessName]JsonSchema } from './schema';

export function useWebMCPTool() {
  useEffect(() => {
    const registrationController = new AbortController();

    async function register() {
      if (!document.modelContext) {
        throw new Error(
          'WebMCP modelContext is not available in this runtime.'
        );
      }

      await document.modelContext.registerTool(
        {
          name: '[processName]',
          description:
            '[TODO(agent): describe exactly what this business process does and when an agent should use it.]',

          inputSchema: [ProcessName]JsonSchema,

          annotations: {
            // TODO(agent): Set according to the actual operation.
            readOnlyHint: false,
            consequentialHint: false,
            untrustedContentHint: false
          },

          execute: async (
            input: unknown,
            { signal }: { signal: AbortSignal }
          ) => {
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
