
import React, { useState, useMemo, useEffect } from 'react';
import { Role, Category, DealStatus, Priority, Deal, Referent } from './types';
import { INITIAL_DEALS, INITIAL_REFERENTS } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DealTable from './components/DealTable';
import DealDetailView from './components/DealDetailView';
import ImportModule from './components/ImportModule';
import ReferentsManager from './components/ReferentsManager';

const App: React.FC = () => {
  const [currentUserRole, setCurrentUserRole] = useState<Role>(Role.ADMIN);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'import' | 'referents'>('list');

  // Stato con inizializzazione sicura
  const [deals, setDeals] = useState<Deal[]>(() => {
    try {
      const saved = localStorage.getItem('artax_deals');
      if (!saved) return INITIAL_DEALS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEALS;
    } catch (e) {
      return INITIAL_DEALS;
    }
  });

  const [referents, setReferents] = useState<Referent[]>(() => {
    try {
      const saved = localStorage.getItem('artax_referents');
      if (!saved) return INITIAL_REFERENTS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_REFERENTS;
    } catch (e) {
      return INITIAL_REFERENTS;
    }
  });

  // Persistenza
  useEffect(() => {
    localStorage.setItem('artax_deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('artax_referents', JSON.stringify(referents));
  }, [referents]);

  const selectedDeal = useMemo(() => 
    deals.find(d => d.id === selectedDealId) || null
  , [deals, selectedDealId]);

  const kpis = useMemo(() => {
    const validDeals = deals.filter(d => d.status !== DealStatus.ARCHIVIATA);
    return {
      active: validDeals.length,
      totalValue: deals.reduce((acc, d) => acc + d.indicativeValue, 0),
      avgRoi: deals.reduce((acc, d) => acc + (d.roi || 0), 0) / (deals.filter(d => d.roi).length || 1),
      pendingNda: deals.filter(d => !d.ndaSigned).length,
      pendingMandate: deals.filter(d => !d.mandateAcquired).length
    };
  }, [deals]);

  const handleAddDeal = (newDeal: Deal) => {
    setDeals(prev => [newDeal, ...prev]);
    setActiveTab('list');
  };

  const handleUpdateDeal = (updatedDeal: Deal) => {
    setDeals(prev => prev.map(d => d.id === updatedDeal.id ? updatedDeal : d));
  };

  const handleDeleteDeal = (id: string) => {
    if (window.confirm(`Eliminare definitivamente la pratica ${id}?`)) {
      setDeals(prev => prev.filter(d => d.id !== id));
      if (selectedDealId === id) setSelectedDealId(null);
    }
  };

  const handleAddReferents = (newReferents: Referent[]) => {
    setReferents(prev => [...prev, ...newReferents]);
  };

  const handleDeleteReferent = (id: string) => {
    if (window.confirm("Rimuovere il referente dall'anagrafica?")) {
      setReferents(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        currentRole={currentUserRole} 
        onRoleChange={setCurrentUserRole} 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedDealId(null);
        }} 
      />

      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Artax Deal Manager</h1>
            <p className="text-slate-500 text-sm font-medium">Intelligence Asset Management Database</p>
          </div>
          <button 
            onClick={() => { setActiveTab('import'); setSelectedDealId(null); }}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Nuova Operazione
          </button>
        </header>

        {selectedDeal ? (
          <DealDetailView 
            deal={selectedDeal} 
            onBack={() => setSelectedDealId(null)} 
            onUpdate={handleUpdateDeal}
            onDelete={handleDeleteDeal}
            role={currentUserRole}
            deals={deals}
            referents={referents}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard kpis={kpis} deals={deals} onDealSelect={setSelectedDealId} />}
            {activeTab === 'list' && (
              <DealTable 
                deals={deals} 
                referents={referents}
                onDealSelect={setSelectedDealId} 
                onDeleteDeal={handleDeleteDeal} 
                onUpdateDeal={handleUpdateDeal}
              />
            )}
            {activeTab === 'referents' && (
              <ReferentsManager 
                referents={referents} 
                onAdd={handleAddReferents} 
                onDelete={handleDeleteReferent} 
              />
            )}
            {activeTab === 'import' && (
              <ImportModule 
                onSave={handleAddDeal} 
                onUpdate={handleUpdateDeal} 
                existingDeals={deals}
                referents={referents}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
