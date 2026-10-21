import { Deal } from '../types';
import { classificationSchema, inputSchema } from '../shared/schemas.mjs';
import { api } from './api';
export interface ClassificationInput { text?: string; image?: { mimeType: string; data: string }; }
export const classifyWithAI = async (input: ClassificationInput): Promise<Partial<Deal>> => {
  const result = classificationSchema.parse(await api('/api/classify', 'POST', inputSchema.parse(input)));
  const { roi, cagr, ...fields } = result;
  return { ...fields, roi: roi ?? undefined, cagr: cagr ?? undefined, isDraft: true } as Partial<Deal>;
};
