
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Role, DealStatus, Deal, Referent } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DealTable from './components/DealTable';
import DealDetailView from './components/DealDetailView';
import ImportModule from './components/ImportModule';
import ReferentsManager from './components/ReferentsManager';

import Login from './components/Login';
import { session, logout, readDataset, writeDataset, Session } from './services/api';

const App: React.FC = () => {
  const [user, setUser] = useState<Session | null>(null);
  const currentUserRole = user?.role || Role.VIEWER;
  const [saving, setSaving] = useState(false);
  const saveLock = useRef(false);
  const revision = useRef(0);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'import' | 'referents'>('list');

  const [deals, setDeals] = useState<Deal[]>([]);
  const [referents, setReferents] = useState<Referent[]>([]);
  const visibleReferents = referents.filter(r => !r.archived);
  const loadSession = async (value: Session) => {
    const data = await readDataset();
    setDeals(data.deals); setReferents(data.referents); revision.current = data.revision; setUser(value);
  };
  useEffect(() => { session().then(loadSession).catch(() => setUser(null)); }, []);
  const persist = async (nextDeals: Deal[], nextReferents = referents) => {
    if (saveLock.current) return false;
    saveLock.current = true; setSaving(true);
    try {
      const data = await writeDataset({ deals: nextDeals, referents: nextReferents }, revision.current);
      setDeals(data.deals); setReferents(data.referents); revision.current = data.revision;
      return true;
    } catch (err) { alert(err instanceof Error ? err.message : 'Salvataggio non riuscito'); return false; }
    finally { saveLock.current = false; setSaving(false); }
  };
  const migrateBrowserData = async () => {
    if (!window.confirm('Importare i dati di questo browser nel server autenticato? Gli originali locali verranno conservati.')) return;
    try {
      const savedDeals = localStorage.getItem('artax_deals');
      const savedReferents = localStorage.getItem('artax_referents');
      if (!savedDeals && !savedReferents) { alert('Nessun dato locale disponibile'); return; }
      await persist(savedDeals ? JSON.parse(savedDeals) : [], savedReferents ? JSON.parse(savedReferents) : []);
    } catch { alert('Dati locali non validi: gli originali sono stati conservati'); }
  };

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

  const handleAddDeal = async (newDeal: Deal) => {
    if (await persist([newDeal, ...deals])) setActiveTab('list');
  };
  const handleUpdateDeal = async (updatedDeal: Deal) => {
    await persist(deals.map(d => d.id === updatedDeal.id ? updatedDeal : d));
  };
  const handleDeleteDeal = async (id: string) => {
    if (window.confirm(`Archiviare la pratica ${id}? I dati saranno conservati.`)) {
      await persist(deals.map(d => d.id === id ? { ...d, status: DealStatus.ARCHIVIATA } : d));
    }
  };
  const handleAddReferents = async (newReferents: Referent[]) => { await persist(deals, [...referents, ...newReferents]); };
  const handleDeleteReferent = async (id: string) => {
    if (window.confirm('Archiviare il referente? I dati saranno conservati.')) {
      await persist(deals, referents.map(r => r.id === id ? { ...r, archived: true } : r));
    }
  };
  if (!user) return <Login onLogin={loadSession} />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        currentRole={currentUserRole} 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedDealId(null);
        }} 
      />

      <main className="flex-1 flex flex-col p-8 overflow-y-auto" aria-busy={saving} style={{ pointerEvents: saving ? 'none' : 'auto' }}>
        <div className="mb-4 flex gap-3 text-sm">
          <span>{user.username} · {user.role}{saving ? ' · Salvataggio...' : ''}</span>
          <button onClick={async () => { try { await logout(); setUser(null); setDeals([]); setReferents([]); } catch { alert('Uscita non riuscita'); } }}>Esci</button>
          {user.role === Role.ADMIN && deals.length === 0 && referents.length === 0 && <>
            <button onClick={migrateBrowserData}>Importa dati esistenti dal browser</button>
          </>}
        </div>
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
            referents={visibleReferents}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard kpis={kpis} deals={deals} onDealSelect={setSelectedDealId} />}
            {activeTab === 'list' && (
              <DealTable 
                deals={deals} 
                referents={visibleReferents}
                onDealSelect={setSelectedDealId} 
                onDeleteDeal={handleDeleteDeal} 
                onUpdateDeal={handleUpdateDeal}
              />
            )}
            {activeTab === 'referents' && (
              <ReferentsManager 
                referents={visibleReferents}
                onAdd={handleAddReferents} 
                onDelete={handleDeleteReferent} 
              />
            )}
            {activeTab === 'import' && (
              <ImportModule 
                onSave={handleAddDeal} 
                onUpdate={handleUpdateDeal} 
                existingDeals={deals}
                referents={visibleReferents}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
