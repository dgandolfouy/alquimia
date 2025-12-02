import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { auth, db, isFirebaseConfigured } from './services/firebase';
import IntroScreen from './components/IntroScreen';
import type { Transaction, Wallet, View, Settings as AppSettings, HistoricalPriceItem, Theme, TransmutationList, TransmutationItem, HistoricalPrice, User } from './types';
import { DEFAULT_WALLETS, DEFAULT_TRANSMUTATION_LISTS, DEFAULT_ENTITIES, DEFAULT_ASSETS } from './constants';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import SettingsView from './components/SettingsView';
import Login from './components/Login';
import TransactionModal from './components/TransactionModal';
import BottomNav from './components/BottomNav';
import TransmutationView from './components/TransmutationView';
import ReceiptScannerModal from './components/ReceiptScannerModal';
import SynthesisView from './components/SynthesisView';
import Header from './components/Header';
import ConfirmationDialog from './components/ui/ConfirmationDialog';
import CreditCardModal from './components/CreditCardModal';
import FirebaseNotConfigured from './components/FirebaseNotConfigured';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [showIntro, setShowIntro] = useState(true);
    
    // App data states
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>(DEFAULT_WALLETS);
    const [settings, setSettings] = useState<AppSettings>({ hourlyRate: 0, assets: DEFAULT_ASSETS, entities: DEFAULT_ENTITIES, guarantees: [] });
    const [historicalPrices, setHistoricalPrices] = useState<HistoricalPriceItem>({});
    const [transmutationLists, setTransmutationLists] = useState<TransmutationList[]>(DEFAULT_TRANSMUTATION_LISTS);
    const [theme, setTheme] = useState<Theme>('dark');
  
    const [activeView, setActiveView] = useState<View>('home');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [prefilledTransaction, setPrefilledTransaction] = useState<Partial<Transaction> | null>(null);
    const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
    const [isCardsModalOpen, setIsCardsModalOpen] = useState(false);
    
    const [confirmationState, setConfirmationState] = useState<{ isOpen: boolean; message: string; onConfirm: (() => void) | null }>({ isOpen: false, message: '', onConfirm: null });
  
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowIntro(false);
        }, 4500); // 4.5 seconds
        return () => clearTimeout(timer);
    }, []);

    // Firebase Listeners
    useEffect(() => {
      if (!isFirebaseConfigured || !auth) {
        setIsAuthLoading(false);
        return;
      }
      const unsubscribe = auth.onAuthStateChanged((firebaseUser: any) => {
        setUser(firebaseUser as User | null);
        setIsAuthLoading(false);
      });
      return () => unsubscribe();
    }, []);
  
    useEffect(() => {
      if (!user || !db) {
        setTransactions([]);
        setWallets(DEFAULT_WALLETS);
        setSettings({ hourlyRate: 0, assets: DEFAULT_ASSETS, entities: DEFAULT_ENTITIES, guarantees: [] });
        setHistoricalPrices({});
        setTransmutationLists(DEFAULT_TRANSMUTATION_LISTS);
        return;
      }
      const docRef = db.collection('users').doc(user.uid);
      const unsubscribe = docRef.onSnapshot((doc: any) => {
        if (doc.exists) {
          const data = doc.data();
          setTransactions(data?.transactions || []);
          setWallets(data?.wallets || DEFAULT_WALLETS);
          setSettings(data?.settings || { hourlyRate: 0, assets: DEFAULT_ASSETS, entities: DEFAULT_ENTITIES, guarantees: [] });
          setHistoricalPrices(data?.historicalPrices || {});
          setTransmutationLists(data?.transmutationLists || DEFAULT_TRANSMUTATION_LISTS);
          setTheme(data?.theme || 'dark');
        } else {
          docRef.set({
            transactions: [],
            wallets: DEFAULT_WALLETS,
            settings: { hourlyRate: 0, assets: DEFAULT_ASSETS, entities: DEFAULT_ENTITIES, guarantees: [] },
            historicalPrices: {},
            transmutationLists: DEFAULT_TRANSMUTATION_LISTS,
            theme: 'dark',
            createdAt: new Date().toISOString(),
          });
        }
      });
      return () => unsubscribe();
    }, [user]);
  
    // Update Functions
    const updateFirestore = (data: object) => { if (user && db) { 
        db.collection('users').doc(user.uid).set(data, { merge: true }).catch(console.error); 
    }};
    const addTransaction = (transaction: Omit<Transaction, 'id'>) => { const newTransaction: Transaction = { ...transaction, id: Date.now().toString() }; const updated = [newTransaction, ...transactions]; setTransactions(updated); updateFirestore({ transactions: updated }); };
    const updateTransaction = (updatedTransaction: Transaction) => { const updated = transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t); setTransactions(updated); updateFirestore({ transactions: updated }); };
    
    // FIX: Unified handler to satisfy Typescript strict function types
    const handleSaveTransaction = (transaction: Transaction | Omit<Transaction, 'id'>) => {
        if ('id' in transaction) {
            updateTransaction(transaction as Transaction);
        } else {
            addTransaction(transaction);
        }
    };

    const deleteTransaction = (id: string) => { const updated = transactions.filter(t => t.id !== id); setTransactions(updated); updateFirestore({ transactions: updated }); };
    const handleSettingsSave = (newSettings: AppSettings) => { setSettings(newSettings); updateFirestore({ settings: newSettings }); };
    const handleWalletsChange = (newWallets: Wallet[]) => { setWallets(newWallets); updateFirestore({ wallets: newWallets }); };
    const handleTransmutationListsChange = (newLists: TransmutationList[]) => { setTransmutationLists(newLists); updateFirestore({ transmutationLists: newLists }); };
    const addHistoricalPrice = (itemName: string, price: number) => { const normalizedName = itemName.trim().toLowerCase(); if (!normalizedName || isNaN(price) || price <= 0) return; const existing = historicalPrices[normalizedName] || []; const newPrice: HistoricalPrice = { price, date: new Date().toISOString() }; const updated = [...existing, newPrice].slice(-12); const newPrices = { ...historicalPrices, [normalizedName]: updated }; setHistoricalPrices(newPrices); updateFirestore({ historicalPrices: newPrices }); };
  
    // UI Logic
    useEffect(() => { document.documentElement.className = theme; document.body.className = theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'; }, [theme]);
    const handleLogout = () => auth?.signOut();
    const openModalForNew = () => { setEditingTransaction(null); setPrefilledTransaction(null); setIsModalOpen(true); };
    const openModalForEdit = (transaction: Transaction) => { setEditingTransaction(transaction); setPrefilledTransaction(null); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setEditingTransaction(null); setPrefilledTransaction(null); };
    const handleCompleteTransmutationItem = (item: TransmutationItem, listId: string) => { setPrefilledTransaction({ type: 'expense', amount: item.amount, description: item.name, listId: listId }); setIsModalOpen(true); };
    const handleOpenReceiptScanner = () => { setIsModalOpen(false); setIsReceiptScannerOpen(true); };
    const handleScanComplete = (items: { name: string; price: number }[]) => { const total = items.reduce((s, i) => s + i.price, 0); const desc = items.map(i => i.name).join(', '); setPrefilledTransaction({ type: 'expense', amount: total, description: desc }); setIsReceiptScannerOpen(false); setIsModalOpen(true); };
    const handleRequestConfirmation = (message: string, onConfirm: () => void) => { setConfirmationState({ isOpen: true, message, onConfirm }); };
    const handleCloseConfirmation = () => { setConfirmationState({ isOpen: false, message: '', onConfirm: null }); };
    const handleConfirmAction = () => { if (confirmationState.onConfirm) { confirmationState.onConfirm(); } handleCloseConfirmation(); };
    const onRequestDeleteTransaction = (id: string) => { handleRequestConfirmation('¿Estás seguro de que quieres eliminar esta transacción?', () => deleteTransaction(id)); };
    const onRequestDeleteList = (listId: string) => { handleRequestConfirmation('¿Seguro que quieres eliminar esta lista?', () => handleTransmutationListsChange(transmutationLists.filter(l => l.id !== listId))); };
    const onRequestDeleteItem = (listId: string, itemId: string) => { handleRequestConfirmation('¿Seguro que quieres eliminar este ítem?', () => handleTransmutationListsChange(transmutationLists.map(l => l.id === listId ? { ...l, items: l.items.filter(i => i.id !== itemId) } : l))); };
    const toggleSettings = () => { setActiveView(prev => prev === 'settings' ? 'home' : 'settings'); };
  
    const summary = useMemo(() => { const now = new Date(); const currentMonthTxs = transactions.filter(tx => new Date(tx.date).getMonth() === now.getMonth() && new Date(tx.date).getFullYear() === now.getFullYear()); const assetsIncome = settings.assets?.reduce((s, a) => s + a.amount, 0) || 0; const transIncome = currentMonthTxs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0); const totalIncome = assetsIncome + transIncome; const expenses = currentMonthTxs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0); const balance = totalIncome - expenses; const savingsRate = totalIncome > 0 ? balance / totalIncome : 0; return { income: totalIncome, expenses, balance, savingsRate }; }, [transactions, settings.assets]);
  
    const renderView = () => {
      switch (activeView) {
        case 'home': return <Dashboard transactions={transactions} settings={settings} onNewTransaction={openModalForNew} onOpenCards={() => setIsCardsModalOpen(true)} summary={summary} />;
        case 'transactions': return <TransactionList transactions={transactions} onEdit={openModalForEdit} onDelete={onRequestDeleteTransaction} settings={settings} />;
        case 'transmutar': return <TransmutationView lists={transmutationLists} setLists={handleTransmutationListsChange} onCompleteItem={handleCompleteTransmutationItem} historicalPrices={historicalPrices} addHistoricalPrice={addHistoricalPrice} onRequestDeleteList={onRequestDeleteList} onRequestDeleteItem={onRequestDeleteItem} assets={settings.assets || []} transactions={transactions} />;
        case 'synthesis': return <SynthesisView transactions={transactions} summary={summary} />;
        case 'settings': return <SettingsView settings={settings} onSave={handleSettingsSave} theme={theme} onThemeChange={(t) => {setTheme(t); updateFirestore({theme: t})}} wallets={wallets} onWalletsChange={handleWalletsChange} />;
        default: return <Dashboard transactions={transactions} settings={settings} onNewTransaction={openModalForNew} onOpenCards={() => setIsCardsModalOpen(true)} summary={summary} />;
      }
    };
  
    if (!isFirebaseConfigured) { return <FirebaseNotConfigured />; }
    if (showIntro || isAuthLoading) { return <IntroScreen />; }
    if (!user) { return <Login />; }
  
    return (
      <div className="min-h-screen flex flex-col">
        <Header userName={user.displayName || user.email?.split('@')[0] || 'Alquimista'} onSettingsClick={toggleSettings} onLogoutClick={handleLogout} />
        <main className="flex-grow p-4 pb-24 pt-32">{renderView()}</main>
        <BottomNav activeView={activeView} setActiveView={setActiveView} />
        {isModalOpen && <TransactionModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSaveTransaction} transaction={editingTransaction || prefilledTransaction} transmutationLists={transmutationLists} wallets={wallets} settings={settings} transactions={transactions} onScanReceipt={handleOpenReceiptScanner} />}
        {isReceiptScannerOpen && <ReceiptScannerModal isOpen={isReceiptScannerOpen} onClose={() => setIsReceiptScannerOpen(false)} onScanComplete={handleScanComplete} />}
        {isCardsModalOpen && <CreditCardModal isOpen={isCardsModalOpen} onClose={() => setIsCardsModalOpen(false)} wallets={wallets} transactions={transactions} />}
        {confirmationState.isOpen && <ConfirmationDialog isOpen={confirmationState.isOpen} onClose={handleCloseConfirmation} onConfirm={handleConfirmAction} title="Confirmar Acción" message={confirmationState.message} />}
      </div>
    );
};
  
  export default App;
