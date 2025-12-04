import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CalendarDays } from 'lucide-react';
import type { Transaction } from '../types';
import Card from './ui/Card';
import { DEFAULT_CATEGORIES } from '../constants';

interface YearlySummaryProps {
  transactions: Transaction[];
  isPrivacyMode?: boolean; // Optional prop
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f',
  '#ffbb28', '#ff7300', '#d0ed57', '#a4de6c', '#8dd1e1', '#83a6ed',
  '#8b4513', '#ff69b4', '#7b68ee'
];

const YearlySummary: React.FC<YearlySummaryProps> = ({ transactions, isPrivacyMode = false }) => {
  const chartData = useMemo(() => {
    const now = new Date();
    const currentYearTxs = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return tx.type === 'expense' && txDate.getFullYear() === now.getFullYear();
    });

    if (currentYearTxs.length === 0) {
        return [];
    }

    const expensesByCategory = new Map<string, number>();
    currentYearTxs.forEach(tx => {
      const catId = tx.categoryId || 'unknown';
      const currentAmount = expensesByCategory.get(catId) || 0;
      expensesByCategory.set(catId, currentAmount + tx.amount);
    });

    return Array.from(expensesByCategory.entries()).map(([categoryId, amount]) => {
      const category = DEFAULT_CATEGORIES.find(c => c.id === categoryId);
      return {
        name: category ? category.name : 'Sin Categoría',
        value: amount,
      };
    }).sort((a, b) => b.value - a.value);

  }, [transactions]);

  if (chartData.length === 0) {
    return null;
  }

  const formatMoney = (val: number) => isPrivacyMode ? '****' : `$${val.toFixed(0)}`;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      const total = chartData.reduce((sum, entry) => sum + entry.value, 0);
      const percent = ((value / total) * 100).toFixed(1);
      return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-bold">{name}</p>
          <p className="text-sm text-violet-500">{isPrivacyMode ? '****' : `$${value.toFixed(2)}`} ({percent}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays size={18} className="text-violet-500" />
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Resumen Anual</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center h-64">
        <div className="w-full h-full">
            <ResponsiveContainer>
                <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="90%"
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
                >
                    {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
        </div>
        <div className="w-full max-h-60 overflow-y-auto text-xs pr-2">
            <ul className="space-y-1">
                {chartData.map((entry, index) => (
                     <li key={`legend-${index}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-gray-600 dark:text-gray-300 truncate">{entry.name}</span>
                        </div>
                        <span className="font-mono text-gray-700 dark:text-gray-200">{formatMoney(entry.value)}</span>
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </Card>
  );
};

export default YearlySummary;