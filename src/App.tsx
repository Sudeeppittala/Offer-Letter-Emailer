import React, { useState, useEffect } from 'react';
import { Client, Campaign, Recipient, BackendConfig } from './types';
import Home from './components/Home';
import ClientSetup from './components/ClientSetup';
import Campaigns from './components/Campaigns';
import BackendSetup from './components/BackendSetup';
import { Layout, ChevronLeft, Database, Settings } from 'lucide-react';

export default function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'setup' | 'campaigns' | 'backend'>('home');
  const [loading, setLoading] = useState(false);
  const [backendConfig, setBackendConfig] = useState<BackendConfig | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const configRes = await fetch('/api/config');
      const config = await configRes.json();
      setBackendConfig(config);
      
      // Always fetch clients and go to home, backend setup is optional/accessible via settings
      await fetchClients();
      setView('home');
    } catch (err) {
      console.error("Failed to fetch initial data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error("Failed to fetch clients", err);
    }
  };

  const updateBackendConfig = async (url: string) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backendWebAppUrl: url }),
      });
      if (res.ok) {
        const data = await res.json();
        setBackendConfig(data);
        setView('home');
        await fetchClients();
      }
    } catch (err) {
      console.error("Failed to update backend config", err);
    }
  };

  const updateClient = async (updatedClient: Client) => {
    try {
      const res = await fetch(`/api/clients/${updatedClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedClient),
      });
      if (res.ok) {
        setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
      }
    } catch (err) {
      console.error("Failed to update client", err);
    }
  };

  const addClient = async (newClient: Omit<Client, 'id'>) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      });
      if (res.ok) {
        const data = await res.json();
        setClients([...clients, data]);
        return data;
      }
    } catch (err) {
      console.error("Failed to add client", err);
    }
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView('home'); setSelectedClientId(null); }}>
            <div className="bg-neutral-900 p-2 rounded-lg">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">OfferMail Communicator</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {selectedClient ? (
              <div className="flex items-center gap-4">
                <nav className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg text-sm font-medium">
                  <button 
                    onClick={() => setView('setup')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${view === 'setup' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
                  >
                    Setup
                  </button>
                  <button 
                    onClick={() => setView('campaigns')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${view === 'campaigns' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
                  >
                    Campaigns
                  </button>
                </nav>
                <div className="h-6 w-px bg-neutral-200 mx-2" />
                <div className="flex items-center gap-2">
                  {selectedClient.companyLogoUrl ? (
                    <img src={selectedClient.companyLogoUrl} alt={selectedClient.name} className="h-6 object-contain" />
                  ) : (
                    <span className="text-xs font-bold bg-neutral-900 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                      {selectedClient.shortCode}
                    </span>
                  )}
                  <span className="text-sm font-medium text-neutral-600">{selectedClient.name}</span>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setView('backend')}
                className={`p-2 rounded-lg transition-colors ${view === 'backend' ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}
                title="Backend Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'backend' && (
          <BackendSetup 
            currentUrl={backendConfig?.backendWebAppUrl}
            onConfigured={updateBackendConfig}
          />
        )}

        {view === 'home' && (
          <Home 
            clients={clients} 
            onSelectClient={(id) => { setSelectedClientId(id); setView('setup'); }}
            onAddClient={addClient}
            onUpdateClient={updateClient}
            isSynced={!!backendConfig?.backendWebAppUrl}
          />
        )}

        {view === 'setup' && selectedClient && (
          <ClientSetup 
            client={selectedClient} 
            onUpdate={updateClient}
            onBack={() => { setView('home'); setSelectedClientId(null); }}
          />
        )}

        {view === 'campaigns' && selectedClient && (
          <Campaigns 
            client={selectedClient}
          />
        )}
      </main>
    </div>
  );
}
