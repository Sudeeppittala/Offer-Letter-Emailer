export interface Client {
  id: string;
  name: string;
  shortCode: string;
  description: string;
  active: boolean;
  clientSheetUrl: string;
  clientSheetOwnerEmail: string;
  offerLetterDocTemplateId: string;
  offerLetterDocUrl?: string;
  appsScriptCode: string;
  appsScriptWebAppUrl: string;
  appsScriptSetupStatus: 'not_configured' | 'code_generated' | 'url_saved' | 'verified';
  editorAccessEmail: string;
  notes: string;
  // Email variables
  ccEmail: string;
  officeLocationLink: string;
  confirmationFormLink: string;
  whatsAppNumber: string;
  companyTeamName: string;
  companyLogoUrl?: string;
}

export interface Campaign {
  id: string;
  clientId: string;
  name: string;
  status: 'draft' | 'sending' | 'completed';
  scheduleMode: 'immediate' | 'delayed';
  createdAt: string;
}

export interface Recipient {
  id: string;
  campaignId: string;
  clientId: string;
  email: string;
  variables: Record<string, string>;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  errorMessage?: string;
}

export interface SendLog {
  id: string;
  campaignId: string;
  candidateName: string;
  email: string;
  role: string;
  sentAt: string;
  senderEmail: string;
  status: 'sent' | 'failed';
  errorMessage?: string;
}

export const MASTER_SHEET_TEMPLATE_URL = "https://docs.google.com/spreadsheets/d/11pYHHpTgOAJU-gjq7H88Tib4PpYzmr1HOAM2jM9AlYc/edit?pli=1&gid=0#gid=0";
