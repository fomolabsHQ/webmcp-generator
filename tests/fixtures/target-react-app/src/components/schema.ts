// Authoritative process schema for customer quote fixture
export interface QuoteInput {
  service: string;
  email: string;
  quantity: number;
}

export const QuoteRequestSchema = {
  safeParse(input: unknown): { success: true; data: QuoteInput } | { success: false; error: { message: string } } {
    if (typeof input !== 'object' || input === null) {
      return { success: false, error: { message: 'Input must be an object' } };
    }
    const { service, email, quantity } = input as Record<string, unknown>;
    if (typeof service !== 'string' || service.trim().length === 0) {
      return { success: false, error: { message: 'service is required' } };
    }
    if (typeof email !== 'string' || !email.includes('@')) {
      return { success: false, error: { message: 'valid email is required' } };
    }
    if (typeof quantity !== 'number' || quantity < 1) {
      return { success: false, error: { message: 'quantity must be at least 1' } };
    }
    return {
      success: true,
      data: { service: service.trim(), email: email.trim(), quantity }
    };
  }
};

export type QuoteRequestInput = QuoteInput;

// Derived WebMCP JSON Schema
export const QuoteRequestJsonSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    service: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
    quantity: { type: 'integer', minimum: 1 }
  },
  required: ['service', 'email', 'quantity'],
  additionalProperties: false
};
