import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CalendarDays } from 'lucide-react';
import type { Transaction, TransmutationList } from '../types';
import Card from './ui/Card';

interface YearlySummaryProps {
  transactions: Transaction[];
  transmutationLists: TransmutationList[];
  isPrivacyMode: boolean;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'];

const YearlySummary: React.FC<YearlySummaryProps> = ({ transactions, transmutationLists, isPrivacyMode }) => {
  const chartData = useMemo(() => {
    const now = new Date();
    const expensesByList = new Map<string, number>();
    
    transactions.forEach(tx => {
      if (tx.type === 'expense' && new Date(tx.date).getFullYear() === now.getFullYear()) {
        const current = expensesByList.get(tx.listId) || 0;
        expensesByList.set(tx.listId, current + tx.amount);
      }
    });

    return Array.from(expensesByList.entries()).map(([listId, amount]) => {
      const list = transmutationLists.find(l => l.id === listId);
      return { name: list?.name || 'Sin Asignar', value: amount };
    }).sort((a, b) => b.value - a.value);

  }, [transactions, transmutationLists]);

  if (chartData.length === 0) return null;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3"><CalendarDays size={18} className="text-violet-500" /><h2 className="text-lg font-semibold">Resumen Anual de Gastos</h2></div>
      <div className="h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8b5cf6" labelLine={false} label={({ name, percent }) => isPrivacyMode ? '' : `${name} (${(percent * 100).toFixed(0)}%)`}>
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(value: number) => isPrivacyMode ? '****' : `$${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
export default YearlySummary;
