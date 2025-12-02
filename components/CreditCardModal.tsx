import React, { useState, useMemo } from 'react';
import { X, CreditCard, Calendar, Clock, Plus } from 'lucide-react';
import type { Wallet, Transaction } from '../types';

interface CreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  transactions: Transaction[];
  onAddManual: (transaction: Omit<Transaction, 'id'>) => void;
  isPrivacyMode: boolean;
}

const ManualEntryForm: React.FC<{ walletId: string, onAdd: (tx: Omit<Transaction, 'id'>) => void, onDone: () => void }> = ({ walletId, onAdd, onDone }) => {
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    const [current, setCurrent] = useState('1');
    const [total, setTotal] = useState('1');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newTx: Omit<Transaction, 'id'> = {
            type: 'expense',
            description: desc,
            amount: Number(amount),
            walletId,
            listId: 'list-cc', // Hardcoded to CC list
            element: 'Fuego',
            date: new Date().toISOString(),
            installments: { current: Number(current), total: Number(total) }
        };
        onAdd(newTx);
        onDone();
    }
    return (
        <form onSubmit={handleSubmit} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mt-4 space-y-2">
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Detalle" className="w-full bg-white dark:bg-gray-700 p-2 text-sm rounded"/>
            <div className="flex gap-2">
                <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="Monto" className="w-full bg-white dark:bg-gray-700 p-2 text-sm rounded"/>
                <input value={current} onChange={e => setCurrent(e.target.value)} type="number" placeholder="Cuota" className="w-16 bg-white dark:bg-gray-700 p-2 text-sm rounded"/>
                <input value={total} onChange={e => setTotal(e.target.value)} type="number" placeholder="Total" className="w-16 bg-white dark:bg-gray-700 p-2 text-sm rounded"/>
            </div>
            <button type="submit" className="w-full bg-violet-500 text-white text-sm p-2 rounded">Guardar Gasto Manual</button>
        </form>
    );
};


const CreditCardModal: React.FC<CreditCardModalProps> = ({ isOpen, onClose, wallets, transactions, onAddManual, isPrivacyMode }) => {
  const creditWallets = wallets.filter(w => w.type === 'credit');
  const [selectedWalletId, setSelectedWalletId] = useState<string>(creditWallets[0]?.id || '');
  const [showManual, setShowManual] = useState(false);

  if (!isOpen) return null;

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);
  
  const walletTransactions = useMemo(() => {
      if (!selectedWalletId) return [];
      return transactions
        .filter(t => t.walletId === selectedWalletId && t.type === 'expense')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedWalletId]);

  const totalDebt = walletTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const formatMoney = (amount: number) => isPrivacyMode ? '****' : `$${amount.toLocaleString()}`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto p-4 md:p-6 shadow-2xl relative text-gray-800 dark:text-gray-100 flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={24} /></button>
        <div className="flex items-center gap-3 mb-4"><CreditCard size={28} className="text-violet-500" /><h2 className="text-2xl font-bold">Bóveda de Tarjetas</h2></div>

        {creditWallets.length > 0 && <div className="flex gap-2 mb-4 overflow-x-auto pb-2"><button onClick={() => setShowManual(s => !s)} className="p-2 bg-violet-500 rounded-full text-white"><Plus size={16}/></button>{creditWallets.map(w => (<button key={w.id} onClick={() => setSelectedWalletId(w.id)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${selectedWalletId === w.id ? 'bg-violet-500 border-violet-500 text-white' : 'bg-transparent border-gray-600 text-gray-400'}`}>{w.name}</button>))}</div>}
        {showManual && selectedWalletId && <ManualEntryForm walletId={selectedWalletId} onAdd={onAddManual} onDone={() => setShowManual(false)}/>}

        <div className="flex-grow overflow-auto rounded-lg border border-gray-200 dark:border-gray-800 mt-4">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase text-xs sticky top-0"><tr className="divide-x divide-gray-200 dark:divide-gray-700"><th className="p-3 font-semibold">Detalle</th><th className="p-3 font-semibold text-center">Cuota</th><th className="p-3 font-semibold text-right">Monto</th><th className="p-3 font-semibold text-right hidden sm:table-cell">Fecha</th></tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {walletTransactions.map(tx => {
                        const currentQ = tx.installments?.current || 1;
                        const totalQ = tx.installments?.total || 1;
                        const progress = (currentQ / totalQ) * 100;
                        return (<tr key={tx.id} className="divide-x divide-gray-200 dark:divide-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"><td className="p-3 font-medium text-gray-800 dark:text-gray-200">{tx.description}</td><td className="p-3 text-center">{totalQ > 1 ? (<div className="flex flex-col items-center w-24 mx-auto"><span className="text-xs font-bold text-gray-500 mb-1">{currentQ}/{totalQ}</span><div className="w-full bg-gray-700 rounded-full h-1.5"><div className="bg-violet-500 h-full rounded-full" style={{ width: `${progress}%` }}></div></div></div>) : (<span className="text-xs text-gray-400">-</span>)}</td><td className="p-3 text-right font-mono font-bold text-rose-400">{formatMoney(tx.amount)}</td><td className="p-3 text-right text-gray-500 text-xs hidden sm:table-cell">{new Date(tx.date).toLocaleDateString()}</td></tr>);
                    })}
                    {walletTransactions.length === 0 && (<tr><td colSpan={4} className="p-8 text-center text-gray-500 italic">No hay registros en esta tarjeta.</td></tr>)}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
export default CreditCardModal;
