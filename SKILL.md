---
name: webmcp
description: This skill should be used when the user asks to create, implement, or adapt a WebMCP Process-to-Component feature, WebMCP tool, agent-accessible form, or business process component.
---

# WebMCP Process-to-Component Skill

## Purpose

Implement WebMCP-enabled application features using a shared business-process contract.

The resulting component must serve both:

1. human users through the application's normal UI;
2. AI agents through WebMCP.

The architecture is:

Business Process
→ Zod Schema
→ Shared Process Handler
→ Human UI + WebMCP Tool

## Critical Principle

The templates are instructional scaffolds.

Never treat `.webmcp/templates/` as final implementation code.

The final implementation must be adapted to:

- the target application's architecture;
- framework and runtime;
- dependency versions;
- existing validation approach;
- existing form components;
- design system;
- state management;
- routing;
- API/data layer;
- authentication and authorization;
- error handling conventions;
- loading-state conventions;
- testing conventions;
- accessibility conventions;
- business process requirements.

Copying a template verbatim and leaving its TODOs, example fields, demo behavior, or placeholder business logic in production code is incorrect.

## Absolute Scope Rule

Implement only requested functionality.

DO NOT add:

- demo data;
- mock data;
- seed records;
- fallback responses;
- fallback business logic;
- fake API calls;
- example database records;
- placeholder success responses;
- unrequested features;
- unrelated refactors;
- unrelated dependency upgrades.

If required business behavior cannot be determined from the user request and repository, inspect the repository for the established implementation pattern. If the missing requirement cannot be determined, stop and report the missing requirement instead of inventing behavior.

## Workflow

### Step 1: Inspect the target application

Determine:

- framework;
- package manager;
- TypeScript configuration;
- application entry points;
- component location;
- design system;
- form library;
- validation library;
- state management;
- API/data access;
- authentication;
- authorization;
- testing strategy.

Read existing components before creating new ones.

### Step 2: Understand the business process

Identify:

- process name;
- inputs;
- validation rules;
- business operation;
- side effects;
- success result;
- error behavior;
- authorization requirements;
- whether the operation is read-only or mutating.

Do not invent missing business behavior.

### Step 3: Read references

Read:

- `.webmcp/references/component-pattern.md`
- `.webmcp/references/process-spec-template.md`
- `.webmcp/references/webmcp-runtime.md`

Load only the references relevant to the implementation.

### Step 4: Ensure schema support

Prefer the application's existing Zod installation.

If Zod is not present and Zod is appropriate for the requested architecture, add it using the project's package manager.

Do not introduce a second validation system.

### Step 5: Create the process schema

Create one authoritative Zod schema.

The schema defines the process input contract.

Derive WebMCP JSON Schema from the Zod schema.

Do not manually maintain a second JSON Schema.

### Step 6: Implement the shared handler

Create one process handler.

Both:

- human submission;
- WebMCP execution

must call the same handler.

The handler must validate through the authoritative schema before performing the business operation.

### Step 7: Generate the form UI

Read the Zod schema and generate form fields that map to each schema property.

Use the project's existing form components and design system.

Do not leave example fields.

Do not add a generic "Example Field".

Do not invent fields not present in the business process.

Map schema constraints to appropriate UI validation and accessibility behavior.

### Step 8: Register the WebMCP tool

Use:

document.modelContext.registerTool(...)

Do not use navigator.modelContext.

Use a registration AbortController for component lifecycle cleanup.

The execute callback must accept the WebMCP execution signal and pass it into the shared process handler.

### Step 9: Configure annotations

Set WebMCP annotations according to the actual business operation:

- readOnlyHint;
- consequentialHint;
- untrustedContentHint.

Do not copy annotation values blindly.

### Step 10: Verify

Run the repository's existing:

- formatter;
- type checker;
- tests;
- build;
- relevant integration tests.

Verify:

- one schema;
- one process handler;
- human UI uses the handler;
- WebMCP uses the handler;
- JSON Schema is derived from Zod;
- registration uses document.modelContext;
- registration cleanup uses AbortSignal;
- execution signal is propagated;
- no demo data exists;
- no fallback behavior was introduced;
- no unrelated files changed.

## Final Review

Before reporting completion, inspect the final diff.

Remove:

- TODOs that should have been implemented;
- placeholder fields;
- demo data;
- fake responses;
- fallback paths;
- console logging added only for demonstration;
- unused imports;
- unused dependencies;
- generated files that should not be committed.

Do not report the task complete while instructional scaffold code remains in the production implementation.
