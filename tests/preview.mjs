// Local smoke-test harness: synthetic credentials and in-memory data only.
import { createApp } from '../server/index.mjs';
import { createStore } from '../server/store.mjs';
import { hashPassword } from '../server/auth.mjs';
import { fileURLToPath } from 'node:url';
const app = createApp({
  origin: 'http://127.0.0.1:4317', allowHttp: true,
  users: [{ username: 'demo', role: 'Admin', passwordHash: hashPassword('artax-local-test-only') }],
  store: createStore(':memory:'), staticRoot: fileURLToPath(new URL('../dist/', import.meta.url)),
  classifyImpl: async () => ({ title: 'Immobile di prova', category: 'Immobiliare', subType: 'Ufficio',
    location: 'Roma', indicativeValue: 100000, roi: 5, cagr: null, description: '<script>innocuous test</script>',
    priority: 'Media', signals: [{ label: 'Demo', score: 5 }], confidence: 60, confidenceReason: 'Dati sintetici da verificare' })
});
app.listen(4317, '127.0.0.1', () => console.log('Local smoke test ready'));
