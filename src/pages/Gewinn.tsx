import React from 'react';
import { useAppContext } from '../store/AppContext';
import { PieChart } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
export function Gewinn() {
  const { invoices, expenses, settings } = useAppContext();
  const einnahmen = invoices.filter(i=>i.status==='bezahlt').reduce((sum, i)=>sum+i.total, 0);
  const ausgaben = expenses.reduce((sum, e)=>sum+e.total, 0);
  const gewinn = einnahmen - ausgaben;
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold flex gap-3 items-center"><PieChart className="text-blue-600" /> Gewinn</h1>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-sm border">
         <h2 className="text-xl">Gesamtgewinn: <span className="font-bold text-emerald-600">{formatCurrency(gewinn, settings.currency)}</span></h2>
      </div>
    </div>
  );
}