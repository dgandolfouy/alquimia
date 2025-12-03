21:42:57.640 Running build in Washington, D.C., USA (East) – iad1
21:42:57.641 Build machine configuration: 2 cores, 8 GB
21:42:57.673 Cloning github.com/dgandolfouy/alquimia (Branch: main, Commit: e3ac010)
21:42:57.674 Skipping build cache, deployment was triggered without cache.
21:42:58.123 Cloning completed: 449.000ms
21:42:58.776 Running "vercel build"
21:42:59.180 Vercel CLI 48.12.0
21:42:59.815 Installing dependencies...
21:43:20.397 
21:43:20.398 added 196 packages in 20s
21:43:20.398 
21:43:20.399 29 packages are looking for funding
21:43:20.399   run `npm fund` for details
21:43:20.444 Running "npm run build"
21:43:20.560 
21:43:20.561 > alquimia-app@1.0.0 build
21:43:20.561 > tsc && vite build
21:43:20.561 
21:43:24.667 App.tsx(142,38): error TS2741: Property 'onEdit' is missing in type '{ transactions: Transaction[]; onDelete: (id: string) => void; settings: Settings; isPrivacyMode: boolean; }' but required in type 'TransactionListProps'.
21:43:24.667 App.tsx(143,36): error TS2741: Property 'assets' is missing in type '{ lists: TransmutationList[]; setLists: (newLists: TransmutationList[]) => void; onCompleteItem: (item: TransmutationItem, listId: string) => void; onRequestDeleteList: (id: string) => void; onRequestDeleteItem: (lid: string, iid: string) => void; transactions: Transaction[]; isPrivacyMode: boolean; }' but required in type 'TransmutationViewProps'.
21:43:24.668 App.tsx(144,95): error TS2322: Type '{ transactions: Transaction[]; summary: { income: number; expenses: number; balance: number; savingsRate: number; }; settings: Settings; isPrivacyMode: boolean; }' is not assignable to type 'IntrinsicAttributes & SynthesisViewProps'.
21:43:24.668   Property 'settings' does not exist on type 'IntrinsicAttributes & SynthesisViewProps'.
21:43:24.668 App.tsx(162,26): error TS2739: Type '{ isOpen: true; onClose: () => void; onSave: (transaction: Transaction | Omit<Transaction, "id">) => void; transaction: Partial<Transaction> | null; transmutationLists: TransmutationList[]; wallets: Wallet[]; settings: Settings; }' is missing the following properties from type 'TransactionModalProps': transactions, onScanReceipt
21:43:24.668 components/Dashboard.tsx(61,13): error TS2322: Type '{ children: Element[]; onClick: () => void; className: string; }' is not assignable to type 'IntrinsicAttributes & CardProps'.
21:43:24.668   Property 'onClick' does not exist on type 'IntrinsicAttributes & CardProps'.
21:43:24.669 components/ReceiptScannerModal.tsx(3,10): error TS2305: Module '"../services/geminiService"' has no exported member 'analyzeReceipt'.
21:43:24.669 components/SettingsView.tsx(2,40): error TS2305: Module '"../types"' has no exported member 'Entity'.
21:43:24.669 components/SettingsView.tsx(19,5): error TS2353: Object literal may only specify known properties, and 'entities' does not exist in type 'Settings'.
21:43:24.670 components/SettingsView.tsx(19,24): error TS2339: Property 'entities' does not exist on type 'Settings'.
21:43:24.671 components/SettingsView.tsx(58,17): error TS2739: Type '{ id: string; name: string; amount: number; }' is missing the following properties from type 'Asset': frequency, day
21:43:24.671 components/SettingsView.tsx(80,74): error TS2339: Property 'entities' does not exist on type 'Settings'.
21:43:24.671 components/SettingsView.tsx(88,67): error TS2339: Property 'entities' does not exist on type 'Settings'.
21:43:24.671 components/SettingsView.tsx(88,84): error TS7006: Parameter 'e' implicitly has an 'any' type.
21:43:24.671 components/SettingsView.tsx(225,30): error TS2339: Property 'entities' does not exist on type 'Settings'.
21:43:24.671 components/SettingsView.tsx(225,44): error TS7006: Parameter 'ent' implicitly has an 'any' type.
21:43:24.671 components/TransactionList.tsx(29,70): error TS2339: Property 'categoryId' does not exist on type 'Transaction'.
21:43:24.674 components/TransactionModal.tsx(53,65): error TS2339: Property 'entityId' does not exist on type 'Transaction | Partial<Transaction>'.
21:43:24.674   Property 'entityId' does not exist on type 'Transaction'.
21:43:24.674 components/TransactionModal.tsx(53,87): error TS2339: Property 'entities' does not exist on type 'Settings'.
21:43:24.674 components/TransactionModal.tsx(68,31): error TS2339: Property 'entityId' does not exist on type 'Transaction | Partial<Transaction>'.
21:43:24.674   Property 'entityId' does not exist on type 'Transaction'.
21:43:24.674 components/TransactionModal.tsx(68,53): error TS2339: Property 'entities' does not exist on type 'Settings'.
21:43:24.674 components/TransactionModal.tsx(79,28): error TS2339: Property 'entities' does not exist on type 'Settings'.
21:43:24.674 components/TransactionModal.tsx(170,36): error TS2339: Property 'entities' does not exist on type 'Settings'.
21:43:24.674 components/TransactionModal.tsx(170,50): error TS7006: Parameter 'ent' implicitly has an 'any' type.
21:43:24.675 components/TransmutationView.tsx(5,10): error TS2305: Module '"../services/geminiService"' has no exported member 'findPromotions'.
21:43:24.675 components/VampireHunterView.tsx(14,14): error TS2339: Property 'categoryId' does not exist on type 'Transaction'.
21:43:24.675 components/YearlySummary.tsx(33,24): error TS2339: Property 'categoryId' does not exist on type 'Transaction'.
21:43:24.675 constants.ts(1,62): error TS2305: Module '"./types"' has no exported member 'Entity'.
21:43:24.675 constants.ts(1,77): error TS2305: Module '"./types"' has no exported member 'Category'.
21:43:24.675 constants.ts(7,5): error TS2739: Type '{ id: string; name: string; amount: number; }' is missing the following properties from type 'Asset': frequency, day
21:43:24.675 services/geminiService.ts(2,10): error TS2305: Module '"../types"' has no exported member 'Category'.
21:43:24.706 Error: Command "npm run build" exited with 2
