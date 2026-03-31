import React, { useState, useEffect } from 'react';
import { Client, Campaign, Recipient, SendLog } from '../types';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  Send, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Trash2,
  MoreHorizontal,
  ChevronRight,
  Download,
  XCircle,
  ListRestart,
  History,
  CheckSquare,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { downloadSampleCSV } from '../utils';

interface CampaignsProps {
  client: Client;
}

export default function Campaigns({ client }: CampaignsProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState<'all' | 'single' | 'delayed' | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [previewRecipient, setPreviewRecipient] = useState<Recipient | null>(null);
  const [sendLogs, setSendLogs] = useState<SendLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/sendLogs/c1');
      if (res.ok) {
        const data = await res.json();
        setSendLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const clearLogs = async () => {
    try {
      const res = await fetch('/api/sendLogs/c1', { method: 'DELETE' });
      if (res.ok) {
        setSendLogs([]);
      }
    } catch (err) {
      console.error("Failed to clear logs", err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();

    if (fileExt === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processParsedData(results.data);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          alert("Failed to parse CSV file.");
        }
      });
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        processParsedData(data);
      };
      reader.onerror = (error) => {
        console.error("Error reading Excel file:", error);
        alert("Failed to read Excel file.");
      };
      reader.readAsBinaryString(file);
    } else {
      alert("Unsupported file format. Please upload a CSV or Excel file.");
    }
  };

  const processParsedData = (data: any[]) => {
    const parsedRecipients: Recipient[] = data.map((row: any, index: number) => {
      const email = row.email || row.Email || '';
      const variables = { ...row };
      delete variables.email;
      delete variables.Email;

      return {
        id: `${Date.now()}-${index}`,
        campaignId: 'c1',
        clientId: client.id,
        email: email,
        variables: variables,
        status: 'pending' as const
      };
    }).filter((r: Recipient) => r.email); // Only keep rows with an email

    setRecipients(parsedRecipients);
    setSelectedRecipientIds(new Set(parsedRecipients.map((r: Recipient) => r.id)));
  };

  const toggleRecipientSelection = (id: string) => {
    const newSelection = new Set(selectedRecipientIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRecipientIds(newSelection);
  };

  const toggleAllSelection = () => {
    if (selectedRecipientIds.size === recipients.length) {
      setSelectedRecipientIds(new Set());
    } else {
      setSelectedRecipientIds(new Set(recipients.map(r => r.id)));
    }
  };

  const handleSend = async () => {
    const recipientsToSend = recipients.filter(r => selectedRecipientIds.has(r.id) && r.status !== 'sent');
    if (recipientsToSend.length === 0) return;

    const now = new Date().toISOString();
    
    // Update local state
    const newRecipients = recipients.map(r => 
      selectedRecipientIds.has(r.id) && r.status !== 'sent' 
        ? { ...r, status: 'sent' as const, sentAt: now } 
        : r
    );
    setRecipients(newRecipients);
    
    // Create logs
    for (const r of recipientsToSend) {
      const logData = {
        campaignId: 'c1',
        candidateName: r.variables.fullname || r.variables.name || 'Unknown',
        email: r.email,
        role: r.variables.title || r.variables.role || 'Unknown',
        sentAt: now,
        senderEmail: client.clientSheetOwnerEmail,
        status: 'sent' as const
      };
      
      // 1. Save to in-app log
      try {
        const res = await fetch('/api/sendLogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData)
        });
        if (res.ok) {
          const savedLog = await res.json();
          setSendLogs(prev => [savedLog, ...prev]);
        }
      } catch (err) {
        console.error("Failed to save log", err);
      }

      // 2. Send Email via Client Google Sheet Web App
      if (client.appsScriptWebAppUrl) {
        try {
          // Use no-cors or handle it carefully. Apps Script usually requires a redirect.
          await fetch(client.appsScriptWebAppUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'sendEmail',
              variables: {
                ...r.variables,
                email: r.email
              }
            })
          });
          
          // Also log it
          await fetch(client.appsScriptWebAppUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'logEmail',
              ...logData
            })
          });
          
          setToast({ message: 'Email Sent & Logged ✓', type: 'success' });
          setTimeout(() => setToast(null), 3000);
        } catch (err) {
          console.error("Failed to send email or log to Google Sheet", err);
          setToast({ message: 'Failed to send email', type: 'error' });
          setTimeout(() => setToast(null), 3000);
        }
      }
    }
    
    setShowConfirm(null);
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Upload Candidates</h2>
            <p className="text-sm text-neutral-500">Accepts Excel or CSV matching the Master Sheet structure.</p>
            <button 
              onClick={downloadSampleCSV}
              className="text-xs font-bold text-neutral-400 hover:text-neutral-900 flex items-center gap-1.5 mt-2 transition-colors"
            >
              <Download className="w-3 h-3" />
              Download Sample CSV Template
            </button>
          </div>
          <label className="bg-neutral-900 text-white px-6 py-3 rounded-2xl font-bold cursor-pointer hover:bg-neutral-800 transition-colors flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Choose File
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".csv,.xlsx" />
          </label>
        </div>
      </div>

      {/* Recipients Table */}
      {recipients.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-neutral-100 p-2 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold">Recipients ({recipients.length})</h3>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowConfirm('all')}
                disabled={selectedRecipientIds.size === 0}
                className="bg-neutral-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Selected ({selectedRecipientIds.size})
              </button>
              <button 
                onClick={() => setShowConfirm('delayed')}
                disabled={selectedRecipientIds.size === 0}
                className="bg-neutral-50 text-neutral-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Delayed Send
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/50 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  <th className="px-6 py-4 w-10">
                    <button onClick={toggleAllSelection} className="text-neutral-400 hover:text-neutral-900">
                      {selectedRecipientIds.size === recipients.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recipients.map((r) => (
                  <tr key={r.id} className="group hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <button onClick={() => toggleRecipientSelection(r.id)} className="text-neutral-400 hover:text-neutral-900">
                        {selectedRecipientIds.has(r.id) ? <CheckSquare className="w-4 h-4 text-neutral-900" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{r.variables.fullname || r.variables.name || 'Unknown'}</span>
                        <span className="text-xs text-neutral-500">{r.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium bg-neutral-100 px-2 py-1 rounded-md">{r.variables.title || r.variables.role || 'Unknown'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setPreviewRecipient(r)}
                          className="p-2 hover:bg-white rounded-lg border border-neutral-200 shadow-sm transition-all"
                          title="Preview Email"
                        >
                          <Eye className="w-4 h-4 text-neutral-600" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedRecipientIds(new Set([r.id]));
                            setShowConfirm('single');
                          }}
                          className="p-2 hover:bg-white rounded-lg border border-neutral-200 shadow-sm transition-all"
                          title="Send Email"
                        >
                          <Send className="w-4 h-4 text-neutral-600" />
                        </button>
                        <button 
                          onClick={() => {
                            setRecipients(recipients.filter(rec => rec.id !== r.id));
                            const newSelection = new Set(selectedRecipientIds);
                            newSelection.delete(r.id);
                            setSelectedRecipientIds(newSelection);
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg border border-red-100 shadow-sm transition-all"
                          title="Remove Recipient"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Send Log Section */}
      <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/30">
          <div className="flex items-center gap-3">
            <div className="bg-neutral-100 p-2 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold">Send Log</h3>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">History of sent offer letters</p>
            </div>
          </div>
          <button 
            onClick={clearLogs}
            className="text-xs font-bold text-neutral-400 hover:text-red-500 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Clear Log
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Sent At</th>
                <th className="px-6 py-4">Sender</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {sendLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-400 text-sm">
                    No emails sent yet.
                  </td>
                </tr>
              ) : (
                sendLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-neutral-900">{log.candidateName}</span>
                        <span className="text-xs text-neutral-500">{log.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-neutral-600">{log.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-neutral-500">{new Date(log.sentAt).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-neutral-500">{log.senderEmail}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${log.status === 'sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {log.status === 'sent' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {log.status}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-[100]"
          >
            <div className={`px-4 py-2 rounded-xl shadow-lg border flex items-center gap-2 font-bold text-xs ${toast.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-red-500 text-white border-red-400'}`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {toast.message}
            </div>
          </motion.div>
        )}

        {previewRecipient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewRecipient(null)}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-xl shadow-sm">
                    <Eye className="w-5 h-5 text-neutral-900" />
                  </div>
                  <div>
                    <h3 className="font-bold">Email Body Preview</h3>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Recipient: {previewRecipient.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setPreviewRecipient(null)}
                  className="p-2 hover:bg-neutral-200 rounded-full transition-colors"
                >
                  <XCircle className="w-5 h-5 text-neutral-400" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto flex-grow">
                <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-inner">
                  <div 
                    className="text-sm text-neutral-800 leading-relaxed font-sans"
                    dangerouslySetInnerHTML={{
                      __html: `
                        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                          <div style="text-align: center; padding: 20px 0;">
                            ${client.companyLogoUrl ? `<img src="${client.companyLogoUrl}" alt="${client.companyTeamName} Logo" style="max-height: 50px; margin-bottom: 20px;" />` : ''}
                            <h2 style="color: #111; margin: 0;">Offer of Employment</h2>
                          </div>
                          <p>Hi <strong>${previewRecipient.variables.fullname || 'Candidate'}</strong>,</p>
                          <p>Congratulations on being selected to be a part of the <strong>${client.companyTeamName}</strong> team for the role of <strong>${previewRecipient.variables.title || 'Position'}</strong>.</p>
                          <p>Kindly find your offer letter attached below.</p>
                          <p>We request you to bring a signed copy of this letter on your date of joining: <strong>${previewRecipient.variables.onboarding || 'Date'}</strong>. Please report to the office by 11:00 AM.</p>
                          
                          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="margin-top: 0; color: #555;">Next Steps:</h4>
                            <ul style="margin-bottom: 0; padding-left: 20px;">
                              <li><a href="${client.officeLocationLink}" style="color: #0066cc; text-decoration: none;">Find our office location here</a></li>
                              <li><a href="${client.confirmationFormLink}" style="color: #0066cc; text-decoration: none;">Fill this Google form to confirm your joining</a></li>
                            </ul>
                          </div>

                          <p>Also bring along a scanned copy of your academic transcripts, 2 passport size photographs, and your original PAN card / Aadhar card for verification.</p>
                          <p>If you have any queries, WhatsApp us on <strong>${client.whatsAppNumber}</strong>.</p>
                          
                          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
                            <p>Best Regards,<br>The ${client.companyTeamName} Team</p>
                          </div>
                        </div>
                      `
                    }}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 flex justify-end">
                <button 
                  onClick={() => setPreviewRecipient(null)}
                  className="px-8 py-3 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-lg"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(null)}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="bg-neutral-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                  <Send className="w-8 h-8 text-neutral-900" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold">Confirm & Send</h3>
                  <p className="text-sm text-neutral-500">You are about to send offer letters for <strong>{client.name}</strong>.</p>
                </div>

                <div className="bg-neutral-50 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400 font-bold uppercase tracking-wider">Selected Recipients</span>
                    <span className="font-bold">{selectedRecipientIds.size}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400 font-bold uppercase tracking-wider">Sender Email</span>
                    <span className="font-bold">{client.clientSheetOwnerEmail}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400 font-bold uppercase tracking-wider">Mode</span>
                    <span className="font-bold capitalize">{showConfirm === 'delayed' ? 'Random Delay (1-3h)' : 'Immediate'}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowConfirm(null)}
                    className="flex-1 px-6 py-3 rounded-2xl font-bold text-neutral-600 hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      handleSend();
                      setShowConfirm(null);
                    }}
                    className="flex-1 px-6 py-3 rounded-2xl font-bold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                  >
                    Confirm & Send
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: Recipient['status'] }) {
  const styles = {
    pending: 'bg-neutral-100 text-neutral-500',
    sent: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700'
  };
  const icons = {
    pending: <Clock className="w-3 h-3" />,
    sent: <CheckCircle2 className="w-3 h-3" />,
    failed: <AlertCircle className="w-3 h-3" />
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${styles[status]}`}>
      {icons[status]}
      {status}
    </div>
  );
}
