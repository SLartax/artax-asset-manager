
import React, { useState } from 'react';
import { Deal, Role, DealStatus, Referent } from '../types';
import ImportModule from './ImportModule';

interface DealDetailViewProps {
  deal: Deal;
  onBack: () => void;
  onUpdate: (deal: Deal) => void;
  onDelete: (id: string) => void;
  role: Role;
  deals: Deal[];
  referents: Referent[];
}

const DealDetailView: React.FC<DealDetailViewProps> = ({ deal, onBack, onUpdate, onDelete, role, deals, referents }) => {
  const [activeSection, setActiveSection] = useState<'sintesi' | 'parti' | 'economica' | 'documenti' | 'audit'>('sintesi');
  const [showEnrichForm, setShowEnrichForm] = useState(false);

  const updateStatus = (status: DealStatus) => {
    onUpdate({ ...deal, status });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val);
  };

  const canEdit = role === Role.ADMIN || role === Role.MANAGER || role === Role.OPERATOR;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-md flex flex-col min-h-[600px] animate-fadeIn">
      {/* Header Detail */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-200">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-slate-400">{deal.id}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${deal.isDraft ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>
                {deal.isDraft ? 'Da Validare' : 'Consolidato'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{deal.title}</h2>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <div className="flex items-center gap-2">
              <select 
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-indigo-500"
                  value={deal.status}
                  onChange={(e) => updateStatus(e.target.value as DealStatus)}
              >
                  {Object.values(DealStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button 
                onClick={() => onDelete(deal.id)}
                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition border border-red-200"
                title="Elimina Fascicolo"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          )}
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm">
            Esporta PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-slate-100 flex gap-6">
        {[
          { id: 'sintesi', label: 'Sintesi' },
          { id: 'parti', label: 'Parti & Ruoli' },
          { id: 'economica', label: 'Dati Economici' },
          { id: 'documenti', label: 'Documenti & Analisi' },
          { id: 'audit', label: 'Audit Log' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveSection(tab.id as any); setShowEnrichForm(false); }}
            className={`py-4 text-sm font-medium border-b-2 transition ${
              activeSection === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {activeSection === 'sintesi' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <section>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Descrizione Operazione</h4>
                <p className="text-slate-700 leading-relaxed text-sm bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                  "{deal.description}"
                </p>
              </section>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Categoria</span>
                  <span className="font-semibold text-slate-900">{deal.category}</span>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Località</span>
                  <span className="font-semibold text-slate-900">{deal.location}</span>
                </div>
              </div>
              <section>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-tighter">Deal Signals (AI Intelligence)</h4>
                <div className="flex flex-wrap gap-2">
                  {deal.signals.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                      <span className="text-xs font-medium text-slate-700">{s.label}</span>
                      <span className={`text-xs font-bold ${s.score > 7 ? 'text-emerald-600' : 'text-indigo-600'}`}>{s.score}/10</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            
            <div className="space-y-6">
               <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 shadow-sm">
                <h4 className="text-xs font-bold text-indigo-900 uppercase mb-3">Compliance Quick Check</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-indigo-700">NDA Firmato</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${deal.ndaSigned ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'}`}>
                      {deal.ndaSigned ? 'SI' : 'NO'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-indigo-700">Mandato</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${deal.mandateAcquired ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'}`}>
                      {deal.mandateAcquired ? 'SI' : 'NO'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Referente Interno</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold uppercase">
                    {deal.internalReferent.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{deal.internalReferent}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Asset Management Team</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'economica' && (
          <div className="max-w-3xl space-y-8 animate-fadeIn">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Valutazione Finanziaria</h4>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs text-slate-500 mb-1">Valore Indicativo</span>
                    <span className="text-2xl font-bold text-slate-900">{formatCurrency(deal.indicativeValue)}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 mb-1">Range Valutazione</span>
                    <span className="text-sm font-semibold text-slate-700">{deal.valueRange}</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">KPI Proposti</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-sm text-slate-600 font-medium">ROI Atteso</span>
                    <span className="text-lg font-bold text-emerald-600">{deal.roi ? `${deal.roi}%` : 'N/D'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-sm text-slate-600 font-medium">CAGR stimato</span>
                    <span className="text-lg font-bold text-indigo-600">{deal.cagr ? `${deal.cagr}%` : 'N/D'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-medium">Livello di Rischio</span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg uppercase">Medio</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'documenti' && (
           <div className="space-y-6 animate-fadeIn">
            {!showEnrichForm ? (
              <>
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Documentazione & Allegati</h4>
                  <button 
                    onClick={() => setShowEnrichForm(true)}
                    className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition"
                  >
                    + Analizza Nuovo Documento
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deal.documents.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition cursor-pointer group">
                      <div className="p-2 bg-slate-100 text-slate-500 rounded group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{doc.type} • {doc.size} • {doc.uploadDate}</p>
                      </div>
                    </div>
                  ))}
                  {deal.documents.length === 0 && (
                    <div className="md:col-span-2 py-12 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                       <p className="text-slate-400 text-sm font-medium">Nessun documento caricato per questa pratica.</p>
                       <button onClick={() => setShowEnrichForm(true)} className="mt-4 text-indigo-600 text-xs font-bold hover:underline">Avvia Analisi Intelligente</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="animate-slideUp">
                <button 
                  onClick={() => setShowEnrichForm(false)}
                  className="mb-4 text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 uppercase"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                  Annulla ed Esci dall'analisi
                </button>
                <ImportModule 
                  onSave={() => {}} 
                  onUpdate={(updated) => { onUpdate(updated); setShowEnrichForm(false); }}
                  existingDeals={deals}
                  referents={referents}
                  initialMode="enrich"
                  targetDealId={deal.id}
                />
              </div>
            )}
          </div>
        )}

        {activeSection === 'audit' && (
           <div className="space-y-4 max-w-2xl animate-fadeIn">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Registro Cronologico Operazioni</h4>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
              {deal.auditLog.map((log, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-5 top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${i === deal.auditLog.length - 1 ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                       <p className="text-sm font-bold text-slate-900">{log.user}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{log.timestamp}</p>
                    </div>
                    <p className="text-sm text-slate-600">{log.action}</p>
                  </div>
                </div>
              )).reverse()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealDetailView;
