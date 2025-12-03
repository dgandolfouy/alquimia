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
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, transaction, transmutationLists, wallets, settings }) => {
  const [type, setType] = useState<TransactionType>(transaction?.type || 'expense');
  const [amount, setAmount] = useState<string>(transaction?.amount ? String(transaction.amount) : '');
  const [description, setDescription] = useState<string>(transaction?.description || '');
  const [listId, setListId] = useState<string>('');
  const [element, setElement] = useState<AlchemicalElement>('Tierra');
  const [walletId, setWalletId] = useState<string>(transaction?.walletId || '');
  const [date, setDate] = useState<string>(transaction?.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0]);
  const [feeling, setFeeling] = useState<TransactionFeeling>(transaction?.feeling || 'necessary');
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
      setDate(new Date().toISOString().split('T')[0]);
      setFeeling('necessary');
      setInstallments({ current: 1, total: 1 });
    }
  }, [transaction, isOpen, transmutationLists, wallets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !listId || !walletId) return;

    const newTransactionData: any = { type, amount: parsedAmount, description, listId, element, walletId, date: new Date(date).toISOString(), feeling: type === 'expense' ? feeling : undefined };
    if (selectedWallet?.type === 'credit' && type === 'expense') newTransactionData.installments = installments;
    if (transaction && 'id' in transaction) { onSave({ ...transaction, ...newTransactionData }); } else { onSave(newTransactionData); }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500"><Lucide.X size={24} /></button>
        <h2 className="text-2xl font-bold mb-6">{transaction && 'id' in transaction ? 'Editar' : 'Nueva'} Transacción</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg"><button type="button" onClick={() => setType('expense')} className={`py-2 rounded-md ${type === 'expense' ? 'bg-rose-500 text-white' : ''}`}>Gasto</button><button type="button" onClick={() => setType('income')} className={`py-2 rounded-md ${type === 'income' ? 'bg-emerald-500 text-white' : ''}`}>Ingreso</button></div>
            <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-xs mb-1">Destino (Lista)</label><select value={listId} onChange={e => setListId(e.target.value)} className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-sm">{transmutationLists.filter(l => !l.isCreditCardView && !l.isLoansView).map(list => <option key={list.id} value={list.id}>{list.name}</option>)}</select></div>
                <div><label className="block text-xs mb-1">Billetera</label><select value={walletId} onChange={e => setWalletId(e.target.value)} className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-sm" required>{wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
            </div>
            <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-3 rounded-lg text-3xl font-bold text-center" required />
            <input type="text" placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 rounded-lg" required />
            <div>
                 <label className="block text-sm mb-2">Elemento</label>
                 <div className="grid grid-cols-4 gap-2 text-center">
                     {(Object.keys(ELEMENT_DEFINITIONS) as AlchemicalElement[]).map(elKey => {
                         const isSelected = element === elKey;
                         return (<button key={elKey} type="button" onClick={() => setElement(elKey)} className={`p-2 rounded-lg border-2 ${isSelected ? 'border-violet-500 bg-violet-500/10' : 'border-transparent'}`}><span className={`font-bold text-xs ${isSelected ? 'text-violet-500' : 'text-gray-500'}`}>{ELEMENT_DEFINITIONS[elKey].keyword}</span></button>)
                     })}
                 </div>
            </div>
            {selectedWallet?.type === 'credit' && type === 'expense' && (<div className="flex gap-2 items-center p-3 rounded-lg"><input type="number" min="1" value={installments.current} onChange={e => setInstallments(p => ({...p, current: Number(e.target.value)}))} className="w-full p-2 rounded text-sm text-center" placeholder="Cuota"/><span className="text-xl">/</span><input type="number" min="1" value={installments.total} onChange={e => setInstallments(p => ({...p, total: Number(e.target.value)}))} className="w-full p-2 rounded text-sm text-center" placeholder="Total"/></div>)}
            {type === 'expense' && (<div className="grid grid-cols-3 gap-2">{(Object.keys(FEELING_OPTIONS) as Array<keyof typeof FEELING_OPTIONS>).map((key) => { const { label, icon } = FEELING_OPTIONS[key]; const Icon = Lucide[icon as keyof typeof Lucide] as React.ElementType; const isSelected = feeling === key; return (<button type="button" key={key} onClick={() => setFeeling(key)} className={`p-2 rounded-lg border-2 ${isSelected ? 'border-violet-500 bg-violet-500/10' : 'border-transparent'}`}><Icon size={20} className={`mx-auto ${isSelected ? `text-violet-500` : 'text-gray-500'}`}/><span className={`mt-1 text-xs ${isSelected ? 'text-violet-500' : 'text-gray-500'}`}>{label}</span></button>);})}</div>)}
            <button type="submit" className="w-full bg-violet-500 text-white font-bold py-3 px-4 rounded-lg mt-6">Guardar</button>
        </form>
      </div>
    </div>
  );
};
export default TransactionModal;
