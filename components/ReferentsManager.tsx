
import React, { useState } from 'react';
import { Referent } from '../types';

interface ReferentsManagerProps {
  referents: Referent[];
  onAdd: (referents: Referent[]) => void;
  onDelete: (id: string) => void;
}

const ReferentsManager: React.FC<ReferentsManagerProps> = ({ referents, onAdd, onDelete }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRef, setNewRef] = useState({ name: '', email: '', role: '', department: 'Finance' });

  const processCsvFile = (file: File) => {
    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 2) {
          alert("Il file sembra vuoto o contiene solo l'intestazione.");
          return;
        }

        // Rilevamento automatico del separatore
        const firstLine = lines[0];
        const delimiters = [';', ',', '\t'];
        const sep = delimiters.sort((a,b) => firstLine.split(b).length - firstLine.split(a).length)[0];
        
        const headers = firstLine.split(sep).map(h => h.trim().toUpperCase().replace(/["']/g, ''));
        
        // --- LOGICA SMART MAPPING ---
        let nameIdx = headers.findIndex(h => h.includes('AMMINIS') || h.includes('NOME') || h.includes('NAME') || h.includes('SOGGETTO'));
        let emailIdx = headers.findIndex(h => h.includes('PEC') || h.includes('MAIL') || h.includes('EMAIL'));
        let roleIdx = headers.findIndex(h => h.includes('RUOLO') || h.includes('ROLE') || h.includes('QUALIFICA'));

        // Se non trovo per nome colonna, provo per contenuto (primi 3 record)
        if (emailIdx === -1 || nameIdx === -1) {
          const sampleRow = lines[1].split(sep);
          sampleRow.forEach((cell, idx) => {
            if (cell.includes('@') && emailIdx === -1) emailIdx = idx;
            else if (cell.length > 3 && !cell.includes('@') && isNaN(Number(cell)) && nameIdx === -1) nameIdx = idx;
          });
        }

        if (nameIdx === -1 || emailIdx === -1) {
          alert("Impossibile mappare le colonne del CSV. Assicurati che siano presenti almeno un nome e un'email.");
          return;
        }

        const newItems: Referent[] = [];
        lines.slice(1).forEach((line, i) => {
          const cells = line.split(sep).map(c => c.trim().replace(/["']/g, ''));
          const name = cells[nameIdx];
          const email = cells[emailIdx];
          
          if (name && email && email.includes('@')) {
            const alreadyExists = referents.some(r => r.email.toLowerCase() === email.toLowerCase()) || 
                                 newItems.some(r => r.email.toLowerCase() === email.toLowerCase());
            
            if (!alreadyExists) {
              newItems.push({
                id: `REF-${Date.now()}-${i}`,
                name: name,
                email: email,
                role: roleIdx !== -1 ? cells[roleIdx] : 'Referente Esterno',
                department: 'General'
              });
            }
          }
        });

        if (newItems.length > 0) {
          onAdd(newItems);
          alert(`Importazione riuscita: ${newItems.length} nuovi contatti aggiunti.`);
        } else {
          alert("Nessun nuovo contatto trovato nel file (controlla se sono già presenti in anagrafica).");
        }
      } catch (err) {
        alert("Errore durante l'elaborazione del file.");
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRef.name || !newRef.email) return;
    onAdd([{ id: `REF-${Date.now()}`, ...newRef }]);
    setNewRef({ name: '', email: '', role: '', department: 'Finance' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Drop Zone */}
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files[0]) processCsvFile(e.dataTransfer.files[0]); }}
        className={`p-10 rounded-2xl border-2 border-dashed transition-all flex flex-col md:flex-row items-center justify-between gap-6 ${
          isDragging ? 'bg-indigo-50 border-indigo-500 scale-[1.01]' : 'bg-white border-slate-200'
        }`}
      >
        <div>
          <h2 className="text-xl font-bold text-slate-900">Anagrafica Referenti</h2>
          <p className="text-sm text-slate-500 mt-1">Trascina qui un CSV (es. esportazione da gestionali o elenchi PEC) per caricare i contatti.</p>
        </div>
        <div className="flex gap-3">
          <input type="file" accept=".csv" className="hidden" id="csv-upload" onChange={(e) => e.target.files?.[0] && processCsvFile(e.target.files[0])} />
          <label htmlFor="csv-upload" className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 cursor-pointer transition shadow-sm">
            Carica CSV
          </label>
          <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg transition">
            Nuovo Manuale
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <tr>
              <th className="px-6 py-4">Soggetto / Nominativo</th>
              <th className="px-6 py-4">Ruolo</th>
              <th className="px-6 py-4">Contatto PEC/Mail</th>
              <th className="px-6 py-4 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {referents.map(ref => (
              <tr key={ref.id} className="hover:bg-slate-50 transition group">
                <td className="px-6 py-4 font-bold text-slate-900 uppercase text-xs">{ref.name}</td>
                <td className="px-6 py-4 text-xs text-slate-600">{ref.role}</td>
                <td className="px-6 py-4 text-xs font-mono text-indigo-600">{ref.email}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onDelete(ref.id)} className="p-2 text-slate-300 hover:text-red-600 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {referents.length === 0 && <div className="p-20 text-center text-slate-400 italic">Nessun referente salvato.</div>}
      </div>

      {/* Modal Manuale */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slideUp">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 uppercase text-sm">Aggiunta Manuale</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">✕</button>
            </div>
            <form onSubmit={handleManualAdd} className="p-6 space-y-4">
              <input required placeholder="Nome o Ragione Sociale" className="w-full p-3 border rounded-xl text-sm" value={newRef.name} onChange={e => setNewRef({...newRef, name: e.target.value})} />
              <input required type="email" placeholder="Email o PEC" className="w-full p-3 border rounded-xl text-sm" value={newRef.email} onChange={e => setNewRef({...newRef, email: e.target.value})} />
              <input placeholder="Ruolo (es. Advisor, Legale)" className="w-full p-3 border rounded-xl text-sm" value={newRef.role} onChange={e => setNewRef({...newRef, role: e.target.value})} />
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg">Salva Contatto</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferentsManager;
