#!/usr/bin/env node
/**
 * CI: initialize docs MCP and list tools.
 *   node scripts/ci-stdio.mjs npx
 *   node scripts/ci-stdio.mjs docker
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const mode = process.argv[2] || 'npx';
const PROTOCOL = '2025-03-26';
const PKG = '@imba_wallet/agent-mcp-docs';
const BIN = 'agent-mcp-docs';

function npxCli() {
  const dir = dirname(process.execPath);
  return [join(dir, 'node_modules', 'npm', 'bin', 'npx-cli.js'), join(dir, 'npx-cli.js')].find((p) =>
    existsSync(p),
  );
}

function spawnDocs() {
  if (mode === 'docker') {
    return spawn('docker', ['run', '-i', '--rm', 'imba-agent-docs'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  }
  const cli = npxCli();
  if (cli) {
    return spawn(process.execPath, [cli, '-y', `--package=${PKG}@0.1.4`, BIN], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, npm_config_update_notifier: 'false' },
    });
  }
  return spawn('npx', ['-y', `--package=${PKG}@0.1.4`, BIN], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, npm_config_update_notifier: 'false' },
  });
}

class McpChild {
  constructor(child) {
    this.child = child;
    this.nextId = 1;
    this.pending = new Map();
    this.stderr = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      this.stderr += chunk;
      if (this.stderr.length > 40_000) this.stderr = this.stderr.slice(-20_000);
    });
    const rl = readline.createInterface({ input: child.stdout });
    rl.on('line', (line) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith('{')) return;
      let msg;
      try {
        msg = JSON.parse(trimmed);
      } catch {
        return;
      }
      if (msg.id == null) return;
      const wait = this.pending.get(msg.id);
      if (!wait) return;
      this.pending.delete(msg.id);
      wait(msg);
    });
    child.on('exit', (code) => {
      for (const wait of this.pending.values()) {
        wait({ error: { code: -32000, message: `stdio exit ${code}: ${this.stderr.slice(-400)}` } });
      }
      this.pending.clear();
    });
  }

  send(method, params) {
    const id = this.nextId++;
    this.child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`timeout waiting for ${method}: ${this.stderr.slice(-400)}`));
      }, 90_000);
      this.pending.set(id, (msg) => {
        clearTimeout(timer);
        resolve(msg);
      });
    });
  }

  notify(method, params) {
    this.child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
  }

  close() {
    try {
      this.child.stdin.end();
    } catch {
      /* already closed */
    }
    this.child.kill();
  }
}

const child = spawnDocs();
const mcp = new McpChild(child);
try {
  const init = await mcp.send('initialize', {
    protocolVersion: PROTOCOL,
    capabilities: {},
    clientInfo: { name: 'imba-agent-mcp-ci', version: '0.1.4' },
  });
  if (init.error) throw new Error(`initialize: ${JSON.stringify(init.error)}`);
  mcp.notify('notifications/initialized');
  const listed = await mcp.send('tools/list', {});
  if (listed.error) throw new Error(`tools/list: ${JSON.stringify(listed.error)}`);
  const names = (listed.result?.tools ?? []).map((t) => t.name);
  if (!names.includes('get_agent_facts')) {
    throw new Error(`docs MCP missing get_agent_facts: ${names.join(', ')}`);
  }
  console.error(`docs MCP ok (${mode}): ${names.join(', ')}`);
} finally {
  mcp.close();
}
