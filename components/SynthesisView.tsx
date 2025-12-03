import React, { useState, useEffect } from 'react';
import type { Transaction, Settings, TransmutationList } from '../types';
import ElementalBalance from './ElementalBalance';
import { getFinancialTip } from '../services/geminiService';
import Card from './ui/Card';
import { Sparkles, BrainCircuit, PiggyBank, ChevronsRight } from 'lucide-react';
import YearlySummary from './YearlySummary';

const MysticalPiggyBank: React.FC<{ monthlyBalance: number; settings: Settings; isPrivacyMode: boolean }> = ({ monthlyBalance, settings, isPrivacyMode }) => {
    const annualReturn = 1.08;
    const projection = Array.from({ length: 11 }, (_, i) => {
        let capital = 0;
        for (let j = 1; j <= i; j++) {
            capital = (capital + (monthlyBalance * 12)) * annualReturn;
        }
        return { year: `Año ${i}`, amount: Math.round(capital) };
    });
    const finalAmount = projection[10].amount;
    const hoursInMonth = settings.monthlyHours || 160;
    const totalAssets = settings.assets.reduce((sum, asset) => sum + asset.amount, 0);
    const hourlyRate = hoursInMonth > 0 && totalAssets > 0 ? totalAssets / hoursInMonth : 0;
    const finalHours = hourlyRate > 0 ? finalAmount / hourlyRate : 0;

    const formatMoney = (amount: number) => isPrivacyMode ? '****' : `$${amount.toLocaleString()}`;

    return (
        <Card>
            <div className="flex items-center gap-2 mb-2"><PiggyBank size={20} className="text-pink-400"/><h2 className="text-xl font-semibold">Alcancía Mística</h2></div>
            <p className="text-sm text-gray-500 mb-4">Con tu ritmo de ahorro actual de <span className="font-bold text-violet-500">{formatMoney(monthlyBalance > 0 ? monthlyBalance : 0)}/mes</span>, así podría transmutar tu riqueza en 10 años.</p>
            <div className="flex items-center justify-center text-center">
                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-400">{formatMoney(finalAmount)}</span>
                <ChevronsRight size={18} className="text-gray-400 mx-2" />
                <span className="text-lg font-semibold text-amber-400">{isPrivacyMode ? '****' : `${Math.round(finalHours / 160)} meses de vida`}</span>
            </div>
        </Card>
    );
};

interface SynthesisViewProps {
    transactions: Transaction[];
    summary: { balance: number };
    settings: Settings;
    isPrivacyMode: boolean;
    transmutationLists: TransmutationList[];
}

const SynthesisView: React.FC<SynthesisViewProps> = ({ transactions, summary, settings, isPrivacyMode, transmutationLists }) => {
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
      <div className="flex items-center gap-3"><BrainCircuit size={32} className="text-violet-500"/><h1 className="text-3xl font-bold">Síntesis</h1></div>
       <Card><p className="text-gray-600 italic text-sm">"{tip}"</p></Card>
      <MysticalPiggyBank monthlyBalance={summary.balance} settings={settings} isPrivacyMode={isPrivacyMode} />
      <YearlySummary transactions={transactions} transmutationLists={transmutationLists} isPrivacyMode={isPrivacyMode} />
      <ElementalBalance transactions={transactions} />
    </div>
  );
};
export default SynthesisView;
