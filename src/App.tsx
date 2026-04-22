import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './store/AppContext';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Dashboard } from './pages/Dashboard';
import { Kunden } from './pages/Kunden';
import { Projekte } from './pages/Projekte';
import { Artikel } from './pages/Artikel';
import { Angebote } from './pages/Angebote';
import { Rechnungen } from './pages/Rechnungen';
import { Automatisierung } from './pages/Automatisierung';
import { Kontakte } from './pages/Kontakte';
import { Einstellungen } from './pages/Einstellungen';
import { Buchhaltung } from './pages/Buchhaltung';
import { Berichte } from './pages/Berichte';

import { Baustellen } from './pages/Baustellen';
import { Produkte } from './pages/Produkte';
import { Dienstleistungen } from './pages/Dienstleistungen';
import { Kategorien } from './pages/Kategorien';
import { Einnahmen } from './pages/Einnahmen';
import { Ausgaben } from './pages/Ausgaben';
import { Zahlungen } from './pages/Zahlungen';
import { Umsatz } from './pages/Umsatz';
import { Gewinn } from './pages/Gewinn';
import { TopKunden } from './pages/TopKunden';
import { Unternehmen } from './pages/Unternehmen';
import { RechnungDesign } from './pages/RechnungDesign';
import { System } from './pages/System';

function AppEffects() {
  const { settings } = useAppContext();
  
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  return null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <AppProvider>
      <AppEffects />
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <ErrorBoundary fallbackMessage="Ein unerwarteter Fehler ist in dieser Ansicht aufgetreten.">
          {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === 'kunden' && <Kunden />}
          {activeTab === 'projekte' && <Projekte />}
          {activeTab === 'baustellen' && <Baustellen />}
          {activeTab === 'artikel' && <Artikel />}
          {activeTab === 'produkte' && <Produkte />}
          {activeTab === 'dienstleistungen' && <Dienstleistungen />}
          {activeTab === 'kategorien' && <Kategorien />}
          {activeTab === 'angebote' && <Angebote />}
          {activeTab === 'rechnungen' && <Rechnungen />}
          {activeTab === 'automatisierung' && <Automatisierung onNavigate={setActiveTab} />}
          {activeTab === 'buchhaltung' && <Buchhaltung />}
          {activeTab === 'einnahmen' && <Einnahmen />}
          {activeTab === 'ausgaben' && <Ausgaben />}
          {activeTab === 'zahlungen' && <Zahlungen />}
          {activeTab === 'berichte' && <Berichte />}
          {activeTab === 'umsatz' && <Umsatz />}
          {activeTab === 'gewinn' && <Gewinn />}
          {activeTab === 'top_kunden' && <TopKunden />}
          {activeTab === 'kontakte' && <Kontakte />}
          {activeTab === 'einstellungen' && <Einstellungen />}
          {activeTab === 'unternehmen' && <Unternehmen />}
          {activeTab === 'rechnung_design' && <RechnungDesign />}
          {activeTab === 'system' && <System />}
        </ErrorBoundary>
      </Layout>
    </AppProvider>
  );
}
