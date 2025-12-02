import React, { useState, useMemo } from 'react';
import { ClipboardList, CheckSquare, Square, X, Plus, Trash2, Search, Sparkles, Calendar, Repeat, Edit2 } from 'lucide-react';
import type { TransmutationList, TransmutationItem, HistoricalPriceItem, Asset, Transaction } from '../types';
import Card from './ui/Card';
import { findPromotions } from '../services/geminiService';

interface TransmutationViewProps {
  lists: TransmutationList[];
  setLists: (lists: TransmutationList[]) => void;
  onCompleteItem: (item: TransmutationItem, listId: string) => void;
  historicalPrices: HistoricalPriceItem; // Kept in types but unused component removed
  addHistoricalPrice: (name: string, price: number) => void;
  onRequestDeleteList: (listId: string) => void;
  onRequestDeleteItem: (listId: string, itemId: string) => void;
  assets: Asset[];
  transactions: Transaction[];
  isPrivacyMode: boolean;
}

// Utility to hide numbers
const formatMoney = (amount: number, isPrivacy: boolean) => isPrivacy ? '****' : `$${amount.toLocaleString()}`;

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
                <button onClick={handleSearch} className="flex items-center gap-2 text-xs font-bold text-violet-500 hover:text-violet-600 transition-colors">
                    <Sparkles size={14} /> Buscar Ofertas con IA
                </button>
            )}
            {loading && <p className="text-xs text-gray-500 animate-pulse">Consultando el éter...</p>}
            {result && (
                <div className="bg-violet-500/10 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-200 mt-2">
                    {result}
                </div>
            )}
        </div>
    );
};

