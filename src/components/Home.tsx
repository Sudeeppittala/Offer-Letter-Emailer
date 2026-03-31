import React, { useState } from 'react';
import { Client, MASTER_BACKEND_SHEET_URL } from '../types';
import { Plus, Info, CheckCircle2, XCircle, Building2, ArrowRight, Database, ExternalLink, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AddClientModal from './AddClientModal';
import { EditClientModal } from './EditClientModal';

interface HomeProps {
  clients: Client[];
  onSelectClient: (id: string) => void;
  onAddClient: (client: Omit<Client, 'id'>) => Promise<any>;
  onUpdateClient: (client: Client) => Promise<any>;
  isSynced: boolean;
}

export default function Home({ clients, onSelectClient, onAddClient, onUpdateClient, isSynced }: HomeProps) {
  const [showHelp, setShowHelp] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Client Directory</h2>
        {isSynced && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100">
            <Database className="w-3.5 h-3.5" />
            Synced with Google Sheet
            <a href={MASTER_BACKEND_SHEET_URL} target="_blank" rel="noreferrer" className="hover:text-emerald-900">
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-neutral-900 text-white p-6 rounded-2xl relative">
              <button 
                onClick={() => setShowHelp(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
              <div className="flex gap-4">
                <div className="bg-white/10 p-2 rounded-lg h-fit">
                  <Info className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Welcome! To get started:</h3>
                  <ol className="text-neutral-300 space-y-1 list-decimal list-inside text-sm">
                    <li>Click a client card below to manage their configuration.</li>
                    <li>Configure their Google Sheet, Offer Letter Doc, and Apps Script.</li>
                    <li>Once configured, you can upload candidates and send offer emails.</li>
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <motion.div
            key={client.id}
            layoutId={client.id}
            className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col group relative"
          >
            <button 
              onClick={(e) => { e.stopPropagation(); setEditingClient(client); }}
              className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur border border-neutral-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-100 z-10 text-neutral-500 hover:text-neutral-900 shadow-sm"
              title="Edit Client Details"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <div className="flex justify-between items-start mb-4">
              <div className="bg-neutral-100 p-3 rounded-xl group-hover:bg-neutral-900 group-hover:text-white transition-colors flex items-center justify-center w-12 h-12">
                {client.companyLogoUrl ? (
                  <img src={client.companyLogoUrl} alt={client.name} className="max-w-full max-h-full object-contain" />
                ) : (
                  <Building2 className="w-6 h-6" />
                )}
              </div>
              <div className="flex flex-col items-end gap-2 pr-10">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${client.active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                  {client.active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs font-mono text-neutral-400">{client.shortCode}</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2 pr-8">{client.name}</h3>
            <p className="text-sm text-neutral-500 mb-6 line-clamp-2 flex-grow">
              {client.description || "No description provided."}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <StatusChip label="Sheet" status={!!client.clientSheetUrl} />
              <StatusChip label="Apps Script" status={client.appsScriptSetupStatus === 'verified'} />
              <StatusChip label="Offer Letter Doc" status={!!client.offerLetterDocTemplateId} />
            </div>

            <button
              onClick={() => onSelectClient(client.id)}
              className="w-full bg-neutral-900 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors"
            >
              Go to Client
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ))}

        <button
          onClick={() => setShowAddModal(true)}
          className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-neutral-400 hover:border-neutral-900 hover:text-neutral-900 transition-all group"
        >
          <div className="bg-neutral-50 p-4 rounded-full group-hover:bg-neutral-900 group-hover:text-white transition-colors">
            <Plus className="w-8 h-8" />
          </div>
          <span className="font-semibold">Add New Client</span>
        </button>
      </div>

      {showAddModal && (
        <AddClientModal 
          onClose={() => setShowAddModal(false)} 
          onSubmit={async (data) => {
            await onAddClient(data);
            setShowAddModal(false);
          }}
        />
      )}

      {editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onSubmit={async (data) => {
            await onUpdateClient(data);
            setEditingClient(null);
          }}
        />
      )}
    </div>
  );
}

function StatusChip({ label, status }: { label: string; status: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${status ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-50 text-neutral-400'}`}>
      {status ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {label}
    </div>
  );
}
