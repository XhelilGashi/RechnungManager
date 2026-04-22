import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { Customer, Invoice, Offer, AppSettings, Product, Project, Baustelle, Service, Category, InvoiceLayoutTemplate, Expense, Income, BankTransaction, Payment } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface AppContextType {
  customers: Customer[];
  setCustomers: (customers: Customer[] | ((c: Customer[]) => Customer[])) => void;
  offers: Offer[];
  setOffers: (offers: Offer[] | ((o: Offer[]) => Offer[])) => void;
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[] | ((i: Invoice[]) => Invoice[])) => void;
  payments: Payment[];
  setPayments: (payments: Payment[] | ((p: Payment[]) => Payment[])) => void;
  products: Product[];
  setProducts: (products: Product[] | ((p: Product[]) => Product[])) => void;
  projects: Project[];
  setProjects: (projects: Project[] | ((p: Project[]) => Project[])) => void;
  baustellen: Baustelle[];
  setBaustellen: (baustellen: Baustelle[] | ((b: Baustelle[]) => Baustelle[])) => void;
  services: Service[];
  setServices: (services: Service[] | ((s: Service[]) => Service[])) => void;
  categories: Category[];
  setCategories: (categories: Category[] | ((c: Category[]) => Category[])) => void;
  expenses: Expense[];
  setExpenses: (expenses: Expense[] | ((e: Expense[]) => Expense[])) => void;
  incomes: Income[];
  setIncomes: (incomes: Income[] | ((i: Income[]) => Income[])) => void;
  bankTransactions: BankTransaction[];
  setBankTransactions: (transactions: BankTransaction[] | ((t: BankTransaction[]) => BankTransaction[])) => void;
  layoutTemplates: InvoiceLayoutTemplate[];
  setLayoutTemplates: (templates: InvoiceLayoutTemplate[] | ((t: InvoiceLayoutTemplate[]) => InvoiceLayoutTemplate[])) => void;
  logo: string | null;
  setLogo: (logo: string | null) => void;
  settings: AppSettings;
  setSettings: (settings: AppSettings | ((s: AppSettings) => AppSettings)) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useLocalStorage<Customer[]>('rm_customers', []);
  const [offers, setOffers] = useLocalStorage<Offer[]>('rm_offers', []);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('rm_invoices', []);
  const [payments, setPayments] = useLocalStorage<Payment[]>('rm_payments', []);
  const [products, setProducts] = useLocalStorage<Product[]>('rm_products', []);
  const [projects, setProjects] = useLocalStorage<Project[]>('rm_projects', []);
  const [baustellen, setBaustellen] = useLocalStorage<Baustelle[]>('rm_baustellen', []);
  const [services, setServices] = useLocalStorage<Service[]>('rm_services', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('rm_categories', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('rm_expenses', []);
  const [incomes, setIncomes] = useLocalStorage<Income[]>('rm_incomes', []);
  const [bankTransactions, setBankTransactions] = useLocalStorage<BankTransaction[]>('rm_transactions', []);
  const [layoutTemplates, setLayoutTemplates] = useLocalStorage<InvoiceLayoutTemplate[]>('rm_layout_templates', []);
  const [logo, setLogo] = useLocalStorage<string | null>('rm_logo', null);
  const [settings, setSettings] = useLocalStorage<AppSettings>('rm_settings', {
    language: 'de',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    darkMode: false,
    primaryColor: '#2563EB',
    invoiceTemplate: 'standard',
    invoiceColor: '#2563EB'
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <AppContext.Provider value={{ customers, setCustomers, offers, setOffers, invoices, setInvoices, payments, setPayments, products, setProducts, projects, setProjects, baustellen, setBaustellen, services, setServices, categories, setCategories, expenses, setExpenses, incomes, setIncomes, bankTransactions, setBankTransactions, layoutTemplates, setLayoutTemplates, logo, setLogo, settings, setSettings, showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${
                toast.type === 'success' 
                  ? 'bg-white border-green-200 text-slate-800' 
                  : 'bg-white border-red-200 text-slate-800'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
