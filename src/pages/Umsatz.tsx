import React from 'react';
import { useAppContext } from '../store/AppContext';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
export function Umsatz() {
  const { invoices, settings } = useAppContext();
  const total = invoices.filter(i=>i.status==='bezahlt').reduce((sum, i)=>sum+i.total, 0);
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold flex gap-3 items-center"><BarChart3 className="text-blue-600" /> Umsatz</h1>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-sm border">
         <h2 className="text-xl">Bezahlter Umsatz gesamt: <span className="font-bold text-blue-600">{formatCurrency(total, settings.currency)}</span></h2>
      </div>
    </div>
  );
}