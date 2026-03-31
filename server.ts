import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs-extra";
import cors from "cors";
import axios from "axios";

const DB_FILE = path.join(process.cwd(), "db.json");
const CONFIG_FILE = path.join(process.cwd(), "config.json");

async function initDb() {
  if (!(await fs.pathExists(DB_FILE))) {
    const initialData = {
      clients: [
        {
          id: "sd-1",
          name: "Skill Dunia",
          shortCode: "SD",
          description: "Ed-tech platform for skill development.",
          active: true,
          clientSheetUrl: "",
          clientSheetOwnerEmail: "samuel@skilldunia.co.in",
          offerLetterDocTemplateId: "",
          offerLetterDocUrl: "",
          appsScriptCode: "",
          appsScriptWebAppUrl: "",
          appsScriptSetupStatus: "not_configured",
          editorAccessEmail: "automation-service@hr-agency.iam.gserviceaccount.com",
          notes: "",
          ccEmail: "samuel@skilldunia.co.in",
          officeLocationLink: "https://maps.google.com/?q=Skill+Dunia+Office",
          confirmationFormLink: "https://forms.gle/skilldunia-joining",
          whatsAppNumber: "+91 9876543210",
          companyTeamName: "Skill Dunia team",
          companyLogoUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop&auto=format"
        }
      ],
      campaigns: [],
      recipients: [],
      sendLogs: []
    };
    await fs.writeJson(DB_FILE, initialData, { spaces: 2 });
  }
  if (!(await fs.pathExists(CONFIG_FILE))) {
    await fs.writeJson(CONFIG_FILE, { backendWebAppUrl: "" }, { spaces: 2 });
  }
}

async function startServer() {
  await initDb();
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Helper to fetch from Google Sheet if URL exists
  const getClients = async () => {
    const config = await fs.readJson(CONFIG_FILE);
    if (config.backendWebAppUrl) {
      try {
        const res = await axios.get(`${config.backendWebAppUrl}?action=getClients`);
        return res.data;
      } catch (err) {
        console.error("Failed to fetch from Google Sheet, falling back to db.json", err);
      }
    }
    const data = await fs.readJson(DB_FILE);
    return data.clients;
  };

  const saveClient = async (client: any) => {
    const config = await fs.readJson(CONFIG_FILE);
    if (config.backendWebAppUrl) {
      try {
        await axios.post(config.backendWebAppUrl, { action: "saveClient", client });
        return;
      } catch (err) {
        console.error("Failed to save to Google Sheet, falling back to db.json", err);
      }
    }
    const data = await fs.readJson(DB_FILE);
    const index = data.clients.findIndex((c: any) => c.id === client.id);
    if (index !== -1) {
      data.clients[index] = client;
    } else {
      data.clients.push(client);
    }
    await fs.writeJson(DB_FILE, data, { spaces: 2 });
  };

  // API Routes
  app.get("/api/config", async (req, res) => {
    const config = await fs.readJson(CONFIG_FILE);
    res.json(config);
  });

  app.post("/api/config", async (req, res) => {
    const config = await fs.readJson(CONFIG_FILE);
    const newConfig = { ...config, ...req.body };
    await fs.writeJson(CONFIG_FILE, newConfig, { spaces: 2 });
    res.json(newConfig);
  });

  app.get("/api/clients", async (req, res) => {
    const clients = await getClients();
    res.json(clients);
  });

  app.post("/api/clients", async (req, res) => {
    const newClient = { ...req.body, id: Date.now().toString() };
    await saveClient(newClient);
    res.json(newClient);
  });

  app.put("/api/clients/:id", async (req, res) => {
    const client = { ...req.body, id: req.params.id };
    await saveClient(client);
    res.json(client);
  });

  app.get("/api/sendLogs/:campaignId", async (req, res) => {
    const data = await fs.readJson(DB_FILE);
    const logs = (data.sendLogs || []).filter((l: any) => l.campaignId === req.params.campaignId);
    res.json(logs);
  });

  app.post("/api/sendLogs", async (req, res) => {
    const data = await fs.readJson(DB_FILE);
    if (!data.sendLogs) data.sendLogs = [];
    const newLog = { ...req.body, id: Date.now().toString() };
    data.sendLogs.push(newLog);
    await fs.writeJson(DB_FILE, data, { spaces: 2 });
    res.json(newLog);
  });

  app.delete("/api/sendLogs/:campaignId", async (req, res) => {
    const data = await fs.readJson(DB_FILE);
    data.sendLogs = (data.sendLogs || []).filter((l: any) => l.campaignId !== req.params.campaignId);
    await fs.writeJson(DB_FILE, data, { spaces: 2 });
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
