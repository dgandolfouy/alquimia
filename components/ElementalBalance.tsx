import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import Card from './ui/Card';
import type { Transaction } from '../types';

// Updated logic to use the 'element' property of Transaction instead of category IDs
const AlchemicalSymbol = ({ element, size = 20 }: { element: string, size?: number }) => {
    const symbols: { [key: string]: React.ReactNode } = {
        Tierra: (
            <svg width={size} height={size} viewBox="0 0 100 100" className="stroke-current text-emerald-500">
                <path d="M10 15 L50 85 L90 15 Z" strokeWidth="8" fill="none" strokeLinejoin="round" strokeLinecap="round" />
                <line x1="0" y1="45" x2="100" y2="45" strokeWidth="8" strokeLinecap="round" />
            </svg>
        ),
        Agua: (
            <svg width={size} height={size} viewBox="0 0 100 100" className="stroke-current text-blue-500">
                <path d="M10 15 L50 85 L90 15 Z" strokeWidth="8" fill="none" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
        ),
        Aire: (
            <svg width={size} height={size} viewBox="0 0 100 100" className="stroke-current text-yellow-500">
                <path d="M10 85 L50 15 L90 85 Z" strokeWidth="8" fill="none" strokeLinejoin="round" strokeLinecap="round" />
                <line x1="0" y1="55" x2="100" y2="55" strokeWidth="8" strokeLinecap="round" />
            </svg>
        ),
        Fuego: (
            <svg width={size} height={size} viewBox="0 0 100 100" className="stroke-current text-rose-500">
                <path d="M10 85 L50 15 L90 85 Z" strokeWidth="8" fill="none" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
        ),
    };
    return symbols[element] || null;
};

// Custom Tick Component for Recharts to render SVGs
const CustomTick = ({ payload, x, y, cx, cy, ...rest }: any) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-15} y={-15} width={30} height={30}>
        <div className="flex items-center justify-center w-full h-full">
            <AlchemicalSymbol element={payload.value} size={24} />
        </div>
      </foreignObject>
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

        currentMonthTxs.forEach(tx => {
            if (tx.element && sums[tx.element] !== undefined) {
                sums[tx.element] += tx.amount;
            }
        });
        
        const total = Object.values(sums).reduce((a, b) => a + b, 0);
        // Ensure graph looks good even with 0 data
        const max = total > 0 ? Math.max(...Object.values(sums)) * 1.2 : 100;

        return [
            { element: 'Tierra', Gastos: sums.Tierra, fullMark: max },
            { element: 'Fuego', Gastos: sums.Fuego, fullMark: max },
            { element: 'Agua', Gastos: sums.Agua, fullMark: max },
            { element: 'Aire', Gastos: sums.Aire, fullMark: max },
        ];
    }, [transactions]);

    return (
        <Card>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Balance Elemental</h2>
            <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={elementalData}>
                        <PolarGrid stroke={document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'}/>
                        <PolarAngleAxis 
                            dataKey="element" 
                            tick={<CustomTick />}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                        <Radar name="Gastos" dataKey="Gastos" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} />
                        <Tooltip contentStyle={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff', border: '1px solid #374151', borderRadius: '8px' }} formatter={(value: number) => `$${value.toLocaleString('es-ES')}`}/>
                    </RadarChart>
                </ResponsiveContainer>
            </div>
             <p className="text-sm text-gray-500 dark:text-gray-400 italic border-t border-gray-200 dark:border-gray-700 pt-3">
                <strong className="text-emerald-500">Tierra (Base):</strong> Gastos estructurales y necesarios. <strong className="text-blue-500">Agua (Vida):</strong> Gastos para tu estilo de vida. <strong className="text-yellow-500">Aire (Volátil):</strong> Antojos y gastos pequeños. <strong className="text-rose-500">Fuego (Pasión):</strong> Ocio, hobbies y experiencias.
            </p>
        </Card>
    );
};

export default ElementalBalance;