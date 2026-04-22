const fs = require('fs');
const path = require('path');

const pagesDir = path.join('src', 'pages');

const pages = [
  'Einnahmen', 'Ausgaben', 'Zahlungen', 
  'Umsatz', 'Gewinn', 'TopKunden', 
  'Unternehmen', 'RechnungDesign', 'System'
];

// Helper to remove 'In Kürze verfügbar' from these files and implement logic
const modifications = {
  'Einnahmen': `import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../store/AppContext';
import { TrendingUp, Plus, Trash2, X, Pencil } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

export function Einnahmen() {
  const { invoices, settings, showToast } = useAppContext();
  
  const paidInvoices = invoices.filter(i => i.status === 'bezahlt');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-emerald-500" />
            Einnahmen
          </h1>
          <p className="text-sm text-slate-500 mt-1">Auswertung und Historie Ihrer bezahlten Rechnungen.</p>
        </div>
      </div>

      {paidInvoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center min-h-[400px] flex flex-col justify-center items-center">
            <TrendingUp className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-3">Keine Einnahmen gefunden</h3>
            <p className="text-slate-500 max-w-md">Markieren Sie Rechnungen als "Bezahlt", um hier Ihre Einnahmen zu sehen.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Datum</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Rechnungs-Nr.</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Kunde</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Betrag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paidInvoices.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-600">{formatDate(item.createdAt, settings.dateFormat)}</td>
                    <td className="px-6 py-4 font-medium text-emerald-600">{item.number}</td>
                    <td className="px-6 py-4 text-slate-600">{item.companyName || [item.firstName, item.lastName].join(' ') || '-'}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 text-right">{formatCurrency(item.total, settings.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}`,
  'Ausgaben': `import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../store/AppContext';
import { Expense } from '../types';
import { CreditCard, Plus, Trash2, X, Pencil } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { format } from 'date-fns';

export function Ausgaben() {
  const { expenses, setExpenses, settings, showToast } = useAppContext();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Expense>>({ title: '', amount: 0, vatRate: 19, isPaid: false });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || formData.amount === undefined || formData.amount <= 0) {
      showToast('Bitte füllen Sie die Pflichtfelder korrekt aus', 'error');
      return;
    }

    const vatAmount = (formData.amount || 0) * ((formData.vatRate || 0) / 100);
    const total = (formData.amount || 0) + vatAmount;

    if (formData.id) {
      setExpenses(expenses.map(item => item.id === formData.id ? { ...item, ...formData, vatAmount, total } as Expense : item));
      showToast('Ausgabe erfolgreich aktualisiert', 'success');
    } else {
      const newItem = {
        ...formData,
        id: uuidv4(),
        vatAmount,
        total,
        date: formData.date || Date.now()
      } as Expense;
      setExpenses([newItem, ...expenses]);
      showToast('Ausgabe erfolgreich erstellt', 'success');
    }
    
    setIsCreating(false);
    setFormData({ title: '', amount: 0, vatRate: 19, isPaid: false });
  };

  const handleEdit = (item: Expense) => {
    setFormData(item);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
      setExpenses(expenses.filter(item => item.id !== id));
      showToast('Ausgabe gelöscht', 'success');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-blue-600" />
            Ausgaben
          </h1>
          <p className="text-sm text-slate-500 mt-1">Ausgaben und Belege verwalten.</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => { setFormData({ title: '', amount: 0, vatRate: 19, isPaid: false, date: Date.now() }); setIsCreating(true); }}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Neue Ausgabe
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white shadow-md border border-slate-200 p-6 rounded-xl relative mb-8">
          <button onClick={() => setIsCreating(false)} className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 p-1 rounded-full"><X className="w-5 h-5" /></button>
          <h3 className="text-xl font-bold mb-4">{formData.id ? 'Ausgabe bearbeiten' : 'Ausgabe erfassen'}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium mb-1">Titel / Verwendungszweck</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border p-2 rounded-lg" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium mb-1">Lieferant / Empfänger</label>
                <input type="text" value={formData.supplier || ''} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full border p-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Netto-Betrag</label>
                <input required type="number" step="0.01" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} className="w-full border p-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Steuersatz (%)</label>
                <select value={formData.vatRate} onChange={e => setFormData({...formData, vatRate: parseFloat(e.target.value)})} className="w-full border p-2 rounded-lg">
                  <option value="19">19%</option>
                  <option value="7">7%</option>
                  <option value="0">0%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Datum</label>
                <input required type="date" value={formData.date ? format(formData.date, 'yyyy-MM-dd') : ''} onChange={e => setFormData({...formData, date: new Date(e.target.value).getTime()})} className="w-full border p-2 rounded-lg" />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" checked={formData.isPaid} onChange={e => setFormData({...formData, isPaid: e.target.checked})} id="isPaid" className="w-4 h-4" />
                <label htmlFor="isPaid" className="text-sm font-medium">Als bezahlt markieren</label>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">Speichern</button>
              <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-2 border rounded-lg">Abbrechen</button>
            </div>
          </form>
        </div>
      )}

      {!isCreating && expenses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center min-h-[300px] flex flex-col justify-center items-center">
            <h3 className="text-xl font-bold mb-2">Keine Ausgaben vorhanden</h3>
            <button onClick={() => setIsCreating(true)} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg">Erste Ausgabe erfassen</button>
        </div>
      ) : !isCreating && (
        <div className="bg-white shadow-sm border rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4">Datum</th>
                <th className="px-6 py-4">Titel</th>
                <th className="px-6 py-4">Netto</th>
                <th className="px-6 py-4">Brutto</th>
                <th className="px-6 py-4 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {expenses.map(e => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">{formatDate(e.date, settings.dateFormat)}</td>
                  <td className="px-6 py-4 font-medium">{e.title}</td>
                  <td className="px-6 py-4">{formatCurrency(e.amount, settings.currency)}</td>
                  <td className="px-6 py-4 font-bold">{formatCurrency(e.total, settings.currency)}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(e)} className="p-2 text-slate-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(e.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}`,
  'Zahlungen': `import React from 'react';
import { useAppContext } from '../store/AppContext';
import { Wallet } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
export function Zahlungen() {
  const { payments, expenses, settings } = useAppContext();
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3"><Wallet className="w-7 h-7 text-blue-600" /> Zahlungen</h1>
          <p className="text-sm text-slate-500">Transhistorie</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <h3 className="text-lg font-medium">Zahlungshistorie ist mit Rechnungen & Ausgaben verknüpft.</h3>
      </div>
    </div>
  );
}`,
  'Umsatz': `import React from 'react';
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
}`,
  'Gewinn': `import React from 'react';
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
}`,
  'TopKunden': `import React from 'react';
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
}`,
  'Unternehmen': `import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Building2, Save } from 'lucide-react';
export function Unternehmen() {
  const { settings, setSettings, showToast } = useAppContext();
  const [formData, setFormData] = useState(settings);
  const handleSave = () => { setSettings(formData); showToast('Unternehmensdaten gespeichert', 'success'); };
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold flex gap-3 items-center"><Building2 className="text-blue-600" /> Unternehmen</h1>
        <button onClick={handleSave} className="bg-blue-600 px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2"><Save className="w-4 h-4" /> Speichern</button>
      </div>
      <div className="bg-white p-6 rounded-xl border shadow-sm grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Firmenname</label>
          <input className="w-full border p-2 rounded-lg" value={formData.companyName || ''} onChange={e=>setFormData({...formData, companyName: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Straße</label>
          <input className="w-full border p-2 rounded-lg" value={formData.companyStreet || ''} onChange={e=>setFormData({...formData, companyStreet: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">PLZ / Ort</label>
          <input className="w-full border p-2 rounded-lg" value={(formData.companyZip || '') + ' ' + (formData.companyCity || '')} onChange={e=>{
            const [z, ...c] = e.target.value.split(' ');
            setFormData({...formData, companyZip: z, companyCity: c.join(' ')});
          }} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">E-Mail</label>
          <input className="w-full border p-2 rounded-lg" value={formData.companyEmail || ''} onChange={e=>setFormData({...formData, companyEmail: e.target.value})} />
        </div>
      </div>
    </div>
  );
}`,
  'RechnungDesign': `import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Palette, Save } from 'lucide-react';
export function RechnungDesign() {
  const { settings, setSettings, showToast } = useAppContext();
  const [formData, setFormData] = useState(settings);
  const handleSave = () => { setSettings(formData); showToast('Design gespeichert', 'success'); };
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold flex gap-3 items-center"><Palette className="text-blue-600" /> Rechnung Design</h1>
        <button onClick={handleSave} className="bg-blue-600 px-6 py-2 rounded-lg text-white"><Save className="w-4 h-4" /></button>
      </div>
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <label className="block text-sm font-medium mb-1">Primärfarbe (Hex)</label>
        <div className="flex gap-4 items-center">
            <input type="color" className="w-12 h-12 rounded-lg cursor-pointer" value={formData.invoiceColor || '#000000'} onChange={e=>setFormData({...formData, invoiceColor: e.target.value})} />
            <input className="border p-2 rounded-lg w-full max-w-xs" value={formData.invoiceColor || '#000000'} onChange={e=>setFormData({...formData, invoiceColor: e.target.value})} />
        </div>
      </div>
    </div>
  );
}`,
  'System': `import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Settings, Save } from 'lucide-react';
export function System() {
  const { settings, setSettings, showToast } = useAppContext();
  const [formData, setFormData] = useState(settings);
  const handleSave = () => { setSettings(formData); showToast('System Settings gespeichert', 'success'); };
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold flex gap-3 items-center"><Settings className="text-blue-600" /> System</h1>
        <button onClick={handleSave} className="bg-blue-600 px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2"><Save className="w-4 h-4"/> Speichern</button>
      </div>
      <div className="bg-white p-6 rounded-xl border shadow-sm grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Sprache</label>
          <select className="w-full border p-2 rounded-lg" value={formData.language || 'de'} onChange={e=>setFormData({...formData, language: e.target.value})}>
            <option value="de">Deutsch</option><option value="en">English</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Währung</label>
          <select className="w-full border p-2 rounded-lg" value={formData.currency || 'EUR'} onChange={e=>setFormData({...formData, currency: e.target.value})}>
            <option value="EUR">€ EUR</option><option value="USD">$ USD</option><option value="CHF">CHF</option>
          </select>
        </div>
      </div>
    </div>
  );
}`
};

Object.keys(modifications).forEach(name => {
    fs.writeFileSync(path.join(pagesDir, `${name}.tsx`), modifications[name]);
});

console.log('Finished updating minor pages to remove placeholders and enable settings/read CRUD.');
