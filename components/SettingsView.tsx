import React, { useState, useEffect } from 'react';
import type { Settings, Theme, Wallet, Entity, Asset } from '../types';
import Card from './ui/Card';
import { Plus, X, Users, Wallet as WalletIcon, Coins, Trash2, Clock } from 'lucide-react';

interface SettingsViewProps {
  settings: Settings;
  onSave: (newSettings: Settings) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  wallets: Wallet[];
  onWalletsChange: (wallets: Wallet[]) => void;
  isPrivacyMode: boolean; // Add prop
}

const ensureArrays = (settings: Settings): Settings => ({
    ...settings,
    assets: settings.assets || [],
    entities: settings.entities || [],
    guarantees: settings.guarantees || []
});

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave, theme, onThemeChange, wallets, onWalletsChange, isPrivacyMode }) => {
  const [localSettings, setLocalSettings] = useState<Settings>(ensureArrays(settings));
  const [newEntity, setNewEntity] = useState('');
  const [newAsset, setNewAsset] = useState<{name: string, amount: string}>({name: '', amount: ''});
  const [newWallet, setNewWallet] = useState<{name: string, type: Wallet['type']}>({name: '', type: 'debit'});
  const [monthlyHours, setMonthlyHours] = useState(160);

  useEffect(() => {
    setLocalSettings(ensureArrays(settings));
    if (settings.hourlyRate > 0) {
        const totalIncome = settings.assets?.reduce((sum, a) => sum + a.amount, 0) || 0;
        if (totalIncome > 0) {
            setMonthlyHours(Math.round(totalIncome / settings.hourlyRate));
        }
    }
  }, [settings]);

  const handleSave = () => onSave(localSettings);
  
  const updateHourlyRate = (assets: Asset[], hours: number) => {
      const totalIncome = assets.reduce((sum, a) => sum + a.amount, 0);
      return hours > 0 ? totalIncome / hours : 0;
  }

  const handleHoursChange = (hours: number) => {
      setMonthlyHours(hours);
      const newRate = updateHourlyRate(localSettings.assets, hours);
      const updated = { ...localSettings, hourlyRate: newRate };
      setLocalSettings(updated);
      onSave(updated);
  }
  
  const handleAddAsset = (e: React.FormEvent) => {
      e.preventDefault();
      if (newAsset.name && newAsset.amount) {
          const asset: Asset = { id: `asset-${Date.now()}`, name: newAsset.name, amount: Number(newAsset.amount) };
          const updatedAssets = [...localSettings.assets, asset];
          const newRate = updateHourlyRate(updatedAssets, monthlyHours);
          const updated = { ...localSettings, assets: updatedAssets, hourlyRate: newRate };
          setLocalSettings(updated);
          onSave(updated);
          setNewAsset({name: '', amount: ''});
      }
  }

   const handleDeleteAsset = (id: string) => {
      const updatedAssets = localSettings.assets.filter(a => a.id !== id);
      const newRate = updateHourlyRate(updatedAssets, monthlyHours);
      const updated = { ...localSettings, assets: updatedAssets, hourlyRate: newRate };
      setLocalSettings(updated);
      onSave(updated);
  };

  const handleAddEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEntity.trim()) {
        const entity: Entity = { id: `ent-${Date.now()}`, name: newEntity.trim() };
        const updated = { ...localSettings, entities: [...(localSettings.entities || []), entity] };
        setLocalSettings(updated);
        onSave(updated);
        setNewEntity('');
    }
  };
  
  const handleDeleteEntity = (id: string) => {
      const updated = { ...localSettings, entities: localSettings.entities?.filter(e => e.id !== id) };
      setLocalSettings(updated);
      onSave(updated);
  };
  
  const handleAddWallet = (e: React.FormEvent) => {
      e.preventDefault();
      if (newWallet.name) {
          const wallet: Wallet = { id: `wal-${Date.now()}`, name: newWallet.name, type: newWallet.type };
          const updatedWallets = [...wallets, wallet];
          onWalletsChange(updatedWallets);
          setNewWallet({name: '', type: 'debit'});
      }
  }

  const handleDeleteWallet = (id: string) => onWalletsChange(wallets.filter(w => w.id !== id));

  const handleWalletUpdate = (id: string, field: keyof Wallet, value: any) => {
      const updatedWallets = wallets.map(w => w.id === id ? { ...w, [field]: value } : w);
      onWalletsChange(updatedWallets);
  };

    return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100" style={{fontWeight: 700}}>Ajustes</h1>
      
      <Card>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Apariencia</h2>
        <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-300">Tema Oscuro</span>
            <button onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-violet-500' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
      </Card>

      <Card>
          <div className="flex items-center gap-2 mb-2">
              <Coins size={20} className="text-emerald-500"/>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Activos (Columna Activa)</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">Define tus ingresos mensuales fijos.</p>
          <div className="space-y-2 mb-4">
              {localSettings.assets?.map(asset => (
                  <div key={asset.id} className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
                      <span>{asset.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-emerald-600 font-bold">{isPrivacyMode ? '****' : `$${asset.amount}`}</span>
                        <button onClick={() => handleDeleteAsset(asset.id)} className="text-gray-400 hover:text-rose-500"><X size={16}/></button>
                      </div>
                  </div>
              ))}
          </div>
          <form onSubmit={handleAddAsset} className="flex gap-2">
              <input value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} placeholder="Nombre (ej. Sueldo)" className="flex-grow bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-sm" required/>
              <input value={newAsset.amount} onChange={e => setNewAsset({...newAsset, amount: e.target.value})} type="number" placeholder="$" className="w-24 bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-sm" required/>
              <button type="submit" className="bg-emerald-500 p-2 rounded-lg text-white"><Plus size={20}/></button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
             <div className="flex items-center gap-2 mb-2 text-gray-600 dark:text-gray-300">
                 <Clock size={16} />
                 <span className="text-sm font-medium">Filosofía del Tiempo</span>
             </div>
             <p className="text-xs text-gray-500 mb-2">
                 Ingresa tus horas de trabajo mensuales para que la app calcule cuánta "vida" te cuestan tus compras.
             </p>
             <div className="flex items-center gap-4">
                 <label className="text-sm">Horas Laborales / Mes:</label>
                 <input 
                    type="number" 
                    value={monthlyHours} 
                    onChange={e => handleHoursChange(Number(e.target.value))} 
                    className="w-20 bg-gray-200 dark:bg-gray-700 p-1 rounded text-center text-sm"
                 />
                 <span className="text-xs text-violet-500">(Valor hora: ${localSettings.hourlyRate.toFixed(2)})</span>
             </div>
          </div>
      </Card>

      <Card>
          <div className="flex items-center gap-2 mb-2">
              <WalletIcon size={20} className="text-gray-600 dark:text-gray-300"/>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Billeteras y Tarjetas</h2>
          </div>
          <div className="space-y-3 mb-4">
              {wallets.map(wallet => (
                  <div key={wallet.id} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm relative group">
                      <div className="flex justify-between items-start">
                        <p className="font-bold">{wallet.name} <span className="text-xs font-normal opacity-50 uppercase ml-2">({wallet.type})</span></p>
                        <button onClick={() => handleDeleteWallet(wallet.id)} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                      </div>
                      
                      {wallet.type === 'credit' && (
                        <div className="grid grid-cols-2 gap-4 mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                          <div>
                              <label className="block text-[10px] text-gray-500 mb-1">Cierre (Día)</label>
                              <input 
                                type="number" min="1" max="31" 
                                value={wallet.closingDay || ''} 
                                onChange={(e) => handleWalletUpdate(wallet.id, 'closingDay', Number(e.target.value))}
                                className="w-full bg-white dark:bg-gray-700 p-1 rounded border border-gray-300 dark:border-gray-600 text-xs text-center"
                                placeholder="DD"
                              />
                          </div>
                          <div>
                              <label className="block text-[10px] text-gray-500 mb-1">Vence (Día)</label>
                              <input 
                                type="number" min="1" max="31" 
                                value={wallet.dueDay || ''} 
                                onChange={(e) => handleWalletUpdate(wallet.id, 'dueDay', Number(e.target.value))}
                                className="w-full bg-white dark:bg-gray-700 p-1 rounded border border-gray-300 dark:border-gray-600 text-xs text-center"
                                placeholder="DD"
                              />
                          </div>
                        </div>
                      )}
                  </div>
              ))}
          </div>
          <form onSubmit={handleAddWallet} className="flex gap-2 flex-wrap">
              <input value={newWallet.name} onChange={e => setNewWallet({...newWallet, name: e.target.value})} placeholder="Nombre (ej. Visa Oro)" className="flex-grow bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-sm" required/>
              <select value={newWallet.type} onChange={e => setNewWallet({...newWallet, type: e.target.value as any})} className="bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-sm">
                  <option value="cash">Efectivo</option>
                  <option value="debit">Débito</option>
                  <option value="credit">Crédito</option>
              </select>
              <button type="submit" className="bg-violet-500 p-2 rounded-lg text-white"><Plus size={20}/></button>
          </form>
      </Card>

      <Card>
          <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-gray-600 dark:text-gray-300"/>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Entidades (¿Quién gasta?)</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
              {localSettings.entities?.map(ent => (
                  <div key={ent.id} className="flex items-center gap-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-3 py-1 rounded-full text-sm">
                      {ent.name}
                      <button onClick={() => handleDeleteEntity(ent.id)}><X size={14}/></button>
                  </div>
              ))}
          </div>
          <form onSubmit={handleAddEntity} className="flex gap-2">
              <input value={newEntity} onChange={e => setNewEntity(e.target.value)} placeholder="Nueva Entidad (ej. Mascota)" className="flex-grow bg-gray-200 dark:bg-gray-700 p-2 rounded-lg text-sm" />
              <button type="submit" className="bg-violet-500 p-2 rounded-lg text-white"><Plus size={20}/></button>
          </form>
      </Card>
      
    </div>
  );
};

export default SettingsView;
