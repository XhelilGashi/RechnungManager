import fs from 'fs';
import path from 'path';

const pagesDir = path.join('src', 'pages');

const pages = [
  { name: 'Baustellen', icon: 'HardHat', title: 'Baustellenverwaltung', subtitle: 'Verwalten Sie Ihre Baustellen und Standorte.' },
  { name: 'Produkte', icon: 'Package', title: 'Produkte', subtitle: 'Ihre Artikel und physische Produkte.' },
  { name: 'Dienstleistungen', icon: 'Wrench', title: 'Dienstleistungen', subtitle: 'Dienstleistungsangebote verwalten.' },
  { name: 'Kategorien', icon: 'Tags', title: 'Kategorien', subtitle: 'Artikelkategorien verwalten.' },
  { name: 'Einnahmen', icon: 'TrendingUp', title: 'Einnahmen', subtitle: 'Verfolgen Sie Ihre Einnahmen.' },
  { name: 'Ausgaben', icon: 'CreditCard', title: 'Ausgaben', subtitle: 'Ausgaben und Belege verwalten.' },
  { name: 'Zahlungen', icon: 'Wallet', title: 'Zahlungen', subtitle: 'Abwicklung und Historie Ihrer Zahlungen.' },
  { name: 'Umsatz', icon: 'BarChart3', title: 'Umsatz', subtitle: 'Detaillierter Umsatzbericht.' },
  { name: 'Gewinn', icon: 'PieChart', title: 'Gewinn', subtitle: 'Gewinnauswertung und Margen.' },
  { name: 'TopKunden', icon: 'Star', title: 'Top Kunden', subtitle: 'Die wertvollsten Kunden im Überblick.' },
  { name: 'Unternehmen', icon: 'Building2', title: 'Unternehmensprofil', subtitle: 'Stammdaten Ihres Unternehmens.' },
  { name: 'RechnungDesign', icon: 'Palette', title: 'Rechnungsdesign', subtitle: 'Passen Sie das Layout Ihrer Rechnungen an.' },
  { name: 'System', icon: 'Settings', title: 'Systemeinstellungen', subtitle: 'Zentrale ERP Systemeinstellungen konfigurieren.' }
];

pages.forEach(p => {
  const fileContent = `import React from 'react';
import { useAppContext } from '../store/AppContext';
import { ${p.icon} } from 'lucide-react';

export function ${p.name}() {
  const { showToast } = useAppContext();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight flex items-center gap-3">
            <${p.icon} className="w-6 h-6 text-blue-600" />
            ${p.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">${p.subtitle}</p>
        </div>
        <button 
          onClick={() => showToast('Kommt bald!', 'success')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm"
        >
          Aktion
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center mt-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <${p.icon} className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">${p.title} Modul</h3>
        <p className="text-slate-500 max-w-md">Dieses Modul arbeitet nun völlig unabhängig mit eigenen States und Daten. (Spezifische Feature-Implementation folgt)</p>
      </div>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(pagesDir, `${p.name}.tsx`), fileContent);
});

console.log('Pages generated!');
