import "dotenv/config";
import express from "express";
import cors from "cors";
import pg from "pg";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 3001;

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

const distDir = path.join(__dirname, "..", "dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    cb(null, "project-" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

let dbReady = false;

const SEED_PROJECTS = [
  { id: "1", name: "TRAVLO", desc: "Accessible Travel for people with special needs", color: "#a8d5a2", mockup: "phones", numberColor: "rgba(76, 175, 80, 0.25)", description: "Travlo is a mobile application designed to make traveling more accessible for people with special needs.", features: ["Accessibility-focused travel recommendations", "Real-time navigation assistance", "Community reviews & ratings", "Multi-language support"], developedBy: ["Musa Habibulloh (UI/UX Design)"], links: [] },
  { id: "2", name: "SANORA", desc: "Website Design for a premium safety wear brand", color: "#5a8f5a", mockup: "browser", numberColor: "rgba(46, 125, 50, 0.25)", description: "A complete website redesign for Sanora Wear, a premium safety wear brand.", features: ["Modern & clean UI design", "Product catalog with filtering", "Responsive across all devices"], developedBy: ["Musa Habibulloh (UI/UX Design)"], links: [] },
  { id: "3", name: "FACTORY FLOW", desc: "Factory Management System", color: "#e74c3c", mockup: "laptop", numberColor: "rgba(244, 67, 54, 0.25)", description: "Factory Flow is a comprehensive factory management system.", features: ["Production workflow management", "Real-time inventory tracking", "Worker scheduling & management", "Analytics dashboard"], developedBy: ["Musa Habibulloh (UI/UX Design)"], links: [] },
  { id: "4", name: "AGODA", desc: "Re-design for the AGODA Website", color: "#c0392b", mockup: "phone", numberColor: "rgba(211, 47, 47, 0.25)", description: "A UI/UX redesign concept for the Agoda booking platform.", features: ["Simplified booking flow", "Improved search & filter UX", "Modern visual redesign"], developedBy: ["Musa Habibulloh (UI/UX Design)"], links: [] },
  { id: "5", name: "BALANCIFY", desc: "Work-life balance, simplified and smart", color: "#5b9bd5", mockup: "phones", numberColor: "rgba(21, 101, 192, 0.25)", description: "Balancify is a smart app that helps users maintain a healthy work-life balance.", features: ["Smart task scheduling", "Wellness & mood tracking", "Mindful break reminders", "Weekly balance reports"], developedBy: ["Musa Habibulloh (UI/UX Design)"], links: [] },
];

let memoryProjects = JSON.parse(JSON.stringify(SEED_PROJECTS));
let memoryNextId = 6;

let pool;
if (process.env.DATABASE_URL) {
  const cs = process.env.DATABASE_URL.replace(/[?&]sslmode=[^&]*/g, "");
  pool = new Pool({ connectionString: cs, ssl: { rejectUnauthorized: false } });
} else {
  pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "portfolio_db",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  });
}

async function initDatabase() {
  try {
    const client = await pool.connect();
    console.log("PostgreSQL connected");
    await client.query(`CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL,
      description_short VARCHAR(500) NOT NULL DEFAULT '',
      color VARCHAR(20) NOT NULL DEFAULT '#333333',
      mockup VARCHAR(20) NOT NULL DEFAULT 'phones' CHECK (mockup IN ('phones','browser','laptop','phone')),
      number_color VARCHAR(50) NOT NULL DEFAULT 'rgba(0,0,0,0.25)',
      image_url VARCHAR(500) DEFAULT NULL, description_long TEXT DEFAULT NULL,
      features JSONB DEFAULT '[]', developed_by JSONB DEFAULT '[]',
      links JSONB DEFAULT '[]', sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log("Table ready");
    const { rows } = await client.query("SELECT COUNT(*) FROM projects");
    if (parseInt(rows[0].count) === 0) {
      for (const p of SEED_PROJECTS) {
        await client.query(
          `INSERT INTO projects (name,description_short,color,mockup,number_color,description_long,features,developed_by,links,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [p.name, p.desc, p.color, p.mockup, p.numberColor, p.description, JSON.stringify(p.features), JSON.stringify(p.developedBy), JSON.stringify(p.links), parseInt(p.id)]
        );
      }
      console.log("Seeded projects");
    }
    client.release();
    dbReady = true;
    console.log("Mode: DATABASE");
  } catch (err) {
    console.warn("DB init failed:", err.message);
    console.log("Mode: IN-MEMORY (portfolio still works)");
    dbReady = false;
  }
}

