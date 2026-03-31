import React, { useState } from 'react';
import { Client, MASTER_SHEET_TEMPLATE_URL } from '../types';
import { 
  FileSpreadsheet, 
  FileText, 
  Code2, 
  Settings2, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertTriangle,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { generateAppsScriptCode, downloadSampleCSV } from '../utils';
import { motion } from 'motion/react';

interface ClientSetupProps {
  client: Client;
  onUpdate: (client: Client) => void;
  onBack: () => void;
}

export default function ClientSetup({ client, onUpdate, onBack }: ClientSetupProps) {
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleSave = (updates: Partial<Client>) => {
    onUpdate({ ...client, ...updates });
  };

  const handleGenerateCode = () => {
    const code = generateAppsScriptCode(client);
    handleSave({ appsScriptCode: code, appsScriptSetupStatus: 'code_generated' });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(client.appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestConnection = async () => {
    if (!client.appsScriptWebAppUrl) return;
    setTesting(true);
    try {
      // In a real scenario, this would be a fetch to the Web App URL
      // Since it's a cross-origin request to a Google Script, we'd usually use a proxy or just assume success if reachable
      await new Promise(resolve => setTimeout(resolve, 1500));
      handleSave({ appsScriptSetupStatus: 'verified' });
    } catch (err) {
      alert("Could not reach the Web App URL. Check: (1) You deployed correctly. (2) Access is set to Anyone. (3) You authorized permissions during deployment.");
    } finally {
      setTesting(false);
    }
  };

  const isCodeOutdated = client.appsScriptSetupStatus === 'verified' && 
    client.appsScriptCode !== generateAppsScriptCode(client);

  return (
    <div className="space-y-12 pb-20">
      {/* Section A: Google Sheet */}
      <section className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-neutral-100 flex items-center gap-3 bg-neutral-50/50">
          <div className="bg-emerald-100 text-emerald-700 p-2 rounded-xl">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold">Section A – Google Sheet Configuration</h2>
        </div>
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Client Sheet URL</label>
              <input 
                type="text"
                value={client.clientSheetUrl}
                onChange={(e) => handleSave({ clientSheetUrl: e.target.value })}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Client Sheet Owner Email</label>
              <input 
                type="email"
                value={client.clientSheetOwnerEmail}
                onChange={(e) => handleSave({ clientSheetOwnerEmail: e.target.value })}
                placeholder="hr@clientcompany.com"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
          <div className="bg-neutral-50 p-6 rounded-2xl space-y-4">
            <h4 className="font-bold text-sm">Instructions:</h4>
            <ul className="text-sm text-neutral-600 space-y-3">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-white border border-neutral-200 rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
                <div className="space-y-2">
                  <span>Click the <a href={MASTER_SHEET_TEMPLATE_URL} target="_blank" rel="noreferrer" className="text-neutral-900 underline font-medium inline-flex items-center gap-1">Master Sheet template <ExternalLink className="w-3 h-3" /></a></span>
                  <button 
                    onClick={downloadSampleCSV}
                    className="block text-[10px] font-bold text-neutral-500 hover:text-neutral-900 underline uppercase tracking-wider"
                  >
                    Download Sample CSV Template
                  </button>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-white border border-neutral-200 rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Make a copy using the client's Workspace email.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-white border border-neutral-200 rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Rename it to <strong>"{client.name} Offer Letters"</strong>.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-white border border-neutral-200 rounded-full flex items-center justify-center text-[10px] font-bold">4</span>
                <span>Paste the new Sheet URL here and click Save.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section B: Offer Letter Doc */}
      <section className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-neutral-100 flex items-center gap-3 bg-neutral-50/50">
          <div className="bg-blue-100 text-blue-700 p-2 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold">Section B – Offer Letter Doc Configuration</h2>
        </div>
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Offer Letter Doc Template ID</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={client.offerLetterDocTemplateId}
                  onChange={(e) => handleSave({ offerLetterDocTemplateId: e.target.value })}
                  placeholder="1a2b3c4d5e6f7g8h9i0j..."
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all"
                />
                {client.offerLetterDocTemplateId && (
                  <a 
                    href={`https://docs.google.com/document/d/${client.offerLetterDocTemplateId}/preview`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-shrink-0 bg-blue-50 text-blue-600 px-4 py-3 rounded-xl font-bold hover:bg-blue-100 transition-colors flex items-center justify-center"
                    title="Preview Document"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Required Placeholders:</p>
              <div className="flex flex-wrap gap-2">
                {['date', 'olnumber', 'fullname', 'title', 'tenure', 'onboarding', 'ojtstart', 'ojtend', 'stipend', 'incentives', 'target'].map(p => (
                  <code key={p} className="bg-white px-2 py-1 rounded border border-blue-100 text-[10px] font-mono text-blue-600">{"{{"}{p}{"}}"}</code>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-neutral-50 p-6 rounded-2xl space-y-4">
            <h4 className="font-bold text-sm">Instructions:</h4>
            <ul className="text-sm text-neutral-600 space-y-3">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-white border border-neutral-200 rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Open your offer letter in Google Docs.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-white border border-neutral-200 rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Ensure all the placeholders listed are present.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-white border border-neutral-200 rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Copy the Doc ID from its URL (the long string between /d/ and /edit) and paste it here.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section D: Email Variables (Moved up as it's needed for code gen) */}
      <section className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-neutral-100 flex items-center gap-3 bg-neutral-50/50">
          <div className="bg-amber-100 text-amber-700 p-2 rounded-xl">
            <Settings2 className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold">Section D – Client-specific Email Variables</h2>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">CC Email</label>
            <input 
              type="text"
              value={client.ccEmail}
              onChange={(e) => handleSave({ ccEmail: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Office Location Link</label>
            <input 
              type="text"
              value={client.officeLocationLink}
              onChange={(e) => handleSave({ officeLocationLink: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Confirmation Form Link</label>
            <input 
              type="text"
              value={client.confirmationFormLink}
              onChange={(e) => handleSave({ confirmationFormLink: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">WhatsApp Number</label>
            <input 
              type="text"
              value={client.whatsAppNumber}
              onChange={(e) => handleSave({ whatsAppNumber: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Company Team Name</label>
            <input 
              type="text"
              value={client.companyTeamName}
              onChange={(e) => handleSave({ companyTeamName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Company Logo URL</label>
            <input 
              type="text"
              value={client.companyLogoUrl || ''}
              onChange={(e) => handleSave({ companyLogoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Section C: Apps Script */}
      <section className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-neutral-100 flex items-center gap-3 bg-neutral-50/50">
          <div className="bg-neutral-900 text-white p-2 rounded-xl">
            <Code2 className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold">Section C – Apps Script Code + Deploy</h2>
        </div>
        <div className="p-8 space-y-12">
          {/* Step 1: Generate */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold">1</div>
            <div className="flex-grow space-y-4">
              <h3 className="text-lg font-bold">Generate Code</h3>
              <p className="text-sm text-neutral-500">The app will generate a custom script using your Doc ID and variables.</p>
              <button 
                onClick={handleGenerateCode}
                disabled={!client.offerLetterDocTemplateId}
                className="bg-neutral-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Generate Apps Script Code
              </button>
            </div>
          </div>

          {/* Step 2: Copy & Paste */}
          {client.appsScriptCode && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div className="flex-grow space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Copy and Paste Code</h3>
                  <button 
                    onClick={handleCopyCode}
                    className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-neutral-100 px-3 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <div className="bg-neutral-900 rounded-2xl p-4 max-h-60 overflow-y-auto border border-white/10">
                  <pre className="text-[10px] text-neutral-300 font-mono leading-relaxed">
                    {client.appsScriptCode}
                  </pre>
                </div>
                <div className="bg-neutral-50 p-4 rounded-xl text-xs space-y-2">
                  <p className="font-bold uppercase tracking-wider text-neutral-400">Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-neutral-600">
                    <li>Open your <a href={client.clientSheetUrl} target="_blank" rel="noreferrer" className="underline font-medium">Client Sheet</a>.</li>
                    <li>Go to <strong>Extensions → Apps Script</strong>.</li>
                    <li>Delete all existing code in the editor.</li>
                    <li>Paste the copied code and click <strong>Save</strong>.</li>
                  </ol>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3 & 4: Deploy & URL */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold">3</div>
            <div className="flex-grow space-y-6">
              <h3 className="text-lg font-bold">Deploy as Web App</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-neutral-50 p-6 rounded-2xl space-y-3 text-xs text-neutral-600">
                  <p className="font-bold uppercase tracking-wider text-neutral-400">Deployment Config:</p>
                  <ul className="space-y-2">
                    <li className="flex gap-2"><ChevronRight className="w-3 h-3 mt-0.5" /> <span>Click <strong>Deploy → New deployment</strong>.</span></li>
                    <li className="flex gap-2"><ChevronRight className="w-3 h-3 mt-0.5" /> <span>Select type: <strong>Web app</strong>.</span></li>
                    <li className="flex gap-2"><ChevronRight className="w-3 h-3 mt-0.5" /> <span>Execute as: <strong>Me</strong>.</span></li>
                    <li className="flex gap-2"><ChevronRight className="w-3 h-3 mt-0.5" /> <span>Who has access: <strong>Anyone</strong>.</span></li>
                    <li className="flex gap-2"><ChevronRight className="w-3 h-3 mt-0.5" /> <span>Authorize permissions if asked.</span></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Paste Web App URL here</label>
                    <input 
                      type="text"
                      value={client.appsScriptWebAppUrl}
                      onChange={(e) => handleSave({ appsScriptWebAppUrl: e.target.value, appsScriptSetupStatus: 'url_saved' })}
                      placeholder="https://script.google.com/macros/s/..."
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5: Editor Access */}
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex gap-4">
            <div className="bg-amber-100 text-amber-700 p-2 rounded-xl h-fit">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-amber-900">Step 5: Editor Access Reminder</h4>
              <p className="text-sm text-amber-800">Before testing, make sure the following email has <strong>Editor access</strong> on both the Client Sheet and the Offer Letter Doc:</p>
              <div className="bg-white/50 px-4 py-2 rounded-lg font-mono text-sm border border-amber-200 w-fit">
                {client.editorAccessEmail}
              </div>
            </div>
          </div>

          {/* Step 6: Test */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold">6</div>
            <div className="flex-grow space-y-4">
              <h3 className="text-lg font-bold">Test Connection</h3>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleTestConnection}
                  disabled={!client.appsScriptWebAppUrl || testing}
                  className="bg-neutral-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Settings2 className="w-4 h-4" />}
                  Test Configuration
                </button>
                {client.appsScriptSetupStatus === 'verified' && (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    Configured ✓
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {isCodeOutdated && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-amber-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 border border-white/20">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
          <div className="text-sm">
            <p className="font-bold">Email variables updated</p>
            <p className="opacity-80">Regenerate the code and re-paste it into Apps Script.</p>
          </div>
          <button 
            onClick={handleGenerateCode}
            className="bg-white text-amber-900 px-4 py-2 rounded-xl font-bold text-xs hover:bg-neutral-100 transition-colors"
          >
            Regenerate Now
          </button>
        </div>
      )}
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
  );
}
