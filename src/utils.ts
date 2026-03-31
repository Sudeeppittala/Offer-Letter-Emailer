import { Client } from "./types";

export function generateAppsScriptCode(client: Client): string {
  return `/**
 * OfferMail Communicator - Automation Script for ${client.name}
 * Generated on ${new Date().toLocaleDateString()}
 */

const CONFIG = {
  TEMPLATE_DOC_ID: "${client.offerLetterDocTemplateId}",
  SHEET_NAME: "OL_Letter",
  CC_EMAIL: "${client.ccEmail}",
  OFFICE_LOCATION: "${client.officeLocationLink}",
  CONFIRMATION_FORM: "${client.confirmationFormLink}",
  WHATSAPP: "${client.whatsAppNumber}",
  TEAM_NAME: "${client.companyTeamName}",
  COMPANY_LOGO_URL: "${client.companyLogoUrl || ''}"
};

function doGet(e) {
  return ContentService.createTextOutput("OfferMail Communicator Web App is active for ${client.name}.");
}

function sendMail() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    throw new Error("Sheet '" + CONFIG.SHEET_NAME + "' not found. Please ensure your sheet has a tab named 'OL_Letter'.");
  }

  const data = sheet.getDataRange().getValues();
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = row[12]; // Col 13 (index 12)

    if (status === "Send") {
      const fullname = row[0];
      const email = row[1];
      const tenure = row[2];
      const title = row[3];
      const onboarding = row[4];
      const ojtstart = row[5];
      const ojtend = row[6];
      const stipend = row[7];
      const incentives = row[8];
      const target = row[9];
      const date = row[10];
      const olnumber = row[11];

      try {
        processCandidate({
          fullname, email, tenure, title, onboarding, 
          ojtstart, ojtend, stipend, incentives, target, date, olnumber
        });
        
        // Mark as Sent
        sheet.getRange(i + 1, 13).setValue("Sent");
        Logger.log("Sent offer letter to: " + fullname);
      } catch (err) {
        Logger.log("Error processing " + fullname + ": " + err.toString());
      }
    }
  }
}

function processCandidate(vars) {
  const templateFile = DriveApp.getFileById(CONFIG.TEMPLATE_DOC_ID);
  const newDocFile = templateFile.makeCopy("Offer Letter - " + vars.fullname);
  const newDocId = newDocFile.getId();
  const doc = DocumentApp.openById(newDocId);
  const body = doc.getBody();

  // Replace placeholders
  const placeholders = {
    "{{fullname}}": vars.fullname,
    "{{title}}": vars.title,
    "{{tenure}}": vars.tenure,
    "{{onboarding}}": vars.onboarding,
    "{{ojtstart}}": vars.ojtstart,
    "{{ojtend}}": vars.ojtend,
    "{{stipend}}": vars.stipend,
    "{{incentives}}": vars.incentives,
    "{{target}}": vars.target,
    "{{date}}": vars.date,
    "{{olnumber}}": vars.olnumber
  };

  for (let key in placeholders) {
    body.replaceText(key, placeholders[key] || "");
  }

  doc.saveAndClose();

  // Convert to PDF
  const pdf = newDocFile.getAs(MimeType.PDF);

  // Send Email
  const logoHtml = CONFIG.COMPANY_LOGO_URL ? \`<img src="\${CONFIG.COMPANY_LOGO_URL}" alt="\${CONFIG.TEAM_NAME} Logo" style="max-height: 50px; margin-bottom: 20px;" />\` : '';

  const htmlBody = \`
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; line-height: 1.6;">
      <div style="text-align: center; padding: 20px 0;">
        \${logoHtml}
        <h2 style="color: #111; margin: 0;">Offer of Employment</h2>
      </div>
      <p>Hi <strong>\${vars.fullname}</strong>,</p>
      <p>Congratulations on being selected to be a part of the <strong>\${CONFIG.TEAM_NAME}</strong> team for the role of <strong>\${vars.title}</strong>.</p>
      <p>Kindly find your offer letter attached below.</p>
      <p>We request you to bring a signed copy of this letter on your date of joining: <strong>\${vars.onboarding}</strong>. Please report to the office by 11:00 AM.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #555;">Next Steps:</h4>
        <ul style="margin-bottom: 0; padding-left: 20px;">
          <li><a href="\${CONFIG.OFFICE_LOCATION}" style="color: #0066cc; text-decoration: none;">Find our office location here</a></li>
          <li><a href="\${CONFIG.CONFIRMATION_FORM}" style="color: #0066cc; text-decoration: none;">Fill this Google form to confirm your joining</a></li>
        </ul>
      </div>

      <p>Also bring along a scanned copy of your academic transcripts, 2 passport size photographs, and your original PAN card / Aadhar card for verification.</p>
      <p>If you have any queries, WhatsApp us on <strong>\${CONFIG.WHATSAPP}</strong>.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
        <p>Best Regards,<br>The \${CONFIG.TEAM_NAME} Team</p>
      </div>
    </div>
  \`;

  MailApp.sendEmail({
    to: vars.email,
    cc: CONFIG.CC_EMAIL,
    subject: vars.title + " Offer Letter - " + vars.fullname,
    htmlBody: htmlBody,
    attachments: [pdf]
  });

  // Optional: Delete the temporary Doc copy to save space
  // DriveApp.getFileById(newDocId).setTrashed(true);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  if (data.action === "logEmail") {
    return logEmailToSheet(data);
  } else if (data.action === "sendEmail") {
    try {
      processCandidate(data.variables);
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
    }
  }
}

function logEmailToSheet(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Email Log");
  if (!sheet) {
    sheet = ss.insertSheet("Email Log");
    sheet.appendRow(["Candidate Name", "Email", "Role", "Sent At", "Sender Email", "Status", "Error"]);
    sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#f3f3f3");
  }
  sheet.appendRow([
    data.candidateName,
    data.email,
    data.role,
    data.sentAt,
    data.senderEmail,
    data.status,
    data.errorMessage || ""
  ]);
  return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
}
`;
}

