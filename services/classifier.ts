import OpenAI from 'openai';
import { Category, DealStatus, Priority, Deal } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface ClassificationInput {
  text?: string;
  image?: {
    mimeType: string;
    data: string; // base64
  };
}

export const classifyWithAI = async (input: ClassificationInput): Promise<Partial<Deal>> => {
  try {
    const messages: OpenAI.MessageParam[] = [];
    
    let textContent = 'Sei un analista esperto di Real Estate e Finanza. Analizza il testo e/o l'immagine forniti (documenti tecnici, perizie, brochure) ed estrai i dati strutturati per il database Artax.';
    
    if (input.text) {
      textContent += `\n\nTesto dell'operazione: ${input.text}`;
    }
    
    messages.push({
      role: 'user',
      content: textContent,
    });
    
    if (input.image) {
      messages[0].content = [
        {
          type: 'text',
          text: textContent,
        },
        {
          type: 'image',
          image: {
            media_type: input.image.mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: input.image.data,
          },
        },
      ] as unknown as string;
    }
    
    const response = await openai.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: messages,
      system: 'You are an expert analyst in Real Estate and Finance. Analyze the provided text and/or image (technical documents, appraisals, brochures) and extract structured data for the Artax database. Return a JSON object with the following schema: {title, category, subType, location, indicativeValue, roi?, cagr?, description, ndaSigned?, mandateAcquired?, priority, signals?, confidence, confidenceReason}. Always return valid JSON only.',
    }) as any;
    
    const textResponse = response.content[0];
    const jsonText = typeof textResponse === 'object' && 'text' in textResponse ? textResponse.text : '';
    
    const result = JSON.parse(jsonText || '{}');
    
    return {
      ...result,
      status: DealStatus.ANALISI,
      insertionDate: new Date().toISOString().split('T')[0],
      isDraft: true,
    };
  } catch (error) {
    console.error('AI Classification Error:', error);
    return {
      title: 'Errore Analisi Documento',
      category: Category.REAL_ESTATE,
      location: 'Da definire',
      confidence: 0,
      confidenceReason: 'L\'analisi multimodale è fallita.',
    };
  }
};
