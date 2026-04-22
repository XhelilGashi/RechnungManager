import React, { useState, useEffect, useRef } from 'react';
import { Search, User, FileText, Receipt, HardHat } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { formatCurrency } from '../lib/utils';
import { useTranslation } from '../i18n';

interface GlobalSearchProps {
  onNavigate: (tab: string) => void;
}

export function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const { customers, invoices, offers, projects, settings } = useAppContext();
  const { t } = useTranslation(settings.language || 'de');
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const results = React.useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const res: any[] = [];

    // Search Customers
    customers.forEach(c => {
      if (
        c.name.toLowerCase().includes(lowerQuery) ||
        (c.companyName && c.companyName.toLowerCase().includes(lowerQuery)) ||
        (c.email && c.email.toLowerCase().includes(lowerQuery)) ||
        (c.city && c.city.toLowerCase().includes(lowerQuery))
      ) {
        res.push({ type: 'customer', id: c.id, title: c.companyName || c.name, subtitle: c.email || c.city || 'Kunde', icon: User, tab: 'kunden', ref: c });
      }
    });

    // Search Invoices
    invoices.forEach(i => {
      if (
        i.number.toLowerCase().includes(lowerQuery) ||
        (i.subject && i.subject.toLowerCase().includes(lowerQuery)) ||
        (i.companyName && i.companyName.toLowerCase().includes(lowerQuery)) ||
        (i.firstName && i.firstName.toLowerCase().includes(lowerQuery)) ||
        (i.lastName && i.lastName.toLowerCase().includes(lowerQuery))
      ) {
         let subtitle = i.companyName || [i.firstName, i.lastName].filter(Boolean).join(' ') || 'Unbekannt';
         res.push({ type: 'invoice', id: i.id, title: i.number, subtitle: `${subtitle} - ${formatCurrency(i.total, settings.currency)}`, icon: Receipt, tab: 'rechnungen', ref: i });
      }
    });

    // Search Offers
    offers.forEach(o => {
      if (
        o.number.toLowerCase().includes(lowerQuery) ||
        (o.subject && o.subject.toLowerCase().includes(lowerQuery)) ||
        (o.companyName && o.companyName.toLowerCase().includes(lowerQuery)) ||
        (o.firstName && o.firstName.toLowerCase().includes(lowerQuery)) ||
        (o.lastName && o.lastName.toLowerCase().includes(lowerQuery))
      ) {
         let subtitle = o.companyName || [o.firstName, o.lastName].filter(Boolean).join(' ') || 'Unbekannt';
         res.push({ type: 'offer', id: o.id, title: o.number, subtitle: `${subtitle} - ${formatCurrency(o.total, settings.currency)}`, icon: FileText, tab: 'angebote', ref: o });
      }
    });

    // Search Projects
    projects.forEach(p => {
      if (
        p.name.toLowerCase().includes(lowerQuery) ||
        (p.description && p.description.toLowerCase().includes(lowerQuery))
      ) {
        const c = customers.find(cust => cust.id === p.customerId);
        res.push({ type: 'project', id: p.id, title: p.name, subtitle: c?.companyName || c?.name || 'Projekt', icon: HardHat, tab: 'projekte', ref: p });
      }
    });

    return res.slice(0, 10); // Limit to top 10 results
  }, [query, customers, invoices, offers, projects, settings.currency]);

  return (
    <div className="relative mb-6 px-1 z-50" ref={containerRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
          placeholder={t('search')}
          value={query}
          onChange={(e) => {
             setQuery(e.target.value);
             setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && query.trim() !== '' && (
        <div className="absolute top-full left-1 right-1 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-[60vh] overflow-y-auto">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((result, idx) => {
                const Icon = result.icon;
                return (
                  <button
                    key={result.type + result.id + idx}
                    onClick={() => {
                       setIsOpen(false);
                       setQuery('');
                       onNavigate(result.tab);
                       // We can't navigate to a specific item easily without context, but we will jump to the tab at least.
                       // You could emit an event here to select the item in the list view of that tab if we wanted deep linking.
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-start gap-3 transition-colors border-b border-slate-50 last:border-0"
                  >
                    <div className={`mt-0.5 p-1.5 rounded-md ${
                       result.type === 'customer' ? 'bg-blue-100 text-blue-600' :
                       result.type === 'invoice' ? 'bg-emerald-100 text-emerald-600' :
                       result.type === 'offer' ? 'bg-amber-100 text-amber-600' :
                       'bg-purple-100 text-purple-600'
                    }`}>
                       <Icon className="w-4 h-4" />
                    </div>
                    <div>
                       <div className="text-sm font-semibold text-slate-800">{result.title}</div>
                       <div className="text-xs text-slate-500 truncate mt-0.5">{result.subtitle}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center px-4">
              <Search className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              <div className="text-sm text-slate-600 font-medium">Keine Ergebnisse</div>
              <div className="text-xs text-slate-400 mt-1">Für "{query}" wurde nichts gefunden.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
