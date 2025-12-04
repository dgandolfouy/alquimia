import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, ShipWheel, Hourglass, Target, Sparkles } from 'lucide-react';
import type { Transaction, Settings } from '../types';
import Card from './ui/Card';
import { getFinancialTip } from '../services/geminiService';
import { DEFAULT_CATEGORIES } from '../constants';
import YearlySummary from './YearlySummary';
import FinancialHealthIndicator from './FinancialHealthIndicator';

// Utility to hide numbers
const formatMoney = (amount: number, isPrivacy: boolean) => isPrivacy ? '****' : `$${amount.toLocaleString()}`;

const BudgetStatus: React.FC<{ transactions: Transaction[]; settings: Settings; isPrivacyMode: boolean }> = ({ transactions, settings, isPrivacyMode }) => {
    const budgetSummaries = useMemo(() => {
        if (!settings.budgets) return [];
        
        const now = new Date();
        const currentMonthTxs = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return tx.type === 'expense' && txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
        });

        return Object.entries(settings.budgets)
            .map(([categoryId, limitValue]) => {
                const limit = limitValue as number;
                if (!limit || limit <= 0) return null;
                
                const category = DEFAULT_CATEGORIES.find(c => c.id === categoryId);
                if (!category) return null;

                const spent = currentMonthTxs
                    .filter(tx => tx.categoryId === categoryId)
                    .reduce((sum, tx) => sum + tx.amount, 0);
                    
                const percentage = Math.min(100, (spent / limit) * 100);

                let color = 'bg-emerald-500';
                if (percentage > 90) {
                    color = 'bg-rose-500';
                } else if (percentage > 75) {
                    color = 'bg-amber-500';
                }

                return {
                    categoryId,
                    categoryName: category.name,
                    limit,
                    spent,
                    percentage,
                    color,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .sort((a, b) => (b.spent / b.limit) - (a.spent / a.limit));
    }, [transactions, settings.budgets]);

    if (budgetSummaries.length === 0) {
        return null;
    }

    return (
        <Card>
            <div className="flex items-center gap-2 mb-3">
                <Target size={18} className="text-violet-500" />
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Control de Presupuestos</h2>
            </div>
            <div className="space-y-3">
                {budgetSummaries.map(budget => (
                    <div key={budget.categoryId}>
                        <div className="flex justify-between items-center text-sm mb-1">
                            <span className="font-medium text-gray-600 dark:text-gray-300">{budget.categoryName}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatMoney(budget.spent, isPrivacyMode)} / {formatMoney(budget.limit, isPrivacyMode)}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className={`${budget.color} h-2 rounded-full transition-all duration-500`}
                                style={{ width: `${budget.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

interface DashboardProps {
  transactions: Transaction[];
  settings: Settings;
  onNewTransaction: () => void;
  onOpenCards: () => void;
  summary: { income: number, expenses: number, balance: number, savingsRate: number };
  isPrivacyMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, settings, onNewTransaction, summary, isPrivacyMode }) => {
  const [tip, setTip] = useState<string>("Cargando sabiduría del Oráculo...");

  useEffect(() => {
    const fetchTip = async () => {
      if (transactions.length > 0) {
        const newTip = await getFinancialTip(transactions);
        setTip(newTip);
      } else {
        setTip("Registra tu primera transacción para que el Oráculo te guíe.");
      }
    };
    fetchTip();
  }, [transactions]);
  
  const derivedSummary = useMemo(() => {
    const monthSet = new Set(transactions.map(t => t.date.substring(0, 7)));
    const numMonths = monthSet.size || 1;
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const avgMonthlyExpense = totalExpenses / numMonths;
    const assetsValue = settings.assets?.reduce((sum, a) => sum + a.amount, 0) || 0;
    const totalSavings = transactions.reduce((acc, tx) => acc + (tx.type === 'income' ? tx.amount : -tx.amount), 0) + assetsValue;
    const runwayDays = avgMonthlyExpense > 0 ? Math.floor((totalSavings / avgMonthlyExpense) * 30) : (totalSavings > 0 ? 999 : 0);

    const hoursWorked = settings.hourlyRate > 0 ? summary.income / settings.hourlyRate : 0;
    const hoursSpent = settings.hourlyRate > 0 ? summary.expenses / settings.hourlyRate : 0;
    
    return { runwayDays, hoursWorked, hoursSpent };
  }, [transactions, settings, summary]);

  const chartData = useMemo(() => {
    const dataMap = new Map<string, number>();
    const recentExpenses = transactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30);

    recentExpenses.forEach(tx => {
        const day = new Date(tx.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        dataMap.set(day, (dataMap.get(day) || 0) + tx.amount);
    });

    return Array.from(dataMap.entries()).map(([name, Gasto]) => ({ name, Gasto })).reverse().slice(-7);
  }, [transactions]);

  return (
    <div className="space-y-6">
      
      <FinancialHealthIndicator savingsRate={summary.savingsRate} onClick={onNewTransaction} />

      <div className="grid grid-cols-2 gap-4">
        <Card className="text-emerald-500">
          <div className="flex items-center gap-2">
            <ArrowUpRight size={18} />
            <span className="text-sm font-light text-gray-500 dark:text-gray-400">Ingresos del mes</span>
          </div>
          <p className="text-2xl font-semibold mt-1">{formatMoney(summary.income, isPrivacyMode)}</p>
          <p className="text-xs text-emerald-500/80 flex items-center gap-1 mt-1"><Hourglass size={12}/> ~{derivedSummary.hoursWorked.toFixed(1)}h de trabajo</p>
        </Card>
        <Card className="text-rose-500">
          <div className="flex items-center gap-2">
            <ArrowDownLeft size={18} />
            <span className="text-sm font-light text-gray-500 dark:text-gray-400">Gastos del mes</span>
          </div>
          <p className="text-2xl font-semibold mt-1">{formatMoney(summary.expenses, isPrivacyMode)}</p>
           <p className="text-xs text-rose-500/80 flex items-center gap-1 mt-1"><Hourglass size={12}/> ~{derivedSummary.hoursSpent.toFixed(1)}h de vida</p>
        </Card>
      </div>
      
      <BudgetStatus transactions={transactions} settings={settings} isPrivacyMode={isPrivacyMode} />

      <Card>
        <div className="flex items-center gap-2 mb-2">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-400">
                <defs>
                     <linearGradient id="goldTip" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FEF08A"/><stop offset="50%" stopColor="#EAB308"/><stop offset="100%" stopColor="#FACC15"/></linearGradient>
                </defs>
                <Sparkles fill="url(#goldTip)" stroke="none" size={24}/>
            </svg>
            <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">Tip de Oro del Alquimista</h2>
          </div>
        <p className="text-gray-600 dark:text-gray-300 italic text-sm">"{tip}"</p>
      </Card>
      
      <Card>
        <h2 className="text-lg text-gray-700 dark:text-gray-200 mb-2" style={{ fontWeight: 600 }}>Gastos Recientes</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
              <XAxis dataKey="name" stroke={document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: 'rgba(139, 92, 246, 0.1)'}} 
                contentStyle={{ 
                  backgroundColor: document.documentElement.classList.contains('dark') ? 'rgb(31 41 55)' : '#ffffff',
                  borderColor: document.documentElement.classList.contains('dark') ? 'rgb(55 65 81)' : '#e5e7eb',
                  borderRadius: '8px',
                  color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#1f2937'
                }} 
              />
              <Bar dataKey="Gasto" radius={[4, 4, 0, 0]}>
                 {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#8b5cf6" />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <YearlySummary transactions={transactions} />

      <div className="text-center pt-4">
        <div className="inline-block px-4 py-2 bg-gray-200/50 dark:bg-gray-800/50 rounded-full">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 justify-center mx-auto">
                <ShipWheel size={14} className="text-amber-500"/>
                Pista de despegue: <span className="font-bold text-gray-700 dark:text-gray-200">{derivedSummary.runwayDays > 998 ? '∞' : derivedSummary.runwayDays}</span> días
            </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
