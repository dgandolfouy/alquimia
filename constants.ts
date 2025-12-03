import type { Wallet, TransactionFeeling, TransmutationList, Asset, AlchemicalElement } from './types';

export const DEFAULT_ASSETS: Asset[] = [
    { id: 'asset-1', name: 'Sueldo Principal', amount: 0, frequency: 'monthly', day: 1 },
];

export const DEFAULT_WALLETS: Wallet[] = [
    { id: 'wal-1', name: 'Efectivo', type: 'cash' },
    { id: 'wal-2', name: 'Débito Principal', type: 'debit' },
];

export const FEELING_OPTIONS: { [key in TransactionFeeling]: { label: string, color: string, icon: string } } = {
    necessary: { label: 'Necesario', color: 'text-gray-500', icon: 'Meh' },
    pleasure: { label: 'Placer', color: 'text-emerald-500', icon: 'Smile' },
    regret: { label: 'Arrepentimiento', color: 'text-rose-500', icon: 'Frown' },
};

export const DEFAULT_TRANSMUTATION_LISTS: TransmutationList[] = [
    {
        id: 'list-1',
        name: 'Supermercado',
        items: []
    },
    {
        id: 'list-2',
        name: 'Gastos Fijos',
        items: []
    }
];

export const ELEMENT_DEFINITIONS: { [key in AlchemicalElement]: { keyword: string, description: string, color: string } } = {
    Tierra: { keyword: 'Base', description: 'Gastos estructurales (vivienda, deudas)', color: 'text-emerald-500' },
    Agua: { keyword: 'Vida', description: 'Gastos variables del día a día (comida, transporte)', color: 'text-blue-500' },
    Aire: { keyword: 'Volátil', description: 'Antojos, suscripciones, gastos pequeños', color: 'text-yellow-500' },
    Fuego: { keyword: 'Pasión', description: 'Ocio, hobbies, experiencias personales', color: 'text-rose-500' },
};
