import React from 'react';
import { useAppContext } from '../store/AppContext';
import { Star } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
export function TopKunden() {
  const { invoices, customers, settings } = useAppContext();
  const top = Object.entries(invoices.reduce((acc, i) => { acc[i.customerId] = (acc[i.customerId]||0) + i.total; return acc; }, {} as any))
    .sort(([,a]: any, [,b]: any) => b - a);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold flex gap-3 items-center"><Star className="text-blue-600" /> Top Kunden</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50"><tr className="border-b">
             <th className="p-4">Kunde</th><th className="p-4 text-right">Umsatz</th>
          </tr></thead>
          <tbody className="divide-y">
             {top.map(([id, amount]: any) => {
               const c = customers.find(c => c.id === id);
               return <tr key={id}><td className="p-4">{c ? (c.companyName || [c.firstName, c.lastName].join(' ')) : 'Unbekannt'}</td><td className="p-4 text-right">{formatCurrency(amount, settings.currency)}</td></tr>
             })}
          </tbody>
        </table>
      </div>
    </div>
  );
}