const ItemEditor: React.FC<{ item: TransmutationItem, onSave: (updated: TransmutationItem) => void, onCancel: () => void }> = ({ item, onSave, onCancel }) => {
    const [name, setName] = useState(item.name);
    const [amount, setAmount] = useState(item.amount.toString());
    const [dueDate, setDueDate] = useState(item.dueDate || '');
    const [isRecurring, setIsRecurring] = useState(item.isRecurring || false);

    const handleSave = () => {
        onSave({ ...item, name, amount: Number(amount), dueDate, isRecurring });
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-lg mt-2 mb-2 border border-violet-500/30">
            <div className="flex gap-2 mb-2">
                <input value={name} onChange={e => setName(e.target.value)} className="flex-grow p-1 rounded bg-white dark:bg-gray-800 text-sm" placeholder="Nombre" />
                <input value={amount} onChange={e => setAmount(e.target.value)} type="number" className="w-20 p-1 rounded bg-white dark:bg-gray-800 text-sm" placeholder="$" />
            </div>
            <div className="flex gap-4 items-center mb-2">
                <div className="flex items-center gap-1">
                    <Calendar size={14} className="text-gray-500"/>
                    <input value={dueDate} onChange={e => setDueDate(e.target.value)} type="number" min="1" max="31" placeholder="Día Vto." className="w-16 p-1 rounded bg-white dark:bg-gray-800 text-xs" />
                </div>
                <div className="flex items-center gap-1 cursor-pointer" onClick={() => setIsRecurring(!isRecurring)}>
                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${isRecurring ? 'bg-violet-500 border-violet-500' : 'border-gray-400'}`}>
                        {isRecurring && <Repeat size={10} className="text-white"/>}
                    </div>
                    <span className="text-xs text-gray-500">Mensual</span>
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <button onClick={onCancel} className="text-xs text-gray-500">Cancelar</button>
                <button onClick={handleSave} className="text-xs bg-violet-500 text-white px-3 py-1 rounded">Guardar</button>
            </div>
        </div>
    );
};

const TransmutationView: React.FC<TransmutationViewProps> = ({
  lists, setLists, onCompleteItem, onRequestDeleteList, onRequestDeleteItem, transactions, isPrivacyMode
}) => {
  const [newListName, setNewListName] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      const newList: TransmutationList = { id: `list-${Date.now()}`, name: newListName.trim(), items: [] };
      setLists([...lists, newList]); // React should handle this update cleanly now
      setNewListName('');
    }
  };

  const handleAddItem = (listId: string, name: string, amount: number, isRecurring: boolean, dueDate: string) => {
    if (!name.trim()) return;
    const newItem: TransmutationItem = { 
        id: `item-${Date.now()}`, 
        name: name.trim(), 
        amount: amount || 0, 
        isCompleted: false,
        isRecurring,
        dueDate
    };
    const newLists = lists.map(l => l.id === listId ? { ...l, items: [...l.items, newItem] } : l);
    setLists(newLists);
  };
  
  const handleUpdateItem = (listId: string, updatedItem: TransmutationItem) => {
      const newLists = lists.map(l => l.id === listId ? { ...l, items: l.items.map(i => i.id === updatedItem.id ? updatedItem : i) } : l);
      setLists(newLists);
      setEditingItemId(null);
  };

  const handleToggleItem = (listId: string, itemId: string) => {
    let completedItem: TransmutationItem | null = null;
    const newLists = lists.map(list => {
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
    setLists(newLists);
    if (completedItem) onCompleteItem(completedItem, listId);
  };

  // Filter out lists that have their own dedicated views
  const visibleLists = lists.filter(l => !l.isCreditCardView && !l.isLoansView);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList size={32} className="text-violet-500" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Transmutación</h1>
      </div>

      {visibleLists.map(list => {
        const totalPlanned = list.items.reduce((sum, item) => sum + item.amount, 0);
        const totalSpent = useMemo(() => {
            const now = new Date();
            return transactions.filter(t => t.listId === list.id && t.type === 'expense' && new Date(t.date).getMonth() === now.getMonth()).reduce((s, t) => s + t.amount, 0);
        }, [transactions, list.id]);

        return (
            <Card key={list.id} className="space-y-3">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                <div>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{list.name}</h2>
                    <span className="text-xs text-gray-400">Planificado: {formatMoney(totalPlanned, isPrivacyMode)}</span>
                </div>
                <button onClick={() => onRequestDeleteList(list.id)} className="text-gray-400 hover:text-rose-500"><Trash2 size={18} /></button>
            </div>
            
            <div className="space-y-2">
                {list.items.filter(i => !i.isCompleted).map((item) => {
                    const today = new Date().getDate();
                    const due = item.dueDate ? parseInt(item.dueDate) : 99;
                    const isDueSoon = due - today <= 3 && due >= today;
                    
                    if (editingItemId === item.id) {
                        return <ItemEditor key={item.id} item={item} onSave={(updated) => handleUpdateItem(list.id, updated)} onCancel={() => setEditingItemId(null)} />;
                    }

                    return (
                        <div key={item.id} className="flex items-center gap-2 group p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <button onClick={() => handleToggleItem(list.id, item.id)}><Square size={20} className="text-gray-400 hover:text-violet-500" /></button>
                            <div className="flex-grow flex flex-col">
                                <span className="text-sm font-medium">{item.name}</span>
                                <div className="flex gap-2 text-[10px] text-gray-400">
                                    {item.isRecurring && <span className="flex items-center gap-0.5 text-violet-400"><Repeat size={10}/> Mensual</span>}
                                    {item.dueDate && <span className={`flex items-center gap-0.5 ${isDueSoon ? 'text-rose-500 font-bold' : ''}`}><Calendar size={10}/> Vence: {item.dueDate}</span>}
                                </div>
                            </div>
                            <span className="font-mono text-sm">{formatMoney(item.amount, isPrivacyMode)}</span>
                            <div className="flex gap-1">
                                <button onClick={() => setEditingItemId(item.id)} className="text-gray-400 hover:text-blue-500"><Edit2 size={16} /></button>
                                <button onClick={() => onRequestDeleteItem(list.id, item.id)}><X size={16} className="text-gray-400 hover:text-rose-500" /></button>
                            </div>
                        </div>
                    );
                })}
                
                {list.items.filter(i => i.isCompleted).length > 0 && (
                    <div className="pt-2 mt-2 opacity-60">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Realizados</p>
                        {list.items.filter(i => i.isCompleted).map(item => (
                            <div key={item.id} className="flex items-center gap-2 text-gray-500">
                                <CheckSquare size={18} className="text-violet-500" />
                                <span className="line-through flex-grow text-sm">{item.name}</span>
                                <span className="line-through font-mono text-xs">{formatMoney(item.amount, isPrivacyMode)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <NewItemForm onAdd={(name, amount, isRecurring, dueDate) => handleAddItem(list.id, name, amount, isRecurring, dueDate)} />
            
            <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/30 p-2 rounded">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Gastado Real (Mes)</span>
                <span className="text-base font-bold text-rose-500">{formatMoney(totalSpent, isPrivacyMode)}</span>
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
    </div>
  );
};

const NewItemForm: React.FC<{onAdd: (name: string, amount: number, isRecurring: boolean, dueDate: string) => void}> = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(name, Number(amount), isRecurring, dueDate);
        setName(''); setAmount(''); setDueDate(''); setIsRecurring(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
                <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Nuevo Ítem" className="flex-grow bg-gray-200/80 dark:bg-gray-700/80 p-2 rounded-lg text-sm" required />
                <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="$" className="w-20 bg-gray-200/80 dark:bg-gray-700/80 p-2 rounded-lg text-sm" required />
            </div>
            <div className="flex justify-between items-center">
                <div className="flex gap-3">
                    <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="rounded text-violet-500 focus:ring-0"/>
                        Mensual
                    </label>
                    <input type="number" min="1" max="31" placeholder="Día Vto." value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-16 bg-gray-200/80 dark:bg-gray-700/80 p-1 rounded text-xs text-center" />
                </div>
                <button type="submit" className="text-violet-500"><Plus size={24}/></button>
            </div>
        </form>
    );
};

export default TransmutationView;
