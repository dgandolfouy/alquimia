import { Wallet, TransactionFeeling, TransmutationList, Entity, Asset, Category } from './types';

export const DEFAULT_ASSETS: Asset[] = [
  { id: 'asset-1', name: 'Sueldo Principal', amount: 0 },
];

export const DEFAULT_WALLETS: Wallet[] = [
  { id: 'wal-1', name: 'Efectivo', type: 'cash' },
  { id: 'wal-2', name: 'Débito Principal', type: 'debit' },
];

export const DEFAULT_ENTITIES: Entity[] = [
  { id: 'ent-1', name: 'Hogar' },
  { id: 'ent-2', name: 'Personal' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Alimentación', icon: 'Utensils' },
  { id: 'cat-2', name: 'Transporte', icon: 'Car' },
  { id: 'cat-3', name: 'Vivienda', icon: 'Home' },
  { id: 'cat-4', name: 'Entretenimiento', icon: 'Gamepad2' },
  { id: 'cat-5', name: 'Salud', icon: 'HeartPulse' },
  { id: 'cat-6', name: 'Educación', icon: 'GraduationCap' },
  { id: 'cat-7', name: 'Ropa', icon: 'Shirt' },
  { id: 'cat-8', name: 'Tecnología', icon: 'Smartphone' },
  { id: 'cat-9', name: 'Viajes', icon: 'Plane' },
  { id: 'cat-10', name: 'Suscripciones', icon: 'Repeat' },
  { id: 'cat-11', name: 'Ingresos', icon: 'Wallet' },
  { id: 'cat-0', name: 'Otros', icon: 'HelpCircle' },
];

export const FEELING_OPTIONS: { [key in TransactionFeeling]: { label: string, color: string, icon: string } } = {
  necessary: { label: 'Necesario', color: 'bg-gray-400 dark:bg-gray-500', icon: 'Meh' },
  pleasure: { label: 'Placer', color: 'bg-emerald-500', icon: 'Smile' },
  regret: { label: 'Arrepentimiento', color: 'bg-rose-500', icon: 'Frown' },
};

export const DEFAULT_TRANSMUTATION_LISTS: TransmutationList[] = [
  {
    id: 'list-cc',
    name: 'Tarjetas de Crédito',
    items: [],
    isCreditCardView: true
  },
];