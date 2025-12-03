import React, { useState, useEffect } from 'react';
import type { Settings, Theme, Wallet, Asset } from '../types';
import Card from './ui/Card';
import { Plus, X, Wallet as WalletIcon, Coins, Trash2, Clock, Edit2 } from 'lucide-react';

interface SettingsViewProps {
  settings: Settings;
  onSave: (newSettings: Settings) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  wallets: Wallet[];
  onWalletsChange: (wallets: Wallet[]) => void;
  isPrivacyMode: boolean;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave, theme, onThemeChange, wallets, onWalletsChange, isPrivacyMode }) => {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [newAsset, setNewAsset] = useState<{name: string, amount: string, frequency: Asset['frequency'], day: string}>({name: '', amount: '', frequency: 'monthly', day: '1'});
  const [newWallet, setNewWallet] = useState<{name: string, type: Wallet['type']}>({name: '', type: 'debit'});
  const [editingWalletId, setEditingWalletId] = useState<string|null>(null);

  useEffect(() => { setLocalSettings(settings); }, [settings]);
  
  const updateHourlyRate = (assets: Asset[], hours: number) => {
      const totalIncome = assets.reduce((sum, a) => sum + a.amount, 0);
      return hours > 0 ? totalIncome / hours : 0;
  }

  const handleHoursChange = (hours: number) => {
      const newRate = updateHourlyRate(localSettings.assets, hours);
      const updated = { ...localSettings, hourlyRate: newRate, monthlyHours: hours };
      setLocalSettings(updated);
      onSave(updated);
  }
  
  const handleAddAsset = (e: React.FormEvent) => {
      e.preventDefault();
      const asset: Asset = { id: `asset-${Date.now()}`, name: newAsset.name, amount: Number(newAsset.amount), frequency: newAsset.frequency, day: Number(newAsset.day) };
      const updatedAssets = [...(localSettings.assets || []), asset];
      const newRate = updateHourlyRate(updatedAssets, localSettings.monthlyHours || 160);
      onSave({ ...localSettings, assets: updatedAssets, hourlyRate: newRate });
      setNewAsset({name: '', amount: '', frequency: 'monthly', day: '1'});
  }

   const handleDeleteAsset = (id: string) => {
      const updatedAssets = localSettings.assets.filter(a => a.id !== id);
      const newRate = updateHourlyRate(updatedAssets, localSettings.monthlyHours || 160);
      onSave({ ...localSettings, assets: updatedAssets, hourlyRate: newRate });
  };
  
  const handleAddWallet = (e: React.FormEvent) => {
      e.preventDefault();
      onWalletsChange([...wallets, { id: `wal-${Date.now()}`, name: newWallet.name, type: newWallet.type }]);
      setNewWallet({name: '', type: 'debit'});
  }

  const handleDeleteWallet = (id: string) => onWalletsChange(wallets.filter(w => w.id !== id));

  const handleWalletUpdate = (id: string, field: keyof Wallet, value: any) => {
      onWalletsChange(wallets.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

    return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Ajustes</h1>
      
      <Card>
        <h2 className="text-xl font-semibold mb-2">Apariencia</h2>
        <div className="flex items-center justify-between h-8">
            <span>Tema</span>
            <button onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')} className={`relative inline-flex h-6 w-11 items-center rounded-full ${theme === 'dark' ? 'bg-violet-500' : 'bg-gray-300'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} /></button>
        </div>
      </Card>

      <Card>
          <div className="flex items-center gap-2 mb-2"><Coins size={20} className="text-emerald-500"/><h2 className="text-xl font-semibold">Ingresos Programados</h2></div>
          <div className="space-y-2 mb-4">
              {localSettings.assets?.map(asset => (
                  <div key={asset.id} className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
                      <span>{asset.name} ({asset.frequency}, día {asset.day})</span>
                      <div className="flex items-center gap-3"><span className="font-mono font-bold text-emerald-500">{isPrivacyMode ? '****' : `$${asset.amount}`}</span><button onClick={() => handleDeleteAsset(asset.id)} className="text-gray-400 hover:text-rose-500"><X size={16}/></button></div>
                  </div>
              ))}
          </div>
          <form onSubmit={handleAddAsset} className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm"><input value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} placeholder="Nombre" className="col-span-2 md:col-span-1 flex-grow p-2 rounded-lg" required/><input value={newAsset.amount} onChange={e => setNewAsset({...newAsset, amount: e.target.value})} type="number" placeholder="$" className="p-2 rounded-lg" required/><div className="flex gap-2"><select value={newAsset.frequency} onChange={e => setNewAsset({...newAsset, frequency: e.target.value as any})} className="p-2 rounded-lg w-full"><option value="monthly">Mes</option><option value="bi-monthly">Quincena</option><option value="weekly">Semana</option></select><input value={newAsset.day} onChange={e => setNewAsset({...newAsset, day: e.target.value})} type="number" placeholder="Día" className="w-16 p-2 rounded-lg" required/></div><button type="submit" className="bg-emerald-500 p-2 rounded-lg text-white flex justify-center items-center"><Plus size={20}/></button></form>

          <div className="mt-4 pt-4 border-t"><div className="flex items-center gap-2 mb-2"><Clock size={16} /><span className="text-sm font-medium">Filosofía del Tiempo</span></div><div className="flex items-center gap-4"><label className="text-sm">Horas Laborales / Mes:</label><input type="number" value={localSettings.monthlyHours || ''} onChange={e => handleHoursChange(Number(e.target.value))} className="w-20 p-1 rounded text-center text-sm" /><span className="text-xs text-violet-500">(Valor hora: {isPrivacyMode ? '****' : `$${localSettings.hourlyRate.toFixed(2)}`})</span></div></div>
      </Card>

      <Card>
          <div className="flex items-center gap-2 mb-2"><WalletIcon size={20}/><h2 className="text-xl font-semibold">Billeteras</h2></div>
          <div className="space-y-3 mb-4">
              {wallets.map(wallet => (
                  <div key={wallet.id} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm relative group">
                      <div className="flex justify-between items-start"><p className="font-bold">{wallet.name}</p><div className="flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={() => setEditingWalletId(editingWalletId === wallet.id ? null : wallet.id)}><Edit2 size={16}/></button><button onClick={() => handleDeleteWallet(wallet.id)} className="text-rose-500"><Trash2 size={16}/></button></div></div>
                      {wallet.type === 'credit' && editingWalletId === wallet.id && (<div className="grid grid-cols-2 gap-4 mt-2 border-t pt-2"><input type="number" min="1" max="31" value={wallet.closingDay || ''} onChange={(e) => handleWalletUpdate(wallet.id, 'closingDay', Number(e.target.value))} className="w-full p-1 rounded text-xs text-center" placeholder="Día Cierre"/><input type="number" min="1" max="31" value={wallet.dueDay || ''} onChange={(e) => handleWalletUpdate(wallet.id, 'dueDay', Number(e.target.value))} className="w-full p-1 rounded text-xs text-center" placeholder="Día Vence"/></div>)}
                  </div>
              ))}
          </div>
          <form onSubmit={handleAddWallet} className="flex gap-2 flex-wrap"><input value={newWallet.name} onChange={e => setNewWallet({...newWallet, name: e.target.value})} placeholder="Nombre de la Billetera" className="flex-grow p-2 rounded-lg text-sm" required/><select value={newWallet.type} onChange={e => setNewWallet({...newWallet, type: e.target.value as any})} className="p-2 rounded-lg text-sm"><option value="cash">Efectivo</option><option value="debit">Débito</option><option value="credit">Crédito</option></select><button type="submit" className="bg-violet-500 p-2 rounded-lg text-white"><Plus size={20}/></button></form>
      </Card>
    </div>
  );
};
export default SettingsView;
