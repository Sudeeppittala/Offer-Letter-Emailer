import React, { useState } from 'react';
import { MASTER_BACKEND_SHEET_URL } from '../types';
import { generateMasterBackendAppsScriptCode } from '../utils';
import { 
  Database, 
  ExternalLink, 
  Copy, 
  Check, 
  ChevronRight, 
  AlertCircle,
  RefreshCw,
  Settings
} from 'lucide-react';
import { motion } from 'motion/react';

interface BackendSetupProps {
  onConfigured: (url: string) => void;
  currentUrl?: string;
}

export default function BackendSetup({ onConfigured, currentUrl }: BackendSetupProps) {
  const [url, setUrl] = useState(currentUrl || '');
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const code = generateMasterBackendAppsScriptCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!url) return;
    setTesting(true);
    try {
      // Test the URL
      const res = await fetch(`${url}?action=getClients`);
      if (res.ok) {
        onConfigured(url);
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      alert("Could not verify the Backend Web App URL. Ensure: (1) You deployed as 'Anyone'. (2) You authorized permissions. (3) The URL is correct.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="bg-neutral-900 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <Database className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Master Backend Setup</h2>
        <p className="text-neutral-500">Connect your Google Sheet to use it as the primary database for all client data.</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-8 space-y-10">
          {/* Step 1 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center font-bold text-neutral-900">1</div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold">Open Master Backend Sheet</h3>
              <p className="text-sm text-neutral-500">Open the sheet you provided to use as the backend.</p>
              <a 
                href={MASTER_BACKEND_SHEET_URL} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-neutral-900 font-bold underline hover:text-neutral-600 transition-colors"
              >
                Open Master Backend Sheet <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center font-bold text-neutral-900">2</div>
            <div className="space-y-4 flex-grow">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Deploy Backend Script</h3>
                <button 
                  onClick={handleCopy}
                  className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-neutral-100 px-3 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy Backend Script'}
                </button>
              </div>
              <div className="bg-neutral-900 rounded-2xl p-4 max-h-40 overflow-y-auto border border-white/10">
                <pre className="text-[10px] text-neutral-400 font-mono leading-relaxed">{code}</pre>
              </div>
              <div className="bg-neutral-50 p-4 rounded-xl text-xs space-y-2 text-neutral-600">
                <p className="font-bold uppercase tracking-wider text-neutral-400">Instructions:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>In the Sheet, go to <strong>Extensions → Apps Script</strong>.</li>
                  <li>Paste the code above and click <strong>Save</strong>.</li>
                  <li>Click <strong>Deploy → New deployment</strong>.</li>
                  <li>Select <strong>Web app</strong>, Execute as <strong>Me</strong>, Access <strong>Anyone</strong>.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center font-bold text-neutral-900">3</div>
            <div className="space-y-4 flex-grow">
              <h3 className="text-lg font-bold">Connect Web App URL</h3>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Backend Web App URL</label>
                <input 
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/..."
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                />
              </div>
              <button 
                onClick={handleSave}
                disabled={!url || testing}
                className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-lg"
              >
                {testing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Settings className="w-5 h-5" />}
                Verify & Connect Backend
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex gap-4">
        <div className="bg-amber-100 text-amber-700 p-2 rounded-xl h-fit">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-amber-900">Why use a Sheet backend?</h4>
          <p className="text-sm text-amber-800">This ensures your client list and configurations are stored in your own Google Sheet, allowing for easy auditing and manual updates outside the app.</p>
        </div>
      </div>
    </div>
  );
}
