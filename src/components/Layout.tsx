import React, { ReactNode, useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FileText, Receipt, Settings, Package, HardHat, 
  Briefcase, Wrench, Tags, TrendingUp, CreditCard, Wallet, 
  BarChart3, PieChart, Star, Building2, Palette, Menu, X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { GlobalSearch } from './GlobalSearch';
import { useTranslation } from '../i18n';
import { useAppContext } from '../store/AppContext';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { settings } = useAppContext();
  const { t } = useTranslation(settings.language || 'de');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when tab changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  const menuGroups = [
    {
      title: t('dashboard'),
      items: [
        { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
      ],
    },
    {
      title: t('sales'),
      items: [
        { id: 'angebote', label: t('offers'), icon: FileText },
        { id: 'rechnungen', label: t('invoices'), icon: Receipt },
        { id: 'kunden', label: t('customers'), icon: Users },
      ],
    },
    {
      title: t('projects'),
      items: [
        { id: 'projekte', label: t('projects'), icon: Briefcase },
        { id: 'baustellen', label: t('sites'), icon: HardHat },
      ],
    },
    {
      title: t('articles'),
      items: [
        { id: 'produkte', label: t('products'), icon: Package },
        { id: 'dienstleistungen', label: t('services'), icon: Wrench },
        { id: 'kategorien', label: t('categories'), icon: Tags },
      ],
    },
    {
      title: t('finance'),
      items: [
        { id: 'einnahmen', label: t('income'), icon: TrendingUp },
        { id: 'ausgaben', label: t('expenses'), icon: CreditCard },
        { id: 'zahlungen', label: t('payments'), icon: Wallet },
      ],
    },
    {
      title: t('reports'),
      items: [
        { id: 'umsatz', label: t('revenue'), icon: BarChart3 },
        { id: 'gewinn', label: t('profit'), icon: PieChart },
        { id: 'top_kunden', label: t('top_customers'), icon: Star },
      ],
    },
    {
      title: t('settings_section'),
      items: [
        { id: 'unternehmen', label: t('company'), icon: Building2 },
        { id: 'rechnung_design', label: t('invoice_design'), icon: Palette },
        { id: 'system', label: t('system'), icon: Settings },
      ],
    },
  ];

  const renderNavGroup = (group: any) => (
    <div key={group.title} className="mb-6">
      <h3 className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 shadow-none select-none">
        {group.title}
      </h3>
      <div className="space-y-0.5">
        {group.items.map((item: any) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/5"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className={cn("w-[18px] h-[18px]", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 relative w-full">
      
      {/* NEW TOP BRANDING HEADER */}
      <header className="bg-white border-b border-slate-200 shrink-0 z-40 flex items-center justify-between px-4 md:px-8 py-4 shadow-sm relative w-full">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden text-slate-600 hover:text-slate-900 focus:outline-none p-1.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-7 h-7" />
          </button>
          <div className="text-2xl md:text-3xl font-bold tracking-tight shrink-0 select-none">
            <span className="text-slate-900">Rechnung</span>
            <span className="text-blue-600">Manager</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {/* Desktop User Initial */}
           <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold hidden sm:flex">
             RM
           </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative w-full">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
        )}

        {/* Sidebar */}
        <div 
          className={cn(
            "w-[260px] bg-white border-r border-slate-200 flex flex-col p-4 shadow-sm z-50 transition-transform duration-300",
            "fixed inset-y-0 left-0 md:relative md:translate-x-0 h-full",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between mb-8 md:hidden px-2">
            <span className="font-bold text-slate-800 text-lg">Menü</span>
            <button 
              className="text-slate-500 hover:text-slate-800 p-1"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <GlobalSearch onNavigate={setActiveTab} />

          <nav className="flex-1 overflow-y-auto px-1 custom-scrollbar pb-6 mt-4">
            {menuGroups.map(renderNavGroup)}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden w-full transition-colors duration-300">
          
          {/* Content */}
          <main className="flex-1 overflow-y-auto w-full p-4 md:p-10 flex flex-col gap-6 md:gap-8 bg-slate-50 custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
