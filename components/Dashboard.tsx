import React, { useMemo, useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Hourglass, Sparkles, CreditCard } from 'lucide-react';
import type { Transaction, Settings } from '../types';
import Card from './ui/Card';
import { getFinancialTip } from '../services/geminiService';
import FinancialHealthIndicator from './FinancialHealthIndicator';

const formatMoney = (amount: number, isPrivacy: boolean) => isPrivacy ? '****' : `$${amount.toLocaleString()}`;

interface DashboardProps {
  transactions: Transaction[];
  settings: Settings;
  onNewTransaction: () => void;
  onOpenCards: () => void;
  summary: { income: number, expenses: number, balance: number, savingsRate: number };
  isPrivacyMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, settings, onNewTransaction, onOpenCards, summary, isPrivacyMode }) => {
  const [tip, setTip] = useState<string>("Cargando sabiduría del Oráculo...");

  useEffect(() => {
    const fetchTip = async () => {
      try {
        if (transactions.length > 0) {
          const newTip = await getFinancialTip(transactions);
          setTip(newTip);
        } else {
          setTip("Registra tu primera transacción para que el Oráculo te guíe.");
        }
      } catch(e) {
        setTip("El Oráculo no está disponible. Revisa tu API Key de Gemini en Vercel.");
      }
    };
    fetchTip();
  }, [transactions]);
  
  const derivedSummary = useMemo(() => {
    const hoursInMonth = settings.monthlyHours || 160;
    const totalAssets = settings.assets.reduce((sum, asset) => sum + asset.amount, 0);
    const hourlyRate = hoursInMonth > 0 && totalAssets > 0 ? totalAssets / hoursInMonth : 0;

    const hoursWorked = hourlyRate > 0 ? summary.income / hourlyRate : 0;
    const hoursSpent = hourlyRate > 0 ? summary.expenses / hourlyRate : 0;
    return { hoursWorked, hoursSpent };
  }, [settings, summary]);

  return (
    <div className="space-y-6">
      <FinancialHealthIndicator savingsRate={summary.savingsRate} onClick={onNewTransaction} />

      <div className="grid grid-cols-2 gap-4">
        <Card className="text-emerald-500">
          <div className="flex items-center gap-2"><ArrowUpRight size={18} /><span className="text-sm font-light text-gray-500">Ingresos</span></div>
          <p className="text-2xl font-semibold mt-1">{formatMoney(summary.income, isPrivacyMode)}</p>
          <p className="text-xs flex items-center gap-1 mt-1"><Hourglass size={12}/> ~{isPrivacyMode ? '**' : derivedSummary.hoursWorked.toFixed(1)}h de trabajo</p>
        </Card>
        <Card className="text-rose-500">
          <div className="flex items-center gap-2"><ArrowDownLeft size={18} /><span className="text-sm font-light text-gray-500">Gastos</span></div>
          <p className="text-2xl font-semibold mt-1">{formatMoney(summary.expenses, isPrivacyMode)}</p>
           <p className="text-xs flex items-center gap-1 mt-1"><Hourglass size={12}/> ~{isPrivacyMode ? '**' : derivedSummary.hoursSpent.toFixed(1)}h de vida</p>
        </Card>
      </div>
      
      <Card onClick={onOpenCards} className="cursor-pointer hover:bg-violet-500/10">
        <div className="flex items-center gap-3"><CreditCard size={24} className="text-violet-500"/><h2 className="text-lg font-semibold">Bóveda de Tarjetas</h2></div>
        <p className="text-sm text-gray-500 mt-1">Revisa el estado de tus tarjetas de crédito.</p>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-2"><Sparkles className="text-amber-400" size={24}/><h2 className="text-base font-semibold">Tip de Oro del Alquimista</h2></div>
        <p className="text-gray-600 dark:text-gray-300 italic text-sm">"{tip}"</p>
      </Card>
    </div>
  );
};
export default Dashboard;
