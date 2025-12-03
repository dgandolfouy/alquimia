import React, { useState, useEffect } from 'react';
import type { Transaction } from '../types';
import ElementalBalance from './ElementalBalance';
import PhilosophersStone from './PhilosophersStone';
import { getFinancialTip } from '../services/geminiService';
import Card from './ui/Card';
import { Sparkles, BrainCircuit } from 'lucide-react';

interface SynthesisViewProps {
    transactions: Transaction[];
    summary: { balance: number };
    isPrivacyMode: boolean; // Add prop
}

const SynthesisView: React.FC<SynthesisViewProps> = ({ transactions, summary, isPrivacyMode }) => {
    const [tip, setTip] = useState<string>("Consultando a la IA...");

    useEffect(() => {
        const fetchTip = async () => {
          if (transactions.length > 0) {
            const newTip = await getFinancialTip(transactions);
            setTip(newTip);
          } else {
            setTip("Registra datos para obtener análisis.");
          }
        };
        fetchTip();
    }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
         <BrainCircuit size={32} className="text-violet-500"/>
         <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Síntesis</h1>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        Análisis profundo y sabiduría derivada de tus transmutaciones.
      </p>
      
       <Card>
        <div className="flex items-center gap-2 mb-2">
             <Sparkles className="text-amber-400" size={24}/>
            <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">Consejo de la IA</h2>
          </div>
        <p className="text-gray-600 dark:text-gray-300 italic text-sm">"{tip}"</p>
      </Card>
      
      <PhilosophersStone monthlyBalance={summary.balance} isPrivacyMode={isPrivacyMode} />
      <ElementalBalance transactions={transactions} />
    </div>
  );
};

export default SynthesisView;
