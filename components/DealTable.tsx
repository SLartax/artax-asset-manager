
import React, { useState } from 'react';
import { Deal, Category, Referent, DealStatus, Priority } from '../types';

interface DealTableProps {
  deals: Deal[];
  referents: Referent[];
  onDealSelect: (id: string) => void;
  onDeleteDeal: (id: string) => void;
  onUpdateDeal: (deal: Deal) => void;
}

const DealTable: React.FC<DealTableProps> = ({ deals, referents, onDealSelect, onDeleteDeal, onUpdateDeal }) => {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("Tutte");

  const filteredDeals = deals.filter(d => {
    const term = search.toLowerCase();
    return (
      d.title.toLowerCase().includes(term) || 
      d.id.toLowerCase().includes(term) || 
      d.location.toLowerCase().includes(term) ||
      d.internalReferent.toLowerCase().includes(term)
    ) && (filterCategory === "Tutte" || d.category === filterCategory);
  });

  const handleFieldChange = (deal: Deal, field: keyof Deal, value: any) => {
    onUpdateDeal({ ...deal, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-fadeIn">
      {/* Barra di ricerca e Filtri */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 min-w-[300px] relative">
          <input 
            type="text" 
            placeholder="Cerca per ID, Titolo, Località..." 
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <select 
          className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="Tutte">Tutte le Categorie</option>
          {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-bold border-b border-slate-200">
              <th className="px-6 py-4 text-center w-12">#</th>
              <th className="px-6 py-4">Fascicolo</th>
              <th className="px-6 py-4">Referente Responsabile</th>
              <th className="px-6 py-4">Status & Priorità</th>
              <th className="px-6 py-4">Valore (€)</th>
              <th className="px-6 py-4 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDeals.map((deal, index) => (
              <tr 
                key={deal.id} 
                className="hover:bg-slate-50/50 transition-colors duration-150"
              >
                <td className="px-6 py-4 text-center text-slate-300 text-[10px] font-mono">
                  {index + 1}
                </td>
                
                {/* ID / Titolo - Cliccabile solo qui */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter mb-0.5">{deal.id}</span>
                    <button 
                      onClick={() => onDealSelect(deal.id)}
                      className="text-left font-bold text-slate-900 hover:text-indigo-600 hover:underline transition-all decoration-indigo-300 underline-offset-4"
                    >
                      {deal.title}
                    </button>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 uppercase font-medium">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      {deal.location}
                    </div>
                  </div>
                </td>

                {/* Referente */}
                <td className="px-6 py-4">
                  <select 
                    value={deal.internalReferent}
                    onChange={(e) => handleFieldChange(deal, 'internalReferent', e.target.value)}
                    className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none hover:border-slate-300 transition"
                  >
                    {referents.map(ref => <option key={ref.id} value={ref.name}>{ref.name}</option>)}
                  </select>
                </td>

                {/* Status / Priorità */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-tighter w-fit ${
                      deal.status === DealStatus.ARCHIVIATA ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                    }`}>
                      {deal.status}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-tighter w-fit ${
                      deal.priority === Priority.HIGH ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      Priorità {deal.priority}
                    </span>
                  </div>
                </td>

                {/* Valore */}
                <td className="px-6 py-4">
                  <div className="text-sm font-black text-slate-800">
                    {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(deal.indicativeValue)}
                  </div>
                  {deal.roi && <div className="text-[10px] text-emerald-600 font-bold">ROI: {deal.roi}%</div>}
                </td>

                {/* Azioni Esplicite */}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center gap-2">
                    {/* Bottone Apri */}
                    <button 
                      onClick={() => onDealSelect(deal.id)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Apri Dettaglio"
                    >
                      <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>

                    {/* Bottone Elimina - Completamente isolato */}
                    <button 
                      onClick={() => onDeleteDeal(deal.id)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-red-600 rounded-lg transition-all"
                      title="Elimina Definitivamente"
                    >
                      <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredDeals.length === 0 && (
        <div className="p-16 text-center text-slate-400 font-medium italic bg-slate-50/50">
          Nessuna pratica trovata con i filtri attuali.
        </div>
      )}
    </div>
  );
};

export default DealTable;
