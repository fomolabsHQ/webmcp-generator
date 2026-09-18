# WebMCP Generator

A Pure Skill installer for AI coding agents implementing
WebMCP Process-to-Component architecture.

## How it works

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

## Install

```bash
npx @fomolab.space/webmcp-generator
```

To explicitly overwrite existing generated WebMCP integration files:

```bash
npx @fomolab.space/webmcp-generator --force
```

## What gets installed

- WebMCP skill
- Process-to-Component templates
- WebMCP runtime references
- agent-specific integration artifacts

## What the CLI does not do

The CLI does not:

- generate business logic;
- generate React components;
- inspect your application;
- install application dependencies;
- create database records;
- create demo data;
- create fallback behavior;
- run an AI model.

The AI coding agent performs those implementation steps after inspecting the target project.

## Architecture

```text
Zod Schema
    │
    ├── Human UI validation
    │
    └── JSON Schema
           │
           ▼
      WebMCP Tool
           │
           ▼
Shared Process Handler
           ▲
           │
       Human UI
```

## Important

Templates are instructional scaffolds.

The agent must adapt them to the target application's:

- architecture;
- dependencies;
- design system;
- business process;
- existing conventions.
