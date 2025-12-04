
import React, { useState, useEffect, useMemo } from 'react';
import { auth, db, isFirebaseConfigured } from './services/firebase';
import IntroScreen from './components/IntroScreen';
import type { Transaction, Wallet, View, Settings as AppSettings, HistoricalPriceItem, Theme, TransmutationList, TransmutationItem, User } from './types';
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
    
    // UI States
    const [activeView, setActiveView] = useState<View>('home');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [prefilledTransaction, setPrefilledTransaction] = useState<Partial<Transaction> | null>(null);
    const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
    const [isCardsModalOpen, setIsCardsModalOpen] = useState(false);
    const [isPrivacyMode, setIsPrivacyMode] = useState(false);
    
    const [confirmationState, setConfirmationState] = useState<{ isOpen: boolean; message: string; onConfirm: (() => void) | null }>({ isOpen: false, message: '', onConfirm: null });
  
    useEffect(() => {
        const timer = setTimeout(() => { setShowIntro(false); }, 4500);
        return () => clearTimeout(timer);
    }, []);

    // Firebase Auth Listener
    useEffect(() => {
      if (!isFirebaseConfigured || !auth) { setIsAuthLoading(false); return; }
      const unsubscribe = auth.onAuthStateChanged((firebaseUser: any) => {
        setUser(firebaseUser as User | null);
        setIsAuthLoading(false);
      });
      return () => unsubscribe();
    }, []);
  
    // Firestore Data Listener
    useEffect(() => {
      if (!user || !db) {
        setTransactions([]); setWallets(DEFAULT_WALLETS);
        setSettings({ hourlyRate: 0, assets: DEFAULT_ASSETS, entities: DEFAULT_ENTITIES, guarantees: [] });
        setHistoricalPrices({}); setTransmutationLists(DEFAULT_TRANSMUTATION_LISTS);
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
          
          // Ensure fixed lists exist (Loans, Credit Cards)
          let loadedLists = data?.transmutationLists || DEFAULT_TRANSMUTATION_LISTS;
          const hasLoans = loadedLists.some((l: TransmutationList) => l.isLoansView);
          if (!hasLoans) {
              loadedLists = [...loadedLists, { id: 'list-loans', name: 'Préstamos', items: [], isLoansView: true }];
          }
          // Ensure credit card list exists
          const hasCC = loadedLists.some((l: TransmutationList) => l.isCreditCardView);
          if (!hasCC) {
               loadedLists = [...loadedLists, { id: 'list-cc', name: 'Tarjetas de Crédito', items: [], isCreditCardView: true }];
          }

          setTransmutationLists(loadedLists);
          setTheme(data?.theme || 'dark');
        } else {
          docRef.set({
            transactions: [], wallets: DEFAULT_WALLETS,
            settings: { hourlyRate: 0, assets: DEFAULT_ASSETS, entities: DEFAULT_ENTITIES, guarantees: [] },
            historicalPrices: {}, transmutationLists: DEFAULT_TRANSMUTATION_LISTS,
            theme: 'dark', createdAt: new Date().toISOString(),
          });
        }
      });
      return () => unsubscribe();
    }, [user]);
  
    // Update Functions
    const updateFirestore = (data: object) => { if (user && db) { db.collection('users').doc(user.uid).set(data, { merge: true }).catch(console.error); }};
    
    const handleSaveTransaction = (transaction: Transaction | Omit<Transaction, 'id'>) => {
        let updatedTxs;
        if ('id' in transaction) {
            updatedTxs = transactions.map(t => t.id === transaction.id ? transaction as Transaction : t);
        } else {
            const newTx = { ...transaction, id: Date.now().toString() } as Transaction;
            updatedTxs = [newTx, ...transactions];
        }
        setTransactions(updatedTxs);
        updateFirestore({ transactions: updatedTxs });
    };

    const deleteTransaction = (id: string) => { 
        const updated = transactions.filter(t => t.id !== id); 
        setTransactions(updated); updateFirestore({ transactions: updated }); 
    };
    
    const handleSettingsSave = (newSettings: AppSettings) => { setSettings(newSettings); updateFirestore({ settings: newSettings }); };
    const handleWalletsChange = (newWallets: Wallet[]) => { setWallets(newWallets); updateFirestore({ wallets: newWallets }); };
    
    const handleTransmutationListsChange = (newLists: TransmutationList[]) => { 
        setTransmutationLists(newLists); 
        updateFirestore({ transmutationLists: newLists }); 
    };
  
    // UI Helpers
    useEffect(() => { document.documentElement.className = theme; document.body.className = theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'; }, [theme]);
    
    const handleLogout = () => auth?.signOut();
    const openModalForNew = () => { setEditingTransaction(null); setPrefilledTransaction(null); setIsModalOpen(true); };
    const openModalForEdit = (transaction: Transaction) => { setEditingTransaction(transaction); setPrefilledTransaction(null); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setEditingTransaction(null); setPrefilledTransaction(null); };
    
    const handleCompleteTransmutationItem = (item: TransmutationItem, listId: string) => { 
        setPrefilledTransaction({ type: 'expense', amount: item.amount, description: item.name, listId: listId }); 
        setIsModalOpen(true); 
    };
    
    const handleOpenReceiptScanner = () => { setIsModalOpen(false); setIsReceiptScannerOpen(true); };
    const handleScanComplete = (items: { name: string; price: number }[]) => { 
        const total = items.reduce((s, i) => s + i.price, 0); 
        const desc = items.map(i => i.name).join(', '); 
        setPrefilledTransaction({ type: 'expense', amount: total, description: desc }); 
        setIsReceiptScannerOpen(false); setIsModalOpen(true); 
    };

    const toggleSettings = () => { setActiveView(prev => prev === 'settings' ? 'home' : 'settings'); };
    const togglePrivacy = () => setIsPrivacyMode(!isPrivacyMode);
  
    // Summary Calculation
    const summary = useMemo(() => { 
        const now = new Date(); 
        const currentMonthTxs = transactions.filter(tx => new Date(tx.date).getMonth() === now.getMonth() && new Date(tx.date).getFullYear() === now.getFullYear()); 
        const assetsIncome = settings.assets?.reduce((s, a) => s + a.amount, 0) || 0; 
        const transIncome = currentMonthTxs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0); 
        const totalIncome = assetsIncome + transIncome; 
        const expenses = currentMonthTxs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0); 
        const balance = totalIncome - expenses; 
        const savingsRate = totalIncome > 0 ? balance / totalIncome : 0; 
        return { income: totalIncome, expenses, balance, savingsRate }; 
    }, [transactions, settings.assets]);
  
    const renderView = () => {
      switch (activeView) {
        case 'home': return <Dashboard transactions={transactions} settings={settings} onNewTransaction={openModalForNew} onOpenCards={() => setIsCardsModalOpen(true)} summary={summary} isPrivacyMode={isPrivacyMode} />;
        case 'transactions': return <TransactionList transactions={transactions} onEdit={openModalForEdit} onDelete={(id) => setConfirmationState({ isOpen: true, message: '¿Borrar transacción?', onConfirm: () => deleteTransaction(id) })} settings={settings} isPrivacyMode={isPrivacyMode} />;
        case 'transmutar': return <TransmutationView lists={transmutationLists} setLists={handleTransmutationListsChange} onCompleteItem={handleCompleteTransmutationItem} onRequestDeleteList={(id) => setConfirmationState({ isOpen: true, message: '¿Borrar lista?', onConfirm: () => handleTransmutationListsChange(transmutationLists.filter(l => l.id !== id)) })} onRequestDeleteItem={(lid, iid) => setConfirmationState({ isOpen: true, message: '¿Borrar ítem?', onConfirm: () => handleTransmutationListsChange(transmutationLists.map(l => l.id === lid ? { ...l, items: l.items.filter(i => i.id !== iid) } : l)) })} assets={settings.assets || []} transactions={transactions} isPrivacyMode={isPrivacyMode} />;
        
        case 'synthesis': return <SynthesisView transactions={transactions} summary={summary} isPrivacyMode={isPrivacyMode} />;
        
        case 'settings': return <SettingsView settings={settings} onSave={handleSettingsSave} theme={theme} onThemeChange={(t) => {setTheme(t); updateFirestore({theme: t})}} wallets={wallets} onWalletsChange={handleWalletsChange} isPrivacyMode={isPrivacyMode} />;
        default: return <Dashboard transactions={transactions} settings={settings} onNewTransaction={openModalForNew} onOpenCards={() => setIsCardsModalOpen(true)} summary={summary} isPrivacyMode={isPrivacyMode} />;
      }
    };
  
    if (!isFirebaseConfigured) { return <FirebaseNotConfigured />; }
    if (showIntro || isAuthLoading) { return <IntroScreen />; }
    if (!user) { return <Login />; }

    const formattedName = user.displayName ? user.displayName : user.email ? user.email.split('@')[0].split('.')[0].charAt(0).toUpperCase() + user.email.split('@')[0].split('.')[0].slice(1) : 'Alquimista';
  
    return (
      <div className="min-h-screen flex flex-col">
        <Header userName={formattedName} onSettingsClick={toggleSettings} onLogoutClick={handleLogout} onPrivacyClick={togglePrivacy} isPrivacyMode={isPrivacyMode} />
        <main className="flex-grow p-4 pb-24 pt-32">{renderView()}</main>
        <BottomNav activeView={activeView} setActiveView={setActiveView} />
        
        {isModalOpen && <TransactionModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSaveTransaction} transaction={editingTransaction || prefilledTransaction} transmutationLists={transmutationLists} wallets={wallets} settings={settings} transactions={transactions} onScanReceipt={handleOpenReceiptScanner} />}
        {isReceiptScannerOpen && <ReceiptScannerModal isOpen={isReceiptScannerOpen} onClose={() => setIsReceiptScannerOpen(false)} onScanComplete={handleScanComplete} />}
        {isCardsModalOpen && <CreditCardModal isOpen={isCardsModalOpen} onClose={() => setIsCardsModalOpen(false)} wallets={wallets} transactions={transactions} isPrivacyMode={isPrivacyMode} />}
        
        {confirmationState.isOpen && <ConfirmationDialog isOpen={confirmationState.isOpen} onClose={() => setConfirmationState({ isOpen: false, message: '', onConfirm: null })} onConfirm={() => { if (confirmationState.onConfirm) confirmationState.onConfirm(); setConfirmationState({ isOpen: false, message: '', onConfirm: null }); }} title="Confirmar Acción" message={confirmationState.message} />}
      </div>
    );
};
export default App;