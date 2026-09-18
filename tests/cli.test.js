import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'fs-extra';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.resolve(__dirname, '../bin/cli.js');

describe('CLI installer', () => {
  it('installs scaffolds into empty target directory', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'webmcp-test-fresh-'));

    try {
      const { stdout } = await execFileAsync('node', [CLI_PATH], { cwd: tmpDir });

      assert.match(stdout, /Installing WebMCP skill/);
      assert.match(stdout, /Installation completed\./);

      // Verify shared templates and references
      assert.ok(await fs.pathExists(path.join(tmpDir, '.webmcp/templates/schema.ts')));
      assert.ok(await fs.pathExists(path.join(tmpDir, '.webmcp/templates/handler.ts')));
      assert.ok(await fs.pathExists(path.join(tmpDir, '.webmcp/templates/useWebMCPTool.ts')));
      assert.ok(await fs.pathExists(path.join(tmpDir, '.webmcp/templates/Component.tsx')));
      assert.ok(await fs.pathExists(path.join(tmpDir, '.webmcp/references/component-pattern.md')));
      assert.ok(await fs.pathExists(path.join(tmpDir, '.webmcp/references/process-spec-template.md')));
      assert.ok(await fs.pathExists(path.join(tmpDir, '.webmcp/references/webmcp-runtime.md')));

      // Verify agent integrations
      assert.ok(await fs.pathExists(path.join(tmpDir, '.claude/skills/webmcp/SKILL.md')));
      assert.ok(await fs.pathExists(path.join(tmpDir, '.claude/skills/webmcp/agent-notes.md')));
      assert.ok(await fs.pathExists(path.join(tmpDir, '.cursor/skills/webmcp/SKILL.md')));
      assert.ok(await fs.pathExists(path.join(tmpDir, '.cursor/rules/webmcp.mdc')));
      assert.ok(await fs.pathExists(path.join(tmpDir, '.agents/skills/webmcp/SKILL.md')));
      assert.ok(await fs.pathExists(path.join(tmpDir, '.agents/skills/webmcp/agent-notes.md')));
      assert.ok(await fs.pathExists(path.join(tmpDir, '.opencode/skills/webmcp/SKILL.md')));
      assert.ok(await fs.pathExists(path.join(tmpDir, '.opencode/skills/webmcp/agent-notes.md')));
    } finally {
      await fs.remove(tmpDir);
    }
  });

  it('protects existing agent files by default', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'webmcp-test-protect-'));

    try {
      const customContent = '# My Custom Cursor Rule';
      const targetRule = path.join(tmpDir, '.cursor/rules/webmcp.mdc');
      await fs.ensureDir(path.dirname(targetRule));
      await fs.writeFile(targetRule, customContent, 'utf-8');

      const { stdout } = await execFileAsync('node', [CLI_PATH], { cwd: tmpDir });

      assert.match(stdout, /SKIP \.cursor\/rules\/webmcp\.mdc/);
      const content = await fs.readFile(targetRule, 'utf-8');
      assert.equal(content, customContent);
    } finally {
      await fs.remove(tmpDir);
    }
  });

  it('overwrites existing files when --force is provided', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'webmcp-test-force-'));

    try {
      const customContent = '# My Custom Cursor Rule';
      const targetRule = path.join(tmpDir, '.cursor/rules/webmcp.mdc');
      await fs.ensureDir(path.dirname(targetRule));
      await fs.writeFile(targetRule, customContent, 'utf-8');

      const { stdout } = await execFileAsync('node', [CLI_PATH, '--force'], { cwd: tmpDir });

      assert.match(stdout, /COPY \.cursor\/rules\/webmcp\.mdc/);
      const content = await fs.readFile(targetRule, 'utf-8');
      assert.notEqual(content, customContent);
      assert.match(content, /WebMCP Process-to-Component guardrails/);
    } finally {
      await fs.remove(tmpDir);
    }
  });

  it('reports partial failure and exits non-zero if an agent copy fails', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'webmcp-test-fail-'));

    try {
      // Create a file at .cursor path so that ensuring a directory at .cursor/skills/ fails
      await fs.writeFile(path.join(tmpDir, '.cursor'), 'block-file', 'utf-8');

      let failed = false;
      try {
        await execFileAsync('node', [CLI_PATH], { cwd: tmpDir });
      } catch (err) {
        failed = true;
        assert.equal(err.code, 1);
        assert.match(err.stdout, /OK\s+Claude Code/);
        assert.match(err.stderr, /ERR Cursor:/);
        assert.match(err.stderr, /Installation completed with errors\./);
      }

      assert.ok(failed, 'CLI should exit with non-zero exit code on partial failure');
    } finally {
      await fs.remove(tmpDir);
    }
  });

  it('fails with usage error on unknown arguments', async () => {
    let failed = false;
    try {
      await execFileAsync('node', [CLI_PATH, '--generate']);
    } catch (err) {
      failed = true;
      assert.equal(err.code, 1);
      assert.match(err.stderr, /Usage: webmcp-generator \[--force\]/);
    }

    assert.ok(failed, 'CLI should fail with unknown argument');
  });
});
