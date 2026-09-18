# WebMCP Runtime Reference

## Registration

Use `document.modelContext.registerTool`.

## Registration lifecycle

Pass an AbortSignal when registering a dynamically mounted tool.

Abort the registration signal during component cleanup.

## Execution

The WebMCP execute callback receives:

```ts
execute: async (input, { signal }) => {
  ...
}
```

The execution signal must be propagated to cancellable application operations.

## Input schema

WebMCP requires a JSON Schema-compatible input schema.

The application's authoritative Zod schema should be converted into JSON Schema rather than manually duplicated.

## Annotations

Evaluate:

- readOnlyHint
- consequentialHint
- untrustedContentHint

against the actual operation.

## Secure context

WebMCP is a web platform capability intended for secure web environments.

Do not add deployment infrastructure unless the target application requires it.

## Runtime availability

Do not add a silent fallback to another agent protocol.

If WebMCP is unavailable, report the environment requirement.
