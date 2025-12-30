
import { Category, DealStatus, Priority, Deal, Referent } from './types';

export const CLASSIFICATION_RULES = {
  categories: {
    [Category.FINANCE]: ['superbonus', 'crediti', 'factoring', 'cartolarizzazione', 'tax', 'imposta', 'bancario'],
    [Category.REAL_ESTATE]: ['immobile', 'appartamento', 'sviluppo', 'npl', 'utp', 'terreno', 'locazione', 'cielo-terra'],
    [Category.CORPORATE]: ['m&a', 'azienda', 'ramo', 'affitto', 'conferimento', 'joint venture', 'startup', 'ebitda']
  },
  locations: ['Milano', 'Roma', 'Torino', 'Napoli', 'Bologna', 'Firenze', 'Venezia', 'Verona', 'Genova'],
  ndaKeywords: ['nda', 'riservatezza', 'accordo', 'confidenzialità'],
  mandateKeywords: ['mandato', 'incarico', 'procura', 'esclusiva']
};

export const INITIAL_REFERENTS: Referent[] = [
  { id: 'REF-001', name: 'Mario Bianchi', email: 'm.bianchi@nexus.it', role: 'Senior Analyst', department: 'Finance' },
  { id: 'REF-002', name: 'Elena Verdi', email: 'e.verdi@nexus.it', role: 'Associate', department: 'Real Estate' },
  { id: 'REF-003', name: 'Luca Neri', email: 'l.neri@nexus.it', role: 'Manager', department: 'Corporate M&A' },
  { id: 'REF-004', name: 'Sara Rossi', email: 's.rossi@nexus.it', role: 'Junior Analyst', department: 'Finance' }
];

export const INITIAL_DEALS: Deal[] = [
  {
    id: "PRAT-20240115-7421",
    title: "Cessione Crediti Superbonus 110% - Pacchetto Condomini",
    category: Category.FINANCE,
    subType: "Cessione Crediti",
    location: "Milano, Italia",
    valueRange: "5M - 10M",
    indicativeValue: 7500000,
    currency: "EUR",
    cagr: 12.5,
    roi: 18.0,
    signals: [{ label: "Credito Certificato", score: 9 }, { label: "Urgenza Liquidità", score: 7 }],
    internalReferent: "Mario Bianchi",
    client: "Costruzioni Italia Srl",
    insertionDate: "2024-01-15",
    status: DealStatus.DUE_DILIGENCE,
    priority: Priority.HIGH,
    ndaSigned: true,
    ndaDate: "2024-01-10",
    mandateAcquired: true,
    mandateDate: "2024-01-12",
    confidence: 95,
    confidenceReason: "Documentazione tecnica completa e asseverata.",
    description: "Cessione pro-soluto di crediti d'imposta derivanti da interventi Superbonus per un totale di 7.5M di valore nominale.",
    contacts: [{ name: "Ing. Rossi", role: "Tecnico", email: "rossi@email.it", phone: "+39 02 123456", isPrivate: false }],
    documents: [],
    auditLog: [{ timestamp: "2024-01-15 10:00", user: "Admin", action: "Creazione Pratica" }],
    isDraft: false
  },
  {
    id: "PRAT-20240201-1093",
    title: "Acquisto Immobile a Reddito - Logistica",
    category: Category.REAL_ESTATE,
    subType: "Investimento a Reddito",
    location: "Torino, Italia",
    valueRange: "1M - 5M",
    indicativeValue: 3200000,
    currency: "EUR",
    roi: 6.2,
    signals: [{ label: "Immobile Locato", score: 10 }, { label: "Sconto Elevato", score: 4 }],
    internalReferent: "Elena Verdi",
    client: "Private Investor",
    insertionDate: "2024-02-01",
    status: DealStatus.ANALISI,
    priority: Priority.MEDIUM,
    ndaSigned: true,
    ndaDate: "2024-01-28",
    mandateAcquired: false,
    confidence: 80,
    confidenceReason: "Dati estratti da brochure commerciale ufficiale.",
    description: "Capannone logistico di 4000mq locato a multinazionale con contratto 6+6.",
    contacts: [],
    documents: [],
    auditLog: [],
    isDraft: false
  }
];
