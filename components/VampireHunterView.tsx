import React, { useMemo } from 'react';
import type { Transaction, Settings } from '../types';
import Card from './ui/Card';
import { DollarSign, Calendar, Hourglass, Sun, Flame } from 'lucide-react';

interface VampireHunterViewProps {
  transactions: Transaction[];
  settings: Settings;
}

const VampireHunterView: React.FC<VampireHunterViewProps> = ({ transactions, settings }) => {
  const subscriptions = useMemo(() => {
    const subscriptionTransactions = transactions.filter(
      t => t.categoryId === 'cat-10' && t.type === 'expense'
    );

    const subscriptionMap = new Map<string, Transaction>();

    // Get the latest transaction for each unique description to represent the current subscription cost
    subscriptionTransactions.forEach(tx => {
      const normalizedName = tx.description.toLowerCase().trim();
      const existing = subscriptionMap.get(normalizedName);
      if (!existing || new Date(tx.date) > new Date(existing.date)) {
        subscriptionMap.set(normalizedName, tx);
      }
    });

    const processedSubscriptions = Array.from(subscriptionMap.values()).map(tx => {
      const monthlyCost = tx.amount;
      const annualCost = monthlyCost * 12;
      const hoursCost = settings.hourlyRate > 0 ? annualCost / settings.hourlyRate : 0;
      return {
        id: tx.id,
        name: tx.description,
        monthlyCost,
        annualCost,
        hoursCost,
      };
    });

    return processedSubscriptions.sort((a, b) => b.annualCost - a.annualCost);
  }, [transactions, settings.hourlyRate]);

  const totalMonthly = useMemo(() => subscriptions.reduce((sum, s) => sum + s.monthlyCost, 0), [subscriptions]);
  const totalAnnual = totalMonthly * 12;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Suscripciones</h1>
      <p className="text-gray-500 dark:text-gray-400">
        Gestiona tus gastos recurrentes. Analiza si servicios como Netflix o Spotify realmente valen su costo en tu tiempo de vida.
      </p>

      {subscriptions.length > 0 ? (
        <>
          <Card>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Impacto Total</h2>
            <div className="flex justify-around text-center">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Mensual</p>
                <p className="text-2xl font-bold text-rose-500">${totalMonthly.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Anual</p>
                <p className="text-2xl font-bold text-rose-600">${totalAnnual.toFixed(2)}</p>
              </div>
            </div>
          </Card>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Suscripciones Activas</h2>
            {subscriptions.map(sub => (
              <Card key={sub.id}>
                <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-3 pr-2">{sub.name}</h3>
                    <Flame className="text-amber-400 flex-shrink-0" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><DollarSign size={16} /> Costo Mensual</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">${sub.monthlyCost.toFixed(2)}</span>
                  </div>
                   <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><Calendar size={16} /> Costo Anual</span>
                    <span className="font-semibold text-rose-500">${sub.annualCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><Hourglass size={16} /> Horas de Vida / Año</span>
                    <span className="font-semibold text-amber-500">{sub.hoursCost.toFixed(1)}h</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card className="text-center py-10">
          <Sun size={40} className="mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">¡Sin Suscripciones Activas!</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">No has registrado ninguna suscripción. ¡Tu billetera te lo agradece!</p>
        </Card>
      )}
    </div>
  );
};

export default VampireHunterView;