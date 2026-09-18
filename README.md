# WebMCP Generator

Skill for AI coding agents to implement WebMCP components with a Process-to-Component architecture.

The CLI installs the skill; the AI coding agent uses it to implement WebMCP components in the target application.

## Installation

```bash
npx webmcp-generator
```

To explicitly overwrite existing generated WebMCP integration files:

```bash
npx webmcp-generator --force
```

## How It Works

```text
webmcp-generator
       │
       ▼
install skill + templates + references
       │
       ▼
AI coding agent
       │
       ▼
inspect target application
       │
       ▼
adapt instructional scaffolds
       │
       ▼
implement WebMCP component
```

The CLI provides the implementation guidance and supporting artifacts. The AI coding agent adapts them to the target application's existing architecture and implements the WebMCP component.

## What Gets Installed

* WebMCP skill
* Process-to-Component architecture templates
* WebMCP runtime references
* Agent-specific integration artifacts

## Architecture

The Process-to-Component architecture separates the underlying business process from the interfaces that invoke it.

```text
                    Zod Schema
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
         Human UI             JSON Schema
              │                     │
              │                     ▼
              │                WebMCP Tool
              │                     │
              └──────────┬──────────┘
                         │
                         ▼
               Shared Process Handler
```

A single process handler can serve both human-facing UI and agent-facing WebMCP tools, while the schema provides consistent validation and WebMCP-compatible JSON Schema.

## Templates Are Scaffolds

Templates are instructional scaffolds, not final implementations.

The AI coding agent must adapt them to the target application's:

* architecture
* dependencies
* design system
* business process
* existing conventions

This allows the generated implementation to fit the existing application rather than forcing the application into a predefined template structure.

## Supported AI Coding Agents

The skill is designed to work with AI coding agents that support project-level skills or agent instructions, including:

* Claude Code
* Codex
* Cursor
* OpenCode

## License
MIT