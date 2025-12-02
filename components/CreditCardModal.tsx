
import React, { useState } from 'react';
import { X, CreditCard, Calendar, Clock } from 'lucide-react';
import type { Wallet, Transaction } from '../types';

interface CreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  transactions: Transaction[];
}

const CreditCardModal: React.FC<CreditCardModalProps> = ({ isOpen, onClose, wallets, transactions }) => {
  const creditWallets = wallets.filter(w => w.type === 'credit');
  const [selectedWalletId, setSelectedWalletId] = useState<string>(creditWallets[0]?.id || '');

  if (!isOpen) return null;

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);
  
  // Filter transactions for this wallet
  const walletTransactions = transactions.filter(t => t.walletId === selectedWalletId && t.type === 'expense');

  // Simple aggregation for display (Total debt, etc)
  const totalDebt = walletTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative text-gray-800 dark:text-gray-100" onClick={e => e.stopPropagation()}>
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
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {creditWallets.map(w => (
                        <button 
                            key={w.id}
                            onClick={() => setSelectedWalletId(w.id)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${selectedWalletId === w.id ? 'bg-violet-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}
                        >
                            {w.name}
                        </button>
                    ))}
                </div>

                {selectedWallet && (
                    <div className="space-y-6">
                        {/* Info Card */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-5 rounded-xl shadow-lg border border-gray-700">
                             <div className="flex justify-between items-start mb-8">
                                <CreditCard size={32} className="text-white/50" />
                                <span className="font-mono text-xl tracking-widest">**** **** **** 1234</span>
                             </div>
                             <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase mb-1">Total Consumido</p>
                                    <p className="text-2xl font-bold">${totalDebt.toLocaleString()}</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-xs text-gray-400 flex items-center justify-end gap-1"><Calendar size={12}/> Cierre: Día {selectedWallet.closingDay || '--'}</p>
                                    <p className="text-xs text-gray-400 flex items-center justify-end gap-1"><Clock size={12}/> Vence: Día {selectedWallet.dueDay || '--'}</p>
                                </div>
                             </div>
                        </div>

                        {/* Transaction History (Simplified) */}
                        <div>
                            <h3 className="font-semibold text-gray-500 mb-3">Últimos Consumos</h3>
                            <div className="space-y-2">
                                {walletTransactions.slice(0, 10).map(tx => (
                                    <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <div>
                                            <p className="font-medium">{tx.description}</p>
                                            <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()} {tx.installments ? `• Cuota ${tx.installments.current}/${tx.installments.total}` : ''}</p>
                                        </div>
                                        <span className="font-bold text-gray-700 dark:text-gray-200">${tx.amount}</span>
                                    </div>
                                ))}
                                {walletTransactions.length === 0 && <p className="text-sm text-gray-500 italic">Sin consumos recientes.</p>}
                            </div>
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
