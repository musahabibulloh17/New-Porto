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
const PORT = process.env.SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Static files for uploaded images
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `project-${Date.now()}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "portfolio_db",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// Test DB connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL connected successfully");
    client.release();
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
    console.log("💡 Pastikan PostgreSQL sudah running & jalankan schema.sql terlebih dahulu");
  }
}

// Helper: format DB row to frontend ProjectData shape
// pg auto-parses JSONB columns, so no need for JSON.parse
function formatProject(row) {
  return {
    id: String(row.id),
    name: row.name,
    desc: row.description_short,
    color: row.color,
    mockup: row.mockup,
    numberColor: row.number_color,
    image: row.image_url || undefined,
    description: row.description_long || undefined,
    features: row.features ?? [],
    developedBy: row.developed_by ?? [],
    links: row.links ?? [],
  };
}

/* ================================================================== */
/*  API Routes                                                        */
/* ================================================================== */

// GET /api/projects — list all
app.get("/api/projects", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM projects ORDER BY sort_order ASC, id ASC");
    res.json(rows.map(formatProject));
  } catch (err) {
    console.error("GET /api/projects error:", err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// GET /api/projects/:id — single
app.get("/api/projects/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM projects WHERE id = $1", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(formatProject(rows[0]));
  } catch (err) {
    console.error("GET /api/projects/:id error:", err);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// POST /api/projects — create
app.post("/api/projects", async (req, res) => {
  try {
    const { name, desc, color, mockup, numberColor, image, description, features, developedBy, links } = req.body;

    console.log("POST /api/projects — links received:", JSON.stringify(links));

    // Get next sort order
    const { rows: maxRows } = await pool.query("SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM projects");
    const sortOrder = maxRows[0].next_order;

    const { rows } = await pool.query(
      `INSERT INTO projects (name, description_short, color, mockup, number_color, image_url, description_long, features, developed_by, links, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        name,
        desc || "",
        color || "#333333",
        mockup || "phones",
        numberColor || "rgba(0,0,0,0.25)",
        image || null,
        description || null,
        JSON.stringify(features || []),
        JSON.stringify(developedBy || []),
        JSON.stringify(links || []),
        sortOrder,
      ]
    );

    res.status(201).json(formatProject(rows[0]));
  } catch (err) {
    console.error("POST /api/projects error:", err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// PUT /api/projects/:id — update
app.put("/api/projects/:id", async (req, res) => {
  try {
    const { name, desc, color, mockup, numberColor, image, description, features, developedBy, links } = req.body;

    console.log(`PUT /api/projects/${req.params.id} — links received:`, JSON.stringify(links));

    const { rows } = await pool.query(
      `UPDATE projects SET
        name = $1, description_short = $2, color = $3, mockup = $4, number_color = $5,
        image_url = $6, description_long = $7, features = $8, developed_by = $9, links = $10,
        updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        name,
        desc || "",
        color || "#333333",
        mockup || "phones",
        numberColor || "rgba(0,0,0,0.25)",
        image || null,
        description || null,
        JSON.stringify(features || []),
        JSON.stringify(developedBy || []),
        JSON.stringify(links || []),
        req.params.id,
      ]
    );

    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(formatProject(rows[0]));
  } catch (err) {
    console.error("PUT /api/projects/:id error:", err);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// DELETE /api/projects/:id
app.delete("/api/projects/:id", async (req, res) => {
  try {
    // Get image URL before deleting to clean up file
    const { rows } = await pool.query("SELECT image_url FROM projects WHERE id = $1", [req.params.id]);
    if (rows.length > 0 && rows[0].image_url) {
      const imgPath = rows[0].image_url;
      // Only delete local files
      if (imgPath.startsWith("/uploads/")) {
        const fullPath = path.join(__dirname, imgPath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
    }

    const result = await pool.query("DELETE FROM projects WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/projects/:id error:", err);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// POST /api/upload — image upload
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await testConnection();
});
