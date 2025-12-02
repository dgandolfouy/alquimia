
export type View = 'home' | 'transactions' | 'transmutar' | 'synthesis' | 'settings';

export type AlchemicalElement = 'Tierra' | 'Agua' | 'Aire' | 'Fuego';

export interface Asset {
  id: string;
  name: string;
  amount: number; // Monthly expected income
}

export interface Entity {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Wallet {
  id: string;
  name: string;
  type: 'cash' | 'debit' | 'credit';
  closingDay?: number;
  dueDay?: number;
}

export type TransactionType = 'income' | 'expense';
export type TransactionFeeling = 'necessary' | 'pleasure' | 'regret';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  listId: string; // Replaces categoryId basically, links to TransmutationList
  categoryId?: string; // Legacy support
  element: AlchemicalElement;
  walletId: string;
  entityId?: string;
  date: string;
  feeling?: TransactionFeeling;
  // Credit Card specifics
  installments?: {
    current: number;
    total: number;
  };
}

export interface Settings {
  hourlyRate: number;
  assets: Asset[]; // New: Active columns
  entities: Entity[];
  // Legacy support or if needed later
  guarantees: any[];
  budgets?: { [key: string]: number };
}

// Updated User type for Firebase
export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

export type Theme = 'light' | 'dark';

export interface TransmutationItem {
  id: string;
  name: string;
  amount: number;
  isCompleted: boolean;
}

export interface TransmutationList {
  id: string;
  name: string;
  items: TransmutationItem[];
  isCreditCardView?: boolean; // Special flag for the CC list
}

export interface HistoricalPrice {
  price: number;
  date: string;
}

export interface HistoricalPriceItem {
  [itemName: string]: HistoricalPrice[];
}