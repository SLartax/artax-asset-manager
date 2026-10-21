import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
const root = new URL('../dist/', import.meta.url);
const files = await readdir(root, { recursive: true });
const assets = files.filter(f => /\.(?:html|js|css)$/.test(f));
if (!assets.some(f => f.endsWith('.js'))) throw new Error('Missing browser application bundle');
const canary = process.env.OPENAI_API_KEY;
const source = await readFile(new URL('../constants.ts', import.meta.url), 'utf8');
const oldTitles = [...source.matchAll(/title:\s*["']([^"'\n]+)["']/g)].map(m => m[1]).filter(v => v.length > 20);
for (const file of assets) {
  const data = await readFile(new URL(file.split(path.sep).join('/'), root), 'utf8');
  if (/api\.openai\.com|OPENAI_API_KEY|dangerouslyAllowBrowser|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}/.test(data)) {
    throw new Error('Forbidden server secret/provider reference in browser output');
  }
  if (canary && canary.length >= 16 && data.includes(canary)) throw new Error('Build credential leaked into browser output');
  if (oldTitles.some(title => data.includes(title))) throw new Error('Pre-existing business records leaked into browser output');
}
console.log('Browser bundle checks passed: application present, no server/provider credentials or initial records');
