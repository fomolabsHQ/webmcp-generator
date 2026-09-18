#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, '..');

const args = new Set(process.argv.slice(2));

if ([...args].some((arg) => arg !== '--force')) {
  console.error('Usage: webmcp-generator [--force]');
  process.exit(1);
}

const force = args.has('--force');

const AGENTS = [
  {
    name: 'Claude Code',
    files: [
      {
        src: 'SKILL.md',
        dest: '.claude/skills/webmcp/SKILL.md'
      },
      {
        src: 'agents/claude/skill.md',
        dest: '.claude/skills/webmcp/agent-notes.md'
      }
    ]
  },
  {
    name: 'Cursor',
    files: [
      {
        src: 'SKILL.md',
        dest: '.cursor/skills/webmcp/SKILL.md'
      },
      {
        src: 'agents/cursor/rule.mdc',
        dest: '.cursor/rules/webmcp.mdc'
      }
    ]
  },
  {
    name: 'OpenAI Codex',
    files: [
      {
        src: 'SKILL.md',
        dest: '.agents/skills/webmcp/SKILL.md'
      },
      {
        src: 'agents/codex/skill.md',
        dest: '.agents/skills/webmcp/agent-notes.md'
      }
    ]
  },
  {
    name: 'OpenCode',
    files: [
      {
        src: 'SKILL.md',
        dest: '.opencode/skills/webmcp/SKILL.md'
      },
      {
        src: 'agents/opencode/skill.md',
        dest: '.opencode/skills/webmcp/agent-notes.md'
      }
    ]
  }
];

async function copyProtected(source, destination) {
  if (await fs.pathExists(destination)) {
    if (!force) {
      return {
        status: 'skipped',
        reason: 'destination exists'
      };
    }
  }

  await fs.ensureDir(path.dirname(destination));
  await fs.copy(source, destination, { overwrite: force });

  return {
    status: 'copied'
  };
}

async function installShared(targetDir) {
  const webmcpDir = path.join(targetDir, '.webmcp');

  await fs.ensureDir(webmcpDir);

  await copyProtected(
    path.join(PACKAGE_ROOT, 'templates'),
    path.join(webmcpDir, 'templates')
  );

  await copyProtected(
    path.join(PACKAGE_ROOT, 'references'),
    path.join(webmcpDir, 'references')
  );
}

async function installAgent(targetDir, agent) {
  const results = [];

  for (const file of agent.files) {
    const source = path.join(PACKAGE_ROOT, file.src);
    const destination = path.join(targetDir, file.dest);

    if (!(await fs.pathExists(source))) {
      throw new Error(`Source file does not exist: ${file.src}`);
    }

    const result = await copyProtected(source, destination);

    results.push({
      file: file.dest,
      ...result
    });
  }

  return results;
}

async function init() {
  const targetDir = process.cwd();

  console.log('Installing WebMCP skill...');

  await installShared(targetDir);

  console.log('Shared resources installed under .webmcp/');

  const results = [];

  for (const agent of AGENTS) {
    try {
      const files = await installAgent(targetDir, agent);

      results.push({
        agent: agent.name,
        status: 'success',
        files
      });
    } catch (error) {
      results.push({
        agent: agent.name,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  console.log('\nInstallation summary:');

  let failed = false;

  for (const result of results) {
    if (result.status === 'success') {
      console.log(`  OK  ${result.agent}`);

      for (const file of result.files) {
        const marker = file.status === 'skipped' ? 'SKIP' : 'COPY';
        console.log(`      ${marker} ${file.file}`);
      }
    } else {
      failed = true;
      console.error(`  ERR ${result.agent}: ${result.error}`);
    }
  }

  if (failed) {
    console.error('\nInstallation completed with errors.');
    process.exitCode = 1;
    return;
  }

  console.log('\nInstallation completed.');
  console.log(
    'The CLI installed the skill and instructional scaffolds.'
  );
  console.log(
    'The AI coding agent is responsible for generating the final implementation.'
  );
}

init().catch((error) => {
  console.error(
    'Installation failed:',
    error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
});

export { init };
