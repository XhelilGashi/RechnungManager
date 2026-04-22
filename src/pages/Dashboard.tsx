import React, { useMemo, useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { formatCurrency, formatDate } from '../lib/utils';
import { 
  Users, FileText, Receipt, TrendingUp, AlertCircle, CheckCircle2, Clock, Plus, 
  ArrowUpRight, ArrowDownRight, Upload, Link2, Calculator, ShieldCheck, 
  CreditCard, PieChart as PieChartIcon, Info, ArrowRight, Activity
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, Line, ComposedChart
} from 'recharts';
import { motion } from 'motion/react';

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-4 rounded-xl shadow-lg min-w-[140px]">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value, currency)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export function Dashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { customers, offers, invoices, products, expenses, bankTransactions, settings } = useAppContext();
  
  // Date Filter State
  const [dateFilter, setDateFilter] = useState<'this_month' | 'last_3_months' | 'custom'>('this_month');

  // --- Derived Calculations ---

  const now = new Date();
  
  let startDate = new Date(0).getTime();
  const endDate = now.getTime();

  if (dateFilter === 'this_month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  } else if (dateFilter === 'last_3_months') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1).getTime();
  }

  // Filtered data
  const filteredInvoices = invoices.filter(inv => inv.date >= startDate && inv.date <= endDate);
  const filteredExpenses = expenses.filter(exp => exp.date >= startDate && exp.date <= endDate);

  const getDerivedStatus = (invoice: any) => {
    if (invoice.status === 'bezahlt') return 'bezahlt';
    if (invoice.status === 'ueberfaellig') return 'ueberfaellig';
    const dueTime = invoice.dueDate || (invoice.date + 14 * 24 * 60 * 60 * 1000);
    if (Date.now() > dueTime && invoice.status !== 'bezahlt') return 'ueberfaellig';
    return invoice.status || 'offen';
  };

  // KPIs
  const einnahmen = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0); // Gross
  const ausgaben = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0); // Gross
  const gewinn = einnahmen - ausgaben;

  // Ausstehende Rechnungen
  let outstandingAmount = 0;
  let overdueAmount = 0;
  let openAmount = 0;
  
  invoices.forEach(inv => {
    const status = getDerivedStatus(inv);
    if (status === 'ueberfaellig') overdueAmount += inv.total;
    if (status === 'offen') openAmount += inv.total;
  });
  outstandingAmount = overdueAmount + openAmount;

  // UStVA (Umsatzsteuer-Voranmeldung) - Dummy Simple Calculation
  const umsatzsteuer = filteredInvoices.reduce((sum, inv) => sum + (inv.vatAmount || 0), 0);
  const vorsteuer = filteredExpenses.reduce((sum, exp) => sum + ((exp.amount * 0.19) || 0), 0); // Approx 19% assuming generic
  const zahllast = umsatzsteuer - vorsteuer;

  // Buchhaltungsscore
  const unpaidInvoicesCount = invoices.filter(i => getDerivedStatus(i) !== 'bezahlt').length;
  const missingReceiptsCount = expenses.filter(e => !e.receiptUrl).length;
  const baseScore = 100;
  const scorePenalty = Math.min(80, (unpaidInvoicesCount * 5) + (missingReceiptsCount * 10));
  const calcScore = baseScore - scorePenalty;

  // Bank
  const currentBalance = bankTransactions.reduce((acc, t) => acc + (t.type === 'Einnahme' ? t.amount : -t.amount), 0);

  // Top Kunden
  const customerRevenue: Record<string, number> = {};
  filteredInvoices.forEach(inv => {
    customerRevenue[inv.customerId] = (customerRevenue[inv.customerId] || 0) + inv.total;
  });
  const topCustomersData = Object.entries(customerRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, total]) => {
      const c = customers.find(c => c.id === id);
      return { name: c?.name || c?.companyName || 'Unbekannt', value: total };
    });

  // Top Ausgaben
  const expenseCategories: Record<string, number> = {};
  filteredExpenses.forEach(exp => {
    const cat = exp.category || 'Sonstiges';
    expenseCategories[cat] = (expenseCategories[cat] || 0) + (exp.amount || 0);
  });
  const topExpensesData = Object.entries(expenseCategories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // Produkte & Dienstleistungen (Top selling)
  const productSales: Record<string, number> = {};
  filteredInvoices.forEach(inv => {
    inv.items.forEach(item => {
      const pName = item.description || item.name || 'Position';
      productSales[pName] = (productSales[pName] || 0) + item.total;
    });
  });
  const topProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([name, total]) => ({ name, total }));

  // Chart Data (Bar chart for income/expenses)
  const barChartData = useMemo(() => {
    const data = [];
    const monthsToShow = dateFilter === 'this_month' ? 1 : (dateFilter === 'last_3_months' ? 3 : 6); 
    const iterMonths = Math.max(monthsToShow, 6);
    for (let i = iterMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleDateString('de-DE', { month: 'short' });
      
      const mInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.date);
        return invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear();
      });
      const mExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === d.getMonth() && expDate.getFullYear() === d.getFullYear();
      });
      
      const rev = mInvoices.reduce((acc, inv) => acc + inv.total, 0);
      const expSum = mExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
      data.push({ name: monthLabel, Einnahmen: rev, Ausgaben: expSum, Gewinn: rev - expSum });
    }
    return data;
  }, [invoices, expenses, dateFilter, now]);

  // Activity Feed
  const activities = useMemo(() => {
    const arr: any[] = [];
    invoices.forEach(inv => {
      const c = customers.find(c => c.id === inv.customerId);
      arr.push({
        id: `inv-${inv.id}`,
        icon: Receipt,
        title: `Rechnung ${inv.number} erstellt`,
        time: inv.date,
        detail: c?.name || c?.companyName || 'Unbekannt',
        color: 'bg-emerald-100 text-emerald-600'
      });
    });
    customers.forEach(cus => {
      arr.push({
        id: `cus-${cus.id}`,
        icon: Users,
        title: `Kunde hinzugefügt`,
        time: cus.createdAt || Date.now(),
        detail: cus.name || cus.companyName,
        color: 'bg-blue-100 text-blue-600'
      });
    });
    products.forEach(prod => {
      arr.push({
        id: `prod-${prod.id}`,
        icon: PieChartIcon,
        title: `Produkt hinzugefügt`,
        time: Date.now() - 10000000, 
        detail: prod.name,
        color: 'bg-purple-100 text-purple-600'
      });
    });
    return arr.sort((a, b) => b.time - a.time).slice(0, 5);
  }, [invoices, customers, products]);

  const glassCard = "bg-white/70 backdrop-blur-[10px] border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-2xl p-6 relative overflow-hidden flex flex-col";

  const currentUser = "Nutzer";

  return (
    <div className="max-w-7xl mx-auto w-full pb-12 pt-4 px-4 sm:px-6 lg:px-8 space-y-8 text-slate-800">
      
      {/* 1. TOP SECTION (WELCOME + QUICK ACTIONS) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
            Herzlich Willkommen, <span className="text-blue-600">{currentUser}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Hier ist Ihre finanzielle Übersicht.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button onClick={() => onNavigate('rechnungen')} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
            <Plus className="w-4 h-4" /> Rechnung schreiben
          </button>
          <button onClick={() => onNavigate('buchhaltung')} className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 transition-all">
            <Upload className="w-4 h-4" /> Ausgabe hochladen
          </button>
          <button onClick={() => onNavigate('buchhaltung')} className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 transition-all">
            <Link2 className="w-4 h-4" /> Zahlungen zuordnen
          </button>
          <button onClick={() => onNavigate('berichte')} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl font-medium shadow-md hover:bg-slate-900 hover:-translate-y-0.5 transition-all">
            <Calculator className="w-4 h-4" /> UStVA vorbereiten
          </button>
        </div>
      </div>

      {/* FILTER DATE */}
      <div className="flex justify-end mb-2">
        <div className="inline-flex bg-slate-100/80 p-1 rounded-lg backdrop-blur-md">
          <button onClick={() => setDateFilter('last_3_months')} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${dateFilter === 'last_3_months' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Letzte 3 Monate</button>
          <button onClick={() => setDateFilter('this_month')} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${dateFilter === 'this_month' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Dieser Monat</button>
          <button onClick={() => setDateFilter('custom')} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${dateFilter === 'custom' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Gesamt</button>
        </div>
      </div>

      {/* 2. MAIN KPI AREA (Profit, Income, Expenses + Chart) */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className={glassCard}>
         <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full">
            {/* KPI Column */}
            <div className="w-full lg:w-1/3 space-y-6 flex flex-col justify-center">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Gewinn</p>
                <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  {formatCurrency(gewinn, settings.currency)}
                </div>
              </div>
              <div className="h-px w-full bg-slate-100" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-emerald-500" /> Einnahmen
                  </p>
                  <div className="text-xl font-bold text-slate-800">
                    {formatCurrency(einnahmen, settings.currency)}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3 text-rose-500" /> Ausgaben
                  </p>
                  <div className="text-xl font-bold text-slate-800">
                    {formatCurrency(ausgaben, settings.currency)}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="w-full lg:w-2/3 h-[240px]">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} />
                   <Tooltip content={<CustomTooltip currency={settings.currency} />} cursor={{ fill: '#f8fafc' }} />
                   <Bar dataKey="Einnahmen" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />
                   <Bar dataKey="Ausgaben" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={30} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </motion.div>

      {/* 3. CARDS GRID (2 Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Card 1: Ausstehende Rechnungen */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }} className={glassCard}>
          <div className="flex justify-between items-start mb-6">
             <div className="flex items-center gap-3">
               <div className="p-2.5 bg-rose-100 text-rose-600 rounded-lg">
                 <AlertCircle className="w-5 h-5" />
               </div>
               <h3 className="font-bold text-lg text-slate-800">Ausstehend</h3>
             </div>
             <button onClick={() => onNavigate('rechnungen')} className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 group">
               Alle <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
             </button>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-6">{formatCurrency(outstandingAmount, settings.currency)}</div>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center text-sm">
               <div className="flex items-center gap-2 text-slate-600"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Fällig (Überfällig)</div>
               <span className="font-semibold text-slate-800">{formatCurrency(overdueAmount, settings.currency)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
               <div className="flex items-center gap-2 text-slate-600"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Offen (Noch in Frist)</div>
               <span className="font-semibold text-slate-800">{formatCurrency(openAmount, settings.currency)}</span>
            </div>
          </div>
          
          <button onClick={() => onNavigate('rechnungen')} className="mt-auto w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 font-semibold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex justify-center items-center gap-2">
            <Plus className="w-4 h-4" /> Rechnung schreiben
          </button>
        </motion.div>

        {/* Card 2: Umsatzsteuer-Voranmeldung */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.15 }} className={glassCard}>
          <div className="flex justify-between items-start mb-6">
             <div className="flex items-center gap-3">
               <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
                 <Receipt className="w-5 h-5" />
               </div>
               <h3 className="font-bold text-lg text-slate-800">Umsatzsteuer</h3>
             </div>
             <button onClick={() => onNavigate('berichte')} className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 group">
               Zur UStVA <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
             </button>
          </div>
          <div className="text-sm text-slate-500 font-medium mb-1">Voraussichtliche Zahllast</div>
          <div className="text-3xl font-extrabold text-slate-900 mb-6">{formatCurrency(zahllast, settings.currency)}</div>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center text-sm">
               <span className="text-slate-600">Umsatzsteuer (Eingenommen)</span>
               <span className="font-semibold text-emerald-600">+{formatCurrency(umsatzsteuer, settings.currency)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
               <span className="text-slate-600">Vorsteuer (Bezahlt)</span>
               <span className="font-semibold text-rose-600">-{formatCurrency(vorsteuer, settings.currency)}</span>
            </div>
          </div>
          <div className="mt-auto px-4 py-3 bg-blue-50 rounded-xl flex items-center gap-3 border border-blue-100">
             <Info className="w-5 h-5 text-blue-500" />
             <div className="text-xs text-blue-800 font-medium">Ihre nächste UStVA ist fällig bis zum 10. des Folgemonats.</div>
          </div>
        </motion.div>

        {/* Card 3: Bank & Kontostand */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }} className={glassCard}>
          <div className="flex justify-between items-start mb-6">
             <div className="flex items-center gap-3">
               <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-lg">
                 <CreditCard className="w-5 h-5" />
               </div>
               <h3 className="font-bold text-lg text-slate-800">Bankkonto</h3>
             </div>
             <button onClick={() => onNavigate('buchhaltung')} className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 group">
               Banking <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
             </button>
          </div>
          <div className="text-sm text-slate-500 font-medium mb-1">Aktueller Kontostand</div>
          <div className="text-3xl font-extrabold text-slate-900 mb-6">{formatCurrency(currentBalance, settings.currency)}</div>
          
          <div className="flex flex-col gap-3 mb-6 flex-1 justify-end">
            {bankTransactions.slice(0,3).map((t, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                 <div className="text-sm">
                    <div className="font-medium text-slate-800 line-clamp-1">{t.description}</div>
                    <div className="text-xs text-slate-400">{formatDate(t.date, settings.dateFormat)}</div>
                 </div>
                 <div className={`text-sm font-bold whitespace-nowrap ${t.type === 'Einnahme' ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {t.type === 'Einnahme' ? '+' : '-'}{formatCurrency(t.amount, settings.currency)}
                 </div>
              </div>
            ))}
            {bankTransactions.length === 0 && (
               <div className="text-sm text-slate-400 italic">Keine Transaktionen gefunden.</div>
            )}
          </div>
          
          <button onClick={() => onNavigate('buchhaltung')} className="mt-auto w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold hover:bg-slate-100 transition-all flex justify-center items-center gap-2 shadow-sm">
            <Link2 className="w-4 h-4" /> Bankkonto verknüpfen
          </button>
        </motion.div>

        {/* Card 4: Buchhaltungsscore */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.25 }} className={glassCard}>
          <div className="flex justify-between items-start mb-4">
             <div className="flex items-center gap-3">
               <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-lg">
                 <ShieldCheck className="w-5 h-5" />
               </div>
               <h3 className="font-bold text-lg text-slate-800">Buchhaltungsscore</h3>
             </div>
          </div>
          
          <div className="flex flex-col items-center justify-center my-6">
             <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Score Gauge Visual */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className={`${calcScore > 80 ? 'text-emerald-500' : calcScore > 50 ? 'text-amber-500' : 'text-rose-500'}`} strokeDasharray={`${calcScore}, 100`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-extrabold text-slate-800">{Math.max(0, calcScore)}%</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
                </div>
             </div>
          </div>

          <div className="space-y-3 mt-auto">
             {missingReceiptsCount > 0 && (
                <div className="flex items-start gap-2 text-sm bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                   <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                   <div><span className="font-semibold text-rose-700">{missingReceiptsCount} Ausgabe(n)</span> ohne Beleg. Laden Sie Quittungen hoch!</div>
                </div>
             )}
             {unpaidInvoicesCount > 0 && (
                <div className="flex items-start gap-2 text-sm bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                   <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                   <div><span className="font-semibold text-amber-700">{unpaidInvoicesCount} Rechnung(en)</span> unbezahlt. Zahlungseingänge prüfen!</div>
                </div>
             )}
             {calcScore >= 100 && (
                <div className="flex items-start gap-2 text-sm bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                   <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                   <div><span className="font-semibold text-emerald-700">Perfekt!</span> Ihre Buchhaltung ist auf dem neuesten Stand.</div>
                </div>
             )}
          </div>
        </motion.div>

        {/* Card 5: Top Kunden & Top Ausgaben */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.3 }} className={`${glassCard} lg:col-span-2 overflow-visible`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Top Kunden */}
            <div>
               <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2"><PieChartIcon className="w-5 h-5 text-blue-500" /> Top Kunden (Umsatz)</h3>
               <div className="h-[220px] w-full flex items-center">
                 {topCustomersData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={topCustomersData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                         {topCustomersData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                       </Pie>
                       <Tooltip content={<CustomTooltip currency={settings.currency} />} />
                       <Legend verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} iconType="circle" />
                     </PieChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="w-full text-center text-sm text-slate-400 italic">Noch keine Rechnungen geschrieben.</div>
                 )}
               </div>
            </div>

            {/* Top Ausgaben */}
            <div>
               <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2"><PieChartIcon className="w-5 h-5 text-rose-500" /> Top Ausgaben (Kategorie)</h3>
               <div className="h-[220px] w-full flex items-center">
                 {topExpensesData.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={topExpensesData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                         {topExpensesData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />)}
                       </Pie>
                       <Tooltip content={<CustomTooltip currency={settings.currency} />} />
                       <Legend verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} iconType="circle" />
                     </PieChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="w-full text-center text-sm text-slate-400 italic">Noch keine Ausgaben verbucht.</div>
                 )}
               </div>
            </div>

          </div>
        </motion.div>

        {/* Card 6: Produkte & DL */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.35 }} className={glassCard}>
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-500" /> Produkte & Dienstleistungen</h3>
             <button onClick={() => onNavigate('artikel')} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Alle</button>
           </div>
           
           <div className="space-y-4">
              {topProducts.length > 0 ? topProducts.map((prod, i) => (
                 <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors bg-white/50 border border-slate-100">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">{i+1}</div>
                       <div className="font-semibold text-slate-700 text-sm">{prod.name}</div>
                    </div>
                    <div className="font-bold text-slate-900">{formatCurrency(prod.total, settings.currency)}</div>
                 </div>
              )) : (
                 <div className="text-sm text-slate-400 italic text-center py-6">Keine verkauften Produkte / Dienstleistungen.</div>
              )}
           </div>
        </motion.div>

        {/* Card 7: Verlauf (Activity Feed) */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.4 }} className={glassCard}>
           <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-slate-500" /> Verlauf</h3>
           <div className="relative border-l-2 border-slate-100 ml-4 space-y-6 pb-2">
              {activities.length > 0 ? activities.map((act: any, i: number) => {
                 const { icon: Icon, color } = act;
                 return (
                 <div key={i} className="relative pl-6">
                    <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white ${color}`}>
                       <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex justify-between items-start">
                       <div>
                          <div className="font-semibold text-sm text-slate-800">{act.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{act.detail}</div>
                       </div>
                       <div className="text-xs font-semibold text-slate-400">{formatDate(act.time, settings.dateFormat)}</div>
                    </div>
                 </div>
                 )
              }) : (
                 <div className="text-sm text-slate-400 italic pl-4">Kein Verlauf vorhanden.</div>
              )}
           </div>
        </motion.div>

      </div>
    </div>
  );
}
