import { Role, Deal, Referent } from '../types';
import { datasetSchema, roleSchema } from '../shared/schemas.mjs';
let csrf = '';
export type Session = { username: string; role: Role };
export type Dataset = { revision: number; deals: Deal[]; referents: Referent[] };
export async function api(route: string, method = 'GET', data?: unknown): Promise<any> {
  const response = await fetch(route, { method, credentials: 'same-origin', redirect: 'error',
    headers: { 'Content-Type': 'application/json', ...(method !== 'GET' ? { 'X-CSRF-Token': csrf } : {}) },
    body: data === undefined ? undefined : JSON.stringify(data) });
  const value = await response.json();
  if (!response.ok) throw new Error(typeof value.error === 'string' ? value.error : 'Richiesta non riuscita');
  return value;
}
export async function session(): Promise<Session> {
  const value = await api('/api/session');
  roleSchema.parse(value.role);
  if (typeof value.csrf !== 'string' || typeof value.username !== 'string') throw new Error('Sessione non valida');
  csrf = value.csrf; return { username: value.username, role: value.role };
}
export async function login(username: string, password: string): Promise<Session> {
  await api('/api/login', 'POST', { username, password }); return session();
}
export async function logout() { await api('/api/logout', 'POST', {}); csrf = ''; }
export async function readDataset(): Promise<Dataset> { return parseDataset(await api('/api/data')); }
function parseDataset(value: any): Dataset {
  if (!Number.isSafeInteger(value.revision) || value.revision < 0) throw new Error('Versione dati non valida');
  return { revision: value.revision, ...datasetSchema.parse({ deals: value.deals, referents: value.referents }) } as Dataset;
}
export async function writeDataset(data: Omit<Dataset, 'revision'>, revision: number): Promise<Dataset> {
  return parseDataset(await api('/api/data', 'PUT', { revision, data: datasetSchema.parse(data) }));
}