function fmt(row) {
  return {
    id: String(row.id), name: row.name, desc: row.description_short,
    color: row.color, mockup: row.mockup, numberColor: row.number_color,
    image: row.image_url || undefined, description: row.description_long || undefined,
    features: row.features || [], developedBy: row.developed_by || [], links: row.links || [],
  };
}

app.get("/api/projects", async (_req, res) => {
  try {
    if (dbReady) {
      const { rows } = await pool.query("SELECT * FROM projects ORDER BY sort_order ASC, id ASC");
      return res.json(rows.map(fmt));
    }
    res.json(memoryProjects);
  } catch (err) {
    console.error("GET /api/projects:", err.message);
    res.json(memoryProjects);
  }
});

app.get("/api/projects/:id", async (req, res) => {
  try {
    if (dbReady) {
      const { rows } = await pool.query("SELECT * FROM projects WHERE id=$1", [req.params.id]);
      if (!rows.length) return res.status(404).json({ error: "Not found" });
      return res.json(fmt(rows[0]));
    }
    const p = memoryProjects.find((x) => x.id === req.params.id);
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(p);
  } catch (err) {
    console.error("GET /api/projects/:id:", err.message);
    res.status(500).json({ error: "Failed" });
  }
});

app.post("/api/projects", async (req, res) => {
  try {
    const { name, desc, color, mockup, numberColor, image, description, features, developedBy, links } = req.body;
    if (dbReady) {
      const { rows: mx } = await pool.query("SELECT COALESCE(MAX(sort_order),0)+1 AS n FROM projects");
      const { rows } = await pool.query(
        `INSERT INTO projects (name,description_short,color,mockup,number_color,image_url,description_long,features,developed_by,links,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [name, desc||"", color||"#333333", mockup||"phones", numberColor||"rgba(0,0,0,0.25)", image||null, description||null, JSON.stringify(features||[]), JSON.stringify(developedBy||[]), JSON.stringify(links||[]), mx[0].n]
      );
      return res.status(201).json(fmt(rows[0]));
    }
    const np = { id: String(memoryNextId++), name, desc: desc||"", color: color||"#333333", mockup: mockup||"phones", numberColor: numberColor||"rgba(0,0,0,0.25)", image, description, features: features||[], developedBy: developedBy||[], links: links||[] };
    memoryProjects.push(np);
    res.status(201).json(np);
  } catch (err) {
    console.error("POST /api/projects:", err.message);
    res.status(500).json({ error: "Failed" });
  }
});

app.put("/api/projects/:id", async (req, res) => {
  try {
    const { name, desc, color, mockup, numberColor, image, description, features, developedBy, links } = req.body;
    if (dbReady) {
      const { rows } = await pool.query(
        `UPDATE projects SET name=$1,description_short=$2,color=$3,mockup=$4,number_color=$5,image_url=$6,description_long=$7,features=$8,developed_by=$9,links=$10,updated_at=NOW() WHERE id=$11 RETURNING *`,
        [name, desc||"", color||"#333333", mockup||"phones", numberColor||"rgba(0,0,0,0.25)", image||null, description||null, JSON.stringify(features||[]), JSON.stringify(developedBy||[]), JSON.stringify(links||[]), req.params.id]
      );
      if (!rows.length) return res.status(404).json({ error: "Not found" });
      return res.json(fmt(rows[0]));
    }
    const idx = memoryProjects.findIndex((x) => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    Object.assign(memoryProjects[idx], { name, desc, color, mockup, numberColor, image, description, features, developedBy, links });
    res.json(memoryProjects[idx]);
  } catch (err) {
    console.error("PUT /api/projects/:id:", err.message);
    res.status(500).json({ error: "Failed" });
  }
});

app.delete("/api/projects/:id", async (req, res) => {
  try {
    if (dbReady) {
      const { rows } = await pool.query("SELECT image_url FROM projects WHERE id=$1", [req.params.id]);
      if (rows.length && rows[0].image_url && rows[0].image_url.startsWith("/uploads/")) {
        const fp = path.join(__dirname, rows[0].image_url);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      }
      const r = await pool.query("DELETE FROM projects WHERE id=$1", [req.params.id]);
      if (r.rowCount === 0) return res.status(404).json({ error: "Not found" });
      return res.json({ success: true });
    }
    const idx = memoryProjects.findIndex((x) => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    memoryProjects.splice(idx, 1);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/projects/:id:", err.message);
    res.status(500).json({ error: "Failed" });
  }
});

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  res.json({ url: "/uploads/" + req.file.filename });
});

if (fs.existsSync(path.join(distDir, "index.html"))) {
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(PORT, async () => {
  console.log("Server running on http://localhost:" + PORT);
  await initDatabase();
});
