import React, { useState, useEffect, useMemo } from 'react';
import { auth, db, isFirebaseConfigured } from './services/firebase';
import IntroScreen from './components/IntroScreen';
import type { Transaction, Wallet, View, Settings as AppSettings, Theme, TransmutationList, TransmutationItem, User } from './types';
import { DEFAULT_WALLETS, DEFAULT_TRANSMUTATION_LISTS, DEFAULT_ASSETS } from './constants';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import SettingsView from './components/SettingsView';
import Login from './components/Login';
import TransactionModal from './components/TransactionModal';
import BottomNav from './components/BottomNav';
import TransmutationView from './components/TransmutationView';
import SynthesisView from './components/SynthesisView';
import Header from './components/Header';
import ConfirmationDialog from './components/ui/ConfirmationDialog';
import CreditCardModal from './components/CreditCardModal';
import FirebaseNotConfigured from './components/FirebaseNotConfigured';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [showIntro, setShowIntro] = useState(true);
    
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>(DEFAULT_WALLETS);
    const [settings, setSettings] = useState<AppSettings>({ hourlyRate: 0, assets: DEFAULT_ASSETS, guarantees: [], monthlyHours: 160 });
    const [transmutationLists, setTransmutationLists] = useState<TransmutationList[]>(DEFAULT_TRANSMUTATION_LISTS);
    const [theme, setTheme] = useState<Theme>('dark');
    
    const [activeView, setActiveView] = useState<View>('home');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [prefilledTransaction, setPrefilledTransaction] = useState<Partial<Transaction> | null>(null);
    const [isCardsModalOpen, setIsCardsModalOpen] = useState(false);
    const [isPrivacyMode, setIsPrivacyMode] = useState(false);
    
    const [confirmationState, setConfirmationState] = useState<{ isOpen: boolean; message: string; onConfirm: (() => void) | null }>({ isOpen: false, message: '', onConfirm: null });
  
    useEffect(() => {
        const timer = setTimeout(() => { setShowIntro(false); }, 4500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (!isFirebaseConfigured || !auth) { setIsAuthLoading(false); return; }
      const unsubscribe = auth.onAuthStateChanged((firebaseUser: any) => {
        setUser(firebaseUser as User | null);
        setIsAuthLoading(false);
      });
      return () => unsubscribe();
    }, []);
  
    useEffect(() => {
      if (!user || !db) {
        setTransactions([]); setWallets(DEFAULT_WALLETS);
        setSettings({ hourlyRate: 0, assets: DEFAULT_ASSETS, guarantees: [], monthlyHours: 160 });
        setTransmutationLists(DEFAULT_TRANSMUTATION_LISTS);
        return;
      }
      const docRef = db.collection('users').doc(user.uid);
      const unsubscribe = docRef.onSnapshot((doc: any) => {
        if (doc.exists) {
          const data = doc.data();
          setTransactions(data?.transactions || []);
          setWallets(data?.wallets || DEFAULT_WALLETS);
          setSettings(data?.settings || { hourlyRate: 0, assets: DEFAULT_ASSETS, guarantees: [], monthlyHours: 160 });
          setTransmutationLists(data?.transmutationLists || DEFAULT_TRANSMUTATION_LISTS);
          setTheme(data?.theme || 'dark');
        } else {
          docRef.set({
            transactions: [], wallets: DEFAULT_WALLETS,
            settings: { hourlyRate: 0, assets: DEFAULT_ASSETS, guarantees: [], monthlyHours: 160 },
            transmutationLists: DEFAULT_TRANSMUTATION_LISTS,
            theme: 'dark', createdAt: new Date().toISOString(),
          });
        }
      });
      return () => unsubscribe();
    }, [user]);
  
    const updateFirestore = (data: object) => { if (user && db) { db.collection('users').doc(user.uid).set(data, { merge: true }).catch(console.error); }};
    
    const handleSaveTransaction = (transaction: Transaction | Omit<Transaction, 'id'>) => {
        let updatedTxs;
        if ('id' in transaction) {
            updatedTxs = transactions.map(t => t.id === transaction.id ? transaction as Transaction : t);
        } else {
            const newTx = { ...transaction, id: Date.now().toString(), date: new Date(transaction.date || new Date()).toISOString() } as Transaction;
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

    useEffect(() => { document.documentElement.className = theme; document.body.className = theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'; }, [theme]);
    
    const handleLogout = () => auth?.signOut();
    const openModalForNew = () => { setEditingTransaction(null); setPrefilledTransaction(null); setIsModalOpen(true); };
    const openModalForEdit = (transaction: Transaction) => { setEditingTransaction(transaction); setPrefilledTransaction(null); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setEditingTransaction(null); setPrefilledTransaction(null); };
    
    const handleCompleteTransmutationItem = (item: TransmutationItem, listId: string) => { 
        setPrefilledTransaction({ type: 'expense', amount: item.amount, description: item.name, listId: listId }); 
        setIsModalOpen(true); 
    };

    const toggleSettings = () => { setActiveView(prev => prev === 'settings' ? 'home' : 'settings'); };
    const togglePrivacy = () => setIsPrivacyMode(!isPrivacyMode);
  
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
        case 'transactions': return <TransactionList transactions={transactions} onEdit={openModalForEdit} onDelete={(id) => setConfirmationState({ isOpen: true, message: '¿Borrar transacción?', onConfirm: () => deleteTransaction(id) })} settings={settings} isPrivacyMode={isPrivacyMode} transmutationLists={transmutationLists} />;
        case 'transmutar': return <TransmutationView lists={transmutationLists} setLists={handleTransmutationListsChange} onCompleteItem={handleCompleteTransmutationItem} onRequestDeleteList={(id) => setConfirmationState({ isOpen: true, message: '¿Borrar lista?', onConfirm: () => handleTransmutationListsChange(transmutationLists.filter(l => l.id !== id)) })} onRequestDeleteItem={(lid, iid) => setConfirmationState({ isOpen: true, message: '¿Borrar ítem?', onConfirm: () => handleTransmutationListsChange(transmutationLists.map(l => l.id === lid ? { ...l, items: l.items.filter(i => i.id !== iid) } : l)) })} transactions={transactions} isPrivacyMode={isPrivacyMode} />;
        case 'synthesis': return <SynthesisView transactions={transactions} summary={summary} settings={settings} isPrivacyMode={isPrivacyMode} transmutationLists={transmutationLists} />;
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
        
        {isModalOpen && <TransactionModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSaveTransaction} transaction={editingTransaction || prefilledTransaction} transmutationLists={transmutationLists} wallets={wallets} settings={settings} />}
        {isCardsModalOpen && <CreditCardModal isOpen={isCardsModalOpen} onClose={() => setIsCardsModalOpen(false)} wallets={wallets} transactions={transactions} onAddManual={handleSaveTransaction} isPrivacyMode={isPrivacyMode} />}
        
        {confirmationState.isOpen && <ConfirmationDialog isOpen={confirmationState.isOpen} onClose={() => setConfirmationState({ isOpen: false, message: '', onConfirm: null })} onConfirm={() => { if (confirmationState.onConfirm) confirmationState.onConfirm(); setConfirmationState({ isOpen: false, message: '', onConfirm: null }); }} title="Confirmar Acción" message={confirmationState.message} />}
      </div>
    );
};
export default App;
