import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import Card from './ui/Card';
import type { Transaction } from '../types';

const CustomTick = ({ payload, x, y }: any) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text dy={16} textAnchor="middle" fill="#9ca3af" fontSize="14px">{payload.value}</text>
    </g>
  );
};

interface ElementalBalanceProps {
    transactions: Transaction[];
}

const ElementalBalance: React.FC<ElementalBalanceProps> = ({ transactions }) => {
    const elementalData = useMemo(() => {
        const sums: { [key: string]: number } = { Tierra: 0, Agua: 0, Aire: 0, Fuego: 0 };
        
        const currentMonthTxs = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            const now = new Date();
            return tx.type === 'expense' && txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
        });

        currentMonthTxs.forEach(tx => { if (tx.element && sums[tx.element] !== undefined) { sums[tx.element] += tx.amount; } });
        
        const total = Object.values(sums).reduce((a, b) => a + b, 0);
        const max = total > 0 ? Math.max(...Object.values(sums)) * 1.2 : 100;

        return [{ element: 'Tierra', Gastos: sums.Tierra, fullMark: max }, { element: 'Fuego', Gastos: sums.Fuego, fullMark: max }, { element: 'Agua', Gastos: sums.Agua, fullMark: max }, { element: 'Aire', Gastos: sums.Aire, fullMark: max }];
    }, [transactions]);

    return (
        <Card>
            <h2 className="text-xl font-semibold mb-2">Balance Elemental</h2>
            <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={elementalData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="element" tick={<CustomTick />} />
                        <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                        <Radar name="Gastos" dataKey="Gastos" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} formatter={(value: number) => `$${value.toLocaleString('es-ES')}`}/>
                    </RadarChart>
                </ResponsiveContainer>
            </div>
             <p className="text-xs text-gray-500 italic border-t pt-3">
                <strong className="text-emerald-500">Tierra:</strong> Base. <strong className="text-blue-500">Agua:</strong> Vida. <strong className="text-yellow-500">Aire:</strong> Volátil. <strong className="text-rose-500">Fuego:</strong> Pasión.
            </p>
        </Card>
    );
};
export default ElementalBalance;
