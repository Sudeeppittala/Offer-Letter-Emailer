import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save } from 'lucide-react';
import { Client } from '../types';

interface EditClientModalProps {
  client: Client;
  onClose: () => void;
  onSubmit: (updatedClient: Client) => Promise<void>;
}

export function EditClientModal({ client, onClose, onSubmit }: EditClientModalProps) {
  const [formData, setFormData] = useState<Client>(client);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = (updates: Partial<Client>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
          <div>
            <h2 className="text-xl font-bold">Edit Client Details</h2>
            <p className="text-sm text-neutral-500">Update information for {client.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Company Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => updateForm({ name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Short Code</label>
                <input 
                  type="text" 
                  value={formData.shortCode}
                  onChange={e => updateForm({ shortCode: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                  maxLength={4}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Description</label>
                <input 
                  type="text" 
                  value={formData.description}
                  onChange={e => updateForm({ description: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Company Logo URL</label>
                <input 
                  type="url" 
                  value={formData.companyLogoUrl || ''}
                  onChange={e => updateForm({ companyLogoUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="space-y-2 md:col-span-2 flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="active-status"
                  checked={formData.active}
                  onChange={e => updateForm({ active: e.target.checked })}
                  className="w-5 h-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
                <label htmlFor="active-status" className="text-sm font-bold text-neutral-700 cursor-pointer">Active Client</label>
              </div>
            </div>
          </section>

          {/* Email Configuration */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b pb-2">Email Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Company Team Name</label>
                <input 
                  type="text" 
                  value={formData.companyTeamName}
                  onChange={e => updateForm({ companyTeamName: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">CC Email</label>
                <input 
                  type="email" 
                  value={formData.ccEmail}
                  onChange={e => updateForm({ ccEmail: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">WhatsApp Number</label>
                <input 
                  type="text" 
                  value={formData.whatsAppNumber}
                  onChange={e => updateForm({ whatsAppNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Office Location Link</label>
                <input 
                  type="url" 
                  value={formData.officeLocationLink}
                  onChange={e => updateForm({ officeLocationLink: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Confirmation Form Link</label>
                <input 
                  type="url" 
                  value={formData.confirmationFormLink}
                  onChange={e => updateForm({ confirmationFormLink: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>
          </section>

          {/* Backend Configuration */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b pb-2">Backend Setup Links</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Client Sheet URL</label>
                <input 
                  type="url" 
                  value={formData.clientSheetUrl}
                  onChange={e => updateForm({ clientSheetUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Client Sheet Owner Email</label>
                <input 
                  type="email" 
                  value={formData.clientSheetOwnerEmail}
                  onChange={e => updateForm({ clientSheetOwnerEmail: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Offer Letter Doc Template ID</label>
                <input 
                  type="text" 
                  value={formData.offerLetterDocTemplateId}
                  onChange={e => updateForm({ offerLetterDocTemplateId: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Apps Script Web App URL</label>
                <input 
                  type="url" 
                  value={formData.appsScriptWebAppUrl}
                  onChange={e => updateForm({ appsScriptWebAppUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Editor Access Email</label>
                <input 
                  type="email" 
                  value={formData.editorAccessEmail}
                  onChange={e => updateForm({ editorAccessEmail: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-neutral-100 flex justify-end gap-3 bg-neutral-50/50">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-2xl font-bold text-neutral-600 hover:bg-neutral-200 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 rounded-2xl font-bold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
