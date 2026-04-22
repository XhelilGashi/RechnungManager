import React, { useState, useRef } from 'react';
import { useAppContext } from '../store/AppContext';
import { 
  Users, Trash2, Upload, Palette, Monitor, Download, ArrowLeftRight, Building2, Save, FileText, LayoutTemplate, Briefcase, Plus, Calculator, PiggyBank, Edit, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { AppSettings } from '../types';
import { formatCurrency } from '../lib/utils';

export function Einstellungen() {
  const { 
    logo, setLogo, settings, setSettings, showToast, 
    setCustomers, setInvoices, setOffers, setProjects, setProducts, 
    invoices
  } = useAppContext();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Left sidebar active section
  const [activeTab, setActiveTab] = useState<'buchhaltung' | 'unternehmen' | 'briefpapier' | 'textvorlagen' | 'system'>('unternehmen');
  
  const handleChange = (key: keyof AppSettings, value: string | boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    showToast('Einstellung gespeichert', 'success');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
        showToast('Logo erfolgreich hochgeladen', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Logo entfernt', 'success');
  };

  const APP_VERSION = "v1.3.0";

  // ---- RENDERERS ----

  const renderBuchhaltung = () => {
    // Basic calculations for display
    const paidInvoices = invoices.filter(i => i.status === 'bezahlt');
    const totalIncome = paidInvoices.reduce((sum, i) => sum + i.total, 0);

    return (
      <div className="space-y-8">
        <h3 className="text-xl font-bold text-slate-800">Buchhaltung</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><PiggyBank className="w-6 h-6"/></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Einnahmen (Bezahlt)</p>
              <h4 className="text-2xl font-bold text-slate-900">{formatCurrency(totalIncome, settings.currency)}</h4>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-sm flex items-center gap-4 opacity-60">
             <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600"><Calculator className="w-6 h-6"/></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Ausgaben (Demnächst)</p>
              <h4 className="text-2xl font-bold text-slate-900">{formatCurrency(0, settings.currency)}</h4>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-sm">
          <h4 className="font-semibold text-slate-800 mb-4">Steuersätze & Finanzen</h4>
          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Standard Währung</label>
              <select 
                value={settings.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="EUR">Euro (€)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="CHF">Swiss Franc (CHF)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Standard Mehrwertsteuer (%)</label>
              <input 
                type="number"
                value={settings.defaultVatRate ?? 19}
                onChange={(e) => handleChange('defaultVatRate', parseFloat(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUnternehmen = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-800 mb-4">Unternehmensdaten</h3>
      <p className="text-sm text-slate-500 mb-4 -mt-2">Diese Informationen werden automatisch auf Ihren Rechnungen positioniert.</p>
      
      <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        
        {/* Core Info */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-700 border-b pb-2">Basisdaten</h4>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Firmenname</label>
            <input value={settings.companyName || ''} onChange={(e) => handleChange('companyName', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Inhaber Vorname</label>
              <input value={settings.companyOwnerFirstName || ''} onChange={(e) => handleChange('companyOwnerFirstName', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Inhaber Nachname</label>
              <input value={settings.companyOwnerLastName || ''} onChange={(e) => handleChange('companyOwnerLastName', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Steuer-ID / USt-IdNr.</label>
            <input value={settings.companyTaxId || ''} onChange={(e) => handleChange('companyTaxId', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm outline-none" />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-700 border-b pb-2">Adresse</h4>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Straße & Nr.</label>
            <input value={settings.companyStreet || ''} onChange={(e) => handleChange('companyStreet', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">PLZ</label>
              <input value={settings.companyZip || ''} onChange={(e) => handleChange('companyZip', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Stadt</label>
              <input value={settings.companyCity || ''} onChange={(e) => handleChange('companyCity', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Land</label>
            <input value={settings.companyCountry || ''} onChange={(e) => handleChange('companyCountry', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm outline-none" />
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-700 border-b pb-2">Kontakt</h4>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
            <input value={settings.companyPhone || ''} onChange={(e) => handleChange('companyPhone', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail</label>
            <input type="email" value={settings.companyEmail || ''} onChange={(e) => handleChange('companyEmail', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
            <input value={settings.companyWebsite || ''} onChange={(e) => handleChange('companyWebsite', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm outline-none" />
          </div>
        </div>

        {/* Banking */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-700 border-b pb-2">Bankverbindung</h4>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
            <input value={settings.companyBankName || ''} onChange={(e) => handleChange('companyBankName', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">IBAN</label>
            <input value={settings.companyIban || ''} onChange={(e) => handleChange('companyIban', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm outline-none font-mono text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">BIC</label>
            <input value={settings.companyBic || ''} onChange={(e) => handleChange('companyBic', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm outline-none font-mono text-sm" />
          </div>
        </div>

      </div>
    </div>
  );

  const renderBriefpapier = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Briefpapier & Design</h3>
          <p className="text-sm text-slate-500">Steuern Sie das visuelle Erscheinungsbild Ihrer Dokumente.</p>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-sm space-y-8">
        
        <div>
          <h4 className="font-semibold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2"><Upload className="w-4 h-4"/> Firmenlogo</h4>
          <div className="flex items-start gap-6">
            {logo ? (
              <div className="relative group w-48 h-32 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-4">
                <img src={logo} alt="Logo" className="max-h-full max-w-full object-contain" />
                <button onClick={handleRemoveLogo} className="absolute -top-2 -right-2 bg-white text-red-500 border border-slate-200 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="w-48 h-32 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center flex-col text-slate-400">
                <Palette className="w-8 h-8 mb-2 opacity-50"/>
                <span className="text-xs">Kein Logo</span>
              </div>
            )}
            <div className="flex-1 space-y-4">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors rounded-md cursor-pointer text-sm font-medium">
                <Upload className="w-4 h-4" /> Logo hochladen
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleLogoUpload} />
              </label>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Standard Position</label>
                  <select value={settings.logoPosition || 'right'} onChange={e => handleChange('logoPosition', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm shadow-sm outline-none">
                    <option value="left">Links</option>
                    <option value="center">Mittig</option>
                    <option value="right">Rechts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Logo Größe (px)</label>
                  <input type="number" min="30" max="250" value={settings.logoSize || 80} onChange={e => handleChange('logoSize', parseInt(e.target.value))} className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm shadow-sm outline-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2"><LayoutTemplate className="w-4 h-4"/> Layout & Typografie</h4>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bevorzugte Vorlage</label>
                <select value={settings.invoiceTemplate} onChange={e => handleChange('invoiceTemplate', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm outline-none">
                  <option value="standard">Standard (Klassisch)</option>
                  <option value="modern">Modern (Randlos)</option>
                  <option value="minimal">Minimalistisch</option>
                  <option value="elegant">Elegant (Serif)</option>
                  <option value="bold">Fett (Kontrast)</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">Hinweis: Sie können das Design individuell anpassen.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Dokumenten-Skallierung (%)</label>
                <input type="number" min="50" max="150" step="5" value={settings.invoiceScale || 100} onChange={e => handleChange('invoiceScale', parseInt(e.target.value))} className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm outline-none" />
                <p className="text-xs text-slate-500 mt-2">Passt die Größe des gesamten Inhalts (Rechnungstitel, Text) an.</p>
              </div>
            </div>
            
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Akzentfarbe</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={settings.invoiceColor || '#3B82F6'} onChange={e => handleChange('invoiceColor', e.target.value)} className="w-10 h-10 rounded border-0 cursor-pointer shadow-sm p-0 m-0" />
                    <span className="text-sm text-slate-600 font-mono uppercase">{settings.invoiceColor || '#3B82F6'}</span>
                  </div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">Schriftart</label>
                 <select value={settings.invoiceFontFamily || 'Inter'} onChange={e => handleChange('invoiceFontFamily', e.target.value)} className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm outline-none">
                    <option value="Inter">Inter (Sans-Serif)</option>
                    <option value="Helvetica">Helvetica (Modern)</option>
                    <option value="Georgia">Georgia (Serif)</option>
                    <option value="Courier">Courier (Monospace)</option>
                  </select>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  const renderTextvorlagen = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-800 mb-4">Textvorlagen</h3>
      <p className="text-sm text-slate-500 mb-4 -mt-2">Legen Sie Standardtexte fest, die in neue Rechnungen automatisch eingefügt werden.</p>
      
      <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Einleitungstext (Intro)</label>
          <textarea 
            rows={3}
            value={settings.defaultIntroText || ''}
            onChange={(e) => handleChange('defaultIntroText', e.target.value)}
            placeholder="Sehr geehrte Damen und Herren,\nhiermit stellen wir Ihnen folgende Leistungen in Rechnung..."
            className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Schlusstext / Danksagung</label>
          <textarea 
            rows={2}
            value={settings.defaultClosingText || ''}
            onChange={(e) => handleChange('defaultClosingText', e.target.value)}
            placeholder="Wir bedanken uns für das entgegengebrachte Vertrauen."
            className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Zahlungshinweis (Fussnote)</label>
          <textarea 
            rows={2}
            value={settings.defaultPaymentNote || ''}
            onChange={(e) => handleChange('defaultPaymentNote', e.target.value)}
            placeholder="Zahlbar sofort nach Erhalt ohne Abzug. Bitte geben Sie die Rechnungsnummer bei der Überweisung an."
            className="w-full bg-white border border-slate-200 rounded-md px-4 py-3 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 resize-y text-sm font-mono"
          />
        </div>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-slate-800 mb-4">System & Erweitert</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-sm space-y-6">
          <h4 className="font-semibold text-slate-700 border-b pb-2">Applikation</h4>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Sprache</label>
            <select 
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
              <option value="sq">Albanian (Shqip)</option>
              <option value="it">Italiano</option>
              <option value="es">Español</option>
              <option value="sr">Serbian (Srpski)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Datumsformat</label>
            <select 
              value={settings.dateFormat}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="DD.MM.YYYY">DD.MM.YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-slate-700">Dark Mode (Experimentell)</span>
             <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.darkMode} onChange={e => handleChange('darkMode', e.target.checked)} />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-800"></div>
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-sm">
            <h4 className="font-semibold text-slate-700 border-b pb-2 mb-4">Über</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between"><span>Version:</span> <span className="font-mono font-medium">{APP_VERSION}</span></div>
              <div className="flex justify-between"><span>Lokaler Speicher:</span> <span className="text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Aktiv</span></div>
              <div className="flex justify-between"><span>Entwickler:</span> <span className="font-medium">Xhelil Gashi</span></div>
            </div>
          </div>
          
           <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-red-100 shadow-sm">
            <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Gefahrenzone</h4>
            <p className="text-xs text-slate-600 mb-4">Das unwiderrufliche Löschen entfernt alle lokalen App-Daten.</p>
            <button onClick={() => {
              if (window.confirm('Möchten Sie wirklich alle Daten unwiderruflich löschen? Dies kann nicht rückgängig gemacht werden.')) {
                setCustomers([]); setInvoices([]); setOffers([]); setProjects([]); setProducts([]);
                showToast('Daten gelöscht', 'success');
              }
            }} className="w-full px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-md font-medium text-sm transition-colors cursor-pointer">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-8 h-full">
      {/* Settings Left Sidebar */}
      <div className="w-full md:w-64 shrink-0 bg-white/70 backdrop-blur-md rounded-xl border border-white/20 shadow-sm p-4 h-fit">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Einstellungen</h2>
        <nav className="space-y-1">
          {[
            { id: 'buchhaltung', label: 'Buchhaltung', icon: Calculator },
            { id: 'unternehmen', label: 'Unternehmen', icon: Building2 },
            { id: 'briefpapier', label: 'Briefpapier', icon: Palette },
            { id: 'textvorlagen', label: 'Textvorlagen', icon: FileText },
            { id: 'system', label: 'System', icon: Monitor },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'text-slate-600 hover:bg-white/50 hover:text-slate-900 border border-transparent hover:border-white/40'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 w-full max-w-5xl">
        {activeTab === 'buchhaltung' && renderBuchhaltung()}
        {activeTab === 'unternehmen' && renderUnternehmen()}
        {activeTab === 'briefpapier' && renderBriefpapier()}
        {activeTab === 'textvorlagen' && renderTextvorlagen()}
        {activeTab === 'system' && renderSystem()}
      </div>
    </div>
  );
}
