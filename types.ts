export type View = 'home' | 'transactions' | 'transmutar' | 'synthesis' | 'settings';

export type AlchemicalElement = 'Tierra' | 'Agua' | 'Aire' | 'Fuego';

export interface Asset {
  id: string;
  name: string;
  amount: number;
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
  closingDay?: number; // Día de cierre de la tarjeta (ej. 11)
  dueDay?: number;     // Día de vencimiento de la tarjeta (ej. 22)
}

export type TransactionType = 'income' | 'expense';
export type TransactionFeeling = 'necessary' | 'pleasure' | 'regret';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  listId: string;
  categoryId?: string;
  element: AlchemicalElement;
  walletId: string;
  entityId?: string;
  date: string;
  feeling?: TransactionFeeling;
  installments?: {
    current: number; // Número de cuota actual (ej. 1)
    total: number;   // Total de cuotas (ej. 12)
    originalId?: string; // ID para agrupar todas las cuotas de una misma compra
  };
}

export interface Settings {
  hourlyRate: number;
  assets: Asset[];
  entities: Entity[];
  guarantees: any[];
  budgets?: { [key: string]: number };
}

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
  dueDate?: string;
  isRecurring?: boolean;
}

export interface TransmutationList {
  id: string;
  name: string;
  items: TransmutationItem[];
  isCreditCardView?: boolean;
  isLoansView?: boolean;
}

export interface HistoricalPrice {
  price: number;
  date: string;
}

export interface HistoricalPriceItem {
  [itemName: string]: HistoricalPrice[];
}
