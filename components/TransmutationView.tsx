import React, { useState, useMemo } from 'react';
import { ClipboardList, CheckSquare, Square, X, Plus, Trash2, TrendingUp, Search, Sparkles } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { TransmutationList, TransmutationItem, HistoricalPriceItem, Asset, Transaction } from '../types';
import Card from './ui/Card';
import { findPromotions } from '../services/geminiService';

interface TransmutationViewProps {
  lists: TransmutationList[];
  // FIX: Simplified type to match the handler in App.tsx
  setLists: (lists: TransmutationList[]) => void;
  onCompleteItem: (item: TransmutationItem, listId: string) => void;
  historicalPrices: HistoricalPriceItem;
  addHistoricalPrice: (name: string, price: number) => void;
  onRequestDeleteList: (listId: string) => void;
  onRequestDeleteItem: (listId: string, itemId: string) => void;
  assets: Asset[];
  transactions: Transaction[];
}

const PriceOracle: React.FC<{
  historicalPrices: HistoricalPriceItem;
  addHistoricalPrice: (name: string, price: number) => void;
}> = ({ historicalPrices, addHistoricalPrice }) => {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemName.trim() && itemPrice) {
      addHistoricalPrice(itemName, Number(itemPrice));
      setItemPrice(''); 
    }
  };

  const chartData = React.useMemo(() => {
    const normalizedName = itemName.trim().toLowerCase();
    const prices = historicalPrices[normalizedName];
    if (!prices || prices.length < 2) return null;
    return prices.map(p => ({
      date: new Date(p.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      precio: p.price,
    }));
  }, [itemName, historicalPrices]);

  return (
     <Card>
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp size={20} className="text-violet-500" />
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Oráculo de Precios</h2>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Ítem (ej. Leche)" className="flex-grow bg-gray-200 dark:bg-gray-700 p-2 rounded-lg" required />
        <div className="flex gap-2">
          <input value={itemPrice} onChange={e => setItemPrice(e.target.value)} type="number" placeholder="$" step="0.01" className="w-full sm:w-28 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg" required />
          <button type="submit" className="bg-violet-500 p-2 rounded-lg text-white"><Plus /></button>
        </div>
      </form>
      {chartData && (
        <div className="mt-4 h-48">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}><Area type="monotone" dataKey="precio" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} /></AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

const PromotionsFinder: React.FC<{ listItems: TransmutationItem[] }> = ({ listItems }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleSearch = async () => {
        const itemsToSearch = listItems.filter(i => !i.isCompleted).map(i => i.name);
        if (itemsToSearch.length === 0) return;
        
        setLoading(true);
        setResult(null);
        const promoText = await findPromotions(itemsToSearch);
        setResult(promoText);
        setLoading(false);
    };

    if (listItems.filter(i => !i.isCompleted).length === 0) return null;

    return (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            {!result && !loading && (
                <button 
                    onClick={handleSearch}
                    className="flex items-center gap-2 text-xs font-bold text-violet-500 hover:text-violet-600 transition-colors"
                >
                    <Sparkles size={14} /> Buscar Ofertas con IA
                </button>
            )}
            {loading && <p className="text-xs text-gray-500 animate-pulse">Consultando el éter...</p>}
            {result && (
                <div className="bg-violet-500/10 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-200 mt-2">
                    <div className="flex items-center gap-2 mb-1 text-violet-600 dark:text-violet-400 font-bold text-xs uppercase">
                        <Search size={12}/> Hallazgos
                    </div>
                    {result}
                </div>
            )}
        </div>
    );
};

const TransmutationView: React.FC<TransmutationViewProps> = ({
  lists, setLists, onCompleteItem, historicalPrices, addHistoricalPrice, onRequestDeleteList, onRequestDeleteItem, assets, transactions
}) => {
  const [newListName, setNewListName] = useState('');
  
  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      const newList: TransmutationList = { id: `list-${Date.now()}`, name: newListName.trim(), items: [] };
      // FIX: Use lists prop directly instead of functional update
      setLists([...lists, newList]);
      setNewListName('');
    }
  };

  const handleAddItem = (listId: string, name: string, amount: number) => {
    if (!name.trim()) return;
    const newItem: TransmutationItem = { id: `item-${Date.now()}`, name: name.trim(), amount: amount || 0, isCompleted: false };
    // FIX: Use lists prop directly
    setLists(lists.map(l => l.id === listId ? { ...l, items: [...l.items, newItem] } : l));
  };
  
  const handleToggleItem = (listId: string, itemId: string) => {
    let completedItem: TransmutationItem | null = null;
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.map(item => {
            if (item.id === itemId) {
              if (!item.isCompleted) completedItem = item;
              return { ...item, isCompleted: !item.isCompleted };
            }
            return item;
          })
        };
      }
      return list;
    });
    // FIX: Use lists prop directly
    setLists(updatedLists);
    if (completedItem) onCompleteItem(completedItem, listId);
  };

  const visibleLists = lists.filter(l => !l.isCreditCardView);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList size={32} className="text-violet-500" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Transmutación</h1>
      </div>

      {visibleLists.map(list => {
        const totalPlannedAmount = list.items.reduce((sum, item) => sum + item.amount, 0);
        
        const totalSpentThisMonth = useMemo(() => {
            const now = new Date();
            return transactions
                .filter(t => {
                    const txDate = new Date(t.date);
                    return t.listId === list.id &&
                           t.type === 'expense' &&
                           txDate.getFullYear() === now.getFullYear() &&
                           txDate.getMonth() === now.getMonth();
                })
                .reduce((sum, t) => sum + t.amount, 0);
        }, [transactions, list.id]);

        return (
            <Card key={list.id} className="space-y-3">
            <div className="flex justify-between items-center">
                <div className="flex items-baseline gap-2">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{list.name}</h2>
                    <span className="text-sm font-mono text-violet-500 font-bold" title="Total Planificado en la lista">${totalPlannedAmount.toLocaleString()}</span>
                </div>
                <button onClick={() => onRequestDeleteList(list.id)} className="text-gray-400 hover:text-rose-500"><Trash2 size={18} /></button>
            </div>
            
            <div className="space-y-2">
                {list.items.filter(i => !i.isCompleted).map((item) => (
                <div key={item.id} className="flex items-center gap-2 group">
                    <button onClick={() => handleToggleItem(list.id, item.id)}><Square size={20} className="text-gray-400" /></button>
                    <span className="flex-grow">{item.name}</span>
                    <span className="font-mono text-sm">${item.amount.toFixed(2)}</span>
                    <button onClick={() => onRequestDeleteItem(list.id, item.id)}><X size={16} className="text-gray-400 hover:text-rose-500" /></button>
                </div>
                ))}
                
                {list.items.filter(i => i.isCompleted).length > 0 && (
                        <div className="pt-2 border-t border-gray-700 mt-2">
                        {list.items.filter(i => i.isCompleted).map(item => (
                            <div key={item.id} className="flex items-center gap-2 text-gray-500 opacity-70">
                                <CheckSquare size={20} className="text-violet-500" />
                                <span className="line-through flex-grow">{item.name}</span>
                                <span className="line-through font-mono text-sm">${item.amount}</span>
                            </div>
                        ))}
                        </div>
                )}
            </div>
            
            <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const nameInput = form.elements.namedItem('name') as HTMLInputElement;
                const amountInput = form.elements.namedItem('amount') as HTMLInputElement;
                handleAddItem(list.id, nameInput.value, Number(amountInput.value));
                form.reset();
            }} className="flex gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <input name="name" placeholder="Nuevo Ítem" className="flex-grow bg-gray-200 dark:bg-gray-700 p-2 rounded text-sm"/>
                <input name="amount" type="number" placeholder="$" className="w-20 bg-gray-200 dark:bg-gray-700 p-2 rounded text-sm"/>
                <button type="submit" className="text-violet-500"><Plus/></button>
            </form>
            
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Gastado este Mes:</span>
                <span className="text-lg font-bold text-rose-500">${totalSpentThisMonth.toLocaleString()}</span>
            </div>

            <PromotionsFinder listItems={list.items} />
            </Card>
        );
      })}

      <Card>
        <form onSubmit={handleAddList} className="flex gap-2">
          <input type="text" value={newListName} onChange={e => setNewListName(e.target.value)} placeholder="Nueva Lista..." className="flex-grow bg-gray-200 dark:bg-gray-700 p-2 rounded-lg" required />
          <button type="submit" className="bg-violet-500 p-2 rounded-lg text-white"><Plus /></button>
        </form>
      </Card>
      
      <PriceOracle historicalPrices={historicalPrices} addHistoricalPrice={addHistoricalPrice} />
    </div>
  );
};

export default TransmutationView;
