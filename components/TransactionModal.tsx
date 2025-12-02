import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import type { Transaction, TransmutationList, Wallet, TransactionType, TransactionFeeling, Settings, AlchemicalElement } from '../types';
import { FEELING_OPTIONS, ELEMENT_DEFINITIONS } from '../constants';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'> | Transaction) => void;
  transaction: Transaction | Partial<Transaction> | null;
  transmutationLists: TransmutationList[];
  wallets: Wallet[];
  settings: Settings;
  transactions: Transaction[];
  onScanReceipt: () => void;
}

const AlchemicalSymbol = ({ element, size = 20, className = '' }: { element: string, size?: number, className?: string }) => {
    const symbols: { [key: string]: React.ReactNode } = {
        Tierra: (
            <svg width={size} height={size} viewBox="0 0 100 100" className={`stroke-current ${className || 'text-emerald-500'}`}>
                <path d="M10 15 L50 85 L90 15 Z" strokeWidth="10" fill="none" strokeLinejoin="round" strokeLinecap="round" />
                <line x1="0" y1="45" x2="100" y2="45" strokeWidth="10" strokeLinecap="round" />
            </svg>
        ),
        Agua: (
            <svg width={size} height={size} viewBox="0 0 100 100" className={`stroke-current ${className || 'text-blue-500'}`}>
                <path d="M10 15 L50 85 L90 15 Z" strokeWidth="10" fill="none" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
        ),
        Aire: (
            <svg width={size} height={size} viewBox="0 0 100 100" className={`stroke-current ${className || 'text-yellow-500'}`}>
                <path d="M10 85 L50 15 L90 85 Z" strokeWidth="10" fill="none" strokeLinejoin="round" strokeLinecap="round" />
                <line x1="0" y1="55" x2="100" y2="55" strokeWidth="10" strokeLinecap="round" />
            </svg>
        ),
        Fuego: (
            <svg width={size} height={size} viewBox="0 0 100 100" className={`stroke-current ${className || 'text-rose-500'}`}>
                <path d="M10 85 L50 15 L90 85 Z" strokeWidth="10" fill="none" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
        ),
    };
    return symbols[element] || null;
};

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, transaction, transmutationLists, wallets, settings, onScanReceipt }) => {
  const [type, setType] = useState<TransactionType>(transaction?.type || 'expense');
  const [amount, setAmount] = useState<string>(transaction?.amount ? String(transaction.amount) : '');
  const [description, setDescription] = useState<string>(transaction?.description || '');
  const [listId, setListId] = useState<string>(''); // Target List in Transmutation
  const [element, setElement] = useState<AlchemicalElement>('Tierra');
  const [walletId, setWalletId] = useState<string>(transaction?.walletId || '');
  const [entityId, setEntityId] = useState<string>(transaction?.entityId || (settings.entities?.[0]?.id || ''));
  const [date, setDate] = useState<string>(transaction?.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0]);
  const [feeling, setFeeling] = useState<TransactionFeeling>(transaction?.feeling || 'necessary');
  
  // Advanced fields
  const [installments, setInstallments] = useState<{ current: number, total: number }>({ current: 1, total: 1 });

  const selectedWallet = wallets.find(w => w.id === walletId);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type || 'expense');
      setAmount(transaction.amount ? String(transaction.amount) : '');
      setDescription(transaction.description || '');
      setListId((transaction as any).listId || (transmutationLists.length > 0 ? transmutationLists[0].id : ''));
      setElement((transaction as any).element || 'Tierra');
      setWalletId(transaction.walletId || '');
      setEntityId(transaction.entityId || (settings.entities?.[0]?.id || ''));
      setDate(transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setFeeling(transaction.feeling || 'necessary');
      if (transaction.installments) setInstallments(transaction.installments);
    } else {
      setType('expense');
      setAmount('');
      setDescription('');
      setListId(transmutationLists.length > 0 ? transmutationLists[0].id : '');
      setElement('Tierra');
      setWalletId(wallets.length > 0 ? wallets[0].id : '');
      setEntityId(settings.entities?.[0]?.id || '');
      setDate(new Date().toISOString().split('T')[0]);
      setFeeling('necessary');
      setInstallments({ current: 1, total: 1 });
    }
  }, [transaction, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !listId || !walletId) return;

    const newTransactionData: any = {
      type,
      amount: parsedAmount,
      description,
      listId,
      element,
      walletId,
      entityId,
      date: new Date(date).toISOString(),
      feeling: type === 'expense' ? feeling : undefined,
    };
    
    if (selectedWallet?.type === 'credit') {
        newTransactionData.installments = installments;
    }
    
    if (transaction && 'id' in transaction) {
      onSave({ ...transaction, ...newTransactionData });
    } else {
      onSave(newTransactionData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative text-gray-800 dark:text-gray-100" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white">
          <Lucide.X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6">{transaction && 'id' in transaction ? 'Editar' : 'Nueva'} Transacción</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                <button type="button" onClick={() => setType('expense')} className={`py-2 rounded-md transition-colors ${type === 'expense' ? 'bg-rose-500 text-white' : 'text-gray-600 dark:text-gray-300'}`}>Gasto</button>
                <button type="button" onClick={() => setType('income')} className={`py-2 rounded-md transition-colors ${type === 'income' ? 'bg-emerald-500 text-white' : 'text-gray-600 dark:text-gray-300'}`}>Ingreso</button>
            </div>

            <div>
                 <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Destino (Lista)</label>
                 <select value={listId} onChange={e => setListId(e.target.value)} className="w-full bg-gray-200 dark:bg-gray-700 p-3 rounded-lg appearance-none">
                     {transmutationLists.filter(l => !l.isCreditCardView).map(list => <option key={list.id} value={list.id}>{list.name}</option>)}
                 </select>
            </div>

            <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-gray-200 dark:bg-gray-700 p-3 rounded-lg text-3xl font-bold text-center" required />

            <div className="flex items-center gap-2">
                <input type="text" placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-200 dark:bg-gray-700 p-3 rounded-lg" required />
                <button type="button" onClick={onScanReceipt} className="p-3 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg">
                    <Lucide.Camera size={20} />
                </button>
            </div>

            <div>
                 <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Elemento del Gasto</label>
                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                     {(Object.keys(ELEMENT_DEFINITIONS) as AlchemicalElement[]).map(elKey => {
                         const def = ELEMENT_DEFINITIONS[elKey];
                         const isSelected = element === elKey;
                         return (
                            <button key={elKey} type="button" onClick={() => setElement(elKey)} className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${isSelected ? 'border-violet-500 bg-violet-500/10' : 'border-transparent bg-gray-200 dark:bg-gray-700'}`}>
                                <AlchemicalSymbol element={elKey} className={isSelected ? def.color : 'text-gray-500 dark:text-gray-400'} />
                                <span className={`mt-1.5 text-xs font-bold ${isSelected ? 'text-violet-600 dark:text-violet-300' : 'text-gray-600 dark:text-gray-400'}`}>{elKey}</span>
                                <span className={`text-[10px] ${isSelected ? 'text-violet-500' : 'text-gray-500 dark:text-gray-500'}`}>{def.keyword}</span>
                            </button>
                         )
                     })}
                 </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                     <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Billetera</label>
                     <select value={walletId} onChange={e => setWalletId(e.target.value)} className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-sm" required>
                        <option value="" disabled>Seleccionar...</option>
                        {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                     </select>
                </div>
                 <div>
                     <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Entidad</label>
                     <select value={entityId} onChange={e => setEntityId(e.target.value)} className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-sm">
                         {settings.entities?.map(ent => <option key={ent.id} value={ent.id}>{ent.name}</option>)}
                     </select>
                </div>
            </div>
            
            {selectedWallet?.type === 'credit' && type === 'expense' && (
                <div className="flex gap-2 items-center bg-gray-100 dark:bg-gray-900/50 p-3 rounded-lg">
                    <div className="flex-grow">
                        <label className="text-xs text-gray-500 block mb-1">Cuota Actual</label>
                        <input type="number" min="1" value={installments.current} onChange={e => setInstallments(p => ({...p, current: Number(e.target.value)}))} className="w-full bg-white dark:bg-gray-700 p-2 rounded text-sm text-center"/>
                    </div>
                    <span className="text-gray-400 text-xl font-light">/</span>
                    <div className="flex-grow">
                        <label className="text-xs text-gray-500 block mb-1">Total Cuotas</label>
                        <input type="number" min="1" value={installments.total} onChange={e => setInstallments(p => ({...p, total: Number(e.target.value)}))} className="w-full bg-white dark:bg-gray-700 p-2 rounded text-sm text-center"/>
                    </div>
                </div>
            )}
            
            {type === 'expense' && (
                <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Sentimiento</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(Object.keys(FEELING_OPTIONS) as Array<keyof typeof FEELING_OPTIONS>).map((key) => {
                            const { label, icon } = FEELING_OPTIONS[key];
                            const Icon = Lucide[icon as keyof typeof Lucide] as React.ElementType;
                            const isSelected = feeling === key;
                            return (
                                <button type="button" key={key} onClick={() => setFeeling(key)} className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${isSelected ? 'border-violet-500 bg-violet-500/10' : 'border-transparent bg-gray-200 dark:bg-gray-700'}`}>
                                    <Icon size={20} className={isSelected ? `text-violet-500` : 'text-gray-500 dark:text-gray-400'}/>
                                    <span className={`mt-1 text-xs ${isSelected ? 'text-violet-600 dark:text-violet-300 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>{label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            
            <button type="submit" className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-3 px-4 rounded-lg mt-6">
                {transaction && 'id' in transaction ? 'Actualizar' : 'Guardar'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;