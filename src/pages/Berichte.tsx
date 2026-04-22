import React, { useState, useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { Download, Filter, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { startOfMonth, endOfMonth, subMonths, isWithinInterval, format } from 'date-fns';
import { de } from 'date-fns/locale';

export function Berichte() {
  const { invoices, expenses, settings, customers } = useAppContext();
  const [dateRange, setDateRange] = useState<'thisMonth' | 'last3Months' | 'thisYear'>('thisMonth');

  // Computed Date Range
  const { start, end } = useMemo(() => {
    const today = new Date();
    if (dateRange === 'thisMonth') {
      return { start: startOfMonth(today), end: endOfMonth(today) };
    } else if (dateRange === 'last3Months') {
      return { start: startOfMonth(subMonths(today, 2)), end: endOfMonth(today) };
    } else {
      return { start: new Date(today.getFullYear(), 0, 1), end: new Date(today.getFullYear(), 11, 31) };
    }
  }, [dateRange]);

  // Filtered Data
  const validInvoices = useMemo(() => invoices.filter(i => isWithinInterval(i.createdAt, { start, end })), [invoices, start, end]);
  const validExpenses = useMemo(() => expenses.filter(e => isWithinInterval(e.date, { start, end })), [expenses, start, end]);

  const paidInvoices = validInvoices.filter(i => i.status === 'bezahlt');
  
  // KPIs
  const einnahmen = paidInvoices.reduce((sum, i) => sum + i.total, 0);
  const ausgaben = validExpenses.filter(e => e.isPaid).reduce((sum, e) => sum + e.total, 0);
  const gesamtumsatz = validInvoices.reduce((sum, i) => sum + i.total, 0); // Open + Paid
  const gewinn = einnahmen - ausgaben;

  // Chart Data: Einnahmen vs Ausgaben by Month
  const chartData = useMemo(() => {
    const dataMap: Record<string, { name: string, Einnahmen: number, Ausgaben: number }> = {};
    
    // Initialize months in range
    let current = new Date(start);
    while (current <= end) {
      const key = format(current, 'MMM yyyy', { locale: de });
      dataMap[key] = { name: key, Einnahmen: 0, Ausgaben: 0 };
      current.setMonth(current.getMonth() + 1);
    }

    paidInvoices.forEach(i => {
       const key = format(i.updatedAt, 'MMM yyyy', { locale: de });
       if (dataMap[key]) dataMap[key].Einnahmen += i.total;
    });

    validExpenses.filter(e => e.isPaid).forEach(e => {
       const key = format(e.date, 'MMM yyyy', { locale: de });
       if (dataMap[key]) dataMap[key].Ausgaben += e.total;
    });

    return Object.values(dataMap);
  }, [paidInvoices, validExpenses, start, end]);

  // Top Customers
  const topCustomers = useMemo(() => {
     const customerSales: Record<string, number> = {};
     validInvoices.forEach(i => {
        customerSales[i.customerId] = (customerSales[i.customerId] || 0) + i.total;
     });
     return Object.entries(customerSales)
       .map(([id, total]) => ({ id, total, name: customers.find(c => c.id === id)?.companyName || customers.find(c => c.id === id)?.name || 'Unbekannt' }))
       .sort((a, b) => b.total - a.total)
       .slice(0, 5);
  }, [validInvoices, customers]);

  return (
    <div className="max-w-6xl mx-auto w-full pb-10 space-y-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Berichte & Auswertungen</h1>
          <p className="text-sm text-slate-500">Übersicht über Ihre finanzielle Performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={dateRange} 
            onChange={e => setDateRange(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          >
            <option value="thisMonth">Dieser Monat</option>
            <option value="last3Months">Letzte 3 Monate</option>
            <option value="thisYear">Dieses Jahr</option>
          </select>
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition shadow-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards (Glass) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><TrendingUp className="w-16 h-16"/></div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 mb-1">Gesamtumsatz (Brutto)</p>
            <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(gesamtumsatz, settings.currency)}</h3>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><DollarSign className="w-16 h-16"/></div>
           <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 mb-1">Einnahmen (Bezahlt)</p>
            <h3 className="text-3xl font-bold text-emerald-600">{formatCurrency(einnahmen, settings.currency)}</h3>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><TrendingDown className="w-16 h-16"/></div>
           <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 mb-1">Ausgaben</p>
            <h3 className="text-3xl font-bold text-red-500">{formatCurrency(ausgaben, settings.currency)}</h3>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-blue-500"><Wallet className="w-16 h-16"/></div>
           <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 mb-1">Gewinn (Brutto)</p>
            <h3 className="text-3xl font-bold text-blue-600">{formatCurrency(gewinn, settings.currency)}</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Umsatzentwicklung & Cashflow</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} tickFormatter={(val) => `€${val/1000}k`} />
                <RechartsTooltip 
                  cursor={{fill: '#F1F5F9'}} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatCurrency(value, settings.currency)}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                <Bar dataKey="Einnahmen" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Ausgaben" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Customers Table */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Top Kunden (Nach Umsatz)</h3>
          <div className="flex-1">
             <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="pb-3 font-semibold">Kunde</th>
                  <th className="pb-3 font-semibold text-right">Umsatz (Brutto)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topCustomers.length === 0 && <tr><td colSpan={2} className="py-6 text-center text-slate-400">Keine Daten verfügbar</td></tr>}
                {topCustomers.map(tc => (
                  <tr key={tc.id}>
                    <td className="py-3 font-medium text-slate-800">{tc.name}</td>
                    <td className="py-3 text-right font-medium text-blue-600">{formatCurrency(tc.total, settings.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
