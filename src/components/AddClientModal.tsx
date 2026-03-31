import React, { useState } from 'react';
import { Client, MASTER_SHEET_TEMPLATE_URL } from '../types';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Building2, 
  Settings2, 
  FileSpreadsheet, 
  FileText, 
  Code2, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateAppsScriptCode, downloadSampleCSV } from '../utils';

interface AddClientModalProps {
  onClose: () => void;
  onSubmit: (client: Omit<Client, 'id'>) => Promise<void>;
}

export default function AddClientModal({ onClose, onSubmit }: AddClientModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    shortCode: '',
    description: '',
    active: true,
    ccEmail: '',
    officeLocationLink: '',
    confirmationFormLink: '',
    whatsAppNumber: '',
    companyTeamName: '',
    clientSheetUrl: '',
    clientSheetOwnerEmail: '',
    offerLetterDocTemplateId: '',
    appsScriptCode: '',
    appsScriptWebAppUrl: '',
    appsScriptSetupStatus: 'not_configured',
    editorAccessEmail: 'automation-service@hr-agency.iam.gserviceaccount.com',
    notes: ''
  });

  const updateForm = (updates: Partial<Client>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (step === 4) {
      const code = generateAppsScriptCode(formData as Client);
      updateForm({ appsScriptCode: code, appsScriptSetupStatus: 'code_generated' });
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    await onSubmit(formData as Client);
  };

  const steps = [
    { title: 'Basic Info', icon: Building2 },
    { title: 'Email Config', icon: Settings2 },
    { title: 'Google Sheet', icon: FileSpreadsheet },
    { title: 'Doc Template', icon: FileText },
    { title: 'Apps Script', icon: Code2 },
    { title: 'Verify', icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Add New Client</h2>
            <div className="flex items-center gap-1">
              {steps.map((s, i) => (
                <div 
                  key={i}
                  className={`h-1.5 w-8 rounded-full transition-colors ${i + 1 <= step ? 'bg-neutral-900' : 'bg-neutral-200'}`}
                />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
              className="space-y-8"
            >
              {step === 1 && (
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Client Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => updateForm({ name: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="e.g. Skill Dunia"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Short Code</label>
                      <input 
                        type="text" 
                        value={formData.shortCode}
                        onChange={e => updateForm({ shortCode: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                        placeholder="e.g. SD"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Description</label>
                      <input 
                        type="text" 
                        value={formData.description}
                        onChange={e => updateForm({ description: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                        placeholder="Short description..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Office Location Link</label>
                    <input 
                      type="text" 
                      value={formData.officeLocationLink}
                      onChange={e => updateForm({ officeLocationLink: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Confirmation Form Link</label>
                    <input 
                      type="text" 
                      value={formData.confirmationFormLink}
                      onChange={e => updateForm({ confirmationFormLink: e.target.value })}
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
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Company Team Name</label>
                    <input 
                      type="text" 
                      value={formData.companyTeamName}
                      onChange={e => updateForm({ companyTeamName: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="e.g. Skill Dunia team"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Company Logo URL (Optional)</label>
                    <input 
                      type="url" 
                      value={formData.companyLogoUrl || ''}
                      onChange={e => updateForm({ companyLogoUrl: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-neutral-50 p-6 rounded-2xl space-y-4">
                    <h4 className="font-bold text-sm">Instructions:</h4>
                    <ul className="text-sm text-neutral-600 space-y-2">
                      <li className="flex gap-2"><ChevronRight className="w-4 h-4 mt-0.5" /> <span>Open the <a href={MASTER_SHEET_TEMPLATE_URL} target="_blank" rel="noreferrer" className="underline font-bold inline-flex items-center gap-1">Master Sheet template <ExternalLink className="w-3 h-3" /></a></span></li>
                      <li className="flex gap-2"><ChevronRight className="w-4 h-4 mt-0.5" /> <span>Make a copy using the client's Workspace email.</span></li>
                      <li className="flex gap-2"><ChevronRight className="w-4 h-4 mt-0.5" /> <span>Paste the URL below.</span></li>
                    </ul>
                    <button 
                      onClick={downloadSampleCSV}
                      className="text-[10px] font-bold text-neutral-500 hover:text-neutral-900 underline uppercase tracking-wider"
                    >
                      Download Sample CSV Template
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Client Sheet URL</label>
                    <input 
                      type="text" 
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
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Offer Letter Doc Template ID</label>
                    <input 
                      type="text" 
                      value={formData.offerLetterDocTemplateId}
                      onChange={e => updateForm({ offerLetterDocTemplateId: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                      placeholder="The long ID from the Doc URL"
                    />
                  </div>
                  <div className="bg-blue-50 p-6 rounded-2xl">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">Ensure your Doc contains these placeholders:</p>
                    <div className="flex flex-wrap gap-2">
                      {['date', 'olnumber', 'fullname', 'title', 'tenure', 'onboarding', 'ojtstart', 'ojtend', 'stipend', 'incentives', 'target'].map(p => (
                        <code key={p} className="bg-white px-2 py-1 rounded border border-blue-100 text-[10px] font-mono text-blue-600">{"{{"}{p}{"}}"}</code>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <div className="bg-neutral-900 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-white font-bold">Generated Apps Script Code</h4>
                      <button 
                        onClick={() => navigator.clipboard.writeText(formData.appsScriptCode || '')}
                        className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-white"
                      >
                        Copy Code
                      </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto bg-black/20 rounded-xl p-4">
                      <pre className="text-[10px] text-neutral-400 font-mono">{formData.appsScriptCode}</pre>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Paste Web App URL after deployment</label>
                      <input 
                        type="text" 
                        value={formData.appsScriptWebAppUrl}
                        onChange={e => updateForm({ appsScriptWebAppUrl: e.target.value, appsScriptSetupStatus: 'url_saved' })}
                        className="w-full px-4 py-3 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-neutral-900"
                        placeholder="https://script.google.com/macros/s/..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="flex flex-col items-center justify-center py-12 space-y-6">
                  <div className="bg-emerald-100 text-emerald-700 p-6 rounded-full">
                    <CheckCircle2 className="w-16 h-16" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">Ready to Verify</h3>
                    <p className="text-neutral-500 max-w-sm mx-auto">Make sure you've shared Editor access with <strong>{formData.editorAccessEmail}</strong> before finishing.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-100 flex justify-between bg-neutral-50/50">
          <button 
            onClick={step === 1 ? onClose : handleBack}
            className="px-6 py-3 rounded-2xl font-bold text-neutral-600 hover:bg-neutral-200 transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button 
            onClick={step === 6 ? handleSubmit : handleNext}
            className="px-8 py-3 rounded-2xl font-bold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors flex items-center gap-2"
          >
            {step === 6 ? 'Finish & Save' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
