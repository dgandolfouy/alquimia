import React from 'react';
import * as Lucide from 'lucide-react';
import type { Transaction, Settings, TransactionFeeling, TransmutationList } from '../types';
import { FEELING_OPTIONS } from '../constants';
import Card from './ui/Card';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  settings: Settings;
  isPrivacyMode: boolean;
  transmutationLists: TransmutationList[];
}

const FeelingIndicator: React.FC<{ feeling?: TransactionFeeling }> = ({ feeling = 'necessary' }) => {
  const feelingData = FEELING_OPTIONS[feeling];
  const Icon = Lucide[feelingData.icon as keyof typeof Lucide] as React.ElementType;
  return <Icon size={18} className={feelingData.color} title={feelingData.label} />;
};

const TransactionItem: React.FC<{ transaction: Transaction; onEdit: () => void; onDelete: () => void; settings: Settings; isPrivacyMode: boolean; listName: string }> = ({ transaction, onEdit, onDelete, settings, isPrivacyMode, listName }) => {
  const isExpense = transaction.type === 'expense';
  const hoursInMonth = settings.monthlyHours || 160;
  const totalAssets = settings.assets.reduce((sum, asset) => sum + asset.amount, 0);
  const hourlyRate = hoursInMonth > 0 && totalAssets > 0 ? totalAssets / hoursInMonth : 0;
  const costInHours = hourlyRate > 0 ? (transaction.amount / hourlyRate).toFixed(1) : 0;
  const amountDisplay = isPrivacyMode ? '****' : `$${transaction.amount.toLocaleString()}`;

  return (
    <div className="flex items-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg mb-3">
      <div className="flex-grow">
        <p className="font-medium">{transaction.description}</p>
        <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
            <span>{listName}</span>
            <span>&bull;</span>
            <span>{new Date(transaction.date).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="text-right mx-4">
        <p className={`font-bold ${isExpense ? 'text-rose-500' : 'text-emerald-500'}`}>{isExpense ? '-' : '+'}{amountDisplay}</p>
        {isExpense && <p className="text-xs text-amber-500 flex items-center justify-end gap-1"><Lucide.Hourglass size={12}/> {costInHours}h</p>}
      </div>
       <div className="flex items-center space-x-3">
          {isExpense && <FeelingIndicator feeling={transaction.feeling} />}
          <button onClick={onEdit} className="text-gray-500 hover:text-blue-500"><Lucide.Pencil size={16} /></button>
          <button onClick={onDelete} className="text-gray-500 hover:text-rose-500"><Lucide.Trash2 size={16} /></button>
       </div>
    </div>
  );
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit, onDelete, settings, isPrivacyMode, transmutationLists }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transacciones</h1>
      {transactions.length > 0 ? (
        <div>
          {transactions.map(tx => {
            const list = transmutationLists.find(l => l.id === tx.listId);
            return <TransactionItem key={tx.id} transaction={tx} onEdit={() => onEdit(tx)} onDelete={() => onDelete(tx.id)} settings={settings} isPrivacyMode={isPrivacyMode} listName={list?.name || 'Sin Lista'}/>
          })}
        </div>
      ) : (
        <Card className="text-center"><p className="text-gray-500">Aún no hay transacciones.</p></Card>
      )}
    </div>
  );
};

export default TransactionList;
