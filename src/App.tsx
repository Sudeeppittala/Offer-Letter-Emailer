import React, { useState, useEffect } from 'react';
import { Client, Campaign, Recipient } from './types';
import Home from './components/Home';
import ClientSetup from './components/ClientSetup';
import Campaigns from './components/Campaigns';
import { Lock, Unlock } from 'lucide-react';

const STORAGE_KEY = 'placemein_clients';

const INITIAL_CLIENTS = [
  {
    id: 'client_skilldunia_001',
    name: 'Skill Dunia',
    shortCode: 'SD',
    description: 'Ed-tech platform for skill development.',
    active: true,
    companyLogoUrl: '',
    clientSheetUrl: '',
    clientSheetOwnerEmail: '',
    offerLetterDocTemplateId: '',
    offerLetterDocUrl: '',
    appsScriptCode: '',
    appsScriptWebAppUrl: '',
    appsScriptSetupStatus: 'not_configured' as const,
    editorAccessEmail: '',
    notes: '',
    ccEmail: '',
    officeLocationLink: '',
    confirmationFormLink: '',
    whatsAppNumber: '',
    companyTeamName: '',
  }
];

const loadClients = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : INITIAL_CLIENTS;
  } catch {
    return INITIAL_CLIENTS;
  }
};

const saveClients = (clients: Client[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
};

export default function App() {
  const [clients, setClients] = useState<Client[]>(loadClients);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'setup' | 'campaigns'>('home');
  
  const EDIT_PASSWORD = 'placemein@2024';
  const [isEditMode, setIsEditMode] = useState(false);

  const updateClient = (updatedClient: Client) => {
    const updated = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
    saveClients(updated);
    setClients(updated);
  };

  const addClient = (newClientData: Omit<Client, 'id'>) => {
    const newClient = { ...newClientData, id: crypto.randomUUID() };
    const updated = [...clients, newClient];
    saveClients(updated);
    setClients(updated);
    return newClient;
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* Header */}
      <header className="bg-[#1E0A3C] border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView('home'); setSelectedClientId(null); }}>
            <img 
              src="https://res.cloudinary.com/dp9jnvstr/image/upload/v1768818411/logo-hero-3d_1_oyxssi.png"
              alt="Placemein" 
              className="h-9 w-auto object-contain"
            />
            <span className="text-sm font-medium text-purple-300 ml-2">OfferMail Communicator</span>
          </div>
          
          <div className="flex items-center gap-4">
            {selectedClient ? (
              <div className="flex items-center gap-4">
                <nav className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg text-sm font-medium">
                  <button 
                    onClick={() => setView('setup')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${view === 'setup' ? 'bg-purple-600 shadow-sm text-white' : 'text-purple-300 hover:text-white'}`}
                  >
                    Setup
                  </button>
                  <button 
                    onClick={() => setView('campaigns')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${view === 'campaigns' ? 'bg-purple-600 shadow-sm text-white' : 'text-purple-300 hover:text-white'}`}
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
              isEditMode ? (
                <div className="flex items-center gap-3">
                  <span className="bg-green-500 text-white text-xs font-medium rounded-full px-3 py-1">
                    ✏️ Edit Mode Active
                  </span>
                  <button 
                    onClick={() => setIsEditMode(false)}
                    className="text-sm text-red-300 hover:text-white border border-red-400 rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-colors"
                  >
                    <Unlock className="w-4 h-4" /> Exit Edit Mode
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    const pwd = window.prompt('Enter admin password:');
                    if (pwd === EDIT_PASSWORD) { setIsEditMode(true); }
                    else if (pwd !== null) { alert('Incorrect password. Access denied.'); }
                  }}
                  className="text-sm text-purple-300 hover:text-white border border-purple-400 rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-colors"
                >
                  <Lock className="w-4 h-4" /> Enable Editing
                </button>
              )
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'home' && (
          <Home 
            clients={clients} 
            onSelectClient={(id) => { setSelectedClientId(id); setView('setup'); }}
            onAddClient={async (c) => addClient(c)}
            onUpdateClient={async (c) => updateClient(c)}
            isEditMode={isEditMode}
          />
        )}

        {view === 'setup' && selectedClient && (
          <ClientSetup 
            client={selectedClient} 
            onUpdate={async (c) => updateClient(c)}
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
