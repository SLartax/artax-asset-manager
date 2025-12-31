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
    let textContent = `Sei un analista esperto di Real Estate e Finanza. Analizza il testo e/o l'immagine forniti (documenti tecnici, perizie, brochure) ed estrai i dati strutturati per il database Artax.`;
    
    if (input.text) {
      textContent += `\n\nTesto dell'operazione: ${input.text}`;
    }
    
    const systemPrompt = 'You are an expert analyst in Real Estate and Finance. Analyze the provided text and extract structured data for the Artax database. Return a JSON object with: {title, category, subType, location, indicativeValue, roi, cagr, description, ndaSigned, mandateAcquired, priority, signals, confidence, confidenceReason}';
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      max_tokens: 2048,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: textContent,
        },
      ],
    });
    
    const textResponse = response.choices[0]?.message?.content || '';
    const result = JSON.parse(textResponse || '{}');
    
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
