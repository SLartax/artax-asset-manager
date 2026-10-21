import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import { createSessions, authenticate, loadUsers } from './auth.mjs';
import { createStore } from './store.mjs';
import { classify } from './classify.mjs';
import { inputSchema, loginSchema, datasetSchema, classificationSchema } from '../shared/schemas.mjs';

const writeSchema = z.object({ revision: z.number().int().nonnegative(), data: datasetSchema }).strict();
const writers = new Set(['Admin', 'Manager', 'Operatore']);
function visibleData(data, role) {
  if (role === 'Admin' || role === 'Manager') return data;
  return { ...data, deals: data.deals.map(d => ({ ...d, contacts: d.contacts.filter(c => !c.isPrivate) })) };
}
async function body(req, limit) {
  if (req.headers['content-type']?.split(';')[0] !== 'application/json') throw Object.assign(new Error(), { status: 415 });
  let size = 0; const chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > limit) throw Object.assign(new Error(), { status: 413 }); chunks.push(chunk); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export function createApp({ origin, users, store, apiKey, classifyImpl = classify, allowHttp = false, staticRoot }) {
  const url = new URL(origin);
  if (url.origin !== origin || (url.protocol !== 'https:' && !(allowHttp && ['localhost', '127.0.0.1'].includes(url.hostname)))) throw new Error('HTTPS origin required');
  const sessions = createSessions(url.protocol === 'https:');
  const limits = new Map(); let inflightAI = 0;
  function rate(key, max, interval = 900000) {
    const now = Date.now(); for (const [k, v] of limits) if (v.until < now) limits.delete(k);
    if (!limits.has(key)) { if (limits.size >= 10000) return false; limits.set(key, { count: 0, until: now + interval }); }
    return ++limits.get(key).count <= max;
  }
  const server = createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer'); res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    if (url.protocol === 'https:') res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    const send = (status, value) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(value)); };
    try {
      const route = new URL(req.url, origin).pathname;
      const mutation = !['GET', 'HEAD'].includes(req.method);
      if (mutation && (req.headers.origin !== origin || (req.headers['sec-fetch-site'] && req.headers['sec-fetch-site'] !== 'same-origin'))) return send(403, { error: 'Origin non consentita' });
      if (route === '/api/login' && req.method === 'POST') {
        // Ignore forwarded IP/role headers: configure rate limiting at the TLS proxy too.
        if (!rate(`login:${req.socket.remoteAddress}`, 10)) return send(429, { error: 'Troppi tentativi' });
        const input = loginSchema.parse(await body(req, 4096));
        const user = authenticate(users, input.username, input.password);
        if (!user) return send(401, { error: 'Credenziali non valide' });
        const issued = sessions.issue(req, user); res.setHeader('Set-Cookie', issued.cookie);
        return send(200, { ...user, csrf: issued.csrf });
      }
      if (route.startsWith('/api/')) {
        const session = sessions.read(req);
        if (!session) return send(401, { error: 'Autenticazione richiesta' });
        if (mutation && req.headers['x-csrf-token'] !== session.csrf) return send(403, { error: 'CSRF non valido' });
        if (route === '/api/session' && req.method === 'GET') return send(200, { username: session.username, role: session.role, csrf: session.csrf });
        if (route === '/api/logout' && req.method === 'POST') { res.setHeader('Set-Cookie', sessions.revoke(req)); return send(200, { ok: true }); }
        if (route === '/api/data' && req.method === 'GET') return send(200, visibleData(store.read(), session.role));
        if (mutation && !writers.has(session.role)) return send(403, { error: 'Ruolo non autorizzato' });
        if (route === '/api/classify' && req.method === 'POST') {
          if (!rate(`ai:${session.username}`, 20, 3600000) || inflightAI >= 2) return send(429, { error: 'Limite analisi raggiunto' });
          const input = inputSchema.parse(await body(req, 7100000));
          inflightAI++;
          try { return send(200, classificationSchema.parse(await classifyImpl(input, apiKey))); }
          catch { return send(502, { error: 'Analisi non disponibile o risultato non valido' }); }
          finally { inflightAI--; }
        }
        if (route === '/api/data' && req.method === 'PUT') {
          const input = writeSchema.parse(await body(req, 10000000)); const previous = store.read();
          if (input.revision !== previous.revision) return send(409, { error: 'Dati aggiornati da un altro utente: ricarica la pagina' });
          // Preserve records: archiving is reversible, deletion is not exposed.
          if (previous.deals.some(d => !input.data.deals.some(n => n.id === d.id)) || previous.referents.some(r => !input.data.referents.some(n => n.id === r.id))) return send(400, { error: 'La rimozione definitiva non è consentita' });
          if (session.role !== 'Admin' && JSON.stringify(input.data.referents) !== JSON.stringify(previous.referents)) return send(403, { error: 'Solo Admin gestisce i referenti' });
          for (const d of input.data.deals) {
            const old = previous.deals.find(v => v.id === d.id);
            if (old && session.role === 'Operatore') d.contacts = [...d.contacts.filter(c => !c.isPrivate), ...old.contacts.filter(c => c.isPrivate)];
            if (!old || JSON.stringify(d) !== JSON.stringify(old)) {
              d.auditLog = [...(old?.auditLog || []), { timestamp: new Date().toISOString(), user: session.username, action: old ? 'Modifica confermata' : 'Creazione confermata' }];
            }
          }
          if (!store.write(input.data, input.revision)) return send(409, { error: 'Conflitto di aggiornamento' });
          return send(200, visibleData(store.read(), session.role));
        }
        return send(404, { error: 'Operazione non disponibile' });
      }
      if (req.method !== 'GET' || !staticRoot) return send(404, { error: 'Non trovato' });
      // Only serve the built index and assets, never arbitrary repo/server/env files.
      const filename = route === '/' ? 'index.html' : route.slice(1);
      if (!(filename === 'index.html' || /^assets\/[A-Za-z0-9_.-]+\.(js|css)$/.test(filename))) return send(404, { error: 'Non trovato' });
      const data = await readFile(path.join(staticRoot, filename));
      res.writeHead(200, { 'Content-Type': filename.endsWith('.js') ? 'text/javascript' : filename.endsWith('.css') ? 'text/css' : 'text/html' }); res.end(data);
    } catch (error) {
      const status = error?.status || (error instanceof z.ZodError || error instanceof SyntaxError ? 400 : 500);
      send(status, { error: status === 500 ? 'Errore interno' : 'Richiesta non valida' });
    }
  });
  server.requestTimeout = 60000; server.headersTimeout = 10000; return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const users = loadUsers(process.env.ARTAX_USERS || '');
    if (!process.env.ARTAX_ORIGIN || !process.env.ARTAX_DB_PATH) throw new Error('Missing configuration');
    const store = createStore(process.env.ARTAX_DB_PATH);
    const app = createApp({ origin: process.env.ARTAX_ORIGIN, users, store, apiKey: process.env.OPENAI_API_KEY,
      allowHttp: process.env.ARTAX_ALLOW_LOCAL_HTTP === 'true', staticRoot: fileURLToPath(new URL('../dist/', import.meta.url)) });
    app.listen(Number(process.env.PORT || 3001), '127.0.0.1', () => console.info('Artax server listening on loopback'));
  } catch { console.error('Artax startup refused: check server configuration'); process.exitCode = 1; }
}
