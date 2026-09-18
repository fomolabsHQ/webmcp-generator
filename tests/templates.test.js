import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'fs-extra';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.resolve(ROOT_DIR, 'templates');
const FIXTURE_DIR = path.resolve(ROOT_DIR, 'tests/fixtures/target-react-app');

describe('Templates validation', () => {
  it('schema template contains Zod and derives JSON Schema', async () => {
    const schemaContent = await fs.readFile(path.join(TEMPLATES_DIR, 'schema.ts'), 'utf-8');

    assert.match(schemaContent, /import \* as z from 'zod';/);
    assert.match(schemaContent, /z\.toJSONSchema/);
    assert.match(schemaContent, /target:\s*'draft-2020-12'/);
    assert.doesNotMatch(schemaContent, /properties:\s*\{/);
  });

  it('handler template accepts AbortSignal and fails loudly on unimplemented logic', async () => {
    const handlerContent = await fs.readFile(path.join(TEMPLATES_DIR, 'handler.ts'), 'utf-8');

    assert.match(handlerContent, /signal\?:\s*AbortSignal/);
    assert.match(handlerContent, /executeProcessAction/);
    assert.match(handlerContent, /signal\?\.aborted/);
    assert.match(handlerContent, /throw new Error\(\s*'.*business logic has not been implemented\.'\s*\);/);
    assert.doesNotMatch(handlerContent, /success:\s*true,\s*data:\s*\{\s*received/);
  });

  it('useWebMCPTool template registers on document.modelContext with lifecycle AbortSignal', async () => {
    const hookContent = await fs.readFile(path.join(TEMPLATES_DIR, 'useWebMCPTool.ts'), 'utf-8');

    assert.match(hookContent, /document\.modelContext\.registerTool/);
    assert.match(hookContent, /new AbortController\(\)/);
    assert.match(hookContent, /signal:\s*registrationController\.signal/);
    assert.match(hookContent, /execute:\s*async\s*\(\s*input:\s*unknown,\s*\{\s*signal\s*\}\s*:\s*\{\s*signal:\s*AbortSignal\s*\}\s*\)/);
    assert.match(hookContent, /return executeProcessAction\(input,\s*signal\);/);
    assert.match(hookContent, /registrationController\.abort\(\);/);

    assert.doesNotMatch(hookContent, /navigator\.modelContext/);
    assert.doesNotMatch(hookContent, /unregisterTool/);
  });

  it('Component template calls useWebMCPTool and shared handler', async () => {
    const componentContent = await fs.readFile(path.join(TEMPLATES_DIR, 'Component.tsx'), 'utf-8');

    assert.match(componentContent, /useWebMCPTool\(\);/);
    assert.match(componentContent, /executeProcessAction\(input\)/);
  });

  it('static guard: verifies no forbidden patterns exist in executable code', async () => {
    const templateFiles = ['schema.ts', 'handler.ts', 'useWebMCPTool.ts', 'Component.tsx'];

    for (const file of templateFiles) {
      const content = await fs.readFile(path.join(TEMPLATES_DIR, file), 'utf-8');

      // Strip comments to verify executable statements
      const codeWithoutComments = content
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*/g, '');

      assert.doesNotMatch(codeWithoutComments, /demoData/i);
      assert.doesNotMatch(codeWithoutComments, /mockData/i);
      assert.doesNotMatch(codeWithoutComments, /fallback/i);
      assert.doesNotMatch(codeWithoutComments, /unregisterTool/);
      assert.doesNotMatch(codeWithoutComments, /navigator\.modelContext/);
      assert.doesNotMatch(codeWithoutComments, /received:\s*(input|data)/);
      assert.doesNotMatch(codeWithoutComments, /crypto\.randomUUID\(\)/);
      assert.doesNotMatch(codeWithoutComments, /console\.log\(/);
      assert.doesNotMatch(codeWithoutComments, /Example Field/);
    }
  });
});

describe('Fixture application verification', () => {
  it('fixture files exist with required process-to-component pattern', async () => {
    assert.ok(await fs.pathExists(path.join(FIXTURE_DIR, 'package.json')));
    assert.ok(await fs.pathExists(path.join(FIXTURE_DIR, 'tsconfig.json')));
    assert.ok(await fs.pathExists(path.join(FIXTURE_DIR, 'src/components/schema.ts')));
    assert.ok(await fs.pathExists(path.join(FIXTURE_DIR, 'src/components/handler.ts')));
    assert.ok(await fs.pathExists(path.join(FIXTURE_DIR, 'src/components/useWebMCPTool.ts')));
    assert.ok(await fs.pathExists(path.join(FIXTURE_DIR, 'src/components/ProcessComponent.tsx')));
  });

  it('fixture schema derives JSON Schema matching properties and constraints', async () => {
    const schemaContent = await fs.readFile(path.join(FIXTURE_DIR, 'src/components/schema.ts'), 'utf-8');

    assert.match(schemaContent, /QuoteRequestSchema/);
    assert.match(schemaContent, /QuoteRequestJsonSchema/);
    assert.match(schemaContent, /service:\s*\{\s*type:\s*'string'/);
    assert.match(schemaContent, /email:\s*\{\s*type:\s*'string'/);
    assert.match(schemaContent, /quantity:\s*\{\s*type:\s*'integer'/);
  });

  it('fixture handler and hook wire single shared mutation logic', async () => {
    const handlerContent = await fs.readFile(path.join(FIXTURE_DIR, 'src/components/handler.ts'), 'utf-8');
    const hookContent = await fs.readFile(path.join(FIXTURE_DIR, 'src/components/useWebMCPTool.ts'), 'utf-8');
    const componentContent = await fs.readFile(path.join(FIXTURE_DIR, 'src/components/ProcessComponent.tsx'), 'utf-8');

    // Handler validates input and handles signal cancellation
    assert.match(handlerContent, /QuoteRequestSchema\.safeParse/);
    assert.match(handlerContent, /signal\?\.aborted/);
    assert.match(handlerContent, /DOMException\('The operation was aborted\.', 'AbortError'\)/);

    // Hook registers with modelContext and forwards execution signal
    assert.match(hookContent, /modelContext\.registerTool/);
    assert.match(hookContent, /executeProcessAction\(input, signal\)/);

    // Component wires hook and calls the identical executeProcessAction
    assert.match(componentContent, /useWebMCPTool\(\)/);
    assert.match(componentContent, /executeProcessAction\(input\)/);
  });
});

describe('Package contents verification', () => {
  it('npm pack includes only allowed distribution files', async () => {
    const { stdout } = await execFileAsync('npm', ['pack', '--dry-run', '--json'], { cwd: ROOT_DIR });
    const packInfo = JSON.parse(stdout);
    const files = packInfo[0].files.map((f) => f.path);

    // Allowed paths
    assert.ok(files.some((f) => f.startsWith('bin/cli.js')));
    assert.ok(files.some((f) => f.startsWith('templates/')));
    assert.ok(files.some((f) => f.startsWith('references/')));
    assert.ok(files.some((f) => f.startsWith('agents/')));
    assert.ok(files.includes('SKILL.md'));
    assert.ok(files.includes('README.md'));
    assert.ok(files.includes('package.json'));

    // Excluded paths
    assert.ok(!files.some((f) => f.startsWith('tests/')));
    assert.ok(!files.some((f) => f.startsWith('node_modules/')));
  });
});
