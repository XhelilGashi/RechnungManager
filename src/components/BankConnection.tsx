import React, { useState } from 'react';
import { Search, Building2, Download, CheckCircle2, X } from 'lucide-react';

export function BankConnection() {
  const [activeTab, setActiveTab] = useState<'bankkonto' | 'verrechnungskonto'>('bankkonto');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');

  const banks = [
    { name: 'Sparkasse', color: 'bg-red-500', icon: 'S' },
    { name: 'Deutsche Bank', color: 'bg-blue-800', icon: 'DB' },
    { name: 'Commerzbank', color: 'bg-yellow-500', icon: 'CB' },
    { name: 'N26', color: 'bg-teal-500', icon: 'N26' },
    { name: 'PayPal', color: 'bg-blue-500', icon: 'P' },
    { name: 'Postbank', color: 'bg-yellow-400', icon: 'PB' },
    { name: 'Volksbank', color: 'bg-orange-500', icon: 'V/R' },
    { name: 'ING', color: 'bg-orange-600', icon: 'ING' },
  ];

  const filteredBanks = banks.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  const handleBankClick = (bankName: string) => {
    setSelectedBank(bankName);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('bankkonto')}
          className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'bankkonto' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Bankkonto
        </button>
        <button
          onClick={() => setActiveTab('verrechnungskonto')}
          className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'verrechnungskonto' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Verrechnungskonto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Wählen Sie Ihre Bank aus</h2>
          <p className="text-slate-500 text-sm">Verbinden Sie Ihr {activeTab === 'bankkonto' ? 'Bankkonto' : 'Verrechnungskonto'}, um Transaktionen automatisch abzugleichen.</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md w-full mb-8">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Bank suchen..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 transition-all font-medium" 
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-2">
          {filteredBanks.map(bank => (
            <button
              key={bank.name}
              onClick={() => handleBankClick(bank.name)}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className={`w-14 h-14 ${bank.color} rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm group-hover:scale-105 transition-transform`}>
                {bank.icon}
              </div>
              <span className="text-sm font-semibold text-slate-700">{bank.name}</span>
            </button>
          ))}
          
          <button
            onClick={() => handleBankClick('CSV Import')}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-200 group-hover:text-blue-600 transition-colors">
              <Download className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-slate-600 group-hover:text-blue-700">CSV Import</span>
          </button>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex items-center justify-center shadow-sm">
         <div className="flex flex-col items-center sm:items-start gap-4">
            <h3 className="font-bold text-blue-900 text-center sm:text-left shadow-sm bg-white px-4 py-1.5 rounded-lg border border-blue-100 w-fit">Vorteile der Bankanbindung</h3>
            <div className="flex flex-col sm:flex-row gap-6 mt-1">
               <div className="flex items-center gap-2.5 text-sm text-blue-800 font-medium">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                     <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Zahlungen werden automatisch verbucht</span>
               </div>
               <div className="flex items-center gap-2.5 text-sm text-blue-800 font-medium">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                     <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Banktransaktionen werden synchronisiert</span>
               </div>
               <div className="flex items-center gap-2.5 text-sm text-blue-800 font-medium">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                     <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Fehlende Belege werden erkannt</span>
               </div>
            </div>
         </div>
      </div>

      {/* Connection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Mit {selectedBank} verbinden</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 text-center space-y-4">
               <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-blue-100">
                 {selectedBank === 'CSV Import' ? <Download className="w-10 h-10" /> : <Building2 className="w-10 h-10" />}
               </div>
               <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-xl text-slate-800">Coming Soon</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">Die automatische Schnittstelle zu <span className="font-semibold text-slate-700">{selectedBank}</span> wird in Kürze verfügbar sein.</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all active:scale-[0.98]">
                 Verstanden
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
