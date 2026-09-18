import React, { useState } from 'react';
import { executeProcessAction } from './handler';
import { useWebMCPTool } from './useWebMCPTool';
import type { QuoteRequestInput } from './schema';

export function ProcessComponent() {
  const [service, setService] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useWebMCPTool();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    const input: QuoteRequestInput = { service, email, quantity };
    const response = await executeProcessAction(input);

    if (!response.success) {
      setStatus('error');
      setError(response.error);
      return;
    }

    setStatus('success');
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="service-field">Service</label>
      <input
        id="service-field"
        type="text"
        value={service}
        onChange={(e) => setService(e.target.value)}
        required
      />

      <label htmlFor="email-field">Email</label>
      <input
        id="email-field"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label htmlFor="quantity-field">Quantity</label>
      <input
        id="quantity-field"
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        min={1}
        required
      />

      <button type="submit" disabled={status === 'loading'}>
        Submit Quote Request
      </button>

      {status === 'error' && <p role="alert">{error}</p>}
      {status === 'success' && <p>Quote request submitted successfully.</p>}
    </form>
  );
}

export default ProcessComponent;
