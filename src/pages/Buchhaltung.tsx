import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Plus, Search, FileText, ArrowUpRight, ArrowDownRight, Edit, Trash2, CheckCircle2, Upload, Calendar } from 'lucide-react';
import { Expense, BankTransaction, Invoice } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { formatCurrency, formatDate } from '../lib/utils';
import { BankConnection } from '../components/BankConnection';
import { format } from 'date-fns';

export function Buchhaltung() {
  const { invoices, expenses, setExpenses, bankTransactions, setBankTransactions, settings, customers } = useAppContext();
  const [activeTab, setActiveTab] = useState<'einnahmen' | 'ausgaben' | 'bank'>('einnahmen');
  const [search, setSearch] = useState('');
  
  // Expenses State
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const calculateTotal = (amount: number, vatRate: number) => amount + (amount * (vatRate / 100));
  
  const handleSaveExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const amount = parseFloat(data.get('amount') as string);
    const vatRate = parseFloat(data.get('vatRate') as string);
    const vatAmount = amount * (vatRate / 100);
    const total = amount + vatAmount;

    const newExpense: Expense = {
      id: editingExpense ? editingExpense.id : uuidv4(),
      title: data.get('title') as string,
      amount,
      vatRate,
      vatAmount,
      total,
      category: data.get('category') as string,
      date: new Date(data.get('date') as string).getTime(),
      supplier: data.get('supplier') as string,
      isPaid: data.get('isPaid') === 'true',
    };

    if (editingExpense) {
      setExpenses(expenses.map(ex => ex.id === editingExpense.id ? newExpense : ex));
    } else {
      setExpenses([...expenses, newExpense]);
    }
    setIsAddingExpense(false);
    setEditingExpense(null);
  };

  const renderEinnahmen = () => {
    const filteredInvoices = invoices.filter(i => 
      i.number.toLowerCase().includes(search.toLowerCase()) || 
      (i.companyName && i.companyName.toLowerCase().includes(search.toLowerCase()))
    ).sort((a, b) => b.createdAt - a.createdAt);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Rechnungen suchen..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Rechnungs-Nr.</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Kunde</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Datum</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Zahlungsziel</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-right">Brutto</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map(i => {
                const customer = customers.find(c => c.id === i.customerId);
                return (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-blue-600">{i.number}</td>
                    <td className="px-6 py-4">{customer?.companyName || customer?.name}</td>
                    <td className="px-6 py-4">{formatDate(i.createdAt, settings.dateFormat)}</td>
                    <td className="px-6 py-4">{i.dueDate ? formatDate(i.dueDate, settings.dateFormat) : '-'}</td>
                    <td className="px-6 py-4 text-right font-medium">{formatCurrency(i.total, settings.currency)}</td>
                    <td className="px-6 py-4">
                      {i.status === 'bezahlt' ? <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 w-fit inline-block">Bezahlt</span> :
                       i.status === 'überfällig' ? <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 w-fit inline-block">Überfällig</span> :
                       <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 w-fit inline-block">Offen</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAusgaben = () => {
    const filteredExpenses = expenses.filter(e => e.title.toLowerCase().includes(search.toLowerCase())).sort((a,b) => b.date - a.date);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Ausgaben suchen..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button onClick={() => { setIsAddingExpense(true); setEditingExpense(null); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" /> Ausgabe erfassen
          </button>
        </div>

        {(isAddingExpense || editingExpense) && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-lg font-bold mb-4">{editingExpense ? 'Ausgabe bearbeiten' : 'Neue Ausgabe'}</h4>
            <form onSubmit={handleSaveExpense} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Titel / Beschreibung</label>
                  <input name="title" required defaultValue={editingExpense?.title} className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategorie</label>
                  <select name="category" required defaultValue={editingExpense?.category || 'Material'} className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Material">Material</option>
                    <option value="Lohn">Lohn</option>
                    <option value="Transport">Transport</option>
                    <option value="Miete/Strom">Miete/Strom</option>
                    <option value="Software/IT">Software/IT</option>
                    <option value="Sonstiges">Sonstiges</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lieferant (Optional)</label>
                  <input name="supplier" defaultValue={editingExpense?.supplier} className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Datum</label>
                  <input type="date" name="date" required defaultValue={editingExpense ? format(editingExpense.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')} className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Netto-Betrag</label>
                    <input type="number" step="0.01" name="amount" required defaultValue={editingExpense?.amount} className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">MwSt (%)</label>
                     <select name="vatRate" required defaultValue={editingExpense?.vatRate ?? settings.defaultVatRate ?? 19} className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="19">19%</option>
                      <option value="7">7%</option>
                      <option value="0">0%</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select name="isPaid" required defaultValue={editingExpense?.isPaid ? 'true' : 'false'} className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="false">Offen</option>
                    <option value="true">Bezahlt</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => { setIsAddingExpense(false); setEditingExpense(null); }} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Abbrechen</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">Speichern</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Datum</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Titel</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Kategorie</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Lieferant</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-right">Brutto</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 && <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Keine Ausgaben vorhanden.</td></tr>}
              {filteredExpenses.map(e => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">{formatDate(e.date, settings.dateFormat)}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{e.title}</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">{e.category}</span></td>
                  <td className="px-6 py-4 text-slate-600">{e.supplier || '-'}</td>
                  <td className="px-6 py-4 text-right font-medium">{formatCurrency(e.total, settings.currency)}</td>
                  <td className="px-6 py-4">
                    {e.isPaid ? <span className="flex items-center gap-1 text-emerald-600 font-medium text-xs"><CheckCircle2 className="w-4 h-4"/> Bezahlt</span> 
                              : <span className="text-amber-600 font-medium text-xs">Offen</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => { setEditingExpense(e); setIsAddingExpense(false); }} className="p-1.5 text-slate-400 hover:text-blue-600"><Edit className="w-4 h-4"/></button>
                    <button onClick={() => { if(window.confirm('Ausgabe löschen?')) setExpenses(expenses.filter(x => x.id !== e.id)) }} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBank = () => (
    <div className="pt-2">
      <BankConnection />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto w-full pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Buchhaltung</h1>
        
        <div className="flex bg-slate-100 p-1 rounded-lg w-fit mt-6">
          <button 
            onClick={() => setActiveTab('einnahmen')} 
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'einnahmen' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <ArrowDownRight className="w-4 h-4" /> Einnahmen
          </button>
          <button 
            onClick={() => setActiveTab('ausgaben')} 
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'ausgaben' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <ArrowUpRight className="w-4 h-4" /> Ausgaben
          </button>
          <button 
            onClick={() => setActiveTab('bank')} 
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'bank' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <FileText className="w-4 h-4" /> Bank / Transaktionen
          </button>
        </div>
      </div>

      <div>
        {activeTab === 'einnahmen' && renderEinnahmen()}
        {activeTab === 'ausgaben' && renderAusgaben()}
        {activeTab === 'bank' && renderBank()}
      </div>
    </div>
  );
}