export function downloadSampleCSV() {
  const headers = [
    "fullname", "email", "tenure", "title", "onboarding", 
    "ojtstart", "ojtend", "stipend", "incentives", "target", 
    "date", "olnumber", "status"
  ];
  const sampleRow = [
    "John Doe", "john.doe@example.com", "12 Months", "Software Engineer", "2026-04-01",
    "2026-04-01", "2026-05-01", "25000", "5000", "100000",
    "2026-03-23", "OL-SD-2026-001", "Send"
  ];
  
  const csvContent = [headers.join(","), sampleRow.join(",")].join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "offer_letter_template.csv");
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateMasterBackendAppsScriptCode(): string {
  return `/**
 * OfferMail Communicator - Master Backend Script
 * This script allows the app to use this Google Sheet as a database.
 */

const SHEET_NAME = "Clients";

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["id", "data"]);
  }

  if (action === "getClients") {
    const values = sheet.getDataRange().getValues();
    const clients = [];
    for (let i = 1; i < values.length; i++) {
      try {
        if (values[i][1]) clients.push(JSON.parse(values[i][1]));
      } catch (e) {}
    }
    return ContentService.createTextOutput(JSON.stringify(clients))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput("Master Backend is active.");
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["id", "data"]);
  }

  if (data.action === "saveClient") {
    const client = data.client;
    const values = sheet.getDataRange().getValues();
    let foundRow = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] == client.id) {
        foundRow = i + 1;
        break;
      }
    }
    
    const clientData = JSON.stringify(client);
    if (foundRow !== -1) {
      sheet.getRange(foundRow, 2).setValue(clientData);
    } else {
      sheet.appendRow([client.id, clientData]);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;
}
