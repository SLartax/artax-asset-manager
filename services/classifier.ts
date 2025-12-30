
import { GoogleGenAI, Type } from "@google/genai";
import { Category, DealStatus, Priority, Deal } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface ClassificationInput {
  text?: string;
  image?: {
    mimeType: string;
    data: string; // base64
  };
}

export const classifyWithAI = async (input: ClassificationInput): Promise<Partial<Deal>> => {
  try {
    const parts: any[] = [];
    
    if (input.text) {
      parts.push({ text: `Testo dell'operazione: ${input.text}` });
    }
    
    if (input.image) {
      parts.push({
        inlineData: {
          mimeType: input.image.mimeType,
          data: input.image.data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: "Sei un analista esperto di Real Estate e Finanza. Analizza il testo e/o l'immagine forniti (documenti tecnici, perizie, brochure) ed estrai i dati strutturati per il database Artax." },
          ...parts
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Un titolo professionale (es. Complesso Immobiliare Grottaferrata)." },
            category: { type: Type.STRING, enum: Object.values(Category) },
            subType: { type: Type.STRING, description: "Sottocategoria (es. Sviluppo, Cielo-Terra, NPL)." },
            location: { type: Type.STRING, description: "Città/Località specifica." },
            indicativeValue: { type: Type.NUMBER, description: "Valore monetario stimato." },
            roi: { type: Type.NUMBER },
            cagr: { type: Type.NUMBER },
            description: { type: Type.STRING, description: "Sintesi esecutiva includendo superfici mq se presenti." },
            ndaSigned: { type: Type.BOOLEAN },
            mandateAcquired: { type: Type.BOOLEAN },
            priority: { type: Type.STRING, enum: Object.values(Priority) },
            signals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  score: { type: Type.NUMBER }
                },
                required: ["label", "score"]
              }
            },
            confidence: { type: Type.NUMBER },
            confidenceReason: { type: Type.STRING }
          },
          required: ["title", "category", "location", "indicativeValue", "confidence"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      ...result,
      status: DealStatus.ANALISI,
      insertionDate: new Date().toISOString().split('T')[0],
      isDraft: true
    };
  } catch (error) {
    console.error("AI Classification Error:", error);
    return {
      title: "Errore Analisi Documento",
      category: Category.REAL_ESTATE,
      location: "Da definire",
      confidence: 0,
      confidenceReason: "L'analisi multimodale è fallita."
    };
  }
};
