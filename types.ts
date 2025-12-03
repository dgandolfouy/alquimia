export type View = 'home' | 'transactions' | 'transmutar' | 'synthesis' | 'settings';
export type AlchemicalElement = 'Tierra' | 'Agua' | 'Aire' | 'Fuego';

export interface Asset {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'bi-monthly' | 'weekly';
  day: number; 
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
  listId: string; 
  element: AlchemicalElement;
  walletId: string;
  date: string;
  feeling?: TransactionFeeling;
  installments?: { current: number; total: number; };
}

export interface Settings {
  hourlyRate: number;
  assets: Asset[]; 
  guarantees: any[];
  budgets?: { [key: string]: number };
  monthlyHours?: number;
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
