
export enum Role {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  OPERATOR = 'Operatore',
  VIEWER = 'Viewer'
}

export enum Category {
  FINANCE = 'Finanziaria',
  REAL_ESTATE = 'Immobiliare',
  CORPORATE = 'Aziendale'
}

export enum DealStatus {
  LEAD = 'Lead',
  ANALISI = 'Analisi',
  DUE_DILIGENCE = 'Due Diligence',
  NEGOZIAZIONE = 'Negoziazione',
  CLOSING = 'Closing',
  ARCHIVIATA = 'Archiviata'
}

export enum Priority {
  HIGH = 'Alta',
  MEDIUM = 'Media',
  LOW = 'Bassa'
}

export interface Referent {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface DealSignal {
  label: string;
  score: number; // 0-10
}

export interface Contact {
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrivate: boolean;
}

export interface DealDocument {
  name: string;
  size: string;
  type: string;
  uploadDate: string;
}

export interface Deal {
  id: string;
  title: string;
  category: Category;
  subType: string;
  location: string;
  valueRange: string;
  indicativeValue: number;
  currency: string;
  cagr?: number;
  roi?: number;
  irr?: number;
  signals: DealSignal[];
  internalReferent: string; // Collegato al nome del Referent
  client: string;
  insertionDate: string;
  status: DealStatus;
  priority: Priority;
  ndaSigned: boolean;
  ndaDate?: string;
  mandateAcquired: boolean;
  mandateDate?: string;
  confidence: number;
  confidenceReason: string;
  description: string;
  contacts: Contact[];
  documents: DealDocument[];
  auditLog: { timestamp: string; user: string; action: string }[];
  isDraft: boolean;
}
