import React from 'react';
import * as Lucide from 'lucide-react';
import type { Transaction, Settings, TransactionFeeling } from '../types';
import { DEFAULT_CATEGORIES, FEELING_OPTIONS } from '../constants';
import Card from './ui/Card';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  settings: Settings;
  isPrivacyMode: boolean;
}

const FeelingIndicator: React.FC<{ feeling?: TransactionFeeling }> = ({ feeling = 'necessary' }) => {
  const feelingData = FEELING_OPTIONS[feeling];
  const Icon = Lucide[feelingData.icon as keyof typeof Lucide] as React.ElementType;
  
  const colorClasses: { [key in TransactionFeeling]: string } = {
    necessary: 'text-gray-500',
    pleasure: 'text-emerald-500',
    regret: 'text-rose-500',
  };

  return <Icon size={18} className={colorClasses[feeling]} title={feelingData.label} />;
};

const TransactionItem: React.FC<{ transaction: Transaction; onEdit: () => void; onDelete: () => void; settings: Settings; isPrivacyMode: boolean }> = ({ transaction, onEdit, onDelete, settings, isPrivacyMode }) => {
  const category = DEFAULT_CATEGORIES.find(c => c.id === transaction.categoryId);
  const Icon = category ? (Lucide[category.icon as keyof typeof Lucide] as React.ElementType) : Lucide.MoreHorizontal;
  const isExpense = transaction.type === 'expense';
  
  const costInHours = settings.hourlyRate > 0 ? (transaction.amount / settings.hourlyRate).toFixed(1) : 0;
  const amountDisplay = isPrivacyMode ? '****' : `$${transaction.amount.toFixed(2)}`;

  return (
    <div className="flex items-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg mb-3">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-4">
        <Icon size={20} className="text-gray-600 dark:text-gray-300" />
      </div>
      <div className="flex-grow">
        <p className="font-medium text-gray-800 dark:text-gray-100">{transaction.description}</p>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 space-x-2">
            <span>{category?.name || 'Sin categoría'}</span>
            <span>&bull;</span>
            <span>{new Date(transaction.date).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="text-right mx-4">
        <p className={`font-bold ${isExpense ? 'text-rose-500' : 'text-emerald-500'}`}>
          {isExpense ? '-' : '+'}{amountDisplay}
        </p>
        {isExpense && <p className="text-xs text-amber-500 flex items-center justify-end gap-1"><Lucide.Hourglass size={12}/> {costInHours}h</p>}
      </div>
       <div className="flex items-center space-x-3">
          {isExpense && <FeelingIndicator feeling={transaction.feeling} />}
          <button onClick={onEdit} className="text-gray-500 hover:text-gray-800 dark:hover:text-white"><Lucide.Pencil size={16} /></button>
          <button onClick={onDelete} className="text-gray-500 hover:text-rose-500"><Lucide.Trash2 size={16} /></button>
       </div>
    </div>
  );
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit, onDelete, settings, isPrivacyMode }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Transacciones</h1>
      {transactions.length > 0 ? (
        <div>
          {transactions.map(tx => (
            <TransactionItem key={tx.id} transaction={tx} onEdit={() => onEdit(tx)} onDelete={() => onDelete(tx.id)} settings={settings} isPrivacyMode={isPrivacyMode} />
          ))}
        </div>
      ) : (
        <Card className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Aún no hay transacciones.</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">¡Agrega tu primera para empezar la alquimia!</p>
        </Card>
      )}
    </div>
  );
};

export default TransactionList;
