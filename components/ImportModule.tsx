
import React, { useState, useCallback, useMemo } from 'react';
import { classifyWithAI, ClassificationInput } from '../services/classifier';
import { Deal, Category, DealStatus, Priority, Referent } from '../types';

interface ImportModuleProps {
  onSave: (deal: Deal) => void;
  onUpdate?: (deal: Deal) => void;
  existingDeals?: Deal[];
  referents: Referent[];
  initialMode?: 'create' | 'enrich';
  targetDealId?: string | null;
}

const ImportModule: React.FC<ImportModuleProps> = ({ 
  onSave, 
  onUpdate, 
  existingDeals = [], 
  referents = [],
  initialMode = 'create',
  targetDealId = null 
}) => {
  const [mode, setMode] = useState<'create' | 'enrich'>(initialMode);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(targetDealId);
  const [selectedReferent, setSelectedReferent] = useState<string>(referents[0]?.name || "Admin");
  const [inputText, setInputText] = useState("");
  const [attachedImage, setAttachedImage] = useState<{mimeType: string, data: string} | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [analysis, setAnalysis] = useState<Partial<Deal> | null>(null);
  const [step, setStep] = useState(1);

  const selectedDeal = useMemo(() => 
    existingDeals.find(d => d.id === selectedDealId)
  , [existingDeals, selectedDealId]);

  const handleAnalyze = async () => {
    if (!inputText.trim() && !attachedImage) return;
    setIsAnalyzing(true);
    setStep(2);
    
    try {
      const input: ClassificationInput = {};
      if (inputText.trim()) input.text = inputText;
      if (attachedImage) input.image = attachedImage;

      const result = await classifyWithAI(input);
      setAnalysis(result);
    } catch (err) {
      alert("Errore durante l'analisi intelligente. Riprova.");
      setStep(1);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;

    // Gestione Immagini (per screenshot di PDF come nell'esempio)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setAttachedImage({ mimeType: file.type, data: base64 });
        setPreviewUrl(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    } 
    // Gestione Testo
    else if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInputText(event.target?.result as string || "");
      };
      reader.readAsText(file);
    } else {
      alert("Formato non supportato. Trascina uno screenshot (PNG/JPG) o un file di testo (.txt/.md).");
    }
  };

  const handleConfirm = () => {
    if (!analysis) return;
    
    if (mode === 'enrich' && selectedDeal && onUpdate) {
      onUpdate({
        ...selectedDeal,
        ...analysis,
        internalReferent: selectedReferent,
        auditLog: [
          ...selectedDeal.auditLog,
          { timestamp: new Date().toLocaleString(), user: "Admin", action: "Arricchimento dati via AI Multimodale" }
        ]
      } as Deal);
    } else {
      const now = new Date();
      const newDeal: Deal = {
        id: `PRAT-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}-${Math.floor(1000+Math.random()*9000)}`,
        title: analysis.title || "Nuova Operazione",
        category: analysis.category || Category.REAL_ESTATE,
        subType: analysis.subType || "Standard",
        location: analysis.location || "Da definire",
        valueRange: analysis.indicativeValue ? `${(analysis.indicativeValue/1000000).toFixed(1)}M` : "N/D",
        indicativeValue: analysis.indicativeValue || 0,
        currency: "EUR",
        signals: analysis.signals || [],
        internalReferent: selectedReferent,
        client: "Lead AI Document",
        insertionDate: now.toISOString().split('T')[0],
        status: DealStatus.ANALISI,
        priority: analysis.priority || Priority.MEDIUM,
        ndaSigned: analysis.ndaSigned || false,
        mandateAcquired: analysis.mandateAcquired || false,
        confidence: analysis.confidence || 0,
        confidenceReason: analysis.confidenceReason || "",
        description: analysis.description || inputText,
        contacts: [],
        documents: [],
        auditLog: [{ timestamp: now.toLocaleString(), user: "Admin", action: "Creazione via Analisi Documentale AI" }],
        isDraft: true,
        roi: analysis.roi,
        cagr: analysis.cagr
      };
      onSave(newDeal);
    }
  };

  const resetFile = () => {
    setAttachedImage(null);
    setPreviewUrl(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {step === 1 && (
        <div className="animate-fadeIn space-y-6">
          <div className="flex p-1 bg-slate-200 rounded-xl w-fit mx-auto">
            <button onClick={() => setMode('create')} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${mode === 'create' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Nuova Pratica</button>
            <button onClick={() => setMode('enrich')} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${mode === 'enrich' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Arricchisci Esistente</button>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mode === 'enrich' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Pratica Target</label>
                    <select value={selectedDealId || ""} onChange={(e) => setSelectedDealId(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm">
                      <option value="">-- Seleziona pratica --</option>
                      {existingDeals.map(d => <option key={d.id} value={d.id}>{d.id} - {d.title}</option>)}
                    </select>
                  </div>
                )}
                <div className={mode === 'create' ? 'md:col-span-2' : ''}>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Responsabile Assegnato</label>
                  <select value={selectedReferent} onChange={(e) => setSelectedReferent(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm">
                    {referents.map(r => <option key={r.id} value={r.name}>{r.name} ({r.department})</option>)}
                  </select>
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="block text-xs font-bold text-slate-400 uppercase">Input Analisi Documentale</label>
                  <span className="text-[10px] text-slate-400 font-bold italic uppercase">Trascina Screenshot, PDF o Testo</span>
                </div>
                
                <div 
                  className={`relative transition-all duration-200 rounded-2xl border-2 border-dashed ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-50 scale-[1.01] shadow-lg' 
                      : attachedImage ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50 shadow-inner'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                >
                  <div className="flex flex-col md:flex-row h-64 overflow-hidden">
                    {previewUrl && (
                      <div className="w-full md:w-1/3 p-4 border-r border-emerald-200 relative">
                        <img src={previewUrl} className="w-full h-full object-cover rounded-lg shadow-md" alt="Preview" />
                        <button onClick={resetFile} className="absolute top-6 right-6 p-1 bg-red-600 text-white rounded-full shadow-xl">✕</button>
                      </div>
                    )}
                    <textarea 
                      className="flex-1 p-6 bg-transparent rounded-2xl text-sm focus:outline-none font-serif leading-relaxed resize-none"
                      placeholder="Incolla testo dell'offerta oppure TRASCINA QUI uno SCREENSHOT del documento tecnico (es. perizia, visura, email)..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                  </div>
                  
                  {isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-indigo-600/10 rounded-2xl backdrop-blur-[1px]">
                      <div className="bg-white px-8 py-4 rounded-full shadow-2xl flex flex-col items-center gap-2 border border-indigo-200 animate-slideUp">
                        <svg className="w-8 h-8 text-indigo-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                        <span className="text-sm font-black text-indigo-600 uppercase">Rilascia il documento qui</span>
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleAnalyze}
                  disabled={(!inputText.trim() && !attachedImage) || (mode === 'enrich' && !selectedDealId)}
                  className="w-full py-5 bg-indigo-600 text-white font-black text-base rounded-2xl hover:bg-indigo-700 shadow-2xl disabled:opacity-50 transition-all flex items-center justify-center gap-3 transform active:scale-95"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  PROCEDI CON ANALISI INTELLIGENTE ARTAX
                </button>
             </div>
          </div>
        </div>
      )}

      {step === 2 && isAnalyzing && (
        <div className="bg-white p-24 rounded-2xl border border-slate-200 shadow-2xl text-center flex flex-col items-center animate-fadeIn">
          <div className="relative mb-10">
             <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"/></svg>
             </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Artax AI sta elaborando il documento...</h3>
          <p className="text-slate-500 text-sm max-w-sm leading-relaxed">Sto leggendo le superfici mq, le particelle catastali e stimando i parametri economici dell'operazione.</p>
          <div className="w-full max-w-xs h-1.5 bg-slate-100 rounded-full mt-8 overflow-hidden">
             <div className="h-full bg-indigo-600 animate-progress"></div>
          </div>
        </div>
      )}

      {step === 2 && !isAnalyzing && analysis && (
        <div className="bg-white p-10 rounded-2xl border-2 border-indigo-50 shadow-2xl animate-slideUp space-y-8">
          <div className="flex justify-between items-start border-b border-slate-100 pb-6">
            <div className="flex-1 pr-4">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-md mb-3 inline-block">Fascicolo Generato da AI</span>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">{analysis.title}</h3>
              <div className="flex items-center gap-3 mt-2">
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${analysis.confidence && analysis.confidence > 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                   Confidenza {analysis.confidence}%
                </div>
                <p className="text-xs text-slate-500 italic">"{analysis.confidenceReason}"</p>
              </div>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${analysis.priority === Priority.HIGH ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-900 text-white'}`}>
              PRIORITÀ {analysis.priority}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Anagrafica Tecnica</label>
                <div className="flex items-center gap-3 mb-2">
                   <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                   <p className="text-sm font-bold text-slate-900">{analysis.location}</p>
                </div>
                <div className="flex items-center gap-3">
                   <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                   <p className="text-sm font-semibold text-slate-700">{analysis.category} • <span className="text-indigo-600">{analysis.subType}</span></p>
                </div>
              </div>
              
              <div className="p-5 bg-indigo-900 rounded-2xl border border-indigo-700 shadow-xl text-white">
                <label className="text-[10px] font-black text-indigo-300 uppercase block mb-2 tracking-widest">Dati Economici di Ingresso</label>
                <div className="flex justify-between items-end">
                   <div>
                     <p className="text-2xl font-black">{new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(analysis.indicativeValue || 0)}</p>
                     <p className="text-[10px] opacity-60">Valore Stimato dell'Operazione</p>
                   </div>
                   {analysis.roi && <div className="text-right">
                      <p className="text-xl font-bold text-emerald-400">+{analysis.roi}%</p>
                      <p className="text-[10px] opacity-60 uppercase">ROI Atteso</p>
                   </div>}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-4 tracking-widest">Punteggio di Opportunità (AI Score)</label>
              <div className="space-y-4">
                {analysis.signals?.map((s, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                       <span className="uppercase tracking-tighter">{s.label}</span>
                       <span>{s.score}/10</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${s.score * 10}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border-2 border-slate-100">
             <label className="text-[10px] font-black text-indigo-600 uppercase block mb-3 tracking-widest">Sintesi dei Beni ed Assetti (OCR + AI)</label>
             <p className="text-sm italic leading-relaxed text-slate-700 border-l-4 border-indigo-200 pl-4">"{analysis.description}"</p>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
            <button onClick={() => setStep(1)} className="px-8 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition">Scarta / Modifica</button>
            <button onClick={handleConfirm} className="px-16 py-4 bg-indigo-600 text-white font-black text-sm rounded-xl shadow-2xl hover:bg-indigo-700 transform hover:-translate-y-1 transition-all active:translate-y-0">
              {mode === 'enrich' ? 'CONFERMA AGGIORNAMENTO FASCICOLO' : 'SALVA NEL DATABASE ATTIVI ARTAX'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportModule;
