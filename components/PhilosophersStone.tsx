import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Card from './ui/Card';
import { ChevronsRight, Info } from 'lucide-react';

interface PhilosophersStoneProps {
    monthlyBalance: number;
    isPrivacyMode: boolean; // Add prop
}

const PhilosophersStone: React.FC<PhilosophersStoneProps> = ({ monthlyBalance, isPrivacyMode }) => {
    const annualReturn = 1.08; // 8%

    const projectionData = useMemo(() => {
        let capital = 0;
        const data = [{ year: 'Ahora', amount: 0 }];
        for (let i = 1; i <= 10; i++) {
            capital = (capital + (monthlyBalance * 12)) * annualReturn;
            data.push({ year: `Año ${i}`, amount: Math.round(capital) });
        }
        return data;
    }, [monthlyBalance]);

    const finalAmount = projectionData[projectionData.length - 1].amount;
    const monthlySavingsDisplay = monthlyBalance > 0 ? monthlyBalance : 0;

    return (
        <Card>
            <div className="flex items-center justify-between mb-2">
                 <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Piedra Filosofal (10 Años)</h2>
                 <div className="relative group">
                    <Info size={16} className="text-gray-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 -right-4 w-64 bg-gray-800 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        El 8% es una estimación del rendimiento anual promedio de una inversión diversificada a largo plazo (ej. fondos indexados).
                        <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                    </div>
                 </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Con tu ritmo de ahorro actual de <span className="font-bold text-violet-500">{isPrivacyMode ? '****' : `$${monthlySavingsDisplay.toFixed(2)}`}/mes</span>, así es como podría transmutar tu riqueza.
            </p>
            <div className="h-52">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="year" stroke={document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'} fontSize={12} />
                        <YAxis stroke={document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'} fontSize={12} tickFormatter={(value) => `$${Number(value)/1000}k`}/>
                        <Tooltip contentStyle={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff', border: '1px solid #374151', borderRadius: '8px' }} formatter={(value: number) => isPrivacyMode ? '****' : `$${value.toLocaleString('es-ES')}`}/>
                        <Area type="monotone" dataKey="amount" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorUv)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
             <div className="flex items-center justify-center mt-4 text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Futuro:</span>
                <ChevronsRight size={18} className="text-gray-400 dark:text-gray-500" />
                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-400">
                    {isPrivacyMode ? '****' : `$${finalAmount.toLocaleString('es-ES')}`}
                </span>
            </div>
        </Card>
    );
};

export default PhilosophersStone;
