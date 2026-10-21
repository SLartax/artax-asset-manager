import { z } from 'zod';

const text = (max = 300) => z.string().max(max).refine(s => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s));
const number = (min, max) => z.number().finite().min(min).max(max);
export const roleSchema = z.enum(['Admin', 'Manager', 'Operatore', 'Viewer']);
const category = z.enum(['Finanziaria', 'Immobiliare', 'Aziendale']);
const priority = z.enum(['Alta', 'Media', 'Bassa']);
const signals = z.array(z.object({ label: text(150), score: number(0, 10) }).strict()).max(20);
export const classificationSchema = z.object({
  title: text(200).min(1), category, subType: text(), location: text(),
  indicativeValue: number(0, 1e15), roi: number(-100, 10000).nullable(),
  cagr: number(-100, 10000).nullable(), description: text(12000),
  priority, signals, confidence: number(0, 100), confidenceReason: text(2000)
}).strict();

export const inputSchema = z.object({
  text: text(50000).optional(),
  image: z.object({
    mimeType: z.enum(['image/png', 'image/jpeg', 'image/webp']),
    data: z.string().min(4).max(7000000).regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/)
  }).strict().optional()
}).strict().refine(v => Boolean(v.text?.trim() || v.image));

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const dealSchema = z.object({
  id: text(100).min(1), title: text(200).min(1), category, subType: text(),
  location: text(), valueRange: text(), indicativeValue: number(0, 1e15), currency: text(10),
  cagr: number(-100, 10000).optional(), roi: number(-100, 10000).optional(), irr: number(-100, 10000).optional(),
  signals, internalReferent: text(), client: text(), insertionDate: date,
  status: z.enum(['Lead', 'Analisi', 'Due Diligence', 'Negoziazione', 'Closing', 'Archiviata']),
  priority, ndaSigned: z.boolean(), ndaDate: date.optional(), mandateAcquired: z.boolean(), mandateDate: date.optional(),
  confidence: number(0, 100), confidenceReason: text(2000), description: text(50000),
  contacts: z.array(z.object({ name: text(), role: text(), email: text(), phone: text(100), isPrivate: z.boolean() }).strict()).max(200),
  documents: z.array(z.object({ name: text(), size: text(100), type: text(100), uploadDate: text(100) }).strict()).max(200),
  auditLog: z.array(z.object({ timestamp: text(100), user: text(), action: text(2000) }).strict()).max(10000),
  isDraft: z.boolean()
}).strict();
export const referentSchema = z.object({
  id: text(100).min(1), name: text().min(1), email: text(), role: text(), department: text(), archived: z.boolean().optional()
}).strict();
export const datasetSchema = z.object({
  deals: z.array(dealSchema).max(5000), referents: z.array(referentSchema).max(1000)
}).strict().refine(v => new Set(v.deals.map(d => d.id)).size === v.deals.length && new Set(v.referents.map(r => r.id)).size === v.referents.length);

export const loginSchema = z.object({ username: text(100).min(1), password: z.string().min(1).max(1024) }).strict();
