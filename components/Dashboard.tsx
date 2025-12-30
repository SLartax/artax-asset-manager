
import React from 'react';
import { Deal } from '../types';

interface DashboardProps {
  kpis: {
    active: number;
    totalValue: number;
    avgRoi: number;
    pendingNda: number;
    pendingMandate: number;
  };
  deals: Deal[];
  onDealSelect: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ kpis, deals, onDealSelect }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Pratiche Attive</p>
          <p className="text-2xl font-bold text-slate-900">{kpis.active}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Valore Totale</p>
          <p className="text-2xl font-bold text-indigo-600">{formatCurrency(kpis.totalValue)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">ROI Medio</p>
          <p className="text-2xl font-bold text-emerald-600">{kpis.avgRoi.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">In attesa NDA</p>
          <p className="text-2xl font-bold text-red-600">{kpis.pendingNda}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-orange-100 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">In attesa Mandato</p>
          <p className="text-2xl font-bold text-orange-600">{kpis.pendingMandate}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deals */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Operazioni Recenti</h3>
            <button className="text-indigo-600 text-xs font-medium hover:underline">Vedi tutto</button>
          </div>
          <div className="divide-y divide-slate-100">
            {deals.slice(0, 5).map(deal => (
              <div 
                key={deal.id} 
                onClick={() => onDealSelect(deal.id)}
                className="p-4 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{deal.title}</p>
                  <p className="text-xs text-slate-500">{deal.category} • {deal.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">{formatCurrency(deal.indicativeValue)}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    deal.priority === 'Alta' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {deal.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Messages & Actions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">Azioni Consigliate</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
              <div className="p-2 bg-indigo-100 rounded text-indigo-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-900">Validazione dati richiesta</p>
                <p className="text-xs text-indigo-700">3 nuove pratiche importate automaticamente necessitano di conferma manuale.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
              <div className="p-2 bg-amber-100 rounded text-amber-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900">NDA in scadenza</p>
                <p className="text-xs text-amber-700">La pratica FIN-2024-001 ha l'NDA in scadenza tra 5 giorni.</p>
              </div>
            </div>
          </div>
          <div className="pt-2">
            <button className="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition">
              Scarica Report Settimanale (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
