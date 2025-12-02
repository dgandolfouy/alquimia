import React, { useState, useMemo } from 'react';
import { FlaskConical, CheckSquare, Square, X, Plus, Trash2, Edit, Save } from 'lucide-react';
// FIX: 'LaboratoryList' and 'LaboratoryItem' are not exported from types.ts. Aliasing 'TransmutationList' and 'TransmutationItem' to fix this.
import type { TransmutationList as LaboratoryList, TransmutationItem as LaboratoryItem } from '../types';
import Card from './ui/Card';

interface LaboratoryViewProps {
  formulas: LaboratoryList[];
  setFormulas: React.Dispatch<React.SetStateAction<LaboratoryList[]>>;
  onCompleteItem: (item: LaboratoryItem) => void;
}

const LaboratoryView: React.FC<LaboratoryViewProps> = ({ formulas, setFormulas, onCompleteItem }) => {
  const [newFormulaName, setNewFormulaName] = useState('');
  const [editingFormulaId, setEditingFormulaId] = useState<string | null>(null);

  const handleAddFormula = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFormulaName.trim()) {
      const newFormula: LaboratoryList = {
        id: `formula-${Date.now()}`,
        name: newFormulaName.trim(),
        items: []
      };
      setFormulas(prev => [...prev, newFormula]);
      setNewFormulaName('');
    }
  };

  const handleDeleteFormula = (formulaId: string) => {
    setFormulas(prev => prev.filter(f => f.id !== formulaId));
  };

  const handleAddItemToFormula = (formulaId: string, itemName: string, itemAmount: number) => {
    if (!itemName.trim() || isNaN(itemAmount) || itemAmount <= 0) return;
    const newItem: LaboratoryItem = {
      id: `item-${Date.now()}`,
      name: itemName.trim(),
      amount: itemAmount,
      isCompleted: false
    };
    setFormulas(prev => prev.map(f => f.id === formulaId ? { ...f, items: [...f.items, newItem] } : f));
  };

  const handleDeleteItem = (formulaId: string, itemId: string) => {
    setFormulas(prev => prev.map(f => f.id === formulaId ? { ...f, items: f.items.filter(i => i.id !== itemId) } : f));
  };
  
  const handleToggleItem = (formulaId: string, itemId: string) => {
      let completedItem: LaboratoryItem | null = null;
      const updatedFormulas = formulas.map(formula => {
          if (formula.id === formulaId) {
              return {
                  ...formula,
                  items: formula.items.map(item => {
                      if (item.id === itemId) {
                          // If it's not completed, we are now completing it.
                          if (!item.isCompleted) {
                              completedItem = item;
                          }
                          return { ...item, isCompleted: !item.isCompleted };
                      }
                      return item;
                  })
              };
          }
          return formula;
      });
      setFormulas(updatedFormulas);
      
      // If an item was just completed, trigger the transaction modal.
      if (completedItem) {
        onCompleteItem(completedItem);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FlaskConical size={32} className="text-violet-500"/>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">El Laboratorio</h1>
      </div>
       <p className="text-gray-500 dark:text-gray-400">
        Prepara tus 'Fórmulas' mensuales. Cada 'Ingrediente' es un gasto planeado. Al transmutarlo, se convierte en una transacción real.
      </p>

      {formulas.map(formula => (
        <Card key={formula.id} className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">{formula.name}</h2>
            <button onClick={() => handleDeleteFormula(formula.id)} className="text-gray-400 hover:text-rose-500"><Trash2 size={18}/></button>
          </div>
          
          {/* Items List */}
          <div className="border-t border-b border-gray-200 dark:border-gray-700 py-2 space-y-2">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Ingredientes Pendientes</h3>
            {formula.items.filter(i => !i.isCompleted).map(item => (
                <div key={item.id} className="flex items-center gap-2">
                    <button onClick={() => handleToggleItem(formula.id, item.id)}><Square size={20} className="text-gray-400"/></button>
                    <span className="flex-grow">{item.name}</span>
                    <span className="font-mono text-sm bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">${item.amount.toFixed(2)}</span>
                    <button onClick={() => handleDeleteItem(formula.id, item.id)}><X size={16} className="text-gray-400 hover:text-rose-500"/></button>
                </div>
            ))}
             {formula.items.filter(i => !i.isCompleted).length === 0 && <p className="text-xs text-gray-400 italic">Nada pendiente.</p>}
            
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">Transmutaciones Realizadas</h3>
            {formula.items.filter(i => i.isCompleted).map(item => (
                <div key={item.id} className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                    <button onClick={() => handleToggleItem(formula.id, item.id)}><CheckSquare size={20} className="text-violet-500"/></button>
                    <span className="flex-grow line-through">{item.name}</span>
                    <span className="font-mono text-sm line-through">${item.amount.toFixed(2)}</span>
                </div>
            ))}
             {formula.items.filter(i => i.isCompleted).length === 0 && <p className="text-xs text-gray-400 italic">Ninguna transmutación este ciclo.</p>}
          </div>

          <NewIngredientForm onAdd={(name, amount) => handleAddItemToFormula(formula.id, name, amount)} />
        </Card>
      ))}

      <Card>
        <form onSubmit={handleAddFormula} className="flex gap-2">
          <input type="text" value={newFormulaName} onChange={e => setNewFormulaName(e.target.value)} placeholder="Nombre de la nueva Fórmula" className="flex-grow bg-gray-200 dark:bg-gray-700 p-2 rounded-lg" required />
          <button type="submit" className="bg-violet-500 p-2 rounded-lg text-white"><Plus /></button>
        </form>
      </Card>
    </div>
  );
};

const NewIngredientForm: React.FC<{onAdd: (name: string, amount: number) => void}> = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(name, Number(amount));
        setName('');
        setAmount('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Nuevo Ingrediente" className="flex-grow bg-gray-200/80 dark:bg-gray-700/80 p-2 rounded-lg text-sm" required />
            <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="$" step="0.01" className="w-20 bg-gray-200/80 dark:bg-gray-700/80 p-2 rounded-lg text-sm" required />
            <button type="submit" className="p-2 text-violet-500"><Plus size={20}/></button>
        </form>
    );
};

export default LaboratoryView;
