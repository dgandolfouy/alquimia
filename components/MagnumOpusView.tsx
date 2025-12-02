import React from 'react';
import type { Transaction } from '../types';
import ElementalBalance from './ElementalBalance';
import PhilosophersStone from './PhilosophersStone';

interface MagnumOpusViewProps {
    transactions: Transaction[];
    summary: { balance: number };
}

const MagnumOpusView: React.FC<MagnumOpusViewProps> = ({ transactions, summary }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">La Gran Obra</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        Tu laboratorio de sabiduría financiera. Aquí, los datos se convierten en oro.
      </p>
      
      {/* FIX: Pass monthlyBalance prop to PhilosophersStone component to resolve missing property error. */}
      <PhilosophersStone monthlyBalance={summary.balance} />
      <ElementalBalance transactions={transactions} />
    </div>
  );
};

export default MagnumOpusView;
