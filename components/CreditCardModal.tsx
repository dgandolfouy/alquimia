import React, { useState, useMemo } from 'react';
import { X, CreditCard, Calendar, Clock } from 'lucide-react';
import type { Wallet, Transaction } from '../types';

interface CreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  transactions: Transaction[];
  // Added isPrivacyMode to interface
  isPrivacyMode: boolean;
}

const CreditCardModal: React.FC<CreditCardModalProps> = ({ isOpen, onClose, wallets, transactions, isPrivacyMode }) => {
  const creditWallets = wallets.filter(w => w.type === 'credit');
  const [selectedWalletId, setSelectedWalletId] = useState<string>(creditWallets[0]?.id || '');

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
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X size={24} />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
            <div className="bg-violet-500/20 p-3 rounded-full">
                <CreditCard size={28} className="text-violet-500" />
            </div>
            <h2 className="text-2xl font-bold">Bóveda de Tarjetas</h2>
        </div>

        {creditWallets.length === 0 ? (
             <p className="text-gray-500 italic">No tienes tarjetas de crédito configuradas.</p>
        ) : (
            <>
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                    {creditWallets.map(w => (
                        <button 
                            key={w.id}
                            onClick={() => setSelectedWalletId(w.id)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${selectedWalletId === w.id ? 'bg-violet-500 border-violet-500 text-white' : 'bg-transparent border-gray-600 text-gray-400 hover:border-gray-400'}`}
                        >
                            {w.name}
                        </button>
                    ))}
                </div>

                {selectedWallet && (
                    <div className="space-y-6 flex-grow flex flex-col">
                        {/* Info Card */}
                        <div className="bg-gradient-to-br from-indigo-900 to-violet-900 text-white p-5 rounded-xl shadow-lg border border-white/10">
                             <div className="flex justify-between items-start mb-6">
                                <span className="font-mono text-xl tracking-widest opacity-80">{selectedWallet.name.toUpperCase()}</span>
                                <CreditCard size={32} className="opacity-50" />
                             </div>
                             <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-gray-300 uppercase mb-1">Total Consumido (Historico)</p>
                                    <p className="text-3xl font-bold tracking-tight">{formatMoney(totalDebt)}</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-xs text-gray-300 flex items-center justify-end gap-1"><Calendar size={12}/> Cierre: Día {selectedWallet.closingDay || '--'}</p>
                                    <p className="text-xs text-gray-300 flex items-center justify-end gap-1"><Clock size={12}/> Vence: Día {selectedWallet.dueDay || '--'}</p>
                                </div>
                             </div>
                        </div>

                        {/* Spreadsheet Table View */}
                        <div className="flex-grow overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="p-3 font-semibold">Detalle</th>
                                        <th className="p-3 font-semibold text-center">Cuota</th>
                                        <th className="p-3 font-semibold text-right">Monto</th>
                                        <th className="p-3 font-semibold text-right hidden sm:table-cell">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {walletTransactions.map(tx => {
                                        const currentQ = tx.installments?.current || 1;
                                        const totalQ = tx.installments?.total || 1;
                                        const progress = (currentQ / totalQ) * 100;
                                        
                                        return (
                                            <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="p-3 font-medium text-gray-800 dark:text-gray-200">{tx.description}</td>
                                                <td className="p-3 text-center">
                                                    {totalQ > 1 ? (
                                                        <div className="flex flex-col items-center w-24 mx-auto">
                                                            <span className="text-xs font-bold text-gray-500 mb-1">{currentQ} / {totalQ}</span>
                                                            <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                                                <div className="bg-violet-500 h-full rounded-full" style={{ width: `${progress}%` }}></div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-right font-mono font-bold text-rose-400">{formatMoney(tx.amount)}</td>
                                                <td className="p-3 text-right text-gray-500 text-xs hidden sm:table-cell">{new Date(tx.date).toLocaleDateString()}</td>
                                            </tr>
                                        );
                                    })}
                                    {walletTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-500 italic">No hay registros en esta tarjeta.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default CreditCardModal;