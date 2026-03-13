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

// Middleware
app.use(cors());
app.use(express.json());

// Static files for uploaded images
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

// Health check endpoint (required by DigitalOcean App Platform)
app.get("/", (_req, res) => res.status(200).json({ status: "ok" }));
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

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
// Supports DATABASE_URL (DigitalOcean App Platform) or individual env vars (local)
let pool;
if (process.env.DATABASE_URL) {
  // Strip sslmode from connection string so we can control SSL manually
  const connStr = process.env.DATABASE_URL.replace(/[?&]sslmode=[^&]*/g, "");
  pool = new Pool({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
  });
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

// Init DB: create table + seed default data if empty
async function initDatabase() {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL connected successfully");

    // Detect available schema — DigitalOcean dev DBs provide a custom schema
    // (e.g. "dev-db-028904") and block writes to "public".
    // Priority: DB_SCHEMA env var  →  public (if writable)  →  first non-system schema we own
    let schema = process.env.DB_SCHEMA || "public";

    if (!process.env.DB_SCHEMA) {
      // Test if public is writable
      let publicOk = false;
      try {
        await client.query(`SAVEPOINT schema_test`);
        await client.query(`SET search_path TO public`);
        await client.query(`CREATE TABLE IF NOT EXISTS _schema_test (_t int)`);
        await client.query(`DROP TABLE IF EXISTS _schema_test`);
        await client.query(`RELEASE SAVEPOINT schema_test`);
        publicOk = true;
      } catch (_) {
        try { await client.query(`ROLLBACK TO SAVEPOINT schema_test`); } catch (__) {}
      }

      if (!publicOk) {
        // Find a non-system schema we have CREATE privilege on
        const { rows: schemas } = await client.query(`
          SELECT schema_name
          FROM information_schema.schemata
          WHERE schema_name NOT IN ('public', 'information_schema')
            AND schema_name NOT LIKE 'pg_%'
          ORDER BY schema_name
        `);
        console.log("ℹ️  Available schemas:", schemas.map(r => r.schema_name).join(", "));

        if (schemas.length > 0) {
          schema = schemas[0].schema_name;
        } else {
          // Last resort: try creating one named after current_user
          const { rows: [{ current_user: dbUser }] } = await client.query(`SELECT current_user`);
          schema = dbUser;
          await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
        }
      }
    }

    // Lock in the chosen schema
    await client.query(`SET search_path TO "${schema}"`);
    console.log(`ℹ️  Using schema: "${schema}"`);

    // Ensure every new connection from the pool uses the same schema
    pool.on("connect", (conn) => {
      conn.query(`SET search_path TO "${schema}"`);
    });

    // Create table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        description_short VARCHAR(500) NOT NULL DEFAULT '',
        color       VARCHAR(20)  NOT NULL DEFAULT '#333333',
        mockup      VARCHAR(20)  NOT NULL DEFAULT 'phones'
                    CHECK (mockup IN ('phones', 'browser', 'laptop', 'phone')),
        number_color VARCHAR(50) NOT NULL DEFAULT 'rgba(0,0,0,0.25)',
        image_url   VARCHAR(500) DEFAULT NULL,
        description_long TEXT    DEFAULT NULL,
        features    JSONB        DEFAULT '[]',
        developed_by JSONB       DEFAULT '[]',
        links       JSONB        DEFAULT '[]',
        sort_order  INT          NOT NULL DEFAULT 0,
        created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table 'projects' ready");

    // Seed default data if table is empty
    const { rows } = await client.query("SELECT COUNT(*) FROM projects");
    if (parseInt(rows[0].count) === 0) {
      await client.query(`
        INSERT INTO projects (name, description_short, color, mockup, number_color, description_long, features, developed_by, links, sort_order)
        VALUES
        ('TRAVLO', 'Accessible Travel for people with special needs', '#a8d5a2', 'phones', 'rgba(76, 175, 80, 0.25)', 'Travlo is a mobile application designed to make traveling more accessible for people with special needs. The app provides tailored recommendations, accessibility info, and real-time assistance.', '["Accessibility-focused travel recommendations", "Real-time navigation assistance", "Community reviews & ratings", "Multi-language support"]', '["Musa Habibulloh (UI/UX Design)"]', '[]', 1),
        ('SANORA', 'Website Design for a premium safety wear brand', '#5a8f5a', 'browser', 'rgba(46, 125, 50, 0.25)', 'A complete website redesign for Sanora Wear, a premium safety wear brand. The design focuses on trust, professionalism, and easy product discovery.', '["Modern & clean UI design", "Product catalog with filtering", "Responsive across all devices"]', '["Musa Habibulloh (UI/UX Design)"]', '[]', 2),
        ('FACTORY FLOW', 'Factory Management System', '#e74c3c', 'laptop', 'rgba(244, 67, 54, 0.25)', 'Factory Flow is a comprehensive factory management system designed to streamline production workflows, inventory tracking, and worker management.', '["Production workflow management", "Real-time inventory tracking", "Worker scheduling & management", "Analytics dashboard"]', '["Musa Habibulloh (UI/UX Design)"]', '[]', 3),
        ('AGODA', 'Re-design for the AGODA Website', '#c0392b', 'phone', 'rgba(211, 47, 47, 0.25)', 'A UI/UX redesign concept for the Agoda booking platform, focusing on improved user experience and a more modern visual language.', '["Simplified booking flow", "Improved search & filter UX", "Modern visual redesign"]', '["Musa Habibulloh (UI/UX Design)"]', '[]', 4),
        ('BALANCIFY', 'Work-life balance, simplified and smart', '#5b9bd5', 'phones', 'rgba(21, 101, 192, 0.25)', 'Balancify is a smart app that helps users maintain a healthy work-life balance through task scheduling, wellness tracking, and mindful reminders.', '["Smart task scheduling", "Wellness & mood tracking", "Mindful break reminders", "Weekly balance reports"]', '["Musa Habibulloh (UI/UX Design)"]', '[]', 5)
      `);
      console.log("✅ Default projects seeded");
    }

    client.release();
  } catch (err) {
    console.error("❌ Database init failed:", err.message);
    console.error("⚠️  Server will continue running but database may not work");
    // Don't exit — let server stay up so we can see logs
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
  await initDatabase();
});
