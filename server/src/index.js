require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const todosRouter = require("./routes/todos");
const adminRouter = require("./routes/admin");

const app = express();

// ── CORS ─────────────────────────────────────────────────────────
// In production reads ALLOWED_ORIGINS env var (comma-separated)
// e.g. "https://cmx.ciphermutex.com,https://admin.ciphermutex.com"
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:5174"];

app.use(cors({
  origin: (origin, cb) => {
    // Allow non-browser requests (curl, Postman) and allowed origins
    if (!origin || allowedOrigins.some((o) => {
      // Support wildcard subdomain e.g. "https://*.ciphermutex.com"
      if (o.startsWith("https://*.")) {
        const base = o.replace("https://*.", "");
        return origin.endsWith("." + base) || origin === "https://" + base;
      }
      return o === origin;
    })) {
      return cb(null, true);
    }
    cb(new Error("CORS: origin not allowed — " + origin));
  },
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "X-Subdomain", "X-Admin-Token"],
}));

app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────
app.use("/todos", todosRouter);
app.use("/admin", adminRouter);

// Health check — used by AWS ALB / EC2 monitoring
app.get("/health", (_req, res) => res.json({ ok: true, env: process.env.NODE_ENV }));

// ── Global error handler ─────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`API running on :${PORT} [${process.env.NODE_ENV}]`)
);
